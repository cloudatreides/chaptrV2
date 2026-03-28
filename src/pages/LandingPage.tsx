import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Users } from 'lucide-react'

const STEPS = [
  {
    num: 'Step 1',
    title: 'Upload your selfie',
    desc: 'Snap a photo and our AI places your face into the story — you become the main character.',
    img: '/step1-upload.jpeg',
  },
  {
    num: 'Step 2',
    title: 'Choose your world',
    desc: 'Fantasy kingdoms, noir cityscapes, sci-fi stations, romance in Paris — pick your universe.',
    img: '/step2-world.jpeg',
  },
  {
    num: 'Step 3',
    title: 'Step inside the story',
    desc: "Your AI story unfolds chapter by chapter — you're the hero, making choices that shape the plot.",
    img: '/step3-story.jpeg',
  },
]

const TESTIMONIALS = [
  {
    name: 'Sarah K.',
    location: 'Seoul, Korea',
    avatar: 'https://images.unsplash.com/photo-1761118473125-861a23f326f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
    quote: '"I became the detective in my own noir thriller. I couldn\'t stop reading — my friends thought I was obsessed."',
  },
  {
    name: 'Marcus T.',
    location: 'New York, USA',
    avatar: 'https://images.unsplash.com/photo-1632541400823-2a905979469a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
    quote: '"Seeing my actual face placed inside a fantasy world felt surreal. I\'ve started three different story worlds already."',
  },
  {
    name: 'Yuki M.',
    location: 'Tokyo, Japan',
    avatar: 'https://images.unsplash.com/photo-1735025679651-369bc9f071ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
    quote: '"Each story felt tailor-made. Like the AI actually knows me. Chaptr is the only app I open every single morning."',
  },
]

