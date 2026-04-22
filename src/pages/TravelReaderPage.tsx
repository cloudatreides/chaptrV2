import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Send, Loader2, MapPin, ChevronRight } from 'lucide-react'
import { useStore } from '../store/useStore'
import { getDestination } from '../data/travel/destinations'
import { getTravelCompanion } from '../data/travel/companions'
import { generateDayItinerary, streamTravelScene, streamTravelChatReply, generateTravelOpeningMessage } from '../lib/claude/travel'
import { parseAffinityDelta } from '../lib/claude/affinity'
import { extractMemories } from '../lib/claude/memory'
import { generateSceneImage as generateImage } from '../lib/togetherAi'
import { DayTransition } from '../components/travel/DayTransition'
import { TripComplete } from '../components/travel/TripComplete'
import type { ChatMessage, TripScene } from '../store/useStore'

type ViewMode = 'chat' | 'scene' | 'transition' | 'day-start' | 'day-end' | 'complete'

export function TravelReaderPage() {
  const navigate = useNavigate()
  const store = useStore()
  const {
    activeTripId, travelTrips, activeCharacterId, characters,
    addTravelPlanningMessage, addTravelDayChatMessage, updateTripItinerary,
    setTripScene, setTripSceneImage, advanceTravelScene, advanceTravelDay,
    setTripPhase, updateTravelAffinity, addCompanionMemory, addTravelEngagementTime,
    completeTrip, resetTrip, setIsStreaming, isStreaming,
  } = store

  const trip = activeTripId ? travelTrips[activeTripId] : null
  const destination = trip ? getDestination(trip.destinationId) : null
  const companion = trip ? getTravelCompanion(trip.companionId) : null
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
  const chatEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const engagementRef = useRef<number>(Date.now())

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
        setStreamedText(full)
      }

      const parsed = parseAffinityDelta(full)
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

  async function handleStartExploring() {
    if (!trip || !destination || isGeneratingItinerary) return
    setIsGeneratingItinerary(true)
    setViewMode('transition')

    try {
      const day = await generateDayItinerary({
        destinationId: trip.destinationId,
        companionId: trip.companionId,
        companionSliders: trip.companionSliders,
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
    const scene = getCurrentScene()
    if (!scene || !trip || !destination || !companion) return

    setViewMode('scene')
    setSceneProse('')
    setIsStreaming(true)
    abortRef.current = new AbortController()

    if (!trip.sceneImages[scene.id]) {
      generateTravelImage(scene.imagePrompt, scene.protagonistVisible ? activeChar?.selfieUrl : undefined)
        .then((url) => { if (url) setTripSceneImage(scene.id, url) })
        .catch(() => {})
    }

    try {
      const stream = streamTravelScene({
        scene,
        destination,
        companionId: trip.companionId,
        companionSliders: trip.companionSliders,
        tripContext: buildTripContext(),
        recentChat: trip.dayChatHistories[trip.currentDay] ?? [],
        playerName: activeChar?.name ?? null,
        bio: activeChar?.bio ?? null,
        signal: abortRef.current.signal,
      })

      let full = ''
      for await (const chunk of stream) {
        full += chunk
        setSceneProse(full)
      }

      setTripScene(scene.id, { prose: full })
    } catch (e: any) {
      if (e.name !== 'AbortError') console.error('Scene streaming error:', e)
    } finally {
      setIsStreaming(false)
    }
  }

  function handleContinueToChat() {
    setViewMode('chat')
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

  async function generateTravelImage(prompt: string, selfieUrl?: string | null): Promise<string | null> {
    try {
      return await generateImage({
        prompt,
        width: 768,
        height: 432,
        referenceImageUrl: selfieUrl ?? undefined,
        includesProtagonist: !!selfieUrl,
        protagonistGender: activeChar?.gender,
      })
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
          {companion.character.staticPortrait ? (
            <img src={companion.character.staticPortrait} alt="" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: '#2D2538' }}>
              {companion.character.avatar}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {companion.character.name}
            </p>
            <p className="text-white/40 text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {destination.countryEmoji} {destination.city} — {trip.phase === 'planning' ? 'Planning' : `Day ${trip.currentDay}`}
            </p>
          </div>
          {trip.phase !== 'planning' && currentScene && (
            <div className="flex items-center gap-1.5 text-white/30">
              <MapPin size={12} />
              <span className="text-xs truncate max-w-[120px]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {currentScene.location}
              </span>
            </div>
          )}
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
                type="end"
                onContinue={() => setViewMode('chat')}
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
            {viewMode === 'scene' && currentScene && (
              <motion.div
                key={`scene-${currentScene.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-5 md:px-[60px] py-6"
              >
                {/* Scene Image */}
                {trip.sceneImages[currentScene.id] && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-xl overflow-hidden mb-5"
                    style={{ aspectRatio: '16/9' }}
                  >
                    <img
                      src={trip.sceneImages[currentScene.id]}
                      alt={currentScene.location}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                )}

                {/* Scene Meta */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-white/30 text-xs uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {currentScene.timeOfDay}
                  </span>
                  <span className="text-white/20">·</span>
                  <span className="text-white/50 text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {currentScene.location}
                  </span>
                </div>

                {/* Prose */}
                <div
                  className="text-white/80 text-[15px] leading-relaxed mb-6 whitespace-pre-wrap"
                  style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
                >
                  {sceneProse || currentScene.prose || ''}
                </div>

                {/* Scene Actions */}
                {!isStreaming && (sceneProse || currentScene.prose) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row gap-3"
                  >
                    <button
                      onClick={handleContinueToChat}
                      className="flex-1 py-3 rounded-xl text-white font-medium text-sm cursor-pointer"
                      style={{ fontFamily: "'Space Grotesk', sans-serif", background: 'linear-gradient(135deg, #7C3AED, #c84b9e)' }}
                    >
                      Chat with {companion.character.name}
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Chat View */}
            {viewMode === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-5 md:px-[60px] py-4"
              >
                {/* Messages */}
                <div className="space-y-4">
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className="max-w-[80%] rounded-2xl px-4 py-2.5"
                        style={{
                          background: msg.role === 'user' ? '#7C3AED' : 'rgba(255,255,255,0.06)',
                          borderBottomRightRadius: msg.role === 'user' ? 4 : undefined,
                          borderBottomLeftRadius: msg.role !== 'user' ? 4 : undefined,
                        }}
                      >
                        <p
                          className="text-[14px] leading-relaxed"
                          style={{
                            fontFamily: "'Space Grotesk', sans-serif",
                            color: msg.role === 'user' ? '#fff' : 'rgba(255,255,255,0.8)',
                          }}
                        >
                          {msg.content}
                        </p>
                      </div>
                    </motion.div>
                  ))}

                  {/* Streaming indicator */}
                  {isStreaming && streamedText && (
                    <div className="flex justify-start">
                      <div
                        className="max-w-[80%] rounded-2xl px-4 py-2.5"
                        style={{ background: 'rgba(255,255,255,0.06)', borderBottomLeftRadius: 4 }}
                      >
                        <p className="text-[14px] leading-relaxed text-white/80" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          {parseAffinityDelta(streamedText).content}
                        </p>
                      </div>
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
            {/* Suggestions */}
            {suggestions.length > 0 && !isStreaming && (
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

            {/* Action buttons */}
            {!isStreaming && trip.phase === 'planning' && messages.length >= 6 && (
              <button
                onClick={handleStartExploring}
                className="w-full mb-3 py-2.5 rounded-xl text-sm font-medium text-white cursor-pointer"
                style={{ fontFamily: "'Space Grotesk', sans-serif", background: 'linear-gradient(135deg, #7C3AED, #c84b9e)' }}
              >
                Start exploring {destination.city}
              </button>
            )}

            {!isStreaming && trip.phase === 'day' && currentScene && !currentScene.prose && (
              <button
                onClick={handlePlayScene}
                className="w-full mb-3 py-2.5 rounded-xl text-sm font-medium text-white cursor-pointer"
                style={{ fontFamily: "'Space Grotesk', sans-serif", background: 'linear-gradient(135deg, #7C3AED, #c84b9e)' }}
              >
                <span className="flex items-center justify-center gap-2">
                  <MapPin size={14} />
                  Go to {currentScene.location}
                </span>
              </button>
            )}

            {!isStreaming && trip.phase === 'day' && currentScene?.prose && (
              <button
                onClick={handleNextScene}
                className="w-full mb-3 py-2.5 rounded-xl text-sm font-medium text-white cursor-pointer flex items-center justify-center gap-2"
                style={{ fontFamily: "'Space Grotesk', sans-serif", background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.2)' }}
              >
                Next <ChevronRight size={14} />
              </button>
            )}

            {!isStreaming && trip.phase === 'recap' && (
              <button
                onClick={handleNextDay}
                className="w-full mb-3 py-2.5 rounded-xl text-sm font-medium text-white cursor-pointer"
                style={{ fontFamily: "'Space Grotesk', sans-serif", background: 'linear-gradient(135deg, #7C3AED, #c84b9e)' }}
              >
                {trip.currentDay >= destination.tripDays ? 'Complete your trip' : `Start Day ${trip.currentDay + 1}`}
              </button>
            )}

            {/* Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend() }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Message ${companion.character.name}...`}
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
    </div>
  )
}
