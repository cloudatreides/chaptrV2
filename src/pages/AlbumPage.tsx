import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, X, Share2, Trash2, Camera } from 'lucide-react'
import { useStore } from '../store/useStore'
import { CAST_ROSTER } from '../data/castRoster'
import { AppSidebar } from '../components/AppSidebar'
import { getUniverseGenre, getMomentConfig } from '../data/storyData'
import type { StoryMoment } from '../store/useStore'

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getCharacterNames(ids: string[]): string {
  return ids.map((id) => CAST_ROSTER.find((c) => c.id === id)?.name ?? id).join(' & ')
}

function getUniverseLabel(universeId: string): string {
  const char = CAST_ROSTER.find((c) => c.universeId === universeId)
  return char?.universeLabel ?? universeId
}

export function AlbumPage() {
  const navigate = useNavigate()
  const storyMoments = useStore((s) => s.storyMoments)
  const updateMomentNote = useStore((s) => s.updateMomentNote)
  const deleteStoryMoment = useStore((s) => s.deleteStoryMoment)
  const selectedUniverse = useStore((s) => s.selectedUniverse)
  const genre = getUniverseGenre(selectedUniverse)
  const momentConfig = getMomentConfig(genre)

  const [selectedMoment, setSelectedMoment] = useState<StoryMoment | null>(null)
  const [editingNote, setEditingNote] = useState(false)
  const [noteDraft, setNoteDraft] = useState('')
  const [copied, setCopied] = useState(false)

  const handleOpen = (moment: StoryMoment) => {
    setSelectedMoment(moment)
    setNoteDraft(moment.note)
    setEditingNote(false)
  }

  const handleSaveNote = () => {
    if (selectedMoment) {
      updateMomentNote(selectedMoment.id, noteDraft)
      setSelectedMoment({ ...selectedMoment, note: noteDraft })
      setEditingNote(false)
    }
  }

  const handleShare = async (moment: StoryMoment) => {
    const chars = getCharacterNames(moment.characterIds)
    const text = `A moment with ${chars} in ${getUniverseLabel(moment.universeId)}${moment.note ? ` — "${moment.note}"` : ''}\n\nMade with Chaptr`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const handleDelete = (momentId: string) => {
    deleteStoryMoment(momentId)
    setSelectedMoment(null)
  }

  const sorted = [...storyMoments].sort((a, b) => b.timestamp - a.timestamp)

  // ─── Empty state ───
  const emptyState = (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center py-20 px-6">
      <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(200,75,158,0.08)' }}>
        <Camera size={28} className="text-accent/40" />
      </div>
      <div>
        <p className="text-white/40 text-sm font-medium mb-1">{momentConfig.emptyLabel}</p>
        <p className="text-white/35 text-xs leading-relaxed max-w-[260px]">
          {momentConfig.emptyDescription}
        </p>
      </div>
    </div>
  )

  // ─── Grid ───
  const grid = (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {sorted.map((moment) => (
        <button
          key={moment.id}
          onClick={() => handleOpen(moment)}
          className="cursor-pointer group relative aspect-[4/5] rounded-xl overflow-hidden border border-white/5 hover:border-accent/30 transition-colors"
        >
          <img
            src={moment.imageUrl}
            alt={moment.beatLabel}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="text-white text-xs font-semibold truncate">{getCharacterNames(moment.characterIds)}</p>
            <p className="text-white/40 text-[10px]">{moment.beatLabel}</p>
            {moment.note && (
              <p className="text-white/30 text-[10px] mt-1 truncate italic">"{moment.note}"</p>
            )}
          </div>
        </button>
      ))}
    </div>
  )

  // ─── Detail modal ───
  const detailModal = (
    <AnimatePresence>
      {selectedMoment && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/80" onClick={() => setSelectedMoment(null)} />
          <motion.div
            className="relative z-10 w-full max-w-lg rounded-2xl overflow-hidden"
            style={{ background: '#151020' }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            {/* Image */}
            <div className="relative aspect-[4/3]">
              <img src={selectedMoment.imageUrl} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => setSelectedMoment(null)}
                className="cursor-pointer absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white/70 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Info */}
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold text-sm">{getCharacterNames(selectedMoment.characterIds)}</p>
                  <p className="text-white/30 text-xs">{selectedMoment.beatLabel} · {formatDate(selectedMoment.timestamp)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleShare(selectedMoment)}
                    className="cursor-pointer w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors"
                    title="Share"
                  >
                    <Share2 size={14} className={copied ? 'text-green-400' : 'text-white/40'} />
                  </button>
                  <button
                    onClick={() => handleDelete(selectedMoment.id)}
                    className="cursor-pointer w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-500/10 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} className="text-white/20 hover:text-red-400" />
                  </button>
                </div>
              </div>

              {/* Note */}
              {editingNote ? (
                <div className="space-y-2">
                  <textarea
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    placeholder={momentConfig.notePrompt}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/35 outline-none focus:border-accent/30 resize-none"
                    rows={3}
                    autoFocus
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setEditingNote(false)}
                      className="cursor-pointer px-4 py-1.5 text-white/40 text-xs rounded-lg hover:text-white/60 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveNote}
                      className="cursor-pointer px-4 py-1.5 text-white text-xs font-medium rounded-lg transition-colors"
                      style={{ background: 'linear-gradient(135deg, #c84b9e, #8b5cf6)' }}
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => { setNoteDraft(selectedMoment.note); setEditingNote(true) }}
                  className="cursor-pointer w-full text-left px-4 py-3 rounded-xl border border-dashed border-white/10 hover:border-white/20 transition-colors"
                >
                  {selectedMoment.note ? (
                    <p className="text-white/60 text-sm italic">"{selectedMoment.note}"</p>
                  ) : (
                    <p className="text-white/35 text-sm">{momentConfig.notePrompt}</p>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  const content = (
    <div className="flex-1 overflow-y-auto">
      <div className="px-5 md:px-8 py-8 md:py-10 max-w-[800px]">
        {/* Mobile back */}
        <button
          onClick={() => navigate('/home')}
          className="md:hidden flex items-center gap-2 text-white/50 text-sm mb-6 cursor-pointer"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="mb-8">
          <h1 className="text-white font-bold text-2xl mb-1">{momentConfig.albumTitle}</h1>
          <p className="text-white/30 text-sm">
            {sorted.length === 0 ? momentConfig.albumSubtitle : `${sorted.length} moment${sorted.length === 1 ? '' : 's'} captured`}
          </p>
        </div>

        {sorted.length === 0 ? emptyState : grid}
      </div>
    </div>
  )

  return (
    <div className="bg-bg min-h-screen min-h-dvh">
      {/* Mobile */}
      <div className="md:hidden flex flex-col min-h-screen min-h-dvh">
        {content}
      </div>

      {/* Desktop */}
      <div className="hidden md:flex h-screen overflow-hidden">
        <AppSidebar />
        {content}
      </div>

      {detailModal}
    </div>
  )
}
