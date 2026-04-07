import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Send, Brain, Users } from 'lucide-react'
import { useStore } from '../store/useStore'
import { CAST_ROSTER, getCastCharacter, UNIVERSE_COLORS } from '../data/castRoster'
import { getAffinityTier } from '../lib/affinity'
import { streamChatReply, extractMemories, generateGroupReaction, parseAffinityDelta } from '../lib/claudeStream'
import type { CastChatMessage } from '../store/useStore'
import type { CastMember } from '../data/castRoster'

export function CastGroupChatPage() {
  const { ids } = useParams<{ ids: string }>()
  const navigate = useNavigate()

  const characterIds = (ids ?? '').split('+').filter(Boolean)
  const castMembers = characterIds
    .map((id) => CAST_ROSTER.find((c) => c.id === id))
    .filter((c): c is CastMember => !!c)
  const charDataMap = Object.fromEntries(
    castMembers.map((cm) => [cm.id, getCastCharacter(cm)])
  )

  // Group key = sorted IDs joined with +
  const groupKey = [...characterIds].sort().join('+')
  const universeId = castMembers[0]?.universeId ?? null
  const universeColor = UNIVERSE_COLORS[universeId ?? ''] ?? '#c84b9e'

  const unlockedCastIds = useStore((s) => s.unlockedCastIds)
  const groupCastThreads = useStore((s) => s.groupCastThreads)
  const globalAffinities = useStore((s) => s.globalAffinities)
  const addGroupCastMessage = useStore((s) => s.addGroupCastMessage)
  const updateGlobalAffinity = useStore((s) => s.updateGlobalAffinity)
  const characters = useStore((s) => s.characters)

  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [streamingCharId, setStreamingCharId] = useState<string | null>(null)
  const [streamingContent, setStreamingContent] = useState('')
  const [primaryCharIndex, setPrimaryCharIndex] = useState(0)
  const [memoryToast, setMemoryToast] = useState<string | null>(null)
  const [affinityChange, setAffinityChange] = useState<{ charId: string; delta: number; reason: string } | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const messages = groupCastThreads[groupKey] ?? []
  const exchangeCount = messages.filter((m) => m.role === 'user').length
  const playerChar = characters[0]

  // Validate all chars are unlocked and same universe
  const allUnlocked = characterIds.every((id) => unlockedCastIds.includes(id))
  const sameUniverse = castMembers.every((cm) => cm.universeId === universeId)

  useEffect(() => {
    if (characterIds.length < 2 || !allUnlocked || !sameUniverse) {
      navigate('/cast', { replace: true })
    }
  }, [characterIds.length, allUnlocked, sameUniverse, navigate])

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length, streamingContent])

  // Build thread context for group prompts
  function buildThreadContext(msgs: CastChatMessage[]): string {
    return msgs.slice(-10).map((m) => {
      if (m.role === 'user') return `Protagonist: ${m.content}`
      const cd = charDataMap[m.characterId ?? '']
      return `${cd?.name ?? m.characterId ?? 'Character'}: ${m.content}`
    }).join('\n')
  }

  const handleSend = useCallback(async () => {
    if (!input.trim() || isTyping || castMembers.length < 2) return

    const userMsg: CastChatMessage = { role: 'user', content: input.trim(), timestamp: Date.now() }
    addGroupCastMessage(groupKey, userMsg)
    setInput('')
    setIsTyping(true)
    setStreamingContent('')

    const newExchange = exchangeCount + 1

    // Round-robin primary responder
    const primaryIdx = primaryCharIndex % castMembers.length
    const primaryMember = castMembers[primaryIdx]
    const primaryCharId = primaryMember.id
    const primaryCharData = charDataMap[primaryCharId]

    setStreamingCharId(primaryCharId)

    // Build messages for Claude
    const allMsgs = [...messages, userMsg]
    const recentMessages = allMsgs.slice(-20).map((m) => ({
      role: m.role,
      content: m.content,
      characterId: m.characterId ?? primaryCharId,
      timestamp: m.timestamp,
    }))

    // Collect memories for this character
    const storyProgress = useStore.getState().storyProgress
    const allMemories: string[] = []
    for (const prog of Object.values(storyProgress)) {
      allMemories.push(...(prog.characterMemories[primaryCharId] ?? []))
    }
    const uniqueMemories = [...new Set(allMemories)].slice(0, 10)

    const score = globalAffinities[primaryCharId] ?? 0

    // Build group context
    const otherNames = castMembers
      .filter((cm) => cm.id !== primaryCharId)
      .map((cm) => charDataMap[cm.id]?.name ?? cm.id)
      .join(', ')
    const threadCtx = buildThreadContext(allMsgs)
    const groupCtx = `GROUP CHAT — This is a casual group conversation outside of any story. Characters present: ${otherNames} and you. Everyone is chatting together freely. Keep responses short — this is a group conversation, not a one-on-one.${threadCtx ? `\n\nRecent conversation:\n${threadCtx}` : ''}`

    const abortController = new AbortController()
    abortRef.current = abortController

    try {
      let fullReply = ''
      const stream = streamChatReply({
        characterId: primaryCharId,
        messages: recentMessages,
        storyContext: `This is a persistent group chat outside of any story. The protagonist is chatting freely with ${otherNames} and ${primaryCharData?.name}. There is no exchange limit. Be natural, keep it short for a group setting.`,
        exchangeNumber: newExchange,
        maxExchanges: 999,
        characterState: { junhoTrust: score },
        bio: playerChar?.bio ?? null,
        loveInterest: null,
        universeId,
        signal: abortController.signal,
        sceneContext: groupCtx,
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
        // Parse affinity delta from Claude's response
        const { content: cleanReply, delta, reason } = parseAffinityDelta(fullReply)
        const charMsg: CastChatMessage = {
          role: 'character',
          content: cleanReply,
          timestamp: Date.now(),
          characterId: primaryCharId,
        }
        addGroupCastMessage(groupKey, charMsg)

        // Affinity change (can go up or down)
        const newScore = Math.max(0, Math.min(100, score + delta))
        updateGlobalAffinity(primaryCharId, newScore)
        setAffinityChange({ charId: primaryCharId, delta, reason })
        setTimeout(() => setAffinityChange(null), 4000)

        setStreamingContent('')
        setStreamingCharId(null)

        // Advance rotation
        setPrimaryCharIndex((primaryIdx + 1) % castMembers.length)

        // Memory extraction every 2nd exchange
        if (newExchange % 2 === 0) {
          const lastFew = [...allMsgs, charMsg].slice(-4)
          extractMemories({
            characterId: primaryCharId,
            messages: lastFew.map((m) => ({ role: m.role, content: m.content, characterId: primaryCharId, timestamp: m.timestamp })),
          }).then((memories) => {
            if (memories.length > 0) {
              const addMem = useStore.getState().addCharacterMemory
              for (const mem of memories) addMem(primaryCharId, mem)
              setMemoryToast(`${primaryCharData?.name} remembered: ${memories[0]}`)
              setTimeout(() => setMemoryToast(null), 4000)
            }
          }).catch(() => {})
        }

        // AI-to-AI reaction (70% chance, with delay)
        if (castMembers.length > 1 && Math.random() < 0.7) {
          await new Promise((r) => setTimeout(r, 1000)) // 1s delay for natural feel
          const reactorIdx = (primaryIdx + 1) % castMembers.length
          const reactorId = castMembers[reactorIdx].id
          if (reactorId !== primaryCharId) {
            setStreamingCharId(reactorId)
            const updatedMsgs = [...allMsgs, charMsg]
            const reactionThreadCtx = buildThreadContext(updatedMsgs)
            const reaction = await generateGroupReaction({
              characterId: reactorId,
              threadContext: reactionThreadCtx,
              storyContext: `Casual group chat outside of any story. Characters: ${castMembers.map((cm) => charDataMap[cm.id]?.name ?? cm.id).join(', ')}.`,
              universeId,
              loveInterest: null,
            })
            setStreamingCharId(null)
            if (reaction) {
              const reactionMsg: CastChatMessage = {
                role: 'character',
                content: reaction,
                timestamp: Date.now(),
                characterId: reactorId,
              }
              addGroupCastMessage(groupKey, reactionMsg)
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') console.error('Group cast chat error:', err)
    } finally {
      setIsTyping(false)
      setStreamingContent('')
      setStreamingCharId(null)
    }
  }, [input, isTyping, castMembers, messages, exchangeCount, primaryCharIndex, globalAffinities, playerChar, groupKey, universeId, addGroupCastMessage, updateGlobalAffinity])

  if (castMembers.length < 2) return null

  // ─── Sub-components ───

  const CharAvatar = ({ charId, size = 'w-7 h-7' }: { charId: string; size?: string }) => {
    const cd = charDataMap[charId]
    return (
      <div className={`${size} rounded-full overflow-hidden shrink-0`} style={{ background: '#1A1624' }}>
        {cd?.staticPortrait ? (
          <img src={cd.staticPortrait} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs">{cd?.avatar ?? '?'}</div>
        )}
      </div>
    )
  }

  const MessageList = () => (
    <>
      {messages.length === 0 && !isTyping && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center py-12">
          <div className="flex -space-x-2">
            {castMembers.map((cm) => <CharAvatar key={cm.id} charId={cm.id} size="w-10 h-10" />)}
          </div>
          <p className="text-white/20 text-sm">Start a group chat with {castMembers.map((cm) => cm.name).join(' & ')}</p>
          <p className="text-white/10 text-xs">Characters talk to each other too</p>
        </div>
      )}

      {messages.map((msg, i) => {
        const cd = msg.characterId ? charDataMap[msg.characterId] : null
        const isNew = i >= messages.length - 2
        return (
          <div
            key={`${msg.timestamp}-${i}`}
            className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : ''}`}
            style={isNew ? { animation: 'fadeInUp 0.15s ease-out' } : undefined}
          >
            {msg.role === 'character' && msg.characterId && <CharAvatar charId={msg.characterId} />}
            <div className="flex flex-col max-w-[80%]">
              {msg.role === 'character' && cd && (
                <span className="text-[10px] text-white/30 mb-0.5">{cd.name}</span>
              )}
              <div
                className="px-3.5 py-2.5 text-[13px] leading-relaxed"
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
          </div>
        )
      })}

      {isTyping && streamingContent && streamingCharId && (
        <div className="flex gap-2.5">
          <CharAvatar charId={streamingCharId} />
          <div className="flex flex-col max-w-[80%]">
            <span className="text-[10px] text-white/30 mb-0.5">{charDataMap[streamingCharId]?.name}</span>
            <div className="px-3.5 py-2.5 text-[13px] leading-relaxed" style={{ background: '#1A1624', color: '#E8E3F0', borderRadius: '2px 14px 14px 14px' }}>
              {streamingContent}
              <span className="inline-block w-1.5 h-4 bg-accent/50 ml-0.5 animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {isTyping && !streamingContent && streamingCharId && (
        <div className="flex gap-2.5">
          <CharAvatar charId={streamingCharId} />
          <div className="flex flex-col">
            <span className="text-[10px] text-white/30 mb-0.5">{charDataMap[streamingCharId]?.name}</span>
            <div className="px-4 py-3 rounded-[2px_14px_14px_14px] flex gap-1.5 items-center" style={{ background: '#1A1624' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-accent/40 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-accent/20 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}
    </>
  )

  const names = castMembers.map((cm) => cm.name).join(', ')

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
            <div className="flex items-center gap-1.5">
              <Users size={14} className="text-white/30" />
              <span className="text-white/30 text-xs">Group</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 pb-4">
            <div className="flex -space-x-3">
              {castMembers.map((cm) => (
                <div
                  key={cm.id}
                  className="w-12 h-12 rounded-full overflow-hidden"
                  style={{ border: `2px solid ${universeColor}`, background: '#1A1624' }}
                >
                  {charDataMap[cm.id]?.staticPortrait ? (
                    <img src={charDataMap[cm.id]!.staticPortrait} alt={cm.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg">{charDataMap[cm.id]?.avatar}</div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-white font-bold text-base">{names}</p>
            <span className="text-white/30 text-[10px]">{castMembers[0]?.universeLabel}</span>
          </div>
          <div className="w-full h-px bg-white/5" />
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
          <MessageList />
        </div>

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

        <div className="shrink-0 px-5 pb-5 pt-2">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend() }}
            className="flex items-center gap-3 rounded-3xl px-4 py-2.5"
            style={{ background: '#1A1624', border: '1px solid #2D2538' }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Say something to the group..."
              className="flex-1 bg-transparent text-white text-sm placeholder:text-white/20 outline-none"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="cursor-pointer w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-opacity disabled:opacity-30"
              style={{ background: 'linear-gradient(135deg, #c84b9e, #8b5cf6)' }}
            >
              <Send size={16} className="text-white" />
            </button>
          </form>
          <p className="text-white/15 text-[10px] text-center mt-2">Group chat · Characters react to each other</p>
        </div>
      </div>

      {/* ═══ DESKTOP ═══ */}
      <div className="hidden md:flex min-h-screen">
        <div className="page-container flex gap-0 flex-1">
          {/* Left — Chat */}
          <div className="flex-1 flex flex-col min-h-screen" style={{ borderRight: '1px solid rgba(255,255,255,0.05)' }}>
            {/* Header */}
            <div className="shrink-0 flex items-center gap-3 px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <button onClick={() => navigate('/cast')} className="cursor-pointer flex items-center gap-2 text-white/50 text-sm hover:text-white/70 transition-colors">
                <ArrowLeft size={18} /> Cast
              </button>
              <div className="w-px h-5 bg-white/10" />
              <div className="flex -space-x-2">
                {castMembers.map((cm) => (
                  <div key={cm.id} className="w-8 h-8 rounded-full overflow-hidden shrink-0" style={{ border: `2px solid ${universeColor}`, background: '#1A1624' }}>
                    {charDataMap[cm.id]?.staticPortrait ? (
                      <img src={charDataMap[cm.id]!.staticPortrait} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm">{charDataMap[cm.id]?.avatar}</div>
                    )}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{names}</p>
                <p className="text-white/30 text-[10px]">{castMembers[0]?.universeLabel} · Group Chat</p>
              </div>
              <span className="ml-auto flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-lg" style={{ background: `${universeColor}15`, color: `${universeColor}aa` }}>
                <Users size={12} /> {castMembers.length} characters
              </span>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
              <MessageList />
            </div>

            <AnimatePresence>
              {memoryToast && (
                <motion.div
                  className="mx-6 mb-2 flex items-center gap-2 px-3.5 py-2 rounded-xl text-[11px] font-medium"
                  style={{ background: 'rgba(200,75,158,0.1)', border: '1px solid rgba(200,75,158,0.15)', color: 'rgba(200,75,158,0.85)' }}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                >
                  <Brain size={14} /> {memoryToast}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="shrink-0 px-6 pb-5 pt-2">
              <form
                onSubmit={(e) => { e.preventDefault(); handleSend() }}
                className="flex items-center gap-3 rounded-3xl px-4 py-2.5"
                style={{ background: '#1A1624', border: '1px solid #2D2538' }}
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Say something to the group..."
                  className="flex-1 bg-transparent text-white text-sm placeholder:text-white/20 outline-none"
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="cursor-pointer w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-opacity disabled:opacity-30"
                  style={{ background: 'linear-gradient(135deg, #c84b9e, #8b5cf6)' }}
                >
                  <Send size={16} className="text-white" />
                </button>
              </form>
              <p className="text-white/15 text-[10px] text-center mt-2">Group chat · Characters react to each other</p>
            </div>
          </div>

          {/* Right — Group sidebar */}
          <div className="w-[300px] shrink-0 p-6 flex flex-col gap-6 overflow-y-auto">
            <div className="flex flex-col items-center gap-3">
              <div className="flex -space-x-3">
                {castMembers.map((cm) => (
                  <div key={cm.id} className="w-16 h-16 rounded-full overflow-hidden" style={{ border: `3px solid ${universeColor}`, background: '#1A1624' }}>
                    {charDataMap[cm.id]?.staticPortrait ? (
                      <img src={charDataMap[cm.id]!.staticPortrait} alt={cm.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">{charDataMap[cm.id]?.avatar}</div>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-white font-bold text-lg text-center">{names}</p>
              <span className="text-white/30 text-xs">{castMembers[0]?.universeLabel}</span>
            </div>

            {/* Per-character affinity */}
            <div>
              <p className="text-white/30 text-[10px] font-semibold tracking-[2px] uppercase mb-3">Characters</p>
              <div className="flex flex-col gap-3">
                {castMembers.map((cm) => {
                  const s = globalAffinities[cm.id] ?? 0
                  const t = getAffinityTier(s)
                  const hasChange = affinityChange?.charId === cm.id
                  return (
                    <div key={cm.id}>
                      <button
                        onClick={() => navigate(`/cast/${cm.id}`)}
                        className="cursor-pointer w-full flex items-center gap-3 p-2.5 rounded-xl transition-all hover:brightness-110"
                        style={{ background: '#111016' }}
                      >
                        <CharAvatar charId={cm.id} size="w-9 h-9" />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium">{cm.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${s}%`, background: `linear-gradient(90deg, ${t.color}, #8b5cf6)` }} />
                            </div>
                            <span className="text-[9px] font-semibold shrink-0" style={{ color: t.color }}>{t.label}</span>
                          </div>
                        </div>
                      </button>
                      <AnimatePresence>
                        {hasChange && (
                          <motion.div
                            className="flex items-center gap-1.5 mt-1 mx-2.5 px-2 py-1 rounded-md text-[10px] font-medium"
                            style={{
                              background: affinityChange.delta >= 0 ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                              color: affinityChange.delta >= 0 ? '#10b981' : '#ef4444',
                            }}
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                          >
                            <span className="font-bold">{affinityChange.delta > 0 ? '+' : ''}{affinityChange.delta}%</span>
                            <span className="opacity-70">{affinityChange.reason}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </div>

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
