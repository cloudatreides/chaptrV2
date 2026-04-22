import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Lock } from 'lucide-react'
import { AppSidebar } from '../components/AppSidebar'
import { useStore } from '../store/useStore'
import { DESTINATIONS } from '../data/travel/destinations'

export function TravelHomePage() {
  const navigate = useNavigate()
  const activeCharacterId = useStore((s) => s.activeCharacterId)
  const travelTrips = useStore((s) => s.travelTrips)

  const activeTrip = activeCharacterId
    ? Object.entries(travelTrips).find(([key, trip]) => key.startsWith(`${activeCharacterId}:`) && trip.phase !== 'complete')
    : null

  return (
    <div className="flex h-dvh" style={{ background: '#0A0810' }}>
      <AppSidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="page-container px-5 md:px-[60px] py-8 md:py-12">
          {/* Header */}
          <div className="mb-8">
            <h1
              className="text-3xl md:text-4xl font-bold text-white mb-2"
              style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.02em' }}
            >
              Where to next?
            </h1>
            <p className="text-white/50 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Pick a destination. Your companion will help plan the rest.
            </p>
          </div>

          {/* Continue Trip Card */}
          {activeTrip && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => navigate('/travel/trip')}
              className="w-full mb-8 rounded-2xl overflow-hidden text-left cursor-pointer"
              style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(200,75,158,0.1))', border: '1px solid rgba(124,58,237,0.2)' }}
            >
              <div className="p-5">
                <p className="text-white/40 text-[10px] font-semibold tracking-[1.5px] uppercase mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Continue your trip
                </p>
                <p className="text-white text-lg font-semibold" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {DESTINATIONS.find((d) => d.id === activeTrip[1].destinationId)?.city ?? 'Trip'} — Day {activeTrip[1].currentDay}
                </p>
                <p className="text-white/50 text-sm mt-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {activeTrip[1].phase === 'planning' ? 'Still planning with your companion...' : `${activeTrip[1].phase === 'recap' ? 'Evening recap' : 'Exploring'}`}
                </p>
              </div>
            </motion.button>
          )}

          {/* Destination Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {DESTINATIONS.map((dest, i) => (
              <motion.button
                key={dest.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => !dest.locked && navigate(`/travel/${dest.id}`)}
                disabled={dest.locked}
                className="relative rounded-2xl overflow-hidden text-left cursor-pointer group"
                style={{
                  background: '#151020',
                  border: '1px solid rgba(255,255,255,0.06)',
                  aspectRatio: '16/10',
                }}
              >
                {/* Gradient overlay */}
                <div className="absolute inset-0" style={{
                  background: dest.locked
                    ? 'linear-gradient(180deg, rgba(15,13,20,0.3) 0%, rgba(15,13,20,0.9) 100%)'
                    : 'linear-gradient(180deg, rgba(15,13,20,0) 30%, rgba(15,13,20,0.85) 100%)',
                }} />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{dest.countryEmoji}</span>
                    <h3
                      className="text-white text-xl font-bold"
                      style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.01em' }}
                    >
                      {dest.city}
                    </h3>
                    {dest.locked && <Lock size={14} className="text-white/30" />}
                  </div>
                  <p className="text-white/50 text-sm mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {dest.description}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {dest.vibeTags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] px-2.5 py-1 rounded-full"
                        style={{
                          fontFamily: "'Space Grotesk', sans-serif",
                          background: dest.locked ? 'rgba(255,255,255,0.04)' : 'rgba(124,58,237,0.12)',
                          color: dest.locked ? 'rgba(255,255,255,0.3)' : 'rgba(200,180,255,0.8)',
                          fontWeight: 500,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Locked overlay */}
                {dest.locked && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className="text-white/30 text-sm font-medium px-4 py-2 rounded-full"
                      style={{ fontFamily: "'Space Grotesk', sans-serif", background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(4px)' }}
                    >
                      Coming soon
                    </span>
                  </div>
                )}

                {/* Hover glow */}
                {!dest.locked && (
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.06) 0%, transparent 70%)' }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Trip count */}
          <div className="mt-6 flex items-center gap-2 text-white/30">
            <MapPin size={14} />
            <span className="text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {DESTINATIONS.filter((d) => !d.locked).length} destination{DESTINATIONS.filter((d) => !d.locked).length !== 1 ? 's' : ''} available — more coming soon
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
