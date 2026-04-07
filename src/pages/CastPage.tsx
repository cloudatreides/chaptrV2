import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Lock, MessageCircle, X } from 'lucide-react'
import { useStore } from '../store/useStore'
import { CAST_ROSTER, UNIVERSE_COLORS, getCastCharacter } from '../data/castRoster'
import { getAffinityTier } from '../lib/affinity'
import type { CastMember } from '../data/castRoster'

export function CastPage() {
  const navigate = useNavigate()
  const unlockedCastIds = useStore((s) => s.unlockedCastIds)
  const globalAffinities = useStore((s) => s.globalAffinities)
  const castChatThreads = useStore((s) => s.castChatThreads)

  const unlocked = CAST_ROSTER.filter((c) => unlockedCastIds.includes(c.id))
  const locked = CAST_ROSTER.filter((c) => !unlockedCastIds.includes(c.id))

  // Hover state for locked character cards (desktop)
  const [hoveredChar, setHoveredChar] = useState<string | null>(null)
  // Tap state for locked character cards (mobile)
  const [tappedChar, setTappedChar] = useState<CastMember | null>(null)

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

  return (
    <div className="bg-bg min-h-screen min-h-dvh">
      {/* ═══ MOBILE ═══ */}
      <div className="md:hidden flex flex-col min-h-screen min-h-dvh">
        <div className="flex items-center justify-between px-5 pt-14 pb-3">
          <button onClick={() => navigate('/home')} className="cursor-pointer flex items-center gap-2 text-white/50 text-sm">
            <ArrowLeft size={20} className="text-white" /> Home
          </button>
          <p className="text-white font-bold text-base">Characters To Meet</p>
          <p className="text-accent text-sm font-semibold">{unlocked.length}/{CAST_ROSTER.length}</p>
        </div>
        <div className="w-full h-px bg-white/5" />

        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
          {/* Unlocked */}
          <div>
            <p className="text-accent/50 text-[10px] font-semibold tracking-[2px] uppercase mb-3">UNLOCKED</p>
            <div className="grid grid-cols-3 gap-3">
              {unlocked.map((cast, i) => {
                const score = globalAffinities[cast.id] ?? 0
                const tier = getAffinityTier(score)
                const lastMsg = castChatThreads[cast.id]?.slice(-1)[0]
                return (
                  <motion.button
                    key={cast.id}
                    onClick={() => navigate(`/cast/${cast.id}`)}
                    className="cursor-pointer flex flex-col items-center gap-1.5 rounded-2xl p-3 pb-2.5 text-center"
                    style={{ background: '#111016', border: `1px solid ${UNIVERSE_COLORS[cast.universeId]}22` }}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <CharAvatar cast={cast} size="w-12 h-12" />
                    <p className="text-white text-[11px] font-semibold">{cast.name}</p>
                    <p className="text-white/25 text-[9px]">{cast.universeLabel}</p>
                    <span className="text-[8px] font-semibold px-2 py-0.5 rounded-md" style={{ background: `${tier.color}22`, color: tier.color }}>
                      {tier.label}
                    </span>
                    {lastMsg && (
                      <p className="text-white/30 text-[9px] italic truncate w-full mt-0.5">
                        "{lastMsg.content.slice(0, 30)}..."
                      </p>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Locked — inviting cards */}
          {locked.length > 0 && (
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
        </div>

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
                  onClick={() => { setTappedChar(null); navigate('/universes') }}
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
      <div className="hidden md:block min-h-screen">
        <div className="page-container px-8 lg:px-16 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <button onClick={() => navigate('/home')} className="cursor-pointer text-white/40 hover:text-white/60 transition-colors">
                  <ArrowLeft size={20} />
                </button>
                <h1 className="text-white font-bold text-2xl">Characters To Meet</h1>
              </div>
              <p className="text-white/40 text-sm ml-8">Chat with characters from your stories. Unlock more by playing.</p>
            </div>
            <span className="text-accent text-sm font-semibold px-4 py-2 rounded-xl" style={{ background: 'rgba(200,75,158,0.1)' }}>
              {unlocked.length} / {CAST_ROSTER.length} unlocked
            </span>
          </div>

          {/* Unlocked */}
          <p className="text-accent/50 text-[11px] font-semibold tracking-[2px] uppercase mb-4">UNLOCKED</p>
          <div className="grid grid-cols-3 gap-4 mb-10">
            {unlocked.map((cast, i) => {
              const score = globalAffinities[cast.id] ?? 0
              const tier = getAffinityTier(score)
              const lastMsg = castChatThreads[cast.id]?.slice(-1)[0]
              return (
                <motion.button
                  key={cast.id}
                  onClick={() => navigate(`/cast/${cast.id}`)}
                  className="cursor-pointer flex items-center gap-4 rounded-2xl p-4 text-left transition-all hover:brightness-110"
                  style={{ background: '#111016', border: `1px solid ${tier.color}22` }}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                >
                  <CharAvatar cast={cast} size="w-16 h-16" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-semibold">{cast.name}</p>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md" style={{ background: `${tier.color}22`, color: tier.color }}>
                        {tier.label} · {score}%
                      </span>
                    </div>
                    <p className="text-white/30 text-xs mb-1">{cast.universeLabel}</p>
                    <p className="text-white/25 text-xs italic truncate">
                      {lastMsg ? `"${lastMsg.content.slice(0, 50)}..."` : 'Start chatting'}
                    </p>
                  </div>
                  <MessageCircle size={20} className="text-accent/40 shrink-0" />
                </motion.button>
              )
            })}
          </div>

          {/* Locked — with hover cards */}
          {locked.length > 0 && (
            <>
              <p className="text-white/30 text-[11px] font-semibold tracking-[2px] uppercase mb-4">PLAY TO UNLOCK</p>
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
                        onClick={() => navigate('/universes')}
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
                              onClick={(e) => { e.stopPropagation(); navigate('/universes') }}
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
        </div>
      </div>
    </div>
  )
}
