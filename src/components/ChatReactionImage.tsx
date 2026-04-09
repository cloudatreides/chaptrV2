import { useState } from 'react'
import { motion } from 'framer-motion'
import { ImagePlus, Check } from 'lucide-react'

interface Props {
  imageUrl: string
  characterName: string
  onSaveToAlbum: () => void
}

/** Renders an AI-generated character reaction image inline in the chat thread with a save-to-album option */
export function ChatReactionImage({ imageUrl, characterName, onSaveToAlbum }: Props) {
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    onSaveToAlbum()
    setSaved(true)
  }

  return (
    <motion.div
      className="w-full max-w-[240px] rounded-xl overflow-hidden relative group"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <img
        src={imageUrl}
        alt={`${characterName} reacting`}
        className="w-full h-auto rounded-xl"
      />
      {/* Save to album overlay — appears on hover/tap */}
      <motion.button
        className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium backdrop-blur-sm transition-colors"
        style={{
          background: saved ? 'rgba(34,197,94,0.7)' : 'rgba(0,0,0,0.55)',
          color: 'rgba(255,255,255,0.9)',
        }}
        onClick={handleSave}
        disabled={saved}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.3 }}
        whileTap={{ scale: 0.95 }}
      >
        {saved ? (
          <>
            <Check size={12} /> Saved
          </>
        ) : (
          <>
            <ImagePlus size={12} /> Save
          </>
        )}
      </motion.button>
    </motion.div>
  )
}
