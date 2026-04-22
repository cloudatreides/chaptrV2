import { useState } from 'react'
import { motion } from 'framer-motion'
import { Share2, Download, X, Loader2 } from 'lucide-react'
import { generateSceneImage } from '../lib/togetherAi'
import { trackEvent } from '../lib/supabase'

interface Props {
  scenePrompt: string
  beatTitle: string
  universeName: string
  chapter: number
  selfieUrl: string | null
  protagonistGender: 'male' | 'female'
  onDismiss: () => void
}

export function ShareSceneSheet({ scenePrompt, beatTitle, universeName, chapter, selfieUrl, protagonistGender, onDismiss }: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(false)

  const handleGenerate = async () => {
    setGenerating(true)
    setError(false)
    try {
      const url = await generateSceneImage({
        prompt: scenePrompt,
        width: 1080,
        height: 1920,
        referenceImageUrl: selfieUrl,
        protagonistGender,
        includesProtagonist: !!selfieUrl,
      })
      if (url) {
        setImageUrl(url)
        trackEvent('share_image_generated', { beat: beatTitle, universe: universeName, chapter })
      } else {
        setError(true)
      }
    } catch {
      setError(true)
    } finally {
      setGenerating(false)
    }
  }

  const handleShare = async () => {
    if (!imageUrl) return
    trackEvent('share_tapped', { beat: beatTitle, universe: universeName, chapter })

    const shareText = `Your K-drama scene just dropped — ${beatTitle} in ${universeName}`
    const shareUrl = window.location.origin

    if (navigator.share) {
      try {
        const response = await fetch(imageUrl)
        const blob = await response.blob()
        const file = new File([blob], 'chaptr-scene.png', { type: 'image/png' })
        await navigator.share({
          title: 'Chaptr',
          text: shareText,
          url: shareUrl,
          files: [file],
        })
        return
      } catch {
        // Fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
    } catch { /* silent */ }
  }

  const handleDownload = async () => {
    if (!imageUrl) return
    trackEvent('share_downloaded', { beat: beatTitle, universe: universeName, chapter })
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `chaptr-${beatTitle.toLowerCase().replace(/\s+/g, '-')}.png`
      a.click()
      URL.revokeObjectURL(url)
    } catch { /* silent */ }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/80" onClick={onDismiss} />
      <motion.div
        className="relative z-10 w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: '#151020' }}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <p className="text-textPrimary text-sm font-semibold">Share this moment</p>
            <p className="text-textMuted text-xs mt-0.5">Chapter {chapter} — {beatTitle}</p>
          </div>
          <button onClick={onDismiss} className="p-1.5 rounded-full hover:bg-white/5">
            <X size={16} className="text-textMuted" />
          </button>
        </div>

        <div className="px-5 pb-5">
          {!imageUrl && !generating && !error && (
            <button
              onClick={handleGenerate}
              className="w-full py-3 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #c84b9e)' }}
            >
              <Share2 size={16} />
              Generate your scene
            </button>
          )}

          {generating && (
            <div className="flex flex-col items-center py-8 gap-3">
              <Loader2 size={24} className="text-accent animate-spin" />
              <p className="text-textSecondary text-xs">Creating your scene...</p>
            </div>
          )}

          {error && (
            <button
              onClick={handleGenerate}
              className="w-full py-3 rounded-xl text-amber-400 text-sm font-semibold border border-amber-400/30"
            >
              Failed — tap to retry
            </button>
          )}

          {imageUrl && (
            <div className="space-y-3">
              <div className="rounded-xl overflow-hidden aspect-[9/16] max-h-[320px] mx-auto">
                <img src={imageUrl} alt="Your scene" className="w-full h-full object-cover" />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleShare}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #c84b9e)' }}
                >
                  <Share2 size={14} />
                  Share
                </button>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2.5 rounded-xl text-textSecondary text-sm border border-border hover:bg-white/5"
                >
                  <Download size={14} />
                </button>
              </div>
              <p className="text-textMuted text-[10px] text-center">
                Your K-drama scene just dropped
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
