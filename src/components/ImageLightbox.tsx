import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, ImagePlus, ChevronLeft, ChevronRight } from 'lucide-react'
import { useStore } from '../store/useStore'

interface Props {
  imageUrl: string | null
  label: string
  destinationId: string
  companionId: string
  onClose: () => void
  // Optional: when the source is a carousel, pass the full set so the
  // lightbox can show prev/next arrows. Falls back to single-image mode
  // when omitted or when length < 2.
  urls?: string[]
  labels?: string[]
}

export function ImageLightbox({ imageUrl, label, destinationId, companionId, onClose, urls, labels }: Props) {
  const addStoryMoment = useStore((s) => s.addStoryMoment)
  const storyMoments = useStore((s) => s.storyMoments)

  const hasGallery = !!urls && urls.length > 1
  const initialIndex = hasGallery ? Math.max(0, urls!.indexOf(imageUrl ?? '')) : 0
  const [index, setIndex] = useState(initialIndex)
  // Reset index whenever the parent opens the lightbox on a new image
  useEffect(() => {
    if (!imageUrl) return
    if (hasGallery) {
      const i = urls!.indexOf(imageUrl)
      setIndex(i >= 0 ? i : 0)
    } else {
      setIndex(0)
    }
  }, [imageUrl, hasGallery, urls])

  const currentUrl = hasGallery ? urls![index] ?? imageUrl : imageUrl
  const currentLabel = hasGallery ? (labels?.[index] ?? label) : label

  const alreadySaved = currentUrl ? storyMoments.some((m) => m.imageUrl === currentUrl) : false
  const [savedSet, setSavedSet] = useState<Set<string>>(new Set())
  const saved = alreadySaved || (currentUrl ? savedSet.has(currentUrl) : false)

  useEffect(() => {
    if (!imageUrl) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (hasGallery && e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1))
      if (hasGallery && e.key === 'ArrowRight') setIndex((i) => Math.min(urls!.length - 1, i + 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [imageUrl, onClose, hasGallery, urls])

  const handleSave = () => {
    if (!currentUrl || saved) return
    addStoryMoment({
      id: `travel-${Date.now()}`,
      imageUrl: currentUrl,
      characterIds: [companionId],
      universeId: `travel:${destinationId}`,
      beatLabel: currentLabel,
      note: '',
      timestamp: Date.now(),
    })
    setSavedSet((prev) => new Set(prev).add(currentUrl))
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
            key={currentUrl ?? ''}
            src={currentUrl ?? ''}
            alt={currentLabel}
            className="max-w-full max-h-full rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          {hasGallery && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setIndex((i) => Math.max(0, i - 1)) }}
                disabled={index === 0}
                aria-label="Previous"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/55 hover:bg-black/75 disabled:opacity-30 flex items-center justify-center text-white cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setIndex((i) => Math.min(urls!.length - 1, i + 1)) }}
                disabled={index >= urls!.length - 1}
                aria-label="Next"
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/55 hover:bg-black/75 disabled:opacity-30 flex items-center justify-center text-white cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronRight size={22} />
              </button>
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/55 text-white text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {index + 1} / {urls!.length}
              </div>
            </>
          )}

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
