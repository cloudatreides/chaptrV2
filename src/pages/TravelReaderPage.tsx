import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Send, Loader2, MapPin, ChevronRight, Lock, Check, Play, ChevronDown, ChevronUp, Plus, X, Volume2, VolumeX, ImagePlus, RefreshCw, Map } from 'lucide-react'
import { Drawer } from 'vaul'
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
import { DepartureScreen } from '../components/travel/DepartureScreen'
import { TripComplete } from '../components/travel/TripComplete'
import type { ChatMessage, TripScene } from '../store/useStore'
import { SelfieImg } from '../components/SelfieImg'
import { StreamedText } from '../components/StreamedText'
import { TypingIndicator } from '../components/TypingIndicator'
import { highlightName } from '../lib/highlightName'
import { ambientPlayer } from '../lib/ambientPlayer'
import { ambientAudio } from '../lib/ambientAudio'

type ViewMode = 'chat' | 'scene' | 'transition' | 'day-start' | 'day-end' | 'complete' | 'departure'

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

function SaveToAlbumBtn({ imageUrl, label, destinationId, companionId }: { imageUrl: string; label: string; destinationId: string; companionId: string }) {
  const addStoryMoment = useStore((s) => s.addStoryMoment)
  const storyMoments = useStore((s) => s.storyMoments)
  const alreadySaved = storyMoments.some((m) => m.imageUrl === imageUrl)
  const [saved, setSaved] = useState(alreadySaved)

  const handleSave = () => {
    if (saved) return
    addStoryMoment({
      id: `travel-${Date.now()}`,
      imageUrl,
      characterIds: [companionId],
      universeId: `travel:${destinationId}`,
      beatLabel: label,
      note: '',
      timestamp: Date.now(),
    })
    setSaved(true)
  }

  return (
    <motion.button
      className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium backdrop-blur-sm cursor-pointer"
      style={{
        background: saved ? 'rgba(34,197,94,0.7)' : 'rgba(0,0,0,0.55)',
        color: 'rgba(255,255,255,0.9)',
      }}
      onClick={handleSave}
      disabled={saved}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.3 }}
      whileTap={saved ? {} : { scale: 0.95 }}
    >
      {saved ? <><Check size={12} /> Saved</> : <><ImagePlus size={12} /> Save</>}
    </motion.button>
  )
}