const SG = 'Space Grotesk, sans-serif'
const INTER = 'Inter, sans-serif'

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="bg-bg">

      {/* ══════════════════════
          MOBILE
      ══════════════════════ */}
      <div className="md:hidden">

        {/* Hero */}
        <div className="relative h-screen flex flex-col overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/hero-landing.jpeg)' }} />
          {/* Top fade — just enough to make logo readable */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(13,11,18,0.55) 0%, rgba(13,11,18,0) 18%)' }} />
          {/* Bottom fade — only darkens the bottom 40% so scene stays visible */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(13,11,18,0) 0%, rgba(13,11,18,0) 55%, rgba(13,11,18,0.97) 75%, rgba(13,11,18,1) 100%)' }} />

          {/* Logo */}
          <div className="relative z-10 flex items-center gap-2 px-6 pt-10">
            <LogoMark size={34} />
            <span className="text-white font-medium text-lg" style={{ fontFamily: SG }}>chaptr</span>
          </div>

          {/* Hero text pinned to bottom */}
          <div className="relative z-10 mt-auto px-6 pb-10 flex flex-col gap-4">
            <motion.div className="flex flex-col gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <p className="text-[#D4799A] font-semibold text-xs tracking-[2px] uppercase" style={{ fontFamily: SG }}>AI · INTERACTIVE · PERSONALIZED</p>
              <h1 className="text-white font-bold" style={{ fontSize: 48, letterSpacing: -1, lineHeight: 0.95, fontFamily: SG }}>
                Your face.<br />Your story.
              </h1>
              <p className="text-[#B0A8BF] text-sm leading-relaxed" style={{ maxWidth: 300, fontFamily: SG }}>
                Step inside the story. AI generates a world where you're the main character.
              </p>
            </motion.div>

            <motion.button
              className="btn-accent flex items-center justify-center gap-2"
              style={{ fontFamily: SG }}
              onClick={() => navigate('/upload')}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              whileTap={{ scale: 0.97 }}
            >
              Start Your Story <ArrowRight size={18} />
            </motion.button>

            <motion.div className="flex items-center justify-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span className="text-[#6B6275] text-xs" style={{ fontFamily: SG }}>96.7K stories started this week</span>
            </motion.div>
          </div>
        </div>

        {/* Mobile — How It Works */}
        <section style={{ background: '#0D0D10' }} className="py-10 px-5 flex flex-col gap-6">
          <div className="flex flex-col items-center text-center gap-3">
            <span className="text-[#E879F9] font-semibold text-xs tracking-[1.5px] uppercase px-3 py-1.5 rounded-full" style={{ background: 'rgba(232,121,249,0.094)', fontFamily: INTER }}>
              HOW IT WORKS
            </span>
            <h2 className="text-white font-bold leading-tight" style={{ fontSize: 28, letterSpacing: -0.5, fontFamily: 'Instrument Serif, Georgia, serif', lineHeight: 1.2 }}>
              Three steps into your story
            </h2>
          </div>
          <div className="flex flex-col gap-4">
            {STEPS.map((step, i) => (
              <motion.div key={step.num} className="rounded-2xl overflow-hidden" style={{ background: '#141417', border: '1px solid #2A2A2E' }}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="h-40 bg-cover bg-center w-full" style={{ backgroundImage: `url(${step.img})`, backgroundColor: '#1a1525' }} />
                <div className="flex flex-col gap-1.5 p-4 pb-5">
                  <span className="text-white font-bold text-xs tracking-[0.5px] px-2.5 py-1 rounded-full self-start" style={{ background: 'linear-gradient(90deg, #E879F9 0%, #A855F7 100%)', fontFamily: INTER }}>
                    {step.num}
                  </span>
                  <p className="text-white font-bold text-base mt-1" style={{ fontFamily: INTER }}>{step.title}</p>
                  <p className="text-[#8B8B90] text-xs leading-relaxed" style={{ fontFamily: INTER }}>{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Mobile — Testimonials */}
        <section style={{ background: '#0D0D10' }} className="pb-4">
          <div className="flex flex-col gap-2 px-6 pt-10 pb-8">
            <p className="text-[#E879F9] font-semibold text-xs tracking-[2px] uppercase" style={{ fontFamily: INTER }}>WHAT READERS SAY</p>
            <h2 className="text-white font-semibold leading-tight" style={{ fontSize: 26, lineHeight: 1.2, fontFamily: 'Didact Gothic, Inter, sans-serif' }}>
              Stories that stay with you
            </h2>
            <p className="text-[#ADADB0] text-sm leading-relaxed" style={{ fontFamily: INTER }}>
              Real readers. Real adventures. Unforgettable characters — all with their face in the story.
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <Users size={13} className="text-[#E879F9]" />
              <span className="text-[#6B6B70] text-xs font-medium" style={{ fontFamily: INTER }}>50,000+ readers love their story</span>
            </div>
          </div>
          <div className="flex flex-col gap-3 px-4 pb-10">
            {TESTIMONIALS.map((t, i) => (
              <TestimonialCard key={t.name} t={t} i={i} />
            ))}
          </div>
        </section>

        {/* Mobile — Footer */}
        <MobileFooter />
      </div>

      {/* ══════════════════════
          DESKTOP
      ══════════════════════ */}
      <div className="hidden md:block">

        {/* ── Desktop Hero ── */}
        <div className="relative" style={{ height: 700 }}>
          {/* bg-top anchors the image at the top — neons stay at top edge, darker street falls in the middle where content sits */}
          <div className="absolute inset-0 bg-cover bg-top" style={{ backgroundImage: 'url(/hero-desktop.jpeg)' }} />
          {/* Subtle centre scrim so text is always readable */}
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 58%, rgba(13,11,18,0.55) 0%, rgba(13,11,18,0) 100%)' }} />
          {/* Top fade */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #0D0B12 0%, #0D0B1200 20%)' }} />
          {/* Bottom fade */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(0deg, #0D0B12 0%, #0D0B1200 40%)' }} />

          <div className="relative z-10 page-container mx-auto">
            {/* Nav */}
            <nav className="flex items-center justify-between px-16 pt-7">
              <div className="flex items-center gap-2.5">
                <LogoMark size={34} />
                <span className="text-white font-medium text-lg" style={{ fontFamily: SG }}>chaptr</span>
              </div>
              <div className="flex items-center gap-8">
                {['Features', 'How It Works', 'Testimonials'].map((link) => (
                  <span key={link} className="text-white/70 text-sm font-medium cursor-pointer hover:text-white transition-colors" style={{ fontFamily: SG }}>{link}</span>
                ))}
              </div>
            </nav>

            {/* Hero — vertically centred in remaining space */}
            <div className="flex flex-col items-center text-center gap-5 px-16 max-w-3xl mx-auto" style={{ paddingTop: 160 }}>
              <motion.p className="text-[#D4799A] font-semibold text-xs tracking-[3px] uppercase" style={{ fontFamily: SG }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
                AI · INTERACTIVE · PERSONALIZED
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <h1 className="text-white font-bold" style={{ fontSize: 64, letterSpacing: -1, lineHeight: 1.1, fontFamily: SG, textShadow: '0 2px 20px rgba(0,0,0,0.6)' }}>
                  Your face.<br />Your story.
                </h1>
              </motion.div>

              <motion.p
                className="text-white/90 text-base leading-relaxed"
                style={{ maxWidth: 480, fontFamily: SG, textShadow: '0 1px 12px rgba(0,0,0,0.9)' }}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              >
                Upload a selfie. Choose a world. Step inside an AI-powered story where you are the main character.
              </motion.p>

              <motion.div className="flex flex-col items-center gap-3 mt-2" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                <button
                  className="flex items-center justify-center gap-2 text-white font-semibold text-base transition-opacity hover:opacity-90"
                  style={{ height: 52, paddingLeft: 32, paddingRight: 32, borderRadius: 12, background: 'linear-gradient(90deg, #D4799A 0%, #9B7EC8 100%)', fontFamily: SG }}
                  onClick={() => navigate('/upload')}
                >
                  Start Your Story →
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span className="text-white/40 text-sm" style={{ fontFamily: SG }}>96.7K stories started this week</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* ── Desktop How It Works ── */}
        <section style={{ background: '#0D0D10' }} className="py-24">
          <div className="page-container mx-auto px-20">
            {/* Header */}
            <div className="flex flex-col items-center text-center gap-3 mb-14">
              <span className="text-[#E879F9] font-semibold text-xs tracking-[1.5px] uppercase px-3 py-1.5 rounded-full" style={{ background: 'rgba(232,121,249,0.094)', fontFamily: INTER }}>
                HOW IT WORKS
              </span>
              <h2 className="text-white font-bold" style={{ fontSize: 40, letterSpacing: -1, fontFamily: 'Playfair Display, Georgia, serif' }}>
                Three steps into your story
              </h2>
            </div>

            {/* 3-column step cards with actual images */}
            <div className="grid grid-cols-3 gap-6">
              {STEPS.map((step, i) => (
                <motion.div key={step.num} className="rounded-2xl overflow-hidden flex flex-col" style={{ background: '#141417', border: '1px solid #2A2A2E' }}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <div className="w-full bg-cover bg-center" style={{ height: 200, backgroundImage: `url(${step.img})`, backgroundColor: '#1a1525' }} />
                  <div className="flex flex-col gap-2 p-5 pb-6">
                    <span className="text-white font-bold text-xs tracking-[0.5px] px-2.5 py-1 rounded-full self-start" style={{ background: 'linear-gradient(90deg, #E879F9 0%, #A855F7 100%)', fontFamily: INTER }}>
                      {step.num}
                    </span>
                    <p className="text-white font-bold text-lg mt-1" style={{ fontFamily: INTER }}>{step.title}</p>
                    <p className="text-[#8B8B90] text-sm leading-relaxed" style={{ fontFamily: INTER }}>{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Desktop Testimonials ── */}
        <section style={{ background: '#0D0D10' }} className="pb-24">
          <div className="page-container mx-auto px-20">
            <div className="flex flex-col items-center text-center gap-2 mb-12">
              <p className="text-[#E879F9] font-semibold text-xs tracking-[2px] uppercase" style={{ fontFamily: INTER }}>WHAT READERS SAY</p>
              <h2 className="text-white font-semibold" style={{ fontSize: 36, lineHeight: 1.2, fontFamily: 'Playfair Display, Georgia, serif' }}>
                Stories that stay with you
              </h2>
              <p className="text-[#ADADB0] text-base leading-relaxed" style={{ maxWidth: 480, fontFamily: INTER }}>
                Real readers. Real adventures. Unforgettable characters — all with their face in the story.
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <Users size={13} className="text-[#E879F9]" />
                <span className="text-[#6B6B70] text-sm font-medium" style={{ fontFamily: INTER }}>50,000+ readers love their story</span>
              </div>
            </div>

            {/* 3-column testimonial cards */}
            <div className="grid grid-cols-3 gap-5">
              {TESTIMONIALS.map((t, i) => (
                <TestimonialCard key={t.name} t={t} i={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Desktop Footer ── */}
        <footer style={{ background: '#0D0D10', borderTop: '1px solid #1A1A1E' }}>
          <div className="page-container mx-auto px-20 py-10">
            <div className="flex items-start justify-between">
              {/* Left: brand */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <LogoMark size={28} small />
                  <span className="text-white font-bold text-base" style={{ fontFamily: INTER }}>chaptr</span>
                </div>
                <p className="text-[#6B6B70] text-sm" style={{ fontFamily: INTER }}>Your face. Your story.</p>
              </div>

              {/* Center: links */}
              <div className="flex items-center gap-8">
                {['About', 'Privacy', 'Terms', 'Contact'].map((l) => (
                  <span key={l} className="text-[#ADADB0] text-sm font-medium cursor-pointer hover:text-white transition-colors" style={{ fontFamily: INTER }}>{l}</span>
                ))}
              </div>

              {/* Right: socials */}
              <div className="flex items-center gap-3">
                {[
                  { icon: <span className="text-xs font-bold">IG</span>, label: 'IG' },
                  { icon: <span className="text-xs font-bold">YT</span>, label: 'YT' },
                  { icon: <span className="text-xs font-bold">𝕏</span>, label: 'X' },
                ].map(({ icon, label }) => (
                  <div key={label} className="w-9 h-9 rounded-xl flex items-center justify-center text-[#ADADB0] cursor-pointer hover:text-white transition-colors" style={{ background: '#141417', border: '1px solid #2A2A2E' }}>
                    {icon}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ height: 1, background: '#1F1F23', marginTop: 32, marginBottom: 24 }} />
            <div className="flex items-center justify-between">
              <p className="text-[#4A4A4E] text-xs" style={{ fontFamily: INTER }}>© 2026 Chaptr. All rights reserved.</p>
              <p className="text-[#4A4A4E] text-xs" style={{ fontFamily: INTER }}>Made by Cloud Labs</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

/* ─── Shared components ─── */

function TestimonialCard({ t, i }: { t: typeof TESTIMONIALS[0]; i: number }) {
  return (
    <motion.div
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{ background: '#141417', border: '1px solid #2A2A2E' }}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.1 }}
    >
      <div className="flex items-center gap-2.5">
        <img
          src={t.avatar}
          alt={t.name}
          className="w-10 h-10 rounded-full object-cover shrink-0"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
        <div>
          <p className="text-white font-semibold text-sm" style={{ fontFamily: INTER }}>{t.name}</p>
          <p className="text-[#8B8B90] text-xs" style={{ fontFamily: INTER }}>{t.location}</p>
        </div>
      </div>
      <p className="text-[#ADADB0] text-sm leading-relaxed" style={{ fontFamily: INTER }}>{t.quote}</p>
    </motion.div>
  )
}

function MobileFooter() {
  return (
    <footer style={{ background: '#080808' }}>
      <div style={{ height: 1, background: '#1F1F23' }} />
      <div className="flex flex-col gap-6 px-6 py-8 pb-10">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <LogoMark size={28} small />
            <span className="text-white font-bold text-base" style={{ fontFamily: INTER }}>chaptr</span>
          </div>
          <p className="text-[#6B6B70] text-sm" style={{ fontFamily: INTER }}>Your face. Your story.</p>
        </div>
        <div className="flex items-center justify-between">
          {['About', 'Privacy', 'Terms', 'Contact'].map((l) => (
            <span key={l} className="text-[#ADADB0] text-sm font-medium" style={{ fontFamily: INTER }}>{l}</span>
          ))}
        </div>
        <div className="flex items-center gap-4">
          {['IG', 'YT', 'X'].map((s) => (
            <div key={s} className="w-9 h-9 rounded-xl flex items-center justify-center text-[#ADADB0] text-xs font-semibold" style={{ background: '#141417', border: '1px solid #2A2A2E' }}>{s}</div>
          ))}
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-[#4A4A4E] text-xs" style={{ fontFamily: INTER }}>© 2026 Chaptr. All rights reserved.</p>
          <p className="text-[#4A4A4E] text-xs" style={{ fontFamily: INTER }}>Made by Cloud Labs</p>
        </div>
      </div>
    </footer>
  )
}

function LogoMark({ size, small }: { size: number; small?: boolean }) {
  return (
    <div
      className="flex items-center justify-center shrink-0 relative"
      style={{
        width: size, height: size,
        borderRadius: size * 0.24,
        background: small
          ? 'linear-gradient(135deg, #E879F9 0%, #7C3AED 100%)'
          : 'linear-gradient(225deg, #E05263 0%, #D4799A 100%)',
      }}
    >
      <span className="text-white font-bold" style={{ fontSize: size * 0.5, fontFamily: SG }}>C</span>
      {!small && (
        <div className="absolute bg-white rounded-full" style={{ width: size * 0.18, height: size * 0.18, right: size * 0.06, bottom: size * 0.06 }} />
      )}
    </div>
  )
}
