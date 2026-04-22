import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, ArrowRight } from 'lucide-react'
import { CHARACTERS, getCharacter } from '../data/characters'
import { getUniverseGenre } from '../data/storyHelpers'
import { getGenreSuggestions } from '../lib/suggestions'
import { useStore } from '../store/useStore'
import { useActiveStory } from '../hooks/useActiveStory'
import { streamChatReply, summarizeChat, generateOpeningMessage, extractMemories, generateLoveLetter } from '../lib/claudeStream'
import { generateCharacterPortrait, generateSceneImage } from '../lib/togetherAi'
import { trackEvent } from '../lib/supabase'
import { getAffinityGrowth } from '../lib/affinity'
import { parseAffinityDelta } from '../lib/claudeStream'
import { ChatActionTray } from './ChatActionTray'
import { ChatActionBubble } from './ChatActionBubble'
import { ChatReactionImage } from './ChatReactionImage'
import { useChatActions } from '../hooks/useChatActions'
import type { ChatAction } from '../data/chatActions'

// Mood labels based on exchange count — feels organic, not mechanical
const MOOD_STAGES: Record<string, string[]> = {
  default: ['guarded', 'warming up', 'opening up', 'vulnerable'],
  sora: ['curious', 'vibing', 'in the groove', 'real talk'],
}

