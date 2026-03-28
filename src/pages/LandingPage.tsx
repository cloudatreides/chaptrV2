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

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="bg-bg" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>

      {/* ─── MOBILE ─── */}
      <div className="md:hidden">

        {/* ── Hero ── */}
        <div className="relative h-screen flex flex-col overflow-hidden">
          {/* BG image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: 'url(/hero-landing.jpeg)' }}
          />
          {/* Top fade */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(13,11,18,0.6) 0%, rgba(13,11,18,0) 30%)' }} />
          {/* Bottom gradient */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, rgba(13,11,18,0) 0%, rgba(13,11,18,1) 55%, rgba(13,11,18,1) 100%)' }}
          />

          {/* Logo */}
          <div className="relative z-10 flex items-center gap-2 px-6 pt-10">
            <Logo size={34} />
            <span className="text-white font-medium text-lg tracking-wide">chaptr</span>
          </div>

          {/* Hero text + CTA pushed to bottom */}
          <div className="relative z-10 mt-auto px-6 pb-10 flex flex-col gap-4">
            <motion.div className="flex flex-col gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <p className="text-accent font-semibold text-xs tracking-[2px] uppercase">AI · INTERACTIVE · PERSONALIZED</p>
              <h1
                className="text-white font-bold leading-none"
                style={{ fontSize: 48, letterSpacing: -1, lineHeight: 0.95, fontFamily: 'Space Grotesk, Inter, sans-serif' }}
              >
                Your face.<br />Your story.
              </h1>
              <p className="text-[#B0A8BF] text-sm leading-relaxed" style={{ maxWidth: 300 }}>
                Step inside the story. AI generates a world where you're the main character.
              </p>
            </motion.div>

            <motion.button
              className="btn-accent flex items-center justify-center gap-2"
              onClick={() => navigate('/upload')}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              whileTap={{ scale: 0.97 }}
            >
              Start Your Story <ArrowRight size={18} />
            </motion.button>

            <motion.div
              className="flex items-center justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span className="text-[#6B6275] text-xs">96.7K stories started this week</span>
            </motion.div>
          </div>
        </div>

        {/* ── How It Works ── */}
        <HowItWorksSection onCta={() => navigate('/upload')} />

        {/* ── Testimonials ── */}
        <TestimonialsSection />

        {/* ── Footer ── */}
        <FooterSection />
      </div>

      {/* ─── DESKTOP ─── */}
      <div className="hidden md:block">

        {/* ── Hero ── */}
        <div className="relative min-h-screen flex flex-col">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: 'url(/hero-landing.jpeg)' }}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(13,11,18,0.5) 0%, rgba(13,11,18,0.75) 60%, rgba(13,11,18,1) 100%)' }} />

          <div className="relative z-10 page-container mx-auto w-full px-10">
            {/* Nav */}
            <nav className="flex items-center justify-between pt-8 pb-4">
              <div className="flex items-center gap-2">
                <Logo size={36} />
                <span className="text-white font-semibold text-lg tracking-wide">chaptr</span>
              </div>
              <button
                onClick={() => navigate('/upload')}
                className="px-5 py-2.5 rounded-2xl text-sm font-bold text-white transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(90deg, #D4799A 0%, #9B7EC8 100%)' }}
              >
                Start Your Story
              </button>
            </nav>

            {/* Hero content */}
            <div className="flex items-end gap-16 pt-28 pb-32">
              <div className="flex-1 max-w-lg flex flex-col gap-5">
                <motion.p className="text-accent font-semibold text-xs tracking-[2px] uppercase" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                  AI · INTERACTIVE · PERSONALIZED
                </motion.p>
                <motion.h1
                  className="text-white font-bold leading-none"
                  style={{ fontSize: 'clamp(3rem, 5vw, 5rem)', letterSpacing: -2, lineHeight: 0.95, fontFamily: 'Space Grotesk, Inter, sans-serif' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Your face.<br />Your story.
                </motion.h1>
                <motion.p className="text-[#B0A8BF] text-base leading-relaxed max-w-sm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  Step inside the story. AI generates a world where you're the main character.
                </motion.p>
                <motion.div className="flex flex-col gap-3 max-w-xs" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                  <button
                    className="btn-accent flex items-center justify-center gap-2"
                    onClick={() => navigate('/upload')}
                  >
                    Start Your Story <ArrowRight size={18} />
                  </button>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    <span className="text-[#6B6275] text-xs">96.7K stories started this week</span>
                  </div>
                </motion.div>
              </div>

              {/* Story preview card */}
              <motion.div
                className="w-72 shrink-0 rounded-2xl overflow-hidden border border-border shadow-2xl"
                style={{ background: '#141417' }}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 }}
              >
                <div className="h-40 bg-cover bg-center" style={{ backgroundImage: 'url(/scene-elevator.jpg)', backgroundColor: '#1a1525' }} />
                <div className="p-4 flex flex-col gap-3">
                  <p className="text-textMuted text-xs uppercase tracking-widest">Chapter 1 — First Day</p>
                  <p className="text-textPrimary text-sm leading-relaxed">The elevator doors slide open. Standing in front of you is Lee Junho...</p>
                  <div className="flex flex-col gap-2">
                    {['Say hello first', "Pretend you don't recognize him"].map((c) => (
                      <div key={c} className="choice-btn text-xs py-2.5">
                        <span>{c}</span>
                        <ArrowRight size={12} className="text-textMuted" />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* ── How It Works ── */}
        <HowItWorksSection onCta={() => navigate('/upload')} desktop />

        {/* ── Testimonials ── */}
        <TestimonialsSection desktop />

        {/* ── Footer ── */}
        <FooterSection desktop />
      </div>
    </div>
  )
}

