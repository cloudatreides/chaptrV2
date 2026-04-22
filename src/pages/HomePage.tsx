import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Pencil, MessageCircle, LogOut, Lock, Users, Compass, BookOpen, ChevronRight, Plane, Camera } from 'lucide-react'
import { useStore } from '../store/useStore'
import { UNIVERSES, GENRE_FILTERS } from '../data/storyData'
import { useAuth } from '../contexts/AuthContext'
import { STORY_STEPS } from '../data/storyData'
import { getStoryData } from '../data/stories'
import { getEligibleAmbientPings } from '../data/ambientPings'
import { getAffinityTier } from '../lib/affinity'
import { getCharacter, CHARACTERS } from '../data/characters'
import { CAST_ROSTER, UNIVERSE_COLORS, getCastCharacter } from '../data/castRoster'
import { AppSidebar } from '../components/AppSidebar'
import { AmbientPingModal } from '../components/AmbientPingModal'
import { DESTINATIONS } from '../data/travel/destinations'
import type { AmbientPingDef } from '../data/ambientPings'

const SG = "'Space Grotesk', sans-serif"

function getStepCount(universeId: string): number {
  if (universeId === 'seoul-transfer') return STORY_STEPS.length
  const data = getStoryData(universeId)
  return data?.steps?.length ?? 0
}

function getChapterLabel(stepIndex: number, total: number): string {
  if (total === 0) return 'Not started'
  const chapter = Math.min(Math.ceil(((stepIndex + 1) / total) * 5), 5)
  return `Chapter ${chapter} of 5`
}

// ─── Mode Toggle ───

function ModeToggle({ mode, setMode }: { mode: 'travel' | 'stories'; setMode: (m: 'travel' | 'stories') => void }) {
  return (
    <div
      className="flex items-center rounded-xl p-[3px]"
      style={{ background: '#111016', border: '1px solid rgba(255,255,255,0.03)' }}
    >
      <button
        onClick={() => setMode('travel')}
        className="cursor-pointer flex items-center justify-center gap-1.5 rounded-[10px] px-5 py-2 transition-all text-[13px] font-semibold flex-1"
        style={{
          background: mode === 'travel' ? '#7C3AED' : 'transparent',
          color: mode === 'travel' ? '#fff' : 'rgba(255,255,255,0.3)',
          fontFamily: SG,
        }}
      >
        <Compass size={14} /> Travel
      </button>
      <button
        onClick={() => setMode('stories')}
        className="cursor-pointer flex items-center justify-center gap-1.5 rounded-[10px] px-5 py-2 transition-all text-[13px] font-semibold flex-1"
        style={{
          background: mode === 'stories' ? '#c84b9e' : 'transparent',
          color: mode === 'stories' ? '#fff' : 'rgba(255,255,255,0.3)',
          fontFamily: SG,
        }}
      >
        <BookOpen size={14} /> Stories
      </button>
    </div>
  )
}

// ─── Travel Content ───

