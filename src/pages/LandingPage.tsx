import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-bg">
      {/* ─── MOBILE ─── */}
      <div className="md:hidden relative min-h-screen flex flex-col">
        {/* Full-screen bg image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/hero-landing.jpeg)' }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(13,10,18,0.3) 0%, rgba(13,10,18,0.5) 50%, rgba(13,10,18,1) 80%)' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2 px-6 pt-12">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #c84b9e 0%, #8b5cf6 100%)' }}>
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="text-textPrimary font-semibold text-base tracking-wide">chaptr</span>
        </div>

        {/* Content — pushed to bottom */}
        <div className="relative z-10 mt-auto px-6 pb-12">
          {/* Tags */}
          <motion.div
            className="flex items-center gap-2 mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="text-textSecondary text-xs font-medium tracking-widest uppercase">AI · Interactive · Personalized</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="text-textPrimary font-bold leading-tight mb-4"
            style={{ fontSize: 'clamp(2.5rem, 10vw, 3.5rem)' }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Your face.<br />Your story.
          </motion.h1>

          {/* Subtext */}
          <motion.p
            className="text-textSecondary text-base mb-8 leading-relaxed"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Step inside the story. AI generates a world where you're the main character.
          </motion.p>

          {/* CTA */}
          <motion.button
            className="btn-accent flex items-center justify-center gap-2"
            onClick={() => navigate('/upload')}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileTap={{ scale: 0.98 }}
          >
            Start Your Story <ArrowRight size={18} />
          </motion.button>

          {/* Social proof */}
          <motion.p
            className="text-center mt-4 text-textMuted text-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <span className="inline-block w-2 h-2 rounded-full bg-accent mr-1.5 align-middle" />
            967K stories started this week
          </motion.p>
        </div>
      </div>

      {/* ─── DESKTOP ─── */}
      <div className="hidden md:block">
        {/* Hero section */}
        <div className="relative min-h-screen">
          {/* Full-width bg */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: 'url(/hero-landing.jpeg)' }}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(13,10,18,0.4) 0%, rgba(13,10,18,0.7) 60%, rgba(13,10,18,1) 100%)' }} />

          <div className="relative z-10 page-container">
            {/* Nav */}
            <nav className="flex items-center justify-between px-8 pt-8 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #c84b9e 0%, #8b5cf6 100%)' }}>
                  <span className="text-white font-bold">C</span>
                </div>
                <span className="text-textPrimary font-semibold text-lg tracking-wide">chaptr</span>
              </div>
              <button
                onClick={() => navigate('/upload')}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #c84b9e 0%, #8b5cf6 100%)' }}
              >
                Start Your Story
              </button>
            </nav>

            {/* Hero content */}
            <div className="flex items-start gap-16 px-8 pt-24 pb-32">
              {/* Left — headline */}
              <div className="flex-1 max-w-xl">
                <motion.p
                  className="text-textSecondary text-sm font-medium tracking-widest uppercase mb-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  AI · Interactive · Personalized
                </motion.p>
                <motion.h1
                  className="text-textPrimary font-bold leading-none mb-6"
                  style={{ fontSize: 'clamp(3rem, 5vw, 5rem)' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Your face.<br />Your story.
                </motion.h1>
                <motion.p
                  className="text-textSecondary text-lg leading-relaxed mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Upload a selfie and step inside the story. The AI generates a personalised world where you are the main character — choices matter, and the story remembers.
                </motion.p>
                <motion.button
                  className="btn-accent max-w-xs flex items-center justify-center gap-2"
                  onClick={() => navigate('/upload')}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Start Your Story <ArrowRight size={18} />
                </motion.button>
                <motion.p
                  className="mt-4 text-textMuted text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <span className="inline-block w-2 h-2 rounded-full bg-accent mr-1.5 align-middle" />
                  967K stories started this week
                </motion.p>
              </div>

              {/* Right — story preview card */}
              <motion.div
                className="w-72 shrink-0 rounded-2xl overflow-hidden shadow-2xl border border-border"
                style={{ background: '#13101c' }}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="h-40 bg-cover bg-center" style={{ backgroundImage: 'url(/scene-elevator.jpg)' }} />
                <div className="p-4 space-y-3">
                  <p className="text-textMuted text-xs uppercase tracking-widest">Chapter 1 — First Day</p>
                  <p className="text-textPrimary text-sm leading-relaxed">The elevator doors slide open. Standing in front of you is Lee Junho — the lead vocalist of NOVA...</p>
                  <div className="space-y-2">
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

        {/* How it works section */}
        <div className="bg-bg py-24">
          <div className="page-container px-8">
            <p className="text-textMuted text-xs font-semibold uppercase tracking-widest mb-3">The Story Begins</p>
            <h2 className="text-textPrimary font-bold text-4xl mb-16">How the story begins</h2>

            <div className="grid grid-cols-3 gap-8">
              {[
                {
                  step: '01',
                  title: 'Upload your photo',
                  desc: 'Your face becomes the protagonist. The AI weaves your likeness into every scene, making the story unmistakably yours.',
                  icon: '📸',
                },
                {
                  step: '02',
                  title: 'Choose your world',
                  desc: 'Pick a story universe — K-pop romance, mystery thriller, or fantasy academy. Each world has its own cast and arc.',
                  icon: '🌏',
                },
                {
                  step: '03',
                  title: 'Live inside the story',
                  desc: 'Make choices that actually change the plot. The AI remembers every decision and builds a narrative around them.',
                  icon: '✨',
                },
              ].map(({ step, title, desc, icon }) => (
                <motion.div
                  key={step}
                  className="p-6 rounded-2xl border border-border"
                  style={{ background: '#13101c' }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: Number(step) * 0.1 }}
                >
                  <div className="text-3xl mb-4">{icon}</div>
                  <p className="text-textMuted text-xs font-semibold mb-2">{step}</p>
                  <h3 className="text-textPrimary font-semibold text-lg mb-3">{title}</h3>
                  <p className="text-textSecondary text-sm leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA strip */}
        <div className="py-20 px-8" style={{ background: 'linear-gradient(135deg, rgba(200,75,158,0.12) 0%, rgba(139,92,246,0.12) 100%)', borderTop: '1px solid #2a2040' }}>
          <div className="page-container flex items-center justify-between px-8">
            <div>
              <h2 className="text-textPrimary font-bold text-3xl mb-2">Ready to open the next chapter?</h2>
              <p className="text-textSecondary">Your story is waiting. It takes 30 seconds to begin.</p>
            </div>
            <button
              onClick={() => navigate('/upload')}
              className="shrink-0 px-8 py-4 rounded-2xl font-semibold text-white text-base flex items-center gap-2 transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #c84b9e 0%, #8b5cf6 100%)' }}
            >
              Start Your Story <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-8 px-8 border-t border-border">
          <div className="page-container flex items-center justify-between px-8">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #c84b9e 0%, #8b5cf6 100%)' }}>
                <span className="text-white font-bold text-xs">C</span>
              </div>
              <span className="text-textSecondary text-sm">chaptr</span>
            </div>
            <p className="text-textMuted text-sm">© 2025 Chaptr. AI-native storytelling.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
