import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Send, Loader2, MapPin, ChevronRight, Lock, Check, Play, ChevronDown, Plus, X, Volume2, VolumeX } from 'lucide-react'
import { useStore } from '../store/useStore'
import { getDestination } from '../data/travel/destinations'
import { getTravelCompanion } from '../data/travel/companions'
import { generateDayItinerary, streamTravelScene, streamTravelChatReply, generateTravelOpeningMessage } from '../lib/claude/travel'
import { parseAffinityDelta } from '../lib/claude/affinity'
import { parsePlaceTags, parseFoodTags, fetchPlaceImage, fetchFoodImage } from '../lib/imageSearch'
import { extractMemories } from '../lib/claude/memory'
import { generateSceneImage as generateImage, generateCharacterPortrait } from '../lib/togetherAi'
import { buildReactionImagePrompt } from '../data/chatActions'
import { DayTransition } from '../components/travel/DayTransition'
import { TripComplete } from '../components/travel/TripComplete'
import type { ChatMessage, TripScene } from '../store/useStore'
import { lofiPlayer } from '../lib/lofiPlayer'

type ViewMode = 'chat' | 'scene' | 'transition' | 'day-start' | 'day-end' | 'complete'

function stripMetaTags(text: string): string {
  return text
    .replace(/\[PLACE:([^\]]*)\]/g, '$1')
    .replace(/\[FOOD:([^\]]*)\]/g, '$1')
    .replace(/\n?\[AFFINITY[\s\S]*$/, '')
    .replace(/\n?\[SUGGESTIONS[\s\S]*$/, '')
    .trimEnd()
}

type TextSegment = { type: 'text' | 'action'; text: string }

function parseSegments(content: string): TextSegment[] {
  const lines = content.split('\n')
  const all: TextSegment[] = []
  let textLines: string[] = []

  const flushText = () => {
    const text = textLines.join('\n').trim()
    if (text) all.push({ type: 'text', text })
    textLines = []
  }

  for (const line of lines) {
    const t = line.trim()
    if (t.startsWith('*') && t.endsWith('*') && t.length > 2) {
      flushText()
      all.push({ type: 'action', text: t.slice(1, -1) })
    } else {
      textLines.push(line)
    }
  }
  flushText()

  const textSegments = all.filter((s) => s.type === 'text')
  if (textSegments.length <= 2) return all

  const capped: TextSegment[] = []
  let textCount = 0
  for (const seg of all) {
    if (seg.type === 'action') {
      if (textCount < 2) capped.push(seg)
    } else {
      textCount++
      if (textCount <= 1) {
        capped.push(seg)
      } else {
        if (textCount === 2) capped.push({ type: 'text', text: seg.text })
        else {
          const last = capped[capped.length - 1]
          last.text += '\n\n' + seg.text
        }
      }
    }
  }
  return capped
}

function ActionBeat({ text }: { text: string }) {
  return (
    <p
      className="text-[12px] italic leading-relaxed rounded-lg px-3 py-1.5"
      style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.04)' }}
    >
      {text}
    </p>
  )
}

