import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, Pencil, Plus, Trash2, User } from 'lucide-react'
import { useStore } from '../store/useStore'
import { SelfieImg } from '../components/SelfieImg'

const MAX_CHARACTERS = 3
const SG = "'Space Grotesk', sans-serif"

export function CharacterSelectPage() {
  const navigate = useNavigate()
  const characters = useStore((s) => s.characters)
  const activeCharacterId = useStore((s) => s.activeCharacterId)
  const setActiveCharacter = useStore((s) => s.setActiveCharacter)
  const deleteCharacter = useStore((s) => s.deleteCharacter)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const handleSetActive = (charId: string) => {
    setActiveCharacter(charId)
  }

  const handleDeleteClick = (e: React.MouseEvent, charId: string) => {
    e.stopPropagation()
    setDeleteTarget(charId)
  }

  const confirmDelete = () => {
    if (deleteTarget) deleteCharacter(deleteTarget)
    setDeleteTarget(null)
  }

  return (
    <div className="min-h-screen min-h-dvh bg-bg flex flex-col">
      <div className="flex flex-col flex-1 w-full max-w-[520px] mx-auto px-5">
        {/* Nav */}
        <div className="flex items-center justify-between pt-12 pb-2">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/home')}>
            <div className="relative shrink-0" style={{ width: 28, height: 28 }}>
              <div className="absolute" style={{ width: 17, height: 21, borderRadius: 3, background: '#7C3AED', transform: 'rotate(8deg)', top: 0, left: 5 }} />
              <div className="absolute" style={{ width: 17, height: 21, borderRadius: 3, background: '#A78BFA', transform: 'rotate(3deg)', top: 1.5, left: 3.5 }} />
              <div className="absolute" style={{ width: 17, height: 21, borderRadius: 3, background: '#E9D5FF', top: 3, left: 2 }} />
            </div>
            <span className="font-semibold" style={{ fontFamily: "'Syne', sans-serif", background: 'linear-gradient(180deg, #D4C4F0 0%, #B8A5E0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>chaptr</span>
          </div>
        </div>

        {/* Back */}
        <button onClick={() => navigate('/home')} className="flex items-center gap-1 text-textSecondary text-sm mt-4 mb-6 hover:text-textPrimary transition-colors w-fit">
          <ChevronLeft size={16} />
          Back
        </button>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-textPrimary font-bold text-3xl mb-1">Your Twins</h1>
          <p className="text-textSecondary text-base mb-6">Manage your characters. The active twin stars in all stories and trips.</p>
        </motion.div>

        {/* Character cards */}
        <div className="space-y-3 mb-6">
          {characters.map((char, i) => {
            const isActive = char.id === activeCharacterId
            return (
              <motion.div
                key={char.id}
                className="w-full flex items-center gap-4 p-4 rounded-xl"
                style={{
                  background: isActive ? 'rgba(200,75,158,0.06)' : '#13101c',
                  border: `1px solid ${isActive ? 'rgba(200,75,158,0.2)' : '#2a2040'}`,
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                {/* Avatar */}
                <button
                  onClick={() => handleSetActive(char.id)}
                  className="cursor-pointer w-12 h-12 rounded-full overflow-hidden shrink-0 flex items-center justify-center"
                  style={{ background: 'rgba(200,75,158,0.12)', border: `2px solid ${isActive ? '#c84b9e' : 'rgba(200,75,158,0.2)'}` }}
                >
                  {char.selfieUrl ? (
                    <SelfieImg src={char.selfieUrl} alt={char.name} className="w-full h-full object-cover" fallback={<User size={20} className="text-accent" />} />
                  ) : (
                    <User size={20} className="text-accent" />
                  )}
                </button>

                {/* Info — click to edit */}
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => navigate(`/create-character?edit=${char.id}`)}
                >
                  <div className="flex items-center gap-2">
                    <p className="text-textPrimary font-semibold text-sm truncate">{char.name}</p>
                    <span className="text-textMuted text-xs">{char.gender === 'male' ? '♂' : '♀'}</span>
                    {isActive && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(200,75,158,0.15)', color: '#c84b9e', fontFamily: SG }}>Active</span>
                    )}
                  </div>
                  {char.bio && (
                    <p className="text-textMuted text-xs mt-0.5 truncate">{char.bio.slice(0, 60)}...</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => navigate(`/create-character?edit=${char.id}`)}
                    className="cursor-pointer text-textMuted hover:text-accent transition-colors p-1.5 rounded-lg hover:bg-white/5"
                  >
                    <Pencil size={14} />
                  </button>
                  {!isActive && (
                    <button
                      onClick={() => handleSetActive(char.id)}
                      className="cursor-pointer text-xs px-2.5 py-1 rounded-lg font-medium transition-colors hover:bg-white/5"
                      style={{ color: 'rgba(255,255,255,0.5)', fontFamily: SG }}
                    >
                      Set active
                    </button>
                  )}
                  <button
                    onClick={(e) => handleDeleteClick(e, char.id)}
                    className="cursor-pointer text-textMuted hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-white/5"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            )
          })}

          {/* Create new slot */}
          {characters.length < MAX_CHARACTERS ? (
            <motion.button
              className="cursor-pointer w-full flex items-center justify-center gap-2 p-4 rounded-xl text-sm font-medium transition-all hover:border-accent/50"
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

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60" onClick={() => setDeleteTarget(null)} />
            <motion.div
              className="relative w-full max-w-[340px] rounded-2xl p-6 text-center"
              style={{ background: '#1a1525', border: '1px solid #2a2040' }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <p className="text-textPrimary font-semibold text-lg mb-1" style={{ fontFamily: SG }}>Delete twin?</p>
              <p className="text-textSecondary text-sm mb-6">
                This will permanently remove <span className="text-textPrimary font-medium">{characters.find((c) => c.id === deleteTarget)?.name}</span> and all their data.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="cursor-pointer flex-1 py-2.5 rounded-xl text-sm font-medium text-textSecondary transition-colors hover:text-textPrimary"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #2a2040' }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="cursor-pointer flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-colors hover:brightness-110"
                  style={{ background: '#dc2626' }}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
