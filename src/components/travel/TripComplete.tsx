import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, MessageCircle, MapPin, Heart, BookOpen, Plus, Check } from 'lucide-react'
import { generateTripSummary, generateCompanionFarewell } from '../../lib/claude/travel'
import { useStore } from '../../store/useStore'
import type { TripProgress } from '../../store/useStore'
import type { Destination } from '../../data/travel/destinations'
import type { TravelCompanion } from '../../data/travel/companions'

interface TripCompleteProps {
  trip: TripProgress
  destination: Destination
  companion: TravelCompanion
  onNewTrip: () => void
}

function getBondLabel(score: number): string {
  if (score >= 80) return 'Best friends'
  if (score >= 60) return 'Close friends'
  if (score >= 40) return 'Good vibes'
  if (score >= 20) return 'Getting along'
  return 'Just met'
}

export function TripComplete({ trip, destination, companion, onNewTrip }: TripCompleteProps) {
  const navigate = useNavigate()
  const [summary, setSummary] = useState<string | null>(null)
  const [farewell, setFarewell] = useState<string | null>(null)
  const [savedToAlbum, setSavedToAlbum] = useState(false)
  const addStoryMoment = useStore((s) => s.addStoryMoment)

  const companionName = trip.companionRemix?.name ?? companion.character.name
  const companionPortrait = companion.character.staticPortrait
  const affinity = Math.min(100, Math.max(0, trip.travelAffinityScore))

  const totalMinutes = Math.round(trip.totalEngagementMs / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  const timeLabel = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`

  const totalScenes = trip.itinerary.days.reduce((sum, d) => sum + d.scenes.length, 0)
  const totalMessages = trip.planningChatHistory.length +
    Object.values(trip.dayChatHistories).reduce((sum, msgs) => sum + msgs.length, 0)

  const highlights = useMemo(() => trip.companionMemories.slice(-5), [trip.companionMemories])

  useEffect(() => {
    generateTripSummary({
      destinationId: trip.destinationId,
      companionId: trip.companionId,
      companionRemix: trip.companionRemix,
      itineraryDays: trip.itinerary.days,
      companionMemories: trip.companionMemories,
      travelAffinityScore: trip.travelAffinityScore,
    }).then(setSummary)

    generateCompanionFarewell({
      destinationId: trip.destinationId,
      companionId: trip.companionId,
      companionRemix: trip.companionRemix,
      companionMemories: trip.companionMemories,
      travelAffinityScore: trip.travelAffinityScore,
    }).then((f) => f && setFarewell(f))
  }, [])

  const handleSaveToAlbum = () => {
    highlights.forEach((memory, i) => {
      addStoryMoment({
        id: `travel-${trip.destinationId}-${Date.now()}-${i}`,
        imageUrl: destination.heroImage,
        characterIds: [trip.companionId],
        universeId: `travel-${trip.destinationId}`,
        beatLabel: `${destination.city} — Day ${Math.min(i + 1, trip.itinerary.days.length)}`,
        note: memory,
        timestamp: Date.now() - (highlights.length - i) * 1000,
      })
    })
    setSavedToAlbum(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="absolute inset-0 overflow-y-auto"
      style={{ background: '#0D0B12' }}
    >
      {/* Hero background */}
      <div className="absolute inset-0">
        <img
          src={destination.heroImage}
          alt=""
          className="w-full h-full object-cover"
          style={{ opacity: 0.25, filter: 'brightness(0.6) saturate(0.4)' }}
        />
      </div>
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(13,11,18,0.5) 0%, rgba(13,11,18,0.3) 20%, rgba(13,11,18,0.7) 50%, rgba(13,11,18,0.95) 75%, #0D0B12 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-5 pt-16 pb-12 min-h-full">
        <div className="max-w-md w-full">
          {/* Companion portrait */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="flex justify-center mb-5"
          >
            {companionPortrait ? (
              <div
                className="w-20 h-20 rounded-full overflow-hidden"
                style={{ border: '2px solid rgba(124,58,237,0.4)', boxShadow: '0 0 30px rgba(124,58,237,0.2)' }}
              >
                <img src={companionPortrait} alt={companionName} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-3xl"
                style={{ background: 'rgba(124,58,237,0.15)', border: '2px solid rgba(124,58,237,0.4)' }}
              >
                {companion.character.avatar}
              </div>
            )}
          </motion.div>

          {/* Header */}
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center text-white/40 text-xs uppercase tracking-[2px] mb-2"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Trip complete
          </motion.p>

          <motion.h2
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center text-white text-3xl font-bold mb-2"
            style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.02em' }}
          >
            {destination.countryEmoji} {destination.city}
          </motion.h2>

          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="text-center text-white/50 text-sm mb-8"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            with {companionName}
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center gap-6 mb-6"
          >
            {[
              { icon: Clock, label: timeLabel, sub: 'spent' },
              { icon: MapPin, label: String(totalScenes), sub: 'scenes' },
              { icon: MessageCircle, label: String(totalMessages), sub: 'messages' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={sub} className="text-center">
                <Icon size={16} className="mx-auto mb-1 text-white/30" />
                <p className="text-white font-semibold text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>{label}</p>
                <p className="text-white/30 text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{sub}</p>
              </div>
            ))}
          </motion.div>

          {/* Bond / Affinity */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="flex items-center justify-center gap-3 mb-8"
          >
            <Heart size={14} style={{ color: '#A78BFA' }} />
            <div className="flex items-center gap-2.5">
              <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(167,139,250,0.15)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${affinity}%` }}
                  transition={{ delay: 0.8, duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #7C3AED, #A78BFA)' }}
                />
              </div>
              <span
                className="text-xs text-white/40"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {getBondLabel(affinity)}
              </span>
            </div>
          </motion.div>

          {/* Companion farewell */}
          {farewell && (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.65 }}
              className="rounded-xl p-5 mb-6"
              style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)' }}
            >
              <p
                className="text-white/75 text-sm leading-relaxed italic"
                style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
              >
                &ldquo;{farewell}&rdquo;
              </p>
              <p
                className="text-right text-white/35 text-xs mt-2"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                — {companionName}
              </p>
            </motion.div>
          )}

          {/* Trip summary */}
          {summary && (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.75 }}
              className="rounded-xl p-5 mb-8 text-left"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <p
                className="text-white/60 text-sm leading-relaxed"
                style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
              >
                {summary}
              </p>
            </motion.div>
          )}

          {/* Highlights / Memories */}
          {highlights.length > 0 && (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.85 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BookOpen size={14} className="text-white/30" />
                  <span
                    className="text-white/50 text-xs uppercase tracking-[1.5px]"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    Highlights
                  </span>
                </div>
                <button
                  onClick={handleSaveToAlbum}
                  disabled={savedToAlbum}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full cursor-pointer transition-colors"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    background: savedToAlbum ? 'rgba(34,197,94,0.1)' : 'rgba(124,58,237,0.1)',
                    border: `1px solid ${savedToAlbum ? 'rgba(34,197,94,0.25)' : 'rgba(124,58,237,0.25)'}`,
                    color: savedToAlbum ? '#4ade80' : '#A78BFA',
                  }}
                >
                  {savedToAlbum ? <Check size={12} /> : <Plus size={12} />}
                  {savedToAlbum ? 'Saved' : 'Save to Album'}
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {highlights.map((memory, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.9 + i * 0.08 }}
                    className="rounded-lg px-4 py-3 text-left"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <p
                      className="text-white/55 text-xs leading-relaxed"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {memory}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="flex flex-col gap-3"
          >
            <button
              onClick={onNewTrip}
              className="w-full py-3.5 rounded-xl text-white font-medium text-sm cursor-pointer"
              style={{ fontFamily: "'Space Grotesk', sans-serif", background: 'linear-gradient(135deg, #7C3AED, #A78BFA)' }}
            >
              Plan another trip
            </button>
            <button
              onClick={() => navigate('/home')}
              className="w-full py-3 rounded-xl text-white/50 font-medium text-sm cursor-pointer"
              style={{ fontFamily: "'Space Grotesk', sans-serif", background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              Back to home
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
