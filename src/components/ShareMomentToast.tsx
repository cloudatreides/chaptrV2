import { useState } from 'react'
import { motion } from 'framer-motion'
import { Share2, X } from 'lucide-react'
import { trackEvent } from '../lib/supabase'

interface Props {
  optionLabel: string
  universeName: string
  onDismiss: () => void
}

export function ShareMomentToast({ optionLabel, universeName, onDismiss }: Props) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const text = `I chose to "${optionLabel}" in ${universeName} on Chaptr`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      trackEvent('share_moment_clicked', { option: optionLabel, universe: universeName })
      setTimeout(() => setCopied(false), 1500)
    } catch { /* fallback */ }
  }

  return (
    <motion.div
      className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-32px)] max-w-[400px]"
      style={{ transform: 'translateX(-50%)' }}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <div
        className="rounded-2xl px-4 py-3.5 flex items-center gap-3"
        style={{
          background: 'rgba(19,16,28,0.95)',
          border: '1px solid rgba(200,75,158,0.25)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        <div className="flex-1 min-w-0">
          <p className="text-textPrimary text-sm font-medium truncate">
            I chose to "{optionLabel}"
          </p>
          <p className="text-textMuted text-xs mt-0.5">in {universeName}</p>
        </div>

        <button
          onClick={handleShare}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{
            background: copied ? 'rgba(34,197,94,0.2)' : 'rgba(200,75,158,0.15)',
            color: copied ? '#22c55e' : '#e060b8',
            border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : 'rgba(200,75,158,0.3)'}`,
          }}
        >
          <Share2 size={12} />
          {copied ? 'Copied!' : 'Share'}
        </button>

        <button
          onClick={onDismiss}
          className="shrink-0 p-1 rounded-full hover:bg-white/5 transition-colors"
        >
          <X size={14} className="text-textMuted" />
        </button>
      </div>
    </motion.div>
  )
}
