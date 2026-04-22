import { motion } from 'framer-motion'
import { Sun, Moon, Sunrise } from 'lucide-react'

interface DayTransitionProps {
  dayNumber: number
  theme: string
  cityName: string
  type: 'start' | 'end'
  onContinue: () => void
}

export function DayTransition({ dayNumber, theme, cityName, type, onContinue }: DayTransitionProps) {
  const isStart = type === 'start'
  const Icon = isStart ? (dayNumber === 1 ? Sunrise : Sun) : Moon

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center justify-center h-full px-5"
    >
      <div className="text-center max-w-sm">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Icon size={32} className="mx-auto mb-4" style={{ color: isStart ? '#F59E0B' : '#8B5CF6' }} />
        </motion.div>

        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-white/40 text-xs uppercase tracking-[2px] mb-2"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {isStart ? `Day ${dayNumber}` : `End of Day ${dayNumber}`}
        </motion.p>

        <motion.h2
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-white text-2xl font-bold mb-2"
          style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.02em' }}
        >
          {isStart ? theme : 'What a day.'}
        </motion.h2>

        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-white/40 text-sm mb-8"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {isStart ? `${cityName} is waiting.` : `${cityName} at night hits different.`}
        </motion.p>

        <motion.button
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          whileTap={{ scale: 0.98 }}
          onClick={onContinue}
          className="px-6 py-3 rounded-xl text-white text-sm font-medium cursor-pointer"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            background: isStart ? 'linear-gradient(135deg, #7C3AED, #c84b9e)' : 'rgba(139,92,246,0.15)',
            border: isStart ? 'none' : '1px solid rgba(139,92,246,0.2)',
          }}
        >
          {isStart ? "Let's go" : 'Wind down'}
        </motion.button>
      </div>
    </motion.div>
  )
}
