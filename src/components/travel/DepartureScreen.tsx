import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plane } from 'lucide-react'
import { generateSceneImage } from '../../lib/togetherAi'
import { ambientAudio } from '../../lib/ambientAudio'
import { SelfieImg } from '../SelfieImg'

const SG = "'Space Grotesk', sans-serif"
const SYNE = "'Syne', sans-serif"

const BEATS = [
  { text: 'Packing bags...', icon: '🎒' },
  { text: 'Heading to the airport...', icon: '🚕' },
  { text: 'Boarding now...', icon: '✈️' },
  { text: 'Cruising at 35,000 ft...', icon: '☁️' },
  { text: 'Touching down...', icon: '🛬' },
]

interface DepartureScreenProps {
  cityName: string
  countryEmoji: string
  companionName: string
  companionPortrait?: string
  companionDescription: string
  twinSelfieUrl?: string | null
  twinGender: 'male' | 'female'
  companionGender?: 'male' | 'female' | 'non-binary' | 'unknown'
  heroImage?: string
  highlights?: string[]
  onContinue: () => void
  onImageGenerated: (url: string) => void
  existingImageUrl?: string
}

function genderNoun(g: 'male' | 'female' | 'non-binary' | 'unknown' | undefined, fallback: 'man' | 'woman'): string {
  if (g === 'male') return 'young man'
  if (g === 'female') return 'young woman'
  return `young ${fallback}`
}

