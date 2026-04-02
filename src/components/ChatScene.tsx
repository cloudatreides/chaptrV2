import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, ArrowRight } from 'lucide-react'
import { CHARACTERS, getCharacter } from '../data/characters'
import { useStore } from '../store/useStore'
import { useActiveStory } from '../hooks/useActiveStory'
import { streamChatReply, summarizeChat, generateOpeningMessage } from '../lib/claudeStream'
import { generateCharacterPortrait, generateSceneImage } from '../lib/togetherAi'
import { trackEvent } from '../lib/supabase'

// Mood labels based on exchange count — feels organic, not mechanical
function getMoodLabel(characterId: string, exchangeCount: number): string {
  if (characterId === 'sora') {
    if (exchangeCount <= 1) return 'curious'
    if (exchangeCount <= 3) return 'vibing'
    if (exchangeCount <= 6) return 'in the groove'
    return 'real talk'
  }
  // Jiwon
  if (exchangeCount <= 1) return 'guarded'
  if (exchangeCount <= 3) return 'warming up'
  if (exchangeCount <= 6) return 'opening up'
  return 'vulnerable'
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
    opening: ["I'm just passing through.", "...go on.", "You seem like you have a lot on your mind."],
    mid: ["Tell me more.", "I noticed that too.", "Take your time."],
    deep: ["I think I understand.", "You don't have to explain.", "I'm not going anywhere."],
  },
  bold: {
    opening: ["So, what's really going on here?", "Cut the small talk.", "I've heard about you."],
    mid: ["That doesn't add up.", "Prove it.", "What are you not telling me?"],
    deep: ["I need the truth. Now.", "I'm not afraid of this.", "Let's stop pretending."],
  },
  dreamer: {
    opening: ["This place feels different.", "I had a feeling I'd end up here.", "There's something in the air..."],
    mid: ["What does that remind you of?", "I keep thinking about that.", "It's almost like it was meant to happen."],
    deep: ["Do you ever feel like you're part of something bigger?", "I think we both know what this is.", "Some things don't need words."],
  },
  custom: {
    opening: ["Hey.", "Tell me about yourself.", "What's on your mind?"],
    mid: ["That's interesting.", "Keep going.", "I wasn't expecting that."],
    deep: ["I trust you.", "What happens next?", "I want to understand."],
  },
}

function getSuggestions(bio: string | null, exchangeCount: number): string[] {
  const type = detectPersonality(bio)
  const pool = SUGGESTIONS[type]
  if (exchangeCount <= 1) return pool.opening
  if (exchangeCount <= 4) return pool.mid
  return pool.deep
}

interface Props {
  stepId: string
  characterId: string
  maxExchanges: number
  minExchanges?: number
  storyContext: string
  onComplete: () => void
}

export function ChatScene({ stepId, characterId, maxExchanges, minExchanges = 3, storyContext, onComplete }: Props) {
  const { bio, loveInterest, selectedUniverse, characterState, characterPortraits } = useActiveStory()
  const { addChatMessage, setChatSummary, setCharacterPortrait } = useStore()
  const character = getCharacter(characterId, selectedUniverse) ?? CHARACTERS[characterId]
  const [localMessages, setLocalMessages] = useState<{ role: 'user' | 'character'; content: string }[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [streamedReply, setStreamedReply] = useState('')
  const [exchangeCount, setExchangeCount] = useState(0)
  const [isDone, setIsDone] = useState(false)
  const [isLoadingOpener, setIsLoadingOpener] = useState(true)
  const [introImage, setIntroImage] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const hasGeneratedOpener = useRef(false)

  const canContinue = exchangeCount >= minExchanges && !isTyping
  const moodLabel = getMoodLabel(characterId, exchangeCount)
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
      if (character?.introImagePrompt) {
        generateSceneImage({ prompt: character.introImagePrompt, width: 768, height: 512 }).then((url) => {
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
    if (!input.trim() || isTyping || isDone) return

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
      trackEvent('chat_exchange', { characterId, exchange: newExchange })

      if (newExchange >= maxExchanges) {
        setIsDone(true)
        handleChatComplete([...localMessages, userMessage, charMessage])
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
    if (!isDone) {
      await handleChatComplete(localMessages)
    }
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
          <p className="text-textPrimary font-semibold text-sm">{character?.name ?? characterId}</p>
          <motion.p
            key={moodLabel}
            className="text-textMuted text-xs italic"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {isDone ? 'Conversation ended' : moodLabel}
          </motion.p>
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
          {(canContinue || isDone) && (
            <motion.button
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: isDone
                  ? 'linear-gradient(135deg, #c84b9e 0%, #8b5cf6 100%)'
                  : 'rgba(200,75,158,0.12)',
                color: isDone ? '#fff' : '#c84b9e',
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
        {!isDone && !isTyping && !isLoadingOpener && !input && (
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

        {/* Chat input — hidden when fully done */}
        {!isDone && (
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
        )}
      </div>
    </div>
  )
}
