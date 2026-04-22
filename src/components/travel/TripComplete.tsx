import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plane, Clock, MessageCircle, MapPin } from 'lucide-react'
import { generateTripSummary } from '../../lib/claude/travel'
import type { TripProgress } from '../../store/useStore'
import type { Destination } from '../../data/travel/destinations'
import type { TravelCompanion } from '../../data/travel/companions'

interface TripCompleteProps {
  trip: TripProgress
  destination: Destination
  companion: TravelCompanion
  onNewTrip: () => void
}

export function TripComplete({ trip, destination, companion, onNewTrip }: TripCompleteProps) {
  const navigate = useNavigate()
  const [summary, setSummary] = useState<string | null>(null)

  const totalMinutes = Math.round(trip.totalEngagementMs / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  const timeLabel = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`

  const totalScenes = trip.itinerary.days.reduce((sum, d) => sum + d.scenes.length, 0)
  const totalMessages = trip.planningChatHistory.length +
    Object.values(trip.dayChatHistories).reduce((sum, msgs) => sum + msgs.length, 0)

  useEffect(() => {
    generateTripSummary({
      destinationId: trip.destinationId,
      companionId: trip.companionId,
      itineraryDays: trip.itinerary.days,
      companionMemories: trip.companionMemories,
      travelAffinityScore: trip.travelAffinityScore,
    }).then(setSummary)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center min-h-full px-5 py-12"
    >
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Plane size={36} className="mx-auto mb-4" style={{ color: '#7C3AED' }} />
        </motion.div>

        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-white/40 text-xs uppercase tracking-[2px] mb-2"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Trip complete
        </motion.p>

        <motion.h2
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-white text-3xl font-bold mb-3"
          style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.02em' }}
        >
          {destination.countryEmoji} {destination.city}
        </motion.h2>

        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="text-white/50 text-sm mb-6"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          with {companion.character.name}
        </motion.p>

        {/* Stats */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center gap-6 mb-8"
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

        {/* Summary */}
        {summary && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="rounded-xl p-5 mb-8 text-left"
            style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.12)' }}
          >
            <p
              className="text-white/70 text-sm leading-relaxed italic"
              style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
            >
              {summary}
            </p>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex flex-col gap-3"
        >
          <button
            onClick={onNewTrip}
            className="w-full py-3 rounded-xl text-white font-medium text-sm cursor-pointer"
            style={{ fontFamily: "'Space Grotesk', sans-serif", background: 'linear-gradient(135deg, #7C3AED, #c84b9e)' }}
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
    </motion.div>
  )
}
