import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, ChevronRight, X, Heart } from 'lucide-react'
import { AppSidebar } from '../components/AppSidebar'
import { useStore } from '../store/useStore'
import { DESTINATIONS, type Destination } from '../data/travel/destinations'
import Globe, { type GlobeMethods } from 'react-globe.gl'

const SG = "'Space Grotesk', sans-serif"

const AVAILABLE = DESTINATIONS.filter((d) => !d.locked)

const MOCK_VISITORS = [
  { initial: 'M', gradient: 'linear-gradient(135deg, #7C3AED, #A78BFA)' },
  { initial: 'K', gradient: 'linear-gradient(135deg, #EC4899, #F9A8D4)' },
  { initial: 'S', gradient: 'linear-gradient(135deg, #3B82F6, #93C5FD)' },
  { initial: 'Y', gradient: 'linear-gradient(135deg, #F59E0B, #FCD34D)' },
  { initial: 'R', gradient: 'linear-gradient(135deg, #10B981, #6EE7B7)' },
  { initial: 'H', gradient: 'linear-gradient(135deg, #8B5CF6, #C4B5FD)' },
  { initial: 'L', gradient: 'linear-gradient(135deg, #EF4444, #FCA5A5)' },
  { initial: 'N', gradient: 'linear-gradient(135deg, #06B6D4, #67E8F9)' },
]

