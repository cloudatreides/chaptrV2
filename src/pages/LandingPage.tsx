import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, BookOpen, Sparkles, Star } from 'lucide-react'

const STEPS = [
  {
    num: '01',
    title: 'Upload your selfie',
    desc: 'Snap a photo and our AI transforms you into the main character — drawn into the story, literally.',
    img: '/step1-upload.jpeg',
  },
  {
    num: '02',
    title: 'Choose your world',
    desc: 'K-pop romance, noir mystery, cosmic horror — pick a universe and step through the door.',
    img: '/step2-world.jpeg',
  },
  {
    num: '03',
    title: 'Live the story',
    desc: 'Your choices shape every chapter. Talk to characters. Fall in love. Change the ending.',
    img: '/step3-story.jpeg',
  },
]

const TESTIMONIALS = [
  {
    name: 'Sarah K.',
    location: 'Seoul',
    avatar: 'https://images.unsplash.com/photo-1761118473125-861a23f326f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
    quote: 'I became the detective in my own noir thriller. I couldn\'t stop reading — my friends thought I was obsessed.',
    stars: 5,
  },
  {
    name: 'Marcus T.',
    location: 'New York',
    avatar: 'https://images.unsplash.com/photo-1632541400823-2a905979469a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
    quote: 'Seeing my actual face inside a fantasy world felt surreal. I\'ve started three different story worlds already.',
    stars: 5,
  },
  {
    name: 'Yuki M.',
    location: 'Tokyo',
    avatar: 'https://images.unsplash.com/photo-1735025679651-369bc9f071ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200',
    quote: 'Each story felt tailor-made. Like the AI actually knows me. Chaptr is the only app I open every morning.',
    stars: 5,
  },
]

