import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, ArrowRight } from 'lucide-react'
import { getCharacter, CHARACTERS } from '../data/characters'
import { getUniverseGenre } from '../data/storyData'
import { useStore } from '../store/useStore'
import { streamChatReply } from '../lib/claudeStream'
import { getAffinityGrowth } from '../lib/affinity'
import type { AmbientPingDef } from '../data/ambientPings'

interface Props {
  ping: AmbientPingDef
  onDismiss: () => void
}

export function AmbientPingModal({ ping, onDismiss }: Props) {
  const navigate = useNavigate()
  const globalAffinities = useStore((s) => s.globalAffinities)
  const addAmbientPingReply = useStore((s) => s.addAmbientPingReply)
  const markAmbientPingRead = useStore((s) => s.markAmbientPingRead)
  const updateGlobalAffinity = useStore((s) => s.updateGlobalAffinity)

  const charData = getCharacter(ping.characterId, ping.universeId) ?? CHARACTERS[ping.characterId]
  const affinityScore = globalAffinities[ping.characterId] ?? 0

  const [messages, setMessages] = useState<{ role: 'user' | 'character'; content: string }[]>([
    { role: 'character', content: ping.message },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [streamedReply, setStreamedReply] = useState('')
  const [exchangeCount, setExchangeCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    markAmbientPingRead(ping.id)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 50)
    return () => clearTimeout(timer)
  }, [messages, streamedReply])

  const handleSend = async () => {
    if (!input.trim() || isTyping || exchangeCount >= ping.maxReplies) return

    const userMsg = input.trim()
    setInput('')

    const userMessage = { role: 'user' as const, content: userMsg }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)

    setIsTyping(true)
    setStreamedReply('')

    const newExchange = exchangeCount + 1
    const allMessages = newMessages.map(m => ({
      ...m,
      characterId: ping.characterId,
      timestamp: Date.now(),
    }))

    const isLast = newExchange >= ping.maxReplies

    abortRef.current = new AbortController()
    try {
      let fullReply = ''
      const gen = streamChatReply({
        characterId: ping.characterId,
        messages: allMessages,
        storyContext: `AMBIENT PING: ${ping.contextHint}. This is a text exchange while the protagonist is away from the story. Keep replies SHORT (1-2 sentences).${isLast ? ' This is your LAST reply. Wrap up naturally.' : ''}`,
        exchangeNumber: newExchange,
        maxExchanges: ping.maxReplies,
        characterState: { junhoTrust: 50 },
        bio: null,
        loveInterest: null,
        universeId: ping.universeId,
        signal: abortRef.current.signal,
        affinityScore,
        genre: getUniverseGenre(ping.universeId),
      })

      for await (const chunk of gen) {
        fullReply += chunk
        const displayText = fullReply
          .replace(/\{[^{}]*"trustDelta"[^{}]*\}?/g, '')
          .replace(/\{[^{}]*"trustDelta"[^{}]*/g, '')
          .replace(/\n?\[AFFINITY:[+-]?\d*\]?\s*$/g, '')
          .trimEnd()
        setStreamedReply(displayText)
      }

      const cleanReply = fullReply
        .replace(/\n?\[AFFINITY:[+-]?\d+\]\s*$/g, '')
        .replace(/\{[^{}]*"trustDelta"[^{}]*\}/g, '')
        .trim()
      const charMessage = { role: 'character' as const, content: cleanReply }
      setMessages(prev => [...prev, charMessage])
      addAmbientPingReply(ping.id, { role: 'character', content: fullReply, characterId: ping.characterId, timestamp: Date.now() })
      setStreamedReply('')
      setExchangeCount(newExchange)
      updateGlobalAffinity(ping.characterId, Math.min(100, affinityScore + getAffinityGrowth(newExchange)))
    } catch (e) {
      if (e instanceof Error && e.name !== 'AbortError') {
        setMessages(prev => [...prev, { role: 'character', content: '...' }])
        setStreamedReply('')
      }
    } finally {
      setIsTyping(false)
    }
  }

  const reachedLimit = exchangeCount >= ping.maxReplies

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/60"
          onClick={onDismiss}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-[420px] rounded-2xl border border-border overflow-hidden flex flex-col"
          style={{ background: 'rgba(20,16,30,0.98)', backdropFilter: 'blur(20px)', maxHeight: '70vh' }}
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm overflow-hidden shrink-0 relative"
              style={{ background: 'rgba(200,75,158,0.15)' }}
            >
              {charData?.staticPortrait ? (
                <img src={charData.staticPortrait} alt={charData.name} className="w-full h-full object-cover" />
              ) : (
                charData?.avatar ?? '💬'
              )}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#14101e]" style={{ background: '#22c55e' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium">{charData?.name ?? ping.characterId}</p>
              <p className="text-white/30 text-[10px]">reached out while you were away</p>
            </div>
            <button
              className="text-accent/60 hover:text-accent text-[11px] font-medium transition-colors mr-1"
              onClick={() => {
                onDismiss()
                navigate(`/cast/${ping.characterId}`)
              }}
            >
              Full chat
            </button>
            <button
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors"
              onClick={onDismiss}
            >
              <X size={14} className="text-white/40" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5" style={{ maxHeight: '40vh' }}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-accent/20 text-white rounded-br-md'
                      : 'bg-white/5 text-white/80 rounded-bl-md'
                  }`}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}

            {isTyping && streamedReply && (
              <motion.div className="flex justify-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="max-w-[80%] px-3 py-2 rounded-2xl rounded-bl-md bg-white/5 text-white/80 text-sm">
                  {streamedReply}
                  <span className="text-accent ml-0.5 animate-pulse">|</span>
                </div>
              </motion.div>
            )}

            {isTyping && !streamedReply && (
              <motion.div className="flex justify-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="max-w-[80%] px-3 py-2 rounded-2xl rounded-bl-md bg-white/5 flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-border">
            {reachedLimit ? (
              <div className="flex flex-col gap-2">
                <button
                  className="w-full py-2.5 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2 transition-all hover:brightness-110"
                  style={{ background: 'linear-gradient(135deg, #c84b9e 0%, #8b5cf6 100%)' }}
                  onClick={() => {
                    onDismiss()
                    navigate(`/cast/${ping.characterId}`)
                  }}
                >
                  Continue chatting <ArrowRight size={14} />
                </button>
                <button
                  className="w-full py-2 rounded-xl text-xs font-medium text-white/40 hover:text-white/60 transition-all"
                  onClick={onDismiss}
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Reply..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-white/35 focus:outline-none focus:border-accent/50 transition-colors"
                  disabled={isTyping}
                  autoFocus
                  enterKeyHint="send"
                  autoComplete="off"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-30"
                  style={{ background: 'linear-gradient(135deg, #c84b9e 0%, #8b5cf6 100%)' }}
                >
                  <Send size={14} className="text-white" />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
