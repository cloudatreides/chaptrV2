import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getCharacter, CHARACTERS } from '../data/characters'
import { useStore } from '../store/useStore'
import { useActiveStory } from '../hooks/useActiveStory'
import { streamChatReply, generateOpeningMessage, extractMemories } from '../lib/claudeStream'
import { generateCharacterPortrait } from '../lib/togetherAi'
import { getStoryData } from '../data/stories'
import { trackEvent } from '../lib/supabase'
import { getAffinityGrowth } from '../lib/affinity'
import { AffinityBadge } from '../components/AffinityBadge'

// ─── Mood stages (from SceneChat) ───

const MOOD_STAGES: Record<string, string[]> = {
  default: ['catching up', 'vibing', 'real talk', 'no walls'],
  sora: ['hey again~', 'catching up', 'deep mode', 'besties'],
}

function getMoodIndex(_characterId: string, exchangeCount: number): number {
  if (exchangeCount <= 2) return 0
  if (exchangeCount <= 5) return 1
  if (exchangeCount <= 10) return 2
  return 3
}

function getMoodStages(characterId: string): string[] {
  return MOOD_STAGES[characterId] ?? MOOD_STAGES.default
}

// ─── Free chat suggestion chips ───

const FREE_SUGGESTIONS = {
  opening: ["So... what now?", "I've been thinking about everything.", "Miss me?"],
  mid: ["Tell me something I don't know.", "What would you do differently?", "Be honest with me."],
  deep: ["What are you afraid of?", "Do you trust me?", "What do you actually want?"],
}

function getFreeSuggestions(exchangeCount: number): string[] {
  if (exchangeCount <= 1) return FREE_SUGGESTIONS.opening
  if (exchangeCount <= 5) return FREE_SUGGESTIONS.mid
  return FREE_SUGGESTIONS.deep
}

// ─── Per-character chat state ───

interface CharChatState {
  messages: { role: 'user' | 'character'; content: string }[]
  exchangeCount: number
  hasOpener: boolean
  isLoadingOpener: boolean
}

function freshCharState(): CharChatState {
  return { messages: [], exchangeCount: 0, hasOpener: false, isLoadingOpener: false }
}

// ─── Helpers ───

/** Get all story character IDs for the current universe */
function getUniverseCharacterIds(universeId: string | null, loveInterest: 'jiwon' | 'yuna'): string[] {
  if (!universeId || universeId === 'seoul-transfer') {
    return [loveInterest, 'sora']
  }
  const storyData = getStoryData(universeId)
  if (storyData) return Object.keys(storyData.characters)
  return [loveInterest, 'sora']
}

/** Build rich post-story context for free chat prompts */
function buildPlaythroughContext(
  chatSummaries: Record<string, string>,
  choiceDescriptions: { label: string; description: string }[],
  characterState: { junhoTrust: number },
  trustStatusLabel: string,
  revealSignature: string | null,
  loveInterest: 'jiwon' | 'yuna',
): string {
  const trust = characterState.junhoTrust
  const liName = loveInterest === 'yuna' ? 'Yuna' : 'Jiwon'

  const parts: string[] = []

  parts.push(`The story is OVER. The protagonist has completed their journey. You are now in a free-form conversation — no story to advance, no scenes to unlock. Just two people talking after everything that happened.`)

  if (choiceDescriptions.length > 0) {
    parts.push(`CHOICES THE PROTAGONIST MADE:\n${choiceDescriptions.map(c => `- [${c.label}]: ${c.description}`).join('\n')}`)
  }

  const summaries = Object.entries(chatSummaries)
  if (summaries.length > 0) {
    parts.push(`CONVERSATION HISTORY (summaries):\n${summaries.map(([key, s]) => `- ${key}: ${s}`).join('\n')}`)
  }

  parts.push(`RELATIONSHIP: ${trustStatusLabel} (${trust}/100 trust with ${liName}).`)

  if (revealSignature) {
    parts.push(`THE STORY ENDED WITH: "${revealSignature}"`)
  }

  parts.push(`BEHAVIOR: You remember everything that happened. Reference specific moments, choices, and conversations naturally. Your feelings about the protagonist should reflect the trust level and history. This is post-story — be more open, more honest. The stakes are gone. Let the real person show.`)

  return parts.join('\n\n')
}

// ─── Component ───