export function TravelReaderPage() {
  const navigate = useNavigate()
  const store = useStore()
  const {
    activeTripId, travelTrips, activeCharacterId, characters,
    addTravelPlanningMessage, addTravelDayChatMessage, updateTripItinerary,
    setTripScene, setTripSceneImage, advanceTravelScene, advanceTravelDay,
    setTripPhase, updateTravelAffinity, addCompanionMemory, addTravelEngagementTime,
    completeTrip, resetTrip, setIsStreaming, isStreaming, updateCompanionSliders,
  } = store

  const trip = activeTripId ? travelTrips[activeTripId] : null
  const destination = trip ? getDestination(trip.destinationId) : null
  const companion = trip ? getTravelCompanion(trip.companionId) : null
  const companionName = trip?.companionRemix?.name ?? companion?.character.name ?? ''
  const companionPortrait = trip?.companionRemix?.imageUrl ?? companion?.character.staticPortrait
  const activeChar = characters.find((c) => c.id === activeCharacterId)

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (trip?.phase === 'complete') return 'complete'
    return 'chat'
  })
  const [input, setInput] = useState('')
  const [streamedText, setStreamedText] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [sceneProse, setSceneProse] = useState('')
  const [isGeneratingItinerary, setIsGeneratingItinerary] = useState(false)
  const [showCompanionSettings, setShowCompanionSettings] = useState(false)
  const [imageLoadingSceneId, setImageLoadingSceneId] = useState<string | null>(null)
  const [isGeneratingChatImage, setIsGeneratingChatImage] = useState(false)
  const [localSliders, setLocalSliders] = useState<{ chattiness: number; planningStyle: number; vibe: number } | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [showActions, setShowActions] = useState(false)
  const [lofiPlaying, setLofiPlaying] = useState(lofiPlayer.isPlaying)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const engagementRef = useRef<number>(Date.now())

  const [showLofiLabel, setShowLofiLabel] = useState(true)

  // Stop lofi on unmount
  useEffect(() => {
    return () => { lofiPlayer.stop() }
  }, [])

  // Hide lofi label after 5 seconds
  useEffect(() => {
    const t = setTimeout(() => setShowLofiLabel(false), 5000)
    return () => clearTimeout(t)
  }, [])

  // Track engagement time
  useEffect(() => {
    engagementRef.current = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - engagementRef.current
      engagementRef.current = Date.now()
      addTravelEngagementTime(elapsed)
    }, 30000)
    return () => {
      const elapsed = Date.now() - engagementRef.current
      addTravelEngagementTime(elapsed)
      clearInterval(interval)
    }
  }, [addTravelEngagementTime])

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [trip?.planningChatHistory.length, trip?.dayChatHistories, streamedText])

  // Generate opening message when entering chat
  useEffect(() => {
    if (!trip || !companion || !destination) return
    const isPlanning = trip.phase === 'planning'
    const messages = isPlanning ? trip.planningChatHistory : (trip.dayChatHistories[trip.currentDay] ?? [])
    if (messages.length > 0) return

    let cancelled = false
    ;(async () => {
      const currentScene = getCurrentScene()
      const chatType = isPlanning ? 'planning' as const : getChatType()
      const result = await generateTravelOpeningMessage({
        companionId: trip.companionId,
        companionSliders: trip.companionSliders,
        companionRemix: trip.companionRemix,
        destinationId: trip.destinationId,
        chatType,
        sceneContext: currentScene ? `${currentScene.location} — ${currentScene.activity}` : undefined,
        tripContext: buildTripContext(),
        bio: activeChar?.bio ?? null,
      })
      if (cancelled) return
      const msg: ChatMessage = {
        role: 'character',
        content: result.content,
        characterId: trip.companionId,
        timestamp: Date.now(),
      }
      if (isPlanning) {
        addTravelPlanningMessage(msg)
      } else {
        addTravelDayChatMessage(trip.currentDay, msg)
      }
      if (result.suggestions) setSuggestions(result.suggestions)
    })()
    return () => { cancelled = true }
  }, [trip?.phase, trip?.currentDay, trip?.currentSceneIndex])

  function getCurrentScene(): TripScene | null {
    if (!trip) return null
    const day = trip.itinerary.days.find((d) => d.dayNumber === trip.currentDay)
    if (!day) return null
    return day.scenes[trip.currentSceneIndex] ?? null
  }

  function getChatType(): 'reaction' | 'freeform' | 'recap' | 'morning' {
    if (!trip) return 'freeform'
    if (trip.phase === 'recap') return 'recap'
    const scene = getCurrentScene()
    if (!scene) return 'freeform'
    if (scene.prose) return 'reaction'
    if (scene.timeOfDay === 'morning' && trip.currentSceneIndex === 0) return 'morning'
    return 'freeform'
  }

  function buildTripContext(): string {
    if (!trip || !destination) return ''
    const parts: string[] = [`Day ${trip.currentDay} of ${destination.tripDays} in ${destination.city}`]
    const completedDays = trip.itinerary.days.filter((d) => d.completed)
    if (completedDays.length > 0) {
      parts.push(`Visited: ${completedDays.map((d) => d.theme).join(', ')}`)
    }
    return parts.join('. ')
  }

  const handleSend = useCallback(async (text?: string) => {
    const messageText = text ?? input.trim()
    if (!messageText || !trip || !companion || !destination || isStreaming) return
    setInput('')
    setSuggestions([])

    const isPlanning = trip.phase === 'planning'
    const userMsg: ChatMessage = { role: 'user', content: messageText, characterId: 'player', timestamp: Date.now() }

    if (isPlanning) {
      addTravelPlanningMessage(userMsg)
    } else {
      addTravelDayChatMessage(trip.currentDay, userMsg)
    }

    setIsStreaming(true)
    setStreamedText('')
    abortRef.current = new AbortController()

    try {
      const messages = isPlanning
        ? [...trip.planningChatHistory, userMsg]
        : [...(trip.dayChatHistories[trip.currentDay] ?? []), userMsg]

      const stream = streamTravelChatReply({
        companionId: trip.companionId,
        companionSliders: trip.companionSliders,
        companionRemix: trip.companionRemix,
        destinationId: trip.destinationId,
        messages,
        chatType: isPlanning ? 'planning' : getChatType(),
        sceneContext: getCurrentScene() ? `${getCurrentScene()!.location} — ${getCurrentScene()!.activity}` : undefined,
        tripContext: buildTripContext(),
        companionMemories: trip.companionMemories,
        travelAffinityScore: trip.travelAffinityScore,
        bio: activeChar?.bio ?? null,
        signal: abortRef.current.signal,
      })

      let full = ''
      for await (const chunk of stream) {
        full += chunk
        setStreamedText(stripMetaTags(full))
      }

      const { cleanText, places } = parsePlaceTags(full)
      const { cleanText: cleanText2, foods } = parseFoodTags(cleanText)
      const parsed = parseAffinityDelta(cleanText2)
      const replyMsg: ChatMessage = {
        role: 'character',
        content: parsed.content,
        characterId: trip.companionId,
        timestamp: Date.now(),
      }

      if (isPlanning) {
        addTravelPlanningMessage(replyMsg)
      } else {
        addTravelDayChatMessage(trip.currentDay, replyMsg)
      }

      updateTravelAffinity(parsed.delta)
      if (parsed.suggestions) setSuggestions(parsed.suggestions)

      // Fetch place + food images in parallel, then add in consistent order (place first, then foods)
      if ((places.length > 0 || foods.length > 0) && destination) {
        const addImageMsg = isPlanning ? addTravelPlanningMessage : (msg: ChatMessage) => addTravelDayChatMessage(trip.currentDay, msg)
        ;(async () => {
          const [placeResult, ...foodResults] = await Promise.all([
            places.length > 0 ? fetchPlaceImage(places[0], destination.city).catch(() => null) : Promise.resolve(null),
            ...foods.map((food) => fetchFoodImage(food, destination.city).catch(() => null)),
          ])

          if (placeResult) {
            addImageMsg({ role: 'character', content: `📍 ${places[0]}`, characterId: trip.companionId, timestamp: Date.now(), imageUrl: placeResult })
          }
          foodResults.forEach((url, i) => {
            if (url) addImageMsg({ role: 'character', content: `🍽️ ${foods[i]}`, characterId: trip.companionId, timestamp: Date.now(), imageUrl: url })
          })
        })()
      }

      // Extract memories from conversation every 4 messages
      const allMessages = isPlanning
        ? [...trip.planningChatHistory, userMsg, replyMsg]
        : [...(trip.dayChatHistories[trip.currentDay] ?? []), userMsg, replyMsg]
      if (allMessages.length % 4 === 0 && allMessages.length > 0) {
        extractMemories({ characterId: trip.companionId, messages: allMessages.slice(-8) })
          .then((memories) => memories.forEach((m) => addCompanionMemory(m)))
          .catch(() => {})
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') console.error('Travel chat error:', e)
    } finally {
      setIsStreaming(false)
      setStreamedText('')
    }
  }, [input, trip, companion, destination, isStreaming, activeChar])

  async function handleShowMe() {
    if (!trip || !companion || !destination || isGeneratingChatImage || isStreaming) return

    const isPlanning = trip.phase === 'planning'
    const msgs = isPlanning ? trip.planningChatHistory : (trip.dayChatHistories[trip.currentDay] ?? [])
    const lastCompanionMsg = [...msgs].reverse().find((m) => m.role === 'character')
    if (!lastCompanionMsg) return

    setIsGeneratingChatImage(true)

    const currentScene = getCurrentScene()
    const locationContext = currentScene ? `${currentScene.location}, ${destination.city}` : destination.city
    const imagePrompt = `anime style, cinematic scene: ${lastCompanionMsg.content.slice(0, 200)}. Setting: ${locationContext}. Atmospheric lighting, detailed background, travel photography mood.`

    try {
      const url = await generateTravelImage(imagePrompt, activeChar?.selfieUrl)
      if (url) {
        const imageMsg: ChatMessage = {
          role: 'character',
          content: `📸 Here's what I'm talking about...`,
          characterId: trip.companionId,
          timestamp: Date.now(),
          imageUrl: url,
        }
        if (isPlanning) {
          addTravelPlanningMessage(imageMsg)
        } else {
          addTravelDayChatMessage(trip.currentDay, imageMsg)
        }
      }
    } catch (e) {
      console.error('Show me image error:', e)
    } finally {
      setIsGeneratingChatImage(false)
    }
  }

  async function handleBuyGift() {
    if (!trip || !companion || !destination || isGeneratingChatImage || isStreaming) return

    setIsGeneratingChatImage(true)
    const isPlanning = trip.phase === 'planning'
    const addMsg = isPlanning ? addTravelPlanningMessage : (msg: ChatMessage) => addTravelDayChatMessage(trip.currentDay, msg)

    addMsg({ role: 'user', content: '🎁 Bought a gift', characterId: 'player', timestamp: Date.now() })

    try {
      const portraitPrompt = buildReactionImagePrompt(
        companion.character.portraitPrompt,
        'mystery-box',
        'gift',
      )
      const [imageUrl, replyStream] = await Promise.all([
        generateCharacterPortrait(portraitPrompt),
        streamTravelChatReply({
          companionId: trip.companionId,
          companionSliders: trip.companionSliders,
          companionRemix: trip.companionRemix,
          destinationId: trip.destinationId,
          messages: [...(isPlanning ? trip.planningChatHistory : (trip.dayChatHistories[trip.currentDay] ?? [])),
            { role: 'user' as const, content: 'I just bought you a gift while we were walking around. React with surprise and genuine happiness. Be flattered and a little flustered.', characterId: 'player', timestamp: Date.now() }],
          chatType: 'freeform',
          tripContext: buildTripContext(),
          companionMemories: trip.companionMemories,
          travelAffinityScore: trip.travelAffinityScore,
          bio: activeChar?.bio ?? null,
        }),
      ])

      setIsStreaming(true)
      let full = ''
      for await (const chunk of replyStream) {
        full += chunk
        setStreamedText(stripMetaTags(full))
      }
      setIsStreaming(false)
      setStreamedText('')

      const { cleanText: giftClean, places: giftPlaces } = parsePlaceTags(full)
      const parsed = parseAffinityDelta(giftClean)
      if (imageUrl) {
        addMsg({ role: 'character', content: parsed.content, characterId: trip.companionId, timestamp: Date.now(), imageUrl })
      } else {
        addMsg({ role: 'character', content: parsed.content, characterId: trip.companionId, timestamp: Date.now() })
        setToastMessage('Image couldn\'t be generated')
        setTimeout(() => setToastMessage(null), 3000)
      }
      updateTravelAffinity(Math.max(parsed.delta, 3))
      if (parsed.suggestions) setSuggestions(parsed.suggestions)
      if (giftPlaces.length > 0 && destination) {
        fetchPlaceImage(giftPlaces[0], destination.city).then((placeUrl) => {
          if (placeUrl) addMsg({ role: 'character', content: `📍 ${giftPlaces[0]}`, characterId: trip.companionId, timestamp: Date.now(), imageUrl: placeUrl })
        }).catch(() => {})
      }
    } catch (e) {
      console.error('Buy gift error:', e)
      setIsStreaming(false)
      setStreamedText('')
    } finally {
      setIsGeneratingChatImage(false)
    }
  }

  async function handleHoldHands() {
    if (!trip || !companion || !destination || isGeneratingChatImage || isStreaming) return

    setIsGeneratingChatImage(true)
    const isPlanning = trip.phase === 'planning'
    const addMsg = isPlanning ? addTravelPlanningMessage : (msg: ChatMessage) => addTravelDayChatMessage(trip.currentDay, msg)

    addMsg({ role: 'user', content: `💕 Reaching out to hold ${companionName}'s hand...`, characterId: 'player', timestamp: Date.now() })

    const currentScene = getCurrentScene()
    const locationContext = currentScene ? `${currentScene.location}, ${destination.city}` : destination.city
    const companionDesc = companion.character.portraitPrompt
      .split(',').slice(0, 4).join(',')
      .replace(/^(anime style|dark|cyberpunk[^,]*|fantasy[^,]*|thriller[^,]*|sci-fi[^,]*)\s*(portrait|illustration|concept art)\s*(portrait\s*)?of\s*/i, '')
      .trim()
    const playerGender = activeChar?.gender === 'male' ? 'a young man' : 'a young woman'
    const scenePrompt = `anime style, two people walking together holding hands from behind on a beautiful street in ${locationContext}. ${playerGender} and ${companionDesc}. Close-up on their intertwined hands, warm golden hour lighting, soft bokeh, romantic K-drama moment, high quality anime art`

    try {
      const [imageUrl, replyStream] = await Promise.all([
        generateTravelImage(scenePrompt, activeChar?.selfieUrl),
        streamTravelChatReply({
          companionId: trip.companionId,
          companionSliders: trip.companionSliders,
          companionRemix: trip.companionRemix,
          destinationId: trip.destinationId,
          messages: [...(isPlanning ? trip.planningChatHistory : (trip.dayChatHistories[trip.currentDay] ?? [])),
            { role: 'user' as const, content: 'I just reached over and held your hand while we were walking. React with surprise, then warmth. Be flirtatious about it.', characterId: 'player', timestamp: Date.now() }],
          chatType: 'freeform',
          tripContext: buildTripContext(),
          companionMemories: trip.companionMemories,
          travelAffinityScore: trip.travelAffinityScore,
          bio: activeChar?.bio ?? null,
        }),
      ])

      setIsStreaming(true)
      let full = ''
      for await (const chunk of replyStream) {
        full += chunk
        setStreamedText(stripMetaTags(full))
      }
      setIsStreaming(false)
      setStreamedText('')

      const { cleanText: handsClean, places: handsPlaces } = parsePlaceTags(full)
      const parsed = parseAffinityDelta(handsClean)
      if (imageUrl) {
        addMsg({ role: 'character', content: parsed.content, characterId: trip.companionId, timestamp: Date.now(), imageUrl })
      } else {
        addMsg({ role: 'character', content: parsed.content, characterId: trip.companionId, timestamp: Date.now() })
        setToastMessage('Image couldn\'t be generated')
        setTimeout(() => setToastMessage(null), 3000)
      }
      updateTravelAffinity(Math.max(parsed.delta, 3))
      if (parsed.suggestions) setSuggestions(parsed.suggestions)
      if (handsPlaces.length > 0 && destination) {
        fetchPlaceImage(handsPlaces[0], destination.city).then((placeUrl) => {
          if (placeUrl) addMsg({ role: 'character', content: `📍 ${handsPlaces[0]}`, characterId: trip.companionId, timestamp: Date.now(), imageUrl: placeUrl })
        }).catch(() => {})
      }
    } catch (e) {
      console.error('Hold hands error:', e)
      setIsStreaming(false)
      setStreamedText('')
    } finally {
      setIsGeneratingChatImage(false)
    }
  }

  async function handleSelfie() {
    if (!trip || !companion || !destination || isGeneratingChatImage || isStreaming) return

    setIsGeneratingChatImage(true)
    const isPlanning = trip.phase === 'planning'
    const addMsg = isPlanning ? addTravelPlanningMessage : (msg: ChatMessage) => addTravelDayChatMessage(trip.currentDay, msg)

    addMsg({ role: 'user', content: `🤳 Taking a selfie with ${companionName}`, characterId: 'player', timestamp: Date.now() })

    const currentScene = getCurrentScene()
    const locationContext = currentScene ? `${currentScene.location}, ${destination.city}` : destination.city
    const companionDesc = companion.character.portraitPrompt.split(',').slice(0, 4).join(',')
    const playerGender = activeChar?.gender === 'male' ? 'a young man' : 'a young woman'

    const recentMessages = (isPlanning ? trip.planningChatHistory : (trip.dayChatHistories[trip.currentDay] ?? [])).slice(-4)
    const conversationHint = recentMessages.map((m) => m.content).join(' ').slice(0, 200)
    const activityHint = currentScene?.activity ?? conversationHint

    const scenePrompt = `anime style, selfie photo taken by ${playerGender}, close-up selfie with ${companionDesc}, both smiling at camera, peace signs, in ${locationContext}, ${activityHint}. Phone camera perspective, slight wide-angle distortion, warm natural lighting, candid happy energy, high quality anime art, social media selfie aesthetic`

    try {
      const [imageUrl, replyStream] = await Promise.all([
        generateTravelImage(scenePrompt, activeChar?.selfieUrl),
        streamTravelChatReply({
          companionId: trip.companionId,
          companionSliders: trip.companionSliders,
          companionRemix: trip.companionRemix,
          destinationId: trip.destinationId,
          messages: [...(isPlanning ? trip.planningChatHistory : (trip.dayChatHistories[trip.currentDay] ?? [])),
            { role: 'user' as const, content: `I just pulled you in for a selfie together here at ${locationContext}! React naturally — comment on the photo, whether you look good, suggest posting it, or joke about it.`, characterId: 'player', timestamp: Date.now() }],
          chatType: 'freeform',
          tripContext: buildTripContext(),
          companionMemories: trip.companionMemories,
          travelAffinityScore: trip.travelAffinityScore,
          bio: activeChar?.bio ?? null,
        }),
      ])

      setIsStreaming(true)
      let full = ''
      for await (const chunk of replyStream) {
        full += chunk
        setStreamedText(stripMetaTags(full))
      }
      setIsStreaming(false)
      setStreamedText('')

      const { cleanText: selfieClean, places: selfiePlaces } = parsePlaceTags(full)
      const parsed = parseAffinityDelta(selfieClean)
      if (imageUrl) {
        addMsg({ role: 'character', content: parsed.content, characterId: trip.companionId, timestamp: Date.now(), imageUrl })
      } else {
        addMsg({ role: 'character', content: parsed.content, characterId: trip.companionId, timestamp: Date.now() })
        setToastMessage('Image couldn\'t be generated')
        setTimeout(() => setToastMessage(null), 3000)
      }
      updateTravelAffinity(Math.max(parsed.delta, 2))
      if (parsed.suggestions) setSuggestions(parsed.suggestions)
      if (selfiePlaces.length > 0 && destination) {
        fetchPlaceImage(selfiePlaces[0], destination.city).then((placeUrl) => {
          if (placeUrl) addMsg({ role: 'character', content: `📍 ${selfiePlaces[0]}`, characterId: trip.companionId, timestamp: Date.now(), imageUrl: placeUrl })
        }).catch(() => {})
      }
    } catch (e) {
      console.error('Selfie error:', e)
      setIsStreaming(false)
      setStreamedText('')
    } finally {
      setIsGeneratingChatImage(false)
    }
  }

  async function handleStartExploring() {
    if (!trip || !destination || isGeneratingItinerary) return
    setIsGeneratingItinerary(true)
    setViewMode('transition')

    try {
      const day = await generateDayItinerary({
        destinationId: trip.destinationId,
        companionId: trip.companionId,
        companionSliders: trip.companionSliders,
        companionRemix: trip.companionRemix,
        planningHistory: trip.planningChatHistory,
        dayNumber: 1,
        previousDays: [],
        companionMemories: trip.companionMemories,
      })
      updateTripItinerary(day)
      setTripPhase('day')
      setViewMode('day-start')
    } catch (e) {
      console.error('Itinerary generation error:', e)
      setViewMode('chat')
    } finally {
      setIsGeneratingItinerary(false)
    }
  }

  async function handlePlayScene() {
    // Read from store directly to avoid stale closures when called from setTimeout
    const state = useStore.getState()
    const currentTrip = state.activeTripId ? state.travelTrips[state.activeTripId] : null
    if (!currentTrip || !destination || !companion) return
    const day = currentTrip.itinerary.days.find((d) => d.dayNumber === currentTrip.currentDay)
    const scene = day?.scenes[currentTrip.currentSceneIndex] ?? null
    if (!scene) return

    setViewMode('scene')
    setSceneProse('')
    setIsStreaming(true)
    abortRef.current = new AbortController()
    const sceneTimeout = setTimeout(() => abortRef.current?.abort(), 45000)

    const needsImage = !currentTrip.sceneImages[scene.id]
    if (needsImage) setImageLoadingSceneId(scene.id)
    let imageTriggered = false

    try {
      const stream = streamTravelScene({
        scene,
        destination,
        companionId: currentTrip.companionId,
        companionSliders: currentTrip.companionSliders,
        companionRemix: currentTrip.companionRemix,
        tripContext: buildTripContext(),
        recentChat: currentTrip.dayChatHistories[currentTrip.currentDay] ?? [],
        playerName: activeChar?.name ?? null,
        bio: activeChar?.bio ?? null,
        signal: abortRef.current.signal,
      })

      let full = ''
      for await (const chunk of stream) {
        full += chunk
        setSceneProse(full)

        if (needsImage && !imageTriggered && full.length > 200) {
          imageTriggered = true
          const proseSnippet = full.slice(0, 300).replace(/[.!?][^.!?]*$/, '.').trim()
          const imagePrompt = `anime style, cinematic wide shot, ${scene.timeOfDay} atmosphere in ${scene.location}, ${destination.city}. ${proseSnippet} Detailed background, atmospheric lighting, high quality anime art`
          generateTravelImage(imagePrompt, scene.protagonistVisible ? activeChar?.selfieUrl : undefined)
            .then((url) => { if (url) setTripSceneImage(scene.id, url) })
            .finally(() => setImageLoadingSceneId(null))
        }
      }

      if (needsImage && !imageTriggered) {
        imageTriggered = true
        const imagePrompt = `anime style, cinematic wide shot, ${scene.timeOfDay} atmosphere in ${scene.location}, ${destination.city}. ${full.slice(0, 300)} Detailed background, atmospheric lighting, high quality anime art`
        generateTravelImage(imagePrompt, scene.protagonistVisible ? activeChar?.selfieUrl : undefined)
          .then((url) => { if (url) setTripSceneImage(scene.id, url) })
          .finally(() => setImageLoadingSceneId(null))
      }

      setTripScene(scene.id, { prose: full })
    } catch (e: any) {
      if (e.name !== 'AbortError') console.error('Scene streaming error:', e)
    } finally {
      clearTimeout(sceneTimeout)
      setIsStreaming(false)
      setImageLoadingSceneId(null)
    }
  }

  async function handleContinueToChat() {
    const scene = getCurrentScene()
    if (scene && trip && companion && destination) {
      const sceneImg = trip.sceneImages[scene.id]
      const recapMsg: ChatMessage = {
        role: 'character',
        content: `📍 ${scene.location} — ${scene.activity}`,
        characterId: '__scene_recap__',
        timestamp: Date.now(),
        imageUrl: sceneImg || undefined,
      }
      addTravelDayChatMessage(trip.currentDay, recapMsg)

      setViewMode('chat')

      const result = await generateTravelOpeningMessage({
        companionId: trip.companionId,
        companionSliders: trip.companionSliders,
        companionRemix: trip.companionRemix,
        destinationId: trip.destinationId,
        chatType: getChatType(),
        sceneContext: `${scene.location} — ${scene.activity}`,
        tripContext: buildTripContext(),
        bio: activeChar?.bio ?? null,
      })
      const msg: ChatMessage = {
        role: 'character',
        content: result.content,
        characterId: trip.companionId,
        timestamp: Date.now(),
      }
      addTravelDayChatMessage(trip.currentDay, msg)
      if (result.suggestions) setSuggestions(result.suggestions)
    } else {
      setViewMode('chat')
    }
  }

  async function handleNextScene() {
    advanceTravelScene()
    setTimeout(() => {
      const updated = useStore.getState()
      const updatedTrip = updated.activeTripId ? updated.travelTrips[updated.activeTripId] : null
      if (updatedTrip?.phase === 'recap') {
        setViewMode('day-end')
      } else {
        handlePlayScene()
      }
    }, 50)
  }

  async function handleNextDay() {
    if (!trip || !destination) return

    // Final day → complete
    if (trip.currentDay >= destination.tripDays) {
      completeTrip()
      setViewMode('complete')
      return
    }

    setIsGeneratingItinerary(true)
    setViewMode('transition')

    try {
      const nextDayNum = trip.currentDay + 1
      const day = await generateDayItinerary({
        destinationId: trip.destinationId,
        companionId: trip.companionId,
        companionSliders: trip.companionSliders,
        companionRemix: trip.companionRemix,
        planningHistory: trip.dayChatHistories[trip.currentDay] ?? [],
        dayNumber: nextDayNum,
        previousDays: trip.itinerary.days,
        companionMemories: trip.companionMemories,
      })
      updateTripItinerary(day)
      advanceTravelDay()
      setViewMode('day-start')
    } catch (e) {
      console.error('Next day generation error:', e)
      setViewMode('chat')
    } finally {
      setIsGeneratingItinerary(false)
    }
  }

  async function generateTravelImage(prompt: string, selfieUrl?: string | null, includeCompanion = true): Promise<string | null> {
    try {
      const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 45000))
      const companionDesc = companion?.character.portraitPrompt
        .split(',').slice(0, 5).join(',')
        .replace(/^(anime style|dark|cyberpunk[^,]*|fantasy[^,]*|thriller[^,]*|sci-fi[^,]*)\s*(portrait|illustration|concept art)\s*(portrait\s*)?of\s*/i, '')
        .trim()
      const image = generateImage({
        prompt,
        width: 768,
        height: 432,
        referenceImageUrl: selfieUrl ?? undefined,
        companionReferenceUrl: includeCompanion ? (companionPortrait ?? undefined) : undefined,
        companionDescription: includeCompanion ? companionDesc : undefined,
        includesProtagonist: !!selfieUrl,
        protagonistGender: activeChar?.gender,
      })
      return await Promise.race([image, timeout])
    } catch {
      return null
    }
  }

  if (!trip || !destination || !companion) {
    return (
      <div className="flex h-dvh items-center justify-center" style={{ background: '#0A0810' }}>
        <div className="text-center">
          <p className="text-white/50 mb-4">No active trip</p>
          <button
            onClick={() => navigate('/travel')}
            className="text-purple-400 text-sm cursor-pointer hover:text-purple-300"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Choose a destination
          </button>
        </div>
      </div>
    )
  }

  const currentScene = getCurrentScene()
  const messages = trip.phase === 'planning'
    ? trip.planningChatHistory
    : (trip.dayChatHistories[trip.currentDay] ?? [])

  const planningReady = trip.phase === 'planning' && messages.length >= 6

  const arcSegments = [
    {
      id: 'planning',
      label: 'Plan your trip',
      status: trip.phase === 'planning' ? 'active' as const : 'done' as const,
    },
    {
      id: 'start-exploring',
      label: `Start exploring ${destination.city}`,
      status: (trip.phase === 'planning'
        ? (planningReady ? 'ready' : 'locked')
        : 'done') as 'locked' | 'ready' | 'active' | 'done',
      action: planningReady ? handleStartExploring : undefined,
    },
    ...Array.from({ length: destination.tripDays }, (_, i) => {
      const dayNum = i + 1
      const dayData = trip.itinerary.days.find((d) => d.dayNumber === dayNum)
      const isCurrent = trip.phase === 'day' && trip.currentDay === dayNum
      const isRecap = trip.phase === 'recap' && trip.currentDay === dayNum
      const isDone = dayData?.completed ?? false
      const isFuture = !dayData && trip.currentDay < dayNum
      return {
        id: `day-${dayNum}`,
        label: dayData ? `Day ${dayNum}: ${dayData.theme}` : `Day ${dayNum}`,
        status: (isDone ? 'done' : isCurrent || isRecap ? 'active' : isFuture || !dayData ? 'locked' : 'locked') as 'locked' | 'ready' | 'active' | 'done',
        scenes: dayData?.scenes.map((s, si) => ({
          label: s.location,
          done: !!s.prose,
          active: isCurrent && si === trip.currentSceneIndex,
        })),
      }
    }),
    {
      id: 'complete',
      label: 'Trip complete',
      status: (trip.phase === 'complete' ? 'done' : 'locked') as 'locked' | 'ready' | 'active' | 'done',
    },
  ]

  return (
    <div className="flex h-dvh" style={{ background: '#0A0810' }}>
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div
          className="shrink-0 flex items-center gap-3 px-5 py-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <button onClick={() => navigate('/travel')} className="text-white/40 hover:text-white/60 cursor-pointer">
            <ArrowLeft size={18} />
          </button>
          {companionPortrait ? (
            <img src={companionPortrait} alt="" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: '#2D2538' }}>
              {companion.character.avatar}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {companionName}
            </p>
            <p className="text-white/40 text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {destination.countryEmoji} {destination.city} — {trip.phase === 'planning' ? 'Planning' : `Day ${trip.currentDay}`}
            </p>
          </div>
          <motion.button
            onClick={() => {
              const playing = lofiPlayer.toggle()
              setLofiPlaying(playing)
              setShowLofiLabel(false)
            }}
            animate={!lofiPlaying && showLofiLabel ? { scale: [1, 1.08, 1] } : {}}
            transition={!lofiPlaying && showLofiLabel ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : {}}
            className="shrink-0 h-8 rounded-full flex items-center gap-1.5 px-2.5 cursor-pointer transition-colors hover:bg-white/5"
            style={{ background: lofiPlaying ? 'rgba(139,92,246,0.12)' : 'transparent', border: lofiPlaying ? '1px solid rgba(139,92,246,0.2)' : '1px solid rgba(255,255,255,0.08)' }}
            title={lofiPlaying ? 'Pause lofi' : 'Play lofi'}
          >
            {lofiPlaying ? <Volume2 size={14} className="text-purple-400" /> : <VolumeX size={14} className="text-white/40" />}
            {showLofiLabel && !lofiPlaying && (
              <span className="text-[11px] text-white/40 pr-0.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>lofi</span>
            )}
          </motion.button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {/* Transition Screen */}
            {viewMode === 'transition' && (
              <motion.div
                key="transition"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-full"
              >
                <div className="text-center">
                  <Loader2 size={24} className="text-purple-400 animate-spin mx-auto mb-3" />
                  <p className="text-white/60 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {isGeneratingItinerary ? 'Planning your day...' : 'Loading...'}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Day Start Transition */}
            {viewMode === 'day-start' && (
              <DayTransition
                dayNumber={trip.currentDay}
                theme={trip.itinerary.days.find((d) => d.dayNumber === trip.currentDay)?.theme ?? `Day ${trip.currentDay}`}
                cityName={destination.city}
                heroImage={destination.heroImage}
                type="start"
                onContinue={() => handlePlayScene()}
              />
            )}

            {/* Day End Transition */}
            {viewMode === 'day-end' && (
              <DayTransition
                dayNumber={trip.currentDay}
                theme={trip.itinerary.days.find((d) => d.dayNumber === trip.currentDay)?.theme ?? ''}
                cityName={destination.city}
                heroImage={destination.heroImage}
                type="end"
                onContinue={() => setViewMode('chat')}
                scenes={trip.itinerary.days.find((d) => d.dayNumber === trip.currentDay)?.scenes}
                sceneImages={trip.sceneImages}
              />
            )}

            {/* Trip Complete */}
            {viewMode === 'complete' && (
              <TripComplete
                trip={trip}
                destination={destination}
                companion={companion}
                onNewTrip={() => { resetTrip(); navigate('/travel') }}
              />
            )}

            {/* Scene View */}
            {viewMode === 'scene' && currentScene && (() => {
              const currentDay = trip.itinerary.days.find((d) => d.dayNumber === trip.currentDay)
              const sceneIndex = currentDay?.scenes.findIndex((s) => s.id === currentScene.id) ?? 0
              const totalScenes = currentDay?.scenes.length ?? 1
              const sceneImg = trip.sceneImages[currentScene.id]

              return (
              <motion.div
                key={`scene-${currentScene.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative"
              >
                {/* Hero image with gradient fade */}
                <div className="relative w-full" style={{ height: sceneImg ? 440 : 200 }}>
                  {sceneImg && (
                    <>
                      <img
                        src={sceneImg}
                        alt={currentScene.location}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div
                        className="absolute inset-0"
                        style={{ background: 'linear-gradient(180deg, rgba(10,8,16,0) 60%, rgba(10,8,16,1) 100%)' }}
                      />
                    </>
                  )}

                  {/* Loading placeholder while image generates */}
                  {!sceneImg && imageLoadingSceneId === currentScene.id && (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.03)' }}>
                      <div className="flex items-center gap-2 text-white/20">
                        <Loader2 size={14} className="animate-spin" />
                        <span className="text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Generating scene...</span>
                      </div>
                    </div>
                  )}

                  {/* Fallback when image failed to generate */}
                  {!sceneImg && imageLoadingSceneId !== currentScene.id && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: 'linear-gradient(180deg, rgba(124,58,237,0.06) 0%, rgba(10,8,16,1) 100%)' }}>
                      <MapPin size={20} className="text-purple-400/30 mb-2" />
                      <p className="text-white/25 text-sm font-medium" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        {currentScene.location}
                      </p>
                      <p className="text-white/15 text-xs mt-0.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        {currentScene.timeOfDay}
                      </p>
                    </div>
                  )}
                </div>

                <div className="relative z-10 px-5 md:px-[60px] mx-auto max-w-[800px]" style={{ marginTop: sceneImg ? -20 : 16 }}>
                  {/* Scene progress bar */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: totalScenes }, (_, i) => (
                      <div
                        key={i}
                        className="h-[3px] flex-1 rounded-full"
                        style={{ background: i <= sceneIndex ? '#7C3AED' : 'rgba(255,255,255,0.08)' }}
                      />
                    ))}
                  </div>

                  {/* Day & location label */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-purple-400/70 text-[10px] font-semibold tracking-[2px] uppercase"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        Day {trip.currentDay} — {currentScene.location}
                      </span>
                    </div>
                    <span
                      className="text-white/25 text-[10px]"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      Scene {sceneIndex + 1} of {totalScenes}
                    </span>
                  </div>

                  {/* Prose */}
                  <div className="mb-8 space-y-2">
                    {parseSegments(sceneProse || currentScene.prose || '').map((seg, j) =>
                      seg.type === 'action' ? (
                        <ActionBeat key={j} text={seg.text} />
                      ) : (
                        <p
                          key={j}
                          className="text-white text-[15px] leading-[1.8] whitespace-pre-wrap"
                          style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
                        >
                          {seg.text}
                        </p>
                      )
                    )}
                    {isStreaming && <span className="inline-block w-0.5 h-4 bg-purple-400/60 ml-0.5 animate-pulse align-text-bottom" />}
                  </div>

                  {/* Scene Actions */}
                  {!isStreaming && (sceneProse || currentScene.prose) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col gap-3 pb-8 max-w-[320px]"
                    >
                      <button
                        onClick={handleContinueToChat}
                        className="py-2.5 px-5 rounded-xl text-white font-medium text-sm cursor-pointer"
                        style={{ fontFamily: "'Space Grotesk', sans-serif", background: 'linear-gradient(135deg, #7C3AED, #c84b9e)' }}
                      >
                        Chat with {companionName}
                      </button>
                    </motion.div>
                  )}
                </div>

                {/* Companion typing indicator during streaming */}
                {isStreaming && (
                  <div className="px-5 md:px-[60px] pb-6">
                    <div className="flex items-center gap-2">
                      {companionPortrait ? (
                        <img src={companionPortrait} alt="" className="w-5 h-5 rounded-full object-cover" />
                      ) : (
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px]" style={{ background: '#2D2538' }}>
                          {companion.character.avatar}
                        </div>
                      )}
                      <span className="text-white/30 text-xs italic" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        {companionName} is writing...
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
              )
            })()}

            {/* Chat View */}
            {viewMode === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-5 md:px-[60px] py-4"
              >
                {/* Scene context divider */}
                {currentScene && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-px flex-1" style={{ background: 'rgba(124,58,237,0.15)' }} />
                    <span
                      className="text-[11px] italic shrink-0"
                      style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: 'rgba(200,180,255,0.4)' }}
                    >
                      {currentScene.location}, {currentScene.timeOfDay}
                    </span>
                    <div className="h-px flex-1" style={{ background: 'rgba(124,58,237,0.15)' }} />
                  </div>
                )}

                {/* Messages */}
                <div className="space-y-4">
                  {messages.map((msg, i) => {
                    if (msg.characterId === '__scene_recap__') {
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex justify-center my-2"
                        >
                          <div
                            className="rounded-xl overflow-hidden"
                            style={{ maxWidth: 360, background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.12)' }}
                          >
                            {msg.imageUrl && (
                              <img
                                src={msg.imageUrl}
                                alt=""
                                className="w-full"
                                style={{ aspectRatio: '16/9', objectFit: 'cover' }}
                              />
                            )}
                            <div className="px-3 py-2">
                              <p
                                className="text-white/50 text-xs"
                                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                              >
                                {msg.content}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )
                    }

                    {/* Place photo card */}
                    if (msg.content.startsWith('📍') && msg.imageUrl) {
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex justify-start my-1"
                        >
                          <div
                            className="rounded-xl overflow-hidden"
                            style={{ maxWidth: 320, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                          >
                            <img
                              src={msg.imageUrl}
                              alt=""
                              className="w-full"
                              style={{ aspectRatio: '4/3', objectFit: 'cover' }}
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                            />
                            <div className="px-3 py-2 flex items-center gap-1.5">
                              <MapPin size={10} className="text-purple-400/60 shrink-0" />
                              <p
                                className="text-white/50 text-xs"
                                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                              >
                                {msg.content.replace('📍 ', '')}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )
                    }

                    if (msg.content.startsWith('🍽️') && msg.imageUrl) {
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex justify-start my-1"
                        >
                          <div
                            className="rounded-xl overflow-hidden"
                            style={{ maxWidth: 320, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                          >
                            <img
                              src={msg.imageUrl}
                              alt=""
                              className="w-full"
                              style={{ aspectRatio: '4/3', objectFit: 'cover' }}
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                            />
                            <div className="px-3 py-2">
                              <p
                                className="text-white/50 text-xs"
                                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                              >
                                {msg.content.replace('🍽️ ', '')}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )
                    }

                    if (msg.role === 'user') {
                      return (
                        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
                          <div className="max-w-[80%] rounded-2xl px-4 py-2.5" style={{ background: '#7C3AED', borderBottomRightRadius: 4 }}>
                            <p className="text-[14px] leading-relaxed whitespace-pre-wrap text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                              {msg.content}
                            </p>
                          </div>
                        </motion.div>
                      )
                    }

                    const segments = parseSegments(msg.content)
                    return (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-1.5">
                      {msg.imageUrl && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                          className="rounded-xl overflow-hidden"
                          style={{ maxWidth: 360, border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                          <img src={msg.imageUrl} alt="" className="w-full" style={{ aspectRatio: '16/9', objectFit: 'cover' }} />
                        </motion.div>
                      )}
                      {segments.map((seg, j) =>
                        seg.type === 'action' ? (
                          <ActionBeat key={j} text={seg.text} />
                        ) : (
                          <div key={j} className="flex justify-start">
                            <div className="max-w-[80%] rounded-2xl px-4 py-2.5" style={{ background: 'rgba(255,255,255,0.06)', borderBottomLeftRadius: 4 }}>
                              <p className="text-[14px] leading-relaxed whitespace-pre-wrap text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                {seg.text}
                              </p>
                            </div>
                          </div>
                        )
                      )}
                    </motion.div>
                    )
                  })}

                  {/* Image loading shimmer */}
                  {isGeneratingChatImage && (
                    <div className="w-full max-w-[360px] rounded-xl overflow-hidden">
                      <div className="w-full aspect-[16/9] scene-image-shimmer rounded-xl" />
                    </div>
                  )}

                  {/* Streaming indicator */}
                  {isStreaming && streamedText && (
                    <div className="flex flex-col gap-1.5">
                      {parseSegments(streamedText).map((seg, j) =>
                        seg.type === 'action' ? (
                          <ActionBeat key={j} text={seg.text} />
                        ) : (
                          <div key={j} className="flex justify-start">
                            <div className="max-w-[80%] rounded-2xl px-4 py-2.5" style={{ background: 'rgba(255,255,255,0.06)', borderBottomLeftRadius: 4 }}>
                              <p className="text-[14px] leading-relaxed text-white whitespace-pre-wrap" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                {seg.text}
                              </p>
                            </div>
                          </div>
                        )
                      )}
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-400/60 animate-pulse ml-1" />
                    </div>
                  )}

                  {isStreaming && !streamedText && (
                    <div className="flex justify-start">
                      <div className="px-4 py-2.5">
                        <Loader2 size={16} className="text-white/30 animate-spin" />
                      </div>
                    </div>
                  )}
                </div>
                <div ref={chatEndRef} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Controls */}
        {viewMode === 'chat' && (
          <div className="shrink-0 px-5 md:px-[60px] pb-5 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {/* Inline phase actions — compact, non-intrusive (no planning CTA here — sidebar only) */}
            {!isStreaming && trip.phase === 'day' && currentScene && !currentScene.prose && (
              <button
                onClick={handlePlayScene}
                className="flex items-center gap-2 mb-3 py-1.5 px-3 rounded-lg text-xs cursor-pointer transition-colors hover:bg-purple-500/15"
                style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'rgba(200,180,255,0.9)', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)' }}
              >
                <MapPin size={10} /> Go to {currentScene.location}
              </button>
            )}

            {!isStreaming && trip.phase === 'day' && currentScene?.prose && (() => {
              const dayChatMessages = trip.dayChatHistories[trip.currentDay] ?? []
              const userMsgCount = dayChatMessages.filter((m) => m.role === 'user').length
              return userMsgCount >= 2 ? (
                <button
                  onClick={handleNextScene}
                  className="flex items-center gap-2 mb-3 py-1.5 px-3 rounded-lg text-xs font-medium cursor-pointer transition-colors hover:bg-white/10"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#e0e0e0', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
                >
                  Next scene <ChevronRight size={10} />
                </button>
              ) : null
            })()}

            {!isStreaming && trip.phase === 'recap' && (
              <button
                onClick={handleNextDay}
                className="flex items-center gap-2 mb-3 py-1.5 px-3 rounded-lg text-xs font-medium cursor-pointer transition-colors hover:bg-white/10"
                style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#e0e0e0', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                <Play size={10} /> {trip.currentDay >= destination.tripDays ? 'Complete your trip' : `Start Day ${trip.currentDay + 1}`}
              </button>
            )}

            {/* Suggestions */}
            {!isStreaming && suggestions.length > 0 && (
              <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(s)}
                    className="shrink-0 text-xs px-3 py-1.5 rounded-full cursor-pointer transition-colors hover:bg-purple-500/20"
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      background: 'rgba(124,58,237,0.1)',
                      color: 'rgba(200,180,255,0.8)',
                      border: '1px solid rgba(124,58,237,0.2)',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Actions Panel */}
            <AnimatePresence>
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="mb-2"
                >
                  <div
                    className="grid grid-cols-4 gap-1 p-1.5 rounded-xl"
                    style={{ width: 400, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    {[
                      { id: 'show-me', emoji: '📸', label: 'Show me', desc: 'Visualize the scene', handler: handleShowMe },
                      { id: 'selfie', emoji: '🤳', label: 'Selfie', desc: 'Snap a pic together', handler: handleSelfie },
                      { id: 'buy-gift', emoji: '🎁', label: 'Buy a gift', desc: 'They\'ll love it', handler: handleBuyGift },
                      { id: 'hold-hands', emoji: '💕', label: 'Hold hands', desc: 'A little closer', handler: handleHoldHands },
                    ].map((action) => (
                      <button
                        key={action.id}
                        onClick={() => { setShowActions(false); action.handler() }}
                        disabled={isGeneratingChatImage}
                        className="flex flex-col items-center gap-0.5 py-2.5 px-4 rounded-lg cursor-pointer transition-colors hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        <span className="text-lg">{action.emoji}</span>
                        <span className="text-white/80 text-[11px] font-medium">{action.label}</span>
                        <span className="text-white/30 text-[9px]">{action.desc}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend() }}
              className="flex items-center gap-2"
            >
              {messages.some((m) => m.role === 'character') && (
                <button
                  type="button"
                  onClick={() => setShowActions(!showActions)}
                  className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all"
                  style={{
                    background: showActions ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.06)',
                    border: showActions ? '1px solid rgba(124,58,237,0.3)' : '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  {isGeneratingChatImage ? (
                    <Loader2 size={16} className="text-white/50 animate-spin" />
                  ) : showActions ? (
                    <X size={16} className="text-purple-400" />
                  ) : (
                    <Plus size={16} className="text-white/50" />
                  )}
                </button>
              )}
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Message ${companionName}...`}
                disabled={isStreaming}
                className="flex-1 bg-transparent text-white text-sm px-4 py-3 rounded-xl outline-none placeholder:text-white/25 disabled:opacity-50"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              />
              <button
                type="submit"
                disabled={!input.trim() || isStreaming}
                className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                style={{ background: input.trim() ? '#7C3AED' : 'rgba(255,255,255,0.06)' }}
              >
                {isStreaming ? (
                  <Loader2 size={16} className="text-white/50 animate-spin" />
                ) : (
                  <Send size={16} className="text-white" />
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Trip Arc Sidebar — desktop only */}
      <div
        className="hidden lg:flex flex-col shrink-0 w-[260px] overflow-y-auto pt-6 pb-16 px-5"
        style={{ borderLeft: '1px solid rgba(255,255,255,0.06)', background: '#0C0A14' }}
      >
        <p
          className="text-white/30 text-[10px] font-semibold tracking-[2px] uppercase mb-5"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Trip Progress
        </p>
        <div className="space-y-1">
          {arcSegments.map((seg, i) => {
            const isReady = seg.status === 'ready'
            const isActive = seg.status === 'active'
            const isDone = seg.status === 'done'
            const isLocked = seg.status === 'locked'

            // Tooltip text for locked segments
            const lockHint = isLocked
              ? seg.id === 'start-exploring'
                ? 'Chat with your companion to plan your trip first'
                : seg.id === 'complete'
                  ? 'Complete all days to finish your trip'
                  : seg.id.startsWith('day-')
                    ? 'Start exploring to unlock days'
                    : undefined
              : undefined

            return (
              <div key={seg.id}>
                <div className="relative group">
                  <motion.button
                    onClick={isReady && 'action' in seg && seg.action ? seg.action : undefined}
                    disabled={!isReady || isGeneratingItinerary}
                    animate={isReady ? { boxShadow: ['0 0 0px rgba(124,58,237,0)', '0 0 12px rgba(124,58,237,0.3)', '0 0 0px rgba(124,58,237,0)'] } : {}}
                    transition={isReady ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : {}}
                    className={`w-full flex items-center gap-2.5 py-2 px-2.5 rounded-lg text-left transition-all ${
                      isReady ? 'cursor-pointer hover:bg-purple-500/10' : 'cursor-default'
                    }`}
                    style={{
                      background: isActive ? 'rgba(124,58,237,0.1)' : isReady ? 'rgba(124,58,237,0.05)' : 'transparent',
                      border: isActive ? '1px solid rgba(124,58,237,0.2)' : isReady ? '1px solid rgba(124,58,237,0.2)' : '1px solid transparent',
                    }}
                  >
                    <div
                      className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{
                        background: isDone ? '#7C3AED' : isActive ? 'rgba(124,58,237,0.3)' : isReady ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.06)',
                        border: isActive ? '2px solid #7C3AED' : undefined,
                      }}
                    >
                      {isDone && <Check size={10} className="text-white" />}
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />}
                      {isReady && <Play size={8} className="text-purple-400 ml-0.5" />}
                      {isLocked && <Lock size={8} className="text-white/20" />}
                    </div>
                    <span
                      className="text-xs leading-tight"
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        color: isDone ? 'rgba(255,255,255,0.5)' : isActive ? '#fff' : isReady ? 'rgba(200,180,255,0.9)' : 'rgba(255,255,255,0.2)',
                        fontWeight: isActive || isReady ? 600 : 400,
                      }}
                    >
                      {seg.label}
                    </span>
                  </motion.button>
                  {lockHint && (
                    <div
                      className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 px-2.5 py-1.5 rounded-lg text-[10px] leading-tight whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
                      style={{ fontFamily: "'Space Grotesk', sans-serif", background: '#1E1A2E', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(124,58,237,0.2)' }}
                    >
                      {lockHint}
                    </div>
                  )}
                  {isReady && seg.id === 'start-exploring' && (
                    <p
                      className="text-[10px] ml-10 -mt-0.5 mb-1"
                      style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'rgba(167,139,250,0.5)' }}
                    >
                      Ready when you are
                    </p>
                  )}
                </div>

                {/* Scene sub-items for active/done days */}
                {'scenes' in seg && seg.scenes && (isActive || isDone) && (
                  <div className="ml-5 pl-3 space-y-0.5 mb-1" style={{ borderLeft: '1px solid rgba(124,58,237,0.15)' }}>
                    {seg.scenes.map((sc, si) => (
                      <div key={si} className="flex items-center gap-2 py-1">
                        <div
                          className="shrink-0 w-1.5 h-1.5 rounded-full"
                          style={{
                            background: sc.done ? '#7C3AED' : sc.active ? '#A78BFA' : 'rgba(255,255,255,0.1)',
                            boxShadow: sc.active ? '0 0 6px rgba(167,139,250,0.5)' : undefined,
                          }}
                        />
                        <span
                          className="text-[11px] truncate"
                          style={{
                            fontFamily: "'Space Grotesk', sans-serif",
                            color: sc.done ? 'rgba(255,255,255,0.4)' : sc.active ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.15)',
                          }}
                        >
                          {sc.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Connector line between segments */}
                {i < arcSegments.length - 1 && (
                  <div className="flex justify-start ml-[19px]">
                    <div className="w-px h-2" style={{ background: isDone ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.06)' }} />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Companion Settings */}
        <div className="mt-auto pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={() => setShowCompanionSettings(!showCompanionSettings)}
            className="w-full flex items-center gap-2 py-1.5 cursor-pointer"
          >
            {companionPortrait ? (
              <img src={companionPortrait} alt="" className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ background: '#2D2538' }}>
                {companion.character.avatar}
              </div>
            )}
            <span className="text-white/50 text-xs flex-1 text-left" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {companionName}
            </span>
            <ChevronDown size={12} className={`text-white/30 transition-transform ${showCompanionSettings ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showCompanionSettings && trip && (() => {
              const sliders = localSliders ?? trip.companionSliders
              const hasChanges = localSliders !== null && (
                localSliders.chattiness !== trip.companionSliders.chattiness ||
                localSliders.planningStyle !== trip.companionSliders.planningStyle ||
                localSliders.vibe !== trip.companionSliders.vibe
              )
              return (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-3 space-y-4">
                  {[
                    { key: 'chattiness' as const, left: 'Brief', right: 'Chatty' },
                    { key: 'planningStyle' as const, left: 'Spontaneous', right: 'Planner' },
                    { key: 'vibe' as const, left: 'Playful', right: 'Thoughtful' },
                  ].map((s) => (
                    <div key={s.key}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-white/25 text-[10px]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{s.left}</span>
                        <span className="text-white/25 text-[10px]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{s.right}</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={sliders[s.key]}
                        onChange={(e) => {
                          const val = parseInt(e.target.value)
                          setLocalSliders({ ...sliders, [s.key]: val })
                        }}
                        className="w-full accent-purple-500"
                        style={{ height: 3 }}
                      />
                    </div>
                  ))}
                  <AnimatePresence>
                    {hasChanges && (
                      <motion.button
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onClick={() => {
                          updateCompanionSliders(localSliders)
                          setLocalSliders(null)
                          setToastMessage('Companion vibe updated')
                          setTimeout(() => setToastMessage(null), 2000)
                        }}
                        className="w-full py-2 rounded-lg text-xs font-medium text-white cursor-pointer"
                        style={{ fontFamily: "'Space Grotesk', sans-serif", background: 'linear-gradient(135deg, #7C3AED, #c84b9e)' }}
                      >
                        Save
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
              )
            })()}
          </AnimatePresence>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-xs text-white font-medium"
            style={{ fontFamily: "'Space Grotesk', sans-serif", background: '#1E1A2E', border: '1px solid rgba(124,58,237,0.3)', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
