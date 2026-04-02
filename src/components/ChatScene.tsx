import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, ArrowRight } from 'lucide-react'
import { CHARACTERS, getCharacter } from '../data/characters'
import { useStore } from '../store/useStore'
import { useActiveStory } from '../hooks/useActiveStory'
import { streamChatReply, summarizeChat, generateOpeningMessage } from '../lib/claudeStream'
import { generateCharacterPortrait, generateSceneImage } from '../lib/togetherAi'
import { trackEvent } from '../lib/supabase'
import { getAffinityGrowth } from '../lib/affinity'
import { AffinityBadge } from './AffinityBadge'

// Mood labels based on exchange count — feels organic, not mechanical
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

// Personality-aware reply suggestions
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
  // Simple seeded shuffle so same exchangeCount gives consistent picks
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
  const { bio, loveInterest, selectedUniverse, characterState, characterPortraits, characterAffinities, selfieUrl } = useActiveStory()
  const { addChatMessage, setChatSummary, setCharacterPortrait, updateAffinity } = useStore()
  const affinityScore = characterAffinities[characterId] ?? 0
  const character = getCharacter(characterId, selectedUniverse) ?? CHARACTERS[characterId]
  const [localMessages, setLocalMessages] = useState<{ role: 'user' | 'character'; content: string }[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [streamedReply, setStreamedReply] = useState('')
  const [exchangeCount, setExchangeCount] = useState(0)
  const [isLoadingOpener, setIsLoadingOpener] = useState(true)
  const [introImage, setIntroImage] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const hasGeneratedOpener = useRef(false)

  const canContinue = exchangeCount >= minExchanges && !isTyping
  const portrait = characterPortraits[characterId] ?? null

  // Generate character portrait if not cached
  useEffect(() => {
    if (portrait || !character?.portraitPrompt) return
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

      // Generate intro image in parallel (fire and forget)
      const imagePrompt = chatImagePrompt ?? character?.introImagePrompt
      if (imagePrompt) {
        generateSceneImage({ prompt: imagePrompt, width: 768, height: 512, referenceImageUrl: selfieUrl }).then((url) => {
          if (url) setIntroImage(url)
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
        })
        const charMessage = { role: 'character' as const, content: opening }
        setLocalMessages([charMessage])
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

  const handleSend = async () => {
    if (!input.trim() || isTyping) return

    const userMsg = input.trim()
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
      })

      for await (const chunk of gen) {
        fullReply += chunk
        setStreamedReply(fullReply)
      }

      const charMessage = { role: 'character' as const, content: fullReply }
      setLocalMessages((prev) => [...prev, charMessage])
      addChatMessage({ ...charMessage, characterId, timestamp: Date.now() })
      setStreamedReply('')
      setExchangeCount(newExchange)
      updateAffinity(characterId, getAffinityGrowth(newExchange))
      trackEvent('chat_exchange', { characterId, exchange: newExchange })

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
            <AffinityBadge score={affinityScore} size="sm" />
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
              {getMoodStages(characterId).map((stage, i) => {
                const currentIdx = getMoodIndex(characterId, exchangeCount)
                const isActive = i === currentIdx
                const isPast = i < currentIdx
                return (
                  <div key={stage} className="flex items-center gap-1.5">
                    {i > 0 && <div className="w-2 h-px" style={{ background: isPast ? 'rgba(200,75,158,0.5)' : 'rgba(255,255,255,0.1)' }} />}
                    <span
                      className="text-[10px] transition-all duration-300"
                      style={{
                        color: isActive ? '#e060b8' : isPast ? 'rgba(200,75,158,0.5)' : 'rgba(255,255,255,0.25)',
                        fontWeight: isActive ? 600 : 400,
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
                <img src={introImage} alt={character?.name} className="w-full h-auto" />
              </motion.div>
            )}
            <div className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'character' && (
                <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 mb-0.5" style={{ background: 'rgba(200,75,158,0.15)' }}>
                  {portrait ? (
                    <img src={portrait} alt={character?.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center text-xs">{character?.avatar}</span>
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
                <img src={portrait} alt={character?.name} className="w-full h-full object-cover" />
              ) : (
                <span className="w-full h-full flex items-center justify-center text-xs">{character?.avatar}</span>
              )}
            </div>
            <div className="chat-bubble chat-bubble-character">
              {streamedReply}
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
          {canContinue && (
            <motion.button
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: 'rgba(200,75,158,0.12)',
                color: '#c84b9e',
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

        {/* Suggestion chips — personality-aware */}
        {!isTyping && !isLoadingOpener && !input && (
          <motion.div
            className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {getSuggestions(bio, exchangeCount).map((suggestion) => (
              <button
                key={suggestion}
                className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap hover:brightness-125"
                style={{
                  background: 'rgba(200,75,158,0.1)',
                  border: '1px solid rgba(200,75,158,0.2)',
                  color: 'rgba(200,75,158,0.8)',
                }}
                onClick={() => {
                  setInput(suggestion)
                }}
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
              onClick={handleSend}
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
