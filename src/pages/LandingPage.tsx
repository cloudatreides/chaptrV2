import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, BookOpen, Sparkles, Camera, MessageCircle, GitBranch } from 'lucide-react'
import { trackEvent } from '../lib/supabase'

const STEPS: { num: string; icon: React.ReactNode; title: string; desc: string; img: string; widget?: 'morph' | 'universes' | 'choices' }[] = [
  {
    num: '01',
    icon: <Camera size={20} className="text-accent" />,
    title: 'Upload your selfie',
    desc: 'AI transforms your photo into an anime character — you become the protagonist.',
    img: '/step1-upload.jpeg',
    widget: 'morph',
  },
  {
    num: '02',
    icon: <MessageCircle size={20} className="text-gem" />,
    title: 'Pick your world',
    desc: 'Romance, horror, mystery — choose a universe and step into the story.',
    img: '/step2-world.jpeg',
    widget: 'universes',
  },
  {
    num: '03',
    icon: <GitBranch size={20} className="text-accentLight" />,
    title: 'Shape the ending',
    desc: 'Your choices create branching paths. 4 possible endings — each one uniquely yours.',
    img: '/step3-story.jpeg',
    widget: 'choices',
  },
]

const SERIF = "'Playfair Display', Georgia, serif"
const SG = 'Space Grotesk, sans-serif'
const INTER = 'Inter, sans-serif'

// ─── Typewriter Headline ───

function TypewriterHeadline({ fontSize, style }: { fontSize: number; style?: React.CSSProperties }) {
  const lines = ['Your face.', 'Your story.']
  const [displayedChars, setDisplayedChars] = useState(0)
  const [showCursor, setShowCursor] = useState(true)
  const fullText = lines.join('\n')

  useEffect(() => {
    if (displayedChars >= fullText.length) {
      // Hide cursor after a beat
      const t = setTimeout(() => setShowCursor(false), 1500)
      return () => clearTimeout(t)
    }
    const delay = fullText[displayedChars] === '.' ? 300 : fullText[displayedChars] === '\n' ? 400 : 60
    const t = setTimeout(() => setDisplayedChars(prev => prev + 1), delay)
    return () => clearTimeout(t)
  }, [displayedChars, fullText])

  const visible = fullText.slice(0, displayedChars)
  const [line1, line2] = visible.split('\n')

  return (
    <h1
      className="text-white font-bold"
      style={{
        fontSize,
        letterSpacing: fontSize > 50 ? -2 : -1,
        lineHeight: 1.05,
        fontFamily: SERIF,
        textShadow: fontSize > 50 ? '0 4px 40px rgba(0,0,0,0.5)' : undefined,
        ...style,
      }}
    >
      {line1}
      {line2 !== undefined && <br />}
      {line2 ?? ''}
      {showCursor && (
        <motion.span
          className="inline-block ml-0.5"
          style={{ color: '#c84b9e', fontWeight: 300 }}
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
        >
          |
        </motion.span>
      )}
    </h1>
  )
}

// ─── Character Avatar (static portrait cropped from scene image) ───

function CharAvatar({ size = 28 }: { size?: number }) {
  return (
    <div
      className="rounded-full overflow-hidden shrink-0"
      style={{ width: size, height: size, background: 'rgba(200,75,158,0.15)' }}
    >
      <img
        src="/sora-portrait.png"
        alt="Sora"
        className="w-full h-full object-cover"
      />
    </div>
  )
}

// ─── Selfie → Anime Morph ───

