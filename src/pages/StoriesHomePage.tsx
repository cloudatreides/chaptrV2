import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, Camera, ChevronRight } from 'lucide-react'
import { AppSidebar } from '../components/AppSidebar'
import { useStore } from '../store/useStore'
import { UNIVERSES, GENRE_FILTERS, STORY_STEPS } from '../data/storyData'
import { getStoryData } from '../data/stories'

const SG = "'Space Grotesk', sans-serif"

const UNIVERSE_PLAYERS: Record<string, number> = {
  'seoul-transfer': 12400, 'sakura-academy': 8700, 'midnight-paris': 7300,
  'campus-rivals': 6100, 'hollow-manor': 5200, 'crimson-depths': 4600,
  'the-whisper-game': 3900, 'the-last-signal': 3800, 'neon-district': 3200,
  'the-inheritance': 2800, 'sky-pirates': 2500, 'edge-of-atlas': 2100,
  'the-drift': 1900, 'phantom-protocol': 1600, 'fae-court': 1400,
}

function formatPlayerCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`
  return String(n)
}

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

export function StoriesHomePage() {
  const navigate = useNavigate()
  const characters = useStore((s) => s.characters)
  const storyProgress = useStore((s) => s.storyProgress)
  const setActiveCharacter = useStore((s) => s.setActiveCharacter)
  const setSelectedUniverse = useStore((s) => s.setSelectedUniverse)

  const [genreFilter, setGenreFilter] = useState('ALL')

  const hasCharacters = characters.length > 0
  const activeStories = UNIVERSES.filter((u) => !u.locked && (genreFilter === 'ALL' || u.genre === genreFilter))
  const comingSoonStories = UNIVERSES.filter((u) => u.locked)

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

  return (
    <div className="flex h-dvh" style={{ background: '#0A0810' }}>
      <AppSidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="page-container px-5 md:px-[60px] py-8 md:py-12">
          {/* Header */}
          <div className="mb-8">
            <h1
              className="text-3xl md:text-4xl font-bold text-white mb-2"
              style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.02em' }}
            >
              Story Mode
            </h1>
            <p className="text-white/50 text-sm" style={{ fontFamily: SG }}>
              Star in 20+ interactive stories. Make choices, shape the plot, see yourself in every scene.
            </p>
          </div>

          {/* Upload selfie CTA */}
          {!hasCharacters && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => navigate('/create-character')}
              className="cursor-pointer w-full mb-6 flex items-center gap-4 rounded-2xl p-4 text-left"
              style={{ background: 'rgba(200,75,158,0.06)', border: '1px solid rgba(200,75,158,0.15)' }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(200,75,158,0.12)' }}>
                <Camera size={20} style={{ color: '#c84b9e' }} />
              </div>
              <div className="flex-1">
                <p className="text-white text-[15px] font-semibold" style={{ fontFamily: SG }}>Upload selfie to star in stories</p>
                <p className="text-[13px]" style={{ color: '#6B6275', fontFamily: SG }}>Your face appears in every scene</p>
              </div>
              <ChevronRight size={18} className="text-white/20 shrink-0" />
            </motion.button>
          )}

          {/* Continue reading */}
          {activePlaythrough && activeUniverse && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleResume}
              className="w-full mb-8 rounded-2xl overflow-hidden text-left cursor-pointer"
              style={{ background: 'linear-gradient(135deg, rgba(200,75,158,0.12), rgba(124,58,237,0.08))', border: '1px solid rgba(200,75,158,0.18)' }}
            >
              <div className="flex items-center gap-4 p-5">
                {firstSceneImage && (
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                    <img src={firstSceneImage} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white/40 text-[10px] font-semibold tracking-[1.5px] uppercase mb-1" style={{ fontFamily: SG }}>
                    Continue reading
                  </p>
                  <p className="text-white text-lg font-semibold" style={{ fontFamily: "'Syne', sans-serif" }}>
                    {activeUniverse.title}
                  </p>
                  <p className="text-white/50 text-sm mt-1" style={{ fontFamily: SG }}>
                    {getChapterLabel(activePlaythrough.progress.currentStepIndex, getStepCount(activePlaythrough.universeId))} · Playing as {activePlaythrough.character.name}
                  </p>
                </div>
                <ChevronRight size={18} className="text-white/20 shrink-0" />
              </div>
            </motion.button>
          )}

          {/* Genre filters */}
          <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-none">
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

          {/* Active story grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {activeStories.map((u, i) => (
              <motion.button
                key={u.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => navigate(`/universes/${u.id}`)}
                className="cursor-pointer rounded-xl overflow-hidden group text-left"
                style={{ background: '#13101c', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img src={u.image} alt={u.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,8,16,0.95) 0%, rgba(10,8,16,0.5) 40%, transparent 70%)' }} />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <span className="inline-block text-[9px] font-bold tracking-[1px] uppercase px-1.5 py-0.5 rounded" style={{ background: 'rgba(200,75,158,0.2)', color: '#e88bc4', fontFamily: SG }}>{u.genreTag}</span>
                    <p className="text-white text-sm font-semibold mt-1" style={{ fontFamily: SG }}>{u.title}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Users size={11} className="text-white/40" />
                      <span className="text-white/40 text-[11px]" style={{ fontFamily: SG }}>{formatPlayerCount(UNIVERSE_PLAYERS[u.id] ?? 0)} played</span>
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Coming Soon section */}
          {comingSoonStories.length > 0 && (
            <div className="mt-10">
              <h2 className="text-white/40 text-xs font-semibold tracking-[2px] uppercase mb-4" style={{ fontFamily: SG }}>Coming Soon</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {comingSoonStories.map((u, i) => (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="rounded-xl overflow-hidden cursor-default"
                    style={{ background: '#13101c', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <img src={u.image} alt={u.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,8,16,0.95) 0%, rgba(10,8,16,0.5) 40%, transparent 70%)' }} />
                      <div className="absolute inset-0 flex items-center justify-center" style={{ backdropFilter: 'blur(2px)', background: 'rgba(10,8,16,0.3)' }}>
                        <span className="text-[11px] font-bold tracking-[1.5px] uppercase px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontFamily: SG }}>Coming Soon</span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <span className="inline-block text-[9px] font-bold tracking-[1px] uppercase px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)', fontFamily: SG }}>{u.genreTag}</span>
                        <p className="text-white/50 text-sm font-semibold mt-1" style={{ fontFamily: SG }}>{u.title}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Story count */}
          <div className="mt-6 flex items-center gap-2 text-white/30">
            <span className="text-xs" style={{ fontFamily: SG }}>
              {activeStories.length} stor{activeStories.length !== 1 ? 'ies' : 'y'} available{genreFilter !== 'ALL' ? ` in ${genreFilter[0] + genreFilter.slice(1).toLowerCase()}` : ''} · {comingSoonStories.length} coming soon
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
