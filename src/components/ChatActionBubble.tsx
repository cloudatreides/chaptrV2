import { motion } from 'framer-motion'

interface Props {
  label: string
  emoji: string
  gemCost: number
}

// Action-specific particle emojis that float around the main emoji
const ACTION_PARTICLES: Record<string, string[]> = {
  '👉': ['💫', '✨'],
  '😂': ['🤣', '💀', '😭'],
  '🎲': ['🔥', '⚡'],
  '🎮': ['🏆', '⚔️'],
  '☕': ['☁️', '💨', '✨'],
  '🎁': ['✨', '❓', '🎉'],
  '✨': ['💖', '🌟'],
  '🤗': ['💛', '🫂'],
  '🤫': ['👀', '🤐'],
  '📷': ['💭', '🕰️'],
  '💐': ['🌸', '🌺', '🌷'],
  '🌹': ['❤️', '🥀', '✨'],
  '🍪': ['🧡', '✨'],
  '💌': ['❤️', '✨', '💕'],
  '📝': ['💭', '✨'],
  '🎶': ['🎵', '♪', '💜'],
  '🎧': ['🎵', '💜', '✨'],
}

/** Renders a chat action as an animated sticker card in the message thread */
export function ChatActionBubble({ label, emoji, gemCost }: Props) {
  const particles = ACTION_PARTICLES[emoji] ?? ['✨']

  return (
    <motion.div
      className="relative w-[140px] rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, rgba(200,75,158,0.15) 0%, rgba(139,92,246,0.15) 50%, rgba(200,75,158,0.1) 100%)',
        border: '1px solid rgba(200,75,158,0.25)',
      }}
      initial={{ opacity: 0, scale: 0.7, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, type: 'spring', stiffness: 250, damping: 18 }}
    >
      {/* Shimmer overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 50%, transparent 60%)',
        }}
        initial={{ x: '-100%' }}
        animate={{ x: '200%' }}
        transition={{ duration: 1.5, delay: 0.3, ease: 'easeInOut' }}
      />

      {/* Emoji showcase area */}
      <div className="relative flex items-center justify-center pt-5 pb-2">
        {/* Floating particles */}
        {particles.map((p, i) => (
          <motion.span
            key={i}
            className="absolute text-sm pointer-events-none"
            style={{
              left: `${25 + (i * 25)}%`,
              top: `${15 + (i % 2) * 30}%`,
            }}
            initial={{ opacity: 0, scale: 0, y: 0 }}
            animate={{
              opacity: [0, 0.8, 0],
              scale: [0.3, 1, 0.5],
              y: [0, -12, -20],
              x: [0, (i % 2 === 0 ? 6 : -6), (i % 2 === 0 ? 10 : -10)],
            }}
            transition={{
              duration: 1.8,
              delay: 0.4 + i * 0.2,
              ease: 'easeOut',
            }}
          >
            {p}
          </motion.span>
        ))}

        {/* Main emoji with bounce */}
        <motion.span
          className="text-4xl relative z-10"
          initial={{ scale: 0.3, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.1,
            type: 'spring',
            stiffness: 300,
            damping: 12,
          }}
        >
          {emoji}
        </motion.span>
      </div>

      {/* Label */}
      <motion.div
        className="px-3 pb-3 text-center"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.3 }}
      >
        <span className="text-white/90 text-xs font-medium">{label}</span>
        {gemCost > 0 && (
          <span className="block text-[9px] mt-0.5" style={{ color: 'rgba(251,191,36,0.5)' }}>
            -{gemCost} gems
          </span>
        )}
      </motion.div>
    </motion.div>
  )
}
