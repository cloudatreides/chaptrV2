import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, ArrowRight } from 'lucide-react'
import { getCharacter, CHARACTERS } from '../data/characters'
import { useStore } from '../store/useStore'
import { useActiveStory } from '../hooks/useActiveStory'
import { streamChatReply, summarizeChat, generateOpeningMessage, extractMemories } from '../lib/claudeStream'
import { generateCharacterPortrait, generateSceneImage } from '../lib/togetherAi'
import { trackEvent } from '../lib/supabase'
import { getAffinityGrowth } from '../lib/affinity'
import { parseAffinityDelta } from '../lib/claudeStream'
import { getUniverseGenre } from '../data/storyData'
import type { SceneCharacter } from '../data/storyData'
import { ChatActionTray } from './ChatActionTray'
import { ChatActionBubble } from './ChatActionBubble'
import { ChatReactionImage } from './ChatReactionImage'
import { useChatActions } from '../hooks/useChatActions'
import type { ChatAction } from '../data/chatActions'

// ─── Mood stages (reused from ChatScene) ───

const MOOD_STAGES: Record<string, string[]> = {
  default: ['guarded', 'warming up', 'opening up', 'vulnerable'],
  sora: ['curious', 'vibing', 'in the groove', 'real talk'],
}

const MOOD_TOOLTIPS: Record<string, { desc: string; hint: string }[]> = {
  default: [
    { desc: 'Still figuring you out. Every word is being weighed.', hint: 'Keep talking — show genuine interest.' },
    { desc: 'The walls are coming down, slowly.', hint: 'Ask questions. Be consistent.' },
    { desc: 'Real thoughts are starting to surface.', hint: 'Stay present. Don\'t push too hard.' },
    { desc: 'Fully open. This is rare for them.', hint: 'You\'ve earned this.' },
  ],
  sora: [
    { desc: 'Intrigued but testing you.', hint: 'Match her energy. Be playful.' },
    { desc: 'She\'s feeling it. Conversation flows naturally.', hint: 'Keep up the momentum.' },
    { desc: 'You two are in sync. She\'s being real.', hint: 'Go deeper. She can handle it.' },
    { desc: 'No filter left. This is pure Sora.', hint: 'You made it here. Don\'t overthink it.' },
  ],
}

function getMoodIndex(affinityScore: number, exchangeCount: number): number {
  // Base mood from persisted affinity (survives across scenes)
  let base = 0
  if (affinityScore >= 56) base = 3
  else if (affinityScore >= 36) base = 2
  else if (affinityScore >= 16) base = 1

  // Within this session, exchanges can push mood one stage higher
  let sessionBoost = 0
  if (exchangeCount >= 6) sessionBoost = 2
  else if (exchangeCount >= 3) sessionBoost = 1

  return Math.min(3, Math.max(base, sessionBoost))
}

function getMoodStages(characterId: string): string[] {
  return MOOD_STAGES[characterId] ?? MOOD_STAGES.default
}

function getMoodTooltips(characterId: string): { desc: string; hint: string }[] {
  return MOOD_TOOLTIPS[characterId] ?? MOOD_TOOLTIPS.default
}

