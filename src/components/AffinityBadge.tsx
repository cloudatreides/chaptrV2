import { motion } from 'framer-motion'
import { getAffinityTier } from '../lib/affinity'

interface Props {
  score: number
  size?: 'sm' | 'md'
}

export function AffinityBadge({ score, size = 'sm' }: Props) {
  const tier = getAffinityTier(score)
  const progress = Math.min(100, Math.max(0, score))

  if (size === 'sm') {
    return (
      <div className="flex items-center gap-1.5">
        <div className="w-12 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: tier.color }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
        <span className="text-[9px] font-medium" style={{ color: tier.color }}>
          {tier.label}
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: tier.color }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <span className="text-[10px] font-medium" style={{ color: tier.color }}>
        {tier.label}
      </span>
    </div>
  )
}