function SelfieMorph({ height, className }: { height: number; className?: string }) {
  return (
    <div className={`relative w-full overflow-hidden ${className ?? ''}`} style={{ height, backgroundColor: '#1a1525' }}>
      {/* "Selfie" layer — real photo */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/step1-selfie.jpeg)' }}
      />
      {/* "Anime" layer — AI-transformed version, fades in over selfie */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/step1-anime.png)' }}
        animate={{ opacity: [0, 0, 1, 1, 0, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', times: [0, 0.15, 0.4, 0.6, 0.85, 1] }}
      />
      {/* Anime tint overlay */}
      <motion.div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, rgba(200,75,158,0.2) 0%, rgba(139,92,246,0.15) 100%)' }}
        animate={{ opacity: [0, 0, 1, 1, 0, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', times: [0, 0.15, 0.4, 0.6, 0.85, 1] }}
      />
      {/* Label that swaps */}
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
      {/* Bottom gradient */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(17,16,22,0) 50%, rgba(17,16,22,0.8) 100%)' }} />
    </div>
  )
}

// ─── Story Universe Showcase ───

const UNIVERSE_CARDS = [
  { title: 'The Seoul Transfer', tag: 'K-POP ROMANCE', image: '/seoul-night.jpg', accent: '#c84b9e' },
  { title: 'Hollow Manor', tag: 'SUPERNATURAL HORROR', image: '/hollow-manor.svg', accent: '#7c3aed' },
  { title: 'The Last Signal', tag: 'NOIR MYSTERY', image: '/last-signal.svg', accent: '#0ea5e9' },
]

function StoryUniverses({ height, className }: { height: number; className?: string }) {
  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % UNIVERSE_CARDS.length)
    }, 2600)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`relative w-full overflow-hidden ${className ?? ''}`} style={{ height, backgroundColor: '#0d0b14' }}>
      {/* Crossfading background images */}
      {UNIVERSE_CARDS.map((card, i) => (
        <motion.div
          key={card.title}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${card.image})` }}
          animate={{ opacity: i === activeIdx ? 1 : 0 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
        />
      ))}

      {/* Dark overlay */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(13,11,20,0.35) 0%, rgba(13,11,20,0.7) 55%, rgba(13,11,20,0.95) 100%)' }} />

      {/* Story info */}
      <div className="absolute inset-0 flex flex-col justify-end px-4 pb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIdx}
            className="flex flex-col gap-1"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.35 }}
          >
            <span
              className="text-[9px] font-bold tracking-[1.5px] px-2 py-0.5 rounded self-start"
              style={{
                background: `rgba(${UNIVERSE_CARDS[activeIdx].accent === '#c84b9e' ? '200,75,158' : UNIVERSE_CARDS[activeIdx].accent === '#7c3aed' ? '124,58,237' : '14,165,233'},0.25)`,
                color: UNIVERSE_CARDS[activeIdx].accent,
                fontFamily: INTER,
              }}
            >
              {UNIVERSE_CARDS[activeIdx].tag}
            </span>
            <p className="text-white font-semibold text-sm" style={{ fontFamily: INTER }}>
              {UNIVERSE_CARDS[activeIdx].title}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Dot indicators */}
        <div className="flex items-center gap-1.5 mt-2.5">
          {UNIVERSE_CARDS.map((_, i) => (
            <motion.div
              key={i}
              className="rounded-full"
              animate={{
                width: i === activeIdx ? 16 : 4,
                background: i === activeIdx ? UNIVERSE_CARDS[activeIdx].accent : 'rgba(255,255,255,0.2)',
              }}
              style={{ height: 4 }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Choice Cards ───

function ChoiceCards({ height, className }: { height: number; className?: string }) {
  const [chosen, setChosen] = useState<0 | 1 | null>(null)

  const choices = [
    { text: 'Trust her', hint: 'Let her in. See what happens.', color: '#c84b9e', rgb: '200,75,158' },
    { text: 'Walk away', hint: 'Keep your distance. For now.', color: '#8b5cf6', rgb: '139,92,246' },
  ]

  useEffect(() => {
    let i = 0
    const seq: (0 | 1 | null)[] = [null, 0, null, 1]
    const interval = setInterval(() => {
      i = (i + 1) % seq.length
      setChosen(seq[i])
    }, 1800)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className={`relative w-full flex flex-col items-center justify-center gap-3 px-5 ${className ?? ''}`}
      style={{ height, backgroundColor: '#111016' }}
    >
      <p className="text-white/25 text-[10px] tracking-[1.5px] uppercase font-medium" style={{ fontFamily: INTER }}>
        What do you do?
      </p>
      <div className="w-full flex gap-3">
        {choices.map((choice, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-xl p-3 flex flex-col gap-1 cursor-pointer"
            animate={{
              background: chosen === i ? `rgba(${choice.rgb},0.12)` : 'rgba(255,255,255,0.03)',
              borderColor: chosen === i ? choice.color : 'rgba(255,255,255,0.08)',
              scale: chosen === i ? 1.03 : 1,
            }}
            style={{ border: '1px solid', borderColor: 'rgba(255,255,255,0.08)' }}
            transition={{ duration: 0.3 }}
          >
            <p
              className="text-sm font-semibold"
              style={{ color: chosen === i ? choice.color : 'rgba(255,255,255,0.6)', fontFamily: INTER, transition: 'color 0.3s' }}
            >
              {choice.text}
            </p>
            <p className="text-[10px] leading-snug" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: INTER }}>
              {choice.hint}
            </p>
          </motion.div>
        ))}
      </div>
      {/* Bottom gradient */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(17,16,22,0) 60%, rgba(17,16,22,0.6) 100%)' }} />
    </div>
  )
}

// ─── Step image renderer (static or animated widget) ───

function StepImage({ step, height, className }: { step: typeof STEPS[number]; height: number; className?: string }) {
  if (step.widget === 'morph') return <SelfieMorph height={height} className={className} />
  if (step.widget === 'universes') return <StoryUniverses height={height} className={className} />
  if (step.widget === 'choices') return <ChoiceCards height={height} className={className} />
  return (
    <div
      className={`relative w-full bg-cover bg-center ${className ?? ''}`}
      style={{ height, backgroundImage: `url(${step.img})`, backgroundColor: '#1a1525' }}
    >
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(17,16,22,0) 50%, rgba(17,16,22,0.8) 100%)' }} />
    </div>
  )
}

// ─── Live Chat Demo ───

const CHAT_SCRIPT = [
  { role: 'character' as const, name: 'Sora', text: 'hey~ you\'re the new transfer student, right? i\'ve been curious about you.' },
  { role: 'user' as const, name: 'You', text: 'Maybe. What have you heard?' },
  { role: 'character' as const, name: 'Sora', text: 'enough to know you\'re not boring. that\'s rare around here.' },
]

function ChatDemo({ compact }: { compact?: boolean }) {
  const [visibleMessages, setVisibleMessages] = useState<number>(0)
  const [typingCharIdx, setTypingCharIdx] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [phase, setPhase] = useState<'waiting' | 'typing' | 'done'>('waiting')

  const currentMsg = CHAT_SCRIPT[visibleMessages]
  const isCharacterMsg = currentMsg?.role === 'character'

  // Start the sequence after headline finishes (~2.5s)
  useEffect(() => {
    const t = setTimeout(() => {
      setPhase('typing')
      if (CHAT_SCRIPT[0].role === 'character') setIsTyping(true)
    }, 2800)
    return () => clearTimeout(t)
  }, [])

  // Type out character messages char by char
  useEffect(() => {
    if (phase !== 'typing') return
    if (visibleMessages >= CHAT_SCRIPT.length) {
      setPhase('done')
      return
    }

    const msg = CHAT_SCRIPT[visibleMessages]

    if (msg.role === 'character') {
      // Typing indicator for 600ms, then start revealing
      if (isTyping && typingCharIdx === 0) {
        const t = setTimeout(() => setIsTyping(false), 600)
        return () => clearTimeout(t)
      }
      if (!isTyping && typingCharIdx < msg.text.length) {
        const t = setTimeout(() => setTypingCharIdx(prev => prev + 1), 28)
        return () => clearTimeout(t)
      }
      if (!isTyping && typingCharIdx >= msg.text.length) {
        // Message complete — pause, then next
        const t = setTimeout(() => {
          setVisibleMessages(prev => prev + 1)
          setTypingCharIdx(0)
          if (visibleMessages + 1 < CHAT_SCRIPT.length && CHAT_SCRIPT[visibleMessages + 1].role === 'character') {
            setIsTyping(true)
          }
        }, 1000)
        return () => clearTimeout(t)
      }
    } else {
      // User messages appear instantly after a brief pause
      const t = setTimeout(() => {
        setVisibleMessages(prev => prev + 1)
        setTypingCharIdx(0)
        if (visibleMessages + 1 < CHAT_SCRIPT.length && CHAT_SCRIPT[visibleMessages + 1].role === 'character') {
          setIsTyping(true)
        }
      }, 800)
      return () => clearTimeout(t)
    }
  }, [phase, visibleMessages, typingCharIdx, isTyping])

  const getCompletedMessages = useCallback(() => {
    const msgs: { role: 'user' | 'character'; name: string; text: string }[] = []
    for (let i = 0; i < visibleMessages; i++) {
      msgs.push(CHAT_SCRIPT[i])
    }
    return msgs
  }, [visibleMessages])

  if (phase === 'waiting') return null

  const completed = getCompletedMessages()
  const currentlyTyping = visibleMessages < CHAT_SCRIPT.length ? CHAT_SCRIPT[visibleMessages] : null
  const partialText = currentlyTyping?.role === 'character' && !isTyping
    ? currentlyTyping.text.slice(0, typingCharIdx)
    : null

  return (
    <motion.div
      className="w-full rounded-2xl overflow-hidden"
      style={{
        maxWidth: compact ? 280 : 380,
        background: 'rgba(17,16,22,0.85)',
        border: '1px solid rgba(200,75,158,0.15)',
        backdropFilter: 'blur(20px)',
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Chat header — matches app ChatScene header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
        <CharAvatar size={compact ? 26 : 32} />
        <div>
          <p className="text-white/80 text-xs font-medium" style={{ fontFamily: INTER }}>Sora</p>
          <p className="text-white/25 text-[10px]" style={{ fontFamily: INTER }}>Seoul Transfer · Romance</p>
        </div>
        {/* Mood stages like the app */}
        <div className="ml-auto flex items-center gap-1.5">
          {['curious', 'vibing'].map((stage, i) => (
            <span
              key={stage}
              className="text-[9px] italic"
              style={{ color: i === 0 ? '#e060b8' : 'rgba(255,255,255,0.2)', fontWeight: i === 0 ? 600 : 400 }}
            >
              {stage}
            </span>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className={`flex flex-col gap-2 px-3 ${compact ? 'py-2.5' : 'py-3'}`}>
        <AnimatePresence>
          {completed.map((msg, i) => (
            <motion.div
              key={i}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Intro scene image — first character message only, like the app */}
              {i === 0 && msg.role === 'character' && (
                <motion.div
                  className="rounded-lg overflow-hidden mb-1.5"
                  style={{ width: compact ? 160 : 200, height: compact ? 100 : 120 }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <img src="/sora-portrait.png" alt="Sora" className="w-full h-full object-cover object-center" />
                </motion.div>
              )}
              <div className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'character' && <CharAvatar size={compact ? 22 : 26} />}
                <div
                  className={`${compact ? 'text-xs' : 'text-[13px]'} leading-relaxed px-3 py-2 rounded-2xl max-w-[80%]`}
                  style={{
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, #c84b9e 0%, #8b5cf6 100%)'
                      : 'rgba(255,255,255,0.06)',
                    color: msg.role === 'user' ? '#fff' : 'rgba(255,255,255,0.7)',
                    fontFamily: INTER,
                    borderBottomRightRadius: msg.role === 'user' ? 6 : undefined,
                    borderBottomLeftRadius: msg.role === 'character' ? 6 : undefined,
                  }}
                >
                  {msg.text}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Currently typing character message */}
        {isTyping && isCharacterMsg && (
          <motion.div className="flex items-end gap-2 justify-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <CharAvatar size={compact ? 22 : 26} />
            <div
              className={`${compact ? 'text-xs' : 'text-[13px]'} px-3 py-2 rounded-2xl flex gap-1`}
              style={{ background: 'rgba(255,255,255,0.06)', borderBottomLeftRadius: 6 }}
            >
              <span className="typing-dot" style={{ animationDelay: '0ms', width: 4, height: 4 }} />
              <span className="typing-dot" style={{ animationDelay: '150ms', width: 4, height: 4 }} />
              <span className="typing-dot" style={{ animationDelay: '300ms', width: 4, height: 4 }} />
            </div>
          </motion.div>
        )}

        {partialText !== null && (
          <div className="flex items-end gap-2 justify-start">
            <CharAvatar size={compact ? 22 : 26} />
            <div
              className={`${compact ? 'text-xs' : 'text-[13px]'} leading-relaxed px-3 py-2 rounded-2xl max-w-[80%]`}
              style={{
                background: 'rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.7)',
                fontFamily: INTER,
                borderBottomLeftRadius: 6,
              }}
            >
              {partialText}
              <motion.span
                className="inline-block ml-0.5"
                style={{ color: '#c84b9e' }}
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.4, repeat: Infinity, repeatType: 'reverse' }}
              >
                |
              </motion.span>
            </div>
          </div>
        )}

        {/* User message appearing */}
        {currentlyTyping?.role === 'user' && (
          <motion.div
            className="flex justify-end"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className={`${compact ? 'text-xs' : 'text-[13px]'} leading-relaxed px-3 py-2 rounded-2xl max-w-[85%]`}
              style={{
                background: 'linear-gradient(135deg, #c84b9e 0%, #8b5cf6 100%)',
                color: '#fff',
                fontFamily: INTER,
                borderBottomRightRadius: 6,
              }}
            >
              {currentlyTyping.text}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export function LandingPage() {
  const navigate = useNavigate()
  const { session, signInWithGoogle } = useAuth()

  function handleCTA() {
    if (session) {
      navigate('/universes')
    } else {
      signInWithGoogle()
    }
  }

  // trackEvent('landing_view') — disabled until chaptr_events table is created in Supabase

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
                <p className="text-white/90 font-medium text-xs tracking-[2px] uppercase" style={{ fontFamily: SG, textShadow: '0 1px 8px rgba(0,0,0,0.8)' }}>AI Interactive Story</p>
              </div>
              <TypewriterHeadline fontSize={40} style={{ lineHeight: 1 }} />
              <p className="text-white/60 text-sm leading-relaxed" style={{ maxWidth: 300, fontFamily: INTER }}>
                Upload a selfie. Chat with AI characters. Make choices that change the ending. Every story is uniquely yours.
              </p>
            </motion.div>

            {/* Live chat demo */}
            <ChatDemo compact />

            <motion.button
              className="btn-accent flex items-center justify-center gap-2"
              style={{ fontFamily: SG, minHeight: 52 }}
              onClick={handleCTA}
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
              Free to play · Sign in with Google · 5 min experience
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
                <div className="relative overflow-hidden">
                  <StepImage step={step} height={160} />
                  <div className="absolute bottom-3 left-3 z-10">
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
            onClick={handleCTA}
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
        <div className="relative" style={{ minHeight: 900 }}>
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
                  onClick={handleCTA}
                >
                  Start Reading
                </button>
              </div>
            </nav>

            {/* Hero content — two column: text left, chat demo right */}
            <div className="flex items-center justify-between gap-12 px-8 lg:px-16" style={{ paddingTop: 130 }}>
              {/* Left: text + CTA */}
              <div className="flex flex-col gap-6 flex-1 max-w-xl">
                <motion.div
                  className="flex items-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  <BookOpen size={14} className="text-accent" />
                  <p className="text-white/90 font-medium text-xs tracking-[3px] uppercase" style={{ fontFamily: SG, textShadow: '0 1px 8px rgba(0,0,0,0.8)' }}>AI Interactive Story</p>
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
                  <TypewriterHeadline fontSize={72} />
                </motion.div>

                <motion.p
                  className="text-white/60 text-lg leading-relaxed"
                  style={{ maxWidth: 420, fontFamily: INTER, textShadow: '0 1px 12px rgba(0,0,0,0.9)' }}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                >
                  Upload a selfie. Chat with AI characters. Make choices that change the ending. Every playthrough is uniquely yours.
                </motion.p>

                <motion.div className="flex flex-col gap-3" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                  <button
                    className="self-start flex items-center justify-center gap-2.5 text-white font-semibold text-base transition-all hover:scale-[1.02] hover:shadow-lg"
                    style={{ height: 54, paddingLeft: 36, paddingRight: 36, borderRadius: 14, background: 'linear-gradient(135deg, #c84b9e 0%, #8b5cf6 100%)', fontFamily: SG }}
                    onClick={handleCTA}
                  >
                    Start Your Story <ArrowRight size={18} />
                  </button>
                  <span className="text-white/25 text-sm" style={{ fontFamily: INTER }}>Free to play · Sign in with Google · 5 min experience</span>
                </motion.div>
              </div>

              {/* Right: live chat demo */}
              <motion.div
                className="shrink-0"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <ChatDemo />
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
                  <div className="relative w-full overflow-hidden">
                    <StepImage step={step} height={220} />
                    <div className="absolute inset-0 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute bottom-3 left-4 z-10">
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
                onClick={handleCTA}
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
