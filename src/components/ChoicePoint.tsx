import { motion } from 'framer-motion'
import type { ChoiceOption } from '../data/storyData'

interface Props {
  title: string
  options: ChoiceOption[]
  onSelect: (optionId: string) => void
  sceneImage?: string | null
}

function ChoiceCard({ option, index, onSelect }: { option: ChoiceOption; index: number; onSelect: (id: string) => void }) {
  return (
    <motion.button
      key={option.id}
      className="choice-card group"
      initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2 + index * 0.15 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(option.id)}
    >
      {/* Gradient accent bar */}
      <div
        className="absolute top-0 left-0 w-1 h-full rounded-l-xl"
        style={{
          background: index === 0
            ? 'linear-gradient(180deg, #c84b9e 0%, #e060b8 100%)'
            : 'linear-gradient(180deg, #8b5cf6 0%, #a78bfa 100%)',
        }}
      />

      <div className="flex flex-col gap-1.5 pl-4">
        <div className="flex items-center justify-between">
          <span className="text-textPrimary font-semibold text-base group-hover:text-white transition-colors">
            {option.label}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              color: index === 0 ? '#e060b8' : '#a78bfa',
              background: index === 0 ? 'rgba(200,75,158,0.12)' : 'rgba(139,92,246,0.12)',
            }}
          >
            {option.sceneHint}
          </span>
        </div>
        <p className="text-textSecondary text-sm leading-relaxed">{option.description}</p>
        {option.consequenceHint && (
          <motion.p
            className="text-xs italic leading-relaxed mt-0.5"
            style={{ color: index === 0 ? 'rgba(224,96,184,0.7)' : 'rgba(167,139,250,0.7)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 + index * 0.15 }}
          >
            {option.consequenceHint}
          </motion.p>
        )}
      </div>
    </motion.button>
  )
}

export function ChoicePoint({ title, options, onSelect, sceneImage }: Props) {
  return (
    <div className="flex flex-col items-center gap-6 px-4 py-8">
      {/* Title */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-textMuted text-xs uppercase tracking-[3px] mb-2">Your choice</p>
        <h2 className="text-textPrimary font-semibold text-xl">{title}</h2>
      </motion.div>

      {/* Choice cards with inline scene image between them */}
      <div className="w-full max-w-[500px] flex flex-col gap-3">
        {options.length >= 1 && (
          <ChoiceCard option={options[0]} index={0} onSelect={onSelect} />
        )}

        {/* Inline scene image divider */}
        {sceneImage && (
          <motion.div
            className="relative w-full rounded-xl overflow-hidden border border-border/30"
            style={{ height: '140px' }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            <img
              src={sceneImage}
              alt=""
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(180deg, rgba(13,10,18,0.2) 0%, rgba(13,10,18,0.5) 100%)',
              }}
            />
          </motion.div>
        )}

        {options.length >= 2 && (
          <ChoiceCard option={options[1]} index={1} onSelect={onSelect} />
        )}
      </div>

      {/* Subtle hint */}
      <motion.p
        className="text-textMuted text-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        This choice shapes your story
      </motion.p>
    </div>
  )
}
