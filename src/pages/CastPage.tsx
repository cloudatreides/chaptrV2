import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Lock, MessageCircle } from 'lucide-react'
import { useStore } from '../store/useStore'
import { CAST_ROSTER, UNIVERSE_COLORS, getCastCharacter } from '../data/castRoster'
import { getAffinityTier } from '../lib/affinity'

export function CastPage() {
  const navigate = useNavigate()
  const unlockedCastIds = useStore((s) => s.unlockedCastIds)
  const globalAffinities = useStore((s) => s.globalAffinities)
  const castChatThreads = useStore((s) => s.castChatThreads)

  const unlocked = CAST_ROSTER.filter((c) => unlockedCastIds.includes(c.id))
  const locked = CAST_ROSTER.filter((c) => !unlockedCastIds.includes(c.id))

  return (
    <div className="bg-bg min-h-screen min-h-dvh">
      {/* Mobile */}
      <div className="md:hidden flex flex-col min-h-screen min-h-dvh">
        {/* Top nav */}
        <div className="flex items-center justify-between px-5 pt-14 pb-3">
          <button onClick={() => navigate('/home')} className="cursor-pointer flex items-center gap-2 text-white/50 text-sm">
            <ArrowLeft size={20} className="text-white" /> Home
          </button>
          <p className="text-white font-bold text-base">Characters To Meet</p>
          <p className="text-accent text-sm font-semibold">{unlocked.length}/{CAST_ROSTER.length}</p>
        </div>
        <div className="w-full h-px bg-white/5" />

        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
          {/* Base characters */}
          <div>
            <p className="text-accent/50 text-[10px] font-semibold tracking-[2px] uppercase mb-3">BASE CHARACTERS</p>
            <div className="grid grid-cols-3 gap-3">
              {unlocked.map((cast, i) => {
                const charData = getCastCharacter(cast)
                const score = globalAffinities[cast.id] ?? 0
                const tier = getAffinityTier(score)
                const lastMsg = castChatThreads[cast.id]?.slice(-1)[0]
                return (
                  <motion.button
                    key={cast.id}
                    onClick={() => navigate(`/cast/${cast.id}`)}
                    className="cursor-pointer flex flex-col items-center gap-1.5 rounded-2xl p-3 pb-2.5 text-center"
                    style={{ background: '#111016', border: `1px solid ${cast.base ? 'rgba(200,75,158,0.12)' : 'rgba(255,255,255,0.04)'}` }}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0" style={{ border: `2px solid ${tier.color}`, background: 'rgba(26,22,36,1)' }}>
                      {charData?.staticPortrait ? (
                        <img src={charData.staticPortrait} alt={cast.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">{charData?.avatar ?? '?'}</div>
                      )}
                    </div>
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

          {/* Locked */}
          {locked.length > 0 && (
            <div>
              <p className="text-white/20 text-[10px] font-semibold tracking-[2px] uppercase mb-3">STORY-LOCKED</p>
              <div className="grid grid-cols-3 gap-3">
                {locked.map((cast, i) => {
                  const uniColor = UNIVERSE_COLORS[cast.universeId] ?? '#fff'
                  return (
                    <motion.button
                      key={cast.id}
                      onClick={() => navigate('/universes')}
                      className="cursor-pointer flex flex-col items-center gap-1.5 rounded-2xl p-3 pb-2.5 opacity-50"
                      style={{ background: '#0D0B12', border: '1px solid rgba(255,255,255,0.03)' }}
                      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 0.5, y: 0 }} transition={{ delay: 0.15 + i * 0.04 }}
                    >
                      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#1A1624' }}>
                        <Lock size={16} className="text-white/15" />
                      </div>
                      <p className="text-white/20 text-[11px] font-semibold">???</p>
                      <span className="text-[8px] font-medium px-2 py-0.5 rounded-md" style={{ background: `${uniColor}11`, color: `${uniColor}55` }}>
                        Play {cast.universeLabel}
                      </span>
                    </motion.button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop */}
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
          <p className="text-accent/50 text-[11px] font-semibold tracking-[2px] uppercase mb-4">BASE CHARACTERS</p>
          <div className="grid grid-cols-3 gap-4 mb-10">
            {unlocked.map((cast, i) => {
              const charData = getCastCharacter(cast)
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
                  <div className="w-16 h-16 rounded-full overflow-hidden shrink-0" style={{ border: `2px solid ${tier.color}`, background: '#1A1624' }}>
                    {charData?.staticPortrait ? (
                      <img src={charData.staticPortrait} alt={cast.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">{charData?.avatar ?? '?'}</div>
                    )}
                  </div>
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

          {/* Locked */}
          {locked.length > 0 && (
            <>
              <p className="text-white/20 text-[11px] font-semibold tracking-[2px] uppercase mb-4">STORY-LOCKED — Play the story to unlock</p>
              <div className="grid grid-cols-4 lg:grid-cols-7 gap-3">
                {locked.map((cast) => {
                  const uniColor = UNIVERSE_COLORS[cast.universeId] ?? '#fff'
                  return (
                    <button
                      key={cast.id}
                      onClick={() => navigate('/universes')}
                      className="cursor-pointer flex flex-col items-center gap-2 rounded-2xl p-4 opacity-50 hover:opacity-70 transition-opacity"
                      style={{ background: '#0D0B12', border: '1px solid rgba(255,255,255,0.03)' }}
                    >
                      <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: '#1A1624' }}>
                        <Lock size={20} className="text-white/15" />
                      </div>
                      <p className="text-white/20 text-sm font-semibold">???</p>
                      <span className="text-[9px] font-medium px-2 py-0.5 rounded-md" style={{ background: `${uniColor}11`, color: `${uniColor}55` }}>
                        Play {cast.universeLabel}
                      </span>
                    </button>
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
