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

const ACCENT = ['#c84b9e', '#8b5cf6']
const ACCENT_LIGHT = ['#e060b8', '#a78bfa']

function ChoiceCard({ option, index, onSelect, image }: { option: ChoiceOption; index: number; onSelect: (id: string) => void; image?: string }) {
  const accent = ACCENT[index] ?? ACCENT[0]
  const accentLight = ACCENT_LIGHT[index] ?? ACCENT_LIGHT[0]

  return (
    <motion.button
      className="relative w-full text-left rounded-2xl overflow-hidden cursor-pointer group"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 + index * 0.15 }}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(option.id)}
      style={{ border: `1px solid rgba(255,255,255,0.07)` }}
    >
      {/* Image layer */}
      {image ? (
        <div className="relative h-[160px] w-full overflow-hidden">
          <img
            src={image}
            alt=""
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Gradient: image visible at top, dark at bottom for text */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, rgba(13,10,18,0.1) 0%, rgba(13,10,18,0.85) 70%, rgba(13,10,18,0.97) 100%)' }}
          />
        </div>
      ) : (
        /* Fallback: colored gradient panel */
        <div
          className="h-[80px] w-full"
          style={{ background: `linear-gradient(135deg, rgba(13,10,18,0.95) 0%, ${accent}22 100%)` }}
        />
      )}

      {/* Text content — overlaid on image bottom */}
      <div
        className="px-5 pb-4"
        style={{ marginTop: image ? '-48px' : '0', position: 'relative' }}
      >
        {/* Scene hint tag */}
        {option.sceneHint && (
          <span
            className="inline-block text-[10px] px-2 py-0.5 rounded-full font-medium mb-2"
            style={{ color: accentLight, background: `${accent}22`, border: `1px solid ${accent}44` }}
          >
            {option.sceneHint}
          </span>
        )}

        <p className="text-white font-semibold text-base leading-snug group-hover:text-white transition-colors mb-1">
          {option.label}
        </p>
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(240,236,248,0.65)' }}>
          {option.description}
        </p>
        {option.consequenceHint && (
          <motion.p
            className="text-xs italic mt-1.5"
            style={{ color: `${accentLight}b0` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 + index * 0.15 }}
          >
            {option.consequenceHint}
          </motion.p>
        )}
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, ${accent}, ${accentLight})`, opacity: 0.6 }}
      />
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
          {playerAvatar ? (
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 shrink-0" style={{ borderColor: '#c84b9e' }}>
            <img src={playerAvatar} alt={playerName ?? 'You'} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
            style={{ background: 'rgba(200,75,158,0.15)', border: '1px solid rgba(200,75,158,0.3)', color: '#e060b8' }}
          >
            {playerName?.[0]?.toUpperCase() ?? '?'}
          </div>
        )}
        <div className="text-center">
          <p className="text-textMuted text-xs uppercase tracking-[3px] mb-1.5">{playerName ? `${playerName}'s choice` : 'Your choice'}</p>
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
