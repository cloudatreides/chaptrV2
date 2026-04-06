import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Plus, Pencil } from 'lucide-react'
import { useStore } from '../store/useStore'
import { UNIVERSES } from '../data/storyData'
import { useAuth } from '../contexts/AuthContext'
import { STORY_STEPS } from '../data/storyData'
import { getStoryData } from '../data/stories'

const INTER = "'Inter', sans-serif"

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
  const { session } = useAuth()
  const characters = useStore((s) => s.characters)
  const storyProgress = useStore((s) => s.storyProgress)
  const setActiveCharacter = useStore((s) => s.setActiveCharacter)
  const setSelectedUniverse = useStore((s) => s.setSelectedUniverse)

  const userName = session?.user?.user_metadata?.full_name?.split(' ')[0] ?? characters[0]?.name ?? 'You'

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

  return (
    <div className="bg-bg min-h-screen min-h-dvh">
      {/* ═══ MOBILE ═══ */}
      <div className="md:hidden flex flex-col min-h-screen min-h-dvh px-5 pt-14 pb-5 gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-accent text-[11px] font-semibold tracking-[2px] uppercase" style={{ fontFamily: INTER }}>Welcome back</p>
            <h1 className="text-white font-bold text-[26px]" style={{ fontFamily: INTER }}>{userName}</h1>
          </div>
          <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold text-sm" style={{ background: 'linear-gradient(135deg, #c84b9e, #8b5cf6)' }}>
            {userName[0]?.toUpperCase()}
          </div>
        </div>

        {/* Continue Story */}
        {activePlaythrough && activeUniverse && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-accent/50 text-[10px] font-semibold tracking-[2px] uppercase mb-2" style={{ fontFamily: INTER }}>Continue Story</p>
            <button
              onClick={handleResume}
              className="w-full text-left rounded-2xl overflow-hidden"
              style={{ background: 'linear-gradient(160deg, #161220, #1a1428)', border: '1px solid rgba(200,75,158,0.1)' }}
            >
              {activePlaythrough.progress.sceneImages && Object.values(activePlaythrough.progress.sceneImages)[0] && (
                <div className="w-full h-[100px] overflow-hidden">
                  <img src={Object.values(activePlaythrough.progress.sceneImages)[0]} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="px-4 py-3 flex flex-col gap-2">
                <p className="text-accent text-[10px] font-semibold tracking-[1px]" style={{ fontFamily: INTER }}>{activeUniverse.title}</p>
                <p className="text-white font-semibold text-base" style={{ fontFamily: INTER }}>
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
                  <div className="w-5 h-5 rounded-full bg-accent/15" />
                  <p className="text-white/30 text-[11px]" style={{ fontFamily: INTER }}>
                    Playing as {activePlaythrough.character.name}
                  </p>
                </div>
              </div>
            </button>
          </motion.div>
        )}

        {/* Your Universes */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <p className="text-accent/50 text-[10px] font-semibold tracking-[2px] uppercase mb-2" style={{ fontFamily: INTER }}>Your Universes</p>
          <div className="flex gap-2.5 overflow-x-auto scrollbar-none pb-1">
            {universeCards.map((u) => (
              <button
                key={u.id}
                onClick={() => { setSelectedUniverse(u.id); navigate('/characters') }}
                className="shrink-0 w-[100px] h-[120px] rounded-xl overflow-hidden relative group"
                style={{ background: '#1a1428' }}
              >
                <img src={u.image} alt={u.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,9,15,0.9) 0%, transparent 60%)' }} />
                <p className="absolute bottom-2 left-2 right-2 text-white/80 text-[10px] font-semibold leading-tight" style={{ fontFamily: INTER }}>{u.title}</p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Your Characters */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-accent/50 text-[10px] font-semibold tracking-[2px] uppercase" style={{ fontFamily: INTER }}>Your Characters</p>
            <button onClick={handleEditCharacters} className="text-accent text-xs font-medium flex items-center gap-1" style={{ fontFamily: INTER }}>
              <Pencil size={10} /> Edit
            </button>
          </div>
          <div className="flex gap-4">
            {characters.map((char) => (
              <button
                key={char.id}
                onClick={() => { setActiveCharacter(char.id); navigate('/characters') }}
                className="flex flex-col items-center gap-1.5"
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
                <p className="text-white/75 text-[11px] font-semibold" style={{ fontFamily: INTER }}>{char.name}</p>
              </button>
            ))}
            {characters.length < 3 && (
              <button onClick={() => navigate('/create-character')} className="flex flex-col items-center gap-1.5">
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ border: '1.5px dashed rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
                  <Plus size={20} className="text-white/20" />
                </div>
                <p className="text-white/30 text-[11px] font-medium" style={{ fontFamily: INTER }}>New</p>
              </button>
            )}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="flex gap-2.5"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        >
          {[
            { val: characters.length.toString(), label: 'Characters', color: '#c84b9e' },
            { val: Object.values(storyProgress).reduce((sum, p) => sum + Object.keys(p.branchChoices).length, 0).toString(), label: 'Choices', color: '#8b5cf6' },
            { val: UNIVERSES.filter((u) => !u.locked).length.toString(), label: 'Universes', color: '#e060b8' },
          ].map((s) => (
            <div key={s.label} className="flex-1 rounded-xl p-3 flex flex-col gap-1" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <p className="font-bold text-xl" style={{ color: s.color, fontFamily: INTER }}>{s.val}</p>
              <p className="text-white/30 text-[11px] font-medium" style={{ fontFamily: INTER }}>{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* New Story CTA */}
        <motion.button
          onClick={handleNewStory}
          className="w-full h-[52px] rounded-xl flex items-center justify-center gap-2 text-white font-semibold text-[15px] mt-auto"
          style={{ background: 'linear-gradient(90deg, #c84b9e, #8b5cf6)', fontFamily: INTER }}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Start New Story <ArrowRight size={18} />
        </motion.button>
      </div>

      {/* ═══ DESKTOP ═══ */}
      <div className="hidden md:block min-h-screen">
        <div className="page-container mx-auto px-8 lg:px-16 py-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ background: 'linear-gradient(135deg, #c84b9e, #8b5cf6)' }}>
                {userName[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-accent text-xs font-semibold tracking-[2px] uppercase" style={{ fontFamily: INTER }}>Welcome back</p>
                <h1 className="text-white font-bold text-3xl" style={{ fontFamily: INTER }}>{userName}</h1>
              </div>
            </div>
            <button
              onClick={handleNewStory}
              className="flex items-center gap-2.5 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #c84b9e, #8b5cf6)', fontFamily: INTER }}
            >
              <Plus size={16} /> New Story
            </button>
          </div>

          <div className="flex gap-8">
            {/* Left column — main content */}
            <div className="flex-1 flex flex-col gap-8">
              {/* Continue Story */}
              {activePlaythrough && activeUniverse && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                  <p className="text-accent/50 text-[10px] font-semibold tracking-[2px] uppercase mb-3" style={{ fontFamily: INTER }}>Continue Story</p>
                  <button
                    onClick={handleResume}
                    className="w-full text-left rounded-2xl overflow-hidden group"
                    style={{ background: 'linear-gradient(160deg, #161220, #1a1428)', border: '1px solid rgba(200,75,158,0.1)', boxShadow: '0 4px 30px rgba(0,0,0,0.3)' }}
                  >
                    <div className="flex">
                      {Object.values(activePlaythrough.progress.sceneImages)[0] && (
                        <div className="w-[280px] h-[180px] overflow-hidden shrink-0">
                          <img src={Object.values(activePlaythrough.progress.sceneImages)[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                      )}
                      <div className="flex-1 px-6 py-5 flex flex-col justify-center gap-3">
                        <p className="text-accent text-[11px] font-semibold tracking-[1px]" style={{ fontFamily: INTER }}>{activeUniverse.title}</p>
                        <p className="text-white font-semibold text-xl" style={{ fontFamily: INTER }}>
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
                        <div className="flex items-center gap-2 text-white/30 text-sm" style={{ fontFamily: INTER }}>
                          Resume as {activePlaythrough.character.name} <ArrowRight size={14} />
                        </div>
                      </div>
                    </div>
                  </button>
                </motion.div>
              )}

              {/* Universes */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <p className="text-accent/50 text-[10px] font-semibold tracking-[2px] uppercase mb-3" style={{ fontFamily: INTER }}>Your Universes</p>
                <div className="grid grid-cols-4 gap-4">
                  {universeCards.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => { setSelectedUniverse(u.id); navigate('/characters') }}
                      className="rounded-xl overflow-hidden relative group h-[160px]"
                      style={{ background: '#1a1428' }}
                    >
                      <img src={u.image} alt={u.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,9,15,0.9) 0%, transparent 50%)' }} />
                      <div className="absolute bottom-3 left-3 right-3">
                        <span className="text-accent text-[9px] font-semibold tracking-[1px] uppercase" style={{ fontFamily: INTER }}>{u.genreTag}</span>
                        <p className="text-white/90 text-sm font-semibold mt-0.5" style={{ fontFamily: INTER }}>{u.title}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Stats */}
              <motion.div className="flex gap-4" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                {[
                  { val: characters.length.toString(), label: 'Characters', color: '#c84b9e' },
                  { val: Object.values(storyProgress).reduce((sum, p) => sum + Object.keys(p.branchChoices).length, 0).toString(), label: 'Choices Made', color: '#8b5cf6' },
                  { val: UNIVERSES.filter((u) => !u.locked).length.toString(), label: 'Universes', color: '#e060b8' },
                ].map((s) => (
                  <div key={s.label} className="flex-1 rounded-xl p-5 flex flex-col gap-2" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <p className="font-bold text-2xl" style={{ color: s.color, fontFamily: INTER }}>{s.val}</p>
                    <p className="text-white/30 text-sm font-medium" style={{ fontFamily: INTER }}>{s.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right sidebar — Characters */}
            <motion.div
              className="w-[260px] shrink-0"
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-accent/50 text-[10px] font-semibold tracking-[2px] uppercase" style={{ fontFamily: INTER }}>Your Characters</p>
                <button onClick={handleEditCharacters} className="text-accent text-xs font-medium flex items-center gap-1 hover:text-accent/80 transition-colors" style={{ fontFamily: INTER }}>
                  <Pencil size={10} /> Edit
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {characters.map((char) => (
                  <button
                    key={char.id}
                    onClick={() => { setActiveCharacter(char.id); navigate('/characters') }}
                    className="w-full flex items-center gap-3 rounded-xl p-3 text-left transition-all hover:brightness-110"
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
                      <p className="text-white/85 font-semibold text-sm" style={{ fontFamily: INTER }}>{char.name}</p>
                      <p className="text-white/30 text-xs" style={{ fontFamily: INTER }}>{char.gender === 'female' ? 'Female' : 'Male'} · {char.bio ? char.bio.slice(0, 30) : 'No bio'}</p>
                    </div>
                  </button>
                ))}

                {characters.length < 3 && (
                  <button
                    onClick={() => navigate('/create-character')}
                    className="w-full flex items-center justify-center gap-2 rounded-xl p-4 transition-all hover:brightness-125"
                    style={{ border: '1.5px dashed rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.01)' }}
                  >
                    <Plus size={16} className="text-white/20" />
                    <p className="text-white/25 text-sm font-medium" style={{ fontFamily: INTER }}>Create Character</p>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