export function FreeChatPage() {
  const navigate = useNavigate()
  const {
    bio, loveInterest, selectedUniverse, characterState, characterPortraits, characterAffinities, characterMemories,
    chatSummaries, choiceDescriptions, trustStatusLabel, revealSignature,
  } = useActiveStory()
  const { addChatMessage, setCharacterPortrait, updateAffinity, addCharacterMemory } = useStore()

  const characterIds = getUniverseCharacterIds(selectedUniverse, loveInterest)

  // Per-character state
  const [chatStates, setChatStates] = useState<Record<string, CharChatState>>(() => {
    const init: Record<string, CharChatState> = {}
    for (const id of characterIds) init[id] = freshCharState()
    return init
  })

  const [activeCharId, setActiveCharId] = useState(characterIds[0] ?? '')
  const [isTyping, setIsTyping] = useState(false)
  const [streamedReply, setStreamedReply] = useState('')
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const openerGeneratedFor = useRef<Set<string>>(new Set())

  const activeState = chatStates[activeCharId] ?? freshCharState()
  const activeCharData = getCharacter(activeCharId, selectedUniverse) ?? CHARACTERS[activeCharId]
  const portrait = characterPortraits[activeCharId] ?? null

  const storyContext = buildPlaythroughContext(
    chatSummaries, choiceDescriptions, characterState,
    trustStatusLabel, revealSignature, loveInterest,
  )

  // ─── Cross-character context ───

  const buildSceneContext = useCallback((forCharId: string): string => {
    const otherChats = characterIds
      .filter(id => id !== forCharId)
      .map(id => {
        const state = chatStates[id]
        if (!state || state.messages.length === 0) return null
        const charData = getCharacter(id, selectedUniverse) ?? CHARACTERS[id]
        const charName = charData?.name ?? id
        const recentMsgs = state.messages.slice(-4)
        const transcript = recentMsgs
          .map(m => `${m.role === 'user' ? 'Protagonist' : charName}: ${m.content}`)
          .join('\n')
        return `Recent exchange with ${charName} (${state.exchangeCount} exchanges):\n${transcript}`
      })
      .filter(Boolean)

    if (otherChats.length === 0) return ''
    return `SCENE CONTEXT — The protagonist has also been chatting with others:\n${otherChats.join('\n\n')}`
  }, [chatStates, characterIds, selectedUniverse])

  // ─── Generate portraits ───

  useEffect(() => {
    for (const id of characterIds) {
      const p = characterPortraits[id]
      const charData = getCharacter(id, selectedUniverse) ?? CHARACTERS[id]
      if (!p && charData?.portraitPrompt) {
        generateCharacterPortrait(charData.portraitPrompt).then(url => {
          if (url) setCharacterPortrait(id, url)
        })
      }
    }
  }, [])

  // ─── Generate opener for active character ───

  useEffect(() => {
    if (openerGeneratedFor.current.has(activeCharId)) return
    if (chatStates[activeCharId]?.hasOpener) return

    openerGeneratedFor.current.add(activeCharId)

    setChatStates(prev => ({
      ...prev,
      [activeCharId]: { ...prev[activeCharId], isLoadingOpener: true },
    }))

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
      const fallback = { role: 'character' as const, content: '...' }
      setChatStates(prev => ({
        ...prev,
        [activeCharId]: {
          ...prev[activeCharId],
          messages: [fallback],
          hasOpener: true,
          isLoadingOpener: false,
        },
      }))
      addChatMessage({ ...fallback, characterId: activeCharId, timestamp: Date.now() })
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
        maxExchanges: 999, // no limit in free chat
        characterState,
        bio,
        loveInterest,
        universeId: selectedUniverse,
        signal: abortRef.current.signal,
        sceneContext: sceneCtx || undefined,
        affinityScore: characterAffinities[activeCharId] ?? 0,
        characterMemories: characterMemories[activeCharId] ?? [],
      })

      for await (const chunk of gen) {
        fullReply += chunk
        setStreamedReply(fullReply)
      }

      const charMessage = { role: 'character' as const, content: fullReply }

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
      trackEvent('free_chat_exchange', { characterId: activeCharId, exchange: newExchange })

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

  // ─── Render ───

  const moodStages = getMoodStages(activeCharId)
  const currentMoodIdx = getMoodIndex(activeCharId, activeState.exchangeCount)

  return (
    <div className="flex flex-col h-screen h-dvh bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <button
          onClick={() => navigate('/reveal')}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surfaceAlt transition-colors"
        >
          <ArrowLeft size={18} className="text-textSecondary" />
        </button>
        <div>
          <p className="text-textPrimary text-sm font-medium">Free Chat</p>
          <p className="text-textMuted text-[11px]">The story's over. Just talk.</p>
        </div>
      </div>

      {/* Character tabs */}
      <div className="flex items-stretch border-b border-border">
        {characterIds.map(id => {
          const charData = getCharacter(id, selectedUniverse) ?? CHARACTERS[id]
          const charPortrait = characterPortraits[id] ?? null
          const isActive = id === activeCharId
          const charState = chatStates[id]
          const exchangeCount = charState?.exchangeCount ?? 0
          const hasTalked = exchangeCount > 0

          return (
            <button
              key={id}
              className="flex-1 flex items-center justify-center gap-2.5 py-3 px-3 transition-all relative"
              style={{
                background: isActive ? 'rgba(200,75,158,0.08)' : 'transparent',
                opacity: isActive ? 1 : 0.6,
              }}
              onClick={() => { if (!isTyping) setActiveCharId(id) }}
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
                <span className="text-textPrimary text-sm font-medium">{charData?.name ?? id}</span>
                <AffinityBadge score={characterAffinities[id] ?? 0} size="sm" />
              </div>
              {isActive && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ background: 'linear-gradient(90deg, #c84b9e 0%, #8b5cf6 100%)' }}
                  layoutId="free-chat-tab-indicator"
                />
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
            return (
              <div key={stage} className="flex items-center gap-1.5">
                {i > 0 && (
                  <div className="w-2 h-px" style={{ background: isPast ? 'rgba(200,75,158,0.5)' : 'rgba(255,255,255,0.1)' }} />
                )}
                <span
                  className="text-[10px] transition-all duration-300"
                  style={{
                    color: isActiveMood ? '#e060b8' : isPast ? 'rgba(200,75,158,0.5)' : 'rgba(255,255,255,0.25)',
                    fontWeight: isActiveMood ? 600 : 400,
                    fontStyle: 'italic',
                  }}
                >
                  {stage}
                </span>
              </div>
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
              <div className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-character'}`}>
                {msg.content}
              </div>
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
              {streamedReply}
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
        {/* Suggestion chips */}
        <AnimatePresence>
          {!isTyping && !activeState.isLoadingOpener && !input && (
            <motion.div
              className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.25 }}
            >
              {getFreeSuggestions(activeState.exchangeCount).map(suggestion => (
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
        </AnimatePresence>

        {/* Chat input */}
        <div className="flex gap-2">
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
