import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gem } from 'lucide-react'
import type { ChoiceOption } from '../data/storyData'
import { useStore } from '../store/useStore'

interface Props {
  title: string
  options: ChoiceOption[]
  onSelect: (optionId: string) => void
  optionImages?: Record<string, string>
  playerName?: string | null
  playerAvatar?: string | null
  sceneBackdrop?: string | null
  communityStats?: Record<string, number>
  selectedOptionId?: string | null
  showStats?: boolean
}

const ACCENT = ['#c84b9e', '#8b5cf6']
const ACCENT_LIGHT = ['#e060b8', '#a78bfa']
const ACCENT_PREMIUM = '#d4a017'
const ACCENT_PREMIUM_LIGHT = '#f5c842'

function ChoiceCard({ option, index, onSelect, image, hasBackdrop, disabled, isSelected, statPercent, showStat }: {
  option: ChoiceOption; index: number; onSelect: (id: string) => void; image?: string; hasBackdrop?: boolean
  disabled?: boolean; isSelected?: boolean; statPercent?: number; showStat?: boolean
}) {
  const isPremium = option.premium
  const accent = isPremium ? ACCENT_PREMIUM : (ACCENT[index] ?? ACCENT[0])
  const accentLight = isPremium ? ACCENT_PREMIUM_LIGHT : (ACCENT_LIGHT[index] ?? ACCENT_LIGHT[0])

  const gemBalance = useStore((s) => s.gemBalance)
  const canAfford = !isPremium || (gemBalance >= (option.gemCost ?? 0))
  const [showInsufficient, setShowInsufficient] = useState(false)

  const handleClick = () => {
    if (disabled) return
    if (isPremium && !canAfford) {
      setShowInsufficient(true)
      setTimeout(() => setShowInsufficient(false), 2000)
      return
    }
    onSelect(option.id)
  }

  return (
    <motion.button
      className={`relative w-full text-left rounded-2xl overflow-hidden group ${disabled ? 'pointer-events-none' : 'cursor-pointer'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: disabled ? (isSelected ? 1 : 0.5) : 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 + index * 0.15 }}
      whileHover={disabled ? undefined : { scale: 1.015 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      onClick={handleClick}
      style={{
        border: `1px solid ${isPremium ? 'rgba(212,160,23,0.4)' : isSelected ? 'rgba(200,75,158,0.5)' : `rgba(255,255,255,${hasBackdrop ? '0.12' : '0.07'})`}`,
        background: hasBackdrop ? 'rgba(13,10,18,0.7)' : undefined,
        backdropFilter: hasBackdrop ? 'blur(20px)' : undefined,
        WebkitBackdropFilter: hasBackdrop ? 'blur(20px)' : undefined,
        boxShadow: isPremium ? '0 0 20px rgba(212,160,23,0.15)' : undefined,
      }}
    >
      {/* Image layer */}
      {image ? (
        <div className="relative h-[220px] w-full overflow-hidden">
          <img src={image} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(13,10,18,0) 0%, rgba(13,10,18,0.6) 50%, rgba(13,10,18,0.97) 100%)' }} />
        </div>
      ) : (
        <div className="h-[80px] w-full" style={{ background: `linear-gradient(135deg, rgba(13,10,18,0.95) 0%, ${accent}22 100%)` }} />
      )}

      {/* Text content */}
      <div className="px-5 pb-5" style={{ marginTop: image ? '-56px' : '0', position: 'relative' }}>
        <div className="flex items-center gap-2 mb-2">
          {option.sceneHint && (
            <span
              className="inline-block text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{ color: accentLight, background: `${accent}22`, border: `1px solid ${accent}44` }}
            >
              {option.sceneHint}
            </span>
          )}
          {isPremium && (
            <span
              className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold"
              style={{ color: ACCENT_PREMIUM_LIGHT, background: 'rgba(212,160,23,0.15)', border: '1px solid rgba(212,160,23,0.4)' }}
            >
              <Gem size={10} /> {option.gemCost}
            </span>
          )}
        </div>

        <p className="text-white font-semibold text-lg leading-snug group-hover:text-white transition-colors mb-1">
          {option.label}
        </p>
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(240,236,248,0.65)' }}>
          {option.description}
        </p>
        {option.consequenceHint && (
          <motion.p
            className="text-xs italic mt-2"
            style={{ color: `${accentLight}b0` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 + index * 0.15 }}
          >
            {option.consequenceHint}
          </motion.p>
        )}

        {/* Insufficient gems warning */}
        <AnimatePresence>
          {showInsufficient && (
            <motion.p
              className="text-xs mt-2 font-medium"
              style={{ color: '#ef4444' }}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              Not enough gems ({gemBalance}/{option.gemCost})
            </motion.p>
          )}
        </AnimatePresence>

        {/* Community stat bar */}
        <AnimatePresence>
          {showStat && statPercent !== undefined && (
            <motion.div
              className="mt-3 flex items-center gap-2"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
            >
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: isSelected ? `linear-gradient(90deg, ${accent}, ${accentLight})` : 'rgba(255,255,255,0.2)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${statPercent}%` }}
                  transition={{ duration: 0.8, delay: 0.3 + index * 0.1, ease: 'easeOut' }}
                />
              </div>
              <span className="text-[11px] font-medium shrink-0" style={{ color: isSelected ? accentLight : 'rgba(255,255,255,0.4)' }}>
                {statPercent}%
              </span>
              {statPercent < 30 && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)' }}>
                  rare
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Selected checkmark */}
      {isSelected && (
        <motion.div
          className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: accent }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        >
          <span className="text-white text-xs">✓</span>
        </motion.div>
      )}

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, ${accent}, ${accentLight})`, opacity: 0.6 }}
      />
    </motion.button>
  )
}

export function ChoicePoint({ title, options, onSelect, optionImages, playerName, playerAvatar, sceneBackdrop, communityStats, selectedOptionId, showStats }: Props) {
  return (
    <div className="relative flex flex-col items-center justify-center gap-8 px-4 min-h-[calc(100vh-80px)]">
      {/* Scene backdrop */}
      {sceneBackdrop && (
        <>
          <div className="fixed inset-0 z-0">
            <img src={sceneBackdrop} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(13,10,18,0.55) 0%, rgba(13,10,18,0.85) 70%, rgba(13,10,18,0.95) 100%)' }} />
          </div>
          <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: 3 + (i % 3) * 2,
                  height: 3 + (i % 3) * 2,
                  background: i % 2 === 0 ? 'rgba(200,75,158,0.4)' : 'rgba(139,92,246,0.3)',
                  left: `${15 + i * 13}%`,
                  top: `${20 + (i * 17) % 60}%`,
                }}
                animate={{ y: [0, -30 - i * 5, 0], opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 4 + i * 0.8, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
              />
            ))}
          </div>
        </>
      )}

      {/* Content layer */}
      <div className="relative z-10 flex flex-col items-center gap-8 w-full">
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {playerAvatar ? (
            <motion.div
              className="w-14 h-14 rounded-full overflow-hidden shrink-0"
              style={{ border: '2px solid #c84b9e', boxShadow: sceneBackdrop ? '0 0 20px rgba(200,75,158,0.3)' : undefined }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <img src={playerAvatar} alt={playerName ?? 'You'} className="w-full h-full object-cover" />
            </motion.div>
          ) : (
            <motion.div
              className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
              style={{
                background: 'rgba(200,75,158,0.15)',
                border: '1px solid rgba(200,75,158,0.3)',
                color: '#e060b8',
                boxShadow: sceneBackdrop ? '0 0 20px rgba(200,75,158,0.2)' : undefined,
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              {playerName?.[0]?.toUpperCase() ?? '?'}
            </motion.div>
          )}
          <div className="text-center">
            <p className="text-textMuted text-xs uppercase tracking-[3px] mb-1.5">{playerName ? `${playerName}'s choice` : 'Your choice'}</p>
            <h2 className="text-textPrimary font-semibold text-2xl">{title}</h2>
          </div>
        </motion.div>

        {/* Choice cards */}
        <div className="w-full max-w-[500px] flex flex-col gap-4">
          {options.map((option, i) => (
            <ChoiceCard
              key={option.id}
              option={option}
              index={i}
              onSelect={onSelect}
              image={optionImages?.[option.id]}
              hasBackdrop={!!sceneBackdrop}
              disabled={!!selectedOptionId}
              isSelected={selectedOptionId === option.id}
              statPercent={communityStats?.[option.id]}
              showStat={showStats}
            />
          ))}
        </div>

        {/* Hint text */}
        <motion.p
          className="text-textMuted text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {showStats ? (selectedOptionId && communityStats?.[selectedOptionId] && communityStats[selectedOptionId] < 30
            ? 'You took the road less traveled'
            : 'Here\'s how others chose') : 'This choice shapes your story'}
        </motion.p>
      </div>
    </div>
  )
}