// Tooltip descriptions per stage index
const MOOD_TOOLTIPS: Record<string, { desc: string; hint: string }[]> = {
  default: [
    { desc: 'Still figuring you out. Every word is being weighed.', hint: 'Keep talking — show genuine interest.' },
    { desc: 'The walls are coming down, slowly.', hint: 'Ask questions. Be consistent.' },
    { desc: 'Real thoughts are starting to surface.', hint: "Stay present. Don't push too hard." },
    { desc: 'Fully open. This is rare for them.', hint: "You've earned this." },
  ],
  sora: [
    { desc: 'Intrigued but testing you.', hint: 'Match her energy. Be playful.' },
    { desc: "She's feeling it. Conversation flows naturally.", hint: 'Keep up the momentum.' },
    { desc: "You two are in sync. She's being real.", hint: 'Go deeper. She can handle it.' },
    { desc: "No filter left. This is pure Sora.", hint: "You made it here. Don't overthink it." },
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


// ─── MoodStage ───

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
              initial={{ opacity: 0, y: -4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-1/2 mt-2 z-50 pointer-events-none"
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

interface Props {
  stepId: string
  characterId: string
  maxExchanges: number
  minExchanges?: number
  storyContext: string
  chatImagePrompt?: string
  onComplete: () => void
}

export function ChatScene({ stepId, characterId, maxExchanges, minExchanges = 3, storyContext, chatImagePrompt, onComplete }: Props) {
  const { bio, loveInterest, selectedUniverse, selfieUrl, characterState, characterPortraits, characterAffinities, characterMemories } = useActiveStory()
  const addChatMessage = useStore((s) => s.addChatMessage)
  const setChatSummary = useStore((s) => s.setChatSummary)
  const setCharacterPortrait = useStore((s) => s.setCharacterPortrait)
  const updateAffinity = useStore((s) => s.updateAffinity)
  const addCharacterMemory = useStore((s) => s.addCharacterMemory)
  const globalAffinities = useStore((s) => s.globalAffinities)
  const playthroughHistory = useStore((s) => s.playthroughHistory)
  const addStoryMoment = useStore((s) => s.addStoryMoment)
  const affinityScore = characterAffinities[characterId] ?? 0
  const globalAffinityScore = globalAffinities[characterId] ?? 0
  const previousPlaythroughs = playthroughHistory.filter((pt) => pt.universeId === selectedUniverse)
  const character = getCharacter(characterId, selectedUniverse) ?? CHARACTERS[characterId]
  const playerCharacter = useStore((s) => s.characters[0])
  const playerGender = playerCharacter?.gender ?? 'male'
  const characterGender = character?.gender ?? 'unknown'
  const { executeAction, checkCooldown, gemBalance, isLetterAction } = useChatActions({
    characterId,
    universeId: selectedUniverse,
    characterMemories: characterMemories[characterId] ?? [],
  })
  const [localMessages, setLocalMessages] = useState<{ role: 'user' | 'character'; content: string; actionData?: { label: string; emoji: string; gemCost: number; jokeText?: string | null; dareText?: string | null }; letterContent?: string; reactionImageUrl?: string }[]>([])
  const [input, setInput] = useState('')
  const [usedSuggestions, setUsedSuggestions] = useState<Set<string>>(new Set())
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [streamedReply, setStreamedReply] = useState('')
  const [exchangeCount, setExchangeCount] = useState(0)
  const [isLoadingOpener, setIsLoadingOpener] = useState(true)
  const [introImage, setIntroImage] = useState<string | null>(null)
  const [isLoadingImage, setIsLoadingImage] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const hasGeneratedOpener = useRef(false)

  const canContinue = exchangeCount >= minExchanges && !isTyping
  const [showContinue, setShowContinue] = useState(false)
  const portrait = characterPortraits[characterId] ?? null

  // Show continue button after minExchanges met + delay — once shown, never hide
  useEffect(() => {
    if (showContinue) return // already shown, keep it
    if (!canContinue) return
    const timer = setTimeout(() => setShowContinue(true), 10000)
    return () => clearTimeout(timer)
  }, [canContinue, showContinue])

  // Use static portrait if available (always wins), otherwise generate
  useEffect(() => {
    if (character?.staticPortrait) {
      if (portrait !== character.staticPortrait) setCharacterPortrait(characterId, character.staticPortrait)
      return
    }
    if (portrait) return
    if (!character?.portraitPrompt) return
    generateCharacterPortrait(character.portraitPrompt).then((url) => {
      if (url) setCharacterPortrait(characterId, url)
    })
  }, [characterId])

  // Auto-scroll on new messages
  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 50)
    return () => clearTimeout(timer)
  }, [localMessages, streamedReply])

  // Generate character's opening message on mount
  useEffect(() => {
    if (hasGeneratedOpener.current) return
    hasGeneratedOpener.current = true

    const generateOpener = async () => {
      setIsLoadingOpener(true)

      // Generate intro scene image — prefer character's own intro over shared scene prompt
      const imagePrompt = character?.introImagePrompt ?? chatImagePrompt
      if (imagePrompt) {
        setIsLoadingImage(true)
        // Extract mood hint from storyContext if a recent choice tone is embedded
        const toneMatch = storyContext.match(/\(tone:\s*([^)]+)\)/)
        const moodContext = toneMatch ? `${toneMatch[1]} mood, emotional tension` : undefined
        generateSceneImage({ prompt: imagePrompt, width: 768, height: 512, moodContext }).then((url) => {
          if (url) setIntroImage(url)
          setIsLoadingImage(false)
        })
      }

      try {
        const opening = await generateOpeningMessage({
          characterId,
          storyContext,
          characterState,
          bio,
          loveInterest,
          universeId: selectedUniverse,
          affinityScore,
          characterMemories: characterMemories[characterId] ?? [],
          globalAffinityScore,
          previousPlaythroughs,
          genre: getUniverseGenre(selectedUniverse),
        })
        const charMessage = { role: 'character' as const, content: opening.content }
        setLocalMessages([charMessage])
        if (opening.suggestions) setAiSuggestions(opening.suggestions)
        addChatMessage({ ...charMessage, characterId, timestamp: Date.now() })
      } catch {
        const fallback = characterId === 'jiwon' ? '...' : 'hey~'
        const charMessage = { role: 'character' as const, content: fallback }
        setLocalMessages([charMessage])
        addChatMessage({ ...charMessage, characterId, timestamp: Date.now() })
      } finally {
        setIsLoadingOpener(false)
      }
    }

    generateOpener()
  }, [])

  const handleSend = async (overrideText?: string) => {
    const userMsg = (overrideText ?? input).trim()
    if (!userMsg || isTyping) return

    setInput('')

    // Add user message
    const userMessage = { role: 'user' as const, content: userMsg }
    setLocalMessages((prev) => [...prev, userMessage])
    addChatMessage({ ...userMessage, characterId, timestamp: Date.now() })

    // Stream character reply
    setIsTyping(true)
    setStreamedReply('')
    const newExchange = exchangeCount + 1

    // Build full message history for Claude
    const allMessages = [...localMessages, userMessage].map((m) => ({
      ...m,
      characterId,
      timestamp: Date.now(),
    }))

    abortRef.current = new AbortController()
    try {
      let fullReply = ''
      const gen = streamChatReply({
        characterId,
        messages: allMessages,
        storyContext,
        exchangeNumber: newExchange,
        maxExchanges,
        characterState,
        bio,
        loveInterest,
        universeId: selectedUniverse,
        signal: abortRef.current.signal,
        affinityScore,
        characterMemories: characterMemories[characterId] ?? [],
        globalAffinityScore,
        previousPlaythroughs,
        genre: getUniverseGenre(selectedUniverse),
      })

      for await (const chunk of gen) {
        fullReply += chunk
        setStreamedReply(fullReply)
      }

      const { content: cleanReply, suggestions } = parseAffinityDelta(fullReply)
      const charMessage = { role: 'character' as const, content: cleanReply }
      setLocalMessages((prev) => [...prev, charMessage])
      if (suggestions) setAiSuggestions(suggestions)
      addChatMessage({ ...charMessage, characterId, timestamp: Date.now() })
      setStreamedReply('')
      setExchangeCount(newExchange)
      updateAffinity(characterId, getAffinityGrowth(newExchange))
      trackEvent('chat_exchange', { characterId, exchange: newExchange })

      // Extract memories every 2nd exchange (fire-and-forget)
      if (newExchange % 2 === 0) {
        const msgsForExtraction = [
          ...allMessages,
          { role: 'character' as const, content: fullReply, characterId, timestamp: Date.now() },
        ]
        extractMemories({ characterId, messages: msgsForExtraction })
          .then((facts) => facts.forEach((f) => addCharacterMemory(characterId, f)))
          .catch(() => {})
      }

    } catch (e) {
      if (e instanceof Error && e.name !== 'AbortError') {
        const fallback = { role: 'character' as const, content: '...' }
        setLocalMessages((prev) => [...prev, fallback])
        setStreamedReply('')
      }
    } finally {
      setIsTyping(false)
    }
  }

  const handleAction = async (action: ChatAction) => {
    if (isTyping) return
    const result = executeAction(action)
    if (!result) return

    // For love-letter actions, generate the letter content first
    let letterContent: string | null = null
    if (isLetterAction(action.id)) {
      setIsTyping(true)
      const isNote = action.label === 'Slip a Note'
      letterContent = await generateLoveLetter({
        characterName: character?.name ?? '',
        bio,
        characterMemories: characterMemories[characterId] ?? [],
        affinityScore,
        isNote,
        recentMessages: localMessages.slice(-10).map(m => ({ role: m.role, content: m.content })),
      })
      result.promptInjection = `wrote you a heartfelt ${isNote ? 'note' : 'letter'}. Here is what it says: "${letterContent}"\n\nRead this carefully and react with deep, genuine emotion. Quote specific parts that moved you. This is vulnerable and real.`
      setIsTyping(false)
    }

    // Add action as a user message with visual data
    const actionMessage = {
      role: 'user' as const,
      content: `[ACTION: ${result.label}]`,
      actionData: { label: result.label, emoji: result.emoji, gemCost: result.gemCost, jokeText: result.jokeText, dareText: result.dareText },
      letterContent: letterContent ?? undefined,
    }
    setLocalMessages((prev) => [...prev, actionMessage])
    addChatMessage({ role: 'user', content: letterContent ? `[ACTION: ${result.label}]\n${letterContent}` : `[ACTION: ${result.label}]`, characterId, timestamp: Date.now() })

    // Stream character reaction
    setIsTyping(true)
    setStreamedReply('')
    const newExchange = exchangeCount + 1

    const allMessages = [...localMessages, actionMessage].map((m) => ({
      role: m.role,
      content: m.content,
      characterId,
      timestamp: Date.now(),
    }))

    abortRef.current = new AbortController()
    try {
      let fullReply = ''
      const gen = streamChatReply({
        characterId,
        messages: allMessages,
        storyContext: storyContext + `\n\nACTION CONTEXT: The protagonist just ${result.promptInjection}\nThis is a deliberate gesture — react to it naturally and in character. Your reaction should reflect your personality and current relationship tier.\nDo NOT include an [AFFINITY] tag — the affinity change is handled separately.`,
        exchangeNumber: newExchange,
        maxExchanges,
        characterState,
        bio,
        loveInterest,
        universeId: selectedUniverse,
        signal: abortRef.current.signal,
        affinityScore,
        characterMemories: characterMemories[characterId] ?? [],
        globalAffinityScore,
        previousPlaythroughs,
        genre: getUniverseGenre(selectedUniverse),
      })

      for await (const chunk of gen) {
        fullReply += chunk
        setStreamedReply(fullReply)
      }

      const cleanReply = fullReply.replace(/\n?\[AFFINITY:[+-]?\d+\]\s*$/, '').replace(/\n?\[SUGGESTIONS:.*\]/g, '').trim()
      const charMessage = { role: 'character' as const, content: cleanReply }
      setLocalMessages((prev) => [...prev, charMessage])
      addChatMessage({ ...charMessage, characterId, timestamp: Date.now() })
      setStreamedReply('')
      setExchangeCount(newExchange)
      // Use the action's guaranteed affinity boost instead of normal growth
      updateAffinity(characterId, result.affinityBoost)
      trackEvent('chat_action', { characterId, actionId: action.id, affinityBoost: result.affinityBoost })

      // Generate reaction image for romantic actions (fire-and-forget, non-blocking)
      if (result.reactionImagePrompt) {
        generateCharacterPortrait(result.reactionImagePrompt).then((imgUrl) => {
          if (imgUrl) {
            const imgMessage = { role: 'character' as const, content: '', reactionImageUrl: imgUrl }
            setLocalMessages((prev) => [...prev, imgMessage])
          }
        })
      }

      // Generate scene image with both characters (e.g. coffee/serenade)
      if (result.sceneImagePrompt) {
        generateSceneImage({
          prompt: result.sceneImagePrompt,
          referenceImageUrl: selfieUrl ?? undefined,
          protagonistGender: character?.gender === 'female' ? 'female' : 'male',
          includesProtagonist: !!selfieUrl,
          width: 768,
          height: 576,
        }).then((imgUrl) => {
          if (imgUrl) {
            const imgMessage = { role: 'character' as const, content: '', reactionImageUrl: imgUrl }
            setLocalMessages((prev) => [...prev, imgMessage])
          }
        })
      }
    } catch (e) {
      if (e instanceof Error && e.name !== 'AbortError') {
        const fallback = { role: 'character' as const, content: '...' }
        setLocalMessages((prev) => [...prev, fallback])
        setStreamedReply('')
      }
    } finally {
      setIsTyping(false)
    }
  }

  const handleChatComplete = async (msgs: { role: 'user' | 'character'; content: string }[]) => {
    // Summarize the conversation
    const summary = await summarizeChat({
      characterId,
      messages: msgs.map((m) => ({ ...m, characterId, timestamp: 0 })),
    })
    setChatSummary(stepId, summary)
  }

  const handleContinue = async () => {
    // Summarize what we have so far, then advance
    await handleChatComplete(localMessages)
    onComplete()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg overflow-hidden shrink-0" style={{ background: 'rgba(200,75,158,0.15)' }}>
          {portrait ? (
            <img src={portrait} alt={character?.name} className="w-full h-full object-cover" />
          ) : (
            character?.avatar ?? '💬'
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-textPrimary font-semibold text-sm">{character?.name ?? characterId}</p>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
              {getMoodStages(characterId).map((stage, i) => {
                const currentIdx = getMoodIndex(affinityScore, exchangeCount)
                const isActive = i === currentIdx
                const isPast = i < currentIdx
                const tooltip = getMoodTooltips(characterId)[i]
                return (
                  <MoodStage
                    key={stage}
                    stage={stage}
                    isActive={isActive}
                    isPast={isPast}
                    showDivider={i > 0}
                    tooltip={tooltip}
                  />
                )
              })}
            </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {/* Loading opener */}
        {isLoadingOpener && (
          <motion.div className="flex justify-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="chat-bubble chat-bubble-character flex gap-1">
              <span className="typing-dot" style={{ animationDelay: '0ms' }} />
              <span className="typing-dot" style={{ animationDelay: '150ms' }} />
              <span className="typing-dot" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}

        {localMessages.map((msg, i) => (
          <motion.div
            key={i}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Intro image — only on first character message */}
            {i === 0 && msg.role === 'character' && introImage && (
              <motion.div
                className="w-full max-w-[320px] rounded-xl overflow-hidden mb-2"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <img
                  src={introImage}
                  alt={character?.name}
                  className="w-full h-auto"
                  onError={(e) => {
                    const parent = (e.target as HTMLImageElement).parentElement
                    if (parent) parent.style.display = 'none'
                  }}
                />
              </motion.div>
            )}
            {/* Shimmer placeholder while image loads */}
            {i === 0 && msg.role === 'character' && !introImage && isLoadingImage && (
              <div className="w-full max-w-[320px] rounded-xl overflow-hidden mb-2">
                <div className="w-full aspect-[3/2] scene-image-shimmer rounded-xl" />
              </div>
            )}
            <div className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'character' && i > 0 && (
                <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 mb-0.5" style={{ background: 'rgba(200,75,158,0.15)' }}>
                  {portrait ? (
                    <img src={portrait} alt={character?.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center text-xs">{character?.avatar}</span>
                  )}
                </div>
              )}
              {msg.reactionImageUrl ? (
                <ChatReactionImage
                  imageUrl={msg.reactionImageUrl}
                  characterName={character?.name ?? ''}
                  onSaveToAlbum={() => addStoryMoment({
                    id: `reaction-${Date.now()}`,
                    imageUrl: msg.reactionImageUrl!,
                    characterIds: [characterId],
                    universeId: selectedUniverse ?? '',
                    beatLabel: `${character?.name ?? 'Character'} reacted`,
                    note: '',
                    timestamp: Date.now(),
                  })}
                />
              ) : msg.actionData ? (
                <div className="flex flex-col items-end gap-1.5">
                  <ChatActionBubble label={msg.actionData.label} emoji={msg.actionData.emoji} gemCost={msg.actionData.gemCost} jokeText={msg.actionData.jokeText} dareText={msg.actionData.dareText} />
                  {msg.letterContent && (
                    <div
                      className="max-w-[300px] px-4 py-3 rounded-2xl text-[13px] leading-relaxed italic"
                      style={{
                        background: 'linear-gradient(135deg, rgba(200,75,158,0.12), rgba(139,92,246,0.12))',
                        border: '1px solid rgba(200,75,158,0.2)',
                        color: 'rgba(255,255,255,0.85)',
                      }}
                    >
                      <span className="text-[10px] not-italic font-medium block mb-1.5" style={{ color: 'rgba(200,75,158,0.6)' }}>
                        💌 Your letter
                      </span>
                      {msg.letterContent}
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
                <img src={portrait} alt={character?.name} className="w-full h-full object-cover" />
              ) : (
                <span className="w-full h-full flex items-center justify-center text-xs">{character?.avatar}</span>
              )}
            </div>
            <div className="chat-bubble chat-bubble-character">
              {streamedReply.replace(/\n?\[AFFINITY:[+-]?\d+\]\s*$/, '').replace(/\n?\[SUGGESTIONS:.*$/, '')}
              <span className="cursor-blink text-accent ml-0.5">|</span>
            </div>
          </motion.div>
        )}

        {/* Typing indicator */}
        {isTyping && !streamedReply && (
          <motion.div className="flex items-end gap-2 justify-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 mb-0.5" style={{ background: 'rgba(200,75,158,0.15)' }}>
              {portrait ? (
                <img src={portrait} alt={character?.name} className="w-full h-full object-cover" />
              ) : (
                <span className="w-full h-full flex items-center justify-center text-xs">{character?.avatar}</span>
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
        {/* Continue story button — appears after minExchanges */}
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

        {/* Suggestion chips — personality-aware */}
        {!isTyping && !isLoadingOpener && !input && (
          <motion.div
            className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {(aiSuggestions.length > 0 ? aiSuggestions : getGenreSuggestions(bio, exchangeCount, getUniverseGenre(selectedUniverse), usedSuggestions)).map((suggestion) => (
              <button
                key={suggestion}
                className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap hover:brightness-125"
                style={{
                  background: 'rgba(200,75,158,0.1)',
                  border: '1px solid rgba(200,75,158,0.2)',
                  color: 'rgba(200,75,158,0.8)',
                }}
                onClick={() => {
                  setAiSuggestions([])
                  setUsedSuggestions((prev) => new Set(prev).add(suggestion))
                  handleSend(suggestion)
                }}
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
              characterGender={characterGender}
              affinityScore={affinityScore}
              gemBalance={gemBalance}
              genre={getUniverseGenre(selectedUniverse)}
              isOnCooldown={checkCooldown}
              onAction={handleAction}
              disabled={isTyping || isLoadingOpener}
            />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={`Say something to ${character?.name ?? 'them'}...`}
              className="flex-1 bg-surfaceAlt border border-border rounded-xl px-4 py-3 text-textPrimary text-base placeholder:text-textMuted focus:outline-none focus:border-accent transition-colors"
              disabled={isTyping || isLoadingOpener}
              autoFocus
              enterKeyHint="send"
              autoComplete="off"
              autoCorrect="off"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping || isLoadingOpener}
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
