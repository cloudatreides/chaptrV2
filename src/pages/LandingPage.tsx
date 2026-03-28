import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Users } from 'lucide-react'

const MOBILE_STEPS = [
  {
    num: 'Step 1',
    title: 'Upload your selfie',
    desc: 'Snap a photo and our AI places your face into the story — you become the main character.',
    img: '/step1-upload.jpeg',
  },
  {
    num: 'Step 2',
    title: 'Choose your world',
    desc: "Your AI story unfolds chapter by chapter — you're the hero, making choices that shape the plot.",
    img: '/step2-world.jpeg',
  },
  {
    num: 'Step 3',
    title: 'Step inside the story',
    desc: "Your AI story unfolds chapter by chapter — you're the hero, making choices that shape the plot.",
    img: '/step3-story.jpeg',
  },
]

const DESKTOP_STEPS = [
  {
    chapter: 'Chapter I',
    title: 'Upload your photo',
    desc: 'Your face becomes the protagonist. Private — never stored beyond your session.',
  },
  {
    chapter: 'Chapter II',
    title: 'Choose your world',
    desc: 'K-pop romance, mystery, horror. Pick a world and step inside it.',
  },
  {
    chapter: 'Chapter III',
    title: 'Live inside the story',
    desc: 'Every choice shapes the narrative. AI writes prose that remembers who you are.',
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
    <div className="bg-bg">

      {/* ═══════════════════════════════
          MOBILE  (< md)
      ═══════════════════════════════ */}
      <div className="md:hidden">

        {/* Hero */}
        <div className="relative h-screen flex flex-col overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/hero-landing.jpeg)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(13,11,18,0.6) 0%, rgba(13,11,18,0) 30%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(13,11,18,0) 0%, rgba(13,11,18,1) 55%, rgba(13,11,18,1) 100%)' }} />

          <div className="relative z-10 flex items-center gap-2 px-6 pt-10">
            <LogoMark size={34} />
            <span className="text-white font-medium text-lg" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>chaptr</span>
          </div>

          <div className="relative z-10 mt-auto px-6 pb-10 flex flex-col gap-4">
            <motion.div className="flex flex-col gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <p className="text-accent font-semibold text-xs tracking-[2px] uppercase" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>AI · INTERACTIVE · PERSONALIZED</p>
              <h1 className="text-white font-bold leading-none" style={{ fontSize: 48, letterSpacing: -1, lineHeight: 0.95, fontFamily: 'Space Grotesk, sans-serif' }}>
                Your face.<br />Your story.
              </h1>
              <p className="text-[#B0A8BF] text-sm leading-relaxed" style={{ maxWidth: 300, fontFamily: 'Space Grotesk, sans-serif' }}>
                Step inside the story. AI generates a world where you're the main character.
              </p>
            </motion.div>

            <motion.button
              className="btn-accent flex items-center justify-center gap-2"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
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
              <span className="text-[#6B6275] text-xs" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>96.7K stories started this week</span>
            </motion.div>
          </div>
        </div>

        {/* Mobile — How It Works */}
        <section style={{ background: '#0D0D10' }} className="py-10 px-5 flex flex-col gap-6">
          <div className="flex flex-col items-center text-center gap-3">
            <span className="text-[#E879F9] font-semibold text-xs tracking-[1.5px] uppercase px-3 py-1.5 rounded-full" style={{ background: 'rgba(232,121,249,0.094)', fontFamily: 'Inter, sans-serif' }}>
              HOW IT WORKS
            </span>
            <h2 className="text-white font-bold leading-tight" style={{ fontSize: 28, letterSpacing: -0.5, fontFamily: 'Instrument Serif, Georgia, serif', lineHeight: 1.2 }}>
              Three steps into your story
            </h2>
          </div>
          <div className="flex flex-col gap-4">
            {MOBILE_STEPS.map((step, i) => (
              <motion.div key={step.num} className="rounded-2xl overflow-hidden" style={{ background: '#141417', border: '1px solid #2A2A2E' }}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="h-40 bg-cover bg-center w-full" style={{ backgroundImage: `url(${step.img})`, backgroundColor: '#1a1525' }} />
                <div className="flex flex-col gap-1.5 p-4 pb-5">
                  <span className="text-white font-bold text-xs tracking-[0.5px] px-2.5 py-1 rounded-full self-start" style={{ background: 'linear-gradient(90deg, #E879F9 0%, #A855F7 100%)', fontFamily: 'Inter, sans-serif' }}>
                    {step.num}
                  </span>
                  <p className="text-white font-bold text-base mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>{step.title}</p>
                  <p className="text-[#8B8B90] text-xs leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Mobile — Testimonials */}
        <section style={{ background: '#0D0D10' }} className="pt-2 pb-4">
          <div className="flex flex-col gap-2 px-6 pt-10 pb-8">
            <p className="text-[#E879F9] font-semibold text-xs tracking-[2px] uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>WHAT READERS SAY</p>
            <h2 className="text-white font-semibold leading-tight" style={{ fontSize: 26, lineHeight: 1.2, fontFamily: 'Didact Gothic, Inter, sans-serif' }}>
              Stories that stay with you
            </h2>
            <p className="text-[#ADADB0] text-sm leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
              Real readers. Real adventures. Unforgettable characters — all with their face in the story.
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <Users size={13} className="text-[#E879F9]" />
              <span className="text-[#6B6B70] text-xs font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>50,000+ readers love their story</span>
            </div>
          </div>
          <div className="flex flex-col gap-3 px-4 pb-10">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name} className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: '#141417', border: '1px solid #2A2A2E' }}
                initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="flex items-center gap-2.5">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  <div>
                    <p className="text-white font-semibold text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>{t.name}</p>
                    <p className="text-[#8B8B90] text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>{t.location}</p>
                  </div>
                </div>
                <p className="text-[#ADADB0] text-sm leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>{t.quote}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Mobile — Footer */}
        <footer style={{ background: '#080808' }}>
          <div style={{ height: 1, background: '#1F1F23' }} />
          <div className="flex flex-col gap-6 px-6 py-8 pb-10">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <LogoMark size={28} small />
                <span className="text-white font-bold text-base tracking-[0.5px]" style={{ fontFamily: 'Inter, sans-serif' }}>chaptr</span>
              </div>
              <p className="text-[#6B6B70] text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>Your face. Your story.</p>
            </div>
            <div className="flex items-center justify-between">
              {['About', 'Privacy', 'Terms', 'Contact'].map((l) => (
                <span key={l} className="text-[#ADADB0] text-sm font-medium cursor-pointer hover:text-white transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>{l}</span>
              ))}
            </div>
            <div className="flex items-center gap-4">
              {['IG', 'TT', 'TW'].map((s) => (
                <div key={s} className="w-9 h-9 rounded-xl flex items-center justify-center text-[#ADADB0] text-xs font-semibold cursor-pointer" style={{ background: '#141417', border: '1px solid #2A2A2E' }}>{s}</div>
              ))}
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[#4A4A4E] text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>© 2025 Chaptr. All rights reserved.</p>
              <p className="text-[#4A4A4E] text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>Made with AI · Stories powered by imagination</p>
            </div>
          </div>
        </footer>
      </div>

      {/* ═══════════════════════════════
          DESKTOP  (≥ md)
      ═══════════════════════════════ */}
      <div className="hidden md:block">

        {/* ── Desktop Hero ── */}
        {/* Full-page background: the actual landscape image from Pencil */}
        <div className="relative" style={{ minHeight: '100vh' }}>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/hero-desktop.jpeg)' }} />
          {/* Dark overlay — heavier at bottom so text is readable */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(13,11,18,0.55) 0%, rgba(13,11,18,0.72) 60%, rgba(13,11,18,1) 100%)' }} />

          <div className="relative z-10 page-container mx-auto">
            {/* Nav */}
            <nav className="flex items-center justify-between px-16 pt-7 pb-4">
              <div className="flex items-center gap-2.5">
                <LogoMark size={34} />
                <span className="text-white font-medium text-lg" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>chaptr</span>
              </div>
              <button
                onClick={() => navigate('/upload')}
                className="text-white/60 font-semibold text-sm hover:text-white transition-colors"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Start reading →
              </button>
            </nav>

            {/* Hero — two columns */}
            <div className="flex items-end gap-16 px-16 pt-32 pb-28">

              {/* Left: text + CTA */}
              <motion.div
                className="flex flex-col gap-7"
                style={{ width: 580 }}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <p className="text-[#D4799A] font-semibold text-xs tracking-[2px] uppercase" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  AI · INTERACTIVE · PERSONALIZED
                </p>

                <div className="flex flex-col gap-1">
                  <h1 className="text-white font-bold leading-none" style={{ fontSize: 72, letterSpacing: -2, lineHeight: 0.92, fontFamily: 'Playfair Display, Georgia, serif' }}>
                    Your face.
                  </h1>
                  <h1 className="text-white font-bold leading-none" style={{ fontSize: 72, letterSpacing: -2, lineHeight: 0.92, fontFamily: 'Playfair Display, Georgia, serif' }}>
                    Your story.
                  </h1>
                </div>

                <p className="text-[#B0A8BF] text-base leading-relaxed" style={{ maxWidth: 400, lineHeight: 1.6, fontFamily: 'Space Grotesk, sans-serif' }}>
                  Upload your photo. AI writes an interactive story where you are the protagonist — every scene, every choice, every outcome.
                </p>

                {/* Trust pills */}
                <div className="flex items-center gap-2">
                  {['No account needed', 'Free to start', 'AI-personalised'].map((p) => (
                    <span key={p} className="text-white/50 text-xs px-3.5 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.031)', border: '1px solid #2D2538', fontFamily: 'Space Grotesk, sans-serif' }}>
                      {p}
                    </span>
                  ))}
                </div>

                <button
                  className="flex items-center justify-center text-white font-bold text-base rounded-full transition-opacity hover:opacity-90"
                  style={{ width: 240, height: 56, background: 'linear-gradient(180deg, #D4799A 0%, #9B7EC8 100%)', fontFamily: 'Space Grotesk, sans-serif' }}
                  onClick={() => navigate('/upload')}
                >
                  Start Your Story
                </button>
              </motion.div>

              {/* Right: story preview card */}
              <motion.div
                style={{ width: 380 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="rounded-2xl p-6 flex flex-col gap-4" style={{ background: 'rgba(20,16,30,0.8)', border: '1px solid rgba(255,255,255,0.071)', backdropFilter: 'blur(12px)' }}>
                  {/* Chip */}
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    <span className="text-[#D4799A] text-xs font-semibold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>The Seoul Transfer · Chapter 1</span>
                  </div>
                  {/* Story text */}
                  <p className="text-[#B0A8BF] text-sm leading-relaxed" style={{ lineHeight: 1.75, fontFamily: 'Space Grotesk, sans-serif' }}>
                    "You step through the glass doors of NOVA Entertainment and the world shifts. A tall figure leans against the far pillar, watching you with sharp, curious eyes — and he is looking directly at you."
                  </p>
                  {/* Choices */}
                  <div className="flex flex-col gap-2">
                    <div className="rounded-xl px-4 py-2.5 text-white text-sm font-medium" style={{ background: 'rgba(212,121,154,0.078)', border: '1px solid rgba(212,121,154,0.2)', fontFamily: 'Space Grotesk, sans-serif' }}>
                      Hold his gaze
                    </div>
                    <div className="rounded-xl px-4 py-2.5 text-white/50 text-sm" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.051)', fontFamily: 'Space Grotesk, sans-serif' }}>
                      Look away first
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* ── Desktop How It Works ── */}
        <section style={{ background: '#0D0B12' }} className="py-28 px-[120px]">
          <div className="page-container mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-4 mb-16">
              <p className="text-[#D4799A] font-semibold text-xs tracking-[2px] uppercase" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>THE STORY SO FAR</p>
              <h2 className="text-white font-bold" style={{ fontSize: 40, letterSpacing: -1, fontFamily: 'Playfair Display, Georgia, serif' }}>
                How the story begins
              </h2>
            </div>

            {/* 3-column grid */}
            <div className="grid grid-cols-3 gap-12">
              {DESKTOP_STEPS.map((step, i) => (
                <motion.div key={step.chapter} className="flex flex-col gap-6"
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}>
                  {/* Illustration placeholder */}
                  <div className="rounded-2xl flex items-center justify-center" style={{ height: 200, background: i === 0 ? '#14101E' : i === 1 ? '#1A1624' : '#0F0C18', border: `1px solid ${i === 0 ? '#3D2538' : '#2D2538'}` }}>
                    <div className="text-4xl opacity-30">{['📸', '🌏', '✨'][i]}</div>
                  </div>
                  {/* Text */}
                  <div className="flex flex-col gap-2">
                    <p className="font-semibold text-xs tracking-[2px] uppercase" style={{ color: 'rgba(212,121,154,0.533)', fontFamily: 'Space Grotesk, sans-serif' }}>{step.chapter}</p>
                    <h3 className="text-white font-bold text-lg" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>{step.title}</h3>
                    <p className="text-[#6B6275] text-sm leading-relaxed" style={{ lineHeight: 1.65, fontFamily: 'Space Grotesk, sans-serif' }}>{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Desktop Bottom CTA ── */}
        <section style={{ background: '#0D0B12' }} className="pb-20 px-[120px]">
          <div className="page-container mx-auto">
            <motion.div
              className="flex items-center justify-between rounded-2xl px-20 py-16"
              style={{ background: 'linear-gradient(135deg, #1A1624 0%, #241E30 100%)', border: '1px solid #2D2538' }}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            >
              <div className="flex flex-col gap-3">
                <h2 className="text-white font-bold" style={{ fontSize: 32, letterSpacing: -0.5, fontFamily: 'Playfair Display, Georgia, serif' }}>
                  Ready to open the next chapter?
                </h2>
                <p className="text-[#6B6275] text-sm" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Free to start. No account needed.</p>
              </div>
              <button
                className="shrink-0 text-white font-bold rounded-full transition-opacity hover:opacity-90"
                style={{ padding: '0 40px', height: 56, background: 'linear-gradient(180deg, #D4799A 0%, #9B7EC8 100%)', fontFamily: 'Space Grotesk, sans-serif', fontSize: 16 }}
                onClick={() => navigate('/upload')}
              >
                Start Your Story →
              </button>
            </motion.div>
          </div>
        </section>

        {/* ── Desktop Footer ── */}
        <footer style={{ background: '#0D0B12', borderTop: '1px solid #1A1624' }}>
          <div className="page-container mx-auto flex items-center justify-between px-[120px] py-5">
            <div className="flex items-center gap-2">
              <LogoMark size={22} small />
              <span className="text-[#3D3548] text-sm" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>© 2026 Chaptr</span>
            </div>
            <span className="text-[#3D3548] text-xs" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Your photo never leaves your device.</span>
          </div>
        </footer>
      </div>
    </div>
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
      <span className="text-white font-bold" style={{ fontSize: size * 0.5, fontFamily: 'Space Grotesk, sans-serif' }}>C</span>
      {!small && (
        <div className="absolute bg-white rounded-full" style={{ width: size * 0.18, height: size * 0.18, right: size * 0.06, bottom: size * 0.06 }} />
      )}
    </div>
  )
}
