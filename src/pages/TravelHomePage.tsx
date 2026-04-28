import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, ChevronRight, ChevronLeft, X, Heart, Clock, Sparkles, MoreVertical, Trash2 } from 'lucide-react'
import { AppSidebar } from '../components/AppSidebar'
import { useStore } from '../store/useStore'
import { DESTINATIONS, type Destination } from '../data/travel/destinations'
import Globe, { type GlobeMethods } from 'react-globe.gl'
import { playSfx, startWind, stopWind } from '../lib/sfx'

const SG = "'Space Grotesk', sans-serif"

const AVAILABLE = DESTINATIONS.filter((d) => !d.locked)

const AVATAR_COUNT = 38
const AVATARS = Array.from({ length: AVATAR_COUNT }, (_, i) => `/avatars/avatar-${String(i + 1).padStart(2, '0')}.webp`)

function getVisitors(destId: string) {
  let hash = 0
  for (let i = 0; i < destId.length; i++) hash = (hash * 31 + destId.charCodeAt(i)) | 0
  const count = 3 + (Math.abs(hash) % 45)
  const start = Math.abs(hash) % AVATARS.length
  const avatars = Array.from({ length: Math.min(4, count) }, (_, i) => AVATARS[(start + i) % AVATARS.length])
  return { count, avatars }
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
  const [destTab, setDestTab] = useState<'available' | 'coming-soon'>('available')
  const [isLg, setIsLg] = useState(() => window.matchMedia('(min-width: 1024px)').matches)
  const markerEls = useRef<Map<string, { dot: HTMLDivElement; label: HTMLDivElement; locked: boolean }>>(new Map())
  const selectedIdRef = useRef<string | null>(null)
  const [heroIdx, setHeroIdx] = useState(0)
  const [heroPaused, setHeroPaused] = useState(false)
  const cityCarouselRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const setActiveTripId = useStore((s) => s.setActiveTripId)
  const deleteTrip = useStore((s) => s.deleteTrip)
  const [tripMenuOpen, setTripMenuOpen] = useState<string | null>(null)
  const [showAllTrips, setShowAllTrips] = useState(false)

  const activeTrips = activeCharacterId
    ? Object.entries(travelTrips).filter(([key, trip]) => key.startsWith(`${activeCharacterId}:`) && trip.phase !== 'complete')
    : []

  useEffect(() => {
    function updateSize() {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      setGlobeSize({ width: rect.width, height: Math.min(rect.width * 0.75, 550) })
      setIsLg(window.matchMedia('(min-width: 1024px)').matches)
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
    startWind(0.2, 2000)
    return () => stopWind(500)
  }, [globeReady])

  useEffect(() => {
    setHeroIdx(0)
  }, [selectedDest?.id])

  useEffect(() => {
    if (heroPaused || !selectedDest?.heroImages?.length) return
    const timer = setInterval(() => {
      setHeroIdx((i) => (i + 1) % selectedDest.heroImages!.length)
    }, 2500)
    return () => clearInterval(timer)
  }, [selectedDest?.id, heroPaused])

  const updateCarouselArrows = useCallback(() => {
    const el = cityCarouselRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }, [])

  const scrollCarousel = useCallback((dir: 'left' | 'right') => {
    const el = cityCarouselRef.current
    if (!el) return
    const cardWidth = el.querySelector<HTMLElement>(':scope > *')?.offsetWidth ?? 260
    el.scrollBy({ left: dir === 'left' ? -cardWidth - 16 : cardWidth + 16, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    updateCarouselArrows()
  }, [destTab, updateCarouselArrows])

  const selectDest = useCallback((dest: Destination) => {
    setSelectedDest(dest)
    playSfx('/audio/pin-click.wav', 0.4)
    playSfx('/audio/whoosh.wav', 0.15)
    stopWind(800)
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
    playSfx('/audio/whoosh.wav', 0.1)
    startWind(0.2, 1500)
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
              {activeTrips.length <= 2 ? (
                <p className="text-white/40 text-[10px] font-semibold tracking-[1.5px] uppercase mb-1" style={{ fontFamily: SG }}>
                  {activeTrips.length === 1 ? 'Continue your trip' : `${activeTrips.length} trips in progress`}
                </p>
              ) : (
                <button
                  onClick={() => setShowAllTrips(!showAllTrips)}
                  className="flex items-center gap-1.5 text-white/40 text-[10px] font-semibold tracking-[1.5px] uppercase mb-1 cursor-pointer hover:text-white/60 transition-colors"
                  style={{ fontFamily: SG }}
                >
                  {activeTrips.length} trips in progress
                  <ChevronRight size={12} className={`transition-transform ${showAllTrips ? 'rotate-90' : ''}`} />
                </button>
              )}
              {(showAllTrips ? activeTrips : activeTrips.slice(0, 2)).map(([tripId, trip]) => {
                const dest = DESTINATIONS.find((d) => d.id === trip.destinationId)
                const phaseLabel = trip.phase === 'planning' ? 'Planning' : trip.phase === 'recap' ? 'Recap' : 'Exploring'
                return (
                  <div key={tripId} className="relative w-full max-w-lg">
                    <button
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
                      <div
                        className="p-1 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
                        onClick={(e) => { e.stopPropagation(); setTripMenuOpen(tripMenuOpen === tripId ? null : tripId) }}
                      >
                        <MoreVertical size={14} className="text-white/30" />
                      </div>
                    </button>
                    <AnimatePresence>
                      {tripMenuOpen === tripId && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setTripMenuOpen(null)} />
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-0 top-full mt-1 z-50 rounded-lg py-1 px-1"
                            style={{ background: '#1E1A2E', border: '1px solid rgba(255,255,255,0.08)', minWidth: 140 }}
                          >
                            <button
                              onClick={() => { deleteTrip(tripId); setTripMenuOpen(null) }}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-left text-red-400 text-xs font-medium cursor-pointer hover:bg-white/5 transition-colors"
                            >
                              <Trash2 size={12} /> Delete trip
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </motion.div>
          )}

          {/* Globe + Selected City Panel */}
          <div className="relative w-full flex flex-col lg:flex-row lg:items-start lg:gap-6">
            <div ref={containerRef} className="relative flex-1 min-w-0 flex flex-col items-center">
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

            </div>

            {/* Selected City Card — mobile/tablet only (not rendered on lg+) */}
            <AnimatePresence>
              {selectedDest && !isLg && (
                <motion.div
                  key={selectedDest.id}
                  initial={{ opacity: 0, y: 16, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 16, scale: 0.97 }}
                  transition={{ duration: 0.25 }}
                  className="w-full max-w-[420px] -mt-16 relative z-[200] rounded-2xl overflow-hidden mx-auto"
                  style={{ background: 'rgba(21,16,32,0.95)', backdropFilter: 'blur(12px)', border: '1px solid rgba(124,58,237,0.2)' }}
                >
                  <div
                    className="relative h-[180px] overflow-hidden group/carousel"
                    onMouseEnter={() => setHeroPaused(true)}
                    onMouseLeave={() => setHeroPaused(false)}
                    onTouchStart={() => setHeroPaused(true)}
                    onTouchEnd={() => setHeroPaused(false)}
                  >
                    <AnimatePresence initial={false}>
                      <motion.img
                        key={heroIdx}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6 }}
                        src={(selectedDest.heroImages ?? [selectedDest.heroImage])[heroIdx % (selectedDest.heroImages?.length || 1)]}
                        alt={selectedDest.city}
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ filter: selectedDest.locked ? 'brightness(0.35) saturate(0.4)' : undefined }}
                      />
                    </AnimatePresence>
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 50%, rgba(21,16,32,0.6) 100%)' }} />
                    {selectedDest.locked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white/30 text-sm font-medium px-4 py-2 rounded-full" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', fontFamily: SG }}>
                          Coming soon
                        </span>
                      </div>
                    )}
                    {(selectedDest.heroImages?.length ?? 0) > 1 && (
                      <>
                        <button
                          onClick={() => setHeroIdx((i) => (i - 1 + selectedDest.heroImages!.length) % selectedDest.heroImages!.length)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer z-10 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200"
                          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
                        >
                          <ChevronLeft size={14} className="text-white/80" />
                        </button>
                        <button
                          onClick={() => setHeroIdx((i) => (i + 1) % selectedDest.heroImages!.length)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer z-10 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200"
                          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
                        >
                          <ChevronRight size={14} className="text-white/80" />
                        </button>
                        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                          {selectedDest.heroImages!.map((_, i) => (
                            <div
                              key={i}
                              className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                              style={{ background: i === heroIdx % selectedDest.heroImages!.length ? '#fff' : 'rgba(255,255,255,0.35)' }}
                            />
                          ))}
                        </div>
                      </>
                    )}
                    <button
                      onClick={handleDeselect}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer z-10"
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
                        const { count, avatars } = getVisitors(selectedDest.id)
                        return (
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-1.5">
                              {avatars.map((src, i) => (
                                <img
                                  key={i}
                                  src={src}
                                  alt=""
                                  className="w-6 h-6 rounded-full object-cover"
                                  style={{ border: '2px solid rgba(21,16,32,0.95)', zIndex: avatars.length - i }}
                                />
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

                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-white/30" />
                        <span className="text-white/40 text-[11px]" style={{ fontFamily: SG }}>{selectedDest.country}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-white/30" />
                        <span className="text-white/40 text-[11px]" style={{ fontFamily: SG }}>{selectedDest.tripDays}-day trip</span>
                      </div>
                    </div>

                    {selectedDest.highlights.length > 0 && (
                      <div className="mb-4 rounded-xl p-3" style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.1)' }}>
                        <div className="flex items-center gap-1.5 mb-2">
                          <Sparkles size={12} style={{ color: '#A78BFA' }} />
                          <span className="text-[10px] font-semibold tracking-[1.5px] uppercase" style={{ color: '#A78BFA', fontFamily: SG }}>Known for</span>
                        </div>
                        <ul className="space-y-1.5">
                          {selectedDest.highlights.map((h) => (
                            <li key={h} className="flex items-start gap-2">
                              <span className="text-[10px] mt-0.5" style={{ color: '#7C3AED' }}>•</span>
                              <span className="text-white/60 text-[12px] leading-snug" style={{ fontFamily: SG }}>{h}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

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

            {/* Desktop City Panel — side by side with globe */}
            {isLg && (
            <div className="w-[400px] shrink-0 sticky top-8">
              <AnimatePresence mode="wait">
                {selectedDest && (
                  <motion.div
                    key={selectedDest.id}
                    initial={false}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="w-full rounded-2xl overflow-hidden"
                    style={{ background: 'rgba(21,16,32,0.95)', backdropFilter: 'blur(12px)', border: '1px solid rgba(124,58,237,0.2)' }}
                  >
                    <div
                      className="relative h-[200px] overflow-hidden group/carousel"
                      onMouseEnter={() => setHeroPaused(true)}
                      onMouseLeave={() => setHeroPaused(false)}
                    >
                      <AnimatePresence initial={false}>
                        <motion.img
                          key={heroIdx}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.6 }}
                          src={(selectedDest.heroImages ?? [selectedDest.heroImage])[heroIdx % (selectedDest.heroImages?.length || 1)]}
                          alt={selectedDest.city}
                          className="absolute inset-0 w-full h-full object-cover"
                          style={{ filter: selectedDest.locked ? 'brightness(0.35) saturate(0.4)' : undefined }}
                        />
                      </AnimatePresence>
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 50%, rgba(21,16,32,0.6) 100%)' }} />
                      {(selectedDest.heroImages?.length ?? 0) > 1 && (
                        <>
                          <button
                            onClick={() => setHeroIdx((i) => (i - 1 + selectedDest.heroImages!.length) % selectedDest.heroImages!.length)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer z-10 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200"
                            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
                          >
                            <ChevronLeft size={14} className="text-white/80" />
                          </button>
                          <button
                            onClick={() => setHeroIdx((i) => (i + 1) % selectedDest.heroImages!.length)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer z-10 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200"
                            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
                          >
                            <ChevronRight size={14} className="text-white/80" />
                          </button>
                          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                            {selectedDest.heroImages!.map((_, i) => (
                              <div
                                key={i}
                                className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                                style={{ background: i === heroIdx % selectedDest.heroImages!.length ? '#fff' : 'rgba(255,255,255,0.35)' }}
                              />
                            ))}
                          </div>
                        </>
                      )}
                      {selectedDest.locked && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white/30 text-sm font-medium px-4 py-2 rounded-full" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', fontFamily: SG }}>
                            Coming soon
                          </span>
                        </div>
                      )}
                      <button
                        onClick={handleDeselect}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer z-10"
                        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
                      >
                        <X size={14} className="text-white/60" />
                      </button>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{selectedDest.countryEmoji}</span>
                          <h3 className="text-2xl font-bold text-white" style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.01em' }}>
                            {selectedDest.city}
                          </h3>
                        </div>
                        {!selectedDest.locked && (() => {
                          const { count, avatars } = getVisitors(selectedDest.id)
                          return (
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-1.5">
                                {avatars.map((src, i) => (
                                  <img key={i} src={src} alt="" className="w-6 h-6 rounded-full object-cover" style={{ border: '2px solid rgba(21,16,32,0.95)', zIndex: avatars.length - i }} />
                                ))}
                              </div>
                              <span className="text-white/40 text-[11px] font-medium" style={{ fontFamily: SG }}>{count} exploring</span>
                            </div>
                          )
                        })()}
                      </div>
                      <p className="text-white/50 text-sm mb-3" style={{ fontFamily: SG }}>{selectedDest.description}</p>
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={12} className="text-white/30" />
                          <span className="text-white/40 text-[11px]" style={{ fontFamily: SG }}>{selectedDest.country}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} className="text-white/30" />
                          <span className="text-white/40 text-[11px]" style={{ fontFamily: SG }}>{selectedDest.tripDays}-day trip</span>
                        </div>
                      </div>
                      {selectedDest.highlights.length > 0 && (
                        <div className="mb-4 rounded-xl p-3" style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.1)' }}>
                          <div className="flex items-center gap-1.5 mb-2">
                            <Sparkles size={12} style={{ color: '#A78BFA' }} />
                            <span className="text-[10px] font-semibold tracking-[1.5px] uppercase" style={{ color: '#A78BFA', fontFamily: SG }}>Known for</span>
                          </div>
                          <ul className="space-y-1.5">
                            {selectedDest.highlights.map((h) => (
                              <li key={h} className="flex items-start gap-2">
                                <span className="text-[10px] mt-0.5" style={{ color: '#7C3AED' }}>•</span>
                                <span className="text-white/60 text-[12px] leading-snug" style={{ fontFamily: SG }}>{h}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="flex gap-2 flex-wrap mb-4">
                        {selectedDest.vibeTags.map((tag) => (
                          <span key={tag} className="text-[11px] px-2.5 py-1 rounded-full" style={{ fontFamily: SG, background: selectedDest.locked ? 'rgba(255,255,255,0.04)' : 'rgba(124,58,237,0.12)', color: selectedDest.locked ? 'rgba(255,255,255,0.25)' : 'rgba(200,180,255,0.8)', fontWeight: 500 }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                      {!selectedDest.locked ? (
                        <button onClick={() => handleNavigate(selectedDest)} className="cursor-pointer w-full h-11 rounded-xl flex items-center justify-center gap-2 text-white font-semibold text-sm" style={{ background: 'linear-gradient(90deg, #7C3AED, #A78BFA)', fontFamily: SG }}>
                          Explore {selectedDest.city} <ChevronRight size={16} />
                        </button>
                      ) : cityVotes.includes(selectedDest.id) ? (
                        <div className="w-full h-11 rounded-xl flex items-center justify-center gap-2 text-sm" style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)', color: '#A78BFA', fontFamily: SG, fontWeight: 500 }}>
                          <Heart size={14} fill="#A78BFA" /> Noted — we'll build it next
                        </div>
                      ) : (
                        <button onClick={() => voteCityRequest(selectedDest.id)} className="cursor-pointer w-full h-11 rounded-xl flex items-center justify-center gap-2 text-sm font-medium" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontFamily: SG }}>
                          <Heart size={14} /> I want to go here
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {!selectedDest && (
                <div className="flex items-center justify-center h-[300px] text-white/15 text-sm" style={{ fontFamily: SG }}>
                  Click a city on the globe to explore
                </div>
              )}
            </div>
            )}
          </div>

          {/* Destination Tabs */}
          <div className="mt-10">
            <div className="flex gap-1 mb-5">
              {(['available', 'coming-soon'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setDestTab(tab)}
                  className="cursor-pointer px-4 py-1.5 rounded-full text-[11px] font-semibold transition-colors"
                  style={{
                    fontFamily: SG,
                    background: destTab === tab ? 'rgba(124,58,237,0.15)' : 'transparent',
                    color: destTab === tab ? '#A78BFA' : 'rgba(255,255,255,0.3)',
                    border: destTab === tab ? '1px solid rgba(124,58,237,0.3)' : '1px solid transparent',
                  }}
                >
                  {tab === 'available' ? `Available Now (${DESTINATIONS.filter(d => !d.locked).length})` : `Coming Soon (${DESTINATIONS.filter(d => d.locked).length})`}
                </button>
              ))}
            </div>

            {/* Mobile: horizontal carousel / Desktop: grid */}
            <div className="relative">
              {/* Left arrow — mobile only */}
              {canScrollLeft && (
                <button
                  onClick={() => scrollCarousel('left')}
                  className="sm:hidden absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
                  style={{ background: 'rgba(10,8,16,0.85)', border: '1px solid rgba(124,58,237,0.3)' }}
                >
                  <ChevronLeft size={16} className="text-violet-400" />
                </button>
              )}
              {/* Right arrow — mobile only */}
              {canScrollRight && (
                <button
                  onClick={() => scrollCarousel('right')}
                  className="sm:hidden absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
                  style={{ background: 'rgba(10,8,16,0.85)', border: '1px solid rgba(124,58,237,0.3)' }}
                >
                  <ChevronRight size={16} className="text-violet-400" />
                </button>
              )}
              <div
                ref={cityCarouselRef}
                onScroll={updateCarouselArrows}
                className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide sm:grid sm:grid-cols-3 lg:grid-cols-4 sm:gap-4 sm:overflow-visible sm:pb-0"
              >
                {(destTab === 'available' ? DESTINATIONS.filter(d => !d.locked) : DESTINATIONS.filter(d => d.locked)).map((dest) => (
                  <button
                    key={dest.id}
                    onClick={() => {
                      selectDest(dest)
                      containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }}
                    className="cursor-pointer rounded-xl overflow-hidden text-left group snap-start shrink-0 w-[72vw] sm:w-auto"
                    style={{ border: destTab === 'available' ? '1px solid rgba(124,58,237,0.2)' : '1px solid rgba(255,255,255,0.04)', background: destTab === 'available' ? '#151020' : '#0E0B15' }}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={dest.heroImage}
                        alt={dest.city}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        style={dest.locked ? { filter: 'brightness(0.35) saturate(0.3)' } : undefined}
                      />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,8,16,0.95) 0%, rgba(10,8,16,0.5) 40%, transparent 70%)' }} />
                      {dest.locked && (
                        <div className="absolute inset-0 flex items-center justify-center" style={{ backdropFilter: 'blur(2px)', background: 'rgba(10,8,16,0.3)' }}>
                          <span className="text-[11px] font-bold tracking-[1.5px] uppercase px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontFamily: SG }}>Coming Soon</span>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">{dest.countryEmoji}</span>
                          <p className="text-sm font-semibold" style={{ fontFamily: SG, color: dest.locked ? 'rgba(255,255,255,0.4)' : '#fff' }}>{dest.city}</p>
                        </div>
                        {!dest.locked && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {dest.vibeTags.map((tag) => (
                              <span
                                key={tag}
                                className="text-[9px] font-medium px-1.5 py-0.5 rounded-full"
                                style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', fontFamily: SG }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
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
