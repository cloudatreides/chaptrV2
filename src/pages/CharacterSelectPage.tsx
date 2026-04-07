import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, Plus, Trash2, User } from 'lucide-react'
import { useStore } from '../store/useStore'
import { getStoryData } from '../data/stories'

const MAX_CHARACTERS = 3

function getProgressLabel(storyProgress: Record<string, any>, charId: string, universeId: string | null): string {
  if (!universeId) return 'New story'
  const p = storyProgress[`${charId}:${universeId}`]
  if (!p) return 'New story'
  if (p.revealSignature) return 'Completed'
  if (p.currentStepIndex > 0) return `In progress`
  return 'New story'
}

export function CharacterSelectPage() {
  const navigate = useNavigate()
  const characters = useStore((s) => s.characters)
  const selectedUniverse = useStore((s) => s.selectedUniverse)
  const storyProgress = useStore((s) => s.storyProgress)
  const setActiveCharacter = useStore((s) => s.setActiveCharacter)
  const deleteCharacter = useStore((s) => s.deleteCharacter)

  const handleSelect = (charId: string) => {
    setActiveCharacter(charId)
    navigate('/story')
  }

  const handleDelete = (e: React.MouseEvent, charId: string) => {
    e.stopPropagation()
    deleteCharacter(charId)
  }

  return (
    <div className="min-h-screen min-h-dvh bg-bg flex flex-col">
      <div className="flex flex-col flex-1 w-full max-w-[520px] mx-auto px-5">
        {/* Nav */}
        <div className="flex items-center justify-between pt-12 pb-2">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #c84b9e 0%, #8b5cf6 100%)' }}>
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-textPrimary font-semibold">chaptr</span>
          </div>
        </div>

        {/* Back */}
        <button onClick={() => navigate('/universes')} className="flex items-center gap-1 text-textSecondary text-sm mt-4 mb-6 hover:text-textPrimary transition-colors w-fit">
          <ChevronLeft size={16} />
          Back
        </button>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-textPrimary font-bold text-3xl mb-1">Your Twins</h1>
          <p className="text-textSecondary text-base mb-6">Pick who enters this story, or create a new twin.</p>
        </motion.div>

        {/* Character cards */}
        <div className="space-y-3 mb-6">
          {characters.map((char, i) => {
            const label = getProgressLabel(storyProgress, char.id, selectedUniverse)
            const isCompleted = label === 'Completed'
            const isInProgress = label === 'In progress'
            return (
              <motion.button
                key={char.id}
                className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all hover:border-accent/50"
                style={{ background: '#13101c', border: '1px solid #2a2040' }}
                onClick={() => handleSelect(char.id)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 flex items-center justify-center" style={{ background: 'rgba(200,75,158,0.12)', border: '1px solid rgba(200,75,158,0.3)' }}>
                  {char.selfieUrl ? (
                    <img src={char.selfieUrl} alt={char.name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={20} className="text-accent" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-textPrimary font-semibold text-sm truncate">{char.name}</p>
                    <span className="text-textMuted text-xs">{char.gender === 'male' ? '♂' : '♀'}</span>
                  </div>
                  {(() => {
                    const sd = getStoryData(selectedUniverse)
                    if (sd) return null // non-romance stories don't show partner
                    return (
                      <p className="text-textMuted text-xs mt-0.5">
                        Partner: {char.gender === 'male' ? 'Yuna' : 'Jiwon'}
                      </p>
                    )
                  })()}
                </div>

                {/* Progress badge */}
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      color: isCompleted ? '#a78bfa' : isInProgress ? '#e060b8' : '#6b7280',
                      background: isCompleted ? 'rgba(139,92,246,0.12)' : isInProgress ? 'rgba(200,75,158,0.12)' : 'rgba(107,114,128,0.12)',
                    }}
                  >
                    {label}
                  </span>
                  <button
                    onClick={(e) => handleDelete(e, char.id)}
                    className="text-textMuted hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.button>
            )
          })}

          {/* Create new slot */}
          {characters.length < MAX_CHARACTERS ? (
            <motion.button
              className="w-full flex items-center justify-center gap-2 p-4 rounded-xl text-sm font-medium transition-all hover:border-accent/50"
              style={{ background: '#13101c', border: '1px dashed #2a2040', color: '#9ca3af' }}
              onClick={() => navigate('/create-character')}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: characters.length * 0.08 }}
            >
              <Plus size={16} />
              Create new twin
            </motion.button>
          ) : (
            <p className="text-textMuted text-xs text-center py-2">Maximum 3 twins</p>
          )}
        </div>
      </div>
    </div>
  )
}
