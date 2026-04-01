import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Share2, RotateCcw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { generateRevealSignature } from '../lib/claudeStream'
import { generateSceneImage } from '../lib/togetherAi'

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY ?? ''

export function RevealPage() {
  const navigate = useNavigate()
  const {
    selfieUrl, characterState, choiceDescriptions,
    revealSignature, setRevealSignature,
    sceneImages, setSceneImage,
    resetStory,
  } = useStore()
  const summariesList = useStore.getState().getSummariesList()

  const [isLoading, setIsLoading] = useState(!revealSignature)
  const [revealedWords, setRevealedWords] = useState<string[]>([])
  const [showFull, setShowFull] = useState(false)
  const [bgImage, setBgImage] = useState<string | null>(sceneImages['reveal'] ?? null)
  const [copied, setCopied] = useState(false)

  // Generate signature on mount
  useEffect(() => {
    if (revealSignature) {
      animateWords(revealSignature)
      return
    }

    async function generate() {
      // Generate scene image in parallel
      const imagePromise = generateSceneImage({
        prompt: 'Anime style, ethereal dream-like scene, two silhouettes connected by glowing threads of light, abstract Seoul cityscape in background, cosmic purple and pink tones, emotional, beautiful',
      }).then((url) => {
        if (url) {
          setBgImage(url)
          setSceneImage('reveal', url)
        }
      })

      // Generate signature
      const sig = await generateRevealSignature({
        chatSummaries: summariesList,
        choiceHistory: choiceDescriptions,
        characterState,
        apiKey: API_KEY,
      })

      setRevealSignature(sig)
      await imagePromise
      setIsLoading(false)
      animateWords(sig)
    }

    generate()
  }, [])

  function animateWords(signature: string) {
    const words = signature.split(' ')
    words.forEach((word, i) => {
      setTimeout(() => {
        setRevealedWords((prev) => [...prev, word])
        if (i === words.length - 1) {
          setTimeout(() => setShowFull(true), 400)
        }
      }, 200 + i * 180)
    })
  }

  const handleShare = async () => {
    const text = `"${revealSignature}"\n\n— my story with Jiwon in Chaptr\nchaptr-v2.vercel.app`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  const handleReplay = () => {
    resetStory()
    navigate('/story')
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background layers */}
      {selfieUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${selfieUrl})`,
            filter: 'blur(40px) brightness(0.3)',
            transform: 'scale(1.2)',
          }}
        />
      )}
      {bgImage && (
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgImage})`, opacity: 0.3 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 2 }}
        />
      )}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(13,10,18,0.6) 0%, rgba(13,10,18,0.95) 100%)' }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-lg">
        {isLoading ? (
          <motion.div
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="w-12 h-12 rounded-full border-2 border-transparent border-t-accent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <p className="text-textSecondary text-sm">Reading your story...</p>
          </motion.div>
        ) : (
          <>
            {/* Character label */}
            <motion.p
              className="text-textMuted text-xs uppercase tracking-[3px] mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              Jiwon sees you as
            </motion.p>

            {/* Selfie */}
            {selfieUrl && (
              <motion.div
                className="w-20 h-20 rounded-full overflow-hidden border-2 mb-8"
                style={{ borderColor: '#c84b9e' }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <img src={selfieUrl} alt="You" className="w-full h-full object-cover" />
              </motion.div>
            )}

            {/* Signature — word by word */}
            <div className="min-h-[80px] flex items-center justify-center mb-8">
              <p
                className="text-textPrimary font-light leading-relaxed"
                style={{ fontSize: 28, fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: '-0.5px' }}
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

            {/* Actions */}
            <motion.div
              className="flex flex-col gap-3 w-full max-w-[280px]"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: showFull ? 1 : 0, y: showFull ? 0 : 16 }}
              transition={{ duration: 0.4 }}
            >
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white text-sm transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #c84b9e 0%, #8b5cf6 100%)' }}
              >
                <Share2 size={16} />
                {copied ? 'Copied!' : 'Share your story'}
              </button>

              <button
                onClick={handleReplay}
                className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-medium text-textSecondary text-sm border border-border hover:border-accent hover:text-textPrimary transition-all"
              >
                <RotateCcw size={16} />
                Try a different path
              </button>
            </motion.div>

            {/* Trust summary */}
            <motion.div
              className="mt-10 flex flex-col items-center gap-2"
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
                    animate={{ width: `${useStore.getState().characterState.junhoTrust}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
                <span className="text-textMuted text-xs">{useStore.getState().trustStatusLabel}</span>
              </div>
              <p className="text-textMuted text-xs">
                {choiceDescriptions.length} choices made · {Object.keys(useStore.getState().chatSummaries).length} conversations
              </p>
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}