function PlaceFoodCard({ kind, msg, destinationId, companionId }: {
  kind: 'place' | 'food'
  msg: ChatMessage
  destinationId: string
  companionId: string
}) {
  const urls = msg.imageUrls && msg.imageUrls.length > 0
    ? msg.imageUrls
    : (msg.imageUrl ? [msg.imageUrl] : [])
  const labels = msg.imageLabels && msg.imageLabels.length > 0
    ? msg.imageLabels
    : [msg.content.replace(/^[📍🍽️]\s*/, '')]

  const [activeIndex, setActiveIndex] = useState(0)
  if (urls.length === 0) return null

  const activeLabel = labels[activeIndex] ?? labels[0]
  const activeUrl = urls[activeIndex] ?? urls[0]
  const emoji = kind === 'place' ? '📍' : '🍽️'

  return (
    <div className="flex justify-start my-1">
      <div
        className="rounded-xl overflow-hidden relative w-full"
        style={{ maxWidth: 320, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <CarouselWithIndex
          urls={urls}
          labels={labels}
          onIndexChange={setActiveIndex}
        />
        <div className="px-3 py-2 flex items-center gap-1.5">
          {kind === 'place' && <MapPin size={10} className="text-purple-400/60 shrink-0" />}
          <p className="text-white/50 text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {urls.length > 1 ? `${emoji} ${activeLabel}` : msg.content}
          </p>
        </div>
        <SaveToAlbumBtn
          imageUrl={activeUrl}
          label={activeLabel}
          destinationId={destinationId}
          companionId={companionId}
        />
      </div>
    </div>
  )
}

function CarouselWithIndex({ urls, labels, onIndexChange }: {
  urls: string[]
  labels: string[]
  onIndexChange: (i: number) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    onIndexChange(activeIndex)
  }, [activeIndex, onIndexChange])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const slideWidth = el.clientWidth
        if (slideWidth === 0) return
        const idx = Math.round(el.scrollLeft / slideWidth)
        setActiveIndex(Math.max(0, Math.min(urls.length - 1, idx)))
      })
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [urls.length])

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none' }}
      >
        {urls.map((url, i) => (
          <div key={i} className="relative shrink-0 w-full snap-start" style={{ aspectRatio: '4/3' }}>
            <img
              src={url}
              alt={labels[i] ?? ''}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          </div>
        ))}
      </div>
      {urls.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
          {urls.map((_, i) => (
            <span
              key={i}
              className="rounded-full transition-all"
              style={{
                width: i === activeIndex ? 16 : 6,
                height: 6,
                background: i === activeIndex ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.5)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function TravelReaderPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const store = useStore()
  const {
    activeTripId, travelTrips, activeCharacterId, characters,
    addTravelPlanningMessage, addTravelDayChatMessage, updateTripItinerary,
    setTripScene, setTripSceneImage, advanceTravelScene, advanceTravelDay,
    setTripPhase, updateTravelAffinity, addCompanionMemory, addTravelEngagementTime,
    completeTrip, extendTrip, resetTrip, setIsStreaming, isStreaming, updateCompanionSliders,
    setDepartureImage,
  } = store

  const trip = activeTripId ? travelTrips[activeTripId] : null
  const destination = trip ? getDestination(trip.destinationId) : null
  const companion = trip ? getTravelCompanion(trip.companionId) : null
  const companionName = trip?.companionRemix?.name ?? companion?.character.name ?? ''
  const companionPortrait = trip?.companionRemix?.imageUrl ?? companion?.character.staticPortrait
  // Visual description for image prompts. Remixed companions get an empty
  // string here — their personality traits are NOT visual cues, and the
  // user-uploaded portrait (companionPortrait above) carries the actual
  // appearance. Feeding personality words into image prompts produced
  // characters that looked nothing like the reference.
  const companionVisualDesc = trip?.companionRemix
    ? ''
    : companion?.character.portraitPrompt ?? ''
  const activeChar = characters.find((c) => c.id === activeCharacterId)

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (trip?.phase === 'complete') return 'complete'
    if (trip?.phase === 'planning' && trip.planningChatHistory.length === 0) return 'departure'
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
  const [isRegeneratingDeparture, setIsRegeneratingDeparture] = useState(false)

  const regenerateDepartureImage = async () => {
    if (!destination || !companionName || isRegeneratingDeparture) return
    setIsRegeneratingDeparture(true)
    try {
      const hasBothRefs = !!(activeChar?.selfieUrl && companionPortrait)
      const protagGender = activeChar?.gender ?? 'male'
      const compGender = companion?.character.gender
      const protagNoun = protagGender === 'female' ? 'young woman' : 'young man'
      const compNoun = compGender === 'male' ? 'young man' : compGender === 'female' ? 'young woman' : 'young person'
      // Use remix-aware description (empty for remixed companions — their
      // appearance comes from the reference portrait, not the base character).
      const fullCompDesc = companionVisualDesc
      const compShort = fullCompDesc
        ? fullCompDesc
            .split(',').slice(0, 4).join(',')
            .replace(/^(anime style|dark|cyberpunk[^,]*|fantasy[^,]*|thriller[^,]*|sci-fi[^,]*)\s*(portrait|illustration|concept art)\s*(portrait\s*)?of\s*/i, '')
            .trim()
        : ''
      // Model-agnostic prompt — see DepartureScreen.tsx for rationale.
      const baseScene = hasBothRefs
        ? `Anime illustration, two people in the foreground, posing for a photo together at an airport gate: a ${protagNoun} on the left and a ${compNoun}${compShort ? ` (${compShort})` : ''} on the right, both smiling at the camera, both wearing backpacks, excited to travel to ${destination.city}. Behind them, large terminal windows show a plane on the tarmac in warm golden hour light. No text, no signs, no departure boards`
        : `Cinematic wide shot of ${destination.city} skyline at golden hour, seen through an airport terminal window. A plane on the tarmac ready for departure. Warm sunlight, atmospheric, no people, no text, no signs`
      const prompt = hasBothRefs && compShort
        ? `${baseScene}. The travel companion in this scene is ${companionName}: ${compShort}`
        : baseScene
      const url = await generateImage({
        prompt,
        width: 768,
        height: 576,
        referenceImageUrl: activeChar?.selfieUrl || undefined,
        companionReferenceUrl: companionPortrait || undefined,
        companionDescription: fullCompDesc,
        includesProtagonist: hasBothRefs,
        protagonistGender: protagGender,
        companionGender: compGender,
      })
      if (url) setDepartureImage(url)
    } finally {
      setIsRegeneratingDeparture(false)
    }
  }
  const [localSliders, setLocalSliders] = useState<{ chattiness: number; planningStyle: number; vibe: number } | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [showActions, setShowActions] = useState(false)
  const [ambientPlaying, setAmbientPlaying] = useState(ambientPlayer.isEnabled)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const engagementRef = useRef<number>(Date.now())

  const [showAmbientLabel, setShowAmbientLabel] = useState(true)
  const [showPortraitModal, setShowPortraitModal] = useState(false)
  const [showProgressSheet, setShowProgressSheet] = useState(false)

  // Show departure screen for fresh trips (handles Zustand hydration race —
  // useState initializer may fire before store rehydrates from localStorage)
  useEffect(() => {
    if (!trip || viewMode === 'departure') return
    if (trip.phase === 'planning' && trip.planningChatHistory.length === 0) {
      setViewMode('departure')
    }
  }, [trip?.phase, trip?.planningChatHistory.length])

  useEffect(() => {
    if (trip?.destinationId) ambientPlayer.play(trip.destinationId)
    const unlockAudio = () => {
      ambientAudio.unlock()
      if (trip?.destinationId) ambientPlayer.play(trip.destinationId)
      document.removeEventListener('touchstart', unlockAudio)
      document.removeEventListener('click', unlockAudio)
    }
    document.addEventListener('touchstart', unlockAudio, { once: true })
    document.addEventListener('click', unlockAudio, { once: true })
    return () => {
      ambientPlayer.stop()
      document.removeEventListener('touchstart', unlockAudio)
      document.removeEventListener('click', unlockAudio)
    }
  }, [trip?.destinationId])

  // Hide ambient label after 5 seconds
  useEffect(() => {
    const t = setTimeout(() => setShowAmbientLabel(false), 5000)
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

  // Backfill excited reaction for existing extended trips
  const backfillRan = useRef(false)
  useEffect(() => {
    if (backfillRan.current || !trip || !companion || !destination) return
    if ((trip.extensions ?? 0) === 0) return
    const baseDays = destination.tripDays
    const firstExtDay = baseDays + 1
    const msgs = trip.dayChatHistories[firstExtDay]
    if (!msgs || msgs.length === 0) return
    const first = msgs[0]
    if (first.role === 'character' && first.content.includes('staying')) return
    backfillRan.current = true
    const reactions = [
      `Wait... we're staying?! I was already trying to figure out how to say goodbye and now — okay, I'm not going to pretend I'm not really happy right now.`,
      `You're serious? More days together? I... I don't know what to say. I was dreading the end of this trip and now we get to keep going. You have no idea how much this means.`,
      `Hold on — we're extending? I literally just spent the last hour memorizing everything about today because I thought it was our last full day. This is... wow. Okay. I might be a little emotional right now.`,
      `We're not leaving yet?! I had this whole bittersweet goodbye speech planned and everything. Delete that. We have more adventures to go on and I am SO ready.`,
      `...Really? You want to stay longer? With me? Sorry, I just — I was already getting sad about this ending. Now I'm trying very hard not to smile too much. I'm failing. I don't care.`,
    ]
    void (async () => {
      const portraitPrompt = buildReactionImagePrompt(companionVisualDesc, 'extend-trip', 'extend')
      const imageUrl = await generateCharacterPortrait(portraitPrompt).catch(() => null)
      const reactionMsg: ChatMessage = {
        role: 'character',
        content: reactions[Math.floor(Math.random() * reactions.length)],
        characterId: trip.companionId,
        timestamp: first.timestamp - 1,
        imageUrl: imageUrl ?? undefined,
      }
      const state = useStore.getState()
      const currentTrip = activeTripId ? state.travelTrips[activeTripId] : null
      if (!currentTrip) return
      const updatedHistories = { ...currentTrip.dayChatHistories }
      updatedHistories[firstExtDay] = [reactionMsg, ...(updatedHistories[firstExtDay] ?? [])]
      useStore.setState({
        travelTrips: {
          ...state.travelTrips,
          [activeTripId!]: { ...currentTrip, dayChatHistories: updatedHistories },
        },
      })
    })()
  }, [trip?.extensions, activeTripId])

  // Handle extend request from HomePage
  const pendingExtend = useRef(false)
  useEffect(() => {
    if ((location.state as any)?.extend && trip?.phase === 'complete' && !pendingExtend.current) {
      pendingExtend.current = true
      // Clear the navigation state so it doesn't re-trigger
      navigate(location.pathname, { replace: true, state: {} })
      handleExtendTrip()
    }
  }, [location.state, trip?.phase])

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [trip?.planningChatHistory.length, trip?.dayChatHistories, streamedText])

  // Generate opening message (runs even during departure so it's ready when chat appears)
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
        playerName: activeChar?.name ?? null,
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
        playerName: activeChar?.name ?? null,
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

      // Fetch place + food images in parallel and bundle into carousels (up to 3 each)
      if ((places.length > 0 || foods.length > 0) && destination) {
        const addImageMsg = isPlanning ? addTravelPlanningMessage : (msg: ChatMessage) => addTravelDayChatMessage(trip.currentDay, msg)
        const placesToFetch = places.slice(0, 3)
        const foodsToFetch = foods.slice(0, 3)
        ;(async () => {
          const [placeResults, foodResults] = await Promise.all([
            Promise.all(placesToFetch.map((p) => fetchPlaceImage(p, destination.city).catch(() => null))),
            Promise.all(foodsToFetch.map((f) => fetchFoodImage(f, destination.city).catch(() => null))),
          ])

          const validPlaces = placeResults
            .map((url, i) => ({ url, label: placesToFetch[i] }))
            .filter((x): x is { url: string; label: string } => !!x.url)
          if (validPlaces.length > 0) {
            addImageMsg({
              role: 'character',
              content: `📍 ${validPlaces.map((p) => p.label).join(' · ')}`,
              characterId: trip.companionId,
              timestamp: Date.now(),
              imageUrls: validPlaces.map((p) => p.url),
              imageLabels: validPlaces.map((p) => p.label),
            })
          }

          const validFoods = foodResults
            .map((url, i) => ({ url, label: foodsToFetch[i] }))
            .filter((x): x is { url: string; label: string } => !!x.url)
          if (validFoods.length > 0) {
            addImageMsg({
              role: 'character',
              content: `🍽️ ${validFoods.map((f) => f.label).join(' · ')}`,
              characterId: trip.companionId,
              timestamp: Date.now(),
              imageUrls: validFoods.map((f) => f.url),
              imageLabels: validFoods.map((f) => f.label),
            })
          }
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
    const imagePrompt = `anime illustration, cel-shaded, cinematic scene: ${lastCompanionMsg.content.slice(0, 200)}. Setting: ${locationContext}. Atmospheric lighting, detailed background, vibrant anime art`

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
        companionVisualDesc,
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
          playerName: activeChar?.name ?? null,
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
    const companionDesc = companionVisualDesc
      .split(',').slice(0, 4).join(',')
      .replace(/^(anime style|dark|cyberpunk[^,]*|fantasy[^,]*|thriller[^,]*|sci-fi[^,]*)\s*(portrait|illustration|concept art)\s*(portrait\s*)?of\s*/i, '')
      .trim()
    const playerGender = activeChar?.gender === 'male' ? 'a young man' : 'a young woman'
    const scenePrompt = `anime illustration, cel-shaded, two people walking together holding hands from behind on a beautiful street in ${locationContext}. ${playerGender} and ${companionDesc}. Close-up on their intertwined hands, warm golden hour lighting, soft bokeh, romantic moment, vibrant anime art`

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
          playerName: activeChar?.name ?? null,
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
    const companionDesc = companionVisualDesc.split(',').slice(0, 4).join(',')
    const playerGender = activeChar?.gender === 'male' ? 'a young man' : 'a young woman'
    const compGenderNoun = companion?.character.gender === 'male' ? 'a young man' : 'a young woman'
    // Fall back to gender-only when there's no visual description (eg. remixed
    // companion — their portrait reference image carries the appearance).
    const compPhrase = companionDesc ? companionDesc : compGenderNoun

    const recentMessages = (isPlanning ? trip.planningChatHistory : (trip.dayChatHistories[trip.currentDay] ?? [])).slice(-4)
    const conversationHint = recentMessages.map((m) => m.content).join(' ').slice(0, 200)
    const activityHint = currentScene?.activity ?? conversationHint

    const scenePrompt = `anime illustration, cel-shaded, selfie taken by ${playerGender}, close-up selfie with ${compPhrase}, both smiling at camera, peace signs, in ${locationContext}, ${activityHint}. Phone camera perspective, slight wide-angle distortion, warm natural lighting, candid happy energy, vibrant anime art`

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
          playerName: activeChar?.name ?? null,
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

  async function handleExtendTrip() {
    if (!trip || !destination || !companion || isGeneratingItinerary) return
    setIsGeneratingItinerary(true)

    const nextDayNum = trip.itinerary.days.length + 1
    const cName = trip.companionRemix?.name ?? companion.character.name
    extendTrip()
    setViewMode('transition')

    const blushPrompt = buildReactionImagePrompt(
      companionVisualDesc,
      'extend-trip',
      'extend',
    )

    const [portraitUrl, day] = await Promise.allSettled([
      generateCharacterPortrait(blushPrompt),
      generateDayItinerary({
        destinationId: trip.destinationId,
        companionId: trip.companionId,
        companionSliders: trip.companionSliders,
        companionRemix: trip.companionRemix,
        planningHistory: trip.dayChatHistories[trip.currentDay] ?? [],
        dayNumber: nextDayNum,
        previousDays: trip.itinerary.days,
        companionMemories: trip.companionMemories,
      }),
    ])

    const extensionReactions = [
      `Wait... we're staying?! ${cName === companionName ? '' : ''}I was already trying to figure out how to say goodbye and now — okay, I'm not going to pretend I'm not really happy right now.`,
      `You're serious? More days together? I... I don't know what to say. I was dreading the end of this trip and now we get to keep going. You have no idea how much this means.`,
      `Hold on — we're extending? I literally just spent the last hour memorizing everything about today because I thought it was our last full day. This is... wow. Okay. I might be a little emotional right now.`,
      `We're not leaving yet?! I had this whole bittersweet goodbye speech planned and everything. Delete that. We have more adventures to go on and I am SO ready.`,
      `...Really? You want to stay longer? With me? Sorry, I just — I was already getting sad about this ending. Now I'm trying very hard not to smile too much. I'm failing. I don't care.`,
    ]
    const reactionText = extensionReactions[Math.floor(Math.random() * extensionReactions.length)]

    const imageUrl = portraitUrl.status === 'fulfilled' ? portraitUrl.value : undefined

    addTravelDayChatMessage(nextDayNum, {
      role: 'character',
      content: reactionText,
      characterId: trip.companionId,
      timestamp: Date.now(),
      imageUrl: imageUrl ?? undefined,
    })

    if (day.status === 'fulfilled') {
      updateTripItinerary(day.value)
      setViewMode('day-start')
    } else {
      console.error('Extension day generation error:', day.reason)
      setViewMode('chat')
    }
    setIsGeneratingItinerary(false)
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
          const imagePrompt = `anime illustration, cel-shaded, cinematic wide shot, ${scene.timeOfDay} atmosphere in ${scene.location}, ${destination.city}. ${proseSnippet} Detailed background, atmospheric lighting, vibrant anime art`
          generateTravelImage(imagePrompt, scene.protagonistVisible ? activeChar?.selfieUrl : undefined)
            .then((url) => { if (url) setTripSceneImage(scene.id, url) })
            .finally(() => setImageLoadingSceneId(null))
        }
      }

      if (needsImage && !imageTriggered) {
        imageTriggered = true
        const imagePrompt = `anime illustration, cel-shaded, cinematic wide shot, ${scene.timeOfDay} atmosphere in ${scene.location}, ${destination.city}. ${full.slice(0, 300)} Detailed background, atmospheric lighting, vibrant anime art`
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
        playerName: activeChar?.name ?? null,
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

    const totalDays = destination.tripDays + (trip.extensions ?? 0) * 2
    if (trip.currentDay >= totalDays) {
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
      const companionDesc = companionVisualDesc
        .split(',').slice(0, 5).join(',')
        .replace(/^(anime style|dark|cyberpunk[^,]*|fantasy[^,]*|thriller[^,]*|sci-fi[^,]*)\s*(portrait|illustration|concept art)\s*(portrait\s*)?of\s*/i, '')
        .trim()
      const enrichedPrompt = includeCompanion && companionDesc
        ? `${prompt}. The travel companion in this scene is ${companionName}: ${companionDesc}`
        : prompt
      const image = generateImage({
        prompt: enrichedPrompt,
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

  type PreviousDay = { dayNumber: number; dayTitle: string; messages: ChatMessage[] }
  const previousDayMessages = useMemo((): PreviousDay[] => {
    if (trip.phase === 'planning') return []
    const prev: PreviousDay[] = []
    for (let d = 1; d < trip.currentDay; d++) {
      const msgs = trip.dayChatHistories[d]
      if (msgs && msgs.length > 0) {
        const dayData = trip.itinerary.days.find((day) => day.dayNumber === d)
        prev.push({ dayNumber: d, dayTitle: dayData?.theme ?? `Day ${d}`, messages: msgs })
      }
    }
    return prev
  }, [trip.phase, trip.currentDay, trip.dayChatHistories, trip.itinerary.days])

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

  // Mobile pill summary: count completed days + total days
  const totalTripDays = destination.tripDays + (trip.extensions ?? 0) * 2
  const completedDays = trip.itinerary.days.filter((d) => d.completed).length
  const progressLabel =
    trip.phase === 'planning' ? 'Planning' :
    trip.phase === 'complete' ? 'Trip complete' :
    `Day ${trip.currentDay} of ${totalTripDays}`

  const renderArcSegments = () => (
    <div className="space-y-1">
      {arcSegments.map((seg, i) => {
        const isReady = seg.status === 'ready'
        const isActive = seg.status === 'active'
        const isDone = seg.status === 'done'
        const isLocked = seg.status === 'locked'

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
                onClick={
                  isReady && 'action' in seg && seg.action
                    ? () => { (seg.action as () => void)(); setShowProgressSheet(false) }
                    : (isDone || isActive) && seg.id.startsWith('day-')
                      ? () => { document.getElementById(`day-chat-${seg.id.replace('day-', '')}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); setShowProgressSheet(false) }
                      : undefined
                }
                disabled={!isReady && !isDone && !isActive}
                animate={isReady ? { boxShadow: ['0 0 0px rgba(124,58,237,0)', '0 0 12px rgba(124,58,237,0.3)', '0 0 0px rgba(124,58,237,0)'] } : {}}
                transition={isReady ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : {}}
                className={`w-full flex items-center gap-2.5 py-2 px-2.5 rounded-lg text-left transition-all ${
                  isReady || ((isDone || isActive) && seg.id.startsWith('day-')) ? 'cursor-pointer hover:bg-purple-500/10' : 'cursor-default'
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

            {i < arcSegments.length - 1 && (
              <div className="flex justify-start ml-[19px]">
                <div className="w-px h-2" style={{ background: isDone ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.06)' }} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )

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
          <button onClick={() => companionPortrait && setShowPortraitModal(true)} className={`shrink-0 ${companionPortrait ? 'cursor-pointer' : ''}`}>
            {companionPortrait ? (
              <SelfieImg src={companionPortrait} alt="" className="w-8 h-8 rounded-full object-cover" fallback={<div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: '#2D2538' }}>{companion.character.avatar}</div>} />
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: '#2D2538' }}>
                {companion.character.avatar}
              </div>
            )}
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {companionName}
            </p>
            <p className="text-white/40 text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {destination.countryEmoji} {destination.city} — {trip.phase === 'planning' ? 'Planning' : `Day ${trip.currentDay}`}
            </p>
          </div>
          {/* Mobile-only trip progress pill */}
          <button
            onClick={() => setShowProgressSheet(true)}
            className="lg:hidden shrink-0 h-8 rounded-full flex items-center gap-1.5 px-2.5 cursor-pointer transition-colors hover:bg-white/5"
            style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}
            aria-label="Open trip progress"
          >
            <Map size={12} className="text-purple-400" />
            <span className="text-[11px] text-purple-200 font-medium" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {progressLabel}
            </span>
            <ChevronUp size={10} className="text-purple-300/60" />
          </button>
          <motion.button
            onClick={() => {
              const playing = ambientPlayer.toggle(trip.destinationId)
              setAmbientPlaying(playing)
              setShowAmbientLabel(false)
            }}
            animate={!ambientPlaying && showAmbientLabel ? { scale: [1, 1.08, 1] } : {}}
            transition={!ambientPlaying && showAmbientLabel ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : {}}
            className="shrink-0 h-8 rounded-full flex items-center gap-1.5 px-2.5 cursor-pointer transition-colors hover:bg-white/5"
            style={{ background: ambientPlaying ? 'rgba(139,92,246,0.12)' : 'transparent', border: ambientPlaying ? '1px solid rgba(139,92,246,0.2)' : '1px solid rgba(255,255,255,0.08)' }}
            title={ambientPlaying ? 'Pause ambient' : 'Play ambient'}
          >
            {ambientPlaying ? <Volume2 size={14} className="text-purple-400" /> : <VolumeX size={14} className="text-white/40" />}
            {showAmbientLabel && !ambientPlaying && (
              <span className="text-[11px] text-white/40 pr-0.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>ambient</span>
            )}
          </motion.button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto relative">
          <AnimatePresence mode="wait">
            {/* Departure Screen */}
            {viewMode === 'departure' && (
              <DepartureScreen
                key="departure"
                cityName={destination.city}
                countryEmoji={destination.countryEmoji}
                companionName={companionName}
                companionPortrait={companionPortrait}
                companionDescription={companionVisualDesc}
                twinSelfieUrl={activeChar?.selfieUrl}
                twinGender={activeChar?.gender ?? 'male'}
                companionGender={companion?.character.gender}
                heroImage={destination.heroImage}
                highlights={destination.highlights}
                existingImageUrl={trip.departureImageUrl}
                onImageGenerated={(url) => setDepartureImage(url)}
                onContinue={() => setViewMode('chat')}
              />
            )}

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
                onExtendTrip={handleExtendTrip}
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
                      ) : isStreaming ? (
                        <StreamedText
                          key={j}
                          text={seg.text}
                          className="text-white text-[15px] leading-[1.8]"
                          style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
                          highlightWord={activeChar?.name}
                        />
                      ) : (
                        <p
                          key={j}
                          className="text-white text-[15px] leading-[1.8] whitespace-pre-wrap"
                          style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
                        >
                          {highlightName(seg.text, activeChar?.name)}
                        </p>
                      )
                    )}
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
                        <SelfieImg src={companionPortrait} alt="" className="w-5 h-5 rounded-full object-cover" fallback={<div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px]" style={{ background: '#2D2538' }}>{companion.character.avatar}</div>} />
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
                {/* Previous days' chat history */}
                {previousDayMessages.length > 0 && (
                  <div className="space-y-4 mb-6 opacity-60">
                    {previousDayMessages.map((day) => (
                      <div key={day.dayNumber} id={`day-chat-${day.dayNumber}`}>
                        <div className="flex items-center gap-2 mb-3 mt-2">
                          <div className="h-px flex-1" style={{ background: 'rgba(124,58,237,0.12)' }} />
                          <span className="text-[10px] font-semibold tracking-[1.5px] uppercase shrink-0" style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'rgba(167,139,250,0.5)' }}>
                            Day {day.dayNumber}: {day.dayTitle}
                          </span>
                          <div className="h-px flex-1" style={{ background: 'rgba(124,58,237,0.12)' }} />
                        </div>
                        <div className="space-y-3">
                          {day.messages.map((msg, i) => {
                            if (msg.characterId === '__scene_recap__') {
                              return (
                                <div key={i} className="flex justify-center my-2">
                                  <div className="rounded-xl overflow-hidden relative" style={{ maxWidth: 360, background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.12)' }}>
                                    {msg.imageUrl && <img src={msg.imageUrl} alt="" className="w-full" style={{ aspectRatio: '16/9', objectFit: 'cover' }} />}
                                    <div className="px-3 py-2">
                                      <p className="text-white/50 text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{msg.content}</p>
                                    </div>
                                    {msg.imageUrl && <SaveToAlbumBtn imageUrl={msg.imageUrl} label={msg.content} destinationId={trip.destinationId} companionId={trip.companionId} />}
                                  </div>
                                </div>
                              )
                            }
                            if (msg.content.startsWith('📍') && (msg.imageUrls?.length || msg.imageUrl)) {
                              return (
                                <PlaceFoodCard
                                  key={i}
                                  kind="place"
                                  msg={msg}
                                  destinationId={trip.destinationId}
                                  companionId={trip.companionId}
                                />
                              )
                            }
                            if (msg.content.startsWith('🍽️') && (msg.imageUrls?.length || msg.imageUrl)) {
                              return (
                                <PlaceFoodCard
                                  key={i}
                                  kind="food"
                                  msg={msg}
                                  destinationId={trip.destinationId}
                                  companionId={trip.companionId}
                                />
                              )
                            }
                            if (msg.role === 'user') {
                              return (
                                <div key={i} className="flex justify-end">
                                  <div className="max-w-[80%] rounded-2xl px-4 py-2.5 break-words" style={{ background: '#7C3AED', borderBottomRightRadius: 4 }}>
                                    <p className="text-[13px] leading-relaxed whitespace-pre-wrap text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{msg.content}</p>
                                  </div>
                                </div>
                              )
                            }
                            const segments = parseSegments(msg.content)
                            return (
                              <div key={i} className="flex flex-col gap-1.5">
                                {msg.imageUrl && (
                                  <div className="rounded-xl overflow-hidden relative" style={{ maxWidth: 360, border: '1px solid rgba(255,255,255,0.08)' }}>
                                    <img src={msg.imageUrl} alt="" className="w-full" style={{ aspectRatio: '16/9', objectFit: 'cover' }} />
                                    <SaveToAlbumBtn imageUrl={msg.imageUrl} label={`${companionName} moment`} destinationId={trip.destinationId} companionId={trip.companionId} />
                                  </div>
                                )}
                                {segments.map((seg, j) =>
                                  seg.type === 'action' ? <ActionBeat key={j} text={seg.text} /> : (
                                    <div key={j} className="flex justify-start">
                                      <div className="max-w-[80%] rounded-2xl px-4 py-2.5 break-words" style={{ background: 'rgba(255,255,255,0.06)', borderBottomLeftRadius: 4 }}>
                                        <p className="text-[13px] leading-relaxed whitespace-pre-wrap text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{highlightName(seg.text, activeChar?.name)}</p>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                    <div id={`day-chat-${trip.currentDay}`} className="flex items-center gap-2 mb-3 mt-4">
                      <div className="h-px flex-1" style={{ background: 'rgba(124,58,237,0.25)' }} />
                      <span className="text-[10px] font-semibold tracking-[1.5px] uppercase shrink-0" style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'rgba(167,139,250,0.7)' }}>
                        Day {trip.currentDay}: Now
                      </span>
                      <div className="h-px flex-1" style={{ background: 'rgba(124,58,237,0.25)' }} />
                    </div>
                  </div>
                )}

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

                {/* Departure image */}
                {trip.phase === 'planning' && trip.departureImageUrl && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-5 rounded-2xl overflow-hidden relative"
                    style={{ border: '1px solid rgba(124,58,237,0.15)' }}
                  >
                    <img
                      src={trip.departureImageUrl}
                      alt=""
                      className="w-full"
                      style={{ aspectRatio: '4/3', objectFit: 'cover', opacity: isRegeneratingDeparture ? 0.4 : 1, transition: 'opacity 0.2s' }}
                    />
                    {isRegeneratingDeparture && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ aspectRatio: '4/3' }}>
                        <Loader2 size={28} className="animate-spin text-white/70" />
                      </div>
                    )}
                    <button
                      onClick={regenerateDepartureImage}
                      disabled={isRegeneratingDeparture}
                      className="cursor-pointer absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors hover:bg-black/70 disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', color: 'rgba(255,255,255,0.85)', fontFamily: "'Space Grotesk', sans-serif", border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <RefreshCw size={11} className={isRegeneratingDeparture ? 'animate-spin' : ''} />
                      {isRegeneratingDeparture ? 'Regenerating...' : 'Regenerate'}
                    </button>
                    <div className="px-4 py-3" style={{ background: 'rgba(124,58,237,0.06)' }}>
                      <p className="text-white/50 text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        You and {companionName} just landed in {destination.city} {destination.countryEmoji}
                      </p>
                    </div>
                    <SaveToAlbumBtn imageUrl={trip.departureImageUrl} label={`Arrived in ${destination.city}`} destinationId={trip.destinationId} companionId={trip.companionId} />
                  </motion.div>
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
                            className="rounded-xl overflow-hidden relative"
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
                            {msg.imageUrl && <SaveToAlbumBtn imageUrl={msg.imageUrl} label={msg.content} destinationId={trip.destinationId} companionId={trip.companionId} />}
                          </div>
                        </motion.div>
                      )
                    }

                    {/* Place photo card */}
                    if (msg.content.startsWith('📍') && (msg.imageUrls?.length || msg.imageUrl)) {
                      return (
                        <PlaceFoodCard
                          key={i}
                          kind="place"
                          msg={msg}
                          destinationId={trip.destinationId}
                          companionId={trip.companionId}
                        />
                      )
                    }

                    if (msg.content.startsWith('🍽️') && (msg.imageUrls?.length || msg.imageUrl)) {
                      return (
                        <PlaceFoodCard
                          key={i}
                          kind="food"
                          msg={msg}
                          destinationId={trip.destinationId}
                          companionId={trip.companionId}
                        />
                      )
                    }

                    if (msg.role === 'user') {
                      return (
                        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
                          <div className="max-w-[80%] rounded-2xl px-4 py-2.5 break-words" style={{ background: '#7C3AED', borderBottomRightRadius: 4 }}>
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
                          className="rounded-xl overflow-hidden relative"
                          style={{ maxWidth: 360, border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                          <img src={msg.imageUrl} alt="" className="w-full" style={{ aspectRatio: '16/9', objectFit: 'cover' }} />
                          <SaveToAlbumBtn imageUrl={msg.imageUrl} label={`${companionName} moment`} destinationId={trip.destinationId} companionId={trip.companionId} />
                        </motion.div>
                      )}
                      {segments.map((seg, j) =>
                        seg.type === 'action' ? (
                          <ActionBeat key={j} text={seg.text} />
                        ) : (
                          <div key={j} className="flex justify-start">
                            <div className="max-w-[80%] rounded-2xl px-4 py-2.5 break-words" style={{ background: 'rgba(255,255,255,0.06)', borderBottomLeftRadius: 4 }}>
                              <p className="text-[14px] leading-relaxed whitespace-pre-wrap text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                {highlightName(seg.text, activeChar?.name)}
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
                            <div className="max-w-[80%] rounded-2xl px-4 py-2.5 break-words" style={{ background: 'rgba(255,255,255,0.06)', borderBottomLeftRadius: 4 }}>
                              <StreamedText
                                text={seg.text}
                                className="text-[14px] leading-relaxed text-white"
                                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                                highlightWord={activeChar?.name}
                              />
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {isStreaming && !streamedText && (
                    <TypingIndicator
                      avatarUrl={companionPortrait}
                      fallback={companion.character.avatar}
                    />
                  )}
                </div>
                <div ref={chatEndRef} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Controls */}
        {viewMode === 'chat' && (
          <div className="shrink-0 px-5 md:px-[60px] pb-5 pt-3 safe-bottom" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
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
        {renderArcSegments()}

        {/* Companion Settings */}
        <div className="mt-auto pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={() => setShowCompanionSettings(!showCompanionSettings)}
            className="w-full flex items-center gap-2 py-1.5 cursor-pointer"
          >
            {companionPortrait ? (
              <SelfieImg src={companionPortrait} alt="" className="w-6 h-6 rounded-full object-cover" fallback={<div className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ background: '#2D2538' }}>{companion.character.avatar}</div>} />
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

      {/* Companion portrait modal */}
      <AnimatePresence>
        {showPortraitModal && companionPortrait && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPortraitModal(false)}
          >
            <div className="absolute inset-0 bg-black/80" />
            <motion.div
              className="relative max-w-sm w-full rounded-2xl overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <SelfieImg
                src={companionPortrait}
                alt={companionName}
                className="w-full aspect-square object-cover"
                fallback={<div className="w-full aspect-square flex items-center justify-center text-6xl" style={{ background: '#2D2538' }}>{companion.character.avatar}</div>}
              />
              <div className="absolute bottom-0 left-0 right-0 p-4" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                <p className="text-white font-bold text-lg" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{companionName}</p>
              </div>
              <button
                onClick={() => setShowPortraitModal(false)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer bg-black/40 hover:bg-black/60 transition-colors"
              >
                <X size={16} className="text-white" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Trip Progress drawer */}
      <Drawer.Root open={showProgressSheet} onOpenChange={(v) => !v && setShowProgressSheet(false)} snapPoints={[0.6, 0.95]}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/60 z-40" />
          <Drawer.Content
            className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-2xl overflow-hidden"
            style={{ background: '#0C0A14', border: '1px solid rgba(124,58,237,0.2)', borderBottom: 'none' }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
            </div>
            <div className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-2">
                <Map size={14} className="text-purple-400" />
                <h2 className="text-white font-semibold text-base" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Trip Progress
                </h2>
                <span className="text-white/40 text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  · {completedDays}/{totalTripDays} days
                </span>
              </div>
              <button onClick={() => setShowProgressSheet(false)} className="text-white/40 hover:text-white/70 cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-8">
              {renderArcSegments()}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  )
}