function MoodStage({ stage, isActive, isPast, showDivider, tooltip }: {
  stage: string
  isActive: boolean
  isPast: boolean
  showDivider: boolean
  tooltip: { desc: string; hint: string }
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div className="flex items-center gap-1.5 relative">
      {showDivider && (
        <div className="w-2 h-px" style={{ background: isPast ? 'rgba(200,75,158,0.5)' : 'rgba(255,255,255,0.1)' }} />
      )}
      <div
        className="relative"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {isActive ? (
          <motion.span
            className="text-[10px] italic font-semibold cursor-default"
            style={{ color: '#e060b8', display: 'inline-block' }}
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            {stage}
          </motion.span>
        ) : (
          <span
            className="text-[10px] italic cursor-default transition-colors duration-300"
            style={{
              color: isPast ? 'rgba(200,75,158,0.5)' : 'rgba(255,255,255,0.4)',
              fontWeight: 400,
            }}
          >
            {stage}
          </span>
        )}

        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-1/2 mb-2 z-50 pointer-events-none"
              style={{ transform: 'translateX(-50%)' }}
            >
              <div
                className="rounded-xl px-3 py-2.5 text-left w-44 shadow-xl"
                style={{
                  background: 'rgba(19,16,28,0.97)',
                  border: '1px solid rgba(200,75,158,0.25)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <p className="text-[10px] text-textPrimary leading-relaxed mb-1.5">{tooltip.desc}</p>
                <p className="text-[9px] italic" style={{ color: '#e060b8' }}>{tooltip.hint}</p>
                <div
                  className="absolute left-1/2 -bottom-1.5"
                  style={{
                    transform: 'translateX(-50%)',
                    width: 0, height: 0,
                    borderLeft: '5px solid transparent',
                    borderRight: '5px solid transparent',
                    borderTop: '6px solid rgba(19,16,28,0.97)',
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── Suggestion chips ───

type PersonalityType = 'quiet' | 'bold' | 'dreamer' | 'custom'

function detectPersonality(bio: string | null): PersonalityType {
  if (!bio) return 'bold'
  const lower = bio.toLowerCase()
  if (lower.includes('quiet') || lower.includes('listen')) return 'quiet'
  if (lower.includes('bold') || lower.includes('say what i think') || lower.includes('go after it')) return 'bold'
  if (lower.includes('dreamer') || lower.includes('notice things') || lower.includes('half in my head')) return 'dreamer'
  return 'custom'
}

const SUGGESTIONS: Record<PersonalityType, Record<string, string[]>> = {
  quiet: {
    opening: ["Hi... I'm a bit shy, but hi.", "You seem interesting.", "I noticed you from across the room.", "Sorry if I'm quiet, I'm just taking it all in.", "I don't usually talk first, but here I am.", "Something about you made me want to say hello."],
    mid: ["Tell me more about that.", "I like hearing you talk.", "That's really sweet.", "I've been thinking about what you said.", "You're easy to talk to, you know that?", "I feel like I can be myself around you."],
    deep: ["I'm really glad we met.", "You make me feel safe.", "I don't want this moment to end.", "I've never told anyone this before.", "You understand me.", "Thank you for being patient with me."],
  },
  bold: {
    opening: ["Okay, I'm intrigued. Tell me everything.", "I've heard about you. The real version.", "You're not like everyone else here, are you?", "I have a good feeling about you.", "Alright, you have my attention.", "Something tells me we're going to get along."],
    mid: ["Wait, that's actually fascinating.", "I want to know the real you.", "You're full of surprises.", "I like that about you.", "Keep going, I'm listening.", "There's more to that story, isn't there?"],
    deep: ["I trust you. Completely.", "This feels real.", "I've never felt this way before.", "Let's figure this out together.", "You changed something in me.", "I don't want to hold back anymore."],
  },
  dreamer: {
    opening: ["This feels like fate, doesn't it?", "I had a feeling I'd meet someone like you.", "There's something magical about this moment.", "Have we met before? You feel so familiar.", "The universe brought us together.", "I feel like I've been waiting for this."],
    mid: ["What's your favorite memory?", "Do you believe some things are meant to be?", "I keep thinking about you.", "Tell me about your dreams.", "I feel like we're connected somehow.", "There's something beautiful about this."],
    deep: ["I think we were meant to find each other.", "Some things don't need words.", "This is exactly where I'm supposed to be.", "I never want to forget this feeling.", "You make the world feel brighter.", "What if this is the beginning of something amazing?"],
  },
  custom: {
    opening: ["Hey! It's nice to meet you.", "Tell me about yourself.", "I'm curious about you.", "What brings you here?", "I feel like we'd get along.", "This is exciting, isn't it?"],
    mid: ["That's really interesting.", "I like the way you think.", "I wasn't expecting that!", "Tell me more.", "You're really fun to talk to.", "I'm glad we're talking."],
    deep: ["I trust you.", "I'm really glad I met you.", "I want to understand everything about you.", "This means a lot to me.", "Whatever happens, I'm with you.", "You make me want to be braver."],
  },
}

function pickRandom(arr: string[], count: number, seed: number): string[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.abs((seed * 31 + i * 7) % (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, count)
}

function getSuggestions(bio: string | null, exchangeCount: number): string[] {
  const type = detectPersonality(bio)
  const pool = SUGGESTIONS[type]
  let tier: string[]
  if (exchangeCount <= 1) tier = pool.opening
  else if (exchangeCount <= 4) tier = pool.mid
  else tier = pool.deep
  return pickRandom(tier, 3, exchangeCount)
}

// ─── Per-character chat state ───

interface CharChatState {
  messages: { role: 'user' | 'character'; content: string; actionData?: { label: string; emoji: string; gemCost: number }; reactionImageUrl?: string }[]
  exchangeCount: number
  isDone: boolean
  hasOpener: boolean
  isLoadingOpener: boolean
  introImage: string | null
  isLoadingImage: boolean
}

function freshCharState(): CharChatState {
  return { messages: [], exchangeCount: 0, isDone: false, hasOpener: false, isLoadingOpener: false, introImage: null, isLoadingImage: false }
}

// ─── Props ───

interface Props {
  stepId: string
  characters: SceneCharacter[]
  minCharactersTalkedTo?: number
  storyContext: string
  chatImagePrompt?: string
  onComplete: () => void
}

// ─── Component ───

export function SceneChat({ stepId, characters, minCharactersTalkedTo = 1, storyContext, chatImagePrompt, onComplete }: Props) {
  const { bio, loveInterest, selectedUniverse, characterState, characterPortraits, characterAffinities, characterMemories } = useActiveStory()
  const addChatMessage = useStore((s) => s.addChatMessage)
  const setChatSummary = useStore((s) => s.setChatSummary)
  const setCharacterPortrait = useStore((s) => s.setCharacterPortrait)
  const updateAffinity = useStore((s) => s.updateAffinity)
  const addCharacterMemory = useStore((s) => s.addCharacterMemory)
  const globalAffinities = useStore((s) => s.globalAffinities)
  const playthroughHistory = useStore((s) => s.playthroughHistory)
  const addStoryMoment = useStore((s) => s.addStoryMoment)
  const previousPlaythroughs = playthroughHistory.filter((pt) => pt.universeId === selectedUniverse)

  // Per-character state
  const [chatStates, setChatStates] = useState<Record<string, CharChatState>>(() => {
    const init: Record<string, CharChatState> = {}
    for (const sc of characters) {
      init[sc.characterId] = freshCharState()
    }
    return init
  })

  // Active character tab
  const [activeCharId, setActiveCharId] = useState(characters[0]?.characterId ?? '')

  // Shared streaming state (only one character streams at a time)
  const [isTyping, setIsTyping] = useState(false)
  const [streamedReply, setStreamedReply] = useState('')
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const openerGeneratedFor = useRef<Set<string>>(new Set())

  const activeState = chatStates[activeCharId] ?? freshCharState()
  const activeCharData = getCharacter(activeCharId, selectedUniverse) ?? CHARACTERS[activeCharId]
  const playerCharacter = useStore((s) => s.characters[0])
  const playerGender = playerCharacter?.gender ?? 'male'
  const activeCharGender = activeCharData?.gender ?? 'unknown'
  const { executeAction, checkCooldown, gemBalance } = useChatActions({
    characterId: activeCharId,
    universeId: selectedUniverse,
    characterMemories: characterMemories[activeCharId] ?? [],
  })
  const portrait = characterPortraits[activeCharId] ?? null

  // ─── Scene context builder ───

  const buildSceneContext = useCallback((forCharId: string): string => {
    const otherChats = characters
      .filter(sc => sc.characterId !== forCharId)
      .map(sc => {
        const state = chatStates[sc.characterId]
        if (!state || state.messages.length === 0) return null
        const charData = getCharacter(sc.characterId, selectedUniverse) ?? CHARACTERS[sc.characterId]
        const charName = charData?.name ?? sc.characterId
        const recentMsgs = state.messages.slice(-4)
        const transcript = recentMsgs
          .map(m => `${m.role === 'user' ? 'Protagonist' : charName}: ${m.content}`)
          .join('\n')
        return `Recent exchange with ${charName} (${state.exchangeCount} exchanges):\n${transcript}`
      })
      .filter(Boolean)

    if (otherChats.length === 0) return ''
    return `SCENE CONTEXT — The protagonist has also been talking to other characters nearby. You may reference this naturally (you might have overheard, or their mood might reflect it) but don't repeat exact words:\n${otherChats.join('\n\n')}`
  }, [chatStates, characters, selectedUniverse])

  // ─── Generate portraits ───

  useEffect(() => {
    for (const sc of characters) {
      const p = characterPortraits[sc.characterId]
      const charData = getCharacter(sc.characterId, selectedUniverse) ?? CHARACTERS[sc.characterId]
      if (charData?.staticPortrait) {
        if (p !== charData.staticPortrait) setCharacterPortrait(sc.characterId, charData.staticPortrait)
        continue
      }
      if (p) continue
      if (charData?.portraitPrompt) {
        generateCharacterPortrait(charData.portraitPrompt).then(url => {
          if (url) setCharacterPortrait(sc.characterId, url)
        })
      }
    }
  }, [])

  // ─── Generate opener for active character ───

  useEffect(() => {
    if (openerGeneratedFor.current.has(activeCharId)) return
    if (chatStates[activeCharId]?.hasOpener) return

    openerGeneratedFor.current.add(activeCharId)

    const charData = getCharacter(activeCharId, selectedUniverse) ?? CHARACTERS[activeCharId]

    setChatStates(prev => ({
      ...prev,
      [activeCharId]: { ...prev[activeCharId], isLoadingOpener: true },
    }))

    // Generate intro image in parallel (prefer character's own intro over shared scene prompt)
    const imagePrompt = charData?.introImagePrompt ?? chatImagePrompt
    if (imagePrompt) {
      setChatStates(prev => ({
        ...prev,
        [activeCharId]: { ...prev[activeCharId], isLoadingImage: true },
      }))
      generateSceneImage({ prompt: imagePrompt, width: 768, height: 512 }).then(url => {
        setChatStates(prev => ({
          ...prev,
          [activeCharId]: { ...prev[activeCharId], introImage: url ?? prev[activeCharId]?.introImage ?? null, isLoadingImage: false },
        }))
      })
    }

    const sceneCtx = buildSceneContext(activeCharId)

    generateOpeningMessage({
      characterId: activeCharId,
      storyContext,
      characterState,
      bio,
      loveInterest,
      universeId: selectedUniverse,
      sceneContext: sceneCtx || undefined,
      affinityScore: characterAffinities[activeCharId] ?? 0,
      characterMemories: characterMemories[activeCharId] ?? [],
      globalAffinityScore: globalAffinities[activeCharId] ?? 0,
      previousPlaythroughs,
      genre: getUniverseGenre(selectedUniverse),
    }).then(opening => {
      const charMessage = { role: 'character' as const, content: opening }
      setChatStates(prev => ({
        ...prev,
        [activeCharId]: {
          ...prev[activeCharId],
          messages: [charMessage],
          hasOpener: true,
          isLoadingOpener: false,
        },
      }))
      addChatMessage({ ...charMessage, characterId: activeCharId, timestamp: Date.now() })
    }).catch(() => {
      const fallback = activeCharId === 'sora' ? 'hey~' : '...'
      const charMessage = { role: 'character' as const, content: fallback }
      setChatStates(prev => ({
        ...prev,
        [activeCharId]: {
          ...prev[activeCharId],
          messages: [charMessage],
          hasOpener: true,
          isLoadingOpener: false,
        },
      }))
      addChatMessage({ ...charMessage, characterId: activeCharId, timestamp: Date.now() })
    })
  }, [activeCharId])

  // ─── Auto-scroll ───

  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 50)
    return () => clearTimeout(timer)
  }, [activeState.messages, streamedReply])

  // ─── Send message ───

  const handleSend = async () => {
    if (!input.trim() || isTyping) return

    const userMsg = input.trim()
    setInput('')

    const userMessage = { role: 'user' as const, content: userMsg }
    const newMessages = [...activeState.messages, userMessage]

    setChatStates(prev => ({
      ...prev,
      [activeCharId]: { ...prev[activeCharId], messages: newMessages },
    }))
    addChatMessage({ ...userMessage, characterId: activeCharId, timestamp: Date.now() })

    setIsTyping(true)
    setStreamedReply('')

    const newExchange = activeState.exchangeCount + 1
    const scConfig = characters.find(c => c.characterId === activeCharId)
    const maxEx = scConfig?.maxExchanges ?? 10

    const allMessages = newMessages.map(m => ({
      ...m,
      characterId: activeCharId,
      timestamp: Date.now(),
    }))

    const sceneCtx = buildSceneContext(activeCharId)

    abortRef.current = new AbortController()
    try {
      let fullReply = ''
      const gen = streamChatReply({
        characterId: activeCharId,
        messages: allMessages,
        storyContext,
        exchangeNumber: newExchange,
        maxExchanges: maxEx,
        characterState,
        bio,
        loveInterest,
        universeId: selectedUniverse,
        signal: abortRef.current.signal,
        sceneContext: sceneCtx || undefined,
        affinityScore: characterAffinities[activeCharId] ?? 0,
        characterMemories: characterMemories[activeCharId] ?? [],
        globalAffinityScore: globalAffinities[activeCharId] ?? 0,
        previousPlaythroughs,
        genre: getUniverseGenre(selectedUniverse),
      })

      for await (const chunk of gen) {
        fullReply += chunk
        setStreamedReply(fullReply)
      }

      const { content: cleanReply } = parseAffinityDelta(fullReply)
      const charMessage = { role: 'character' as const, content: cleanReply }

      setChatStates(prev => ({
        ...prev,
        [activeCharId]: {
          ...prev[activeCharId],
          messages: [...newMessages, charMessage],
          exchangeCount: newExchange,
        },
      }))
      addChatMessage({ ...charMessage, characterId: activeCharId, timestamp: Date.now() })
      setStreamedReply('')
      updateAffinity(activeCharId, getAffinityGrowth(newExchange))
      trackEvent('chat_exchange', { characterId: activeCharId, exchange: newExchange, isScene: true })

      // Extract memories every 2nd exchange (fire-and-forget)
      if (newExchange % 2 === 0) {
        const msgsForExtraction = [
          ...allMessages,
          { role: 'character' as const, content: fullReply, characterId: activeCharId, timestamp: Date.now() },
        ]
        extractMemories({ characterId: activeCharId, messages: msgsForExtraction })
          .then((facts) => facts.forEach((f) => addCharacterMemory(activeCharId, f)))
          .catch(() => {})
      }
    } catch (e) {
      if (e instanceof Error && e.name !== 'AbortError') {
        const fallback = { role: 'character' as const, content: '...' }
        setChatStates(prev => ({
          ...prev,
          [activeCharId]: { ...prev[activeCharId], messages: [...newMessages, fallback] },
        }))
        setStreamedReply('')
      }
    } finally {
      setIsTyping(false)
    }
  }

  // ─── Handle chat action ───

  const handleAction = async (action: ChatAction, userInput?: string) => {
    if (isTyping) return
    const result = executeAction(action)
    if (!result) return

    // Add action as a user message with visual data
    const actionMessage = {
      role: 'user' as const,
      content: userInput ? userInput : `[ACTION: ${result.label}]`,
      actionData: { label: result.label, emoji: result.emoji, gemCost: result.gemCost },
    }
    const newMessages = [...activeState.messages, actionMessage]

    setChatStates(prev => ({
      ...prev,
      [activeCharId]: { ...prev[activeCharId], messages: newMessages },
    }))
    addChatMessage({ role: 'user', content: `[ACTION: ${result.label}]`, characterId: activeCharId, timestamp: Date.now() })

    // Stream character reaction
    setIsTyping(true)
    setStreamedReply('')
    const newExchange = activeState.exchangeCount + 1
    const scConfig = characters.find(c => c.characterId === activeCharId)
    const maxEx = scConfig?.maxExchanges ?? 10

    const allMessages = newMessages.map(m => ({
      role: m.role,
      content: m.content,
      characterId: activeCharId,
      timestamp: Date.now(),
    }))

    const sceneCtx = buildSceneContext(activeCharId)

    abortRef.current = new AbortController()
    try {
      let fullReply = ''
      const gen = streamChatReply({
        characterId: activeCharId,
        messages: allMessages,
        storyContext: storyContext + (sceneCtx ? `\n\n${sceneCtx}` : '') + `\n\nACTION CONTEXT: The protagonist just ${result.promptInjection}\nThis is a deliberate gesture — react to it naturally and in character. Your reaction should reflect your personality and current relationship tier.\nDo NOT include an [AFFINITY] tag — the affinity change is handled separately.`,
        exchangeNumber: newExchange,
        maxExchanges: maxEx,
        characterState,
        bio,
        loveInterest,
        universeId: selectedUniverse,
        signal: abortRef.current.signal,
        affinityScore: characterAffinities[activeCharId] ?? 0,
        characterMemories: characterMemories[activeCharId] ?? [],
        globalAffinityScore: globalAffinities[activeCharId] ?? 0,
        previousPlaythroughs,
        genre: getUniverseGenre(selectedUniverse),
      })

      for await (const chunk of gen) {
        fullReply += chunk
        setStreamedReply(fullReply)
      }

      const cleanReply = fullReply.replace(/\n?\[AFFINITY:[+-]?\d+\]\s*$/, '').trim()
      const charMessage = { role: 'character' as const, content: cleanReply }

      setChatStates(prev => ({
        ...prev,
        [activeCharId]: {
          ...prev[activeCharId],
          messages: [...newMessages, charMessage],
          exchangeCount: newExchange,
        },
      }))
      addChatMessage({ ...charMessage, characterId: activeCharId, timestamp: Date.now() })
      setStreamedReply('')
      // Use the action's guaranteed affinity boost instead of normal growth
      updateAffinity(activeCharId, result.affinityBoost)
      trackEvent('chat_action', { characterId: activeCharId, actionId: action.id, affinityBoost: result.affinityBoost })

      // Generate reaction image for romantic actions
      if (result.reactionImagePrompt) {
        generateCharacterPortrait(result.reactionImagePrompt).then((imgUrl) => {
          if (imgUrl) {
            const imgMessage = { role: 'character' as const, content: '', reactionImageUrl: imgUrl }
            setChatStates(prev => ({
              ...prev,
              [activeCharId]: { ...prev[activeCharId], messages: [...prev[activeCharId].messages, imgMessage] },
            }))
          }
        })
      }
    } catch (e) {
      if (e instanceof Error && e.name !== 'AbortError') {
        const fallback = { role: 'character' as const, content: '...' }
        setChatStates(prev => ({
          ...prev,
          [activeCharId]: { ...prev[activeCharId], messages: [...newMessages, fallback] },
        }))
        setStreamedReply('')
      }
    } finally {
      setIsTyping(false)
    }
  }

  // ─── Summarize a character's conversation ───

  const handleSummarize = async (charId: string, msgs: { role: 'user' | 'character'; content: string }[]) => {
    const summary = await summarizeChat({
      characterId: charId,
      messages: msgs.map(m => ({ ...m, characterId: charId, timestamp: 0 })),
    })
    setChatSummary(`${stepId}:${charId}`, summary)
  }

  // ─── Continue story ───

  const canContinueScene = (() => {
    if (isTyping) return false
    // Check required characters
    for (const sc of characters) {
      if (sc.required) {
        const state = chatStates[sc.characterId]
        const minEx = sc.minExchanges ?? 1
        if (!state || state.exchangeCount < minEx) return false
      }
    }
    // Check minCharactersTalkedTo
    const talkedTo = characters.filter(sc => (chatStates[sc.characterId]?.exchangeCount ?? 0) > 0).length
    if (talkedTo < minCharactersTalkedTo) return false
    return true
  })()

  const [showContinue, setShowContinue] = useState(false)

  // Show continue button after requirements met + delay — once shown, never hide
  useEffect(() => {
    if (showContinue) return // already shown, keep it
    if (!canContinueScene) return
    const timer = setTimeout(() => setShowContinue(true), 10000)
    return () => clearTimeout(timer)
  }, [canContinueScene, showContinue])

  const handleContinue = async () => {
    // Summarize all conversations that haven't been summarized yet
    for (const sc of characters) {
      const state = chatStates[sc.characterId]
      if (state && state.messages.length > 0) {
        await handleSummarize(sc.characterId, state.messages)
      }
    }
    onComplete()
  }

  // ─── Render ───

  const moodStages = getMoodStages(activeCharId)
  const activeAffinityScore = characterAffinities[activeCharId] ?? 0
  const currentMoodIdx = getMoodIndex(activeAffinityScore, activeState.exchangeCount)

  return (
    <div className="flex flex-col h-full">
      {/* Character tabs */}
      <div className="flex items-stretch border-b border-border">
        {characters.map(sc => {
          const charData = getCharacter(sc.characterId, selectedUniverse) ?? CHARACTERS[sc.characterId]
          const charPortrait = characterPortraits[sc.characterId] ?? null
          const isActive = sc.characterId === activeCharId
          const charState = chatStates[sc.characterId]
          const exchangeCount = charState?.exchangeCount ?? 0
          const hasTalked = exchangeCount > 0

          return (
            <button
              key={sc.characterId}
              className="flex-1 flex items-center justify-center gap-2.5 py-3 px-3 transition-all relative"
              style={{
                background: isActive ? 'rgba(200,75,158,0.08)' : 'transparent',
                opacity: isActive ? 1 : 0.6,
              }}
              onClick={() => {
                if (!isTyping) setActiveCharId(sc.characterId)
              }}
              disabled={isTyping}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm overflow-hidden shrink-0"
                style={{ background: 'rgba(200,75,158,0.15)' }}
              >
                {charPortrait ? (
                  <img src={charPortrait} alt={charData?.name} className="w-full h-full object-cover" />
                ) : (
                  charData?.avatar ?? '💬'
                )}
              </div>
              <div className="flex flex-col items-start">
                <span className="text-textPrimary text-sm font-medium">{charData?.name ?? sc.characterId}</span>
                {/* Affinity shown in sidebar */}
              </div>
              {/* Active indicator bar */}
              {isActive && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ background: 'linear-gradient(90deg, #c84b9e 0%, #8b5cf6 100%)' }}
                  layoutId="scene-tab-indicator"
                />
              )}
              {/* Required badge */}
              {sc.required && !hasTalked && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent" />
              )}
            </button>
          )
        })}
      </div>

      {/* Mood track */}
      <div className="flex items-center gap-1.5 px-5 py-2 border-b border-border/50">
        <div
          className="w-7 h-7 rounded-full overflow-hidden shrink-0"
          style={{ background: 'rgba(200,75,158,0.15)' }}
        >
          {portrait ? (
            <img src={portrait} alt={activeCharData?.name} className="w-full h-full object-cover" />
          ) : (
            <span className="w-full h-full flex items-center justify-center text-xs">{activeCharData?.avatar}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-1">
          {moodStages.map((stage, i) => {
            const isActiveMood = i === currentMoodIdx
            const isPast = i < currentMoodIdx
            const tooltip = getMoodTooltips(activeCharId)[i]
            return (
              <MoodStage
                key={stage}
                stage={stage}
                isActive={isActiveMood}
                isPast={isPast}
                showDivider={i > 0}
                tooltip={tooltip}
              />
            )
          })}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {/* Loading opener */}
        {activeState.isLoadingOpener && (
          <motion.div className="flex justify-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="chat-bubble chat-bubble-character flex gap-1">
              <span className="typing-dot" style={{ animationDelay: '0ms' }} />
              <span className="typing-dot" style={{ animationDelay: '150ms' }} />
              <span className="typing-dot" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}

        {activeState.messages.map((msg, i) => (
          <motion.div
            key={`${activeCharId}-${i}`}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Intro image — only on first character message */}
            {i === 0 && msg.role === 'character' && activeState.introImage && (
              <motion.div
                className="w-full max-w-[320px] rounded-xl overflow-hidden mb-2"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <img src={activeState.introImage} alt={activeCharData?.name} className="w-full h-auto" />
              </motion.div>
            )}
            {/* Shimmer placeholder while image loads */}
            {i === 0 && msg.role === 'character' && !activeState.introImage && activeState.isLoadingImage && (
              <div className="w-full max-w-[320px] rounded-xl overflow-hidden mb-2">
                <div className="w-full aspect-[3/2] scene-image-shimmer rounded-xl" />
              </div>
            )}
            <div className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'character' && (
                <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 mb-0.5" style={{ background: 'rgba(200,75,158,0.15)' }}>
                  {portrait ? (
                    <img src={portrait} alt={activeCharData?.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center text-xs">{activeCharData?.avatar}</span>
                  )}
                </div>
              )}
              {msg.reactionImageUrl ? (
                <ChatReactionImage
                  imageUrl={msg.reactionImageUrl}
                  characterName={activeCharData?.name ?? ''}
                  onSaveToAlbum={() => addStoryMoment({
                    id: `reaction-${Date.now()}`,
                    imageUrl: msg.reactionImageUrl!,
                    characterIds: [activeCharId],
                    universeId: selectedUniverse ?? '',
                    beatLabel: `${activeCharData?.name ?? 'Character'} reacted`,
                    note: '',
                    timestamp: Date.now(),
                  })}
                />
              ) : msg.actionData ? (
                <div className="flex flex-col items-end gap-1.5">
                  <ChatActionBubble label={msg.actionData.label} emoji={msg.actionData.emoji} gemCost={msg.actionData.gemCost} />
                  {!msg.content.startsWith('[ACTION:') && msg.content && (
                    <div className="chat-bubble chat-bubble-user text-[12px] italic opacity-90 max-w-[240px]">
                      "{msg.content}"
                    </div>
                  )}
                </div>
              ) : (
                <div className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-character'}`}>
                  {msg.content}
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {/* Streaming reply */}
        {isTyping && streamedReply && (
          <motion.div className="flex items-end gap-2 justify-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 mb-0.5" style={{ background: 'rgba(200,75,158,0.15)' }}>
              {portrait ? (
                <img src={portrait} alt={activeCharData?.name} className="w-full h-full object-cover" />
              ) : (
                <span className="w-full h-full flex items-center justify-center text-xs">{activeCharData?.avatar}</span>
              )}
            </div>
            <div className="chat-bubble chat-bubble-character">
              {streamedReply.replace(/\n?\[AFFINITY:[+-]?\d+\]\s*$/, '')}
              <span className="cursor-blink text-accent ml-0.5">|</span>
            </div>
          </motion.div>
        )}

        {/* Typing dots */}
        {isTyping && !streamedReply && (
          <motion.div className="flex items-end gap-2 justify-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 mb-0.5" style={{ background: 'rgba(200,75,158,0.15)' }}>
              {portrait ? (
                <img src={portrait} alt={activeCharData?.name} className="w-full h-full object-cover" />
              ) : (
                <span className="w-full h-full flex items-center justify-center text-xs">{activeCharData?.avatar}</span>
              )}
            </div>
            <div className="chat-bubble chat-bubble-character flex gap-1">
              <span className="typing-dot" style={{ animationDelay: '0ms' }} />
              <span className="typing-dot" style={{ animationDelay: '150ms' }} />
              <span className="typing-dot" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="px-4 pb-6 pt-3 border-t border-border safe-bottom space-y-2">
        {/* Continue story button */}
        <AnimatePresence>
          {showContinue && (
            <motion.button
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium border border-white/10 text-white/40 hover:text-white/60 hover:border-white/20 transition-colors"
              onClick={handleContinue}
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
            >
              Continue the story <ArrowRight size={14} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Suggestion chips */}
        {!isTyping && !activeState.isLoadingOpener && !input && (
          <motion.div
            className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {getSuggestions(bio, activeState.exchangeCount).map(suggestion => (
              <button
                key={suggestion}
                className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap hover:brightness-125"
                style={{
                  background: 'rgba(200,75,158,0.1)',
                  border: '1px solid rgba(200,75,158,0.2)',
                  color: 'rgba(200,75,158,0.8)',
                }}
                onClick={() => setInput(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </motion.div>
        )}

        {/* Chat input */}
        <div className="flex gap-2 relative">
            <ChatActionTray
              playerGender={playerGender}
              characterGender={activeCharGender}
              affinityScore={characterAffinities[activeCharId] ?? 0}
              gemBalance={gemBalance}
              genre={getUniverseGenre(selectedUniverse)}
              isOnCooldown={checkCooldown}
              onAction={handleAction}
              disabled={isTyping || activeState.isLoadingOpener}
            />
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder={`Say something to ${activeCharData?.name ?? 'them'}...`}
              className="flex-1 bg-surfaceAlt border border-border rounded-xl px-4 py-3 text-textPrimary text-base placeholder:text-textMuted focus:outline-none focus:border-accent transition-colors"
              disabled={isTyping || activeState.isLoadingOpener}
              autoFocus
              enterKeyHint="send"
              autoComplete="off"
              autoCorrect="off"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping || activeState.isLoadingOpener}
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-30"
              style={{ background: 'linear-gradient(135deg, #c84b9e 0%, #8b5cf6 100%)' }}
            >
              <Send size={18} className="text-white" />
            </button>
          </div>
      </div>
    </div>
  )
}
