import { motion } from 'framer-motion'
import { Sun, Moon, Sunrise, MapPin } from 'lucide-react'

interface DayTransitionProps {
  dayNumber: number
  theme: string
  cityName: string
  type: 'start' | 'end'
  heroImage?: string
  onContinue: () => void
}

export function DayTransition({ dayNumber, theme, cityName, type, heroImage, onContinue }: DayTransitionProps) {
  const isStart = type === 'start'
  const Icon = isStart ? (dayNumber === 1 ? Sunrise : Sun) : Moon

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center justify-center h-full px-5 relative overflow-hidden"
    >
      {heroImage && (
        <div className="absolute inset-0">
          <img src={heroImage} alt="" className="w-full h-full object-cover" style={{ filter: 'blur(40px) brightness(0.15) saturate(0.4)' }} />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(13,11,18,0.6) 0%, rgba(13,11,18,0.95) 70%)' }} />
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="relative text-center max-w-sm w-full rounded-2xl px-8 py-10"
        style={{
          background: isStart
            ? 'linear-gradient(135deg, rgba(124,58,237,0.06), rgba(200,75,158,0.04))'
            : 'linear-gradient(135deg, rgba(139,92,246,0.06), rgba(99,71,217,0.04))',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Icon size={32} className="mx-auto mb-4" style={{ color: isStart ? '#F59E0B' : '#8B5CF6' }} />
        </motion.div>

        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.45 }}
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

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <MapPin size={12} className="text-white/30" />
            <span className="text-white/30 text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {cityName}
            </span>
          </div>
          <p
            className="text-white/40 text-sm mb-8"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {isStart
              ? dayNumber === 1
                ? `Your adventure in ${cityName} begins.`
                : `A new day, a new side of ${cityName}.`
              : `${cityName} at night hits different.`
            }
          </p>
        </motion.div>

        <motion.button
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          whileTap={{ scale: 0.98 }}
          onClick={onContinue}
          className="px-8 py-3 rounded-xl text-white text-sm font-medium cursor-pointer"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            background: isStart ? 'linear-gradient(135deg, #7C3AED, #c84b9e)' : 'rgba(139,92,246,0.15)',
            border: isStart ? 'none' : '1px solid rgba(139,92,246,0.2)',
          }}
        >
          {isStart ? "Let's go" : 'Wind down'}
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
