import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Lock, Gem, Heart } from 'lucide-react'
import { getAvailableActions, CATEGORY_INFO, ACTION_DESCRIPTIONS, type ChatAction, type ActionCategory } from '../data/chatActions'
import { AFFINITY_TIERS, ROMANCE_AFFINITY_TIERS } from '../lib/affinity'

interface Props {
  playerGender: 'male' | 'female'
  characterGender: 'male' | 'female' | 'non-binary' | 'unknown'
  affinityScore: number
  gemBalance: number
  genre?: string
  isOnCooldown: (actionId: string) => boolean
  onAction: (action: ChatAction) => void
  disabled?: boolean
}

function getTierIndex(score: number, genre?: string): number {
  const tiers = genre === 'ROMANCE' ? ROMANCE_AFFINITY_TIERS : AFFINITY_TIERS
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (score >= tiers[i].min) return i
  }
  return 0
}

export function ChatActionTray({ playerGender, characterGender, affinityScore, gemBalance, genre, isOnCooldown, onAction, disabled }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<ActionCategory | null>(null)
  const [hoveredAction, setHoveredAction] = useState<string | null>(null)

  // Normalize non-binary/unknown to nearest for variant resolution
  const resolvedCharGender = characterGender === 'male' || characterGender === 'female'
    ? characterGender
    : 'female' // default for variant resolution

  const tierIndex = getTierIndex(affinityScore, genre)
  const { available, locked } = getAvailableActions(playerGender, resolvedCharGender, tierIndex)

  const categories: ActionCategory[] = ['playful', 'gift', 'emotional', 'romantic']
  const filteredAvailable = activeCategory
    ? available.filter(a => a.category === activeCategory)
    : available
  const filteredLocked = activeCategory
    ? locked.filter(a => a.category === activeCategory)
    : locked

  const tierLabels = (genre === 'ROMANCE' ? ROMANCE_AFFINITY_TIERS : AFFINITY_TIERS).map(t => t.label)

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="relative w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-30"
        style={{
          background: isOpen
            ? 'rgba(200,75,158,0.2)'
            : 'rgba(255,255,255,0.05)',
          border: `1px solid ${isOpen ? 'rgba(200,75,158,0.3)' : 'rgba(255,255,255,0.1)'}`,
        }}
      >
        {isOpen ? <X size={18} className="text-white/60" /> : <Plus size={18} className="text-white/60" />}
        {!isOpen && (
          <span
            className="absolute -top-1.5 -right-1.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-medium"
            style={{ background: 'rgba(251,191,36,0.15)', color: 'rgba(251,191,36,0.8)', border: '1px solid rgba(251,191,36,0.2)' }}
          >
            <Gem size={7} /> {gemBalance}
          </span>
        )}
      </button>

      {/* Action tray */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute bottom-full left-0 right-0 mb-2 mx-1 rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(14,12,22,0.97)',
              border: '1px solid rgba(200,75,158,0.15)',
              backdropFilter: 'blur(16px)',
              maxHeight: '320px',
            }}
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.2 }}
          >
            {/* Category tabs */}
            <div className="flex gap-1 p-2 border-b border-white/5">
              <button
                onClick={() => setActiveCategory(null)}
                className="px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors"
                style={{
                  background: !activeCategory ? 'rgba(200,75,158,0.15)' : 'transparent',
                  color: !activeCategory ? '#e060b8' : 'rgba(255,255,255,0.4)',
                }}
              >
                All
              </button>
              {categories.map(cat => {
                const info = CATEGORY_INFO[cat]
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors"
                    style={{
                      background: activeCategory === cat ? `${info.color}20` : 'transparent',
                      color: activeCategory === cat ? info.color : 'rgba(255,255,255,0.4)',
                    }}
                  >
                    {info.label}
                  </button>
                )
              })}
            </div>

            {/* Actions grid */}
            <div className="p-2 overflow-y-auto" style={{ maxHeight: '260px' }}>
              <div className="grid grid-cols-3 gap-1.5">
                {/* Available actions */}
                {filteredAvailable.map(action => {
                  const onCooldown = isOnCooldown(action.id)
                  const cantAfford = action.gemCost > 0 && gemBalance < action.gemCost
                  const isDisabled = onCooldown || cantAfford
                  const isHovered = hoveredAction === action.id
                  const desc = ACTION_DESCRIPTIONS[action.id]

                  return (
                    <div key={action.id} className="relative">
                      <button
                        onClick={() => {
                          if (!isDisabled) {
                            onAction(action)
                            setIsOpen(false)
                          }
                        }}
                        onMouseEnter={() => setHoveredAction(action.id)}
                        onMouseLeave={() => setHoveredAction(null)}
                        disabled={isDisabled}
                        className="w-full flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all hover:brightness-125 disabled:opacity-30 disabled:hover:brightness-100"
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.05)',
                        }}
                      >
                        <span className="text-lg">{action.emoji}</span>
                        <span className="text-[10px] text-white/70 font-medium text-center leading-tight">{action.label}</span>
                        <div className="flex items-center gap-1">
                          {action.gemCost > 0 && (
                            <span className="flex items-center gap-0.5 text-[9px]" style={{ color: cantAfford ? '#ef4444' : 'rgba(251,191,36,0.6)' }}>
                              <Gem size={8} /> {action.gemCost}
                            </span>
                          )}
                          {action.gemCost === 0 && (
                            <span className="text-[9px] text-white/20">free</span>
                          )}
                        </div>
                        {onCooldown && (
                          <span className="text-[8px] text-white/30">used</span>
                        )}
                      </button>

                      {/* Hover tooltip */}
                      <AnimatePresence>
                        {isHovered && !isDisabled && (
                          <motion.div
                            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 rounded-xl pointer-events-none"
                            style={{
                              background: 'rgba(14,12,22,0.97)',
                              border: '1px solid rgba(200,75,158,0.2)',
                              backdropFilter: 'blur(12px)',
                            }}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 4 }}
                            transition={{ duration: 0.15 }}
                          >
                            <p className="text-[10px] text-white/60 leading-snug mb-2">{desc}</p>
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1 text-[9px]" style={{ color: 'rgba(251,191,36,0.7)' }}>
                                <Gem size={8} /> {action.gemCost > 0 ? action.gemCost : 'Free'}
                              </span>
                              <span className="flex items-center gap-1 text-[9px]" style={{ color: 'rgba(200,75,158,0.7)' }}>
                                <Heart size={8} /> +{action.affinityBoost}{action.id === 'mystery-box' ? '~8' : ''} affinity
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}

                {/* Locked actions */}
                {filteredLocked.map(action => (
                  <div
                    key={action.id}
                    className="flex flex-col items-center gap-1 p-2.5 rounded-xl opacity-30"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.03)',
                    }}
                  >
                    <Lock size={14} className="text-white/30" />
                    <span className="text-[10px] text-white/40 font-medium text-center leading-tight">{action.label}</span>
                    <span className="text-[8px] text-white/20">{tierLabels[action.minTier]}</span>
                  </div>
                ))}
              </div>

              {filteredAvailable.length === 0 && filteredLocked.length === 0 && (
                <p className="text-center text-white/20 text-xs py-4">No actions in this category</p>
              )}
            </div>

            {/* Gem balance footer */}
            <div className="flex items-center justify-between px-3 py-2 border-t border-white/5">
              <span className="flex items-center gap-1 text-[10px] text-white/30">
                <Gem size={10} style={{ color: 'rgba(251,191,36,0.5)' }} />
                {gemBalance} gems
              </span>
              <span className="text-[9px] text-white/20">
                +{affinityScore}% affinity
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
