import { motion } from 'framer-motion'
import { Sun, Moon, Sunrise, MapPin } from 'lucide-react'
import { useMemo } from 'react'

interface SceneRecap {
  id: string
  location: string
  activity: string
  timeOfDay: string
}

interface DayTransitionProps {
  dayNumber: number
  theme: string
  cityName: string
  type: 'start' | 'end'
  heroImage?: string
  onContinue: () => void
  scenes?: SceneRecap[]
  sceneImages?: Record<string, string>
  // Optional AI-generated per-day backdrop. When set, it cross-fades over the
  // static heroImage. heroImage stays as the underlying fallback so a slow or
  // failed gen never leaves a blank page.
  dayStartImageUrl?: string
}

function Stars() {
  const stars = useMemo(() => [
    { x: '14%', y: '10%', size: 3, opacity: 0.33, delay: 0.5 },
    { x: '35%', y: '6%', size: 2, opacity: 0.25, delay: 0.8 },
    { x: '58%', y: '12%', size: 3, opacity: 0.22, delay: 1.1 },
    { x: '79%', y: '7%', size: 2, opacity: 0.3, delay: 0.6 },
    { x: '90%', y: '18%', size: 3, opacity: 0.2, delay: 1.3 },
    { x: '22%', y: '23%', size: 2, opacity: 0.16, delay: 0.9 },
    { x: '72%', y: '4%', size: 2, opacity: 0.26, delay: 1.0 },
    { x: '44%', y: '21%', size: 2, opacity: 0.13, delay: 1.4 },
  ], [])

  return (
    <>
      {stars.map((star, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white"
          style={{ left: star.x, top: star.y, width: star.size, height: star.size, opacity: 0 }}
          animate={{ opacity: [0, star.opacity, 0] }}
          transition={{ duration: 3, delay: star.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </>
  )
}

export function DayTransition({ dayNumber, theme, cityName, type, heroImage, onContinue, scenes, sceneImages, dayStartImageUrl }: DayTransitionProps) {
  const isStart = type === 'start'
  const Icon = isStart ? (dayNumber === 1 ? Sunrise : Sun) : Moon

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="absolute inset-0 flex flex-col items-center justify-center overflow-y-auto"
      style={{ background: '#0D0B12' }}
    >
      {/* Hero image background — static destination heroImage as the always-on
          backdrop. AI-generated dayStartImageUrl (when present) renders on top
          and cross-fades in, so a slow/failed generation never leaves the page
          looking broken. */}
      {heroImage && (
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt=""
            className="w-full h-full object-cover"
            style={{
              opacity: isStart ? 0.45 : 0.3,
              filter: isStart ? 'brightness(0.8) saturate(0.7)' : 'brightness(0.5) saturate(0.3)',
            }}
          />
        </div>
      )}
      {isStart && dayStartImageUrl && (
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <img
            src={dayStartImageUrl}
            alt=""
            className="w-full h-full object-cover"
            style={{
              opacity: 0.55,
              filter: 'brightness(0.85) saturate(0.85)',
            }}
          />
        </motion.div>
      )}

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: isStart
            ? 'linear-gradient(to bottom, rgba(13,11,18,0.6) 0%, rgba(13,11,18,0.19) 30%, rgba(26,16,40,0.19) 60%, rgba(13,11,18,0.73) 100%)'
            : 'linear-gradient(to bottom, rgba(13,11,18,0.73) 0%, rgba(13,11,18,0.25) 35%, rgba(13,11,18,0.25) 60%, rgba(13,11,18,0.8) 100%)',
        }}
      />

      {/* Ambient glow */}
      <div
        className="absolute"
        style={{
          width: '80%',
          maxWidth: 400,
          aspectRatio: '1',
          top: '25%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: isStart
            ? 'radial-gradient(circle, rgba(245,158,11,0.13) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)',
        }}
      />

      {/* Stars (night only) */}
      {!isStart && <Stars />}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md">
        {/* Accent line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-10 h-px mb-8"
          style={{ background: isStart ? 'rgba(245,158,11,0.33)' : 'rgba(139,92,246,0.38)' }}
        />

        {/* Icon with glow */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className="relative mb-6"
        >
          {isStart && (
            <div
              className="absolute inset-0 -m-6 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%)' }}
            />
          )}
          <Icon
            size={42}
            style={{ color: isStart ? '#F59E0B' : '#A78BFA' }}
          />
        </motion.div>

        {/* Day label */}
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="text-white/50 text-xs uppercase tracking-[3px] mb-3"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {isStart ? `Day ${dayNumber}` : `End of Day ${dayNumber}`}
        </motion.p>

        {/* Headline */}
        <motion.h2
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-white font-bold mb-4"
          style={{
            fontFamily: "'Syne', sans-serif",
            letterSpacing: '-0.02em',
            fontSize: isStart ? 'clamp(28px, 5vw, 40px)' : 'clamp(32px, 6vw, 44px)',
          }}
        >
          {isStart ? theme : 'What a day.'}
        </motion.h2>

        {/* Location + tagline */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-center gap-1.5 mb-1.5">
            <MapPin size={12} style={{ color: isStart ? '#F59E0B' : '#8B5CF6' }} />
            <span
              className="text-xs"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                color: isStart ? '#F59E0B' : '#8B5CF6',
              }}
            >
              {cityName}
            </span>
          </div>
          <p
            className="text-white/45 text-sm"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {isStart
              ? dayNumber === 1
                ? `Your adventure in ${cityName} begins.`
                : `A new day, a new side of ${cityName}.`
              : `${cityName} at night hits different.`}
          </p>
        </motion.div>

        {/* Day recap (end-of-day only) */}
        {!isStart && scenes && scenes.length > 0 && (
          <motion.div
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8 w-full max-w-xs"
          >
            <div className="flex flex-col gap-2.5">
              {scenes.map((scene, i) => {
                const img = sceneImages?.[scene.id]
                return (
                  <motion.div
                    key={scene.id}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    {img ? (
                      <img
                        src={img}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                        style={{ border: '1px solid rgba(139,92,246,0.25)' }}
                      />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center"
                        style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)' }}
                      >
                        <MapPin size={14} style={{ color: '#8B5CF6', opacity: 0.6 }} />
                      </div>
                    )}
                    <div className="min-w-0 text-left">
                      <p
                        className="text-white/70 text-xs truncate"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {scene.location}
                      </p>
                      <p
                        className="text-white/40 text-[11px] truncate"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {scene.activity}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Buttons */}
        <div className="flex flex-col items-center">
          <motion.button
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: !isStart && scenes && scenes.length > 0 ? 0.9 + scenes.length * 0.1 : 0.8 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onContinue}
            className="mt-10 px-10 py-3.5 rounded-full text-sm font-medium cursor-pointer"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              ...(isStart
                ? {
                    background: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
                    color: '#FFFFFF',
                  }
                : {
                    background: 'rgba(139,92,246,0.15)',
                    border: '1px solid rgba(139,92,246,0.5)',
                    color: '#DDD6FE',
                  }),
            }}
          >
            {isStart ? "Let's go" : 'Wind down'}
          </motion.button>
          {!isStart && (
            <motion.div
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.85, duration: 0.4 }}
              className="mt-5 flex flex-col items-center gap-2 px-4 py-3 rounded-xl max-w-[340px]"
              style={{
                background: 'rgba(244,63,94,0.08)',
                border: '1px solid rgba(244,63,94,0.22)',
              }}
            >
              <p className="text-rose-200/80 text-[10px] uppercase tracking-[2px] font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Wind-down moments unlocked
              </p>
              <p className="text-white/65 text-xs text-center leading-relaxed" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Tap <span className="text-rose-200 font-semibold">+</span> in chat for:
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                <span className="text-white/80">💕 Cuddle</span>
                <span className="text-white/30">·</span>
                <span className="text-white/80">💗 Get closer</span>
                <span className="text-white/30">·</span>
                <span className="text-white/80">🛁 Run a bath</span>
                <span className="text-white/30">·</span>
                <span className="text-white/80">👗 Undress</span>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </motion.div>
  )
}
