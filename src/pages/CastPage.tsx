import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Lock, MessageCircle, X, Users, Check, Star } from 'lucide-react'
import { useStore } from '../store/useStore'
import { AppSidebar } from '../components/AppSidebar'
import { CAST_ROSTER, UNIVERSE_COLORS, getCastCharacter } from '../data/castRoster'
import { getAffinityTier } from '../lib/affinity'
import type { CastMember } from '../data/castRoster'

export function CastPage() {
  const navigate = useNavigate()
  const unlockedCastIds = useStore((s) => s.unlockedCastIds)
  const globalAffinities = useStore((s) => s.globalAffinities)
  const castChatThreads = useStore((s) => s.castChatThreads)
  const groupCastThreads = useStore((s) => s.groupCastThreads)
  const favoriteCastIds = useStore((s) => s.favoriteCastIds)
  const toggleFavoriteCast = useStore((s) => s.toggleFavoriteCast)

  // Existing group chats (ones with messages)
  const existingGroupChats = Object.entries(groupCastThreads)
    .filter(([, msgs]) => msgs.length > 0)
    .map(([key, msgs]) => {
      const charIds = key.split('+')
      const members = charIds.map((id) => CAST_ROSTER.find((c) => c.id === id)).filter(Boolean) as CastMember[]
      const lastMsg = msgs[msgs.length - 1]
      const speakerName = lastMsg?.characterId ? members.find((m) => m.id === lastMsg.characterId)?.name : 'You'
      return { key, members, lastMsg, speakerName, universe: members[0]?.universeLabel ?? '' }
    })

  const unlocked = CAST_ROSTER.filter((c) => unlockedCastIds.includes(c.id))
  const locked = CAST_ROSTER.filter((c) => !unlockedCastIds.includes(c.id))

  // Hover state for locked character cards (desktop)
  const [hoveredChar, setHoveredChar] = useState<string | null>(null)
  // Tap state for locked character cards (mobile)
  const [tappedChar, setTappedChar] = useState<CastMember | null>(null)

  // ─── Group chat selection ───
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Universe constraint: once first char is selected, only same-universe chars are selectable
  const selectedUniverse = selectedIds.length > 0
    ? CAST_ROSTER.find((c) => c.id === selectedIds[0])?.universeId ?? null
    : null

  function toggleSelect(charId: string) {
    setSelectedIds((prev) => {
      if (prev.includes(charId)) return prev.filter((id) => id !== charId)
      if (prev.length >= 3) return prev // max 3
      const charUniverse = CAST_ROSTER.find((c) => c.id === charId)?.universeId
      if (prev.length > 0 && charUniverse !== selectedUniverse) return prev // same universe only
      return [...prev, charId]
    })
  }

  function exitSelectMode() {
    setSelectMode(false)
    setSelectedIds([])
  }

  function startGroupChat() {
    if (selectedIds.length < 2) return
    const ids = [...selectedIds].sort().join('+')
    exitSelectMode()
    navigate(`/cast/group/${ids}`)
  }

  function handleCardClick(castId: string) {
    if (selectMode) {
      toggleSelect(castId)
    } else {
      navigate(`/cast/${castId}`)
    }
  }

  // Check if a char is selectable (same universe or no selection yet)
  function isSelectable(castId: string): boolean {
    if (!selectMode) return true
    if (selectedIds.includes(castId)) return true
    if (selectedIds.length >= 3) return false
    if (selectedIds.length === 0) return true
    const charUniverse = CAST_ROSTER.find((c) => c.id === castId)?.universeId
    return charUniverse === selectedUniverse
  }

  // ─── Character avatar helper ───
  const CharAvatar = ({ cast, size = 'w-14 h-14', locked = false }: { cast: CastMember; size?: string; locked?: boolean }) => {
    const charData = getCastCharacter(cast)
    const uniColor = UNIVERSE_COLORS[cast.universeId] ?? '#888'
    return (
      <div
        className={`${size} rounded-full overflow-hidden shrink-0 relative`}
        style={{
          border: locked ? `2px solid ${uniColor}33` : `2px solid ${uniColor}`,
          background: '#1A1624',
        }}
      >
        {charData?.staticPortrait ? (
          <img
            src={charData.staticPortrait}
            alt={cast.name}
            className="w-full h-full object-cover"
            style={locked ? { filter: 'grayscale(0.4) brightness(0.7)' } : undefined}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-xl"
            style={locked ? { opacity: 0.6 } : undefined}
          >
            {charData?.avatar ?? cast.name[0]}
          </div>
        )}
        {locked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <Lock size={12} className="text-white/40" />
          </div>
        )}
      </div>
    )
  }

  // ─── Selection checkmark overlay ───
  const SelectionOverlay = ({ charId }: { charId: string }) => {
    if (!selectMode) return null
    const selected = selectedIds.includes(charId)
    const selectable = isSelectable(charId)
    return (
      <div className={`absolute inset-0 rounded-2xl z-10 transition-all ${!selectable ? 'bg-black/40' : ''}`}>
        {selected && (
          <div
            className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #c84b9e, #8b5cf6)' }}
          >
            <Check size={12} className="text-white" />
          </div>
        )}
      </div>
    )
  }

  // Group chat eligible: need 2+ unlocked chars in same universe
  const universeGroups = unlocked.reduce<Record<string, CastMember[]>>((acc, c) => {
    acc[c.universeId] = [...(acc[c.universeId] ?? []), c]
    return acc
  }, {})
  const canGroupChat = Object.values(universeGroups).some((g) => g.length >= 2)

  return (
    <div className="bg-bg min-h-screen min-h-dvh">
      {/* ═══ MOBILE ═══ */}
      <div className="md:hidden flex flex-col min-h-screen min-h-dvh">
        <div className="flex items-center justify-between px-5 pt-14 pb-3">
          <button onClick={() => selectMode ? exitSelectMode() : navigate('/home')} className="cursor-pointer flex items-center gap-2 text-white/50 text-sm">
            {selectMode ? (
              <><X size={20} className="text-white" /> Cancel</>
            ) : (
              <><ArrowLeft size={20} className="text-white" /> Home</>
            )}
          </button>
          <p className="text-white font-bold text-base">{selectMode ? 'Select Characters' : 'Characters To Meet'}</p>
          {selectMode ? (
            <p className="text-accent text-sm font-semibold">{selectedIds.length}/3</p>
          ) : (
            <p className="text-accent text-sm font-semibold">{unlocked.length}/{CAST_ROSTER.length}</p>
          )}
        </div>
        {selectMode && selectedUniverse && (
          <p className="text-center text-white/25 text-[10px] -mt-1 mb-1">Same universe only · {CAST_ROSTER.find((c) => c.id === selectedIds[0])?.universeLabel}</p>
        )}
        <div className="w-full h-px bg-white/5" />

        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
          {/* Unlocked */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-accent/50 text-[10px] font-semibold tracking-[2px] uppercase">UNLOCKED</p>
              {!selectMode && canGroupChat && (
                <button
                  onClick={() => setSelectMode(true)}
                  className="cursor-pointer flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-all"
                  style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}
                >
                  <Users size={11} /> Group Chat
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {unlocked.map((cast, i) => {
                const score = globalAffinities[cast.id] ?? 0
                const tier = getAffinityTier(score)
                const lastMsg = castChatThreads[cast.id]?.slice(-1)[0]
                const selectable = isSelectable(cast.id)
                return (
                  <motion.button
                    key={cast.id}
                    onClick={() => handleCardClick(cast.id)}
                    className={`cursor-pointer relative flex flex-col items-center gap-1.5 rounded-2xl p-3 pb-2.5 text-center transition-all ${!selectable ? 'opacity-40' : ''}`}
                    style={{
                      background: selectMode && selectedIds.includes(cast.id) ? '#1A1030' : '#111016',
                      border: selectMode && selectedIds.includes(cast.id)
                        ? '1px solid rgba(139,92,246,0.4)'
                        : `1px solid ${UNIVERSE_COLORS[cast.universeId]}22`,
                    }}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    whileTap={{ scale: 0.97 }}
                    disabled={selectMode && !selectable}
                  >
                    <SelectionOverlay charId={cast.id} />
                    <CharAvatar cast={cast} size="w-12 h-12" />
                    <p className="text-white text-[11px] font-semibold">{cast.name}</p>
                    <p className="text-white/25 text-[9px]">{cast.universeLabel}</p>
                    {!selectMode && (
                      <>
                        <span className="text-[8px] font-semibold px-2 py-0.5 rounded-md" style={{ background: `${tier.color}22`, color: tier.color }}>
                          {tier.label}
                        </span>
                        {lastMsg && (
                          <p className="text-white/30 text-[9px] italic truncate w-full mt-0.5">
                            "{lastMsg.content.slice(0, 30)}..."
                          </p>
                        )}
                      </>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Locked — inviting cards (hidden in select mode) */}
          {!selectMode && locked.length > 0 && (
            <div>
              <p className="text-white/30 text-[10px] font-semibold tracking-[2px] uppercase mb-3">PLAY TO UNLOCK</p>
              <div className="grid grid-cols-3 gap-3">
                {locked.map((cast, i) => {
                  const uniColor = UNIVERSE_COLORS[cast.universeId] ?? '#888'
                  return (
                    <motion.button
                      key={cast.id}
                      onClick={() => setTappedChar(cast)}
                      className="cursor-pointer flex flex-col items-center gap-1.5 rounded-2xl p-3 pb-2.5"
                      style={{ background: '#0E0C14', border: `1px solid ${uniColor}15` }}
                      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.04 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <CharAvatar cast={cast} size="w-12 h-12" locked />
                      <p className="text-white/50 text-[11px] font-semibold">{cast.name}</p>
                      <p className="text-[9px] font-medium" style={{ color: `${uniColor}88` }}>{cast.universeLabel}</p>
                    </motion.button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Existing Group Chats */}
          {!selectMode && existingGroupChats.length > 0 && (
            <div>
              <p className="text-[#8b5cf6]/50 text-[10px] font-semibold tracking-[2px] uppercase mb-3">YOUR GROUP CHATS</p>
              <div className="flex flex-col gap-2">
                {existingGroupChats.map((gc) => (
                  <motion.button
                    key={gc.key}
                    onClick={() => navigate(`/cast/group/${gc.key}`)}
                    className="cursor-pointer flex items-center gap-3 rounded-2xl p-3 text-left"
                    style={{ background: '#111016', border: '1px solid rgba(139,92,246,0.12)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex -space-x-3 shrink-0">
                      {gc.members.map((m) => (
                        <CharAvatar key={m.id} cast={m} size="w-9 h-9" />
                      ))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-semibold truncate">{gc.members.map((m) => m.name).join(', ')}</p>
                      <p className="text-white/40 text-[10px] truncate">{gc.speakerName}: {gc.lastMsg?.content.slice(0, 40)}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavoriteCast(gc.key) }}
                      className="cursor-pointer shrink-0 p-1"
                    >
                      <Star size={14} className={favoriteCastIds.includes(gc.key) ? 'text-yellow-400 fill-yellow-400' : 'text-white/35'} />
                    </button>
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mobile floating group chat button */}
        <AnimatePresence>
          {selectMode && selectedIds.length >= 2 && (
            <motion.div
              className="fixed bottom-6 left-5 right-5 z-40"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            >
              <button
                onClick={startGroupChat}
                className="cursor-pointer w-full py-3.5 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #c84b9e, #8b5cf6)', boxShadow: '0 8px 32px rgba(200,75,158,0.3)' }}
              >
                <Users size={16} />
                Start Group Chat ({selectedIds.length})
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile tap-to-reveal sheet */}
        <AnimatePresence>
          {tappedChar && (
            <motion.div
              className="fixed inset-0 z-50 flex items-end justify-center"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setTappedChar(null)}
            >
              <div className="absolute inset-0 bg-black/60" />
              <motion.div
                className="relative w-full max-w-md rounded-t-3xl px-6 py-6 flex flex-col items-center gap-4"
                style={{ background: '#141220' }}
                initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button onClick={() => setTappedChar(null)} className="cursor-pointer absolute top-4 right-4 text-white/30">
                  <X size={18} />
                </button>
                <CharAvatar cast={tappedChar} size="w-20 h-20" locked />
                <div className="text-center">
                  <p className="text-white font-bold text-lg">{tappedChar.name}</p>
                  <p className="text-sm mt-1" style={{ color: UNIVERSE_COLORS[tappedChar.universeId] ?? '#888' }}>{tappedChar.universeLabel}</p>
                </div>
                <p className="text-white/50 text-sm leading-relaxed text-center">{tappedChar.bio}</p>
                <div className="flex items-center gap-2 text-white/30 text-xs">
                  <Lock size={12} />
                  <span>{tappedChar.unlockHint}</span>
                </div>
                <button
                  onClick={() => { setTappedChar(null); navigate('/home') }}
                  className="cursor-pointer w-full py-3 rounded-xl text-white font-semibold text-sm mt-2"
                  style={{ background: `linear-gradient(135deg, ${UNIVERSE_COLORS[tappedChar.universeId] ?? '#c84b9e'}, #8b5cf6)` }}
                >
                  Play {tappedChar.universeLabel}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══ DESKTOP ═══ */}
      <div className="hidden md:flex min-h-screen">
        <AppSidebar />
        <div className="flex-1 min-h-screen overflow-y-auto px-8 lg:px-12 py-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-white font-bold text-2xl mb-1">
                {selectMode ? 'Select Characters for Group Chat' : 'Characters To Meet'}
              </h1>
              <p className="text-white/40 text-sm">
                {selectMode
                  ? `Pick 2–3 characters from the same universe. ${selectedUniverse ? `Selecting from ${CAST_ROSTER.find((c) => c.id === selectedIds[0])?.universeLabel}.` : ''}`
                  : 'Chat with characters from your stories. Unlock more by playing.'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {selectMode ? (
                <>
                  <span className="text-white/40 text-sm">{selectedIds.length}/3 selected</span>
                  <button
                    onClick={exitSelectMode}
                    className="cursor-pointer text-sm font-medium px-4 py-2 rounded-xl transition-all hover:brightness-110"
                    style={{ background: 'rgba(255,255,255,0.06)', color: '#fff' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={startGroupChat}
                    disabled={selectedIds.length < 2}
                    className="cursor-pointer text-sm font-semibold px-4 py-2 rounded-xl transition-all hover:brightness-110 disabled:opacity-30 flex items-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #c84b9e, #8b5cf6)', color: '#fff' }}
                  >
                    <Users size={14} /> Start Group Chat
                  </button>
                </>
              ) : (
                <>
                  {canGroupChat && (
                    <button
                      onClick={() => setSelectMode(true)}
                      className="cursor-pointer flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all hover:brightness-110"
                      style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}
                    >
                      <Users size={14} /> Group Chat
                    </button>
                  )}
                  <span className="text-accent text-sm font-semibold px-4 py-2 rounded-xl" style={{ background: 'rgba(200,75,158,0.1)' }}>
                    {unlocked.length} / {CAST_ROSTER.length} unlocked
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Unlocked characters */}
          <p className="text-accent/50 text-[11px] font-semibold tracking-[1.5px] uppercase mb-4">
            {selectMode ? 'SELECT CHARACTERS' : 'BASE CHARACTERS — Always available'}
          </p>
          <div className="grid grid-cols-3 gap-4 mb-10">
            {unlocked.map((cast, i) => {
              const score = globalAffinities[cast.id] ?? 0
              const tier = getAffinityTier(score)
              const lastMsg = castChatThreads[cast.id]?.slice(-1)[0]
              const selected = selectedIds.includes(cast.id)
              const selectable = isSelectable(cast.id)
              return (
                <motion.button
                  key={cast.id}
                  onClick={() => handleCardClick(cast.id)}
                  className={`cursor-pointer relative flex items-center gap-4 rounded-2xl p-4 text-left transition-all hover:brightness-110 ${!selectable ? 'opacity-30 pointer-events-none' : ''}`}
                  style={{
                    background: selected ? '#1A1030' : '#111016',
                    border: selected ? '1px solid rgba(139,92,246,0.4)' : `1px solid ${tier.color}22`,
                  }}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  disabled={selectMode && !selectable}
                >
                  {selectMode && selected && (
                    <div
                      className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center z-10"
                      style={{ background: 'linear-gradient(135deg, #c84b9e, #8b5cf6)' }}
                    >
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                  <CharAvatar cast={cast} size="w-16 h-16" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-semibold">{cast.name}</p>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md" style={{ background: `${tier.color}22`, color: tier.color }}>
                        {tier.label} · {score}%
                      </span>
                    </div>
                    <p className="text-white/30 text-xs mb-1">{cast.universeLabel}</p>
                    {!selectMode && (
                      <p className="text-white/40 text-xs italic truncate">
                        {lastMsg ? `"${lastMsg.content.slice(0, 50)}..."` : 'Start chatting'}
                      </p>
                    )}
                  </div>
                  {!selectMode && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFavoriteCast(cast.id) }}
                        className="cursor-pointer p-1 rounded-lg hover:bg-white/5 transition-colors"
                      >
                        <Star size={14} className={favoriteCastIds.includes(cast.id) ? 'text-yellow-400 fill-yellow-400' : 'text-white/30 hover:text-white/50'} />
                      </button>
                      <MessageCircle size={18} className="text-accent/60" />
                    </div>
                  )}
                </motion.button>
              )
            })}
          </div>

          {/* Locked — with hover cards (hidden in select mode) */}
          {!selectMode && locked.length > 0 && (
            <>
              <p className="text-white/30 text-[11px] font-semibold tracking-[1.5px] uppercase mb-4">STORY-LOCKED — Play the story to unlock</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {locked.map((cast, i) => {
                  const uniColor = UNIVERSE_COLORS[cast.universeId] ?? '#888'
                  const isHovered = hoveredChar === cast.id
                  return (
                    <motion.div
                      key={cast.id}
                      className="relative"
                      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.04 }}
                      onMouseEnter={() => setHoveredChar(cast.id)}
                      onMouseLeave={() => setHoveredChar(null)}
                    >
                      <button
                        onClick={() => navigate('/home')}
                        className="cursor-pointer w-full flex items-center gap-3 rounded-2xl p-4 text-left transition-all"
                        style={{
                          background: isHovered ? '#15131E' : '#0E0C14',
                          border: `1px solid ${isHovered ? `${uniColor}30` : `${uniColor}12`}`,
                        }}
                      >
                        <CharAvatar cast={cast} locked />
                        <div className="flex-1 min-w-0">
                          <p className="text-white/60 font-semibold text-sm">{cast.name}</p>
                          <p className="text-[11px] mt-0.5" style={{ color: `${uniColor}77` }}>{cast.universeLabel}</p>
                        </div>
                        <Lock size={14} className="text-white/15 shrink-0" />
                      </button>

                      {/* Hover popover */}
                      <AnimatePresence>
                        {isHovered && (
                          <motion.div
                            className="absolute left-0 right-0 top-full mt-2 z-20 rounded-xl p-4 flex flex-col gap-3"
                            style={{ background: '#1A1725', border: `1px solid ${uniColor}25`, boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${uniColor}10` }}
                            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.15 }}
                          >
                            <p className="text-white/60 text-xs leading-relaxed">{cast.bio}</p>
                            <div className="flex items-center gap-1.5 text-white/25 text-[10px]">
                              <Lock size={10} />
                              <span>{cast.unlockHint}</span>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); navigate('/home') }}
                              className="cursor-pointer text-[11px] font-semibold py-2 rounded-lg transition-all hover:brightness-110"
                              style={{ background: `${uniColor}20`, color: uniColor }}
                            >
                              Play {cast.universeLabel} →
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </div>
            </>
          )}

          {/* Existing Group Chats */}
          {!selectMode && existingGroupChats.length > 0 && (
            <div className="mt-10">
              <p className="text-[#8b5cf6]/50 text-[11px] font-semibold tracking-[1.5px] uppercase mb-4">YOUR GROUP CHATS</p>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {existingGroupChats.map((gc, i) => (
                  <motion.button
                    key={gc.key}
                    onClick={() => navigate(`/cast/group/${gc.key}`)}
                    className="cursor-pointer flex items-center gap-4 rounded-2xl p-4 text-left transition-all hover:brightness-110"
                    style={{ background: '#111016', border: '1px solid rgba(139,92,246,0.15)' }}
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  >
                    <div className="flex -space-x-3 shrink-0">
                      {gc.members.map((m) => (
                        <CharAvatar key={m.id} cast={m} size="w-12 h-12" />
                      ))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm">{gc.members.map((m) => m.name).join(', ')}</p>
                      <p className="text-white/30 text-xs mb-1">{gc.universe}</p>
                      <p className="text-white/20 text-xs italic truncate">
                        {gc.speakerName}: "{gc.lastMsg?.content.slice(0, 45)}..."
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavoriteCast(gc.key) }}
                      className="cursor-pointer shrink-0 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <Star size={16} className={favoriteCastIds.includes(gc.key) ? 'text-yellow-400 fill-yellow-400' : 'text-white/35 hover:text-white/50'} />
                    </button>
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
