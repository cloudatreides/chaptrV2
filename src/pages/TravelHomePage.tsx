import { useRef, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, ChevronRight, X, Heart } from 'lucide-react'
import { AppSidebar } from '../components/AppSidebar'
import { useStore } from '../store/useStore'
import { DESTINATIONS, type Destination } from '../data/travel/destinations'
import Globe, { type GlobeMethods } from 'react-globe.gl'

const SG = "'Space Grotesk', sans-serif"

export function TravelHomePage() {
  const navigate = useNavigate()
  const activeCharacterId = useStore((s) => s.activeCharacterId)
  const travelTrips = useStore((s) => s.travelTrips)
  const cityVotes = useStore((s) => s.cityVotes)
  const voteCityRequest = useStore((s) => s.voteCityRequest)
  const globeRef = useRef<GlobeMethods | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedDest, setSelectedDest] = useState<Destination | null>(null)
  const [globeSize, setGlobeSize] = useState({ width: 600, height: 500 })
  const [globeReady, setGlobeReady] = useState(false)

  const activeTrip = activeCharacterId
    ? Object.entries(travelTrips).find(([key, trip]) => key.startsWith(`${activeCharacterId}:`) && trip.phase !== 'complete')
    : null

  useEffect(() => {
    function updateSize() {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      setGlobeSize({ width: rect.width, height: Math.min(rect.width * 0.75, 550) })
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  useEffect(() => {
    if (!globeRef.current) return
    const controls = globeRef.current.controls()
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.6
    controls.enableZoom = false
    globeRef.current.pointOfView({ lat: 30, lng: 120, altitude: 2.2 }, 0)
  }, [globeReady])

  const handlePointClick = useCallback((point: object) => {
    const dest = point as Destination
    setSelectedDest(dest)
    if (globeRef.current) {
      const controls = globeRef.current.controls()
      controls.autoRotate = false
      globeRef.current.pointOfView({ lat: dest.lat, lng: dest.lng, altitude: 1.8 }, 800)
    }
  }, [])

  const handleDeselect = useCallback(() => {
    setSelectedDest(null)
    if (globeRef.current) {
      const controls = globeRef.current.controls()
      controls.autoRotate = true
      controls.autoRotateSpeed = 0.6
    }
  }, [])

  const handleNavigate = useCallback((dest: Destination) => {
    if (!dest.locked) navigate(`/travel/${dest.id}`)
  }, [navigate])

  return (
    <div className="flex h-dvh" style={{ background: '#0A0810' }}>
      <AppSidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="page-container px-5 md:px-[60px] py-8 md:py-12">
          {/* Header */}
          <div className="mb-4">
            <h1
              className="text-3xl md:text-4xl font-bold text-white mb-2"
              style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.02em' }}
            >
              Where to next?
            </h1>
            <p className="text-white/50 text-sm" style={{ fontFamily: SG }}>
              Spin the globe. Pick a destination. Your companion will help plan the rest.
            </p>
          </div>

          {/* Continue Trip Card */}
          {activeTrip && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => navigate('/travel/trip')}
              className="w-full mb-6 rounded-2xl overflow-hidden text-left cursor-pointer"
              style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(200,75,158,0.1))', border: '1px solid rgba(124,58,237,0.2)' }}
            >
              <div className="p-5">
                <p className="text-white/40 text-[10px] font-semibold tracking-[1.5px] uppercase mb-1" style={{ fontFamily: SG }}>
                  Continue your trip
                </p>
                <p className="text-white text-lg font-semibold" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {DESTINATIONS.find((d) => d.id === activeTrip[1].destinationId)?.city ?? 'Trip'} — Day {activeTrip[1].currentDay}
                </p>
                <p className="text-white/50 text-sm mt-1" style={{ fontFamily: SG }}>
                  {activeTrip[1].phase === 'planning' ? 'Still planning with your companion...' : `${activeTrip[1].phase === 'recap' ? 'Evening recap' : 'Exploring'}`}
                </p>
              </div>
            </motion.button>
          )}

          {/* Globe + Selected City Panel */}
          <div ref={containerRef} className="relative w-full flex flex-col items-center">
            <div className="relative" style={{ width: globeSize.width, height: globeSize.height }}>
              <Globe
                ref={globeRef}
                width={globeSize.width}
                height={globeSize.height}
                backgroundColor="rgba(0,0,0,0)"
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                atmosphereColor="#7C3AED"
                atmosphereAltitude={0.15}
                pointsData={DESTINATIONS}
                pointLat="lat"
                pointLng="lng"
                pointColor={(d: object) => {
                  const dest = d as Destination
                  return dest.locked ? 'rgba(255,255,255,0.25)' : '#A78BFA'
                }}
                pointAltitude={0.06}
                pointRadius={0.6}
                pointLabel={(d: object) => {
                  const dest = d as Destination
                  return `<div style="font-family: Space Grotesk, sans-serif; background: rgba(15,13,20,0.9); border: 1px solid rgba(124,58,237,0.3); backdrop-filter: blur(8px); padding: 6px 10px; border-radius: 8px; color: white; font-size: 12px; font-weight: 600;">${dest.countryEmoji} ${dest.city}</div>`
                }}
                onPointClick={handlePointClick}
                onGlobeReady={() => setGlobeReady(true)}
              />

              {/* Glow ring behind globe */}
              <div
                className="absolute pointer-events-none"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: globeSize.width * 0.6,
                  height: globeSize.width * 0.6,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)',
                  zIndex: 0,
                }}
              />
            </div>

            {/* Tap hint */}
            {!selectedDest && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-white/25 text-xs text-center mt-2"
                style={{ fontFamily: SG }}
              >
                Click a marker to explore a destination
              </motion.p>
            )}

            {/* Selected City Card */}
            <AnimatePresence>
              {selectedDest && (
                <motion.div
                  key={selectedDest.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.25 }}
                  className="w-full max-w-[480px] mt-4 rounded-2xl overflow-hidden"
                  style={{ background: '#151020', border: '1px solid rgba(124,58,237,0.15)' }}
                >
                  <div className="relative h-[140px] overflow-hidden">
                    <img
                      src={selectedDest.heroImage}
                      alt={selectedDest.city}
                      className="w-full h-full object-cover"
                      style={{ filter: selectedDest.locked ? 'brightness(0.35) saturate(0.4)' : undefined }}
                    />
                    {selectedDest.locked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white/30 text-sm font-medium px-4 py-2 rounded-full" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', fontFamily: SG }}>
                          Coming soon
                        </span>
                      </div>
                    )}
                    <button
                      onClick={handleDeselect}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
                      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
                    >
                      <X size={14} className="text-white/60" />
                    </button>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xl">{selectedDest.countryEmoji}</span>
                      <h3
                        className="text-2xl font-bold text-white"
                        style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.01em' }}
                      >
                        {selectedDest.city}
                      </h3>
                    </div>
                    <p className="text-white/50 text-sm mb-3" style={{ fontFamily: SG }}>
                      {selectedDest.description}
                    </p>
                    <div className="flex gap-2 flex-wrap mb-4">
                      {selectedDest.vibeTags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] px-2.5 py-1 rounded-full"
                          style={{
                            fontFamily: SG,
                            background: selectedDest.locked ? 'rgba(255,255,255,0.04)' : 'rgba(124,58,237,0.12)',
                            color: selectedDest.locked ? 'rgba(255,255,255,0.25)' : 'rgba(200,180,255,0.8)',
                            fontWeight: 500,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    {!selectedDest.locked ? (
                      <button
                        onClick={() => handleNavigate(selectedDest)}
                        className="cursor-pointer w-full h-11 rounded-xl flex items-center justify-center gap-2 text-white font-semibold text-sm"
                        style={{ background: 'linear-gradient(90deg, #7C3AED, #A78BFA)', fontFamily: SG }}
                      >
                        Explore {selectedDest.city} <ChevronRight size={16} />
                      </button>
                    ) : cityVotes.includes(selectedDest.id) ? (
                      <div
                        className="w-full h-11 rounded-xl flex items-center justify-center gap-2 text-sm"
                        style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)', color: '#A78BFA', fontFamily: SG, fontWeight: 500 }}
                      >
                        <Heart size={14} fill="#A78BFA" /> Noted — we'll build it next
                      </div>
                    ) : (
                      <button
                        onClick={() => voteCityRequest(selectedDest.id)}
                        className="cursor-pointer w-full h-11 rounded-xl flex items-center justify-center gap-2 text-sm font-medium"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontFamily: SG }}
                      >
                        <Heart size={14} /> I want to go here
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Available Now */}
          <div className="mt-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full" style={{ background: '#7C3AED' }} />
              <p className="text-[10px] font-semibold tracking-[2px] uppercase" style={{ color: '#A78BFA', fontFamily: SG }}>
                AVAILABLE NOW
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {DESTINATIONS.filter((d) => !d.locked).map((dest) => (
                <button
                  key={dest.id}
                  onClick={() => {
                    setSelectedDest(dest)
                    if (globeRef.current) {
                      const controls = globeRef.current.controls()
                      controls.autoRotate = false
                      globeRef.current.pointOfView({ lat: dest.lat, lng: dest.lng, altitude: 1.8 }, 800)
                    }
                    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                  className="cursor-pointer rounded-xl overflow-hidden text-left flex flex-col"
                  style={{ border: '1px solid rgba(124,58,237,0.2)', background: '#151020' }}
                >
                  <div className="relative h-[80px] overflow-hidden">
                    <img src={dest.heroImage} alt={dest.city} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{dest.countryEmoji}</span>
                      <p className="text-sm font-semibold text-white" style={{ fontFamily: SG }}>{dest.city}</p>
                    </div>
                    <p className="text-[10px] mt-0.5" style={{ color: '#A78BFA', fontFamily: SG }}>
                      {dest.vibeTags.join(' · ')}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Coming Soon */}
          <div className="mt-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
              <p className="text-[10px] font-semibold tracking-[2px] uppercase" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: SG }}>
                COMING SOON — {DESTINATIONS.filter((d) => d.locked).length} DESTINATIONS
              </p>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2.5">
              {DESTINATIONS.filter((d) => d.locked).map((dest) => (
                <button
                  key={dest.id}
                  onClick={() => {
                    setSelectedDest(dest)
                    if (globeRef.current) {
                      const controls = globeRef.current.controls()
                      controls.autoRotate = false
                      globeRef.current.pointOfView({ lat: dest.lat, lng: dest.lng, altitude: 1.8 }, 800)
                    }
                    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                  className="cursor-pointer rounded-xl overflow-hidden text-left flex flex-col"
                  style={{ border: '1px solid rgba(255,255,255,0.04)', background: '#0E0B15' }}
                >
                  <div className="relative h-[60px] overflow-hidden">
                    <img
                      src={dest.heroImage}
                      alt={dest.city}
                      className="w-full h-full object-cover"
                      style={{ filter: 'brightness(0.35) saturate(0.3)' }}
                    />
                  </div>
                  <div className="p-2">
                    <div className="flex items-center gap-1">
                      <span className="text-xs">{dest.countryEmoji}</span>
                      <p className="text-xs font-medium truncate" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: SG }}>{dest.city}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Trip count */}
          <div className="mt-6 flex items-center gap-2 text-white/30">
            <MapPin size={14} />
            <span className="text-xs" style={{ fontFamily: SG }}>
              {DESTINATIONS.filter((d) => !d.locked).length} available — {DESTINATIONS.filter((d) => d.locked).length} more on the way
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
