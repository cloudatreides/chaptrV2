import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plane, MapPin } from 'lucide-react'
import { generateSceneImage } from '../../lib/togetherAi'
import { SelfieImg } from '../SelfieImg'

const SG = "'Space Grotesk', sans-serif"
const SYNE = "'Syne', sans-serif"

interface DepartureScreenProps {
  cityName: string
  countryEmoji: string
  companionName: string
  companionPortrait?: string
  companionDescription: string
  twinSelfieUrl?: string | null
  twinGender: 'male' | 'female'
  heroImage?: string
  onContinue: () => void
  onImageGenerated: (url: string) => void
  existingImageUrl?: string
}

export function DepartureScreen({
  cityName,
  countryEmoji,
  companionName,
  companionPortrait,
  companionDescription,
  twinSelfieUrl,
  twinGender,
  heroImage,
  onContinue,
  onImageGenerated,
  existingImageUrl,
}: DepartureScreenProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(existingImageUrl ?? null)
  const [imageLoaded, setImageLoaded] = useState(!!existingImageUrl)
  const generating = useRef(false)

  useEffect(() => {
    if (imageUrl || generating.current) return
    generating.current = true

    const playerDesc = twinGender === 'female' ? 'a young woman' : 'a young man'
    const companionShort = companionDescription.split(',').slice(0, 5).join(',')
    const prompt = `Two friends at an airport departure gate, excited to travel together. ${playerDesc} and ${companionShort}, both standing by the window with a plane visible on the tarmac behind them. They are smiling, carrying backpacks, ready for adventure. Airport terminal with warm morning light streaming through large windows, departure boards in the background. Destination: ${cityName}`

    generateSceneImage({
      prompt,
      width: 768,
      height: 576,
      referenceImageUrl: twinSelfieUrl,
      companionReferenceUrl: companionPortrait,
      companionDescription: companionShort,
      protagonistGender: twinGender,
      includesProtagonist: !!twinSelfieUrl,
    }).then((url) => {
      if (url) {
        setImageUrl(url)
        onImageGenerated(url)
      }
    })
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: '#0D0B12' }}
    >
      {/* Background — hero image or generated image */}
      <div className="absolute inset-0">
        {imageUrl ? (
          <motion.img
            src={imageUrl}
            alt=""
            className="w-full h-full object-cover"
            style={{ opacity: 0 }}
            animate={{ opacity: imageLoaded ? 0.55 : 0 }}
            transition={{ duration: 1.2 }}
            onLoad={() => setImageLoaded(true)}
          />
        ) : heroImage ? (
          <img
            src={heroImage}
            alt=""
            className="w-full h-full object-cover"
            style={{ opacity: 0.25, filter: 'brightness(0.6) saturate(0.5)' }}
          />
        ) : null}
      </div>

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(13,11,18,0.5) 0%, rgba(13,11,18,0.15) 30%, rgba(13,11,18,0.15) 50%, rgba(13,11,18,0.85) 100%)',
        }}
      />

      {/* Ambient glow */}
      <div
        className="absolute"
        style={{
          width: '80%',
          maxWidth: 400,
          aspectRatio: '1',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md">
        {/* Loading shimmer while generating */}
        <AnimatePresence>
          {!imageUrl && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute -top-8"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Plane size={20} style={{ color: '#A78BFA', opacity: 0.5 }} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Accent line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-10 h-px mb-8"
          style={{ background: 'rgba(139,92,246,0.38)' }}
        />

        {/* Companion + Twin avatars */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className="flex items-center -space-x-3 mb-6"
        >
          {twinSelfieUrl && (
            <div
              className="w-14 h-14 rounded-full overflow-hidden relative z-10"
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
              className="w-14 h-14 rounded-full overflow-hidden relative"
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

        {/* Destination */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="flex items-center gap-1.5 mb-3"
        >
          <MapPin size={12} style={{ color: '#A78BFA' }} />
          <span className="text-xs uppercase tracking-[3px] text-white/50" style={{ fontFamily: SG }}>
            {countryEmoji} {cityName}
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-white font-bold mb-3"
          style={{
            fontFamily: SYNE,
            letterSpacing: '-0.02em',
            fontSize: 'clamp(26px, 5vw, 38px)',
          }}
        >
          Boarding soon.
        </motion.h2>

        {/* Subtext */}
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-white/45 text-sm mb-2"
          style={{ fontFamily: SG }}
        >
          You and {companionName}, headed to {cityName}.
        </motion.p>

        {/* Loading or ready state */}
        <AnimatePresence mode="wait">
          {!imageUrl ? (
            <motion.p
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-white/25 text-xs mt-1"
              style={{ fontFamily: SG }}
            >
              Generating your departure...
            </motion.p>
          ) : (
            <motion.div
              key="ready"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
          )}
        </AnimatePresence>

        {/* CTA button */}
        <motion.button
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: imageUrl ? 1 : 0.4 }}
          transition={{ delay: 0.8 }}
          whileHover={imageUrl ? { scale: 1.03 } : {}}
          whileTap={imageUrl ? { scale: 0.97 } : {}}
          onClick={onContinue}
          className="mt-10 px-10 py-3.5 rounded-full text-sm font-medium cursor-pointer"
          style={{
            fontFamily: SG,
            background: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
            color: '#FFFFFF',
          }}
        >
          Start planning
        </motion.button>
      </div>
    </motion.div>
  )
}