const SERIF = "'Playfair Display', Georgia, serif"
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
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: 'url(/hero-landing.jpeg)', imageRendering: 'auto' }}
          />
          {/* Top vignette */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(13,11,18,0.6) 0%, rgba(13,11,18,0) 20%)' }} />
          {/* Bottom book-page fade */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(13,11,18,0) 0%, rgba(13,11,18,0) 50%, rgba(13,11,18,0.92) 70%, rgba(13,11,18,1) 85%)' }} />

          {/* Logo */}
          <div className="relative z-10 flex items-center gap-2 px-6 pt-10">
            <LogoMark size={34} />
            <span className="text-white font-medium text-lg" style={{ fontFamily: SG }}>chaptr</span>
          </div>

          {/* Hero text pinned to bottom */}
          <div className="relative z-10 mt-auto px-6 pb-10 flex flex-col gap-5">
            <motion.div className="flex flex-col gap-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="flex items-center gap-2">
                <BookOpen size={14} className="text-accent" />
                <p className="text-accent/80 font-medium text-xs tracking-[2px] uppercase" style={{ fontFamily: SG }}>Chapter One Begins</p>
              </div>
              <h1 className="text-white font-bold" style={{ fontSize: 44, letterSpacing: -1, lineHeight: 1, fontFamily: SERIF }}>
                Your face.<br />Your story.
              </h1>
              <p className="text-white/60 text-sm leading-relaxed" style={{ maxWidth: 300, fontFamily: INTER }}>
                Upload a selfie. Choose a world. Step inside an AI-generated story where you are the main character.
              </p>
            </motion.div>

            <motion.button
              className="btn-accent flex items-center justify-center gap-2"
              style={{ fontFamily: SG }}
              onClick={() => navigate('/universes')}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              whileTap={{ scale: 0.97 }}
            >
              Start Your Story <ArrowRight size={18} />
            </motion.button>

            <motion.div className="flex items-center justify-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              <div className="flex -space-x-1.5">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-5 h-5 rounded-full border-2 border-bg" style={{ background: ['#c84b9e', '#8b5cf6', '#a78bfa'][i] }} />
                ))}
              </div>
              <span className="text-white/30 text-xs" style={{ fontFamily: INTER }}>96.7K stories started this week</span>
            </motion.div>
          </div>
        </div>

        {/* Mobile — How It Works */}
        <section className="py-12 px-5 flex flex-col gap-8" style={{ background: '#0A090F' }}>
          <div className="flex flex-col items-center text-center gap-2">
            <span className="text-accent/70 font-semibold text-[10px] tracking-[2px] uppercase" style={{ fontFamily: INTER }}>
              HOW IT WORKS
            </span>
            <h2 className="text-white font-bold" style={{ fontSize: 28, letterSpacing: -0.5, fontFamily: SERIF, lineHeight: 1.2 }}>
              Three steps into<br />your story
            </h2>
          </div>
          <div className="flex flex-col gap-4">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                className="rounded-2xl overflow-hidden"
                style={{ background: '#111016', border: '1px solid rgba(42,32,64,0.5)' }}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="relative h-40 bg-cover bg-center w-full" style={{ backgroundImage: `url(${step.img})`, backgroundColor: '#1a1525' }}>
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(17,16,22,0) 50%, rgba(17,16,22,0.8) 100%)' }} />
                  <div className="absolute bottom-3 left-3">
                    <span
                      className="text-white/90 font-bold text-[10px] tracking-[1px] px-2 py-1 rounded-md"
                      style={{ background: 'rgba(200,75,158,0.6)', backdropFilter: 'blur(8px)' }}
                    >
                      {step.num}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 p-4 pb-5">
                  <p className="text-white font-semibold text-[15px]" style={{ fontFamily: INTER }}>{step.title}</p>
                  <p className="text-white/40 text-xs leading-relaxed" style={{ fontFamily: INTER }}>{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Mobile — Testimonials */}
        <section style={{ background: '#0A090F' }} className="pb-4">
          <div className="flex flex-col gap-2 px-6 pt-10 pb-6">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={12} className="text-accent/60" />
              <p className="text-accent/60 font-semibold text-[10px] tracking-[2px] uppercase" style={{ fontFamily: INTER }}>WHAT READERS SAY</p>
            </div>
            <h2 className="text-white font-bold" style={{ fontSize: 26, lineHeight: 1.2, fontFamily: SERIF }}>
              Stories that stay<br />with you
            </h2>
            <p className="text-white/40 text-sm leading-relaxed" style={{ fontFamily: INTER }}>
              Real readers. Real adventures. All with their face in the story.
            </p>
          </div>
          <div className="flex flex-col gap-3 px-4 pb-10">
            {TESTIMONIALS.map((t, i) => (
              <TestimonialCard key={t.name} t={t} i={i} />
            ))}
          </div>
        </section>

        {/* Mobile — Final CTA */}
        <section className="px-5 py-14 flex flex-col items-center text-center gap-5" style={{ background: '#0A090F' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(200,75,158,0.15) 0%, rgba(139,92,246,0.15) 100%)', border: '1px solid rgba(200,75,158,0.2)' }}>
            <BookOpen size={28} className="text-accent" />
          </div>
          <h3 className="text-white font-bold text-xl" style={{ fontFamily: SERIF }}>Your story is waiting</h3>
          <p className="text-white/40 text-sm" style={{ fontFamily: INTER, maxWidth: 280 }}>One selfie. One choice. A story that's entirely yours.</p>
          <button
            className="btn-accent flex items-center justify-center gap-2 max-w-xs"
            style={{ fontFamily: SG }}
            onClick={() => navigate('/universes')}
          >
            Begin Now <ArrowRight size={18} />
          </button>
        </section>

        <MobileFooter />
      </div>

      {/* ══════════════════════
          DESKTOP
      ══════════════════════ */}
      <div className="hidden md:block">

        {/* ── Desktop Hero ── */}
        <div className="relative" style={{ height: 720 }}>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url(/hero-desktop.png)',
              imageRendering: 'auto',
            }}
          />
          {/* Layered scrims for depth */}
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 55%, rgba(13,11,18,0.55) 0%, rgba(13,11,18,0) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(13,11,18,0.8) 0%, rgba(13,11,18,0) 15%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(0deg, #0A090F 0%, rgba(10,9,15,0) 30%)' }} />

          <div className="relative z-10 page-container mx-auto">
            {/* Nav */}
            <nav className="flex items-center justify-between px-8 lg:px-16 pt-7">
              <div className="flex items-center gap-2.5">
                <LogoMark size={34} />
                <span className="text-white font-medium text-lg" style={{ fontFamily: SG }}>chaptr</span>
              </div>
              <div className="flex items-center gap-8">
                {[
                  { label: 'How It Works', id: 'how-it-works' },
                  { label: 'Testimonials', id: 'testimonials' },
                ].map(({ label, id }) => (
                  <span
                    key={label}
                    className="text-white/50 text-sm font-medium cursor-pointer hover:text-white transition-colors"
                    style={{ fontFamily: SG }}
                    onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}
                  >{label}</span>
                ))}
                <button
                  className="text-white text-sm font-semibold px-5 py-2 rounded-lg transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #c84b9e 0%, #8b5cf6 100%)' }}
                  onClick={() => navigate('/universes')}
                >
                  Start Reading
                </button>
              </div>
            </nav>

            {/* Hero content */}
            <div className="flex flex-col items-center text-center gap-6 px-16 max-w-3xl mx-auto" style={{ paddingTop: 150 }}>
              <motion.div
                className="flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                <BookOpen size={14} className="text-accent/70" />
                <p className="text-accent/70 font-medium text-xs tracking-[3px] uppercase" style={{ fontFamily: SG }}>Chapter One Begins</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <h1
                  className="text-white font-bold"
                  style={{
                    fontSize: 72,
                    letterSpacing: -2,
                    lineHeight: 1.05,
                    fontFamily: SERIF,
                    textShadow: '0 4px 40px rgba(0,0,0,0.5)',
                  }}
                >
                  Your face.<br />Your story.
                </h1>
              </motion.div>

              <motion.p
                className="text-white/60 text-lg leading-relaxed"
                style={{ maxWidth: 480, fontFamily: INTER, textShadow: '0 1px 12px rgba(0,0,0,0.9)' }}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              >
                Upload a selfie. Choose a world. Step inside an AI-powered story where you are the main character.
              </motion.p>

              <motion.div className="flex flex-col items-center gap-4 mt-2" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                <button
                  className="flex items-center justify-center gap-2.5 text-white font-semibold text-base transition-all hover:scale-[1.02] hover:shadow-lg"
                  style={{ height: 54, paddingLeft: 36, paddingRight: 36, borderRadius: 14, background: 'linear-gradient(135deg, #c84b9e 0%, #8b5cf6 100%)', fontFamily: SG }}
                  onClick={() => navigate('/universes')}
                >
                  Start Your Story <ArrowRight size={18} />
                </button>
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-1.5">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="w-5 h-5 rounded-full border-2 border-bg" style={{ background: ['#c84b9e', '#8b5cf6', '#a78bfa'][i] }} />
                    ))}
                  </div>
                  <span className="text-white/30 text-sm" style={{ fontFamily: INTER }}>96.7K stories started this week</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* ── Desktop How It Works ── */}
        <section id="how-it-works" className="py-28" style={{ background: '#0A090F' }}>
          <div className="page-container mx-auto px-8 lg:px-20">
            <div className="flex flex-col items-center text-center gap-3 mb-16">
              <span className="text-accent/60 font-semibold text-[10px] tracking-[2px] uppercase" style={{ fontFamily: INTER }}>
                HOW IT WORKS
              </span>
              <h2 className="text-white font-bold" style={{ fontSize: 44, letterSpacing: -1, fontFamily: SERIF }}>
                Three steps into your story
              </h2>
              <p className="text-white/35 text-base" style={{ fontFamily: INTER, maxWidth: 440 }}>
                From selfie to story in under a minute. Every detail shaped by your choices.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.num}
                  className="rounded-2xl overflow-hidden flex flex-col group"
                  style={{ background: '#111016', border: '1px solid rgba(42,32,64,0.4)' }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                >
                  <div className="relative w-full bg-cover bg-center overflow-hidden" style={{ height: 220, backgroundImage: `url(${step.img})`, backgroundColor: '#1a1525' }}>
                    <div className="absolute inset-0 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(17,16,22,0) 50%, rgba(17,16,22,0.7) 100%)' }} />
                    <div className="absolute bottom-3 left-4">
                      <span
                        className="text-white/90 font-bold text-xs tracking-[1px] px-2.5 py-1 rounded-md"
                        style={{ background: 'rgba(200,75,158,0.5)', backdropFilter: 'blur(8px)' }}
                      >
                        {step.num}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 p-5 pb-6">
                    <p className="text-white font-semibold text-lg" style={{ fontFamily: INTER }}>{step.title}</p>
                    <p className="text-white/35 text-sm leading-relaxed" style={{ fontFamily: INTER }}>{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Desktop Testimonials ── */}
        <section id="testimonials" className="pb-28" style={{ background: '#0A090F' }}>
          <div className="page-container mx-auto px-8 lg:px-20">
            {/* Divider */}
            <div className="h-px mb-24 mx-auto" style={{ background: 'linear-gradient(90deg, transparent, rgba(200,75,158,0.2), transparent)', maxWidth: 600 }} />

            <div className="flex flex-col items-center text-center gap-3 mb-14">
              <div className="flex items-center gap-2">
                <Sparkles size={12} className="text-accent/50" />
                <p className="text-accent/50 font-semibold text-[10px] tracking-[2px] uppercase" style={{ fontFamily: INTER }}>WHAT READERS SAY</p>
              </div>
              <h2 className="text-white font-bold" style={{ fontSize: 40, lineHeight: 1.2, fontFamily: SERIF }}>
                Stories that stay with you
              </h2>
              <p className="text-white/35 text-base" style={{ maxWidth: 480, fontFamily: INTER }}>
                Real readers. Real adventures. Unforgettable characters — all with their face in the story.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-5">
              {TESTIMONIALS.map((t, i) => (
                <TestimonialCard key={t.name} t={t} i={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Desktop Final CTA ── */}
        <section className="py-24" style={{ background: '#0A090F' }}>
          <div className="page-container mx-auto px-20">
            <motion.div
              className="rounded-3xl px-12 py-16 flex flex-col items-center text-center gap-6 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(200,75,158,0.08) 0%, rgba(139,92,246,0.08) 100%)', border: '1px solid rgba(200,75,158,0.15)' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(200,75,158,0.12)', border: '1px solid rgba(200,75,158,0.2)' }}>
                <BookOpen size={28} className="text-accent" />
              </div>
              <h3 className="text-white font-bold text-3xl" style={{ fontFamily: SERIF }}>Your story is waiting</h3>
              <p className="text-white/40 text-base" style={{ fontFamily: INTER, maxWidth: 400 }}>
                One selfie. One choice. A story that's entirely yours.
              </p>
              <button
                className="flex items-center justify-center gap-2.5 text-white font-semibold text-base transition-all hover:scale-[1.02]"
                style={{ height: 54, paddingLeft: 36, paddingRight: 36, borderRadius: 14, background: 'linear-gradient(135deg, #c84b9e 0%, #8b5cf6 100%)', fontFamily: SG }}
                onClick={() => navigate('/universes')}
              >
                Begin Now <ArrowRight size={18} />
              </button>
            </motion.div>
          </div>
        </section>

        {/* ── Desktop Footer ── */}
        <footer style={{ background: '#07060B', borderTop: '1px solid rgba(42,32,64,0.3)' }}>
          <div className="page-container mx-auto px-8 lg:px-20 py-10">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <LogoMark size={28} small />
                  <span className="text-white font-bold text-base" style={{ fontFamily: INTER }}>chaptr</span>
                </div>
                <p className="text-white/25 text-sm" style={{ fontFamily: INTER }}>Your face. Your story.</p>
              </div>

              <div className="flex items-center gap-8">
                {['About', 'Privacy', 'Terms', 'Contact'].map((l) => (
                  <span key={l} className="text-white/40 text-sm font-medium cursor-pointer hover:text-white transition-colors" style={{ fontFamily: INTER }}>{l}</span>
                ))}
              </div>

              <div className="flex items-center gap-3">
                {[
                  { icon: <span className="text-xs font-bold">IG</span>, label: 'IG' },
                  { icon: <span className="text-xs font-bold">YT</span>, label: 'YT' },
                  { icon: <span className="text-xs font-bold">&times;</span>, label: 'X' },
                ].map(({ icon, label }) => (
                  <div key={label} className="w-9 h-9 rounded-xl flex items-center justify-center text-white/40 cursor-pointer hover:text-white transition-colors" style={{ background: 'rgba(42,32,64,0.3)', border: '1px solid rgba(42,32,64,0.4)' }}>
                    {icon}
                  </div>
                ))}
              </div>
            </div>

            <div className="h-px mt-8 mb-6" style={{ background: 'rgba(42,32,64,0.3)' }} />
            <div className="flex items-center justify-between">
              <p className="text-white/15 text-xs" style={{ fontFamily: INTER }}>2026 Chaptr. All rights reserved.</p>
              <p className="text-white/15 text-xs" style={{ fontFamily: INTER }}>Made by Cloud Labs</p>
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
      style={{ background: '#111016', border: '1px solid rgba(42,32,64,0.4)' }}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.1 }}
    >
      <div className="flex gap-0.5 mb-1">
        {[...Array(t.stars)].map((_, j) => (
          <Star key={j} size={12} className="text-accent fill-accent" />
        ))}
      </div>
      <p className="text-white/50 text-sm leading-relaxed italic" style={{ fontFamily: INTER }}>"{t.quote}"</p>
      <div className="flex items-center gap-2.5 mt-auto pt-2">
        <img
          src={t.avatar}
          alt={t.name}
          className="w-8 h-8 rounded-full object-cover shrink-0"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
        <div>
          <p className="text-white/70 font-medium text-xs" style={{ fontFamily: INTER }}>{t.name}</p>
          <p className="text-white/25 text-[10px]" style={{ fontFamily: INTER }}>{t.location}</p>
        </div>
      </div>
    </motion.div>
  )
}

