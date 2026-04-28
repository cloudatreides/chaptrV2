import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { motion } from 'framer-motion'
import { ArrowRight, Globe, BookOpen, ChevronRight, ChevronLeft, X, MapPin, Clock, Sparkles } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { AuthModal } from '../components/AuthModal'
import { UNIVERSES } from '../data/storyData'
import { DESTINATIONS as ALL_DESTINATIONS } from '../data/travel/destinations'

const SG = 'Space Grotesk, sans-serif'
const INTER = 'Inter, sans-serif'

const AVATAR_COUNT = 38
const AVATARS = Array.from({ length: AVATAR_COUNT }, (_, i) => `/avatars/avatar-${String(i + 1).padStart(2, '0')}.webp`)

function getVisitors(destId: string) {
  let hash = 0
  for (let i = 0; i < destId.length; i++) hash = (hash * 31 + destId.charCodeAt(i)) | 0
  const count = 3 + (Math.abs(hash) % 45)
  const start = Math.abs(hash) % AVATARS.length
  const avatars = Array.from({ length: Math.min(4, count) }, (_, i) => AVATARS[(start + i) % AVATARS.length])
  return { count, avatars }
}

// Pick a diverse set of stories for the showcase
const SHOWCASE_STORIES = UNIVERSES.filter(u => !u.locked).slice(0, 8)

// ─── Selfie → Anime Morph (kept from production) ───

