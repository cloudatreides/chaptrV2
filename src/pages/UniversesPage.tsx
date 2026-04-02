import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, BookOpen, Lock, X } from 'lucide-react'
import { useStore } from '../store/useStore'
import { UNIVERSES, GENRE_FILTERS } from '../data/storyData'
import type { Universe } from '../data/storyData'
import { trackEvent } from '../lib/supabase'

export function UniversesPage() {
  const navigate = useNavigate()
  const setSelectedUniverse = useStore((s) => s.setSelectedUniverse)
  const [activeFilter, setActiveFilter] = useState('ALL')
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [selectedUniverse, setSelected] = useState<Universe | null>(null)

  const filtered = UNIVERSES
    .filter((u) => activeFilter === 'ALL' || u.genre === activeFilter)
    .sort((a, b) => Number(a.locked) - Number(b.locked))

  const handleBegin = () => {
    if (!selectedUniverse) return
    setSelectedUniverse(selectedUniverse.id)
    trackEvent('universe_select', { universe: selectedUniverse.id })
    navigate('/characters')
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
          <span className="text-textSecondary text-sm">Step 1 of 3</span>
        </div>

        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-textSecondary text-sm mt-4 mb-6 hover:text-textPrimary transition-colors w-fit">
          <ChevronLeft size={16} />
          Back
        </button>

        {/* Heading */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-textPrimary font-bold text-3xl mb-1">Choose Your Story</h1>
          <p className="text-textSecondary text-base mb-5">Tap a universe to begin.</p>
        </motion.div>

        {/* Genre filters */}
        <motion.div
          className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none"
          style={{ scrollbarWidth: 'none' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {GENRE_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                background: activeFilter === f ? 'linear-gradient(135deg, #c84b9e 0%, #8b5cf6 100%)' : '#1a1525',
                color: activeFilter === f ? '#fff' : '#9b8db8',
                border: activeFilter === f ? 'none' : '1px solid #2a2040',
              }}
            >
              {f}
            </button>
          ))}
        </motion.div>

        {/* Story cards */}
        <div className="flex-1 space-y-4 overflow-y-auto pb-8 safe-bottom">
          {filtered.map((universe, i) => (
            <motion.div
              key={universe.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative rounded-2xl overflow-hidden cursor-pointer"
              style={{ border: hoveredId === universe.id && !universe.locked ? '1px solid rgba(200,75,158,0.5)' : '1px solid #2a2040' }}
              onMouseEnter={() => !universe.locked && setHoveredId(universe.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => !universe.locked && setSelected(universe)}
            >
              {/* Image */}
              <div
                className="h-40 bg-cover bg-center relative"
                style={{ backgroundImage: `url(${universe.image})`, backgroundColor: '#1a1525' }}
              >
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(13,10,18,0) 40%, rgba(13,10,18,0.9) 100%)' }} />
                {universe.locked && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <Lock size={24} className="text-textSecondary" />
                      {universe.lockedLabel && (
                        <span className="text-xs font-bold px-2 py-1 rounded-full text-white" style={{ background: '#2a2040' }}>{universe.lockedLabel}</span>
                      )}
                    </div>
                  </div>
                )}
                {/* Genre tag */}
                <div className="absolute bottom-3 left-3">
                  <span
                    className="text-xs font-bold px-2 py-1 rounded-full"
                    style={{ background: 'rgba(200,75,158,0.3)', color: '#f0ecf8', backdropFilter: 'blur(4px)' }}
                  >
                    {universe.genreTag}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4" style={{ background: '#13101c' }}>
                <h3 className="text-textPrimary font-semibold text-base mb-1">{universe.title}</h3>
                <p className="text-textSecondary text-sm leading-relaxed line-clamp-2">{universe.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Begin Story Modal ── */}
      <AnimatePresence>
        {selectedUniverse && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
            />

            {/* Modal */}
            <motion.div
              className="fixed z-50 inset-0 flex items-end md:items-center justify-center pointer-events-none"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
            <div className="w-full max-w-md pointer-events-auto">
              <div
                className="mx-4 mb-6 md:mb-0 rounded-2xl overflow-hidden"
                style={{ background: '#13101c', border: '1px solid #2a2040' }}
              >
                {/* Image header */}
                <div
                  className="h-44 bg-cover bg-center relative"
                  style={{ backgroundImage: `url(${selectedUniverse.image})`, backgroundColor: '#1a1525' }}
                >
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(19,16,28,0) 30%, rgba(19,16,28,1) 100%)' }} />
                  <button
                    className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors"
                    style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
                    onClick={() => setSelected(null)}
                  >
                    <X size={16} />
                  </button>
                  <div className="absolute bottom-3 left-4">
                    <span
                      className="text-xs font-bold px-2 py-1 rounded-full"
                      style={{ background: 'rgba(200,75,158,0.4)', color: '#f0ecf8', backdropFilter: 'blur(4px)' }}
                    >
                      {selectedUniverse.genreTag}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="px-5 pb-5 pt-1">
                  <h3 className="text-textPrimary font-bold text-xl mb-2">{selectedUniverse.title}</h3>
                  <p className="text-textSecondary text-sm leading-relaxed mb-5">{selectedUniverse.description}</p>

                  <button
                    className="btn-accent flex items-center justify-center gap-2"
                    onClick={handleBegin}
                  >
                    <BookOpen size={18} />
                    Begin Story
                  </button>
                </div>
              </div>
            </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
