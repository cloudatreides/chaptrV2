import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Share2, RotateCcw, MessageCircle, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { useActiveStory } from '../hooks/useActiveStory'
import { generateRevealSignature } from '../lib/claudeStream'
import { getAffinityTier } from '../lib/affinity'
import { getCharacter, CHARACTERS } from '../data/characters'
import { getRevealPerspective } from '../data/storyHelpers'
import { generateSceneImage } from '../lib/togetherAi'
import { trackEvent, savePlaythrough } from '../lib/supabase'

export function RevealPage() {
  const navigate = useNavigate()
  const {
    selfieUrl, characterState, choiceDescriptions,
    revealSignature: storedSignature, sceneImages,
    selectedUniverse, bio, loveInterest, trustStatusLabel,
    chatSummaries, characterAffinities,
  } = useActiveStory()
  const setRevealSignature = useStore((s) => s.setRevealSignature)
  const setSceneImage = useStore((s) => s.setSceneImage)
  const resetStory = useStore((s) => s.resetStory)
  const addPlaythroughRecord = useStore((s) => s.addPlaythroughRecord)
  const activeCharacterId = useStore((s) => s.activeCharacterId)
  const summariesList = Object.values(chatSummaries)

  const junhoTrust = characterState.junhoTrust
  const choiceCount = choiceDescriptions.length
  const chatCount = Object.keys(chatSummaries).length

  const [isLoading, setIsLoading] = useState(!storedSignature)
  const [revealedWords, setRevealedWords] = useState<string[]>([])
  const [showFull, setShowFull] = useState(false)
  const [bgImage, setBgImage] = useState<string | null>(sceneImages['reveal'] ?? null)
  const [copied, setCopied] = useState(false)
  const [shareId, setShareId] = useState<string | null>(null)

  // Generate signature on mount
  useEffect(() => {
    if (storedSignature) {
      animateWords(storedSignature)
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
        loveInterest,
        universeId: selectedUniverse,
      })

      setRevealSignature(sig)

      // Record playthrough for cross-story memory
      if (activeCharacterId) {
        addPlaythroughRecord({
          universeId: selectedUniverse ?? 'seoul-transfer',
          characterId: activeCharacterId,
          choices: choiceDescriptions,
          signature: sig,
          completedAt: Date.now(),
          trustScore: junhoTrust,
        })
      }

      await imagePromise
      setIsLoading(false)
      animateWords(sig)
      trackEvent('reveal_reached', { trust: junhoTrust })

      // Save playthrough for share URL
      const id = await savePlaythrough({
        universe_id: selectedUniverse ?? 'seoul-transfer',
        choices: choiceDescriptions,
        chat_summaries: summariesList,
        trust_score: junhoTrust,
        trust_label: trustStatusLabel,
        reveal_signature: sig,
        selfie_url: selfieUrl,
        bio,
        love_interest: loveInterest,
      })
      if (id) setShareId(id)
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
    const shareUrl = shareId
      ? `${window.location.origin}/s/${shareId}`
      : 'chaptr-v2.vercel.app'
    const liName = loveInterest === 'yuna' ? 'Yuna' : 'Jiwon'
    const text = `"${storedSignature}"\n\n— my story with ${liName} in Chaptr\n${shareUrl}`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      trackEvent('share_clicked', { method: 'clipboard', hasShareUrl: !!shareId })
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
    <div className="relative min-h-screen min-h-dvh flex flex-col items-center justify-center overflow-hidden">
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
      <div className="relative z-10 flex flex-col items-center text-center px-6 md:px-8 max-w-lg w-full">
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
              {getRevealPerspective(selectedUniverse, loveInterest)}
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

            {/* Actions */}
            <motion.div
              className="flex flex-col gap-3 w-full max-w-[280px] pb-6 safe-bottom"
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
                onClick={() => navigate('/free-chat')}
                className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-medium text-textSecondary text-sm border border-border hover:border-accent hover:text-textPrimary transition-all"
              >
                <MessageCircle size={16} />
                Keep talking
              </button>

              <button
                onClick={handleReplay}
                className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-medium text-textSecondary text-sm border border-border hover:border-accent hover:text-textPrimary transition-all"
              >
                <RotateCcw size={16} />
                Try a different path
              </button>

              <button
                onClick={() => navigate('/home')}
                className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-medium text-textMuted text-sm hover:text-textSecondary transition-colors"
              >
                <ArrowLeft size={16} />
                Back to home
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
                    animate={{ width: `${junhoTrust}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
                <span className="text-textMuted text-xs">{trustStatusLabel}</span>
              </div>
              <p className="text-textMuted text-xs">
                {choiceCount} choices made · {chatCount} conversations
              </p>
              {Object.keys(characterAffinities).length > 0 && (
                <div className="flex items-center gap-4 mt-3">
                  {Object.entries(characterAffinities).map(([charId, score]) => {
                    const charData = getCharacter(charId, selectedUniverse) ?? CHARACTERS[charId]
                    const tier = getAffinityTier(score)
                    return (
                      <div key={charId} className="flex items-center gap-1.5">
                        <span className="text-textMuted text-[10px]">{charData?.name ?? charId}</span>
                        <span className="text-[10px] font-medium" style={{ color: tier.color }}>{tier.label}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}