function SelfieMorph({ height, className }: { height: number; className?: string }) {
  return (
    <div className={`relative w-full overflow-hidden ${className ?? ''}`} style={{ height, backgroundColor: '#1a1525' }}>
      <div
        className="absolute inset-0 bg-cover"
        style={{ backgroundImage: 'url(/step1-selfie.jpeg)', backgroundPosition: 'center 20%' }}
      />
      <motion.div
        className="absolute inset-0 bg-cover"
        style={{ backgroundImage: 'url(/step1-anime.png)', backgroundPosition: 'center 20%' }}
        animate={{ opacity: [0, 0, 1, 1, 0, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', times: [0, 0.15, 0.4, 0.6, 0.85, 1] }}
      />
      <motion.div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, rgba(200,75,158,0.2) 0%, rgba(139,92,246,0.15) 100%)' }}
        animate={{ opacity: [0, 0, 1, 1, 0, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', times: [0, 0.15, 0.4, 0.6, 0.85, 1] }}
      />
      <div className="absolute bottom-3 right-3 flex gap-1.5">
        <motion.span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', color: 'rgba(255,255,255,0.7)', fontFamily: INTER }}
          animate={{ opacity: [1, 1, 0, 0, 1, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', times: [0, 0.15, 0.4, 0.6, 0.85, 1] }}
        >
          selfie
        </motion.span>
        <motion.span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
          style={{ background: 'rgba(200,75,158,0.5)', backdropFilter: 'blur(8px)', color: '#fff', fontFamily: INTER }}
          animate={{ opacity: [0, 0, 1, 1, 0, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', times: [0, 0.15, 0.4, 0.6, 0.85, 1] }}
        >
          anime
        </motion.span>
      </div>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(17,16,22,0) 50%, rgba(17,16,22,0.8) 100%)' }} />
    </div>
  )
}


// ─── Section Header (standardized) ───

function SectionHeader({ tag, title, description, className }: { tag: string; title: string; description?: string; className?: string }) {
  return (
    <div className={`flex flex-col gap-2 ${className ?? ''}`}>
      <span className="text-[#A78BFA] font-semibold text-[10px] md:text-xs tracking-[2px] md:tracking-[3px] uppercase" style={{ fontFamily: SG }}>
        {tag}
      </span>
      <h2 className="text-white font-bold text-xl md:text-[32px] leading-tight" style={{ fontFamily: SG }}>
        {title}
      </h2>
      {description && (
        <p className="text-[#B0A8BF] text-xs md:text-[15px] leading-relaxed max-w-[600px]" style={{ fontFamily: SG }}>
          {description}
        </p>
      )}
    </div>
  )
}

// ─── Destination Card ───

function DestinationCarousel({ onCardClick }: { onCardClick?: (dest: typeof ALL_DESTINATIONS[number]) => void }) {
  const allDests = [...ALL_DESTINATIONS].sort((a, b) => Number(a.locked ?? false) - Number(b.locked ?? false))
  const cardWidth = 280
  const gap = 16
  const duration = allDests.length * 3.5

  return (
    <div
      className="overflow-hidden"
      style={{
        maskImage: 'linear-gradient(to right, transparent, black 32px, black calc(100% - 32px), transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 32px, black calc(100% - 32px), transparent)',
      }}
    >
      <div
        className="flex hover:[animation-play-state:paused]"
        style={{ gap, animation: `carouselScroll ${duration}s linear infinite` }}
      >
        {[...allDests, ...allDests].map((dest, i) => (
          <div
            key={`${dest.id}-${i}`}
            className="rounded-2xl overflow-hidden shrink-0 flex flex-col cursor-pointer"
            style={{ width: cardWidth, background: '#111016', border: '1px solid rgba(255,255,255,0.03)' }}
            onClick={() => onCardClick?.(dest)}
          >
            <div className="relative w-full h-44 overflow-hidden">
              <img src={dest.heroImage} alt={dest.city} className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 50%, #111016 100%)' }} />
              {dest.locked && (
                <span
                  className="absolute top-2.5 right-2.5 text-[9px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.5)', fontFamily: SG, backdropFilter: 'blur(4px)' }}
                >
                  Soon
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1 p-4">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{dest.countryEmoji}</span>
                <p className="text-white font-semibold text-sm" style={{ fontFamily: SG }}>{dest.city}</p>
              </div>
              <div className="flex gap-1.5">
                {dest.vibeTags.slice(0, 2).map((tag) => (
                  <span key={tag} className="text-[10px] font-medium" style={{ color: '#A78BFA', fontFamily: SG }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Mobile Destination Carousel (manual scroll + arrows) ───

function MobileDestinationCarousel({ onCardClick }: { onCardClick?: (dest: typeof ALL_DESTINATIONS[number]) => void }) {
  const allDests = [...ALL_DESTINATIONS].sort((a, b) => Number(a.locked ?? false) - Number(b.locked ?? false))
  const scrollRef = useRef<HTMLDivElement>(null)
  const cardWidth = 240
  const gap = 12

  const scroll = useCallback((dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amount = cardWidth + gap
    scrollRef.current.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' })
  }, [])

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide scroll-smooth"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {allDests.map((dest) => (
          <div
            key={dest.id}
            className="rounded-2xl overflow-hidden shrink-0 flex flex-col cursor-pointer"
            style={{ width: cardWidth, background: '#111016', border: '1px solid rgba(255,255,255,0.03)', scrollSnapAlign: 'start' }}
            onClick={() => onCardClick?.(dest)}
          >
            <div className="relative w-full h-36 overflow-hidden">
              <img src={dest.heroImage} alt={dest.city} className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 50%, #111016 100%)' }} />
              {dest.locked && (
                <span
                  className="absolute top-2.5 right-2.5 text-[9px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.5)', fontFamily: SG, backdropFilter: 'blur(4px)' }}
                >
                  Soon
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1 p-3">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{dest.countryEmoji}</span>
                <p className="text-white font-semibold text-sm" style={{ fontFamily: SG }}>{dest.city}</p>
              </div>
              <div className="flex gap-1.5">
                {dest.vibeTags.slice(0, 2).map((tag) => (
                  <span key={tag} className="text-[10px] font-medium" style={{ color: '#A78BFA', fontFamily: SG }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => scroll('left')}
        className="absolute left-1 top-[60px] z-10 w-8 h-8 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      >
        <ChevronLeft size={18} className="text-white/80" />
      </button>
      <button
        onClick={() => scroll('right')}
        className="absolute right-1 top-[60px] z-10 w-8 h-8 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      >
        <ChevronRight size={18} className="text-white/80" />
      </button>
    </div>
  )
}

// ─── Story Card ───

function StoryCard({ story, size = 'md', onClick }: { story: typeof UNIVERSES[number]; size?: 'sm' | 'md'; onClick?: (story: typeof UNIVERSES[number]) => void }) {
  return (
    <div
      className="rounded-xl md:rounded-2xl overflow-hidden flex flex-col cursor-pointer group"
      style={{ background: '#111016', border: '1px solid rgba(255,255,255,0.03)', width: size === 'sm' ? 160 : undefined, flexShrink: size === 'sm' ? 0 : undefined }}
      onClick={() => onClick?.(story)}
    >
      <div className="relative w-full h-24 md:h-44 overflow-hidden">
        <img src={story.image} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 50%, #111016 100%)' }} />
      </div>
      <div className="flex flex-col gap-1 p-2.5 md:p-4">
        <span className="text-[8px] md:text-[10px] font-semibold tracking-[1px] uppercase" style={{ color: '#A78BFA', fontFamily: SG }}>{story.genreTag}</span>
        <p className="text-white font-semibold text-[11px] md:text-sm" style={{ fontFamily: SG }}>{story.title}</p>
      </div>
    </div>
  )
}

// ─── Logo Mark ───

function LogoMark({ size }: { size: number }) {
  const pageW = size * 0.6
  const pageH = size * 0.75
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div className="absolute" style={{ width: pageW, height: pageH, borderRadius: size * 0.1, background: '#7C3AED', transform: 'rotate(8deg)', top: 0, left: size * 0.18 }} />
      <div className="absolute" style={{ width: pageW, height: pageH, borderRadius: size * 0.1, background: '#A78BFA', transform: 'rotate(3deg)', top: size * 0.05, left: size * 0.12 }} />
      <div className="absolute" style={{ width: pageW, height: pageH, borderRadius: size * 0.1, background: '#E9D5FF', top: size * 0.1, left: size * 0.06 }} />
    </div>
  )
}

// ═══════════════════════════════════
//  LANDING PAGE
// ═══════════════════════════════════

export function LandingPage() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [previewDest, setPreviewDest] = useState<typeof ALL_DESTINATIONS[number] | null>(null)
  const [previewStory, setPreviewStory] = useState<typeof UNIVERSES[number] | null>(null)

  function handleCTA() {
    if (session) {
      navigate('/home')
    } else {
      setShowAuth(true)
    }
  }

  return (
    <div className="bg-[#0D0B12]">
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />

      {/* Destination Preview Modal */}
      <AnimatePresence>
        {previewDest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={() => setPreviewDest(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md rounded-2xl overflow-hidden"
              style={{ background: '#13101c', border: '1px solid rgba(255,255,255,0.08)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-52 overflow-hidden">
                <img src={previewDest.heroImage} alt={previewDest.city} className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, #13101c 100%)' }} />
                <button
                  onClick={() => setPreviewDest(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
                  style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
                >
                  <X size={16} className="text-white/70" />
                </button>
              </div>
              <div className="px-5 pb-5 -mt-4 relative">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{previewDest.countryEmoji}</span>
                    <h3 className="text-white text-2xl font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>
                      {previewDest.city}
                    </h3>
                  </div>
                  {(() => {
                    const { count, avatars } = getVisitors(previewDest.id)
                    return (
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-1.5">
                          {avatars.map((src, i) => (
                            <img
                              key={i}
                              src={src}
                              alt=""
                              className="w-6 h-6 rounded-full object-cover"
                              style={{ border: '2px solid #13101c', zIndex: avatars.length - i }}
                            />
                          ))}
                        </div>
                        <span className="text-white/40 text-[11px] font-medium" style={{ fontFamily: SG }}>
                          {count} exploring
                        </span>
                      </div>
                    )
                  })()}
                </div>
                <p className="text-white/50 text-sm mb-3" style={{ fontFamily: SG }}>
                  {previewDest.description}
                </p>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-white/30" />
                    <span className="text-white/40 text-[11px]" style={{ fontFamily: SG }}>{previewDest.country}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} className="text-white/30" />
                    <span className="text-white/40 text-[11px]" style={{ fontFamily: SG }}>{previewDest.tripDays}-day trip</span>
                  </div>
                </div>

                {previewDest.highlights.length > 0 && (
                  <div className="mb-4 rounded-xl p-3" style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.1)' }}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Sparkles size={12} style={{ color: '#A78BFA' }} />
                      <span className="text-[10px] font-semibold tracking-[1.5px] uppercase" style={{ color: '#A78BFA', fontFamily: SG }}>Known for</span>
                    </div>
                    <ul className="space-y-1.5">
                      {previewDest.highlights.map((h) => (
                        <li key={h} className="flex items-start gap-2">
                          <span className="text-[10px] mt-0.5" style={{ color: '#7C3AED' }}>•</span>
                          <span className="text-white/60 text-[12px] leading-snug" style={{ fontFamily: SG }}>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mb-5">
                  {previewDest.vibeTags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                      style={{ background: 'rgba(124,58,237,0.1)', color: '#A78BFA', border: '1px solid rgba(124,58,237,0.15)', fontFamily: SG }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => { setPreviewDest(null); handleCTA() }}
                  className="w-full py-3 rounded-xl font-semibold text-white text-sm cursor-pointer"
                  style={{ background: 'linear-gradient(90deg, #7C3AED, #A78BFA)', fontFamily: SG }}
                >
                  Sign up to explore {previewDest.city} →
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Story Preview Modal */}
      <AnimatePresence>
        {previewStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={() => setPreviewStory(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm rounded-2xl overflow-hidden"
              style={{ background: '#13101c', border: '1px solid rgba(255,255,255,0.08)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-44 overflow-hidden">
                <img src={previewStory.image} alt={previewStory.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 30%, #13101c 100%)' }} />
                <button
                  onClick={() => setPreviewStory(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
                  style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
                >
                  <X size={16} className="text-white/70" />
                </button>
              </div>
              <div className="px-5 pb-5 -mt-4 relative">
                <span
                  className="inline-block text-[9px] font-bold tracking-[1px] uppercase px-2 py-1 rounded mb-2"
                  style={{ background: 'rgba(200,75,158,0.2)', color: '#e88bc4', fontFamily: SG }}
                >
                  {previewStory.genreTag}
                </span>
                <h3 className="text-white text-xl font-bold mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {previewStory.title}
                </h3>

                <div className="flex items-center gap-3 mb-3">
                  {previewStory.chapters && (
                    <div className="flex items-center gap-1.5">
                      <BookOpen size={12} className="text-white/30" />
                      <span className="text-white/40 text-[11px]" style={{ fontFamily: SG }}>{previewStory.chapters} chapters</span>
                    </div>
                  )}
                </div>

                <p className="text-white/50 text-[12px] leading-relaxed mb-4" style={{ fontFamily: SG }}>
                  {previewStory.longDescription || previewStory.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-5">
                  {previewStory.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(200,75,158,0.1)', color: '#e88bc4', border: '1px solid rgba(200,75,158,0.15)', fontFamily: SG }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => { setPreviewStory(null); handleCTA() }}
                  className="w-full py-3 rounded-xl font-semibold text-white text-sm cursor-pointer"
                  style={{ background: 'linear-gradient(90deg, #c84b9e, #e88bc4)', fontFamily: SG }}
                >
                  Sign up to play {previewStory.title} →
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ MOBILE ═══ */}
      <div className="md:hidden">

        {/* Hero */}
        <div className="relative flex flex-col overflow-hidden" style={{ minHeight: '100svh' }}>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/hero-landing.jpeg)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(13,11,18,0.75) 0%, rgba(13,11,18,0) 22%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(13,11,18,0) 0%, rgba(13,11,18,0.85) 45%, rgba(13,11,18,1) 65%)' }} />

          {/* Logo */}
          <div className="relative z-10 flex items-center gap-2 px-5 pt-5">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)' }}>
              <LogoMark size={34} />
              <span className="font-semibold text-lg" style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.02em', background: 'linear-gradient(180deg, #D4C4F0 0%, #B8A5E0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>chaptr</span>
            </div>
          </div>

          {/* Hero content */}
          <div className="relative z-10 mt-auto px-5 pb-6 flex flex-col gap-4 safe-bottom">
            <motion.div className="flex flex-col gap-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h1 className="text-white font-bold text-[34px] leading-[1]" style={{ fontFamily: SG, letterSpacing: -1 }}>
                Live any story.<br />Go anywhere.
              </h1>
              <p className="text-[#B0A8BF] text-sm leading-relaxed" style={{ fontFamily: SG, maxWidth: 320 }}>
                Choose an interactive story or plan a trip with a companion — then live every moment through scenes with your face in them.
              </p>
            </motion.div>

            {/* Two Path Cards */}
            <div className="flex flex-col gap-2.5">
              <PathCard
                icon={<Globe size={20} className="text-[#A78BFA]" />}
                title="Travel Mode"
                desc="Pick a city, choose a companion, live it scene by scene"
                borderColor="rgba(124,58,237,0.25)"
                iconBg="rgba(124,58,237,0.2)"
                onClick={() => document.getElementById('travel-section')?.scrollIntoView({ behavior: 'smooth' })}
              />
              <PathCard
                icon={<BookOpen size={20} className="text-[#D4799A]" />}
                title="Story Mode"
                desc="Star in interactive stories — romance, horror, mystery, and more"
                borderColor="rgba(212,121,154,0.25)"
                iconBg="rgba(212,121,154,0.2)"
                onClick={() => document.getElementById('stories-section')?.scrollIntoView({ behavior: 'smooth' })}
              />
            </div>

            <motion.button
              className="flex items-center justify-center gap-2 rounded-full text-white font-bold text-base"
              style={{ fontFamily: SG, minHeight: 52, background: 'linear-gradient(90deg, #7C3AED, #A78BFA)' }}
              onClick={handleCTA}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              whileTap={{ scale: 0.97 }}
            >
              Start Your Adventure <ArrowRight size={18} />
            </motion.button>

            <p className="text-[#6B6275] text-xs text-center" style={{ fontFamily: SG }}>
              12.4K adventures started this week
            </p>
          </div>
        </div>

        {/* How It Works */}
        <section className="py-10 px-5 flex flex-col gap-6" style={{ background: '#0A090F' }}>
          <div className="flex flex-col items-center text-center gap-3">
            <span className="text-[#A78BFA]/70 font-semibold text-[10px] tracking-[2px] uppercase" style={{ fontFamily: SG }}>HOW IT WORKS</span>
            <h2 className="text-white font-bold text-[24px] leading-tight" style={{ fontFamily: SG }}>
              You're the<br />main character.
            </h2>
            <p className="text-[#B0A8BF] text-[13px] leading-relaxed max-w-[320px]" style={{ fontFamily: SG }}>
              Upload a selfie and you're in every scene — whether you're exploring Tokyo or starring in a K-drama.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {/* Step 1 — Upload selfie (uses existing morph component) */}
            <StepCard num="01" title="Upload your selfie" desc="Snap a photo and become the protagonist. Your face appears in every scene, every chapter.">
              <SelfieMorph height={160} className="rounded-t-2xl" />
            </StepCard>
            {/* Step 2 — Pick mode */}
            <StepCard num="02" title={<>Pick <span style={{ color: '#A78BFA' }}>travel</span> or <span style={{ color: '#e88bc4' }}>story</span> mode</>} desc="Explore Tokyo with a companion, or star in a K-drama romance. Choose your adventure — travel the world or live a story.">
              <div className="relative w-full h-[160px] bg-cover bg-center rounded-t-2xl overflow-hidden" style={{ backgroundImage: 'url(/step2-mobile.jpeg)', backgroundColor: '#111016' }} />
            </StepCard>
            {/* Step 3 — See yourself */}
            <StepCard num="03" title="See yourself in every scene" desc="Your face. Their world. Cinematic scenes starring you — and characters who remember everything you say.">
              <div className="relative w-full h-[160px] bg-cover bg-center rounded-t-2xl overflow-hidden" style={{ backgroundImage: 'url(/step3-mobile.jpeg)', backgroundColor: '#111016' }} />
            </StepCard>
          </div>
        </section>

        {/* Travel Mode */}
        <section id="travel-section" className="py-10 flex flex-col gap-5" style={{ background: '#0A090F' }}>
          <div className="px-5">
            <SectionHeader
              tag="TRAVEL MODE"
              title="Explore the world, scene by scene"
              description="Pick a city, choose a companion, and live your dream trip scene by scene."
            />
          </div>
          <div className="px-3">
            <MobileDestinationCarousel onCardClick={setPreviewDest} />
          </div>
        </section>

        {/* Interactive Stories */}
        <section id="stories-section" className="py-10 px-5 flex flex-col gap-5" style={{ background: '#0D0B12' }}>
          <SectionHeader
            tag="INTERACTIVE STORIES"
            title="15+ stories to star in"
            description="Romance, horror, mystery — upload a selfie and become the main character. Your choices change the ending."
          />
          <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
            {SHOWCASE_STORIES.map(s => <StoryCard key={s.id} story={s} size="sm" onClick={setPreviewStory} />)}
          </div>
        </section>

        {/* Footer */}
        <MobileFooter />
      </div>

      {/* ═══ DESKTOP ═══ */}
      <div className="hidden md:block">

        {/* Hero */}
        <div className="relative" style={{ minHeight: 700 }}>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/hero-desktop@2x.jpg)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(13,11,18,0.8) 0%, rgba(13,11,18,0) 15%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(13,11,18,0) 15%, rgba(13,11,18,0.85) 50%, rgba(13,11,18,1) 65%)' }} />

          <div className="relative z-10 w-full" style={{ background: 'rgba(13,11,18,0.35)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
            <nav className="flex items-center justify-between px-8 lg:px-20 h-16 page-container mx-auto">
              <div className="flex items-center gap-2.5">
                <LogoMark size={34} />
                <span className="font-semibold text-lg" style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.02em', background: 'linear-gradient(180deg, #D4C4F0 0%, #B8A5E0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>chaptr</span>
              </div>
              <button
                className="text-white text-sm font-semibold px-5 py-2 rounded-full transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(90deg, #7C3AED, #A78BFA)' }}
                onClick={handleCTA}
              >
                Get Started
              </button>
            </nav>
          </div>

          <div className="relative z-10 page-container mx-auto">
            {/* Hero content — centered */}
            <div className="flex flex-col items-center text-center gap-5 pt-24 pb-16 px-8">
              <motion.h1
                className="text-white font-bold text-[64px] leading-[1]"
                style={{ fontFamily: SG, letterSpacing: -2 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                Live any story.<br />Go anywhere.
              </motion.h1>
              <motion.p
                className="text-[#B0A8BF] text-lg leading-relaxed max-w-[560px]"
                style={{ fontFamily: SG }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Choose an interactive story or plan a trip with a companion — then live every moment through scenes with your face in them.
              </motion.p>
              <motion.button
                className="flex items-center gap-2 text-white font-bold text-base rounded-full px-8 py-4 mt-2"
                style={{ background: 'linear-gradient(90deg, #7C3AED, #A78BFA)', fontFamily: SG }}
                onClick={handleCTA}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.02 }}
              >
                Start Your Adventure <ArrowRight size={18} />
              </motion.button>
              <motion.p className="text-[#6B6275] text-[13px]" style={{ fontFamily: SG }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                12.4K adventures started this week
              </motion.p>
            </div>

            {/* Two Path Cards */}
            <div className="flex gap-6 px-8 lg:px-20 pb-16">
              <PathCard
                icon={<Globe size={24} className="text-[#A78BFA]" />}
                title="Travel Mode"
                desc="Pick a city, choose a companion, and live your dream trip scene by scene — Tokyo, Seoul, Paris, and more."
                borderColor="rgba(124,58,237,0.25)"
                iconBg="rgba(124,58,237,0.2)"
                desktop
                onClick={() => document.getElementById('travel-section-desktop')?.scrollIntoView({ behavior: 'smooth' })}
              />
              <PathCard
                icon={<BookOpen size={24} className="text-[#D4799A]" />}
                title="Story Mode"
                desc="Star in interactive stories — romance, horror, mystery. Upload a selfie and your choices change the ending."
                borderColor="rgba(212,121,154,0.25)"
                iconBg="rgba(212,121,154,0.2)"
                onClick={() => document.getElementById('stories-section-desktop')?.scrollIntoView({ behavior: 'smooth' })}
                desktop
              />
            </div>
          </div>
        </div>

        {/* How It Works */}
        <section className="py-16" style={{ background: '#0A090F' }}>
          <div className="page-container mx-auto px-8 lg:px-20">
            <div className="flex flex-col items-center text-center gap-3 mb-12">
              <span className="text-[#A78BFA]/70 font-semibold text-xs tracking-[3px] uppercase" style={{ fontFamily: SG }}>HOW IT WORKS</span>
              <h2 className="text-white font-bold text-[40px]" style={{ fontFamily: SG }}>You're the main character.</h2>
              <p className="text-[#B0A8BF] text-base leading-relaxed max-w-[600px]" style={{ fontFamily: SG }}>
                Upload a selfie and you're in every scene — whether you're exploring Tokyo or starring in a K-drama.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <StepCard num="01" title="Upload your selfie" desc="Snap a photo and become the protagonist. Your face appears in every scene, every chapter." desktop>
                <SelfieMorph height={200} className="rounded-t-2xl" />
              </StepCard>
              <StepCard num="02" title={<>Pick <span style={{ color: '#A78BFA' }}>travel</span> or <span style={{ color: '#e88bc4' }}>story</span> mode</>} desc="Explore Tokyo with a companion, or star in a K-drama romance. Choose your adventure — travel the world or live a story." desktop>
                <div className="relative w-full h-[200px] bg-cover bg-center rounded-t-2xl overflow-hidden" style={{ backgroundImage: 'url(/step2-desktop.jpeg)', backgroundColor: '#111016' }} />
              </StepCard>
              <StepCard num="03" title="See yourself in every scene" desc="Your face. Their world. Cinematic scenes starring you — and characters who remember everything you say." desktop>
                <div className="relative w-full h-[200px] bg-cover bg-center rounded-t-2xl overflow-hidden" style={{ backgroundImage: 'url(/step3-desktop.jpeg)', backgroundColor: '#111016' }} />
              </StepCard>
            </div>
          </div>
        </section>

        {/* Travel Mode */}
        <section id="travel-section-desktop" className="py-16" style={{ background: '#0A090F' }}>
          <div className="page-container mx-auto px-8 lg:px-20">
            <SectionHeader
              tag="TRAVEL MODE"
              title="Explore the world, scene by scene"
              description="Pick a city, choose a companion, and live your dream trip scene by scene."
              className="mb-8"
            />
            <DestinationCarousel onCardClick={setPreviewDest} />
          </div>
        </section>

        {/* Interactive Stories */}
        <section id="stories-section-desktop" className="py-16" style={{ background: '#0D0B12' }}>
          <div className="page-container mx-auto px-8 lg:px-20">
            <SectionHeader
              tag="INTERACTIVE STORIES"
              title="15+ stories to star in"
              description="Romance, horror, mystery — upload a selfie and become the main character. Your choices change the ending."
              className="mb-8"
            />
            <div className="grid grid-cols-4 gap-5">
              {SHOWCASE_STORIES.map(s => <StoryCard key={s.id} story={s} onClick={setPreviewStory} />)}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ background: '#080808', borderTop: '1px solid #1F1F23' }}>
          <div className="page-container mx-auto px-8 lg:px-20 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <LogoMark size={28} />
                  <span className="font-medium text-base text-white" style={{ fontFamily: SG }}>chaptr</span>
                </div>
                <span className="text-[#6B6275] text-xs" style={{ fontFamily: SG }}>Interactive travel & stories</span>
              </div>
              <div className="flex items-center gap-6">
                {['Travel', 'Stories', 'Privacy', 'Twitter/X'].map(l => (
                  <span key={l} className="text-[#6B6275] text-[13px] cursor-pointer hover:text-white transition-colors" style={{ fontFamily: SG }}>{l}</span>
                ))}
              </div>
            </div>
            <div className="h-px mt-6 mb-4" style={{ background: '#1F1F23' }} />
            <p className="text-[#6B6275]/40 text-[11px]" style={{ fontFamily: SG }}>© 2026 chaptr. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}

// ─── Shared Components ───

function PathCard({ icon, title, desc, borderColor, iconBg, desktop, onClick }: {
  icon: React.ReactNode; title: string; desc: string; borderColor: string; iconBg: string; desktop?: boolean; onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl flex items-center gap-3 cursor-pointer transition-colors hover:bg-white/[0.02] ${desktop ? 'flex-1 p-6 gap-5' : 'p-3.5'}`}
      style={{ background: 'rgba(26,22,40,0.6)', border: `1px solid ${borderColor}` }}
    >
      <div className={`rounded-xl flex items-center justify-center shrink-0 ${desktop ? 'w-14 h-14' : 'w-11 h-11'}`} style={{ background: iconBg }}>
        {icon}
      </div>
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <p className={`text-white font-bold ${desktop ? 'text-lg' : 'text-[15px]'}`} style={{ fontFamily: SG }}>{title}</p>
        <p className={`text-[#B0A8BF] leading-snug ${desktop ? 'text-sm' : 'text-xs'}`} style={{ fontFamily: SG }}>{desc}</p>
      </div>
      <ChevronRight size={desktop ? 20 : 16} className="text-white/20 shrink-0" />
    </div>
  )
}

function StepCard({ num, title, desc, children, desktop }: {
  num: string; title: React.ReactNode; desc: string; children: React.ReactNode; desktop?: boolean
}) {
  return (
    <motion.div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{ background: '#111016', border: '1px solid rgba(255,255,255,0.03)' }}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className="relative overflow-hidden">
        {children}
        <div className="absolute top-3 left-3 z-10">
          <span className="text-white font-bold text-[10px] tracking-[1px] px-2 py-1 rounded-md" style={{ background: 'rgba(124,58,237,0.6)', backdropFilter: 'blur(8px)' }}>
            {num}
          </span>
        </div>
      </div>
      <div className={`flex flex-col gap-1.5 ${desktop ? 'p-5' : 'p-4'}`}>
        <p className={`text-white font-bold ${desktop ? 'text-lg' : 'text-[15px]'}`} style={{ fontFamily: SG }}>{title}</p>
        <p className={`text-[#B0A8BF] leading-relaxed ${desktop ? 'text-[13px]' : 'text-xs'}`} style={{ fontFamily: SG }}>{desc}</p>
      </div>
    </motion.div>
  )
}

function MobileFooter() {
  return (
    <footer style={{ background: '#080808' }}>
      <div className="h-px" style={{ background: '#1F1F23' }} />
      <div className="flex flex-col gap-5 px-5 py-8 pb-10 safe-bottom">
        <div className="flex items-center gap-2">
          <LogoMark size={28} />
          <span className="font-medium text-base text-white" style={{ fontFamily: SG }}>chaptr</span>
        </div>
        <p className="text-[#6B6275] text-xs" style={{ fontFamily: SG }}>Interactive travel & stories</p>
        <div className="flex gap-6">
          {['Travel', 'Stories', 'Privacy', 'Twitter/X'].map(l => (
            <span key={l} className="text-[#6B6275] text-sm" style={{ fontFamily: SG }}>{l}</span>
          ))}
        </div>
        <p className="text-[#6B6275]/40 text-[11px]" style={{ fontFamily: SG }}>© 2026 chaptr. All rights reserved.</p>
      </div>
    </footer>
  )
}
