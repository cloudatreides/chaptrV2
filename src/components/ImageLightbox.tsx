import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, ImagePlus } from 'lucide-react'
import { useStore } from '../store/useStore'

interface Props {
  imageUrl: string | null
  label: string
  destinationId: string
  companionId: string
  onClose: () => void
}

export function ImageLightbox({ imageUrl, label, destinationId, companionId, onClose }: Props) {
  const addStoryMoment = useStore((s) => s.addStoryMoment)
  const storyMoments = useStore((s) => s.storyMoments)
  const alreadySaved = imageUrl ? storyMoments.some((m) => m.imageUrl === imageUrl) : false
  const [savedNow, setSavedNow] = useState(false)
  const saved = alreadySaved || savedNow

  useEffect(() => { setSavedNow(false) }, [imageUrl])

  useEffect(() => {
    if (!imageUrl) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [imageUrl, onClose])

  const handleSave = () => {
    if (!imageUrl || saved) return
    addStoryMoment({
      id: `travel-${Date.now()}`,
      imageUrl,
      characterIds: [companionId],
      universeId: `travel:${destinationId}`,
      beatLabel: label,
      note: '',
      timestamp: Date.now(),
    })
    setSavedNow(true)
  }

  return (
    <AnimatePresence>
      {imageUrl && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 cursor-zoom-out"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.img
            src={imageUrl}
            alt={label}
            className="max-w-full max-h-full rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleSave() }}
            disabled={saved}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium backdrop-blur-md cursor-pointer"
            style={{
              background: saved ? 'rgba(34,197,94,0.85)' : 'rgba(255,255,255,0.95)',
              color: saved ? 'white' : '#13101c',
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            {saved ? <><Check size={16} /> Saved to album</> : <><ImagePlus size={16} /> Save to album</>}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
