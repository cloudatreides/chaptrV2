import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Send, Brain, Info } from 'lucide-react'
import { useStore } from '../store/useStore'
import { CAST_ROSTER, getCastCharacter } from '../data/castRoster'
import { getAffinityTier, getAffinityGrowth } from '../lib/affinity'
import { streamChatReply, extractMemories } from '../lib/claudeStream'
import type { CastChatMessage } from '../store/useStore'

export function CastChatPage() {
  const { characterId } = useParams<{ characterId: string }>()
  const navigate = useNavigate()

  const castMember = CAST_ROSTER.find((c) => c.id === characterId)
  const charData = castMember ? getCastCharacter(castMember) : undefined

  const unlockedCastIds = useStore((s) => s.unlockedCastIds)
  const castChatThreads = useStore((s) => s.castChatThreads)
  const globalAffinities = useStore((s) => s.globalAffinities)
  const addCastChatMessage = useStore((s) => s.addCastChatMessage)
  const updateGlobalAffinity = useStore((s) => s.updateGlobalAffinity)
  const characters = useStore((s) => s.characters)
  const isStreaming = useStore((s) => s.isStreaming)
  const setIsStreaming = useStore((s) => s.setIsStreaming)

  const [input, setInput] = useState('')
  const [streamingContent, setStreamingContent] = useState('')
  const [memoryToast, setMemoryToast] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const messages = castChatThreads[characterId ?? ''] ?? []
  const score = globalAffinities[characterId ?? ''] ?? 0
  const tier = getAffinityTier(score)
  const isUnlocked = unlockedCastIds.includes(characterId ?? '')
  const playerChar = characters[0]

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length, streamingContent])

  // Redirect if not unlocked
  useEffect(() => {
    if (characterId && !isUnlocked) navigate('/cast', { replace: true })
  }, [characterId, isUnlocked, navigate])

  const exchangeCount = messages.filter((m) => m.role === 'user').length

  const handleSend = useCallback(async () => {
    if (!input.trim() || !characterId || !charData || isStreaming) return

    const userMsg: CastChatMessage = { role: 'user', content: input.trim(), timestamp: Date.now() }
    addCastChatMessage(characterId, userMsg)
    setInput('')
    setIsStreaming(true)
    setStreamingContent('')

    const abortController = new AbortController()
    abortRef.current = abortController

    // Build messages for Claude (cast as ChatMessage for type compat)
    const recentMessages = [...messages, userMsg].slice(-20).map((m) => ({
      role: m.role,
      content: m.content,
      characterId: characterId,
      timestamp: m.timestamp,
    }))

    // Collect character memories from all playthroughs
    const storyProgress = useStore.getState().storyProgress
    const allMemories: string[] = []
    for (const prog of Object.values(storyProgress)) {
      const mems = prog.characterMemories[characterId] ?? []
      allMemories.push(...mems)
    }
    const uniqueMemories = [...new Set(allMemories)].slice(0, 10)

    try {
      let fullReply = ''
      const stream = streamChatReply({
        characterId,
        messages: recentMessages,
        storyContext: `This is a persistent chat outside of any story. The protagonist is chatting freely with ${charData.name}. There is no exchange limit. Be natural and continue building the relationship.`,
        exchangeNumber: exchangeCount + 1,
        maxExchanges: 999,
        characterState: { junhoTrust: score },
        bio: playerChar?.bio ?? null,
        loveInterest: null,
        universeId: castMember?.universeId ?? null,
        signal: abortController.signal,
        sceneContext: undefined,
        affinityScore: score,
        characterMemories: uniqueMemories,
        globalAffinityScore: score,
        previousPlaythroughs: useStore.getState().playthroughHistory,
      })

      for await (const chunk of stream) {
        fullReply += chunk
        setStreamingContent(fullReply)
      }

      if (fullReply.trim()) {
        const charMsg: CastChatMessage = { role: 'character', content: fullReply.trim(), timestamp: Date.now() }
        addCastChatMessage(characterId, charMsg)

        // Affinity growth
        const growth = getAffinityGrowth(exchangeCount + 1)
        updateGlobalAffinity(characterId, Math.min(100, score + growth))

        // Memory extraction every 2nd exchange
        if ((exchangeCount + 1) % 2 === 0) {
          const lastFew = [...messages, userMsg, { role: 'character' as const, content: fullReply.trim(), timestamp: Date.now() }].slice(-4)
          extractMemories({
            characterId,
            messages: lastFew.map((m) => ({ role: m.role, content: m.content, characterId: characterId, timestamp: m.timestamp })),
          }).then((memories) => {
            if (memories.length > 0) {
              const addMem = useStore.getState().addCharacterMemory
              // Use first playthrough key or create a global one
              const state = useStore.getState()
              const key = state.activeCharacterId && state.selectedUniverse
                ? `${state.activeCharacterId}:${state.selectedUniverse}`
                : Object.keys(state.storyProgress)[0]
              if (key) {
                for (const mem of memories) addMem(characterId, mem)
              }
              setMemoryToast(`${charData.name} remembered: ${memories[0]}`)
              setTimeout(() => setMemoryToast(null), 4000)
            }
          }).catch(() => {})
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') console.error('Cast chat error:', err)
    } finally {
      setIsStreaming(false)
      setStreamingContent('')
    }
  }, [input, characterId, charData, isStreaming, messages, score, exchangeCount, playerChar, castMember, addCastChatMessage, setIsStreaming, updateGlobalAffinity])

  // Collect character memories for sidebar
  const allMemories = (() => {
    const storyProg = useStore.getState().storyProgress
    const mems: string[] = []
    for (const prog of Object.values(storyProg)) {
      mems.push(...(prog.characterMemories[characterId ?? ''] ?? []))
    }
    return [...new Set(mems)].slice(0, 10)
  })()

  if (!castMember || !charData) {
    return <div className="bg-bg min-h-screen flex items-center justify-center text-white/40">Character not found</div>
  }

  // ─── Shared sub-components ───

  const CharacterAvatar = ({ size = 'w-7 h-7', textSize = 'text-xs' }: { size?: string; textSize?: string }) => (
    <div className={`${size} rounded-full overflow-hidden shrink-0`} style={{ background: '#1A1624' }}>
      {charData.staticPortrait ? (
        <img src={charData.staticPortrait} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className={`w-full h-full flex items-center justify-center ${textSize}`}>{charData.avatar}</div>
      )}
    </div>
  )

  const MessageList = () => (
    <>
      {messages.length === 0 && !isStreaming && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center py-12">
          <p className="text-white/20 text-sm">Start chatting with {castMember.name}</p>
          <p className="text-white/10 text-xs">No exchange limit · Memories carry into stories</p>
        </div>
      )}

      {messages.map((msg, i) => (
        <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : ''}`}>
          {msg.role === 'character' && <CharacterAvatar />}
          <div
            className="max-w-[80%] px-3.5 py-2.5 text-[13px] leading-relaxed"
            style={{
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, rgba(200,75,158,0.25), rgba(139,92,246,0.25))'
                : '#1A1624',
              color: msg.role === 'user' ? '#fff' : '#E8E3F0',
              borderRadius: msg.role === 'user' ? '14px 2px 14px 14px' : '2px 14px 14px 14px',
            }}
          >
            {msg.content}
          </div>
        </div>
      ))}

      {isStreaming && streamingContent && (
        <div className="flex gap-2.5">
          <CharacterAvatar />
          <div className="max-w-[80%] px-3.5 py-2.5 text-[13px] leading-relaxed" style={{ background: '#1A1624', color: '#E8E3F0', borderRadius: '2px 14px 14px 14px' }}>
            {streamingContent}
            <span className="inline-block w-1.5 h-4 bg-accent/50 ml-0.5 animate-pulse" />
          </div>
        </div>
      )}

      {isStreaming && !streamingContent && (
        <div className="flex gap-2.5">
          <CharacterAvatar />
          <div className="px-4 py-3 rounded-[2px_14px_14px_14px] flex gap-1.5 items-center" style={{ background: '#1A1624' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-accent/40 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-accent/20 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}
    </>
  )

  const MemoryToast = () => (
    <AnimatePresence>
      {memoryToast && (
        <motion.div
          className="mx-5 mb-2 flex items-center gap-2 px-3.5 py-2 rounded-xl text-[11px] font-medium"
          style={{ background: 'rgba(200,75,158,0.1)', border: '1px solid rgba(200,75,158,0.15)', color: 'rgba(200,75,158,0.85)' }}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
        >
          <Brain size={14} /> {memoryToast}
        </motion.div>
      )}
    </AnimatePresence>
  )

  const ChatInput = () => (
    <div className="shrink-0 px-5 pb-5 pt-2">
      <form
        onSubmit={(e) => { e.preventDefault(); handleSend() }}
        className="flex items-center gap-3 rounded-3xl px-4 py-2.5"
        style={{ background: '#1A1624', border: '1px solid #2D2538' }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Say something to ${castMember.name}...`}
          className="flex-1 bg-transparent text-white text-sm placeholder:text-white/20 outline-none"
          disabled={isStreaming}
        />
        <button
          type="submit"
          disabled={!input.trim() || isStreaming}
          className="cursor-pointer w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-opacity disabled:opacity-30"
          style={{ background: 'linear-gradient(135deg, #c84b9e, #8b5cf6)' }}
        >
          <Send size={16} className="text-white" />
        </button>
      </form>
      <p className="text-white/15 text-[10px] text-center mt-2">No exchange limit · Persistent thread</p>
    </div>
  )

  return (
    <div className="bg-bg min-h-screen min-h-dvh">
      {/* ═══ MOBILE ═══ */}
      <div className="md:hidden flex flex-col min-h-screen min-h-dvh">
        {/* Header */}
        <div className="shrink-0">
          <div className="flex items-center justify-between px-5 pt-14 pb-3">
            <button onClick={() => navigate('/cast')} className="cursor-pointer flex items-center gap-2 text-white/50 text-sm">
              <ArrowLeft size={20} className="text-white" /> Cast
            </button>
            <Info size={16} className="text-white/30" />
          </div>
          <div className="flex flex-col items-center gap-2 pb-4">
            <div className="w-16 h-16 rounded-full overflow-hidden" style={{ border: `2px solid ${tier.color}`, background: '#1A1624' }}>
              {charData.staticPortrait ? (
                <img src={charData.staticPortrait} alt={castMember.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">{charData.avatar}</div>
              )}
            </div>
            <p className="text-white font-bold text-lg">{castMember.name}</p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-lg" style={{ background: `${tier.color}22`, color: tier.color }}>
                {tier.label} · {score}%
              </span>
              <span className="text-white/30 text-[10px]">{castMember.universeLabel}</span>
            </div>
          </div>
          <div className="w-full h-px bg-white/5" />
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
          <MessageList />
        </div>
        <MemoryToast />
        <ChatInput />
      </div>

      {/* ═══ DESKTOP ═══ */}
      <div className="hidden md:flex min-h-screen">
        <div className="page-container flex gap-0 flex-1">
          {/* Left — Chat */}
          <div className="flex-1 flex flex-col min-h-screen" style={{ borderRight: '1px solid rgba(255,255,255,0.05)' }}>
            {/* Desktop header */}
            <div className="shrink-0 flex items-center gap-3 px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <button onClick={() => navigate('/cast')} className="cursor-pointer flex items-center gap-2 text-white/50 text-sm hover:text-white/70 transition-colors">
                <ArrowLeft size={18} /> Cast
              </button>
              <div className="w-px h-5 bg-white/10" />
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0" style={{ border: `2px solid ${tier.color}`, background: '#1A1624' }}>
                {charData.staticPortrait ? (
                  <img src={charData.staticPortrait} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm">{charData.avatar}</div>
                )}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{castMember.name}</p>
                <p className="text-white/30 text-[10px]">{castMember.universeLabel}</p>
              </div>
              <span className="ml-auto text-[10px] font-semibold px-2.5 py-1 rounded-lg" style={{ background: `${tier.color}22`, color: tier.color }}>
                {tier.label} · {score}%
              </span>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
              <MessageList />
            </div>
            <MemoryToast />
            <ChatInput />
          </div>

          {/* Right — Profile sidebar */}
          <div className="w-[300px] shrink-0 p-6 flex flex-col gap-6 overflow-y-auto">
            {/* Avatar + name */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-24 h-24 rounded-full overflow-hidden" style={{ border: `3px solid ${tier.color}`, background: '#1A1624' }}>
                {charData.staticPortrait ? (
                  <img src={charData.staticPortrait} alt={castMember.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">{charData.avatar}</div>
                )}
              </div>
              <p className="text-white font-bold text-xl">{castMember.name}</p>
              <span className="text-[11px] font-semibold px-3 py-1.5 rounded-lg" style={{ background: `${tier.color}22`, color: tier.color }}>
                {tier.label} · {score}%
              </span>
            </div>

            {/* Affinity bar */}
            <div>
              <p className="text-white/30 text-[10px] font-semibold tracking-[2px] uppercase mb-2">Affinity</p>
              <div className="w-full h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${score}%`, background: `linear-gradient(90deg, ${tier.color}, #8b5cf6)` }} />
              </div>
            </div>

            {/* Universe */}
            <div>
              <p className="text-white/30 text-[10px] font-semibold tracking-[2px] uppercase mb-2">Universe</p>
              <p className="text-white/70 text-sm">{castMember.universeLabel}</p>
            </div>

            {/* Character description */}
            {'description' in charData && (charData as any).description && (
              <div>
                <p className="text-white/30 text-[10px] font-semibold tracking-[2px] uppercase mb-2">About</p>
                <p className="text-white/50 text-sm leading-relaxed">{(charData as any).description}</p>
              </div>
            )}

            {/* Memories */}
            {allMemories.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Brain size={12} className="text-accent/50" />
                  <p className="text-white/30 text-[10px] font-semibold tracking-[2px] uppercase">Memories</p>
                </div>
                <div className="flex flex-col gap-2">
                  {allMemories.map((mem, i) => (
                    <div key={i} className="px-3 py-2 rounded-lg text-white/50 text-xs leading-relaxed" style={{ background: 'rgba(200,75,158,0.05)', border: '1px solid rgba(200,75,158,0.08)' }}>
                      {mem}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="mt-auto pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex justify-between text-white/20 text-[10px]">
                <span>{messages.length} messages</span>
                <span>{exchangeCount} exchanges</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
