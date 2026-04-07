import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Plus, Pencil, Sparkles, MessageCircle, Heart, LogOut } from 'lucide-react'
import { useStore } from '../store/useStore'
import { UNIVERSES } from '../data/storyData'
import { useAuth } from '../contexts/AuthContext'
import { STORY_STEPS } from '../data/storyData'
import { getStoryData } from '../data/stories'
import { getEligibleAmbientPings } from '../data/ambientPings'
import { getAffinityTier } from '../lib/affinity'
import { getCharacter, CHARACTERS } from '../data/characters'
import { CAST_ROSTER, UNIVERSE_COLORS, getCastCharacter } from '../data/castRoster'
import { AmbientPingModal } from '../components/AmbientPingModal'
import type { AmbientPingDef } from '../data/ambientPings'

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

export function HomePage() {
  const navigate = useNavigate()
  const { session, signOut } = useAuth()
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

  const [activePingModal, setActivePingModal] = useState<AmbientPingDef | null>(null)

  const userName = session?.user?.user_metadata?.full_name?.split(' ')[0] ?? characters[0]?.name ?? 'You'
  const hasCharacters = characters.length > 0

  // ─── Ambient pings: check on mount ───
  useEffect(() => {
    if (!hasCharacters) return

    const hoursInactive = (Date.now() - lastSessionTimestamp) / (1000 * 60 * 60)
    const alreadyFiredIds = ambientPings.map((p) => p.id)
    const eligible = getEligibleAmbientPings(globalAffinities, hoursInactive, alreadyFiredIds)

    // Fire up to 2 pings per session
    const toFire = eligible.slice(0, 2)
    for (const def of toFire) {
      addAmbientPing({
        id: def.id,
        characterId: def.characterId,
        universeId: def.universeId,
        message: def.message,
        timestamp: Date.now(),
        read: false,
        replies: [],
      })
    }

    updateLastSessionTimestamp()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Unread ambient pings ───
  const unreadPings = ambientPings.filter((p) => !p.read)
  const unreadCount = unreadPings.length

  const unlockedCastIds = useStore((s) => s.unlockedCastIds)

  // ─── Cast roster: unlocked + locked characters ───
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

  // Find active playthrough (most recent character with progress)
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

  const activeUniverse = activePlaythrough
    ? UNIVERSES.find((u) => u.id === activePlaythrough.universeId)
    : null

  const handleResume = () => {
    if (!activePlaythrough) return
    setActiveCharacter(activePlaythrough.character.id)
    setSelectedUniverse(activePlaythrough.universeId)
    navigate('/story')
  }

  const handleNewStory = () => navigate('/universes')

  const handleEditCharacters = () => navigate('/characters')

  // Get all universe progress for current characters
  const universeCards = UNIVERSES.filter((u) => !u.locked).slice(0, 4)

  // Get first scene image safely
  const firstSceneImage = activePlaythrough?.progress?.sceneImages
    ? Object.values(activePlaythrough.progress.sceneImages)[0]
    : null

  // ─── Ambient ping card helper ───
  const handleOpenPing = (ping: typeof ambientPings[0]) => {
    // Find the matching def from all ambient pings
    const allDefs = getEligibleAmbientPings(globalAffinities, Infinity, [])
    const def = allDefs.find((d) => d.id === ping.id) ?? {
      id: ping.id,
      characterId: ping.characterId,
      universeId: ping.universeId,
      affinityMin: 0,
      hoursInactive: 0,
      message: ping.message,
      contextHint: 'A character is reaching out to the protagonist while they are away from the story.',
      maxReplies: 3,
    }
    setActivePingModal(def)
  }

  // ─── Characters To Meet section (shared between mobile + desktop) ───
  const CastSection = ({ className = '', delay = 0 }: { className?: string; delay?: number }) => {
    if (unlockedCast.length === 0 && lockedCast.length === 0) return null
    return (
      <motion.div className={className} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Heart size={12} className="text-accent/50" />
            <p className="text-accent/50 text-[10px] font-semibold tracking-[2px] uppercase">Characters To Meet</p>
          </div>
          <button onClick={() => navigate('/cast')} className="cursor-pointer text-accent text-xs font-medium flex items-center gap-1 hover:text-accent/80 transition-colors active:opacity-75">
            Explore All <ArrowRight size={12} />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
          {/* Unlocked — tappable */}
          {unlockedCast.map(({ id, score, tier, charData }) => (
            <button
              key={id}
              onClick={() => navigate(`/cast/${id}`)}
              className="cursor-pointer shrink-0 flex flex-col items-center gap-1.5 active:opacity-75 transition-opacity"
            >
              <div className="relative">
                <div
                  className="w-12 h-12 rounded-full overflow-hidden"
                  style={{ border: `2px solid ${tier.color}`, background: 'rgba(200,75,158,0.1)' }}
                >
                  {charData?.staticPortrait ? (
                    <img src={charData.staticPortrait} alt={charData.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-accent text-sm font-semibold">
                      {charData?.avatar ?? id[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                {score > 0 && (
                  <svg className="absolute inset-0 w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="22" fill="none" stroke={tier.color} strokeWidth="2" strokeDasharray={`${(score / 100) * 138} 138`} strokeLinecap="round" opacity={0.4} />
                  </svg>
                )}
              </div>
              <p className="text-white/70 text-[10px] font-semibold">{charData?.name ?? id}</p>
              <p className="text-[9px] font-medium" style={{ color: tier.color }}>{tier.label}</p>
            </button>
          ))}
          {/* Locked — silhouettes */}
          {lockedCast.slice(0, 4).map((c) => (
            <div key={c.id} className="shrink-0 flex flex-col items-center gap-1.5 opacity-40">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ border: `2px solid ${UNIVERSE_COLORS[c.universeId] ?? '#555'}22`, background: 'rgba(255,255,255,0.03)' }}
              >
                <span className="text-white/20 text-lg">?</span>
              </div>
              <p className="text-white/30 text-[10px] font-semibold">{c.name}</p>
              <p className="text-[9px] font-medium text-white/20">{c.universeLabel}</p>
            </div>
          ))}
        </div>
      </motion.div>
    )
  }

  // ─── Ambient ping cards (shared) ───
  const PingCards = ({ delay = 0 }: { delay?: number }) => {
    if (unreadPings.length === 0) return null
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
        <div className="flex items-center gap-1.5 mb-2">
          <MessageCircle size={12} className="text-accent/50" />
          <p className="text-accent/50 text-[10px] font-semibold tracking-[2px] uppercase">Messages</p>
          {unreadCount > 0 && (
            <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ background: '#c84b9e' }}>
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          {unreadPings.map((ping) => {
            const charData = getCharacter(ping.characterId, ping.universeId) ?? CHARACTERS[ping.characterId]
            return (
              <button
                key={ping.id}
                onClick={() => handleOpenPing(ping)}
                className="cursor-pointer w-full flex items-center gap-3 rounded-xl p-3 text-left transition-all hover:brightness-110 active:brightness-90"
                style={{ background: 'rgba(200,75,158,0.06)', border: '1px solid rgba(200,75,158,0.12)' }}
              >
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm overflow-hidden shrink-0 relative" style={{ background: 'rgba(200,75,158,0.15)' }}>
                  {charData?.staticPortrait ? (
                    <img src={charData.staticPortrait} alt={charData.name} className="w-full h-full object-cover" />
                  ) : (
                    charData?.avatar ?? '💬'
                  )}
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
      <div className="md:hidden flex flex-col min-h-screen min-h-dvh px-5 pt-14 pb-5 gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-accent text-[11px] font-semibold tracking-[2px] uppercase">Welcome back</p>
            <h1 className="text-white font-bold text-[26px]">{userName}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={signOut}
              className="cursor-pointer w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-white/5 active:bg-white/10"
              title="Log out"
            >
              <LogOut size={16} className="text-white/30" />
            </button>
            <div className="relative">
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold text-sm" style={{ background: 'linear-gradient(135deg, #c84b9e, #8b5cf6)' }}>
                {userName[0]?.toUpperCase()}
              </div>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: '#c84b9e', border: '2px solid #0a090f' }}>
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Empty state — first-time user */}
        {!hasCharacters && (
          <motion.div
            className="flex-1 flex flex-col items-center justify-center gap-5 py-8"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(200,75,158,0.15), rgba(139,92,246,0.15))', border: '1px solid rgba(200,75,158,0.2)' }}>
              <Sparkles size={28} className="text-accent" />
            </div>
            <div className="text-center">
              <h2 className="text-white font-bold text-xl mb-2">Create your first character</h2>
              <p className="text-white/40 text-sm leading-relaxed max-w-[260px]">
                Upload a selfie, pick a personality, and step into an AI-powered story where you're the main character.
              </p>
            </div>
            <motion.button
              onClick={() => navigate('/create-character')}
              className="cursor-pointer flex items-center gap-2 text-white font-semibold text-[15px] px-8 py-3.5 rounded-xl"
              style={{ background: 'linear-gradient(135deg, #c84b9e, #8b5cf6)' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Get Started <ArrowRight size={18} />
            </motion.button>
          </motion.div>
        )}

        {/* Ambient Ping Cards */}
        {hasCharacters && <PingCards delay={0.05} />}

        {/* Continue Story */}
        {hasCharacters && activePlaythrough && activeUniverse && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-accent/50 text-[10px] font-semibold tracking-[2px] uppercase mb-2">Continue Story</p>
            <button
              onClick={handleResume}
              className="cursor-pointer w-full text-left rounded-2xl overflow-hidden"
              style={{ background: 'linear-gradient(160deg, #161220, #1a1428)', border: '1px solid rgba(200,75,158,0.1)' }}
            >
              {firstSceneImage && (
                <div className="w-full h-[100px] overflow-hidden">
                  <img src={firstSceneImage} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="px-4 py-3 flex flex-col gap-2">
                <p className="text-accent text-[10px] font-semibold tracking-[1px]">{activeUniverse.title}</p>
                <p className="text-white font-semibold text-base">
                  {getChapterLabel(activePlaythrough.progress.currentStepIndex, getStepCount(activePlaythrough.universeId))}
                </p>
                {/* Progress bar */}
                <div className="w-full h-[5px] rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(((activePlaythrough.progress.currentStepIndex + 1) / getStepCount(activePlaythrough.universeId)) * 100, 100)}%`,
                      background: 'linear-gradient(90deg, #c84b9e, #8b5cf6)',
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full overflow-hidden shrink-0" style={{ background: 'rgba(200,75,158,0.15)' }}>
                    {activePlaythrough.character.selfieUrl ? (
                      <img src={activePlaythrough.character.selfieUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-accent text-[9px] font-semibold">
                        {activePlaythrough.character.name[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <p className="text-white/50 text-[11px]">
                    Playing as {activePlaythrough.character.name}
                  </p>
                </div>
              </div>
            </button>
          </motion.div>
        )}

        {/* Characters To Meet */}
        {hasCharacters && <CastSection delay={0.08} />}

        {/* Your Universes */}
        {hasCharacters && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-accent/50 text-[10px] font-semibold tracking-[2px] uppercase">Your Universes</p>
              <button onClick={() => navigate('/universes')} className="cursor-pointer text-accent text-xs font-medium flex items-center gap-1 active:opacity-75">
                Explore All <ArrowRight size={12} />
              </button>
            </div>
            <div className="flex gap-2.5 overflow-x-auto scrollbar-none pb-1">
              {universeCards.map((u) => (
                <button
                  key={u.id}
                  onClick={() => { setSelectedUniverse(u.id); navigate('/characters') }}
                  className="cursor-pointer shrink-0 w-[100px] h-[120px] rounded-xl overflow-hidden relative group active:opacity-75 transition-opacity"
                  style={{ background: '#1a1428' }}
                >
                  <img src={u.image} alt={u.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,9,15,0.9) 0%, transparent 60%)' }} />
                  <p className="absolute bottom-2 left-2 right-2 text-white/80 text-[10px] font-semibold leading-tight">{u.title}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Your Twins */}
        {hasCharacters && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-accent/50 text-[10px] font-semibold tracking-[2px] uppercase">Your Twins</p>
              <button onClick={handleEditCharacters} className="cursor-pointer text-accent text-xs font-medium flex items-center gap-1">
                <Pencil size={14} /> Edit
              </button>
            </div>
            <div className="flex gap-4">
              {characters.map((char) => (
                <button
                  key={char.id}
                  onClick={() => navigate(`/edit-character/${char.id}`)}
                  className="cursor-pointer flex flex-col items-center gap-1.5 active:opacity-75 transition-opacity"
                >
                  <div className="w-14 h-14 rounded-full overflow-hidden" style={{ border: '2px solid rgba(200,75,158,0.4)', background: 'rgba(200,75,158,0.1)' }}>
                    {char.selfieUrl ? (
                      <img src={char.selfieUrl} alt={char.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-accent text-lg font-semibold">
                        {char.name[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <p className="text-white/75 text-[11px] font-semibold">{char.name}</p>
                </button>
              ))}
              {characters.length < 3 && (
                <button onClick={() => navigate('/create-character')} className="cursor-pointer flex flex-col items-center gap-1.5 active:opacity-75 transition-opacity">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ border: '1.5px dashed rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
                    <Plus size={20} className="text-white/20" />
                  </div>
                  <p className="text-white/30 text-[11px] font-medium">New</p>
                </button>
              )}
            </div>
          </motion.div>
        )}


        {/* New Story CTA */}
        {hasCharacters && (
          <motion.button
            onClick={handleNewStory}
            className="cursor-pointer w-full h-[52px] rounded-xl flex items-center justify-center gap-2 text-white font-semibold text-[15px] mt-auto"
            style={{ background: 'linear-gradient(135deg, #c84b9e, #8b5cf6)' }}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Start New Story <ArrowRight size={18} />
          </motion.button>
        )}
      </div>

      {/* ═══ DESKTOP ═══ */}
      <div className="hidden md:block min-h-screen">
        <div className="page-container px-8 lg:px-16 py-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ background: 'linear-gradient(135deg, #c84b9e, #8b5cf6)' }}>
                  {userName[0]?.toUpperCase()}
                </div>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: '#c84b9e', border: '2px solid #0a090f' }}>
                    {unreadCount}
                  </span>
                )}
              </div>
              <div>
                <p className="text-accent text-xs font-semibold tracking-[2px] uppercase">Welcome back</p>
                <h1 className="text-white font-bold text-3xl">{userName}</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleNewStory}
                className="cursor-pointer flex items-center gap-2.5 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #c84b9e, #8b5cf6)' }}
              >
                <Plus size={16} /> New Story
              </button>
              <button
                onClick={signOut}
                className="cursor-pointer w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-white/5 active:bg-white/10"
                title="Log out"
              >
                <LogOut size={16} className="text-white/30" />
              </button>
            </div>
          </div>

          {/* Empty state — first-time user */}
          {!hasCharacters && (
            <motion.div
              className="flex flex-col items-center justify-center gap-6 py-24"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(200,75,158,0.15), rgba(139,92,246,0.15))', border: '1px solid rgba(200,75,158,0.2)' }}>
                <Sparkles size={36} className="text-accent" />
              </div>
              <div className="text-center">
                <h2 className="text-white font-bold text-2xl mb-3">Create your first character</h2>
                <p className="text-white/40 text-base leading-relaxed max-w-[380px]">
                  Upload a selfie, pick a personality, and step into an AI-powered story where you're the main character.
                </p>
              </div>
              <motion.button
                onClick={() => navigate('/create-character')}
                className="cursor-pointer flex items-center gap-2 text-white font-semibold px-8 py-3.5 rounded-xl"
                style={{ background: 'linear-gradient(135deg, #c84b9e, #8b5cf6)' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Get Started <ArrowRight size={18} />
              </motion.button>
            </motion.div>
          )}

          {hasCharacters && (
            <div className="flex gap-8">
              {/* Left column — main content */}
              <div className="flex-1 flex flex-col gap-8">
                {/* Ambient Ping Cards */}
                <PingCards delay={0.05} />

                {/* Continue Story */}
                {activePlaythrough && activeUniverse && (
                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                    <p className="text-accent/50 text-[10px] font-semibold tracking-[2px] uppercase mb-3">Continue Story</p>
                    <button
                      onClick={handleResume}
                      className="cursor-pointer w-full text-left rounded-2xl overflow-hidden group"
                      style={{ background: 'linear-gradient(160deg, #161220, #1a1428)', border: '1px solid rgba(200,75,158,0.1)', boxShadow: '0 4px 30px rgba(0,0,0,0.3)' }}
                    >
                      <div className="flex">
                        {firstSceneImage && (
                          <div className="w-[280px] h-[180px] overflow-hidden shrink-0">
                            <img src={firstSceneImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          </div>
                        )}
                        <div className="flex-1 px-6 py-5 flex flex-col justify-center gap-3">
                          <p className="text-accent text-[11px] font-semibold tracking-[1px]">{activeUniverse.title}</p>
                          <p className="text-white font-semibold text-xl">
                            {getChapterLabel(activePlaythrough.progress.currentStepIndex, getStepCount(activePlaythrough.universeId))}
                          </p>
                          <div className="w-full max-w-[300px] h-[5px] rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min(((activePlaythrough.progress.currentStepIndex + 1) / getStepCount(activePlaythrough.universeId)) * 100, 100)}%`,
                                background: 'linear-gradient(90deg, #c84b9e, #8b5cf6)',
                              }}
                            />
                          </div>
                          <div className="flex items-center gap-2 text-white/60 text-sm">
                            Resume as {activePlaythrough.character.name} <ArrowRight size={14} />
                          </div>
                        </div>
                      </div>
                    </button>
                  </motion.div>
                )}

                {/* Characters To Meet */}
                <CastSection delay={0.08} />

                {/* Universes */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-accent/50 text-[10px] font-semibold tracking-[2px] uppercase">Your Universes</p>
                    <button onClick={() => navigate('/universes')} className="cursor-pointer text-accent text-xs font-medium flex items-center gap-1 hover:text-accent/80 transition-colors">
                      Explore All <ArrowRight size={12} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {universeCards.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => { setSelectedUniverse(u.id); navigate('/characters') }}
                        className="cursor-pointer rounded-xl overflow-hidden relative group h-[160px]"
                        style={{ background: '#1a1428' }}
                      >
                        <img src={u.image} alt={u.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,9,15,0.9) 0%, transparent 50%)' }} />
                        <div className="absolute bottom-3 left-3 right-3">
                          <span className="text-accent text-[9px] font-semibold tracking-[1px] uppercase">{u.genreTag}</span>
                          <p className="text-white/90 text-sm font-semibold mt-0.5">{u.title}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>

              </div>

              {/* Right sidebar — Characters */}
              <motion.div
                className="w-[260px] shrink-0"
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-accent/50 text-[10px] font-semibold tracking-[2px] uppercase">Your Twins</p>
                  <button onClick={handleEditCharacters} className="cursor-pointer text-accent text-xs font-medium flex items-center gap-1 hover:text-accent/80 transition-colors">
                    <Pencil size={14} /> Edit
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {characters.map((char) => (
                    <button
                      key={char.id}
                      onClick={() => navigate(`/edit-character/${char.id}`)}
                      className="cursor-pointer w-full flex items-center gap-3 rounded-xl p-3 text-left transition-all hover:brightness-110 active:brightness-90"
                      style={{ background: '#111016', border: '1px solid rgba(200,75,158,0.08)' }}
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden shrink-0" style={{ border: '2px solid rgba(200,75,158,0.3)', background: 'rgba(200,75,158,0.1)' }}>
                        {char.selfieUrl ? (
                          <img src={char.selfieUrl} alt={char.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-accent font-semibold">
                            {char.name[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <p className="text-white/85 font-semibold text-sm">{char.name}</p>
                        <p className="text-white/30 text-xs">{char.gender === 'female' ? 'Female' : 'Male'} · {char.bio ? char.bio.slice(0, 30) : 'No bio'}</p>
                      </div>
                    </button>
                  ))}

                  {characters.length < 3 && (
                    <button
                      onClick={() => navigate('/create-character')}
                      className="cursor-pointer w-full flex items-center justify-center gap-2 rounded-xl p-4 transition-all hover:brightness-125 active:brightness-90"
                      style={{ border: '1.5px dashed rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.01)' }}
                    >
                      <Plus size={16} className="text-white/20" />
                      <p className="text-white/25 text-sm font-medium">Create Twin</p>
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Ambient Ping Modal ─── */}
      <AnimatePresence>
        {activePingModal && (
          <AmbientPingModal
            ping={activePingModal}
            onDismiss={() => {
              dismissAmbientPing(activePingModal.id)
              setActivePingModal(null)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
