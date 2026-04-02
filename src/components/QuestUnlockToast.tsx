import { motion } from 'framer-motion'
import { Sparkles, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getCharacter, CHARACTERS } from '../data/characters'
import { useActiveStory } from '../hooks/useActiveStory'
import type { QuestDef } from '../data/quests'

interface Props {
  quest: QuestDef
  onDismiss: () => void
}

export function QuestUnlockToast({ quest, onDismiss }: Props) {
  const navigate = useNavigate()
  const { loveInterest, selectedUniverse, characterPortraits } = useActiveStory()

  const resolvedCharId = quest.characterId === 'jiwon'
    ? (loveInterest === 'yuna' ? 'yuna' : 'jiwon')
    : quest.characterId
  const charData = getCharacter(resolvedCharId, selectedUniverse) ?? CHARACTERS[resolvedCharId]
  const portrait = characterPortraits[resolvedCharId] ?? null

  return (
    <motion.div
      className="fixed top-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none safe-top"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -60, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
    >
      <div
        className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border border-accent/30 max-w-[400px] w-full"
        style={{ background: 'rgba(200,75,158,0.1)', backdropFilter: 'blur(20px)' }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm overflow-hidden shrink-0"
          style={{ background: 'rgba(200,75,158,0.2)' }}
        >
          {portrait ? (
            <img src={portrait} alt={charData?.name} className="w-full h-full object-cover" />
          ) : (
            charData?.avatar ?? '💬'
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <Sparkles size={12} className="text-accent shrink-0" />
            <p className="text-accent text-[10px] font-semibold uppercase tracking-wider">Side Story Unlocked</p>
          </div>
          <p className="text-textPrimary text-sm font-medium truncate">{quest.title}</p>
          <p className="text-textSecondary text-xs truncate">{quest.description}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #c84b9e 0%, #8b5cf6 100%)' }}
            onClick={() => { onDismiss(); navigate(`/quest/${quest.id}`) }}
          >
            Play
          </button>
          <button
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-surfaceAlt transition-colors"
            onClick={onDismiss}
          >
            <X size={14} className="text-textMuted" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
