import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { motion } from 'framer-motion'
import { ArrowRight, Globe, BookOpen, ChevronRight } from 'lucide-react'
import { AuthModal } from '../components/AuthModal'
import { UNIVERSES } from '../data/storyData'

const SG = 'Space Grotesk, sans-serif'
const INTER = 'Inter, sans-serif'

// ─── Travel destinations (smoke test — Tokyo only active) ───

const DESTINATIONS = [
  { city: 'Tokyo', vibe: 'Neon · Ramen · Shrines', image: '/hero-landing.jpeg', accent: '#A78BFA', comingSoon: false },
  { city: 'Seoul', vibe: 'K-pop · Cafés · Markets', image: '/seoul-night.jpg', accent: '#D4799A', comingSoon: true },
  { city: 'Paris', vibe: 'Art · Wine · Romance', image: '/midnight-paris.jpeg', accent: '#E05263', comingSoon: true },
  { city: 'Bangkok', vibe: 'Temples · Street food · Chaos', image: '/edge-of-atlas.jpeg', accent: '#FFB74D', comingSoon: true },
]

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

function DestinationCard({ dest }: { dest: typeof DESTINATIONS[number] }) {
  return (
    <div className="rounded-2xl overflow-hidden flex flex-col flex-1 min-w-0" style={{ background: '#111016', border: '1px solid rgba(255,255,255,0.03)' }}>
      <div className="relative w-full h-24 md:h-40 overflow-hidden">
        <img src={dest.image} alt={dest.city} className="w-full h-full object-cover" />
        {dest.comingSoon && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white/60 text-[10px] font-semibold tracking-wider uppercase" style={{ fontFamily: SG }}>Coming Soon</span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 p-3 md:p-4">
        <p className="text-white font-semibold text-sm md:text-base" style={{ fontFamily: SG }}>{dest.city}</p>
        <p className="text-xs md:text-[11px]" style={{ color: dest.accent, fontFamily: SG }}>{dest.vibe}</p>
      </div>
    </div>
  )
}

// ─── Story Card ───

function StoryCard({ story, size = 'md' }: { story: typeof UNIVERSES[number]; size?: 'sm' | 'md' }) {
  const navigate = useNavigate()
  return (
    <div
      className="rounded-xl md:rounded-2xl overflow-hidden flex flex-col cursor-pointer group"
      style={{ background: '#111016', border: '1px solid rgba(255,255,255,0.03)', width: size === 'sm' ? 160 : undefined, flexShrink: size === 'sm' ? 0 : undefined }}
      onClick={() => navigate(`/universe/${story.id}`)}
    >
      <div className="relative w-full h-24 md:h-44 overflow-hidden">
        <img src={story.image} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
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

      {/* ═══ MOBILE ═══ */}
      <div className="md:hidden">

        {/* Hero */}
        <div className="relative flex flex-col overflow-hidden" style={{ minHeight: '100svh' }}>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/hero-landing.jpeg)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(13,11,18,0.75) 0%, rgba(13,11,18,0) 22%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(13,11,18,0) 0%, rgba(13,11,18,0.85) 45%, rgba(13,11,18,1) 65%)' }} />

          {/* Logo */}
          <div className="relative z-10 flex items-center gap-2 px-5 pt-10 safe-top">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)' }}>
              <LogoMark size={34} />
              <span className="font-semibold text-lg" style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.02em', background: 'linear-gradient(180deg, #D4C4F0 0%, #B8A5E0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>chaptr</span>
            </div>
          </div>

          {/* Hero content */}
          <div className="relative z-10 mt-auto px-5 pb-6 flex flex-col gap-4 safe-bottom">
            <motion.div className="flex flex-col gap-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <span className="text-[#A78BFA] font-semibold text-[11px] tracking-[2px]" style={{ fontFamily: SG }}>INTERACTIVE EXPERIENCES</span>
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
            <StepCard num="02" title="Pick travel or story mode" desc="Explore Tokyo with a companion, or star in a K-drama romance. Choose your adventure — travel the world or live a story.">
              <div className="relative w-full h-[160px] bg-cover bg-center rounded-t-2xl overflow-hidden" style={{ backgroundImage: 'url(/step2-mobile.jpeg)', backgroundColor: '#111016' }} />
            </StepCard>
            {/* Step 3 — See yourself */}
            <StepCard num="03" title="See yourself in every scene" desc="Your face. Their world. Cinematic scenes starring you — and characters who remember everything you say.">
              <div className="relative w-full h-[160px] bg-cover bg-center rounded-t-2xl overflow-hidden" style={{ backgroundImage: 'url(/step3-mobile.jpeg)', backgroundColor: '#111016' }} />
            </StepCard>
          </div>
        </section>

        {/* Travel Mode */}
        <section id="travel-section" className="py-10 px-5 flex flex-col gap-5" style={{ background: '#0A090F' }}>
          <SectionHeader
            tag="TRAVEL MODE"
            title="Explore the world, scene by scene"
            description="Pick a city, choose a companion, and live your dream trip scene by scene."
          />
          <div className="grid grid-cols-2 gap-2.5">
            {DESTINATIONS.map(d => <DestinationCard key={d.city} dest={d} />)}
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
            {SHOWCASE_STORIES.map(s => <StoryCard key={s.id} story={s} size="sm" />)}
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

          <div className="relative z-10 page-container mx-auto">
            {/* Nav */}
            <nav className="flex items-center justify-between px-8 lg:px-20 h-16">
              <div className="flex items-center gap-2.5">
                <LogoMark size={34} />
                <span className="font-semibold text-lg" style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.02em', background: 'linear-gradient(180deg, #D4C4F0 0%, #B8A5E0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>chaptr</span>
              </div>
              <div className="flex items-center gap-8">
                <span className="text-[#A78BFA] text-sm font-medium cursor-pointer" style={{ fontFamily: SG }}>Travel</span>
                <span className="text-white/50 text-sm font-medium cursor-pointer hover:text-white transition-colors" style={{ fontFamily: SG }}>Stories</span>
                <span className="text-white/50 text-sm font-medium cursor-pointer hover:text-white transition-colors" style={{ fontFamily: SG }}>Characters</span>
                <button
                  className="text-white text-sm font-semibold px-5 py-2 rounded-full transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(90deg, #7C3AED, #A78BFA)' }}
                  onClick={handleCTA}
                >
                  Get Started
                </button>
              </div>
            </nav>

            {/* Hero content — centered */}
            <div className="flex flex-col items-center text-center gap-5 pt-24 pb-16 px-8">
              <motion.span className="text-[#A78BFA] font-semibold text-xs tracking-[3px]" style={{ fontFamily: SG }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                INTERACTIVE EXPERIENCES
              </motion.span>
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
              <StepCard num="02" title="Pick travel or story mode" desc="Explore Tokyo with a companion, or star in a K-drama romance. Choose your adventure — travel the world or live a story." desktop>
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
            <div className="grid grid-cols-4 gap-4">
              {DESTINATIONS.map(d => <DestinationCard key={d.city} dest={d} />)}
            </div>
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
              {SHOWCASE_STORIES.map(s => <StoryCard key={s.id} story={s} />)}
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
            <p className="text-[#6B6275]/40 text-[11px]" style={{ fontFamily: SG }}>© 2025 chaptr. All rights reserved.</p>
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
        <p className={`text-[#B0A8BF] leading-snug ${desktop ? 'text-sm' : 'text-[11px]'}`} style={{ fontFamily: SG }}>{desc}</p>
      </div>
      <ChevronRight size={desktop ? 20 : 16} className="text-white/20 shrink-0" />
    </div>
  )
}

function StepCard({ num, title, desc, children, desktop }: {
  num: string; title: string; desc: string; children: React.ReactNode; desktop?: boolean
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
        <p className="text-[#6B6275]/40 text-[11px]" style={{ fontFamily: SG }}>© 2025 chaptr. All rights reserved.</p>
      </div>
    </footer>
  )
}
