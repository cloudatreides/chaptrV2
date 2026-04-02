import { motion } from 'framer-motion'
import type { ChoiceOption } from '../data/storyData'

interface Props {
  title: string
  options: ChoiceOption[]
  onSelect: (optionId: string) => void
  optionImages?: Record<string, string> // optionId → image URL
  playerName?: string | null
  playerAvatar?: string | null
}

function ChoiceCard({ option, index, onSelect, image }: { option: ChoiceOption; index: number; onSelect: (id: string) => void; image?: string }) {
  return (
    <motion.button
      key={option.id}
      className="choice-card group overflow-hidden"
      initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2 + index * 0.15 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(option.id)}
    >
      {/* Per-option preview image */}
      {image && (
        <div className="relative -mx-5 -mt-4 mb-3 h-[100px] overflow-hidden">
          <img src={image} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(19,16,28,0) 30%, rgba(19,16,28,0.9) 100%)' }} />
        </div>
      )}

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

export function ChoicePoint({ title, options, onSelect, optionImages, playerName, playerAvatar }: Props) {
  return (
    <div className="flex flex-col items-center gap-6 px-4 py-8">
      {/* Player avatar + title */}
      <motion.div
        className="flex flex-col items-center gap-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {playerAvatar && (
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 shrink-0" style={{ borderColor: '#c84b9e' }}>
            <img src={playerAvatar} alt={playerName ?? 'You'} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="text-center">
          <p className="text-textMuted text-xs uppercase tracking-[3px] mb-2">{playerName ? `${playerName}'s choice` : 'Your choice'}</p>
          <h2 className="text-textPrimary font-semibold text-xl">{title}</h2>
        </div>
      </motion.div>

      {/* Choice cards with per-option images */}
      <div className="w-full max-w-[500px] flex flex-col gap-3">
        {options.map((option, i) => (
          <ChoiceCard
            key={option.id}
            option={option}
            index={i}
            onSelect={onSelect}
            image={optionImages?.[option.id]}
          />
        ))}
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
