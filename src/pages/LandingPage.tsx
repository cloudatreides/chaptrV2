import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, BookOpen, Sparkles, Camera, MessageCircle, GitBranch } from 'lucide-react'

const STEPS = [
  {
    num: '01',
    icon: <Camera size={20} className="text-accent" />,
    title: 'Upload your selfie',
    desc: 'AI transforms your photo into an anime character — you become the protagonist.',
    img: '/step1-upload.jpeg',
  },
  {
    num: '02',
    icon: <MessageCircle size={20} className="text-gem" />,
    title: 'Chat with characters',
    desc: 'Have real conversations with AI characters. What you say shapes their trust — and the story.',
    img: '/step2-world.jpeg',
  },
  {
    num: '03',
    icon: <GitBranch size={20} className="text-accentLight" />,
    title: 'Shape the ending',
    desc: 'Your choices create branching paths. 4 possible endings — each one uniquely yours.',
    img: '/step3-story.jpeg',
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
        <div className="relative flex flex-col overflow-hidden" style={{ minHeight: '100svh' }}>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: 'url(/hero-landing.jpeg)', imageRendering: 'auto' }}
          />
          {/* Top vignette */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(13,11,18,0.6) 0%, rgba(13,11,18,0) 20%)' }} />
          {/* Bottom book-page fade */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(13,11,18,0) 0%, rgba(13,11,18,0) 45%, rgba(13,11,18,0.92) 65%, rgba(13,11,18,1) 80%)' }} />

          {/* Logo */}
          <div className="relative z-10 flex items-center gap-2 px-5 pt-10 safe-top">
            <LogoMark size={34} />
            <span className="text-white font-medium text-lg" style={{ fontFamily: SG }}>chaptr</span>
          </div>

          {/* Hero text pinned to bottom */}
          <div className="relative z-10 mt-auto px-5 pb-8 flex flex-col gap-4 safe-bottom">
            <motion.div className="flex flex-col gap-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="flex items-center gap-2">
                <BookOpen size={14} className="text-accent" />
                <p className="text-accent/80 font-medium text-xs tracking-[2px] uppercase" style={{ fontFamily: SG }}>AI Interactive Story</p>
              </div>
              <h1 className="text-white font-bold" style={{ fontSize: 40, letterSpacing: -1, lineHeight: 1, fontFamily: SERIF }}>
                Your face.<br />Your story.
              </h1>
              <p className="text-white/60 text-sm leading-relaxed" style={{ maxWidth: 300, fontFamily: INTER }}>
                Upload a selfie. Chat with AI characters. Make choices that change the ending. Every story is uniquely yours.
              </p>
            </motion.div>

            <motion.button
              className="btn-accent flex items-center justify-center gap-2"
              style={{ fontFamily: SG, minHeight: 52 }}
              onClick={() => navigate('/universes')}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              whileTap={{ scale: 0.97 }}
            >
              Start Your Story <ArrowRight size={18} />
            </motion.button>

            <motion.p
              className="text-white/25 text-xs text-center"
              style={{ fontFamily: INTER }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Free to play · No account needed · 5 min experience
            </motion.p>
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
                <div className="flex items-start gap-3 p-4 pb-5">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(200,75,158,0.08)' }}>
                    {step.icon}
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-white font-semibold text-[15px]" style={{ fontFamily: INTER }}>{step.title}</p>
                    <p className="text-white/40 text-xs leading-relaxed" style={{ fontFamily: INTER }}>{step.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Mobile — What Makes It Different */}
        <section style={{ background: '#0A090F' }} className="pb-4">
          <div className="flex flex-col gap-2 px-5 pt-10 pb-6">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={12} className="text-accent/60" />
              <p className="text-accent/60 font-semibold text-[10px] tracking-[2px] uppercase" style={{ fontFamily: INTER }}>NOT JUST A VISUAL NOVEL</p>
            </div>
            <h2 className="text-white font-bold" style={{ fontSize: 26, lineHeight: 1.2, fontFamily: SERIF }}>
              Stories that<br />respond to you
            </h2>
            <p className="text-white/40 text-sm leading-relaxed" style={{ fontFamily: INTER }}>
              Every conversation and choice creates a story that's never been told before. Characters remember what you said. Your personality shapes how they react.
            </p>
          </div>
          <div className="flex flex-col gap-3 px-4 pb-10">
            {[
              { label: 'AI Characters', detail: 'Real conversations, not scripted dialogue trees' },
              { label: 'Branching Paths', detail: '4 unique endings based on your choices' },
              { label: 'You\'re In It', detail: 'Your face, anime-styled, as the protagonist' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                className="rounded-2xl p-4 flex items-start gap-3"
                style={{ background: '#111016', border: '1px solid rgba(42,32,64,0.4)' }}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-2 h-2 rounded-full bg-accent mt-1.5 shrink-0" />
                <div>
                  <p className="text-white/70 font-medium text-sm" style={{ fontFamily: INTER }}>{item.label}</p>
                  <p className="text-white/30 text-xs mt-0.5" style={{ fontFamily: INTER }}>{item.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Mobile — Final CTA */}
        <section className="px-5 py-14 flex flex-col items-center text-center gap-5 safe-bottom" style={{ background: '#0A090F' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(200,75,158,0.15) 0%, rgba(139,92,246,0.15) 100%)', border: '1px solid rgba(200,75,158,0.2)' }}>
            <BookOpen size={28} className="text-accent" />
          </div>
          <h3 className="text-white font-bold text-xl" style={{ fontFamily: SERIF }}>Your story is waiting</h3>
          <p className="text-white/40 text-sm" style={{ fontFamily: INTER, maxWidth: 280 }}>One selfie. One choice. A story that's entirely yours.</p>
          <button
            className="btn-accent flex items-center justify-center gap-2 max-w-xs"
            style={{ fontFamily: SG, minHeight: 52 }}
            onClick={() => navigate('/universes')}
          >
            Begin Now <ArrowRight size={18} />
          </button>
          <p className="text-white/20 text-xs" style={{ fontFamily: INTER }}>Takes about 5 minutes</p>
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
                  { label: 'Why Chaptr', id: 'why-chaptr' },
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
                <p className="text-accent/70 font-medium text-xs tracking-[3px] uppercase" style={{ fontFamily: SG }}>AI Interactive Story</p>
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
                style={{ maxWidth: 520, fontFamily: INTER, textShadow: '0 1px 12px rgba(0,0,0,0.9)' }}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              >
                Upload a selfie. Chat with AI characters. Make choices that change the ending. Every playthrough is uniquely yours.
              </motion.p>

              <motion.div className="flex flex-col items-center gap-4 mt-2" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                <button
                  className="flex items-center justify-center gap-2.5 text-white font-semibold text-base transition-all hover:scale-[1.02] hover:shadow-lg"
                  style={{ height: 54, paddingLeft: 36, paddingRight: 36, borderRadius: 14, background: 'linear-gradient(135deg, #c84b9e 0%, #8b5cf6 100%)', fontFamily: SG }}
                  onClick={() => navigate('/universes')}
                >
                  Start Your Story <ArrowRight size={18} />
                </button>
                <span className="text-white/25 text-sm" style={{ fontFamily: INTER }}>Free to play · No account needed · 5 min experience</span>
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
                  <div className="flex items-start gap-3 p-5 pb-6">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(200,75,158,0.08)' }}>
                      {step.icon}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <p className="text-white font-semibold text-lg" style={{ fontFamily: INTER }}>{step.title}</p>
                      <p className="text-white/35 text-sm leading-relaxed" style={{ fontFamily: INTER }}>{step.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Desktop Why Chaptr ── */}
        <section id="why-chaptr" className="pb-28" style={{ background: '#0A090F' }}>
          <div className="page-container mx-auto px-8 lg:px-20">
            {/* Divider */}
            <div className="h-px mb-24 mx-auto" style={{ background: 'linear-gradient(90deg, transparent, rgba(200,75,158,0.2), transparent)', maxWidth: 600 }} />

            <div className="flex flex-col items-center text-center gap-3 mb-14">
              <div className="flex items-center gap-2">
                <Sparkles size={12} className="text-accent/50" />
                <p className="text-accent/50 font-semibold text-[10px] tracking-[2px] uppercase" style={{ fontFamily: INTER }}>NOT JUST A VISUAL NOVEL</p>
              </div>
              <h2 className="text-white font-bold" style={{ fontSize: 40, lineHeight: 1.2, fontFamily: SERIF }}>
                Stories that respond to you
              </h2>
              <p className="text-white/35 text-base" style={{ maxWidth: 480, fontFamily: INTER }}>
                Every conversation and choice creates a story that's never been told before.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-5">
              {[
                { title: 'AI Characters', desc: 'Real freeform conversations, not scripted dialogue trees. Characters have personalities, moods, and memory.', icon: <MessageCircle size={20} className="text-accent" /> },
                { title: 'Branching Paths', desc: '4 unique endings based on the choices you make. Your conversations shift the story in ways you won\'t expect.', icon: <GitBranch size={20} className="text-gem" /> },
                { title: 'You\'re In It', desc: 'Your selfie, transformed into anime, as the main character. It\'s your face in every scene.', icon: <Camera size={20} className="text-accentLight" /> },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  className="rounded-2xl p-6 flex flex-col gap-4"
                  style={{ background: '#111016', border: '1px solid rgba(42,32,64,0.4)' }}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(200,75,158,0.08)' }}>
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-white/80 font-semibold text-base mb-1.5" style={{ fontFamily: INTER }}>{item.title}</p>
                    <p className="text-white/35 text-sm leading-relaxed" style={{ fontFamily: INTER }}>{item.desc}</p>
                  </div>
                </motion.div>
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
              <p className="text-white/20 text-xs" style={{ fontFamily: INTER }}>Takes about 5 minutes</p>
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

function MobileFooter() {
  return (
    <footer style={{ background: '#07060B' }}>
      <div className="h-px" style={{ background: 'rgba(42,32,64,0.3)' }} />
      <div className="flex flex-col gap-6 px-5 py-8 pb-10 safe-bottom">
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