function MobileFooter() {
  return (
    <footer style={{ background: '#07060B' }}>
      <div className="h-px" style={{ background: 'rgba(42,32,64,0.3)' }} />
      <div className="flex flex-col gap-6 px-6 py-8 pb-10">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <LogoMark size={28} small />
            <span className="text-white font-bold text-base" style={{ fontFamily: INTER }}>chaptr</span>
          </div>
          <p className="text-white/25 text-sm" style={{ fontFamily: INTER }}>Your face. Your story.</p>
        </div>
        <div className="flex items-center justify-between">
          {['About', 'Privacy', 'Terms', 'Contact'].map((l) => (
            <span key={l} className="text-white/40 text-sm font-medium" style={{ fontFamily: INTER }}>{l}</span>
          ))}
        </div>
        <div className="flex items-center gap-4">
          {['IG', 'YT', 'X'].map((s) => (
            <div key={s} className="w-9 h-9 rounded-xl flex items-center justify-center text-white/40 text-xs font-semibold" style={{ background: 'rgba(42,32,64,0.3)', border: '1px solid rgba(42,32,64,0.4)' }}>{s}</div>
          ))}
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-white/15 text-xs" style={{ fontFamily: INTER }}>2026 Chaptr. All rights reserved.</p>
          <p className="text-white/15 text-xs" style={{ fontFamily: INTER }}>Made by Cloud Labs</p>
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
          ? 'linear-gradient(135deg, #c84b9e 0%, #8b5cf6 100%)'
          : 'linear-gradient(225deg, #c84b9e 0%, #8b5cf6 100%)',
      }}
    >
      <span className="text-white font-bold" style={{ fontSize: size * 0.5, fontFamily: SG }}>C</span>
      {!small && (
        <div className="absolute bg-white rounded-full" style={{ width: size * 0.18, height: size * 0.18, right: size * 0.06, bottom: size * 0.06, opacity: 0.9 }} />
      )}
    </div>
  )
}
