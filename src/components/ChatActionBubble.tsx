import { motion } from 'framer-motion'

interface Props {
  label: string
  emoji: string
  gemCost: number
}

/** Renders a chat action as a styled card in the message thread (replaces normal text bubble) */
export function ChatActionBubble({ label, emoji, gemCost }: Props) {
  return (
    <motion.div
      className="max-w-[200px] rounded-2xl px-4 py-3 text-center"
      style={{
        background: 'linear-gradient(135deg, rgba(200,75,158,0.2) 0%, rgba(139,92,246,0.2) 100%)',
        border: '1px solid rgba(200,75,158,0.3)',
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
    >
      <span className="text-2xl block mb-1">{emoji}</span>
      <span className="text-white text-sm font-medium">{label}</span>
      {gemCost > 0 && (
        <span className="block text-[10px] mt-0.5" style={{ color: 'rgba(251,191,36,0.7)' }}>
          -{gemCost} gems
        </span>
      )}
    </motion.div>
  )
}
