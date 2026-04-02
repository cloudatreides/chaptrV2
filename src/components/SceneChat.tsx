import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, ArrowRight } from 'lucide-react'
import { getCharacter, CHARACTERS } from '../data/characters'
import { useStore } from '../store/useStore'
import { useActiveStory } from '../hooks/useActiveStory'
import { streamChatReply, summarizeChat, generateOpeningMessage } from '../lib/claudeStream'
import { generateCharacterPortrait, generateSceneImage } from '../lib/togetherAi'
import { trackEvent } from '../lib/supabase'
import { getAffinityGrowth } from '../lib/affinity'
import { AffinityBadge } from './AffinityBadge'
import type { SceneCharacter } from '../data/storyData'

// ─── Mood stages (reused from ChatScene) ───

const MOOD_STAGES: Record<string, string[]> = {
  default: ['guarded', 'warming up', 'opening up', 'vulnerable'],
  sora: ['curious', 'vibing', 'in the groove', 'real talk'],
}

function getMoodIndex(_characterId: string, exchangeCount: number): number {
  if (exchangeCount <= 1) return 0
  if (exchangeCount <= 3) return 1
  if (exchangeCount <= 6) return 2
  return 3
}

function getMoodStages(characterId: string): string[] {
  return MOOD_STAGES[characterId] ?? MOOD_STAGES.default
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
    opening: ["I'm just passing through.", "...go on.", "You seem like you have a lot on your mind.", "I'll just listen.", "Don't mind me.", "Sorry — I didn't mean to stare."],
    mid: ["Tell me more.", "I noticed that too.", "Take your time.", "That's a lot to carry.", "I've been thinking about what you said.", "You don't have to talk about it if you don't want to."],
    deep: ["I think I understand.", "You don't have to explain.", "I'm not going anywhere.", "I see you.", "We don't have to figure it out right now.", "I'm glad you told me."],
  },
  bold: {
    opening: ["So, what's really going on here?", "Cut the small talk.", "I've heard about you.", "You don't seem like everyone else here.", "Alright, impress me.", "I have a feeling about you."],
    mid: ["That doesn't add up.", "Prove it.", "What are you not telling me?", "I'm calling your bluff.", "You're holding back.", "Say that again — slower."],
    deep: ["I need the truth. Now.", "I'm not afraid of this.", "Let's stop pretending.", "I didn't come this far to back down.", "You know I'm right.", "No more games."],
  },
  dreamer: {
    opening: ["This place feels different.", "I had a feeling I'd end up here.", "There's something in the air...", "Have we met before?", "I keep getting this feeling...", "The light here is different."],
    mid: ["What does that remind you of?", "I keep thinking about that.", "It's almost like it was meant to happen.", "Do you believe in signs?", "I dreamed about something like this.", "Tell me what you see when you close your eyes."],
    deep: ["Do you ever feel like you're part of something bigger?", "I think we both know what this is.", "Some things don't need words.", "Maybe this is exactly where we're supposed to be.", "I don't want to wake up from this.", "What if this is the real version?"],
  },
  custom: {
    opening: ["Hey.", "Tell me about yourself.", "What's on your mind?", "I'm curious about you.", "So... what now?", "This is new for me."],
    mid: ["That's interesting.", "Keep going.", "I wasn't expecting that.", "Really?", "Makes sense actually.", "Huh. I didn't think of it that way."],
    deep: ["I trust you.", "What happens next?", "I want to understand.", "I'm glad I'm here.", "Whatever happens, I'm in.", "I don't regret any of this."],
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
  messages: { role: 'user' | 'character'; content: string }[]
  exchangeCount: number
  isDone: boolean
  hasOpener: boolean
  isLoadingOpener: boolean
  introImage: string | null
}

function freshCharState(): CharChatState {
  return { messages: [], exchangeCount: 0, isDone: false, hasOpener: false, isLoadingOpener: false, introImage: null }
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
  const { bio, loveInterest, selectedUniverse, characterState, characterPortraits, characterAffinities } = useActiveStory()
  const { addChatMessage, setChatSummary, setCharacterPortrait, updateAffinity } = useStore()

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
      if (!p && charData?.portraitPrompt) {
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

    // Generate intro image in parallel (chatImagePrompt overrides character default)
    const imagePrompt = chatImagePrompt ?? charData?.introImagePrompt
    if (imagePrompt) {
      generateSceneImage({ prompt: imagePrompt, width: 768, height: 512 }).then(url => {
        if (url) {
          setChatStates(prev => ({
            ...prev,
            [activeCharId]: { ...prev[activeCharId], introImage: url },
          }))
        }
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
      trackEvent('chat_exchange', { characterId: activeCharId, exchange: newExchange, isScene: true })
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
  const currentMoodIdx = getMoodIndex(activeCharId, activeState.exchangeCount)

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
                <AffinityBadge score={characterAffinities[sc.characterId] ?? 0} size="sm" />
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
        {/* Continue story button */}
        <AnimatePresence>
          {canContinueScene && (
            <motion.button
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: 'linear-gradient(135deg, #c84b9e 0%, #8b5cf6 100%)',
                color: '#fff',
              }}
              onClick={handleContinue}
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
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
