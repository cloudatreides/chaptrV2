import { motion } from 'framer-motion'

interface Props {
  avatarUrl?: string | null
  fallback?: React.ReactNode
}

export function TypingIndicator({ avatarUrl, fallback }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-end gap-2"
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
      ) : (
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0"
          style={{ background: '#2D2538' }}
        >
          {fallback}
        </div>
      )}
      <div
        className="rounded-2xl px-4 py-3 flex items-center gap-1.5"
        style={{ background: 'rgba(255,255,255,0.06)', borderBottomLeftRadius: 4 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-purple-400"
            animate={{ y: [0, -3, 0], opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
          />
        ))}
      </div>
    </motion.div>
  )
}