export function DepartureScreen({
  cityName,
  countryEmoji,
  companionName,
  companionPortrait,
  companionDescription,
  twinSelfieUrl,
  twinGender,
  companionGender,
  heroImage,
  onContinue,
  onImageGenerated,
  existingImageUrl,
}: DepartureScreenProps) {
  const [beat, setBeat] = useState(0)
  const [beatsFinished, setBeatsFinished] = useState(false)
  const [imageReady, setImageReady] = useState(!!existingImageUrl)
  const generating = useRef(false)

  // Kick off image generation in background
  useEffect(() => {
    if (existingImageUrl || generating.current) return
    generating.current = true

    const hasBothRefs = !!(twinSelfieUrl && companionPortrait)
    const protagNoun = genderNoun(twinGender, 'man')
    const compNoun = genderNoun(companionGender, 'woman')
    const prompt = hasBothRefs
      ? `A ${protagNoun} (the protagonist, from image 1) and a ${compNoun} (their travel companion, from image 2) standing side by side at an airport gate, both with backpacks, excited to travel to ${cityName}. A plane visible through the window behind them. Warm golden hour light streaming through large terminal windows, no text, no signs, no departure boards`
      : `Cinematic wide shot of ${cityName} skyline at golden hour, seen through an airport terminal window. A plane on the tarmac ready for departure. Warm sunlight, atmospheric, no people, no text, no signs`

    generateSceneImage({
      prompt,
      width: 768,
      height: 576,
      referenceImageUrl: twinSelfieUrl || undefined,
      companionReferenceUrl: companionPortrait || undefined,
      companionDescription,
      includesProtagonist: hasBothRefs,
      protagonistGender: twinGender,
      companionGender,
    }).then((url) => {
      if (url) onImageGenerated(url)
      setImageReady(true)
    })
  }, [])

  // Animated beat sequence
  useEffect(() => {
    if (beat < BEATS.length) {
      if (beat > 0) ambientAudio.playSfx('beat-tick')
      if (beat === 2) ambientAudio.playSfx('whoosh')
      const t = setTimeout(() => setBeat((b) => b + 1), 1400)
      return () => clearTimeout(t)
    }
    ambientAudio.playSfx('arrival-chime')
    const t = setTimeout(() => setBeatsFinished(true), 800)
    return () => clearTimeout(t)
  }, [beat])

  // Auto-continue only when beats are done AND image is ready (or max 20s timeout)
  useEffect(() => {
    if (!beatsFinished) return
    if (imageReady) {
      const t = setTimeout(onContinue, 600)
      return () => clearTimeout(t)
    }
    const maxWait = setTimeout(() => onContinue(), 8000)
    return () => clearTimeout(maxWait)
  }, [beatsFinished, imageReady])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: '#0D0B12' }}
    >
      {/* Background hero image */}
      {heroImage && (
        <div className="absolute inset-0">
          <motion.img
            src={heroImage}
            alt=""
            className="w-full h-full object-cover"
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.3 }}
            transition={{ duration: 4, ease: 'easeOut' }}
            style={{ filter: 'brightness(0.6) saturate(0.5)' }}
          />
        </div>
      )}

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(13,11,18,0.6) 0%, rgba(13,11,18,0.25) 40%, rgba(13,11,18,0.25) 55%, rgba(13,11,18,0.9) 100%)',
        }}
      />

      {/* Moving ambient glow */}
      <motion.div
        className="absolute"
        animate={{ x: ['-10%', '10%', '-10%'], y: ['-5%', '5%', '-5%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: '60%',
          maxWidth: 350,
          aspectRatio: '1',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md">
        {/* Companion + Twin avatars */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 180, damping: 18 }}
          className="flex items-center -space-x-3 mb-8"
        >
          {twinSelfieUrl && (
            <div
              className="w-16 h-16 rounded-full overflow-hidden relative z-10"
              style={{ border: '2.5px solid rgba(139,92,246,0.5)' }}
            >
              <SelfieImg
                src={twinSelfieUrl}
                alt="You"
                className="w-full h-full object-cover"
                fallback={
                  <div className="w-full h-full flex items-center justify-center text-lg" style={{ background: '#2D2538' }}>
                    {twinGender === 'male' ? '🧑' : '👩'}
                  </div>
                }
              />
            </div>
          )}
          {companionPortrait && (
            <div
              className="w-16 h-16 rounded-full overflow-hidden relative"
              style={{ border: '2.5px solid rgba(167,139,250,0.4)' }}
            >
              <SelfieImg
                src={companionPortrait}
                alt={companionName}
                className="w-full h-full object-cover"
                fallback={
                  <div className="w-full h-full flex items-center justify-center text-lg" style={{ background: '#2D2538' }}>✈️</div>
                }
              />
            </div>
          )}
        </motion.div>

        {/* Destination headline */}
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-white/40 text-xs uppercase tracking-[3px] mb-2"
          style={{ fontFamily: SG }}
        >
          {countryEmoji} {cityName}
        </motion.p>

        <motion.h2
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-white font-bold mb-2"
          style={{
            fontFamily: SYNE,
            letterSpacing: '-0.02em',
            fontSize: 'clamp(28px, 5vw, 40px)',
          }}
        >
          You & {companionName}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="text-white/35 text-sm mb-10"
          style={{ fontFamily: SG }}
        >
          {twinGender === 'female' ? 'Two girls' : twinGender === 'male' ? 'Two friends' : 'Two travelers'}, one trip.
        </motion.p>

        {/* Animated beats */}
        <div className="h-12 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {beat < BEATS.length ? (
              <motion.div
                key={beat}
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -12, opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="flex items-center gap-2.5"
              >
                <span className="text-lg">{BEATS[beat].icon}</span>
                <span className="text-white/60 text-sm font-medium" style={{ fontFamily: SG }}>
                  {BEATS[beat].text}
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="arrived"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="flex items-center gap-2"
              >
                {imageReady ? (
                  <>
                    <span className="text-lg">🌏</span>
                    <span className="text-white/80 text-sm font-semibold" style={{ fontFamily: SG }}>
                      You're here.
                    </span>
                  </>
                ) : (
                  <motion.span
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-white/60 text-sm font-medium"
                    style={{ fontFamily: SG }}
                  >
                    Almost there...
                  </motion.span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex gap-2 mt-6"
        >
          {BEATS.map((_, i) => (
            <motion.div
              key={i}
              className="rounded-full"
              animate={{
                width: i === beat ? 20 : 6,
                background: i <= beat ? '#A78BFA' : 'rgba(255,255,255,0.15)',
              }}
              transition={{ duration: 0.3 }}
              style={{ height: 6 }}
            />
          ))}
        </motion.div>

        {/* Animated plane across screen */}
        <motion.div
          className="absolute -bottom-16 left-0 right-0 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ delay: 1 }}
        >
          <motion.div
            animate={{ x: ['-50vw', '50vw'] }}
            transition={{ duration: 4, ease: 'easeInOut' }}
          >
            <Plane size={18} className="text-purple-300 -rotate-12" />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}
