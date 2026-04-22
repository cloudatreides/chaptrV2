import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ChevronRight, Sliders } from 'lucide-react'
import { AppSidebar } from '../components/AppSidebar'
import { useStore } from '../store/useStore'
import { getDestination } from '../data/travel/destinations'
import { TRAVEL_COMPANIONS, DEFAULT_SLIDERS, type CompanionSliders } from '../data/travel/companions'

export function TravelCityPage() {
  const { destinationId } = useParams<{ destinationId: string }>()
  const navigate = useNavigate()
  const destination = getDestination(destinationId ?? '')
  const activeCharacterId = useStore((s) => s.activeCharacterId)
  const characters = useStore((s) => s.characters)
  const activeChar = characters.find((c) => c.id === activeCharacterId)
  const startTrip = useStore((s) => s.startTrip)

  const [selectedCompanion, setSelectedCompanion] = useState<string | null>(null)
  const [showCustomize, setShowCustomize] = useState(false)
  const [sliders, setSliders] = useState<CompanionSliders>({ ...DEFAULT_SLIDERS })

  if (!destination) {
    return (
      <div className="flex h-dvh items-center justify-center" style={{ background: '#0A0810' }}>
        <p className="text-white/50">Destination not found</p>
      </div>
    )
  }

  const companion = TRAVEL_COMPANIONS.find((c) => c.characterId === selectedCompanion)

  function handleSelectCompanion(id: string) {
    const comp = TRAVEL_COMPANIONS.find((c) => c.characterId === id)
    setSelectedCompanion(id)
    setSliders(comp?.defaultSliders ?? { ...DEFAULT_SLIDERS })
    setShowCustomize(false)
  }

  function handleStartTrip() {
    if (!selectedCompanion || !activeCharacterId) return
    startTrip(destination!.id, selectedCompanion, sliders)
    navigate('/travel/trip')
  }

  const sliderConfig = [
    { key: 'chattiness' as const, label: 'Chattiness', left: 'Quiet', right: 'Talkative' },
    { key: 'planningStyle' as const, label: 'Planning', left: 'Spontaneous', right: 'Organized' },
    { key: 'vibe' as const, label: 'Vibe', left: 'Playful', right: 'Thoughtful' },
  ]

  return (
    <div className="flex h-dvh" style={{ background: '#0A0810' }}>
      <AppSidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="page-container px-5 md:px-[60px] py-8 md:py-12">
          {/* Back */}
          <button
            onClick={() => navigate('/travel')}
            className="flex items-center gap-1.5 text-white/40 hover:text-white/60 transition-colors mb-6 cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span className="text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Back</span>
          </button>

          {/* City Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{destination.countryEmoji}</span>
              <h1
                className="text-3xl md:text-4xl font-bold text-white"
                style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.02em' }}
              >
                {destination.city}
              </h1>
            </div>
            <p className="text-white/50 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {destination.tripDays}-day trip — {destination.description}
            </p>
            <div className="flex gap-2 flex-wrap mt-3">
              {destination.vibeTags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] px-2.5 py-1 rounded-full"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", background: 'rgba(124,58,237,0.12)', color: 'rgba(200,180,255,0.8)', fontWeight: 500 }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Selfie Banner */}
          {activeChar?.selfieUrl && (
            <div
              className="flex items-center gap-3 rounded-xl p-4 mb-8"
              style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)' }}
            >
              <img src={activeChar.selfieUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Your selfie — You'll appear in every scene
                </p>
                <button
                  onClick={() => navigate(`/edit-character/${activeCharacterId}`)}
                  className="text-purple-400/70 text-xs hover:text-purple-400 transition-colors cursor-pointer"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Change
                </button>
              </div>
            </div>
          )}

          {/* Companion Select */}
          <div className="mb-8">
            <h2
              className="text-white text-lg font-semibold mb-4"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Choose your travel companion
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {TRAVEL_COMPANIONS.map((comp) => {
                const isSelected = selectedCompanion === comp.characterId
                return (
                  <motion.button
                    key={comp.characterId}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectCompanion(comp.characterId)}
                    className="relative rounded-xl p-4 text-left cursor-pointer transition-colors"
                    style={{
                      background: isSelected ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.03)',
                      border: isSelected ? '1px solid rgba(124,58,237,0.3)' : '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {comp.character.staticPortrait ? (
                        <img src={comp.character.staticPortrait} alt={comp.character.name} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl" style={{ background: '#2D2538' }}>
                          {comp.character.avatar}
                        </div>
                      )}
                      <div>
                        <p className="text-white font-semibold text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          {comp.character.name}
                        </p>
                        <p className="text-white/40 text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          {comp.defaultSliders.chattiness > 50 ? 'Chatty' : 'Quiet'} · {comp.defaultSliders.planningStyle > 50 ? 'Planner' : 'Spontaneous'} · {comp.defaultSliders.vibe > 50 ? 'Thoughtful' : 'Playful'}
                        </p>
                      </div>
                    </div>
                    <p className="text-white/50 text-xs leading-relaxed" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      "{comp.travelIntro.slice(0, 80)}..."
                    </p>

                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: '#7C3AED' }}
                      >
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </motion.div>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Customize Sliders */}
          {selectedCompanion && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-8"
            >
              <button
                onClick={() => setShowCustomize(!showCustomize)}
                className="flex items-center gap-2 text-white/40 hover:text-white/60 transition-colors mb-3 cursor-pointer"
              >
                <Sliders size={14} />
                <span className="text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Customize {companion?.character.name}'s personality
                </span>
                <ChevronRight size={14} className={`transition-transform ${showCustomize ? 'rotate-90' : ''}`} />
              </button>

              {showCustomize && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl p-5 space-y-5"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  {sliderConfig.map((s) => (
                    <div key={s.key}>
                      <div className="flex justify-between mb-2">
                        <span className="text-white/40 text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{s.left}</span>
                        <span className="text-white/40 text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{s.right}</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={sliders[s.key]}
                        onChange={(e) => setSliders((prev) => ({ ...prev, [s.key]: parseInt(e.target.value) }))}
                        className="w-full accent-purple-500"
                        style={{ height: 4 }}
                      />
                    </div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Start Trip CTA */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleStartTrip}
            disabled={!selectedCompanion || !activeCharacterId}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-white transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              background: selectedCompanion ? 'linear-gradient(135deg, #7C3AED, #c84b9e)' : 'rgba(255,255,255,0.1)',
              fontSize: 15,
            }}
          >
            {selectedCompanion
              ? `Start your trip with ${companion?.character.name}`
              : 'Select a companion to begin'
            }
          </motion.button>

          {!activeCharacterId && (
            <p className="text-red-400/60 text-xs mt-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Create a character first to start traveling
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
