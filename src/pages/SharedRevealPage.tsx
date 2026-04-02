import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { getPlaythrough, trackEvent } from '../lib/supabase'
import type { PlaythroughData } from '../lib/supabase'

export function SharedRevealPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [playthrough, setPlaythrough] = useState<(PlaythroughData & { id: string; created_at: string }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [revealedWords, setRevealedWords] = useState<string[]>([])
  const [showFull, setShowFull] = useState(false)

  useEffect(() => {
    if (!id) return

    async function load() {
      const data = await getPlaythrough(id!)
      if (!data) {
        setLoading(false)
        return
      }
      setPlaythrough(data)
      setLoading(false)
      trackEvent('shared_reveal_view', { playthrough_id: id })

      // Animate words
      if (data.reveal_signature) {
        const words = data.reveal_signature.split(' ')
        words.forEach((word, i) => {
          setTimeout(() => {
            setRevealedWords((prev) => [...prev, word])
            if (i === words.length - 1) {
              setTimeout(() => setShowFull(true), 400)
            }
          }, 200 + i * 180)
        })
      }
    }

    load()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen min-h-dvh bg-bg flex items-center justify-center">
        <motion.div
          className="w-12 h-12 rounded-full border-2 border-transparent border-t-accent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    )
  }

  if (!playthrough) {
    return (
      <div className="min-h-screen min-h-dvh bg-bg flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-textSecondary text-lg">Story not found</p>
        <button
          onClick={() => navigate('/')}
          className="text-accent text-sm hover:underline"
        >
          Write your own story
        </button>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen min-h-dvh flex flex-col items-center justify-center overflow-hidden">
      {/* Background */}
      {playthrough.selfie_url && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${playthrough.selfie_url})`,
            filter: 'blur(40px) brightness(0.3)',
            transform: 'scale(1.2)',
          }}
        />
      )}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(13,10,18,0.6) 0%, rgba(13,10,18,0.95) 100%)' }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 md:px-8 max-w-lg w-full">
        {/* Label */}
        <motion.p
          className="text-textMuted text-xs uppercase tracking-[3px] mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          They see you as
        </motion.p>

        {/* Selfie */}
        {playthrough.selfie_url && (
          <motion.div
            className="w-20 h-20 rounded-full overflow-hidden border-2 mb-8"
            style={{ borderColor: '#c84b9e' }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <img src={playthrough.selfie_url} alt="" className="w-full h-full object-cover" />
          </motion.div>
        )}

        {/* Signature */}
        <div className="min-h-[80px] flex items-center justify-center mb-8">
          <p
            className="text-textPrimary font-light leading-relaxed"
            style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: '-0.5px' }}
          >
            {revealedWords.map((word, i) => (
              <motion.span
                key={i}
                className="inline-block mr-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {word}
              </motion.span>
            ))}
          </p>
        </div>

        {/* Trust + stats */}
        <motion.div
          className="flex flex-col items-center gap-2 mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: showFull ? 1 : 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2">
            <div className="w-24 h-1.5 rounded-full bg-border overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #c84b9e 0%, #E879F9 100%)' }}
                initial={{ width: 0 }}
                animate={{ width: `${playthrough.trust_score}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
            {playthrough.trust_label && (
              <span className="text-textMuted text-xs">{playthrough.trust_label}</span>
            )}
          </div>
          <p className="text-textMuted text-xs">
            {playthrough.choices.length} choices made · {playthrough.chat_summaries.length} conversations
          </p>
        </motion.div>

        {/* CTA */}
        <motion.button
          onClick={() => navigate('/')}
          className="py-3.5 px-8 rounded-xl font-semibold text-white text-sm transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #c84b9e 0%, #8b5cf6 100%)' }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: showFull ? 1 : 0, y: showFull ? 0 : 16 }}
          transition={{ duration: 0.4 }}
        >
          Write your own story
        </motion.button>
      </div>
    </div>
  )
}
