import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Send, Loader2, MapPin, ChevronRight, Lock, Check, Play, ChevronDown, ChevronUp, Plus, X, Volume2, VolumeX, ImagePlus, RefreshCw, Map, SkipBack, SkipForward, Bookmark } from 'lucide-react'
import { Drawer } from 'vaul'
import { useStore } from '../store/useStore'
import { getDestination } from '../data/travel/destinations'
import { getTravelCompanion } from '../data/travel/companions'
import { generateDayItinerary, streamTravelScene, streamTravelChatReply, generateTravelOpeningMessage } from '../lib/claude/travel'
import { parseAffinityDelta } from '../lib/claude/affinity'
import { parsePlaceTags, parseFoodTags, fetchPlaceImage, fetchFoodImage } from '../lib/imageSearch'
import { extractMemories } from '../lib/claude/memory'
import { generateSceneImage as generateImage, generateCharacterPortrait, persistImage } from '../lib/togetherAi'
import { generateNanoBananaImage } from '../lib/nanoBanana'
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
import { ImageLightbox } from '../components/ImageLightbox'

interface LightboxState { imageUrl: string; label: string; urls?: string[]; labels?: string[] }

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

function PlaceFoodCard({ kind, msg, destinationId, companionId, onImageClick }: {
  kind: 'place' | 'food'
  msg: ChatMessage
  destinationId: string
  companionId: string
  onImageClick: (state: LightboxState) => void
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
          onImageClick={(i) => onImageClick({ imageUrl: urls[i], label: labels[i] ?? labels[0] ?? '', urls, labels })}
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

function CarouselWithIndex({ urls, labels, onIndexChange, onImageClick }: {
  urls: string[]
  labels: string[]
  onIndexChange: (i: number) => void
  onImageClick?: (i: number) => void
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
              className={`w-full h-full object-cover ${onImageClick ? 'cursor-zoom-in' : ''}`}
              onClick={() => onImageClick?.(i)}
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

/** Asymptotic fake-progress for image generation. The Nano Banana proxy
 *  doesn't stream progress, so we simulate it: progress = 1 - exp(-t/tau)
 *  with tau ~= 8s, capped at 95% so it never reads "100% but still waiting".
 *  When the actual image arrives the parent unmounts this component and the
 *  bar disappears, which reads as completion. */
function SceneImageProgress({ label, compact = false }: { label?: string; compact?: boolean }) {
  const [pct, setPct] = useState(0)
  useEffect(() => {
    const start = performance.now()
    const tau = 8000
    const tick = () => {
      const t = performance.now() - start
      const p = 1 - Math.exp(-t / tau)
      setPct(Math.min(95, Math.round(p * 100)))
    }
    tick()
    const id = window.setInterval(tick, 200)
    return () => window.clearInterval(id)
  }, [])

  if (compact) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4">
        <div className="w-full max-w-[200px]">
          <div className="w-full h-1 rounded-full overflow-hidden mb-1.5" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <motion.div
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="h-full"
              style={{ background: 'linear-gradient(90deg, #7C3AED, #c84b9e)' }}
            />
          </div>
          <p className="text-white/55 text-[10px] text-center" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {pct}%
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6">
      <Loader2 size={28} className="animate-spin text-purple-300/80" />
      <div className="text-center w-full max-w-xs">
        {label && (
          <p className="text-white/80 text-sm font-medium mb-2.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {label}
          </p>
        )}
        <div className="w-full h-1.5 rounded-full overflow-hidden mb-1.5" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <motion.div
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="h-full"
            style={{ background: 'linear-gradient(90deg, #7C3AED, #c84b9e)' }}
          />
        </div>
        <p className="text-white/40 text-[11px]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {pct}% — usually 5–15 seconds
        </p>
      </div>
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
    setDepartureImage, saveIntimateMoment, setTripDayStartImage,
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
  const [lightbox, setLightbox] = useState<LightboxState | null>(null)
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
      // Nano Banana (Gemini 2.5 Flash Image) accepts multi-image refs
      // contextually. Resolve relative paths to absolute for the proxy.
      const toAbs = (u: string) => u.startsWith('http') ? u : `${window.location.origin}${u}`
      const refs = [activeChar?.selfieUrl, companionPortrait]
        .filter((u): u is string => !!u)
        .map(toAbs)
      const timeout = new Promise<{ error: string }>((resolve) =>
        setTimeout(() => resolve({ error: 'timeout after 45s' }), 45000)
      )
      const result = await Promise.race([
        generateNanoBananaImage({
          prompt,
          referenceImageUrls: refs,
          model: 'gemini-2.5-flash-image',
        }),
        timeout,
      ])
      if ('imageDataUrl' in result) {
        // Persist before storing — see DepartureScreen.tsx for rationale.
        const persistKey = `departure|${prompt}|${refs.join('|')}`
        const persisted = await persistImage(result.imageDataUrl, persistKey, 'departures')
        if (persisted) {
          setDepartureImage(persisted)
        } else {
          console.warn('[Departure regenerate] Persist failed — skipping to protect state')
        }
      } else {
        console.warn('[Departure regenerate] Nano Banana failed:', result.error)
      }
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
  // Tracks whether the chat-mount auto-retry for the departure image has
  // already fired this session, so we don't loop on Supabase failures.
  const departureAutoRetriedRef = useRef(false)

  const [showAmbientLabel, setShowAmbientLabel] = useState(true)
  const [showPortraitModal, setShowPortraitModal] = useState(false)
  const [showProgressSheet, setShowProgressSheet] = useState(false)

  // Unified state for all wind-down moments (cuddle, closer, bath, undress).
  // Each moment shows in the same modal — single state replaces 6+ separate
  // vars from before, and adding a new wind-down action is a one-liner now.
  type WindDownKind = 'cuddle' | 'closer' | 'bath' | 'undress'
  interface WindDownMoment {
    kind: WindDownKind
    label: string
    imageUrl: string | null
    loading: boolean
    savedId: string | null
  }
  const [windDownMoment, setWindDownMoment] = useState<WindDownMoment | null>(null)

  // Show departure screen for fresh trips (handles Zustand hydration race —
  // useState initializer may fire before store rehydrates from localStorage)
  useEffect(() => {
    if (!trip || viewMode === 'departure') return
    if (trip.phase === 'planning' && trip.planningChatHistory.length === 0) {
      setViewMode('departure')
    }
  }, [trip?.phase, trip?.planningChatHistory.length])

  // Auto-recover the departure image when the user lands in chat without
  // one. Cause: DepartureScreen auto-advances after 8s max, but Nano Banana
  // can take up to 45s and persist to Supabase Storage adds another 1–3s.
  // If the gen+persist takes longer than 8s OR if persist fails (Storage
  // outage), the user lands in chat with no image and no loading state.
  // This kicks off a fresh gen from the chat side so the image fills in
  // organically while they read the opening message. Fires at most once
  // per mount via the ref guard so a Supabase outage doesn't loop forever.
  useEffect(() => {
    if (!trip || !destination || !companionName) return
    if (viewMode !== 'chat') return
    if (trip.phase !== 'planning') return
    if (trip.departureImageUrl) return
    if (isRegeneratingDeparture) return
    if (departureAutoRetriedRef.current) return
    departureAutoRetriedRef.current = true
    regenerateDepartureImage()
  }, [viewMode, trip?.phase, trip?.departureImageUrl])

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

  // Per-day AI day-start backdrop. Day 1 keeps the static heroImage —
  // continuity with the destination picker. Day 2+ generates a cinematic
  // anime establishing shot using the day's theme + first scene's
  // location/timeOfDay + city, with twin + companion refs. Caches per day
  // on the trip so we never re-render. heroImage stays underneath as the
  // immediate fallback so the page is never blank during the 5–15s gen.
  useEffect(() => {
    if (viewMode !== 'day-start') return
    if (!trip || !destination || !companion) return
    if (trip.currentDay < 2) return  // Day 1 keeps static
    if (trip.dayStartImages?.[trip.currentDay]) return  // already cached

    const day = trip.itinerary.days.find((d) => d.dayNumber === trip.currentDay)
    if (!day) return
    const firstScene = day.scenes?.[0]
    const sceneLocation = firstScene?.location ?? destination.city
    const timeOfDay = firstScene?.timeOfDay ?? 'morning'
    const dayTheme = day.theme ?? `Day ${trip.currentDay}`

    const companionDesc = companionVisualDesc
      .split(',').slice(0, 4).join(',')
      .replace(/^(anime style|dark|cyberpunk[^,]*|fantasy[^,]*|thriller[^,]*|sci-fi[^,]*)\s*(portrait|illustration|concept art)\s*(portrait\s*)?of\s*/i, '')
      .trim()
    const playerGender = activeChar?.gender === 'male' ? 'a young man' : 'a young woman'
    const prompt = `anime illustration, cel-shaded, cinematic wide establishing shot of ${sceneLocation} in ${destination.city}, Day ${trip.currentDay} ${timeOfDay} atmosphere matching the day's theme of "${dayTheme}". ${playerGender} and ${companionDesc} in the foreground walking together from behind into the scene, both small relative to the city around them. Detailed background, atmospheric lighting, vibrant anime art, no text or signage in foreign script that would distort, ONLY these two people in the foreground`

    let cancelled = false
    ;(async () => {
      const url = await generateTravelImage(prompt, activeChar?.selfieUrl)
      if (cancelled || !url) return
      setTripDayStartImage(trip.currentDay, url)
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, trip?.currentDay])

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
        relationship: trip.relationship,
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
        relationship: trip.relationship,
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

  // Soften the visualizer input so we don't hand Gemini's safety filter the
  // exact words that'll make it refuse. Two effects:
  //   1) Pull just the *action beats* (text in asterisks) — those describe
  //      what the camera sees, which is what we want anyway. Skip dialogue.
  //   2) Replace known-spicy verbs with anime-safe synonyms. Same scene,
  //      tamer wording. Pin → lean toward, fondle → embrace, etc.
  function sanitizeShowMeContent(raw: string): string {
    const beats = Array.from(raw.matchAll(/\*([^*]+)\*/g)).map((m) => m[1].trim())
    let body = beats.length > 0 ? beats.join('. ') : raw.replace(/\*[^*]*\*/g, '').trim()
    const replacements: [RegExp, string][] = [
      [/\bfondl(e|ing|es|ed)\b/gi, 'hold close'],
      [/\bgrop(e|ing|es|ed)\b/gi, 'embrace'],
      [/\bpin(?:s|ned|ning)?\s+(?:you|me|her|him|them)\b/gi, 'leans toward $&'.replace('$&', '')],
      [/\bpin(?:s|ned|ning)?\b/gi, 'lean close'],
      [/\bundress(?:ing|ed|es)?\b/gi, 'leaning in'],
      [/\bnaked|nude|topless|bare\s*chest(?:ed)?\b/gi, ''],
      [/\bcleav(age|y)\b/gi, 'collarbone'],
      [/\bshirt\s*(off|up)\b/gi, 'collar undone'],
      [/\bI\s*(want|need)\s+you\s+(now|right\s+now|so\s+bad)\b/gi, 'thinking of you'],
      [/\b(want|need)\s+to\s+(touch|feel)\s+you\b/gi, 'lean close to you'],
      [/\bsex|sexy|sexual(?:ly)?\b/gi, 'romantic'],
      [/\bmake\s*out|making\s*out\b/gi, 'kissing softly'],
      [/\b(hard|deep|hungry)\s+kiss\b/gi, 'soft kiss'],
      [/\bagainst\s+the\s+wall\b/gi, 'in the alcove'],
    ]
    for (const [re, sub] of replacements) body = body.replace(re, sub)
    body = body.replace(/\s{2,}/g, ' ').trim()
    return body.slice(0, 180)
  }

  async function handleShowMe() {
    if (!trip || !companion || !destination || isGeneratingChatImage || isStreaming) return

    const isPlanning = trip.phase === 'planning'
    const msgs = isPlanning ? trip.planningChatHistory : (trip.dayChatHistories[trip.currentDay] ?? [])
    const lastCompanionMsg = [...msgs].reverse().find((m) => m.role === 'character')
    if (!lastCompanionMsg) return

    setIsGeneratingChatImage(true)

    const currentScene = getCurrentScene()
    const locationContext = currentScene ? `${currentScene.location}, ${destination.city}` : destination.city
    const sanitized = sanitizeShowMeContent(lastCompanionMsg.content)
    const fullPrompt = sanitized
      ? `tasteful anime illustration, cel-shaded, cinematic scene: ${sanitized}. Setting: ${locationContext}. Atmospheric lighting, detailed background, vibrant anime art, fully clothed, no nudity`
      : `tasteful anime illustration, cel-shaded, atmospheric scene at ${locationContext}, ${currentScene?.activity ?? 'travelers exploring together'}, atmospheric lighting, detailed background, vibrant anime art`
    // Pure scene fallback: zero dialogue, just place + activity. Almost
    // always passes Gemini's filter even when the chat got spicy.
    const fallbackPrompt = `tasteful anime illustration, cel-shaded, atmospheric establishing shot of ${locationContext}, ${currentScene?.activity ?? 'a quiet moment in this place'}, atmospheric lighting, detailed background, vibrant anime art, no people in foreground`

    const addImageToChat = (url: string) => {
      const imageMsg: ChatMessage = {
        role: 'character',
        content: `📸 Here's what I'm talking about...`,
        characterId: trip.companionId,
        timestamp: Date.now(),
        imageUrl: url,
      }
      if (isPlanning) addTravelPlanningMessage(imageMsg)
      else addTravelDayChatMessage(trip.currentDay, imageMsg)
    }

    try {
      // Pass 1: sanitized companion-message + scene.
      let url = await generateTravelImage(fullPrompt, activeChar?.selfieUrl)
      if (!url) {
        // Pass 2: location-only fallback (no companion message at all). The
        // user paid for an image, so we'd rather show a tasteful establishing
        // shot than refund silently — the chat already carries the spicy
        // content via the dialogue itself.
        console.warn('[Show me] sanitized prompt was refused — retrying with location-only fallback')
        url = await generateTravelImage(fallbackPrompt, undefined, false)
      }
      if (url) {
        addImageToChat(url)
      } else {
        console.warn('[Show me] both passes returned null — likely persist failure or sustained content refusal')
        setToastMessage('Couldn\'t paint that one. Try a different scene beat.')
        setTimeout(() => setToastMessage(null), 4000)
      }
    } catch (e) {
      console.error('Show me image error:', e)
      setToastMessage('Couldn\'t generate the image — try again')
      setTimeout(() => setToastMessage(null), 3000)
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
      const giftRefs: string[] = []
      if (companionPortrait) {
        const abs = companionPortrait.startsWith('http') ? companionPortrait : `${window.location.origin}${companionPortrait}`
        giftRefs.push(abs)
      }
      const [giftImageResult, replyStream] = await Promise.all([
        generateNanoBananaImage({
          prompt: companionPortrait
            ? `Anime-style portrait illustration. The reference image shows the travel companion — render them with the same face, hair, and gender. ${portraitPrompt}`
            : portraitPrompt,
          referenceImageUrls: giftRefs,
          model: 'gemini-2.5-flash-image',
        }),
        streamTravelChatReply({
          companionId: trip.companionId,
          companionSliders: trip.companionSliders,
          companionRemix: trip.companionRemix,
        relationship: trip.relationship,
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
      // Persist the base64 imageDataUrl to Supabase storage so we store a
      // ~120-char URL in chat state, not a ~400KB blob. Without this, a few
      // gift images blow the cloud-sync payload past Supabase's request
      // size limit, saves fail silently, and the whole trip's chat history
      // stops syncing across browsers / disappears on refresh.
      const rawImageDataUrl = 'imageDataUrl' in giftImageResult ? giftImageResult.imageDataUrl : null
      const imageUrl = rawImageDataUrl
        ? await persistImage(rawImageDataUrl, `gift-${trip.companionId}-${Date.now()}`, 'scenes')
        : null

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
        relationship: trip.relationship,
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

  async function handleGetKiss() {
    if (!trip || !companion || !destination || isGeneratingChatImage || isStreaming) return

    setIsGeneratingChatImage(true)
    const isPlanning = trip.phase === 'planning'
    const addMsg = isPlanning ? addTravelPlanningMessage : (msg: ChatMessage) => addTravelDayChatMessage(trip.currentDay, msg)

    addMsg({ role: 'user', content: `💋 Leaning in slowly to kiss ${companionName}...`, characterId: 'player', timestamp: Date.now() })

    const currentScene = getCurrentScene()
    const locationContext = currentScene ? `${currentScene.location}, ${destination.city}` : destination.city
    const companionDesc = companionVisualDesc
      .split(',').slice(0, 4).join(',')
      .replace(/^(anime style|dark|cyberpunk[^,]*|fantasy[^,]*|thriller[^,]*|sci-fi[^,]*)\s*(portrait|illustration|concept art)\s*(portrait\s*)?of\s*/i, '')
      .trim()
    const playerGender = activeChar?.gender === 'male' ? 'a young man' : 'a young woman'
    const scenePrompt = `anime illustration, cel-shaded, romantic close-up of two people sharing a soft tender kiss in ${locationContext}. ${playerGender} and ${companionDesc}. Eyes closed, gentle expressions, hands on cheeks, warm golden hour lighting, soft cinematic bokeh, intimate emotional moment, vibrant anime art, ONLY these two people in the image`

    try {
      const [imageUrl, replyStream] = await Promise.all([
        generateTravelImage(scenePrompt, activeChar?.selfieUrl),
        streamTravelChatReply({
          companionId: trip.companionId,
          companionSliders: trip.companionSliders,
          companionRemix: trip.companionRemix,
        relationship: trip.relationship,
          destinationId: trip.destinationId,
          messages: [...(isPlanning ? trip.planningChatHistory : (trip.dayChatHistories[trip.currentDay] ?? [])),
            { role: 'user' as const, content: 'I just leaned in and kissed you softly. React in the moment — surprise turning into warmth, a quiet breath against my lips, then a flirtatious whisper afterward. Keep it tender, not crude.', characterId: 'player', timestamp: Date.now() }],
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

      const { cleanText: kissClean, places: kissPlaces } = parsePlaceTags(full)
      const parsed = parseAffinityDelta(kissClean)
      if (imageUrl) {
        addMsg({ role: 'character', content: parsed.content, characterId: trip.companionId, timestamp: Date.now(), imageUrl })
      } else {
        addMsg({ role: 'character', content: parsed.content, characterId: trip.companionId, timestamp: Date.now() })
        setToastMessage('Image couldn\'t be generated')
        setTimeout(() => setToastMessage(null), 3000)
      }
      updateTravelAffinity(Math.max(parsed.delta, 5))
      if (parsed.suggestions) setSuggestions(parsed.suggestions)
      if (kissPlaces.length > 0 && destination) {
        fetchPlaceImage(kissPlaces[0], destination.city).then((placeUrl) => {
          if (placeUrl) addMsg({ role: 'character', content: `📍 ${kissPlaces[0]}`, characterId: trip.companionId, timestamp: Date.now(), imageUrl: placeUrl })
        }).catch(() => {})
      }
    } catch (e) {
      console.error('Get a kiss error:', e)
      setIsStreaming(false)
      setStreamedText('')
    } finally {
      setIsGeneratingChatImage(false)
    }
  }

  // Wind-down chat actions. Available only when trip.phase === 'recap', i.e.
  // after the day's scenes are done. Each kind has a label, prompt builder,
  // and affinity bump. Adding a new wind-down action = one entry here.
  function buildWindDownConfig(kind: WindDownKind) {
    if (!destination) return null
    const companionDesc = companionVisualDesc
      .split(',').slice(0, 4).join(',')
      .replace(/^(anime style|dark|cyberpunk[^,]*|fantasy[^,]*|thriller[^,]*|sci-fi[^,]*)\s*(portrait|illustration|concept art)\s*(portrait\s*)?of\s*/i, '')
      .trim()
    const playerGender = activeChar?.gender === 'male' ? 'a young man' : 'a young woman'
    const city = destination.city

    if (kind === 'cuddle') {
      return {
        label: 'Cuddle',
        affinityBump: 5,
        prompt: `anime illustration, cel-shaded, romantic close-up of two people cuddling tenderly under a soft white duvet in a cozy hotel bed in ${city}. ${playerGender} and ${companionDesc}. Bare shoulders just visible above the sheets — the duvet pulled high across both of their chests so only their faces, hair, and shoulders are showing, everything below the collarbones tastefully hidden under the bedding. Foreheads touching, eyes closed peacefully, gentle content smiles, soft warm bedside lamplight, intimate post-romance tenderness, vibrant anime art, ONLY these two people in the image, modest tasteful framing, no exposed skin below the shoulders`,
      }
    }

    if (kind === 'closer') {
      // Randomized variant pool — same prompts as the previous Get Closer
      // action so every tap reads as a distinct moment, not "another bed".
      const variants: { label: string; build: () => string }[] = [
        {
          label: 'Hand on shoulder',
          build: () => `anime illustration, cel-shaded, intimate close-up of two people lying face to face under a soft white duvet in a hotel bed in ${city}, both undressed underneath the sheet. ${playerGender} and ${companionDesc}. Their fingers are intertwined above the sheet between them, the second person's free hand resting tenderly on the first's bare shoulder. Sheet draped low across their chests — for the woman in the pair: slight cleavage and bare collarbones visible above the sheet; for the man in the pair: bare upper chest and a hint of abs visible where the sheet sits at his ribcage. Both with soft lingering smiles, eyes half-lidded and looking into each other. Warm bedside lamplight, golden glow on bare skin, modest tasteful framing — the sheet still fully covers everything below the lower ribs, no nudity, slow-burning romantic tension, vibrant anime art, ONLY these two people in the image`,
        },
        {
          label: 'Deep kiss, tangled sheets',
          build: () => `anime illustration, cel-shaded, intimate close-up of two people sharing a deep slow kiss in a hotel bed in ${city}, both undressed beneath the tangled sheets. ${playerGender} and ${companionDesc}. One leans over the other, dark hair falling forward to brush their cheek, sheets bunched around their lower bodies — for the woman in the pair: slight cleavage and a bare back visible from this angle; for the man in the pair: bare upper torso and a hint of side abs visible where the sheet has slipped. The second person's hand cupping the first's jaw. Eyes closed, lost in the moment, soft flushed cheeks, warm bedside lamplight on bare skin, modest tasteful framing — the sheet still covers everything below the waist, no nudity, intense romantic tenderness, vibrant anime art, ONLY these two people in the image`,
        },
        {
          label: 'Pinned against the door',
          build: () => `anime illustration, cel-shaded, intimate close-up of two people making out against the inside of a hotel suite door in ${city}, just stumbled in from outside. ${playerGender} and ${companionDesc}. One has the other gently pinned to the door, both hands cradling their face, deep open-mouthed kiss, eyes closed, brows slightly drawn together with intensity. The pinned one's hands gripping the other's shirt at the waist, jackets and bags dropped on the floor beside them. Warm hallway lamplight bleeding past the doorway, soft cinematic shadows, fully clothed but with clothing slightly disheveled, urgent romantic hunger after a long evening out, vibrant anime art, ONLY these two people in the image`,
        },
        {
          label: 'Dawn embrace',
          build: () => `anime illustration, cel-shaded, intimate close-up of two people sleeping wrapped in each other's arms at dawn in a hotel bed in ${city}, both undressed beneath the sheets. ${playerGender} and ${companionDesc}. The first lies on their side, the second curled around them from behind with one arm draped softly across their bare shoulder, fingers tracing along the first person's collarbone. Sheet draped to mid-chest — for the woman in the pair: bare shoulder blade and slight cleavage visible above the sheet; for the man in the pair: bare upper back and a hint of side abs visible. Both peacefully asleep with content half-smiles, pale blue and pink dawn light filtering through curtains glowing on bare skin, modest tasteful framing — the sheet still covers everything below the lower ribs, no nudity, quiet morning intimacy, vibrant anime art, ONLY these two people in the image`,
        },
        {
          label: 'Fingers intertwined',
          build: () => `anime illustration, cel-shaded, intimate overhead shot of two people lying side by side under a soft duvet in a hotel bed in ${city}, both undressed beneath the sheet. ${playerGender} and ${companionDesc}. Their fingers laced together resting between them on the pillow, faces turned toward each other, eyes locked in a soft unspoken conversation, lips slightly parted. Sheet draped to mid-chest — for the woman in the pair: slight cleavage and bare collarbones visible above the sheet; for the man in the pair: bare upper chest and a hint of abs visible at the edge of the sheet. Dim warm bedside lamplight casting soft shadows across their faces and bare skin, modest tasteful framing — the sheet still covers everything below the lower ribs, no nudity, quiet romantic vulnerability, vibrant anime art, ONLY these two people in the image`,
        },
      ]
      const variant = variants[Math.floor(Math.random() * variants.length)]
      return { label: variant.label, affinityBump: 8, prompt: variant.build() }
    }

    if (kind === 'bath') {
      return {
        label: 'Run a bath together',
        affinityBump: 7,
        prompt: `anime illustration, cel-shaded, intimate scene of two young adults relaxing together in a luxurious hotel bubble bath in ${city}. ${playerGender} and ${companionDesc}. Both visible from the shoulders up only, lots of frothy white bubbles covering everything below their collarbones, candles flickering on the tub edge, glasses of wine within reach. Foreheads close together, soft smiles, eyes half-lidded with contentment, steam rising softly. Warm amber candlelight, dim bathroom lamplight, marble tile, eucalyptus on the side. Modest tasteful framing — bubbles fully cover the water surface, only shoulders, necks, faces, and damp hair visible, no nudity, quiet sensual intimacy, vibrant anime art, ONLY these two people in the image`,
      }
    }

    // undress
    return {
      label: 'Undress',
      affinityBump: 9,
      prompt: `anime illustration, cel-shaded, intimate close-up of two young adult lovers in a dimly lit hotel suite in ${city}, slowly undressing each other. ${playerGender} and ${companionDesc}. One stands behind the other, hands sliding the strap of a satin slip dress / open buttoned shirt off the partner's shoulder, mouth pressed softly against the side of their neck. The other's eyes closed, head tilted back against their partner's shoulder, hand reaching back to thread fingers in their hair. The slip dress / shirt slipping low to expose collarbones and the top of one bare shoulder, but still covering chest fully. Warm amber bedside lamplight, soft shadows, slow burning anticipation. Modest tasteful framing — clothing still covers everything below the collarbones, no nudity, sensual slow undressing, vibrant anime art, ONLY these two people in the image`,
    }
  }

  // Single dispatcher for every wind-down action. Generates the image,
  // shows it in the unified modal, bumps affinity. Replaces the previous
  // separate handleCuddle / handleGetCloser flows.
  async function runWindDownAction(kind: WindDownKind) {
    if (!trip || !companion || !destination) return
    if (windDownMoment?.loading) return
    const config = buildWindDownConfig(kind)
    if (!config) return

    setWindDownMoment({ kind, label: config.label, imageUrl: null, loading: true, savedId: null })

    try {
      const url = await generateTravelImage(config.prompt, activeChar?.selfieUrl)
      if (url) {
        setWindDownMoment((prev) => prev ? { ...prev, imageUrl: url, loading: false } : null)
        updateTravelAffinity(config.affinityBump)
      } else {
        setToastMessage(`Couldn't generate the ${config.label.toLowerCase()} image — try again`)
        setTimeout(() => setToastMessage(null), 3000)
        setWindDownMoment(null)
      }
    } catch (e) {
      console.error(`[WindDown ${kind}] image error:`, e)
      setWindDownMoment(null)
    }
  }

  function handleSaveWindDownMoment() {
    if (!windDownMoment?.imageUrl || !trip || !destination) return
    const moment = {
      id: `${windDownMoment.kind}-${Date.now()}`,
      // The store's IntimateMoment.kind is currently typed 'cuddle' | 'closer'.
      // Map bath/undress onto 'closer' for storage so we don't break the
      // existing schema — the label preserves the actual variant.
      kind: (windDownMoment.kind === 'cuddle' ? 'cuddle' : 'closer') as 'cuddle' | 'closer',
      label: windDownMoment.label,
      imageUrl: windDownMoment.imageUrl,
      day: trip.currentDay,
      city: destination.city,
      createdAt: Date.now(),
    }
    saveIntimateMoment(moment)
    setWindDownMoment((prev) => prev ? { ...prev, savedId: moment.id } : null)
    setToastMessage('Saved to memories')
    setTimeout(() => setToastMessage(null), 2000)
  }

  function handleCloseWindDownMoment() {
    setWindDownMoment(null)
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
        relationship: trip.relationship,
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
        relationship: trip.relationship,
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
        relationship: trip.relationship,
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
        relationship: currentTrip.relationship,
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
      // Note: do NOT clear imageLoadingSceneId here. The scene image is
      // generated in a fire-and-forget Promise alongside the prose stream
      // (see imageTriggered branches above) and clears its own loading state
      // in its own .finally(). Clearing here would hide the loader the
      // moment the prose finishes — but Nano Banana usually takes another
      // 5–15s to return the image, leaving a confusing "no image, no
      // loader" gap.
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
        relationship: trip.relationship,
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
        relationship: trip.relationship,
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
          {/* Twin + companion paired avatars — twin sits slightly behind so the
              user always sees themselves alongside the companion they're
              traveling with. */}
          <div className="shrink-0 flex items-center">
            {activeChar && (
              <button
                onClick={() => navigate(`/create-character?edit=${activeChar.id}&next=/travel/trip`)}
                className="w-8 h-8 rounded-full overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                style={{ border: '2px solid #0A0810', marginRight: -10 }}
                title={`Edit ${activeChar.name}`}
                aria-label={`Edit ${activeChar.name}`}
              >
                {activeChar.selfieUrl ? (
                  <SelfieImg src={activeChar.selfieUrl} alt="" className="w-full h-full object-cover" fallback={<div className="w-full h-full flex items-center justify-center text-xs font-semibold" style={{ background: 'rgba(124,58,237,0.2)', color: '#A78BFA' }}>{activeChar.name[0]}</div>} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-semibold" style={{ background: 'rgba(124,58,237,0.2)', color: '#A78BFA' }}>
                    {activeChar.name[0]}
                  </div>
                )}
              </button>
            )}
            <button
              onClick={() => companionPortrait && setShowPortraitModal(true)}
              className={`relative ${companionPortrait ? 'cursor-pointer' : ''}`}
              style={{ border: activeChar ? '2px solid #0A0810' : 'none', borderRadius: 9999 }}
            >
              {companionPortrait ? (
                <SelfieImg src={companionPortrait} alt="" className="w-8 h-8 rounded-full object-cover" fallback={<div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: '#2D2538' }}>{companion.character.avatar}</div>} />
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: '#2D2538' }}>
                  {companion.character.avatar}
                </div>
              )}
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {activeChar ? `${activeChar.name} & ${companionName}` : companionName}
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
          {trip.phase === 'planning' && (() => {
            const userMsgCount = trip.planningChatHistory.filter((m) => m.role === 'user').length
            const ready = planningReady && !isStreaming && !isGeneratingItinerary
            const remaining = Math.max(0, 3 - userMsgCount)
            const tooltip = isGeneratingItinerary
              ? 'Building your itinerary…'
              : isStreaming
                ? 'Wait until the reply finishes'
                : !planningReady
                  ? `Chat ${remaining} more time${remaining === 1 ? '' : 's'} to start exploring`
                  : `Start exploring ${destination.city}`
            return (
              <div className="relative group shrink-0">
                <button
                  onClick={ready ? handleStartExploring : undefined}
                  disabled={!ready}
                  className="h-8 rounded-full flex items-center gap-1.5 px-3 transition-colors enabled:cursor-pointer disabled:cursor-not-allowed"
                  style={{
                    background: ready ? 'linear-gradient(135deg, #7C3AED, #c84b9e)' : 'rgba(124,58,237,0.1)',
                    border: ready ? 'none' : '1px solid rgba(124,58,237,0.25)',
                    opacity: ready ? 1 : 0.55,
                  }}
                  aria-label={`Start exploring ${destination.city}`}
                >
                  <Play size={11} className={ready ? 'text-white' : 'text-purple-300/70'} fill={ready ? 'currentColor' : 'none'} />
                  <span className={`text-[11px] font-medium ${ready ? 'text-white' : 'text-purple-200/80'}`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    <span className="hidden sm:inline">Start exploring</span>
                    <span className="sm:hidden">Explore</span>
                  </span>
                </button>
                {!ready && (
                  <div
                    role="tooltip"
                    className="pointer-events-none absolute top-full mt-2 right-0 px-3 py-1.5 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 text-[11px] text-white/90"
                    style={{ background: '#1A1525', border: '1px solid rgba(124,58,237,0.3)', fontFamily: "'Space Grotesk', sans-serif", boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}
                  >
                    {tooltip}
                  </div>
                )}
              </div>
            )
          })()}
          {trip.phase === 'day' && currentScene?.prose && (() => {
            const dayChatMessages = trip.dayChatHistories[trip.currentDay] ?? []
            const userMsgCount = dayChatMessages.filter((m) => m.role === 'user').length
            const ready = userMsgCount >= 2 && !isStreaming
            const tooltip = isStreaming
              ? 'Wait until the scene reply finishes'
              : userMsgCount < 2
                ? `Chat ${2 - userMsgCount} more time${userMsgCount === 1 ? '' : 's'} to unlock the next scene`
                : 'Next scene'
            return (
              <div className="relative group shrink-0">
                <button
                  onClick={ready ? handleNextScene : undefined}
                  disabled={!ready}
                  className="h-8 rounded-full flex items-center gap-1 px-2.5 transition-colors enabled:cursor-pointer enabled:hover:bg-white/10 disabled:cursor-not-allowed"
                  style={{
                    background: ready ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.025)',
                    border: ready ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.06)',
                    opacity: ready ? 1 : 0.45,
                  }}
                  aria-label="Next scene"
                >
                  <span className="text-[11px] text-white/85 font-medium" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Next</span>
                  <ChevronRight size={11} className="text-white/60" />
                </button>
                {!ready && (
                  <div
                    role="tooltip"
                    className="pointer-events-none absolute top-full mt-2 right-0 px-3 py-1.5 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 text-[11px] text-white/90"
                    style={{ background: '#1A1525', border: '1px solid rgba(255,255,255,0.12)', fontFamily: "'Space Grotesk', sans-serif", boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}
                  >
                    {tooltip}
                  </div>
                )}
              </div>
            )
          })()}
          <motion.div
            animate={!ambientPlaying && showAmbientLabel ? { scale: [1, 1.04, 1] } : {}}
            transition={!ambientPlaying && showAmbientLabel ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : {}}
            className="shrink-0 h-8 rounded-full flex items-center gap-0.5 px-1"
            style={{ background: ambientPlaying ? 'rgba(139,92,246,0.12)' : 'transparent', border: ambientPlaying ? '1px solid rgba(139,92,246,0.2)' : '1px solid rgba(255,255,255,0.08)' }}
          >
            <button
              onClick={() => ambientPlayer.prev()}
              disabled={!ambientPlaying}
              className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-colors hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Previous / restart"
              aria-label="Previous track"
            >
              <SkipBack size={11} className={ambientPlaying ? 'text-purple-300' : 'text-white/40'} />
            </button>
            <button
              onClick={() => {
                const playing = ambientPlayer.toggle(trip.destinationId)
                setAmbientPlaying(playing)
                setShowAmbientLabel(false)
              }}
              className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-colors hover:bg-white/5"
              title={ambientPlaying ? 'Pause ambient' : 'Play ambient'}
              aria-label={ambientPlaying ? 'Pause ambient' : 'Play ambient'}
            >
              {ambientPlaying ? <Volume2 size={13} className="text-purple-400" /> : <VolumeX size={13} className="text-white/40" />}
            </button>
            <button
              onClick={() => ambientPlayer.next()}
              disabled={!ambientPlaying}
              className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-colors hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Next track"
              aria-label="Next track"
            >
              <SkipForward size={11} className={ambientPlaying ? 'text-purple-300' : 'text-white/40'} />
            </button>
            {showAmbientLabel && !ambientPlaying && (
              <span className="text-[11px] text-white/40 pl-0.5 pr-1.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>ambient</span>
            )}
          </motion.div>
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
                dayStartImageUrl={trip.dayStartImages?.[trip.currentDay]}
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
                {/* Hero image with gradient fade. Height stays full while
                    loading so the image doesn't make the page jump when it
                    finally arrives. */}
                <div
                  className="relative w-full overflow-hidden"
                  style={{ height: sceneImg || imageLoadingSceneId === currentScene.id ? 440 : 200 }}
                >
                  {sceneImg && (
                    <>
                      <motion.img
                        src={sceneImg}
                        alt={currentScene.location}
                        className="absolute inset-0 w-full h-full object-cover cursor-zoom-in"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        onClick={() => setLightbox({ imageUrl: sceneImg, label: `${currentScene.location} — ${currentScene.timeOfDay}` })}
                        onError={() => {
                          // Stale ephemeral URL (Together shortlinks expire
                          // after ~1h) or dead Supabase path. Clear the cached
                          // URL so the loading branch re-renders + handlePlayScene
                          // retriggers gen on next visit. Without this the user
                          // is stuck looking at a broken <img> with no recovery.
                          console.warn('[scene image] failed to load, clearing cached URL:', sceneImg)
                          setTripSceneImage(currentScene.id, '')
                        }}
                      />
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{ background: 'linear-gradient(180deg, rgba(10,8,16,0) 60%, rgba(10,8,16,1) 100%)' }}
                      />
                    </>
                  )}

                  {/* Loading state while the scene image generates. Shimmering
                      gradient + visible status copy so users understand it's
                      working, not stuck — typical render is 5–15s. */}
                  {!sceneImg && imageLoadingSceneId === currentScene.id && (
                    <>
                      <div className="absolute inset-0 scene-image-shimmer" />
                      <div
                        className="absolute inset-0"
                        style={{ background: 'linear-gradient(180deg, rgba(10,8,16,0) 60%, rgba(10,8,16,1) 100%)' }}
                      />
                      <SceneImageProgress label={`Painting ${currentScene.location}…`} />
                    </>
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
                  {!isStreaming && (sceneProse || currentScene.prose) && (() => {
                    const sceneImageLoading = !sceneImg && imageLoadingSceneId === currentScene.id
                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col gap-2 pb-8 max-w-[320px]"
                      >
                        <button
                          onClick={handleContinueToChat}
                          disabled={sceneImageLoading}
                          className="py-2.5 px-5 rounded-xl text-white font-medium text-sm cursor-pointer disabled:cursor-not-allowed transition-opacity"
                          style={{
                            fontFamily: "'Space Grotesk', sans-serif",
                            background: sceneImageLoading ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #7C3AED, #c84b9e)',
                            color: sceneImageLoading ? 'rgba(255,255,255,0.4)' : '#fff',
                            border: sceneImageLoading ? '1px solid rgba(255,255,255,0.08)' : 'none',
                          }}
                        >
                          {sceneImageLoading ? (
                            <span className="flex items-center justify-center gap-2">
                              <Loader2 size={14} className="animate-spin" />
                              Painting the scene first…
                            </span>
                          ) : (
                            `Chat with ${companionName}`
                          )}
                        </button>
                      </motion.div>
                    )
                  })()}
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
                className="px-5 md:px-[60px] py-4 max-w-[820px] mx-auto w-full"
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
                                    {msg.imageUrl && <img src={msg.imageUrl} alt="" className="w-full cursor-zoom-in" style={{ aspectRatio: '16/9', objectFit: 'cover' }} onClick={() => setLightbox({ imageUrl: msg.imageUrl!, label: msg.content })} />}
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
                                  onImageClick={setLightbox}
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
                                  onImageClick={setLightbox}
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
                                    <img src={msg.imageUrl} alt="" className="w-full cursor-zoom-in" style={{ aspectRatio: '16/9', objectFit: 'cover' }} onClick={() => setLightbox({ imageUrl: msg.imageUrl!, label: `${companionName} moment` })} />
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

                {/* Loading state when the trip-start image is being
                    generated. Shimmer placeholder at the same 4:3 aspect as
                    the eventual image so the chat doesn't jump when it
                    arrives. Renders during the auto-retry on chat mount or
                    when the user clicks Generate on the failure card below. */}
                {trip.phase === 'planning' && !trip.departureImageUrl && isRegeneratingDeparture && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-5 rounded-2xl overflow-hidden relative"
                    style={{ border: '1px solid rgba(124,58,237,0.18)' }}
                  >
                    <div className="relative w-full" style={{ aspectRatio: '4/3' }}>
                      <div className="absolute inset-0 scene-image-shimmer" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                        <Loader2 size={28} className="animate-spin text-purple-300/80" />
                        <div className="text-center">
                          <p className="text-white/85 text-sm font-medium" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            Painting your arrival in {destination.city}…
                          </p>
                          <p className="text-white/45 text-[11px] mt-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            Usually takes 5–15 seconds
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3" style={{ background: 'rgba(124,58,237,0.06)' }}>
                      <p className="text-white/40 text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        You and {companionName} are arriving in {destination.city} {destination.countryEmoji}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Recovery affordance — only renders if gen has actually
                    failed (auto-retry done, no image, not currently retrying).
                    The auto-retry on chat mount handles the common case;
                    this is the fallback if Supabase Storage is still down or
                    the gen genuinely failed. Same persist guard applies —
                    successful gen sets trip.departureImageUrl, failure shows
                    this card so the user can retry once Storage recovers. */}
                {trip.phase === 'planning' && !trip.departureImageUrl && !isRegeneratingDeparture && departureAutoRetriedRef.current && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-5 rounded-2xl overflow-hidden p-4 flex items-center gap-3"
                    style={{ border: '1px dashed rgba(124,58,237,0.25)', background: 'rgba(124,58,237,0.04)' }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-white/70 text-xs font-medium" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        Trip start image didn't generate
                      </p>
                      <p className="text-white/40 text-[11px] mt-0.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        The airport-gate scene with you and {companionName} couldn't save. Try again.
                      </p>
                    </div>
                    <button
                      onClick={regenerateDepartureImage}
                      disabled={isRegeneratingDeparture}
                      className="shrink-0 cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-medium transition-colors hover:bg-purple-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ background: 'rgba(124,58,237,0.18)', color: '#DDD6FE', fontFamily: "'Space Grotesk', sans-serif", border: '1px solid rgba(124,58,237,0.4)' }}
                    >
                      <RefreshCw size={11} />
                      Try again
                    </button>
                  </motion.div>
                )}

                {/* Departure image — constrained card. Click to open
                    full-size in the lightbox. */}
                {trip.phase === 'planning' && trip.departureImageUrl && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-5 rounded-2xl overflow-hidden relative max-w-[360px]"
                    style={{ border: '1px solid rgba(124,58,237,0.15)' }}
                  >
                    <button
                      type="button"
                      onClick={() => trip.departureImageUrl && setLightbox({ imageUrl: trip.departureImageUrl, label: `Arrived in ${destination.city}` })}
                      className="block w-full cursor-zoom-in"
                      title="Tap to view full size"
                    >
                      <img
                        src={trip.departureImageUrl}
                        alt=""
                        className="w-full"
                        style={{ aspectRatio: '4/3', objectFit: 'cover', opacity: isRegeneratingDeparture ? 0.4 : 1, transition: 'opacity 0.2s' }}
                      />
                    </button>
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
                                className="w-full cursor-zoom-in"
                                style={{ aspectRatio: '16/9', objectFit: 'cover' }}
                                onClick={() => setLightbox({ imageUrl: msg.imageUrl!, label: msg.content })}
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
                          onImageClick={setLightbox}
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
                          onImageClick={setLightbox}
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
                          <img src={msg.imageUrl} alt="" className="w-full cursor-zoom-in" style={{ aspectRatio: '16/9', objectFit: 'cover' }} onClick={() => setLightbox({ imageUrl: msg.imageUrl!, label: `${companionName} moment` })} />
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

                  {/* Image loading shimmer with fake-progress bar */}
                  {isGeneratingChatImage && (
                    <div className="w-full max-w-[360px] rounded-xl overflow-hidden relative">
                      <div className="w-full aspect-[16/9] scene-image-shimmer rounded-xl" />
                      <SceneImageProgress compact />
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
          <div className="shrink-0 px-5 md:px-[60px] pb-6 md:pb-8 pt-4 safe-bottom max-w-[820px] mx-auto w-full" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
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

            {/* Actions Panel — every action visible at all times. Each is
                tagged with the phase it belongs to. Actions whose phase
                doesn't match the current trip phase are greyed + disabled,
                with a tooltip explaining when they're available. This makes
                the full surface discoverable from day one without letting
                users misuse out-of-context actions. */}
            <AnimatePresence>
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="mb-2"
                >
                  {(() => {
                    type ActionPhase = 'day' | 'recap'
                    const currentPhase: ActionPhase = trip.phase === 'recap' ? 'recap' : 'day'
                    const lockedHint = (p: ActionPhase) => p === 'recap'
                      ? 'Available during wind down — finish today\'s scenes first.'
                      : 'Used during the day — wait until tomorrow.'

                    const actions: { id: string; emoji: string; label: string; desc: string; cost: number; phase: ActionPhase; handler: () => void }[] = [
                      { id: 'show-me', emoji: '📸', label: 'Show me', desc: 'Visualize the scene', cost: 2, phase: 'day', handler: handleShowMe },
                      { id: 'selfie', emoji: '🤳', label: 'Selfie', desc: 'Snap a pic together', cost: 3, phase: 'day', handler: handleSelfie },
                      { id: 'buy-gift', emoji: '🎁', label: 'Buy a gift', desc: "They'll love it", cost: 5, phase: 'day', handler: handleBuyGift },
                      { id: 'hold-hands', emoji: '💕', label: 'Hold hands', desc: 'A little closer', cost: 4, phase: 'day', handler: handleHoldHands },
                      { id: 'get-kiss', emoji: '💋', label: 'Get a kiss', desc: 'Lean in slowly', cost: 8, phase: 'day', handler: handleGetKiss },
                      { id: 'cuddle', emoji: '🤍', label: 'Cuddle', desc: 'Soft, tender', cost: 50, phase: 'recap', handler: () => runWindDownAction('cuddle') },
                      { id: 'closer', emoji: '💞', label: "Let's get closer", desc: 'Sensual moment', cost: 120, phase: 'recap', handler: () => runWindDownAction('closer') },
                      { id: 'bath', emoji: '🛁', label: 'Run a bath', desc: 'Bubbles, candles', cost: 100, phase: 'recap', handler: () => runWindDownAction('bath') },
                      { id: 'undress', emoji: '👗', label: 'Undress', desc: 'Slow, intimate', cost: 150, phase: 'recap', handler: () => runWindDownAction('undress') },
                    ]
                    return (
                      <div
                        className="grid grid-cols-5 gap-1 p-1.5 rounded-xl"
                        style={{
                          width: 540,
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        {actions.map((action) => {
                          const phaseLocked = action.phase !== currentPhase
                          const busyDisabled = isGeneratingChatImage || (windDownMoment?.loading ?? false)
                          const disabled = phaseLocked || busyDisabled
                          const tooltip = phaseLocked ? lockedHint(action.phase) : action.desc
                          return (
                            <button
                              key={action.id}
                              onClick={() => { if (disabled) return; setShowActions(false); action.handler() }}
                              disabled={disabled}
                              title={tooltip}
                              className="relative flex flex-col items-center gap-0.5 py-2.5 px-3 rounded-lg transition-colors hover:bg-white/5 disabled:cursor-not-allowed enabled:cursor-pointer"
                              style={{
                                fontFamily: "'Space Grotesk', sans-serif",
                                opacity: phaseLocked ? 0.32 : busyDisabled ? 0.4 : 1,
                              }}
                            >
                              <span className="text-lg">{action.emoji}</span>
                              <span className="text-white/80 text-[11px] font-medium">{action.label}</span>
                              <span className="text-white/30 text-[9px] text-center leading-tight">{action.desc}</span>
                              <span className="flex items-center gap-1 text-[9px] mt-0.5">
                                <span className="line-through text-white/65">{action.cost} 💎</span>
                                <span className="font-semibold" style={{ color: '#22c55e' }}>Free</span>
                              </span>
                              {phaseLocked && (
                                <span className="absolute top-1 right-1 text-[8px] leading-none" aria-hidden>🔒</span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    )
                  })()}
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

      {/* Wind-down moment modal — single modal serving cuddle / closer / bath
          / undress. Each kind has its own border tint and label kicker so
          variants read distinctly even though the chrome is identical. */}
      <AnimatePresence>
        {windDownMoment && (() => {
          const m = windDownMoment
          const tint = m.kind === 'cuddle'
            ? { border: 'rgba(236,72,153,0.35)', loaderColor: 'text-pink-300/80', kickerColor: 'text-pink-100', saveBg: 'rgba(236,72,153,0.12)', saveBorder: 'rgba(236,72,153,0.35)', saveColor: '#FBCFE8', continueBg: 'linear-gradient(135deg, #7C3AED, #A78BFA)', glow: '' }
            : m.kind === 'bath'
            ? { border: 'rgba(56,189,248,0.4)', loaderColor: 'text-sky-300/85', kickerColor: 'text-sky-100', saveBg: 'rgba(56,189,248,0.12)', saveBorder: 'rgba(56,189,248,0.4)', saveColor: '#BAE6FD', continueBg: 'linear-gradient(135deg, #0369a1, #38bdf8)', glow: '0 0 60px rgba(56,189,248,0.18)' }
            : m.kind === 'undress'
            ? { border: 'rgba(217,70,239,0.45)', loaderColor: 'text-fuchsia-300/85', kickerColor: 'text-fuchsia-100', saveBg: 'rgba(217,70,239,0.14)', saveBorder: 'rgba(217,70,239,0.45)', saveColor: '#F0ABFC', continueBg: 'linear-gradient(135deg, #a21caf, #d946ef)', glow: '0 0 60px rgba(217,70,239,0.2)' }
            : { border: 'rgba(244,63,94,0.4)', loaderColor: 'text-rose-300/85', kickerColor: 'text-rose-100', saveBg: 'rgba(244,63,94,0.14)', saveBorder: 'rgba(244,63,94,0.4)', saveColor: '#FECACA', continueBg: 'linear-gradient(135deg, #be185d, #f43f5e)', glow: '0 0 60px rgba(244,63,94,0.18)' }

          const titleVerb = m.kind === 'cuddle' ? `Cuddling with ${companionName}`
            : m.kind === 'bath' ? `A bath with ${companionName}`
            : m.kind === 'undress' ? `Undressing with ${companionName}`
            : `A moment with ${companionName}`

          const loadingLabel = m.kind === 'cuddle' ? 'Painting your cuddle moment…'
            : m.kind === 'bath' ? 'Drawing the bath…'
            : m.kind === 'undress' ? 'Painting the moment…'
            : 'Painting the moment…'

          return (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center px-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !m.loading && handleCloseWindDownMoment()}
            >
              <div className="absolute inset-0 bg-black/85" />
              <motion.div
                className="relative max-w-md w-full rounded-2xl overflow-hidden flex flex-col"
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                style={{ border: `1px solid ${tint.border}`, boxShadow: tint.glow, background: '#13101c' }}
              >
                <div className="relative">
                  {m.imageUrl ? (
                    <img
                      src={m.imageUrl}
                      alt={titleVerb}
                      className="w-full aspect-[4/5] object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-[4/5] relative overflow-hidden">
                      <div className="absolute inset-0 scene-image-shimmer" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                        <Loader2 size={28} className={`animate-spin ${tint.loaderColor}`} />
                        <div className="text-center">
                          <p className="text-white/85 text-sm font-medium" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            {loadingLabel}
                          </p>
                          <p className="text-white/45 text-[11px] mt-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            Usually takes 5–15 seconds
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-4" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }}>
                    <p className={`${tint.kickerColor} text-[10px] uppercase tracking-[2px] mb-1`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      Day {trip.currentDay} · {destination.city}
                      {m.kind === 'closer' && m.label && <span className="opacity-70"> · {m.label}</span>}
                    </p>
                    <p className="text-white font-bold text-lg" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {titleVerb}
                    </p>
                  </div>
                  <button
                    onClick={handleCloseWindDownMoment}
                    disabled={m.loading}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center bg-black/45 hover:bg-black/60 transition-colors disabled:opacity-40 disabled:cursor-wait enabled:cursor-pointer"
                    title="Close"
                  >
                    <X size={16} className="text-white" />
                  </button>
                </div>

                <div className="flex gap-2 p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <button
                    onClick={handleSaveWindDownMoment}
                    disabled={!m.imageUrl || m.loading || m.savedId !== null}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-colors disabled:cursor-not-allowed enabled:cursor-pointer"
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      background: m.savedId ? 'rgba(34,197,94,0.12)' : tint.saveBg,
                      border: `1px solid ${m.savedId ? 'rgba(34,197,94,0.4)' : tint.saveBorder}`,
                      color: m.savedId ? '#86efac' : tint.saveColor,
                      opacity: !m.imageUrl || m.loading ? 0.4 : 1,
                    }}
                  >
                    {m.savedId ? (
                      <>
                        <Check size={13} />
                        <span>Saved</span>
                      </>
                    ) : (
                      <>
                        <Bookmark size={13} />
                        <span>Save</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCloseWindDownMoment}
                    disabled={m.loading}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-opacity disabled:cursor-wait enabled:cursor-pointer"
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      background: tint.continueBg,
                      color: '#fff',
                      opacity: m.loading ? 0.4 : 1,
                    }}
                  >
                    <span>Back to chat</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )
        })()}
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
      <ImageLightbox
        imageUrl={lightbox?.imageUrl ?? null}
        label={lightbox?.label ?? ''}
        destinationId={trip?.destinationId ?? ''}
        companionId={trip?.companionId ?? ''}
        urls={lightbox?.urls}
        labels={lightbox?.labels}
        onClose={() => setLightbox(null)}
      />
    </div>
  )
}
