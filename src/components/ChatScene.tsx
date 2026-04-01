import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send } from 'lucide-react'
import { CHARACTERS } from '../data/characters'
import { useStore } from '../store/useStore'
import { streamChatReply, summarizeChat } from '../lib/claudeStream'

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY ?? ''

interface Props {
  stepId: string
  characterId: string
  maxExchanges: number
  storyContext: string
  onComplete: () => void
}

export function ChatScene({ stepId, characterId, maxExchanges, storyContext, onComplete }: Props) {
  const character = CHARACTERS[characterId]
  const { chatHistory, addChatMessage, setChatSummary, characterState, bio } = useStore()

  // Messages for THIS chat scene only
  const sceneMessages = chatHistory.filter(
    (m) => m.characterId === characterId && m.timestamp >= (sceneStartRef.current ?? 0)
  )
  const sceneStartRef = useRef(Date.now())
  const [localMessages, setLocalMessages] = useState<{ role: 'user' | 'character'; content: string }[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [streamedReply, setStreamedReply] = useState('')
  const [exchangeCount, setExchangeCount] = useState(0)
  const [isDone, setIsDone] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [localMessages, streamedReply])

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
        ? ['...hey.', 'Hm. Interesting.', "I don't usually talk to people here.", 'You ask a lot of questions.', "I should go. They're waiting for me."]
        : ['omg hi!! you must be new~', 'ngl this place is wild lol', 'you should totally come to the showcase!', 'wait do you know about Jiwon?? 👀', "ok I gotta run but let's talk later!!"]
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

  const handleContinue = () => {
    onComplete()
  }

  // Exchange dots indicator
  const dots = Array.from({ length: maxExchanges }, (_, i) => i < exchangeCount)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: 'rgba(200,75,158,0.15)' }}>
          {character?.avatar ?? '💬'}
        </div>
        <div className="flex-1">
          <p className="text-textPrimary font-semibold text-sm">{character?.name ?? characterId}</p>
          <p className="text-textMuted text-xs">
            {isDone ? 'Conversation ended' : `${exchangeCount}/${maxExchanges} exchanges`}
          </p>
        </div>
        {/* Exchange dots */}
        <div className="flex gap-1.5">
          {dots.map((used, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                background: used ? '#c84b9e' : 'rgba(200,75,158,0.2)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {/* Intro message */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-textMuted text-xs text-center px-4 py-2 rounded-full" style={{ background: 'rgba(42,32,64,0.4)' }}>
            {character?.name} wants to talk
          </p>
        </motion.div>

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

      {/* Input / Continue */}
      <AnimatePresence mode="wait">
        {isDone ? (
          <motion.div
            key="continue"
            className="px-5 pb-6 pt-3 safe-bottom"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button className="choice-btn justify-center w-full" onClick={handleContinue}>
              Continue the story →
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="input"
            className="px-5 pb-6 pt-3 border-t border-border safe-bottom"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={`Say something to ${character?.name ?? 'them'}...`}
                className="flex-1 bg-surfaceAlt border border-border rounded-xl px-4 py-3 text-textPrimary text-sm placeholder:text-textMuted focus:outline-none focus:border-accent transition-colors"
                disabled={isTyping}
                autoFocus
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-30"
                style={{ background: 'linear-gradient(135deg, #c84b9e 0%, #8b5cf6 100%)' }}
              >
                <Send size={16} className="text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
