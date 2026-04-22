import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, MessageCircle } from 'lucide-react'
import { getCharacter, CHARACTERS } from '../data/characters'
import { getUniverseGenre } from '../data/storyHelpers'
import { useStore } from '../store/useStore'
import { useActiveStory } from '../hooks/useActiveStory'
import { streamChatReply, generateOpeningMessage } from '../lib/claudeStream'
import { getAffinityGrowth } from '../lib/affinity'
import { trackEvent } from '../lib/supabase'
import type { PingDef } from '../data/pings'

interface Props {
  ping: PingDef
  onDismiss: () => void
}

export function PingNotification({ ping, onDismiss }: Props) {
  const {
    bio, loveInterest, selectedUniverse, characterState,
    characterPortraits, characterAffinities,
  } = useActiveStory()
  const addChatMessage = useStore((s) => s.addChatMessage)
  const markPingSeen = useStore((s) => s.markPingSeen)
  const updateAffinity = useStore((s) => s.updateAffinity)

  // Resolve love interest for characterId
  const resolvedCharId = ping.characterId === 'jiwon'
    ? (loveInterest === 'yuna' ? 'yuna' : 'jiwon')
    : ping.characterId
  const charData = getCharacter(resolvedCharId, selectedUniverse) ?? CHARACTERS[resolvedCharId]
  const portrait = characterPortraits[resolvedCharId] ?? null

  const [phase, setPhase] = useState<'notification' | 'chat' | 'done'>('notification')
  const [pingMessage, setPingMessage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(true)
  const [messages, setMessages] = useState<{ role: 'user' | 'character'; content: string }[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [streamedReply, setStreamedReply] = useState('')
  const [exchangeCount, setExchangeCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const affinityScore = characterAffinities[resolvedCharId] ?? 0

  // Generate ping message on mount
  useEffect(() => {
    generateOpeningMessage({
      characterId: resolvedCharId,
      storyContext: `PING CONTEXT: ${ping.contextHint}. This is a character-initiated message — the character is texting the protagonist unprompted between story moments. Keep it SHORT (1-2 sentences). It should feel like a text message, not a speech.`,
      characterState,
      bio,
      loveInterest,
      universeId: selectedUniverse,
      affinityScore,
      genre: getUniverseGenre(selectedUniverse),
    }).then(result => {
      setPingMessage(result.content)
      setMessages([{ role: 'character', content: result.content }])
      setIsGenerating(false)
    }).catch(() => {
      const fallback = ping.staticMessage ?? '...'
      setPingMessage(fallback)
      setMessages([{ role: 'character', content: fallback }])
      setIsGenerating(false)
    })

    markPingSeen(ping.id)
    trackEvent('ping_received', { pingId: ping.id, characterId: resolvedCharId })
  }, [])

  // Auto-scroll in chat mode
  useEffect(() => {
    if (phase === 'chat') {
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [messages, streamedReply, phase])

  const handleOpen = () => {
    if (ping.maxReplies > 0) {
      setPhase('chat')
      trackEvent('ping_opened', { pingId: ping.id })
    } else {
      handleClose()
    }
  }

  const handleClose = () => {
    setPhase('done')
    setTimeout(onDismiss, 300)
  }

  const handleSend = async () => {
    if (!input.trim() || isTyping || exchangeCount >= ping.maxReplies) return

    const userMsg = input.trim()
    setInput('')

    const userMessage = { role: 'user' as const, content: userMsg }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    addChatMessage({ ...userMessage, characterId: resolvedCharId, timestamp: Date.now() })

    setIsTyping(true)
    setStreamedReply('')

    const newExchange = exchangeCount + 1
    const allMessages = newMessages.map(m => ({
      ...m,
      characterId: resolvedCharId,
      timestamp: Date.now(),
    }))

    const isLast = newExchange >= ping.maxReplies

    abortRef.current = new AbortController()
    try {
      let fullReply = ''
      const gen = streamChatReply({
        characterId: resolvedCharId,
        messages: allMessages,
        storyContext: `PING CONTEXT: ${ping.contextHint}. This is a quick text exchange — keep replies SHORT (1-2 sentences).${isLast ? ' This is your LAST reply. Wrap up naturally — you need to go, or the moment is ending.' : ''}`,
        exchangeNumber: newExchange,
        maxExchanges: ping.maxReplies,
        characterState,
        bio,
        loveInterest,
        universeId: selectedUniverse,
        signal: abortRef.current.signal,
        affinityScore,
        genre: getUniverseGenre(selectedUniverse),
      })

      for await (const chunk of gen) {
        fullReply += chunk
        setStreamedReply(fullReply)
      }

      const charMessage = { role: 'character' as const, content: fullReply }
      setMessages(prev => [...prev, charMessage])
      addChatMessage({ ...charMessage, characterId: resolvedCharId, timestamp: Date.now() })
      setStreamedReply('')
      setExchangeCount(newExchange)
      updateAffinity(resolvedCharId, getAffinityGrowth(newExchange))
      trackEvent('ping_reply', { pingId: ping.id, exchange: newExchange })
    } catch (e) {
      if (e instanceof Error && e.name !== 'AbortError') {
        const fallback = { role: 'character' as const, content: '...' }
        setMessages(prev => [...prev, fallback])
        setStreamedReply('')
      }
    } finally {
      setIsTyping(false)
    }
  }

  const reachedLimit = exchangeCount >= ping.maxReplies

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          className="fixed inset-x-0 bottom-20 z-50 flex flex-col items-center px-4 pb-6 safe-bottom pointer-events-none"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {phase === 'notification' && (
            <motion.div
              className="pointer-events-auto w-full max-w-[400px] rounded-2xl border border-border overflow-hidden"
              style={{ background: 'rgba(20,16,30,0.95)', backdropFilter: 'blur(20px)' }}
              layout
            >
              {/* Notification bar */}
              <button
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                onClick={handleOpen}
                disabled={isGenerating}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm overflow-hidden shrink-0 relative"
                  style={{ background: 'rgba(200,75,158,0.15)' }}
                >
                  {portrait ? (
                    <img src={portrait} alt={charData?.name} className="w-full h-full object-cover" />
                  ) : (
                    charData?.avatar ?? '💬'
                  )}
                  {/* Online indicator */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#14101e]" style={{ background: '#22c55e' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-textPrimary text-sm font-medium">{charData?.name ?? resolvedCharId}</p>
                  {isGenerating ? (
                    <p className="text-textMuted text-xs italic">typing...</p>
                  ) : (
                    <p className="text-textSecondary text-xs truncate">{pingMessage}</p>
                  )}
                </div>
                {ping.maxReplies > 0 && !isGenerating && (
                  <MessageCircle size={16} className="text-accent shrink-0" />
                )}
                <button
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-surfaceAlt transition-colors shrink-0"
                  onClick={(e) => { e.stopPropagation(); handleClose() }}
                >
                  <X size={14} className="text-textMuted" />
                </button>
              </button>
            </motion.div>
          )}

          {phase === 'chat' && (
            <motion.div
              className="pointer-events-auto w-full max-w-[400px] rounded-2xl border border-border overflow-hidden flex flex-col"
              style={{ background: 'rgba(20,16,30,0.98)', backdropFilter: 'blur(20px)', maxHeight: '60vh' }}
              layout
            >
              {/* Chat header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm overflow-hidden shrink-0"
                  style={{ background: 'rgba(200,75,158,0.15)' }}
                >
                  {portrait ? (
                    <img src={portrait} alt={charData?.name} className="w-full h-full object-cover" />
                  ) : (
                    charData?.avatar ?? '💬'
                  )}
                </div>
                <p className="text-textPrimary text-sm font-medium flex-1">{charData?.name ?? resolvedCharId}</p>
                <button
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-surfaceAlt transition-colors"
                  onClick={handleClose}
                >
                  <X size={14} className="text-textMuted" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5" style={{ maxHeight: '35vh' }}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className={`chat-bubble text-sm ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-character'}`}>
                      {msg.content}
                    </div>
                  </motion.div>
                ))}

                {isTyping && streamedReply && (
                  <motion.div className="flex justify-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="chat-bubble chat-bubble-character text-sm">
                      {streamedReply}
                      <span className="cursor-blink text-accent ml-0.5">|</span>
                    </div>
                  </motion.div>
                )}

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

              {/* Input or done */}
              <div className="px-4 py-3 border-t border-border">
                {reachedLimit ? (
                  <button
                    className="w-full py-2.5 rounded-xl text-sm font-medium text-textSecondary hover:text-textPrimary border border-border hover:border-accent transition-all"
                    onClick={handleClose}
                  >
                    Back to story
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSend()}
                      placeholder="Reply..."
                      className="flex-1 bg-surfaceAlt border border-border rounded-xl px-3 py-2.5 text-textPrimary text-sm placeholder:text-textMuted focus:outline-none focus:border-accent transition-colors"
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
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