/* ─── Shared Sections ─── */

function HowItWorksSection({ desktop }: { onCta?: () => void; desktop?: boolean }) {
  return (
    <section style={{ background: '#0D0D10' }} className={desktop ? 'py-24' : 'py-10'}>
      <div className={`${desktop ? 'page-container mx-auto px-10' : 'px-5'}`}>
        {/* Header */}
        <div className={`flex flex-col ${desktop ? 'items-center text-center mb-14' : 'items-center text-center mb-6'} gap-3`}>
          <span
            className="text-[#E879F9] font-semibold text-xs tracking-[1.5px] uppercase px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(232,121,249,0.094)' }}
          >
            HOW IT WORKS
          </span>
          <h2
            className="text-white font-bold leading-tight"
            style={{ fontSize: desktop ? 40 : 28, letterSpacing: -0.5, fontFamily: 'Instrument Serif, Georgia, serif', lineHeight: 1.2 }}
          >
            Three steps into your story
          </h2>
        </div>

        {/* Step cards */}
        <div className={`flex flex-col gap-4 ${desktop ? 'max-w-2xl mx-auto' : ''}`}>
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              className="rounded-2xl overflow-hidden"
              style={{ background: '#141417', border: '1px solid #2A2A2E' }}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              {/* Step image */}
              <div
                className="h-40 bg-cover bg-center w-full"
                style={{ backgroundImage: `url(${step.img})`, backgroundColor: '#1a1525' }}
              />
              {/* Step content */}
              <div className="flex flex-col gap-1.5 p-4 pb-5">
                <span
                  className="text-white font-bold text-xs tracking-[0.5px] px-2.5 py-1 rounded-full self-start"
                  style={{ background: 'linear-gradient(90deg, #E879F9 0%, #A855F7 100%)' }}
                >
                  {step.num}
                </span>
                <p className="text-white font-bold text-base mt-1">{step.title}</p>
                <p className="text-[#8B8B90] text-xs leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TestimonialsSection({ desktop }: { desktop?: boolean }) {
  return (
    <section style={{ background: '#0D0D10' }} className={desktop ? 'py-24' : 'pt-2 pb-4'}>
      {/* Header */}
      <div className={`flex flex-col gap-2 ${desktop ? 'page-container mx-auto px-10 items-center text-center mb-12' : 'px-6 pt-10 pb-8'}`}>
        <p className="text-[#E879F9] font-semibold text-xs tracking-[2px] uppercase">WHAT READERS SAY</p>
        <h2
          className="text-white font-semibold leading-tight"
          style={{ fontSize: desktop ? 36 : 26, lineHeight: 1.2, fontFamily: 'Didact Gothic, Inter, sans-serif' }}
        >
          Stories that stay with you
        </h2>
        <p className="text-[#ADADB0] text-sm leading-relaxed" style={{ maxWidth: 420 }}>
          Real readers. Real adventures. Unforgettable characters — all with their face in the story.
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <Users size={13} className="text-[#E879F9]" />
          <span className="text-[#6B6B70] text-xs font-medium">50,000+ readers love their story</span>
        </div>
      </div>

      {/* Cards */}
      <div className={`flex flex-col gap-3 ${desktop ? 'page-container mx-auto px-10 max-w-2xl' : 'px-4 pb-10'}`}>
        {TESTIMONIALS.map((t, i) => (
          <motion.div
            key={t.name}
            className="rounded-2xl p-5 flex flex-col gap-3"
            style={{ background: '#141417', border: '1px solid #2A2A2E' }}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            {/* Top row */}
            <div className="flex items-center gap-2.5">
              <img
                src={t.avatar}
                alt={t.name}
                className="w-10 h-10 rounded-full object-cover shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
              <div>
                <p className="text-white font-semibold text-sm">{t.name}</p>
                <p className="text-[#8B8B90] text-xs">{t.location}</p>
              </div>
            </div>
            {/* Quote */}
            <p className="text-[#ADADB0] text-sm leading-relaxed">{t.quote}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function FooterSection({ desktop }: { desktop?: boolean }) {
  return (
    <footer style={{ background: '#080808' }}>
      <div style={{ height: 1, background: '#1F1F23' }} />
      <div className={`flex flex-col gap-6 ${desktop ? 'page-container mx-auto px-10 py-12' : 'px-6 py-8 pb-10'}`}>
        {/* Brand */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Logo size={28} small />
            <span className="text-white font-bold text-base tracking-[0.5px]">chaptr</span>
          </div>
          <p className="text-[#6B6B70] text-sm">Your face. Your story.</p>
        </div>

        {/* Links */}
        <div className="flex items-center justify-between">
          {['About', 'Privacy', 'Terms', 'Contact'].map((l) => (
            <span key={l} className="text-[#ADADB0] text-sm font-medium cursor-pointer hover:text-white transition-colors">{l}</span>
          ))}
        </div>

        {/* Socials */}
        <div className="flex items-center gap-4">
          {['IG', 'TT', 'TW'].map((s) => (
            <div
              key={s}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[#ADADB0] text-xs font-semibold cursor-pointer hover:text-white transition-colors"
              style={{ background: '#141417', border: '1px solid #2A2A2E' }}
            >
              {s}
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="flex flex-col gap-1">
          <p className="text-[#4A4A4E] text-xs">© 2025 Chaptr. All rights reserved.</p>
          <p className="text-[#4A4A4E] text-xs">Made with AI · Stories powered by imagination</p>
        </div>
      </div>
    </footer>
  )
}

function Logo({ size, small }: { size: number; small?: boolean }) {
  return (
    <div
      className="flex items-center justify-center rounded-lg shrink-0 relative"
      style={{
        width: size,
        height: size,
        background: small
          ? 'linear-gradient(135deg, #E879F9 0%, #7C3AED 100%)'
          : 'linear-gradient(135deg, #E05263 0%, #D4799A 100%)',
        borderRadius: size * 0.24,
      }}
    >
      <span className="text-white font-bold" style={{ fontSize: size * 0.45 }}>C</span>
      {!small && (
        <div
          className="absolute bg-white rounded-full"
          style={{ width: size * 0.18, height: size * 0.18, right: size * 0.06, bottom: size * 0.06 }}
        />
      )}
    </div>
  )
}