function TravelContent({ hasCharacters }: { hasCharacters: boolean }) {
  const navigate = useNavigate()
  const activeCharacterId = useStore((s) => s.activeCharacterId)
  const travelTrips = useStore((s) => s.travelTrips)

  const activeTrip = activeCharacterId
    ? Object.entries(travelTrips).find(([key, trip]) => key.startsWith(`${activeCharacterId}:`) && trip.phase !== 'complete')
    : null

  const available = DESTINATIONS.filter((d) => !d.locked)
  const locked = DESTINATIONS.filter((d) => d.locked)
  const hero = available[0]
  const otherAvailable = available.slice(1)

  return (
    <div className="flex flex-col gap-4">
      {/* Continue Trip */}
      {activeTrip && (
        <div>
          <p className="text-[10px] font-semibold tracking-[2px] uppercase mb-2" style={{ color: 'rgba(167,139,250,0.4)', fontFamily: SG }}>
            CONTINUE YOUR TRIP
          </p>
          <button
            onClick={() => navigate('/travel/trip')}
            className="cursor-pointer w-full flex items-center gap-3.5 rounded-2xl p-3.5 text-left"
            style={{ background: '#1A1628', border: '1px solid rgba(124,58,237,0.12)' }}
          >
            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
              <img src={DESTINATIONS.find((d) => d.id === activeTrip[1].destinationId)?.heroImage ?? ''} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold tracking-[1px] mb-0.5" style={{ color: '#A78BFA', fontFamily: SG }}>
                TRAVEL · DAY {activeTrip[1].currentDay}
              </p>
              <p className="text-white text-sm font-semibold" style={{ fontFamily: SG }}>
                {DESTINATIONS.find((d) => d.id === activeTrip[1].destinationId)?.city ?? 'Trip'}
              </p>
              <p className="text-white/40 text-xs truncate" style={{ fontFamily: SG }}>
                {activeTrip[1].phase === 'planning' ? 'Still planning...' : 'Exploring'}
              </p>
            </div>
            <ChevronRight size={16} className="text-white/20 shrink-0" />
          </button>
        </div>
      )}

      {/* Hero destination */}
      {hero && (
        <motion.button
          onClick={() => {
            if (!hasCharacters) { navigate('/create-character'); return }
            navigate(`/travel/${hero.id}`)
          }}
          className="cursor-pointer w-full rounded-2xl overflow-hidden relative"
          style={{ border: '1px solid rgba(124,58,237,0.2)' }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="relative h-[180px] overflow-hidden">
            <img src={hero.heroImage} alt={hero.city} className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(13,11,18,0.95) 0%, rgba(13,11,18,0.3) 50%, rgba(13,11,18,0) 70%)' }} />
            <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-lg">{hero.countryEmoji}</span>
                  <h3 className="text-white text-xl font-bold" style={{ fontFamily: SG }}>{hero.city}</h3>
                </div>
                <p className="text-[11px]" style={{ color: '#A78BFA', fontFamily: SG }}>{hero.vibeTags.join(' · ')}</p>
              </div>
              <div
                className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-xs font-semibold"
                style={{ background: 'linear-gradient(90deg, #7C3AED, #A78BFA)', fontFamily: SG }}
              >
                <Plane size={13} /> Plan trip
              </div>
            </div>
          </div>
        </motion.button>
      )}

      {/* Other available destinations */}
      {otherAvailable.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {otherAvailable.map((dest) => (
            <button
              key={dest.id}
              onClick={() => {
                if (!hasCharacters) { navigate('/create-character'); return }
                navigate(`/travel/${dest.id}`)
              }}
              className="cursor-pointer rounded-xl overflow-hidden text-left relative"
              style={{ border: '1px solid rgba(124,58,237,0.15)' }}
            >
              <div className="relative h-[100px] overflow-hidden">
                <img src={dest.heroImage} alt={dest.city} className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(13,11,18,0.85) 0%, transparent 50%)' }} />
                <div className="absolute bottom-0 left-0 right-0 p-2.5">
                  <div className="flex items-center gap-1">
                    <span className="text-sm">{dest.countryEmoji}</span>
                    <p className="text-white text-sm font-bold" style={{ fontFamily: SG }}>{dest.city}</p>
                  </div>
                  <p className="text-[10px]" style={{ color: '#A78BFA', fontFamily: SG }}>{dest.vibeTags.join(' · ')}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Coming soon */}
      {locked.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold tracking-[2px] uppercase mb-2" style={{ color: 'rgba(107,98,117,0.4)', fontFamily: SG }}>COMING SOON</p>
          <div className="flex gap-2.5">
            {locked.map((dest) => (
              <div key={dest.id} className="rounded-lg overflow-hidden flex items-center gap-2.5 px-2.5 py-2 flex-1" style={{ background: '#14111e', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="w-8 h-8 rounded-md overflow-hidden shrink-0">
                  <img src={dest.heroImage} alt={dest.city} className="w-full h-full object-cover" style={{ filter: 'brightness(0.6) saturate(0.7)' }} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: SG }}>{dest.countryEmoji} {dest.city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Stories Content (Homepage preview — top 5 per genre) ───

const PREVIEW_GENRES = GENRE_FILTERS.filter((g) => g !== 'ALL')

function StoriesContent({ hasCharacters, activePlaythrough, activeUniverse, firstSceneImage, handleResume }: {
  hasCharacters: boolean
  activePlaythrough: any
  activeUniverse: any
  firstSceneImage: string | null
  handleResume: () => void
}) {
  const navigate = useNavigate()
  const [genreFilter, setGenreFilter] = useState('ALL')
  const unlocked = UNIVERSES.filter((u) => !u.locked)
  const visibleGenres = genreFilter === 'ALL' ? PREVIEW_GENRES : [genreFilter]

  return (
    <div className="flex flex-col gap-4">
      {/* Genre filters */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
        {GENRE_FILTERS.map((g) => (
          <button
            key={g}
            onClick={() => setGenreFilter(g)}
            className="cursor-pointer shrink-0 text-[10px] font-semibold px-3 py-1.5 rounded-full transition-colors"
            style={{
              background: genreFilter === g ? 'rgba(200,75,158,0.15)' : 'rgba(255,255,255,0.04)',
              color: genreFilter === g ? '#c84b9e' : 'rgba(255,255,255,0.35)',
              border: `1px solid ${genreFilter === g ? 'rgba(200,75,158,0.25)' : 'rgba(255,255,255,0.06)'}`,
              fontFamily: SG,
            }}
          >
            {g[0] + g.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Upload selfie CTA if no characters */}
      {!hasCharacters && (
        <button
          onClick={() => navigate('/create-character')}
          className="cursor-pointer w-full flex items-center gap-3 rounded-xl p-3.5 text-left"
          style={{ background: '#111016', border: '1px solid rgba(200,75,158,0.12)' }}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(200,75,158,0.12)' }}>
            <Camera size={18} style={{ color: '#c84b9e' }} />
          </div>
          <div className="flex-1">
            <p className="text-white text-[13px] font-semibold" style={{ fontFamily: SG }}>Upload selfie to star in stories</p>
            <p className="text-[11px]" style={{ color: '#6B6275', fontFamily: SG }}>Your face appears in every scene</p>
          </div>
          <ChevronRight size={16} className="text-white/20 shrink-0" />
        </button>
      )}

      {/* Continue Story */}
      {hasCharacters && activePlaythrough && activeUniverse && (
        <div>
          <p className="text-[10px] font-semibold tracking-[2px] uppercase mb-2" style={{ color: 'rgba(200,75,158,0.4)', fontFamily: SG }}>
            CONTINUE READING
          </p>
          <button
            onClick={handleResume}
            className="cursor-pointer w-full flex items-center gap-3.5 rounded-2xl p-3.5 text-left"
            style={{ background: '#1A1628', border: '1px solid rgba(200,75,158,0.12)' }}
          >
            {firstSceneImage && (
              <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
                <img src={firstSceneImage} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold tracking-[1px] mb-0.5" style={{ color: '#c84b9e', fontFamily: SG }}>
                STORY · {getChapterLabel(activePlaythrough.progress.currentStepIndex, getStepCount(activePlaythrough.universeId)).toUpperCase()}
              </p>
              <p className="text-white text-sm font-semibold" style={{ fontFamily: SG }}>{activeUniverse.title}</p>
              <p className="text-white/40 text-xs" style={{ fontFamily: SG }}>
                Playing as {activePlaythrough.character.name}
              </p>
            </div>
            <ChevronRight size={16} className="text-white/20 shrink-0" />
          </button>
        </div>
      )}

      {/* Genre rows — top 5 each */}
      {visibleGenres.map((genre) => {
        const items = unlocked.filter((u) => u.genre === genre).slice(0, 5)
        if (items.length === 0) return null
        return (
          <div key={genre}>
            <p className="text-[10px] font-semibold tracking-[2px] uppercase mb-2" style={{ color: 'rgba(200,75,158,0.35)', fontFamily: SG }}>
              {genre}
            </p>
            <div className="flex gap-2.5 overflow-x-auto scrollbar-none pb-1">
              {items.map((u) => (
                <button
                  key={u.id}
                  onClick={() => navigate(`/universes/${u.id}`)}
                  className="cursor-pointer shrink-0 w-[130px] rounded-xl overflow-hidden group text-left"
                  style={{ background: '#13101c', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="h-[100px] overflow-hidden relative">
                    <img src={u.image} alt={u.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(19,16,28,0.9) 0%, transparent 60%)' }} />
                    <div className="absolute bottom-0 left-0 right-0 px-2 pb-1.5">
                      <p className="text-white text-[10px] font-semibold leading-tight" style={{ fontFamily: SG }}>{u.title}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )
      })}

      {/* See all button */}
      <button
        onClick={() => navigate('/stories')}
        className="cursor-pointer w-full h-11 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold"
        style={{ background: 'rgba(200,75,158,0.08)', border: '1px solid rgba(200,75,158,0.15)', color: '#c84b9e', fontFamily: SG }}
      >
        See all stories <ArrowRight size={14} />
      </button>
    </div>
  )
}

// ─── Main HomePage ───

export function HomePage() {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const characters = useStore((s) => s.characters)
  const storyProgress = useStore((s) => s.storyProgress)
  const setActiveCharacter = useStore((s) => s.setActiveCharacter)
  const setSelectedUniverse = useStore((s) => s.setSelectedUniverse)
  const globalAffinities = useStore((s) => s.globalAffinities)
  const ambientPings = useStore((s) => s.ambientPings)
  const lastSessionTimestamp = useStore((s) => s.lastSessionTimestamp)
  const addAmbientPing = useStore((s) => s.addAmbientPing)
  const updateLastSessionTimestamp = useStore((s) => s.updateLastSessionTimestamp)
  const dismissAmbientPing = useStore((s) => s.dismissAmbientPing)
  const unlockedCastIds = useStore((s) => s.unlockedCastIds)
  const [mode, setMode] = useState<'travel' | 'stories'>('travel')
  const [activePingModal, setActivePingModal] = useState<AmbientPingDef | null>(null)
  const hasCharacters = characters.length > 0

  // ─── Ambient pings ───
  useEffect(() => {
    if (!hasCharacters) return
    const hoursInactive = (Date.now() - lastSessionTimestamp) / (1000 * 60 * 60)
    const alreadyFiredIds = ambientPings.map((p) => p.id)
    const eligible = getEligibleAmbientPings(globalAffinities, hoursInactive, alreadyFiredIds)
    const toFire = eligible.slice(0, 2)
    for (const def of toFire) {
      addAmbientPing({
        id: def.id, characterId: def.characterId, universeId: def.universeId,
        message: def.message, timestamp: Date.now(), read: false, replies: [],
      })
    }
    updateLastSessionTimestamp()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const unreadPings = ambientPings.filter((p) => !p.read)
  const unreadCount = unreadPings.length

  // ─── Active playthrough ───
  const activePlaythrough = characters
    .map((char) => {
      const entries = Object.entries(storyProgress)
        .filter(([key]) => key.startsWith(char.id + ':'))
        .map(([key, prog]) => ({ universeId: key.split(':')[1], progress: prog }))
        .filter(({ progress }) => progress.currentStepIndex > 0)
      const best = entries.sort((a, b) => b.progress.currentStepIndex - a.progress.currentStepIndex)[0]
      return best ? { character: char, universeId: best.universeId, progress: best.progress } : null
    })
    .filter(Boolean)[0]

  const activeUniverse = activePlaythrough ? UNIVERSES.find((u) => u.id === activePlaythrough.universeId) : null
  const firstSceneImage = activePlaythrough?.progress?.sceneImages ? Object.values(activePlaythrough.progress.sceneImages)[0] as string | null : null

  const handleResume = () => {
    if (!activePlaythrough) return
    setActiveCharacter(activePlaythrough.character.id)
    setSelectedUniverse(activePlaythrough.universeId)
    navigate('/story')
  }

  // ─── Cast ───
  const unlockedCast = useMemo(() => {
    return CAST_ROSTER
      .filter((c) => unlockedCastIds.includes(c.id))
      .map((c) => {
        const score = globalAffinities[c.id] ?? 0
        const tier = getAffinityTier(score)
        const charData = getCastCharacter(c)
        return { ...c, score, tier, charData }
      })
  }, [unlockedCastIds, globalAffinities])

  const lockedCast = useMemo(() => {
    return CAST_ROSTER.filter((c) => !unlockedCastIds.includes(c.id))
  }, [unlockedCastIds])

  const handleOpenPing = (ping: typeof ambientPings[0]) => {
    const allDefs = getEligibleAmbientPings(globalAffinities, Infinity, [])
    const def = allDefs.find((d) => d.id === ping.id) ?? {
      id: ping.id, characterId: ping.characterId, universeId: ping.universeId,
      affinityMin: 0, hoursInactive: 0, message: ping.message,
      contextHint: 'A character is reaching out to the protagonist while they are away from the story.',
      maxReplies: 3,
    }
    setActivePingModal(def)
  }

  // ─── Shared: Cast Section ───
  const CastSection = ({ delay = 0 }: { delay?: number }) => {
    if (unlockedCast.length === 0 && lockedCast.length === 0) return null
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-semibold tracking-[2px] uppercase" style={{ color: 'rgba(107,98,117,0.5)', fontFamily: SG }}>YOUR CAST</p>
          <button onClick={() => navigate('/cast')} className="cursor-pointer text-xs font-medium flex items-center gap-1 transition-colors" style={{ color: 'rgba(200,75,158,0.55)', fontFamily: SG }}>
            See all <ArrowRight size={12} />
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto scrollbar-none pb-1">
          {unlockedCast.map(({ id, tier, charData }) => (
            <button key={id} onClick={() => navigate(`/cast/${id}`)} className="cursor-pointer shrink-0 flex flex-col items-center gap-1.5">
              <div className="w-12 h-12 rounded-full overflow-hidden" style={{ border: `2px solid ${tier.color}`, background: 'rgba(200,75,158,0.1)' }}>
                {charData?.staticPortrait
                  ? <img src={charData.staticPortrait} alt={charData.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-sm font-semibold" style={{ color: '#c84b9e' }}>{charData?.avatar ?? id[0]?.toUpperCase()}</div>
                }
              </div>
              <p className="text-white/70 text-[10px] font-semibold" style={{ fontFamily: SG }}>{charData?.name ?? id}</p>
            </button>
          ))}
          {lockedCast.slice(0, 4).map((c) => {
            const charData = getCastCharacter(c)
            const uniColor = UNIVERSE_COLORS[c.universeId] ?? '#555'
            return (
              <button key={c.id} onClick={() => navigate('/cast')} className="cursor-pointer shrink-0 flex flex-col items-center gap-1.5">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full overflow-hidden" style={{ border: `2px solid ${uniColor}33`, background: '#1A1624' }}>
                    {charData?.staticPortrait
                      ? <img src={charData.staticPortrait} alt={c.name} className="w-full h-full object-cover" style={{ filter: 'grayscale(0.4) brightness(0.6)' }} />
                      : <div className="w-full h-full flex items-center justify-center text-sm opacity-50">{charData?.avatar ?? c.name[0]}</div>
                    }
                  </div>
                  <div className="absolute inset-0 w-12 h-12 rounded-full flex items-center justify-center bg-black/20">
                    <Lock size={10} className="text-white/30" />
                  </div>
                </div>
                <p className="text-white/40 text-[10px] font-semibold" style={{ fontFamily: SG }}>{c.name}</p>
              </button>
            )
          })}
        </div>
      </motion.div>
    )
  }

  // ─── Shared: Ping Cards ───
  const PingCards = ({ delay = 0 }: { delay?: number }) => {
    if (unreadPings.length === 0) return null
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
        <div className="flex items-center gap-1.5 mb-2">
          <MessageCircle size={12} className="text-accent/50" />
          <p className="text-[10px] font-semibold tracking-[2px] uppercase" style={{ color: 'rgba(200,75,158,0.4)', fontFamily: SG }}>Messages</p>
          {unreadCount > 0 && (
            <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ background: '#c84b9e' }}>{unreadCount}</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          {unreadPings.map((ping) => {
            const charData = getCharacter(ping.characterId, ping.universeId) ?? CHARACTERS[ping.characterId]
            return (
              <button
                key={ping.id}
                onClick={() => handleOpenPing(ping)}
                className="cursor-pointer w-full flex items-center gap-3 rounded-xl p-3 text-left"
                style={{ background: 'rgba(200,75,158,0.06)', border: '1px solid rgba(200,75,158,0.12)' }}
              >
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm overflow-hidden shrink-0 relative" style={{ background: 'rgba(200,75,158,0.15)' }}>
                  {charData?.staticPortrait ? <img src={charData.staticPortrait} alt={charData.name} className="w-full h-full object-cover" /> : (charData?.avatar ?? '💬')}
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0a090f]" style={{ background: '#22c55e' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/85 text-sm font-medium">{charData?.name ?? ping.characterId}</p>
                  <p className="text-white/40 text-xs truncate">{ping.message}</p>
                </div>
                <MessageCircle size={14} className="text-accent shrink-0" />
              </button>
            )
          })}
        </div>
      </motion.div>
    )
  }

  return (
    <div className="bg-bg min-h-screen min-h-dvh">
      {/* ═══ MOBILE ═══ */}
      <div className="md:hidden flex flex-col min-h-screen min-h-dvh">
        <div className="flex-1 overflow-y-auto px-5 pt-14 pb-5 flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold tracking-[2px] uppercase" style={{ color: 'rgba(107,98,117,0.5)', fontFamily: SG }}>
                {hasCharacters ? 'Welcome back' : 'WELCOME TO CHAPTR'}
              </p>
              <h1 className="text-white font-bold text-[24px]" style={{ fontFamily: SG }}>Where to next?</h1>
            </div>
            <div className="flex items-center gap-2">
              {hasCharacters && (
                <button onClick={signOut} className="cursor-pointer w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/5"><LogOut size={16} className="text-white/30" /></button>
              )}
            </div>
          </div>

          {/* Toggle */}
          <ModeToggle mode={mode} setMode={setMode} />

          {/* Ping cards */}
          {hasCharacters && <PingCards delay={0.05} />}

          {/* Mode content */}
          <AnimatePresence mode="wait">
            <motion.div key={mode} initial={{ opacity: 0, x: mode === 'travel' ? -10 : 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              {mode === 'travel'
                ? <TravelContent hasCharacters={hasCharacters} />
                : <StoriesContent hasCharacters={hasCharacters} activePlaythrough={activePlaythrough} activeUniverse={activeUniverse} firstSceneImage={firstSceneImage} handleResume={handleResume} />
              }
            </motion.div>
          </AnimatePresence>

          {/* Cast */}
          {hasCharacters && <CastSection delay={0.08} />}
        </div>

        {/* Bottom tab bar */}
        <div className="shrink-0 flex items-center justify-center px-5 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: '#0D0B12' }}>
          <div className="flex items-center gap-10">
            <button onClick={() => {}} className="cursor-pointer flex flex-col items-center gap-1">
              <Users size={20} style={{ color: '#A78BFA' }} />
              <span className="text-[10px] font-semibold" style={{ color: '#A78BFA', fontFamily: SG }}>Home</span>
            </button>
            <button onClick={() => setMode('stories')} className="cursor-pointer flex flex-col items-center gap-1">
              <BookOpen size={20} style={{ color: 'rgba(255,255,255,0.3)' }} />
              <span className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: SG }}>Stories</span>
            </button>
            <button onClick={() => setMode('travel')} className="cursor-pointer flex flex-col items-center gap-1">
              <Compass size={20} style={{ color: 'rgba(255,255,255,0.3)' }} />
              <span className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: SG }}>Travel</span>
            </button>
          </div>
        </div>
      </div>

      {/* ═══ DESKTOP ═══ */}
      <div className="hidden md:flex h-screen overflow-hidden">
        <AppSidebar />
        <div className="flex-1 overflow-y-auto px-8 lg:px-12 py-10">
          <div className="max-w-[1100px]">
            {/* Header row */}
            <div className="flex items-start justify-between mb-6">
              <div>
                {hasCharacters && <p className="text-[12px] mb-1" style={{ color: '#6B6275', fontFamily: SG }}>Welcome back 👋</p>}
                <h1 className="text-white font-bold text-[36px]" style={{ fontFamily: SG }}>Where to next?</h1>
              </div>
              <div className="flex items-center gap-3">
                {hasCharacters && (
                  <button onClick={() => navigate('/characters')} className="cursor-pointer flex items-center gap-2 text-white/50 text-sm px-4 py-2.5 rounded-lg hover:bg-white/5 transition-colors" style={{ fontFamily: SG }}>
                    <Pencil size={14} /> Your Twins
                  </button>
                )}
                <button onClick={signOut} className="cursor-pointer w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5"><LogOut size={16} className="text-white/30" /></button>
              </div>
            </div>

            {/* Toggle */}
            <div className="mb-8 max-w-[300px]">
              <ModeToggle mode={mode} setMode={setMode} />
            </div>

            {/* Ping cards */}
            {hasCharacters && <div className="mb-6"><PingCards delay={0.05} /></div>}

            {/* Mode content */}
            <AnimatePresence mode="wait">
              <motion.div key={mode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                {mode === 'travel'
                  ? <DesktopTravelContent hasCharacters={hasCharacters} />
                  : <DesktopStoriesContent hasCharacters={hasCharacters} activePlaythrough={activePlaythrough} activeUniverse={activeUniverse} firstSceneImage={firstSceneImage} handleResume={handleResume} />
                }
              </motion.div>
            </AnimatePresence>

            {/* Cast */}
            {hasCharacters && <div className="mt-8"><CastSection delay={0.1} /></div>}
          </div>
        </div>
      </div>

      {/* Ambient Ping Modal */}
      <AnimatePresence>
        {activePingModal && (
          <AmbientPingModal
            ping={activePingModal}
            onDismiss={() => { dismissAmbientPing(activePingModal.id); setActivePingModal(null) }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Desktop Travel Content ───

function DesktopTravelContent({ hasCharacters }: { hasCharacters: boolean }) {
  const navigate = useNavigate()
  const activeCharacterId = useStore((s) => s.activeCharacterId)
  const travelTrips = useStore((s) => s.travelTrips)

  const activeTrip = activeCharacterId
    ? Object.entries(travelTrips).find(([key, trip]) => key.startsWith(`${activeCharacterId}:`) && trip.phase !== 'complete')
    : null

  const available = DESTINATIONS.filter((d) => !d.locked)
  const locked = DESTINATIONS.filter((d) => d.locked)
  const hero = available[0]
  const otherAvailable = available.slice(1)

  return (
    <div className="flex flex-col gap-6">
      {/* Continue trip card */}
      {activeTrip && (
        <button
          onClick={() => navigate('/travel/trip')}
          className="cursor-pointer w-full flex items-center gap-4 rounded-2xl p-4 text-left"
          style={{ background: '#1A1628', border: '1px solid rgba(124,58,237,0.12)' }}
        >
          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
            <img src={DESTINATIONS.find((d) => d.id === activeTrip[1].destinationId)?.heroImage ?? ''} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold tracking-[1px] mb-0.5" style={{ color: '#A78BFA', fontFamily: SG }}>
              DAY {activeTrip[1].currentDay} · {DESTINATIONS.find((d) => d.id === activeTrip[1].destinationId)?.city?.toUpperCase()}
            </p>
            <p className="text-white text-[15px] font-semibold" style={{ fontFamily: SG }}>
              {DESTINATIONS.find((d) => d.id === activeTrip[1].destinationId)?.city}
            </p>
            <p className="text-white/40 text-xs" style={{ fontFamily: SG }}>
              {activeTrip[1].phase === 'planning' ? 'Still planning...' : 'Exploring'}
            </p>
          </div>
          <ChevronRight size={18} className="text-white/20 shrink-0" />
        </button>
      )}

      {/* Destinations — hero + grid */}
      <div className="grid grid-cols-3 gap-4" style={{ gridTemplateRows: 'auto auto' }}>
        {/* Tokyo — featured, spans 2 cols */}
        {hero && (
          <button
            onClick={() => {
              if (!hasCharacters) { navigate('/create-character'); return }
              navigate(`/travel/${hero.id}`)
            }}
            className="cursor-pointer group rounded-2xl overflow-hidden relative col-span-2 row-span-1"
            style={{ border: '1px solid rgba(124,58,237,0.2)' }}
          >
            <div className="relative h-[260px] overflow-hidden">
              <img src={hero.heroImage} alt={hero.city} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(13,11,18,0.95) 0%, rgba(13,11,18,0.4) 40%, rgba(13,11,18,0) 70%)' }} />
              <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{hero.countryEmoji}</span>
                    <h3 className="text-white text-2xl font-bold" style={{ fontFamily: SG }}>{hero.city}</h3>
                  </div>
                  <p className="text-[12px]" style={{ color: '#A78BFA', fontFamily: SG }}>{hero.vibeTags.join(' · ')}</p>
                  <p className="text-[12px] mt-1" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: SG }}>{hero.description}</p>
                </div>
                <div
                  className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
                  style={{ background: 'linear-gradient(90deg, #7C3AED, #A78BFA)', fontFamily: SG }}
                >
                  <Plane size={15} /> Plan trip
                </div>
              </div>
            </div>
          </button>
        )}

        {/* Seoul — tall card beside Tokyo */}
        {otherAvailable[0] && (
          <button
            onClick={() => {
              if (!hasCharacters) { navigate('/create-character'); return }
              navigate(`/travel/${otherAvailable[0].id}`)
            }}
            className="cursor-pointer group rounded-2xl overflow-hidden relative row-span-1"
            style={{ border: '1px solid rgba(124,58,237,0.15)' }}
          >
            <div className="relative h-[260px] overflow-hidden">
              <img src={otherAvailable[0].heroImage} alt={otherAvailable[0].city} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(13,11,18,0.9) 0%, rgba(13,11,18,0.2) 50%, transparent 70%)' }} />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-base">{otherAvailable[0].countryEmoji}</span>
                  <p className="text-white text-lg font-bold" style={{ fontFamily: SG }}>{otherAvailable[0].city}</p>
                </div>
                <p className="text-[11px]" style={{ color: '#A78BFA', fontFamily: SG }}>{otherAvailable[0].vibeTags.join(' · ')}</p>
                <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: SG }}>{otherAvailable[0].description}</p>
              </div>
            </div>
          </button>
        )}

        {/* Locked destinations — same row, smaller cards */}
        {locked.map((dest) => (
          <div
            key={dest.id}
            className="rounded-2xl overflow-hidden relative"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="relative h-[160px] overflow-hidden">
              <img src={dest.heroImage} alt={dest.city} className="w-full h-full object-cover" style={{ filter: 'brightness(0.65) saturate(0.7)' }} />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(13,11,18,0.9) 0%, rgba(13,11,18,0.2) 50%, transparent 70%)' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white/50 text-xs font-medium px-3 py-1.5 rounded-full" style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)', fontFamily: SG }}>Coming soon</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-base">{dest.countryEmoji}</span>
                  <p className="text-lg font-bold" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: SG }}>{dest.city}</p>
                </div>
                <p className="text-[11px]" style={{ color: '#6B5F7A', fontFamily: SG }}>{dest.vibeTags.join(' · ')}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Desktop Stories Content (Homepage preview — top 5 per genre) ───

function DesktopStoriesContent({ hasCharacters, activePlaythrough, activeUniverse, firstSceneImage, handleResume }: {
  hasCharacters: boolean
  activePlaythrough: any
  activeUniverse: any
  firstSceneImage: string | null
  handleResume: () => void
}) {
  const navigate = useNavigate()
  const [genreFilter, setGenreFilter] = useState('ALL')
  const unlocked = UNIVERSES.filter((u) => !u.locked)
  const visibleGenres = genreFilter === 'ALL' ? PREVIEW_GENRES : [genreFilter]

  return (
    <div className="flex flex-col gap-6">
      {/* Genre filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none">
        {GENRE_FILTERS.map((g) => (
          <button
            key={g}
            onClick={() => setGenreFilter(g)}
            className="cursor-pointer shrink-0 text-[11px] font-semibold px-3.5 py-1.5 rounded-full transition-colors"
            style={{
              background: genreFilter === g ? 'rgba(200,75,158,0.15)' : 'rgba(255,255,255,0.04)',
              color: genreFilter === g ? '#c84b9e' : 'rgba(255,255,255,0.35)',
              border: `1px solid ${genreFilter === g ? 'rgba(200,75,158,0.25)' : 'rgba(255,255,255,0.06)'}`,
              fontFamily: SG,
            }}
          >
            {g[0] + g.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Upload selfie CTA */}
      {!hasCharacters && (
        <button
          onClick={() => navigate('/create-character')}
          className="cursor-pointer w-full max-w-[520px] flex items-center gap-4 rounded-xl p-4 text-left"
          style={{ background: '#111016', border: '1px solid rgba(200,75,158,0.12)' }}
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(200,75,158,0.12)' }}>
            <Camera size={20} style={{ color: '#c84b9e' }} />
          </div>
          <div className="flex-1">
            <p className="text-white text-[15px] font-semibold" style={{ fontFamily: SG }}>Upload selfie to star in stories</p>
            <p className="text-[13px]" style={{ color: '#6B6275', fontFamily: SG }}>Your face appears in every scene</p>
          </div>
          <ChevronRight size={18} className="text-white/20 shrink-0" />
        </button>
      )}

      {/* Continue story */}
      {hasCharacters && activePlaythrough && activeUniverse && (
        <div>
          <p className="text-[11px] font-semibold tracking-[2px] uppercase mb-3" style={{ color: 'rgba(200,75,158,0.4)', fontFamily: SG }}>CONTINUE READING</p>
          <button
            onClick={handleResume}
            className="cursor-pointer w-full max-w-[520px] flex items-center gap-4 rounded-2xl p-4 text-left group"
            style={{ background: '#1A1628', border: '1px solid rgba(200,75,158,0.12)' }}
          >
            {firstSceneImage && (
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                <img src={firstSceneImage} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold tracking-[1px] mb-0.5" style={{ color: '#c84b9e', fontFamily: SG }}>
                {getChapterLabel(activePlaythrough.progress.currentStepIndex, getStepCount(activePlaythrough.universeId)).toUpperCase()} · {activeUniverse.genreTag}
              </p>
              <p className="text-white text-[15px] font-semibold" style={{ fontFamily: SG }}>{activeUniverse.title}</p>
              <p className="text-white/40 text-xs mt-0.5" style={{ fontFamily: SG }}>Playing as {activePlaythrough.character.name}</p>
            </div>
            <ChevronRight size={18} className="text-white/20 shrink-0" />
          </button>
        </div>
      )}

      {/* Genre rows — top 5 each */}
      {visibleGenres.map((genre) => {
        const items = unlocked.filter((u) => u.genre === genre).slice(0, 5)
        if (items.length === 0) return null
        return (
          <div key={genre}>
            <p className="text-[11px] font-semibold tracking-[2px] uppercase mb-3" style={{ color: 'rgba(200,75,158,0.35)', fontFamily: SG }}>
              {genre}
            </p>
            <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
              {items.map((u) => (
                <button
                  key={u.id}
                  onClick={() => navigate(`/universes/${u.id}`)}
                  className="cursor-pointer shrink-0 w-[180px] rounded-xl overflow-hidden group text-left"
                  style={{ background: '#13101c', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="relative h-[140px] overflow-hidden">
                    <img src={u.image} alt={u.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(19,16,28,0.9) 0%, transparent 50%)' }} />
                    <div className="absolute bottom-0 left-0 right-0 p-2.5">
                      <span className="text-[8px] font-semibold tracking-[1px] uppercase" style={{ color: '#c84b9e', fontFamily: SG }}>{u.genreTag}</span>
                      <p className="text-white text-[12px] font-semibold leading-tight mt-0.5" style={{ fontFamily: SG }}>{u.title}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )
      })}

      {/* See all button */}
      <button
        onClick={() => navigate('/stories')}
        className="cursor-pointer w-full max-w-[320px] h-11 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold"
        style={{ background: 'rgba(200,75,158,0.08)', border: '1px solid rgba(200,75,158,0.15)', color: '#c84b9e', fontFamily: SG }}
      >
        See all stories <ArrowRight size={14} />
      </button>
    </div>
  )
}
