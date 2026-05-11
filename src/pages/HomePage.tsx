import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Pencil, MessageCircle, LogOut, Compass, BookOpen, ChevronRight, Camera, Sparkles, Plus, Map, X, Star, Info } from 'lucide-react'
import { useStore } from '../store/useStore'
import { UNIVERSES } from '../data/storyData'
import { useAuth } from '../contexts/AuthContext'
import { STORY_STEPS } from '../data/storyData'
import { getStoryData } from '../data/stories'
import { getEligibleAmbientPings } from '../data/ambientPings'
import { getCharacter, CHARACTERS } from '../data/characters'
import { AppSidebar } from '../components/AppSidebar'
import { SelfieImg } from '../components/SelfieImg'
import { AmbientPingModal } from '../components/AmbientPingModal'
import { SyncIndicator } from '../components/SyncIndicator'
import { DESTINATIONS, getDestination } from '../data/travel/destinations'
import { getTravelCompanion, TRAVEL_COMPANIONS, type TravelCompanion } from '../data/travel/companions'
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

// ─── Twin Hero (has character) ───

function TwinHero({ character, allCharacters, onEdit, onSwitch, onCreateNew, onSetDefault }: {
  character: { id: string; name: string; selfieUrl: string | null; bio: string | null }
  allCharacters: { id: string; name: string; selfieUrl: string | null }[]
  onEdit: () => void
  onSwitch: (id: string) => void
  onCreateNew: () => void
  onSetDefault: (id: string) => void
}) {
  const isDefault = allCharacters[0]?.id === character.id
  const canSetDefault = allCharacters.length > 1 && !isDefault
  return (
    <div className="flex flex-col gap-3">
      <div className="relative rounded-2xl overflow-hidden flex flex-col md:flex-row" style={{ border: '1px solid rgba(200,75,158,0.12)', background: '#13101c' }}>
        {/* Selfie */}
        <div className="relative w-full md:w-[280px] md:h-[300px] overflow-hidden" style={{ flexShrink: 0, background: 'linear-gradient(135deg, #1a1028, #2d1f3d)' }}>
          {character.selfieUrl ? (
            <SelfieImg
              src={character.selfieUrl}
              alt={character.name}
              className="w-full md:h-full object-contain md:object-cover object-center"
              fallback={
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-5xl font-bold" style={{ color: 'rgba(200,75,158,0.25)', fontFamily: SG }}>{character.name[0]}</span>
                </div>
              }
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Sparkles size={40} className="text-white/10" />
            </div>
          )}
          <div className="absolute inset-0 md:hidden" style={{ background: 'linear-gradient(to top, #13101c 0%, transparent 40%)' }} />
          <div className="hidden md:block absolute inset-0" style={{ background: 'linear-gradient(to left, #13101c 0%, transparent 40%)' }} />
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-center px-5 pb-5 -mt-8 md:mt-0 md:px-8 md:py-8 relative z-10">
          <p className="text-[10px] md:text-[11px] font-semibold tracking-[2px] uppercase mb-2" style={{ color: '#c84b9e', fontFamily: SG }}>YOUR CHARACTER</p>
          <h2 className="text-white text-2xl md:text-3xl font-bold mb-2" style={{ fontFamily: SG }}>{character.name}</h2>
          {character.bio && (
            <p className="text-white/40 text-[13px] md:text-sm leading-relaxed max-w-[420px] mb-4" style={{ fontFamily: SG }}>
              {character.bio}
            </p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onEdit}
              className="cursor-pointer w-fit flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors hover:bg-white/5"
              style={{ color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.08)', fontFamily: SG }}
            >
              <Pencil size={12} /> Edit character
            </button>
            {canSetDefault && (
              <button
                onClick={() => onSetDefault(character.id)}
                className="cursor-pointer w-fit flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors hover:bg-[rgba(200,75,158,0.12)]"
                style={{ color: '#c84b9e', border: '1px solid rgba(200,75,158,0.25)', background: 'rgba(200,75,158,0.06)', fontFamily: SG }}
              >
                <Star size={12} /> Set as default
              </button>
            )}
            {isDefault && allCharacters.length > 1 && (
              <span
                className="w-fit flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium"
                style={{ color: 'rgba(200,75,158,0.7)', fontFamily: SG }}
              >
                <Star size={12} fill="currentColor" /> Default character
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Twin switcher — only show if multiple twins or room to create */}
      {(allCharacters.length > 1 || allCharacters.length < 3) && (
        <div className="flex items-center gap-2 px-1">
          {allCharacters.map((c) => (
            <button
              key={c.id}
              onClick={() => onSwitch(c.id)}
              className="cursor-pointer shrink-0 rounded-full overflow-hidden transition-all"
              style={{
                width: c.id === character.id ? 40 : 32,
                height: c.id === character.id ? 40 : 32,
                border: c.id === character.id ? '2px solid #c84b9e' : '2px solid rgba(255,255,255,0.1)',
                opacity: c.id === character.id ? 1 : 0.5,
              }}
            >
              {c.selfieUrl ? (
                <SelfieImg
                  src={c.selfieUrl}
                  alt={c.name}
                  className="w-full h-full object-cover"
                  fallback={
                    <div className="w-full h-full flex items-center justify-center text-xs font-semibold" style={{ background: 'rgba(200,75,158,0.12)', color: '#c84b9e' }}>
                      {c.name[0]}
                    </div>
                  }
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-semibold" style={{ background: 'rgba(200,75,158,0.12)', color: '#c84b9e' }}>
                  {c.name[0]}
                </div>
              )}
            </button>
          ))}
          {allCharacters.length < 3 && (
            <button
              onClick={onCreateNew}
              className="cursor-pointer w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/5"
              style={{ border: '1px dashed rgba(255,255,255,0.12)' }}
            >
              <Plus size={14} className="text-white/25" />
            </button>
          )}
          {allCharacters.length > 1 && (
            <span className="text-[11px] ml-1" style={{ color: 'rgba(255,255,255,0.2)', fontFamily: SG }}>
              Switch character
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Upload CTA Hero (no character) ───

function UploadHero({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="cursor-pointer w-full rounded-2xl overflow-hidden text-left"
      style={{ border: '1px solid rgba(200,75,158,0.15)' }}
    >
      <div className="relative min-h-[260px] md:min-h-[280px] py-8 md:py-10 overflow-hidden flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(200,75,158,0.06), rgba(124,58,237,0.04))' }}>
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03]">
          <Camera size={200} className="text-white" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-4 text-center px-6">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center" style={{ background: 'rgba(200,75,158,0.1)', border: '2px dashed rgba(200,75,158,0.25)' }}>
            <Camera size={32} style={{ color: '#c84b9e' }} />
          </div>
          <div>
            <p className="text-white text-lg md:text-xl font-bold mb-1" style={{ fontFamily: SG }}>Upload a selfie to begin</p>
            <p className="text-white/35 text-sm" style={{ fontFamily: SG }}>Your face appears in every story and trip scene</p>
          </div>
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold" style={{ background: '#c84b9e', color: '#fff', fontFamily: SG }}>
            <Camera size={15} /> Upload selfie
          </div>
        </div>
      </div>
    </motion.button>
  )
}

// ─── Continue Card ───

function ContinueCard({ type, title, subtitle, meta, image, onClick }: {
  type: 'travel' | 'story'
  title: string
  subtitle: string
  meta: string
  image?: string | null
  onClick: () => void
}) {
  const color = type === 'travel' ? '#A78BFA' : '#c84b9e'
  return (
    <button
      onClick={onClick}
      className="cursor-pointer w-full flex items-center gap-3.5 rounded-xl p-3.5 text-left transition-colors hover:bg-white/[0.02]"
      style={{ background: '#13101c', border: `1px solid ${type === 'travel' ? 'rgba(124,58,237,0.12)' : 'rgba(200,75,158,0.12)'}` }}
    >
      {image && (
        <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden shrink-0" style={{ background: 'linear-gradient(135deg, #1a1028, #2d1f3d)' }}>
          <SelfieImg
            src={image}
            alt=""
            className="w-full h-full object-cover"
            fallback={
              <div className="w-full h-full flex items-center justify-center">
                {type === 'travel' ? <Compass size={18} className="text-white/15" /> : <BookOpen size={18} className="text-white/15" />}
              </div>
            }
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold tracking-[1px] mb-0.5" style={{ color, fontFamily: SG }}>{meta}</p>
        <p className="text-white text-sm font-semibold" style={{ fontFamily: SG }}>{title}</p>
        <p className="text-white/40 text-xs truncate" style={{ fontFamily: SG }}>{subtitle}</p>
      </div>
      <ChevronRight size={16} className="text-white/20 shrink-0" />
    </button>
  )
}

// ─── Companion Picker ───

type GenderFilter = 'all' | 'male' | 'female'

const GENDER_FILTERS: { id: GenderFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
]

// Display order for the picker. New characters surface first; the original
// four (Kai/Sora/Jiwon/Yuna) sit at the bottom of the grid.
const COMPANION_DISPLAY_ORDER = [
  'mina', 'hana', 'junseo', 'hyun', 'riko', 'junho', 'beomseok', 'maya',
  'kai', 'sora', 'jiwon', 'yuna',
]
const orderIndex = (id: string) => {
  const i = COMPANION_DISPLAY_ORDER.indexOf(id)
  return i === -1 ? COMPANION_DISPLAY_ORDER.length : i
}

function CompanionPicker({ onSelect }: { onSelect: (c: TravelCompanion) => void }) {
  const [filter, setFilter] = useState<GenderFilter>('all')
  const [tipOpen, setTipOpen] = useState(false)
  const filtered = (filter === 'all'
    ? TRAVEL_COMPANIONS
    : TRAVEL_COMPANIONS.filter((c) => c.character.gender === filter)
  ).slice().sort((a, b) => orderIndex(a.characterId) - orderIndex(b.characterId))

  // Close tooltip when clicking outside
  useEffect(() => {
    if (!tipOpen) return
    const close = () => setTipOpen(false)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [tipOpen])

  return (
    <div>
      <div className="flex items-center justify-between mb-3 gap-3">
        <div className="relative flex items-center gap-1.5">
          <p className="text-[10px] md:text-[11px] font-semibold tracking-[2px] uppercase" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: SG }}>
            Travel companions
          </p>
          <button
            onClick={(e) => { e.stopPropagation(); setTipOpen((o) => !o) }}
            aria-label="What are travel companions?"
            className="cursor-pointer flex items-center justify-center w-4 h-4 rounded-full transition-colors hover:bg-white/5"
          >
            <Info size={11} className="text-white/30 hover:text-white/60 transition-colors" />
          </button>
          <AnimatePresence>
            {tipOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                onClick={(e) => e.stopPropagation()}
                className="absolute left-0 top-full mt-2 z-30 w-[260px] rounded-xl p-3 shadow-xl"
                style={{
                  background: '#1A1726',
                  border: '1px solid rgba(124,58,237,0.25)',
                  fontFamily: SG,
                }}
              >
                <p className="text-white/80 text-[12px] leading-snug">
                  Pick who you want to travel with. Each companion plans the trip differently — their voice, their picks, their style. Tap one to see how they roll.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex gap-1.5">
          {GENDER_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className="cursor-pointer text-[10px] md:text-[11px] font-semibold px-3 py-1 rounded-full transition-colors"
              style={{
                fontFamily: SG,
                background: filter === f.id ? 'rgba(124,58,237,0.15)' : 'transparent',
                color: filter === f.id ? '#A78BFA' : 'rgba(255,255,255,0.35)',
                border: `1px solid ${filter === f.id ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2 snap-x snap-mandatory md:grid md:grid-cols-4 md:overflow-visible md:pb-0">
        {filtered.map((c) => (
          <button
            key={c.characterId}
            onClick={() => onSelect(c)}
            className="cursor-pointer shrink-0 w-[140px] md:w-auto snap-start rounded-xl overflow-hidden text-left group transition-transform hover:scale-[1.02]"
            style={{ background: '#13101c', border: '1px solid rgba(124,58,237,0.15)' }}
          >
            <div className="relative aspect-[3/4] overflow-hidden">
              {c.character.staticPortrait ? (
                <img
                  src={c.character.staticPortrait}
                  alt={c.character.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl" style={{ background: 'rgba(124,58,237,0.1)' }}>
                  {c.character.avatar}
                </div>
              )}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(19,16,28,0.95) 0%, rgba(19,16,28,0.4) 50%, transparent 80%)' }} />
              <div className="absolute bottom-0 left-0 right-0 p-2.5">
                <p className="text-white text-sm font-bold leading-tight" style={{ fontFamily: SG }}>{c.character.name}</p>
                <p className="text-white/55 text-[10px] mt-0.5 line-clamp-2" style={{ fontFamily: SG }}>{c.personalityTraits[0]}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function CompanionDetailModal({ companion, onClose, onTravelWith }: {
  companion: TravelCompanion
  onClose: () => void
  onTravelWith: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-5"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl"
        style={{ background: '#1A1726', border: '1px solid rgba(124,58,237,0.2)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          {companion.character.staticPortrait ? (
            <img
              src={companion.character.staticPortrait}
              alt={companion.character.name}
              className="w-full aspect-[4/3] object-cover"
            />
          ) : (
            <div className="w-full aspect-[4/3] flex items-center justify-center text-6xl" style={{ background: 'rgba(124,58,237,0.1)' }}>
              {companion.character.avatar}
            </div>
          )}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #1A1726 0%, transparent 60%)' }} />
          <button
            onClick={onClose}
            className="cursor-pointer absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          >
            <X size={16} className="text-white/70" />
          </button>
          <div className="absolute bottom-3 left-4 right-4">
            <h3 className="text-white text-2xl font-bold" style={{ fontFamily: SG }}>{companion.character.name}</h3>
          </div>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <p className="text-white/70 text-sm leading-relaxed" style={{ fontFamily: SG }}>{companion.bio}</p>

          <div>
            <p className="text-[10px] font-semibold tracking-[1.5px] uppercase mb-2" style={{ color: '#A78BFA', fontFamily: SG }}>Personality</p>
            <ul className="space-y-1.5">
              {companion.personalityTraits.slice(0, 3).map((t, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[10px] mt-1" style={{ color: '#7C3AED' }}>•</span>
                  <span className="text-white/60 text-[12px] leading-snug" style={{ fontFamily: SG }}>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-semibold tracking-[1.5px] uppercase mb-2" style={{ color: '#A78BFA', fontFamily: SG }}>Travel style</p>
            <ul className="space-y-1.5">
              {companion.travelStyle.slice(0, 3).map((t, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[10px] mt-1" style={{ color: '#7C3AED' }}>•</span>
                  <span className="text-white/60 text-[12px] leading-snug" style={{ fontFamily: SG }}>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={onTravelWith}
            className="cursor-pointer w-full h-11 rounded-xl flex items-center justify-center gap-2 text-white font-semibold text-sm mt-1"
            style={{ background: 'linear-gradient(90deg, #7C3AED, #A78BFA)', fontFamily: SG }}
          >
            Travel with me <ArrowRight size={16} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Ping Cards ───

function PingCards({ pings, onOpen }: { pings: any[]; onOpen: (ping: any) => void }) {
  if (pings.length === 0) return null
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <MessageCircle size={12} className="text-accent/50" />
        <p className="text-[10px] font-semibold tracking-[2px] uppercase" style={{ color: 'rgba(200,75,158,0.4)', fontFamily: SG }}>Messages</p>
        <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ background: '#c84b9e' }}>{pings.length}</span>
      </div>
      <div className="flex flex-col gap-2">
        {pings.map((ping) => {
          const charData = getCharacter(ping.characterId, ping.universeId) ?? CHARACTERS[ping.characterId]
          return (
            <button
              key={ping.id}
              onClick={() => onOpen(ping)}
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
    </div>
  )
}

// ─── Journey Stats ───

function JourneyStats({ stats }: { stats: { tripsCompleted: number; storiesStarted: number; momentsCollected: number } }) {
  const [modal, setModal] = useState<'trips' | 'stories' | null>(null)
  const navigate = useNavigate()
  const travelTrips = useStore((s) => s.travelTrips)
  const storyProgress = useStore((s) => s.storyProgress)
  const setActiveTripId = useStore((s) => s.setActiveTripId)

  const hasAny = stats.tripsCompleted > 0 || stats.storiesStarted > 0
  if (!hasAny) return null

  const completedTrips = Object.entries(travelTrips)
    .filter(([, t]) => t.phase === 'complete' || (t.extensions ?? 0) > 0)
    .sort(([, a], [, b]) => b.startedAt - a.startedAt)

  const activeStories = Object.entries(storyProgress)
    .filter(([, p]) => p.currentStepIndex > 0)
    .map(([key, p]) => {
      const universeId = key.split(':')[1]
      const universe = UNIVERSES.find((u) => u.id === universeId)
      const total = getStepCount(universeId)
      return { key, universeId, progress: p, universe, total }
    })
    .filter((s) => s.universe)

  return (
    <>
      <div>
        <p className="text-[10px] md:text-[11px] font-semibold tracking-[2px] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: SG }}>YOUR JOURNEY</p>

        {/* Single banner with all 3 stats */}
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, #2D1B69 0%, #1A1628 40%, #1B3D3A 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full opacity-[0.12] blur-3xl" style={{ background: '#B794F6' }} />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full opacity-[0.12] blur-3xl" style={{ background: '#5EEAD4' }} />

          <div className="relative z-10 flex items-stretch">
            {/* Trips */}
            <button
              onClick={() => stats.tripsCompleted > 0 ? setModal('trips') : navigate('/travel')}
              className="flex-1 flex flex-col items-center gap-1.5 py-5 px-3 cursor-pointer hover:bg-white/[0.03] transition-colors"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Map size={13} style={{ color: '#B794F6' }} />
                <span className="text-white/50 text-[11px] font-bold" style={{ fontFamily: SG }}>Trips</span>
              </div>
              <span className="text-white text-[28px] md:text-[32px] font-extrabold leading-none" style={{ fontFamily: SG }}>{stats.tripsCompleted}</span>
              <span className="text-white/30 text-[10px] font-medium" style={{ fontFamily: SG }}>completed</span>
            </button>

            {/* Divider */}
            <div className="w-px self-stretch my-4" style={{ background: 'rgba(255,255,255,0.08)' }} />

            {/* Stories */}
            <button
              onClick={() => stats.storiesStarted > 0 ? setModal('stories') : navigate('/stories')}
              className="flex-1 flex flex-col items-center gap-1.5 py-5 px-3 cursor-pointer hover:bg-white/[0.03] transition-colors"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <BookOpen size={13} style={{ color: '#E879A8' }} />
                <span className="text-white/50 text-[11px] font-bold" style={{ fontFamily: SG }}>Stories</span>
              </div>
              <span className="text-white text-[28px] md:text-[32px] font-extrabold leading-none" style={{ fontFamily: SG }}>{stats.storiesStarted}</span>
              <span className="text-white/30 text-[10px] font-medium" style={{ fontFamily: SG }}>in progress</span>
            </button>

            {/* Divider */}
            <div className="w-px self-stretch my-4" style={{ background: 'rgba(255,255,255,0.08)' }} />

            {/* Moments */}
            <button
              onClick={() => navigate('/album')}
              className="flex-1 flex flex-col items-center gap-1.5 py-5 px-3 cursor-pointer hover:bg-white/[0.03] transition-colors"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Camera size={13} style={{ color: '#5EEAD4' }} />
                <span className="text-white/50 text-[11px] font-bold" style={{ fontFamily: SG }}>Moments</span>
              </div>
              <span className="text-white text-[28px] md:text-[32px] font-extrabold leading-none" style={{ fontFamily: SG }}>{stats.momentsCollected}</span>
              <span className="text-white/30 text-[10px] font-medium" style={{ fontFamily: SG }}>captured</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-5"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="w-full max-w-md max-h-[70vh] overflow-y-auto rounded-2xl p-5"
              style={{ background: '#1A1726', border: '1px solid rgba(255,255,255,0.08)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white text-lg font-bold" style={{ fontFamily: SG }}>
                  {modal === 'trips' ? 'Completed Trips' : 'Your Stories'}
                </h3>
                <button onClick={() => setModal(null)} className="text-white/40 hover:text-white/70 cursor-pointer transition-colors">
                  <X size={18} />
                </button>
              </div>

              {modal === 'trips' && (
                <div className="flex flex-col gap-3">
                  {completedTrips.map(([tripId, trip], i) => {
                    const dest = getDestination(trip.destinationId)
                    const comp = getTravelCompanion(trip.companionId)
                    const compName = trip.companionRemix?.name ?? comp?.character.name ?? 'Companion'
                    const compPortrait = trip.companionRemix?.imageUrl ?? comp?.character.staticPortrait
                    const totalMessages = trip.planningChatHistory.length +
                      Object.values(trip.dayChatHistories).reduce((sum, msgs) => sum + msgs.length, 0)
                    const daysExplored = trip.itinerary.days.filter((d) => d.completed).length
                    const extensions = trip.extensions ?? 0
                    const isExtended = extensions > 0 && trip.phase !== 'complete'
                    return (
                      <div key={i} className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="relative h-24">
                          {dest && <img src={dest.heroImage} alt="" className="w-full h-full object-cover" style={{ opacity: 0.5 }} />}
                          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #1A1726 0%, transparent 100%)' }} />
                          {isExtended && (
                            <div className="absolute top-2.5 left-2.5 z-10">
                              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(124,58,237,0.35)', backdropFilter: 'blur(8px)', color: '#C4B5FD', border: '1px solid rgba(124,58,237,0.4)', fontFamily: SG }}>
                                Extended +{extensions * 2} Days
                              </span>
                            </div>
                          )}
                          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                            <div>
                              <p className="text-white font-bold text-sm" style={{ fontFamily: SG }}>{dest?.countryEmoji} {dest?.city ?? trip.destinationId}</p>
                              <p className="text-white/40 text-[11px]" style={{ fontFamily: SG }}>{daysExplored} days · {totalMessages} messages</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {compPortrait && <SelfieImg src={compPortrait} alt="" className="w-7 h-7 rounded-full object-cover" style={{ border: '1.5px solid rgba(167,139,250,0.4)' }} fallback={<div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px]" style={{ background: '#2D2538', border: '1.5px solid rgba(167,139,250,0.4)' }}>{compName[0]}</div>} />}
                              <span className="text-white/50 text-xs" style={{ fontFamily: SG }}>{compName}</span>
                            </div>
                          </div>
                        </div>
                        <div className="px-3 py-2.5">
                          {isExtended ? (
                            <button
                              onClick={() => { setActiveTripId(tripId); navigate('/travel/trip') }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition-colors hover:bg-[#7C3AED22]"
                              style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}
                            >
                              <Compass size={12} className="text-[#A78BFA]" />
                              <span className="text-[#A78BFA] text-xs font-semibold" style={{ fontFamily: SG }}>Continue exploring</span>
                            </button>
                          ) : extensions < 2 ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => { setActiveTripId(tripId); navigate('/travel/trip', { state: { extend: true } }) }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition-colors hover:bg-[#7C3AED22]"
                                style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}
                              >
                                <Plus size={12} className="text-[#A78BFA]" />
                                <span className="text-[#A78BFA] text-xs font-semibold" style={{ fontFamily: SG }}>Stay 2 more days</span>
                              </button>
                              <span className="text-white/40 text-[11px] line-through" style={{ fontFamily: SG }}>$2.99</span>
                              <span className="text-emerald-400 text-[11px] font-bold" style={{ fontFamily: SG }}>FREE</span>
                            </div>
                          ) : (
                            <p className="text-white/25 text-[11px] italic" style={{ fontFamily: SG }}>Come back anytime, {compName} will remember you</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  {completedTrips.length === 0 && (
                    <p className="text-white/30 text-sm text-center py-6" style={{ fontFamily: SG }}>No completed trips yet</p>
                  )}
                </div>
              )}

              {modal === 'stories' && (
                <div className="flex flex-col gap-3">
                  {activeStories.map((s) => {
                    const pct = Math.round((s.progress.currentStepIndex / s.total) * 100)
                    return (
                      <div key={s.key} className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="relative h-24">
                          {s.universe?.image && <img src={s.universe.image} alt="" className="w-full h-full object-cover" style={{ opacity: 0.4 }} />}
                          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #1A1726 0%, transparent 100%)' }} />
                          <div className="absolute bottom-3 left-3 right-3">
                            <p className="text-white font-bold text-sm mb-1" style={{ fontFamily: SG }}>{s.universe?.title}</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(200,75,158,0.15)' }}>
                                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #c84b9e, #e879a8)' }} />
                              </div>
                              <span className="text-white/40 text-[11px] shrink-0" style={{ fontFamily: SG }}>{pct === 100 ? 'Complete' : `${pct}%`}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {activeStories.length === 0 && (
                    <p className="text-white/30 text-sm text-center py-6" style={{ fontFamily: SG }}>No stories started yet</p>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ─── Main HomePage ───

export function HomePage() {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const characters = useStore((s) => s.characters)
  const storyProgress = useStore((s) => s.storyProgress)
  const setActiveCharacter = useStore((s) => s.setActiveCharacter)
  const setDefaultCharacter = useStore((s) => s.setDefaultCharacter)
  const setSelectedUniverse = useStore((s) => s.setSelectedUniverse)
  const globalAffinities = useStore((s) => s.globalAffinities)
  const ambientPings = useStore((s) => s.ambientPings)
  const lastSessionTimestamp = useStore((s) => s.lastSessionTimestamp)
  const addAmbientPing = useStore((s) => s.addAmbientPing)
  const updateLastSessionTimestamp = useStore((s) => s.updateLastSessionTimestamp)
  const dismissAmbientPing = useStore((s) => s.dismissAmbientPing)
  const activeCharacterId = useStore((s) => s.activeCharacterId)
  const travelTrips = useStore((s) => s.travelTrips)
  const setActiveTripId = useStore((s) => s.setActiveTripId)


  const [selectedCompanion, setSelectedCompanion] = useState<TravelCompanion | null>(null)
  const [activePingModal, setActivePingModal] = useState<AmbientPingDef | null>(null)

  const hasCharacters = characters.length > 0
  const activeCharacter = characters.find((c) => c.id === activeCharacterId) ?? characters[0]
  // Treat ephemeral URLs (eg. Together AI shrt URLs that already expired) as
  // "no selfie" — they 404 on load and would otherwise mask the upload-CTA.
  const hasUsableSelfie = (c: typeof activeCharacter | undefined) =>
    !!c?.selfieUrl && !c.selfieUrl.includes('api.together.ai/shrt') && !c.selfieUrl.includes('api.together.xyz/shrt') && !c.selfieUrl.includes('together.ai/imgproxy')
  // Prefer to render a twin that actually has a selfie. If the active twin
  // doesn't have one but a sibling does, show the sibling so we never fall
  // back to the "Upload a selfie" hero when twins already exist.
  const characterToShow = hasUsableSelfie(activeCharacter)
    ? activeCharacter
    : (characters.find(hasUsableSelfie) ?? activeCharacter)

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

  // ─── Active playthrough (story) ───
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

  // ─── Active trip (travel) — most recently started ───
  const activeTrip = activeCharacterId
    ? Object.entries(travelTrips)
        .filter(([key, trip]) => key.startsWith(`${activeCharacterId}:`) && trip.phase !== 'complete')
        .sort(([, a], [, b]) => b.startedAt - a.startedAt)[0] ?? null
    : null

  const handleResume = () => {
    if (!activePlaythrough) return
    setActiveCharacter(activePlaythrough.character.id)
    setSelectedUniverse(activePlaythrough.universeId)
    navigate('/story')
  }

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

  // ─── Journey stats ───
  const storyMoments = useStore((s) => s.storyMoments)
  const tripsCompleted = Object.values(travelTrips).filter((t) => t.phase === 'complete').length
  const storiesStarted = Object.values(storyProgress).filter((p) => p.currentStepIndex > 0).length
  const momentsCollected = storyMoments.length
  const journeyStats = { tripsCompleted, storiesStarted, momentsCollected }

  // ─── Continue cards ───
  const continueCards = []
  if (activeTrip) {
    const dest = DESTINATIONS.find((d) => d.id === activeTrip[1].destinationId)
    continueCards.push(
      <ContinueCard
        key="travel"
        type="travel"
        title={dest?.city ?? 'Trip'}
        subtitle={activeTrip[1].phase === 'planning' ? 'Still planning...' : 'Exploring'}
        meta={`TRAVEL · DAY ${activeTrip[1].currentDay}`}
        image={dest?.heroImage}
        onClick={() => { setActiveTripId(activeTrip[0]); navigate('/travel/trip') }}
      />
    )
  }
  if (activePlaythrough && activeUniverse) {
    continueCards.push(
      <ContinueCard
        key="story"
        type="story"
        title={activeUniverse.title}
        subtitle={`Playing as ${activePlaythrough.character.name}`}
        meta={`STORY · ${getChapterLabel(activePlaythrough.progress.currentStepIndex, getStepCount(activePlaythrough.universeId)).toUpperCase()}`}
        image={firstSceneImage}
        onClick={handleResume}
      />
    )
  }

  return (
    <div className="bg-bg min-h-screen min-h-dvh">
      {/* ═══ MOBILE ═══ */}
      <div className="md:hidden">
        <div className="overflow-y-auto px-6 pt-6 flex flex-col gap-6" style={{ paddingBottom: 'calc(96px + env(safe-area-inset-bottom))' }}>
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-white font-bold text-[22px]" style={{ fontFamily: SG }}>chaptr</h1>
            <div className="flex items-center gap-2 relative">
              <SyncIndicator />
              <button onClick={signOut} className="cursor-pointer w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/5"><LogOut size={16} className="text-white/30" /></button>
            </div>
          </div>

          {/* Twin Hero or Upload CTA */}
          {hasCharacters && hasUsableSelfie(characterToShow) ? (
            <TwinHero character={characterToShow!} allCharacters={characters} onEdit={() => navigate('/characters')} onSwitch={(id) => setActiveCharacter(id)} onCreateNew={() => navigate('/create-character')} onSetDefault={(id) => setDefaultCharacter(id)} />
          ) : (
            <UploadHero onClick={() => navigate(hasCharacters && activeCharacter ? `/create-character?edit=${activeCharacter.id}` : '/create-character')} />
          )}

          {/* Journey stats */}
          {hasCharacters && <JourneyStats stats={journeyStats} />}

          {/* Continue cards */}
          {continueCards.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-semibold tracking-[2px] uppercase" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: SG }}>CONTINUE</p>
              {continueCards}
            </div>
          )}

          {/* Messages */}
          {hasCharacters && <PingCards pings={unreadPings} onOpen={handleOpenPing} />}

          {/* Companions */}
          <CompanionPicker onSelect={setSelectedCompanion} />
        </div>

      </div>

      {/* ═══ DESKTOP ═══ */}
      <div className="hidden md:flex h-dvh overflow-hidden">
        <AppSidebar />
        <div className="flex-1 min-h-0 overflow-y-auto px-8 lg:px-12 py-10">
          <div className="page-container">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                {hasCharacters && <p className="text-[12px] mb-1" style={{ color: '#6B6275', fontFamily: SG }}>Welcome back 👋</p>}
                <h1 className="text-white font-bold text-[36px]" style={{ fontFamily: SG }}>
                  {hasCharacters ? 'Your world awaits' : 'Create your character'}
                </h1>
              </div>
              <div className="flex items-center gap-3 relative">
                <SyncIndicator />
                <button onClick={signOut} className="cursor-pointer w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5"><LogOut size={16} className="text-white/30" /></button>
              </div>
            </div>

            {/* Twin Hero or Upload CTA */}
            <div className="mb-6">
              {hasCharacters && hasUsableSelfie(characterToShow) ? (
                <TwinHero character={characterToShow!} allCharacters={characters} onEdit={() => navigate('/characters')} onSwitch={(id) => setActiveCharacter(id)} onCreateNew={() => navigate('/create-character')} onSetDefault={(id) => setDefaultCharacter(id)} />
              ) : (
                <UploadHero onClick={() => navigate(hasCharacters && activeCharacter ? `/create-character?edit=${activeCharacter.id}` : '/create-character')} />
              )}
            </div>

            {/* Journey stats */}
            {hasCharacters && (
              <div className="mb-8">
                <JourneyStats stats={journeyStats} />
              </div>
            )}

            {/* Continue cards */}
            {continueCards.length > 0 && (
              <div className="mb-6">
                <p className="text-[11px] font-semibold tracking-[2px] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: SG }}>CONTINUE</p>
                <div className="flex gap-3">
                  {continueCards.map((card) => (
                    <div key={card.key} className="flex-1 max-w-[480px]">{card}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {hasCharacters && unreadPings.length > 0 && (
              <div className="mb-6">
                <PingCards pings={unreadPings} onOpen={handleOpenPing} />
              </div>
            )}

            {/* Companions */}
            <CompanionPicker onSelect={setSelectedCompanion} />
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

      {/* Companion Detail Modal */}
      <AnimatePresence>
        {selectedCompanion && (
          <CompanionDetailModal
            companion={selectedCompanion}
            onClose={() => setSelectedCompanion(null)}
            onTravelWith={() => { setSelectedCompanion(null); navigate('/travel') }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
