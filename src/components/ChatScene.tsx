import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, ArrowRight } from 'lucide-react'
import { CHARACTERS } from '../data/characters'
import { useStore } from '../store/useStore'
import { streamChatReply, summarizeChat, generateOpeningMessage } from '../lib/claudeStream'

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY ?? ''

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

interface Props {
  stepId: string
  characterId: string
  maxExchanges: number
  minExchanges?: number
  storyContext: string
  onComplete: () => void
}

export function ChatScene({ stepId, characterId, maxExchanges, minExchanges = 3, storyContext, onComplete }: Props) {
  const character = CHARACTERS[characterId]
  const { addChatMessage, setChatSummary, characterState, bio } = useStore()
  const [localMessages, setLocalMessages] = useState<{ role: 'user' | 'character'; content: string }[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [streamedReply, setStreamedReply] = useState('')
  const [exchangeCount, setExchangeCount] = useState(0)
  const [isDone, setIsDone] = useState(false)
  const [isLoadingOpener, setIsLoadingOpener] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const hasGeneratedOpener = useRef(false)

  const canContinue = exchangeCount >= minExchanges && !isTyping
  const moodLabel = getMoodLabel(characterId, exchangeCount)

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

      if (!API_KEY) {
        const fallback = characterId === 'jiwon'
          ? '...hey. You're the new transfer, right?'
          : 'omg hi!! you must be new here~ I'm Sora!'
        await new Promise((r) => setTimeout(r, 800))
        const charMessage = { role: 'character' as const, content: fallback }
        setLocalMessages([charMessage])
        addChatMessage({ ...charMessage, characterId, timestamp: Date.now() })
        setIsLoadingOpener(false)
        return
      }

      try {
        const opening = await generateOpeningMessage({
          characterId,
          storyContext,
          characterState,
          bio,
          apiKey: API_KEY,
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

    if (!API_KEY) {
      // Fallback
      const fallback = characterId === 'jiwon'
        ? ['Hm. Interesting.', "I don't usually talk to people here.", 'You ask a lot of questions.', '...maybe.', 'You're different from what I expected.', "I should go. They're waiting for me."]
        : ['ngl this place is wild lol', 'you should totally come to the showcase!', 'wait do you know about Jiwon?? 👀', 'he's not what people think~', 'trust me on this one lol', "ok I gotta run but let's talk later!!"]
      const reply = fallback[Math.min(newExchange - 1, fallback.length - 1)]
      await new Promise((r) => setTimeout(r, 800))
      setStreamedReply(reply)
      const charMessage = { role: 'character' as const, content: reply }
      setLocalMessages((prev) => [...prev, charMessage])
      addChatMessage({ ...charMessage, characterId, timestamp: Date.now() })
      setStreamedReply('')
      setIsTyping(false)
      setExchangeCount(newExchange)
      if (newExchange >= maxExchanges) {
        setIsDone(true)
        handleChatComplete([...localMessages, userMessage, charMessage])
      }
      return
    }

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
        apiKey: API_KEY,
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
    if (API_KEY) {
      const summary = await summarizeChat({
        characterId,
        messages: msgs.map((m) => ({ ...m, characterId, timestamp: 0 })),
        apiKey: API_KEY,
      })
      setChatSummary(stepId, summary)
    } else {
      setChatSummary(stepId, `Brief conversation with ${character?.name ?? characterId}.`)
    }
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
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: 'rgba(200,75,158,0.15)' }}>
          {character?.avatar ?? '💬'}
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
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-character'}`}>
              {msg.content}
            </div>
          </motion.div>
        ))}

        {/* Streaming reply */}
        {isTyping && streamedReply && (
          <motion.div className="flex justify-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="chat-bubble chat-bubble-character">
              {streamedReply}
              <span className="cursor-blink text-accent ml-0.5">|</span>
            </div>
          </motion.div>
        )}

        {/* Typing indicator */}
        {isTyping && !streamedReply && (
          <motion.div className="flex justify-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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