function getVisitors(destId: string) {
  let hash = 0
  for (let i = 0; i < destId.length; i++) hash = (hash * 31 + destId.charCodeAt(i)) | 0
  const count = 3 + (Math.abs(hash) % 45)
  const start = Math.abs(hash) % MOCK_VISITORS.length
  const visitors = Array.from({ length: Math.min(4, count) }, (_, i) => MOCK_VISITORS[(start + i) % MOCK_VISITORS.length])
  return { count, visitors }
}

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
  const markerEls = useRef<Map<string, { dot: HTMLDivElement; label: HTMLDivElement; locked: boolean }>>(new Map())
  const selectedIdRef = useRef<string | null>(null)

  const setActiveTripId = useStore((s) => s.setActiveTripId)

  const activeTrips = activeCharacterId
    ? Object.entries(travelTrips).filter(([key, trip]) => key.startsWith(`${activeCharacterId}:`) && trip.phase !== 'complete')
    : []

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

  const selectDest = useCallback((dest: Destination) => {
    setSelectedDest(dest)
    if (globeRef.current) {
      const controls = globeRef.current.controls()
      controls.autoRotate = false
      globeRef.current.pointOfView({ lat: dest.lat, lng: dest.lng, altitude: 1.8 }, 800)
    }
  }, [])

  const selectDestRef = useRef(selectDest)
  selectDestRef.current = selectDest

  const arcsData = useMemo(() => {
    if (selectedDest && !selectedDest.locked) {
      return AVAILABLE.filter(d => d.id !== selectedDest.id).map(d => ({
        startLat: selectedDest.lat,
        startLng: selectedDest.lng,
        endLat: d.lat,
        endLng: d.lng,
      }))
    }
    return AVAILABLE.slice(0, -1).map((a, i) => ({
      startLat: a.lat,
      startLng: a.lng,
      endLat: AVAILABLE[i + 1].lat,
      endLng: AVAILABLE[i + 1].lng,
    }))
  }, [selectedDest])

  useEffect(() => {
    selectedIdRef.current = selectedDest?.id ?? null
    markerEls.current.forEach(({ dot, label, locked }, id) => {
      const isSelected = selectedDest?.id === id
      if (isSelected) {
        if (locked) {
          dot.style.background = 'rgba(255,255,255,0.5)'
          dot.style.boxShadow = '0 0 10px rgba(255,255,255,0.3)'
          dot.style.transform = 'scale(1.5)'
        } else {
          dot.style.transform = 'scale(1.3)'
          dot.style.border = '2px solid rgba(167,139,250,0.9)'
          dot.style.boxShadow = '0 0 20px rgba(124,58,237,0.6)'
        }
        label.style.opacity = '1'
      } else {
        dot.style.transform = 'scale(1)'
        if (locked) {
          dot.style.background = 'rgba(255,255,255,0.2)'
          dot.style.boxShadow = '0 0 4px rgba(255,255,255,0.1)'
          label.style.opacity = '0'
        } else {
          dot.style.border = '1.5px solid rgba(124,58,237,0.5)'
          dot.style.boxShadow = '0 0 10px rgba(124,58,237,0.25)'
          label.style.opacity = '0.7'
        }
      }
    })
  }, [selectedDest])

  const createHtmlElement = useCallback((d: object) => {
    const dest = d as Destination
    const el = document.createElement('div')
    el.style.cursor = 'pointer'
    el.style.pointerEvents = 'auto'
    el.style.transform = 'translate(-50%, -50%)'
    el.style.position = 'relative'
    el.style.zIndex = '1'

    if (!dest.locked) {
      const dot = document.createElement('div')
      dot.style.cssText = 'display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:rgba(15,13,20,0.8);border:1.5px solid rgba(124,58,237,0.5);box-shadow:0 0 10px rgba(124,58,237,0.25);transition:all 0.2s ease;font-size:14px;'
      dot.textContent = dest.countryEmoji

      const label = document.createElement('div')
      label.style.cssText = 'position:absolute;left:50%;bottom:calc(100% + 6px);transform:translateX(-50%);display:flex;align-items:center;gap:4px;font-family:Space Grotesk,sans-serif;background:rgba(15,13,20,0.92);border:1px solid rgba(124,58,237,0.4);backdrop-filter:blur(8px);padding:4px 10px;border-radius:16px;color:white;font-size:11px;font-weight:600;white-space:nowrap;box-shadow:0 0 12px rgba(124,58,237,0.3);opacity:0.7;pointer-events:none;transition:opacity 0.15s ease;z-index:10;'
      label.textContent = dest.city

      el.appendChild(dot)
      el.appendChild(label)
      markerEls.current.set(dest.id, { dot, label, locked: false })

      el.onmouseenter = () => {
        label.style.opacity = '1'
        dot.style.transform = 'scale(1.15)'
        dot.style.boxShadow = '0 0 16px rgba(124,58,237,0.5)'
        el.style.zIndex = '100'
      }
      el.onmouseleave = () => {
        if (selectedIdRef.current !== dest.id) {
          label.style.opacity = '0.7'
          dot.style.transform = 'scale(1)'
          dot.style.boxShadow = '0 0 10px rgba(124,58,237,0.25)'
          el.style.zIndex = '1'
        }
      }
    } else {
      const dot = document.createElement('div')
      dot.style.cssText = 'width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,0.2);box-shadow:0 0 4px rgba(255,255,255,0.1);transition:all 0.2s ease;'

      const label = document.createElement('div')
      label.style.cssText = 'position:absolute;left:50%;bottom:calc(100% + 4px);transform:translateX(-50%);font-family:Space Grotesk,sans-serif;background:rgba(15,13,20,0.9);border:1px solid rgba(255,255,255,0.1);padding:3px 8px;border-radius:12px;color:rgba(255,255,255,0.5);font-size:10px;font-weight:500;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity 0.15s ease;z-index:10;'
      label.textContent = `${dest.countryEmoji} ${dest.city}`

      el.appendChild(dot)
      el.appendChild(label)
      markerEls.current.set(dest.id, { dot, label, locked: true })

      el.onmouseenter = () => {
        label.style.opacity = '1'
        dot.style.background = 'rgba(255,255,255,0.4)'
        el.style.zIndex = '100'
      }
      el.onmouseleave = () => {
        if (selectedIdRef.current !== dest.id) {
          label.style.opacity = '0'
          dot.style.background = 'rgba(255,255,255,0.2)'
          el.style.zIndex = '1'
        }
      }
    }

    el.onclick = (e) => {
      e.stopPropagation()
      selectDestRef.current(dest)
    }
    return el
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

          {/* Active Trips */}
          {activeTrips.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-col gap-2">
              <p className="text-white/40 text-[10px] font-semibold tracking-[1.5px] uppercase mb-1" style={{ fontFamily: SG }}>
                {activeTrips.length === 1 ? 'Continue your trip' : `${activeTrips.length} trips in progress`}
              </p>
              {activeTrips.map(([tripId, trip]) => {
                const dest = DESTINATIONS.find((d) => d.id === trip.destinationId)
                const phaseLabel = trip.phase === 'planning' ? 'Planning' : trip.phase === 'recap' ? 'Recap' : 'Exploring'
                return (
                  <button
                    key={tripId}
                    onClick={() => { setActiveTripId(tripId); navigate('/travel/trip') }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left cursor-pointer transition-colors"
                    style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(200,75,158,0.06))', border: '1px solid rgba(124,58,237,0.15)' }}
                  >
                    <span className="text-xl flex-shrink-0">{dest?.countryEmoji ?? '🌍'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate" style={{ fontFamily: "'Syne', sans-serif" }}>
                        {dest?.city ?? 'Trip'} — Day {trip.currentDay}
                      </p>
                    </div>
                    <span
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: 'rgba(124,58,237,0.15)', color: '#A78BFA', fontFamily: SG }}
                    >
                      {phaseLabel}
                    </span>
                    <ChevronRight size={14} className="text-white/30 flex-shrink-0" />
                  </button>
                )
              })}
            </motion.div>
          )}

          {/* Globe + Selected City Panel */}
          <div ref={containerRef} className="relative w-full flex flex-col items-center">
            <div className="relative" style={{ width: globeSize.width, height: globeSize.height }}>
              {/* Loading skeleton */}
              {!globeReady && (
                <div className="absolute inset-0 flex items-center justify-center z-[1]">
                  <div
                    className="rounded-full animate-pulse"
                    style={{
                      width: globeSize.width * 0.45,
                      height: globeSize.width * 0.45,
                      background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, rgba(124,58,237,0.05) 40%, transparent 70%)',
                    }}
                  />
                </div>
              )}

              <div style={{ opacity: globeReady ? 1 : 0, transition: 'opacity 0.8s ease' }}>
                <Globe
                  ref={globeRef}
                  width={globeSize.width}
                  height={globeSize.height}
                  backgroundColor="rgba(0,0,0,0)"
                  globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                  atmosphereColor="#7C3AED"
                  atmosphereAltitude={0.2}
                  arcsData={arcsData}
                  arcStartLat="startLat"
                  arcStartLng="startLng"
                  arcEndLat="endLat"
                  arcEndLng="endLng"
                  arcColor={() => ['rgba(124,58,237,0.35)', 'rgba(167,139,250,0.15)']}
                  arcAltitudeAutoScale={0.3}
                  arcStroke={0.4}
                  arcDashLength={0.4}
                  arcDashGap={0.3}
                  arcDashAnimateTime={4000}
                  ringsData={AVAILABLE}
                  ringLat="lat"
                  ringLng="lng"
                  ringColor={() => (t: number) => `rgba(167,139,250,${1 - t})`}
                  ringMaxRadius={3.5}
                  ringPropagationSpeed={1}
                  ringRepeatPeriod={1800}
                  htmlElementsData={DESTINATIONS}
                  htmlLat="lat"
                  htmlLng="lng"
                  htmlAltitude={0.01}
                  htmlElement={createHtmlElement}
                  onGlobeReady={() => setGlobeReady(true)}
                />
              </div>

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
                  background: 'radial-gradient(circle, rgba(124,58,237,0.14) 0%, rgba(124,58,237,0.04) 50%, transparent 70%)',
                  zIndex: 0,
                }}
              />

              {/* Tap hint */}
              {!selectedDest && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/25 text-xs text-center z-[2]"
                  style={{ fontFamily: SG }}
                >
                  Click a marker to explore a destination
                </motion.p>
              )}

              {/* Selected City Card — overlay */}
              <AnimatePresence>
                {selectedDest && (
                  <motion.div
                    key={selectedDest.id}
                    initial={{ opacity: 0, y: 16, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 16, scale: 0.97 }}
                    transition={{ duration: 0.25 }}
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[420px] z-10 rounded-2xl overflow-hidden"
                    style={{ background: 'rgba(21,16,32,0.95)', backdropFilter: 'blur(12px)', border: '1px solid rgba(124,58,237,0.2)' }}
                  >
                  <div className="relative h-[100px] overflow-hidden">
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
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{selectedDest.countryEmoji}</span>
                        <h3
                          className="text-2xl font-bold text-white"
                          style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.01em' }}
                        >
                          {selectedDest.city}
                        </h3>
                      </div>
                      {!selectedDest.locked && (() => {
                        const { count, visitors } = getVisitors(selectedDest.id)
                        return (
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-1.5">
                              {visitors.map((v, i) => (
                                <div
                                  key={i}
                                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                                  style={{ background: v.gradient, border: '2px solid rgba(21,16,32,0.95)', zIndex: visitors.length - i }}
                                >
                                  {v.initial}
                                </div>
                              ))}
                            </div>
                            <span className="text-white/40 text-[11px] font-medium" style={{ fontFamily: SG }}>
                              {count} exploring
                            </span>
                          </div>
                        )
                      })()}
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
                    selectDest(dest)
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
                    selectDest(dest)
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
