import { useRef, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, X, Shuffle, Camera, Plus, Trash2 } from 'lucide-react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'
import { AppSidebar } from '../components/AppSidebar'
import { useStore } from '../store/useStore'
import { getDestination } from '../data/travel/destinations'
import { TRAVEL_COMPANIONS, DEFAULT_SLIDERS, getCompanionIntro, type CompanionSliders, type CompanionRemix, type TravelCompanion } from '../data/travel/companions'
import { stylizeSelfie } from '../lib/togetherAi'
import { getCroppedImg } from '../lib/cropImage'
import { uploadSelfieToStorage } from '../lib/supabase'

interface CustomCompanion {
  id: string
  baseId: string
  remix: CompanionRemix
  sliders: CompanionSliders
}

export function TravelCityPage() {
  const { destinationId } = useParams<{ destinationId: string }>()
  const navigate = useNavigate()
  const destination = getDestination(destinationId ?? '')
  const activeCharacterId = useStore((s) => s.activeCharacterId)
  const characters = useStore((s) => s.characters)
  const activeChar = characters.find((c) => c.id === activeCharacterId)
  const startTrip = useStore((s) => s.startTrip)
  const createCharacter = useStore((s) => s.createCharacter)

  // Selection: either a base companion id (e.g. "kai") or a custom companion id (e.g. "custom-abc123")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sliders, setSliders] = useState<CompanionSliders>({ ...DEFAULT_SLIDERS })
  const [customCompanions, setCustomCompanions] = useState<CustomCompanion[]>([])

  // Profile modal
  const [modalCompanion, setModalCompanion] = useState<TravelCompanion | null>(null)
  const [modalSliders, setModalSliders] = useState<CompanionSliders>({ ...DEFAULT_SLIDERS })

  // Remix modal
  const [remixTarget, setRemixTarget] = useState<TravelCompanion | null>(null)
  const [editingCustomId, setEditingCustomId] = useState<string | null>(null)
  const [remixName, setRemixName] = useState('')
  const [remixTraits, setRemixTraits] = useState<string[]>([])
  const [remixStyles, setRemixStyles] = useState<string[]>([])
  const [newTrait, setNewTrait] = useState('')
  const [newStyle, setNewStyle] = useState('')

  // Remix image upload
  const fileRef = useRef<HTMLInputElement>(null)
  const [rawImage, setRawImage] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [remixPhoto, setRemixPhoto] = useState<string | null>(null)
  const [isStylizing, setIsStylizing] = useState(false)
  const [dragging, setDragging] = useState(false)
  const uploadIdRef = useRef(crypto.randomUUID())

  if (!destination) {
    return (
      <div className="flex h-dvh items-center justify-center" style={{ background: '#0A0810' }}>
        <p className="text-white/50">Destination not found</p>
      </div>
    )
  }

  // Resolve selection
  const isCustomSelected = selectedId?.startsWith('custom-')
  const selectedCustom = isCustomSelected ? customCompanions.find((c) => c.id === selectedId) : null
  const selectedBase = isCustomSelected
    ? TRAVEL_COMPANIONS.find((c) => c.characterId === selectedCustom?.baseId)
    : TRAVEL_COMPANIONS.find((c) => c.characterId === selectedId)
  const displayName = selectedCustom?.remix.name ?? selectedBase?.character.name

  function handleSelectBase(id: string) {
    setSelectedId(id)
    const comp = TRAVEL_COMPANIONS.find((c) => c.characterId === id)
    if (comp) setSliders(comp.defaultSliders)
  }

  function handleSelectCustom(id: string) {
    const cc = customCompanions.find((c) => c.id === id)
    if (cc) {
      setSelectedId(id)
      setSliders(cc.sliders)
    }
  }

  // ── Profile modal ──
  function handleOpenProfile(comp: TravelCompanion) {
    setModalCompanion(comp)
    setModalSliders(selectedId === comp.characterId ? { ...sliders } : { ...comp.defaultSliders })
  }

  function handleSelectFromProfile() {
    if (!modalCompanion) return
    setSelectedId(modalCompanion.characterId)
    setSliders({ ...modalSliders })
    setModalCompanion(null)
  }

  function handleOpenRemixFromProfile() {
    if (!modalCompanion) return
    const comp = modalCompanion
    setModalCompanion(null)
    openRemixModal(comp, null)
  }

  // ── Remix modal ──
  function openRemixModal(comp: TravelCompanion, existingCustomId: string | null) {
    setRemixTarget(comp)
    setEditingCustomId(existingCustomId)

    const existing = existingCustomId ? customCompanions.find((c) => c.id === existingCustomId) : null
    if (existing) {
      setRemixName(existing.remix.name)
      setRemixTraits([...existing.remix.personalityTraits])
      setRemixStyles([...existing.remix.travelStyle])
      setRemixPhoto(existing.remix.imageUrl ?? null)
    } else {
      setRemixName('')
      setRemixTraits([...comp.personalityTraits])
      setRemixStyles([...comp.travelStyle])
      setRemixPhoto(null)
    }
    setRawImage(null)
    setIsStylizing(false)
    setNewTrait('')
    setNewStyle('')
    uploadIdRef.current = crypto.randomUUID()
  }

  function handleCloseRemix() {
    setRemixTarget(null)
    setEditingCustomId(null)
    setRawImage(null)
    setRemixPhoto(null)
    setIsStylizing(false)
  }

  function handleSaveRemix() {
    if (!remixTarget) return
    const name = remixName.trim() || remixTarget.character.name
    const remixData: CompanionRemix = {
      name,
      imageUrl: remixPhoto ?? undefined,
      personalityTraits: remixTraits,
      travelStyle: remixStyles,
    }

    if (editingCustomId) {
      setCustomCompanions((prev) =>
        prev.map((c) => c.id === editingCustomId ? { ...c, remix: remixData } : c)
      )
      setSelectedId(editingCustomId)
    } else {
      const newId = `custom-${crypto.randomUUID().slice(0, 8)}`
      const newCustom: CustomCompanion = {
        id: newId,
        baseId: remixTarget.characterId,
        remix: remixData,
        sliders: { ...sliders },
      }
      setCustomCompanions((prev) => [...prev, newCustom])
      setSelectedId(newId)
      setSliders(newCustom.sliders)
    }
    handleCloseRemix()
  }

  function handleDeleteCustom(id: string) {
    setCustomCompanions((prev) => prev.filter((c) => c.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  // ── Image upload ──
  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      setRawImage(e.target?.result as string)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setCroppedAreaPixels(null)
      setRemixPhoto(null)
      uploadIdRef.current = crypto.randomUUID()
    }
    reader.readAsDataURL(file)
  }

  async function handleCropConfirm() {
    if (!rawImage || !croppedAreaPixels) return
    const cropped = await getCroppedImg(rawImage, croppedAreaPixels)
    setRawImage(null)
    setIsStylizing(true)
    const result = await stylizeSelfie(cropped)
    setIsStylizing(false)
    if (result) {
      const url = await uploadSelfieToStorage(result, uploadIdRef.current)
      setRemixPhoto(url ?? result)
    } else {
      setRemixPhoto(cropped)
    }
  }

  // ── Chip helpers ──
  function addTrait() {
    const v = newTrait.trim()
    if (v && !remixTraits.includes(v)) setRemixTraits([...remixTraits, v])
    setNewTrait('')
  }

  function addStyle() {
    const v = newStyle.trim()
    if (v && !remixStyles.includes(v)) setRemixStyles([...remixStyles, v])
    setNewStyle('')
  }

  // ── Start trip ──
  function handleStartTrip() {
    if (!selectedId) return
    let charId = activeCharacterId
    if (!charId) {
      charId = createCharacter({ name: 'Traveler', gender: 'female', selfieUrl: null, bio: null })
    }

    if (selectedCustom && selectedBase) {
      startTrip(destination!.id, selectedCustom.baseId, selectedCustom.sliders, selectedCustom.remix)
    } else if (selectedBase) {
      startTrip(destination!.id, selectedBase.characterId, sliders)
    }
    navigate('/travel/trip')
  }

  const sliderConfig = [
    { key: 'chattiness' as const, left: 'Quiet', right: 'Talkative' },
    { key: 'planningStyle' as const, left: 'Spontaneous', right: 'Organized' },
    { key: 'vibe' as const, left: 'Playful', right: 'Thoughtful' },
  ]

  const isCropping = !!rawImage

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

          {/* Twin Banner */}
          {activeChar?.selfieUrl && (
            <div
              className="flex items-center gap-3 rounded-xl p-4 mb-8"
              style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)' }}
            >
              <img src={activeChar.selfieUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Your twin — You'll appear in every scene
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Base companions */}
              {TRAVEL_COMPANIONS.map((comp) => {
                const isSelected = selectedId === comp.characterId
                return (
                  <motion.div
                    key={comp.characterId}
                    whileTap={{ scale: 0.98 }}
                    className="relative rounded-xl p-4 text-left cursor-pointer transition-colors"
                    style={{
                      background: isSelected ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.03)',
                      border: isSelected ? '1px solid rgba(124,58,237,0.3)' : '1px solid rgba(255,255,255,0.06)',
                    }}
                    onClick={() => handleSelectBase(comp.characterId)}
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
                    <p className="text-white/50 text-xs leading-relaxed mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      "{getCompanionIntro(comp, destinationId ?? '').slice(0, 80)}..."
                    </p>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpenProfile(comp) }}
                      className="text-purple-400/70 text-xs hover:text-purple-400 transition-colors cursor-pointer"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      View more
                    </button>
                    {isSelected && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#7C3AED' }}>
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </motion.div>
                    )}
                  </motion.div>
                )
              })}

              {/* Custom (remixed) companions */}
              {customCompanions.map((cc) => {
                const base = TRAVEL_COMPANIONS.find((c) => c.characterId === cc.baseId)
                if (!base) return null
                const isSelected = selectedId === cc.id
                return (
                  <motion.div
                    key={cc.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative rounded-xl p-4 text-left cursor-pointer transition-colors"
                    style={{
                      background: isSelected ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.03)',
                      border: isSelected ? '1px solid rgba(124,58,237,0.3)' : '1px solid rgba(255,255,255,0.06)',
                    }}
                    onClick={() => handleSelectCustom(cc.id)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {(cc.remix.imageUrl || base.character.staticPortrait) ? (
                        <img src={cc.remix.imageUrl ?? base.character.staticPortrait!} alt="" className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl" style={{ background: '#2D2538' }}>
                          {base.character.avatar}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-white font-semibold text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          {cc.remix.name}
                        </p>
                        <p className="text-white/40 text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                          {cc.sliders.chattiness > 50 ? 'Chatty' : 'Quiet'} · {cc.sliders.planningStyle > 50 ? 'Planner' : 'Spontaneous'} · {cc.sliders.vibe > 50 ? 'Thoughtful' : 'Playful'}
                        </p>
                      </div>
                    </div>
                    <p className="text-white/50 text-xs leading-relaxed mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {cc.remix.personalityTraits.length > 0
                        ? cc.remix.personalityTraits.slice(0, 2).join('. ').slice(0, 80) + '...'
                        : `Remixed from ${base.character.name}`
                      }
                    </p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); openRemixModal(base, cc.id) }}
                        className="text-purple-400/70 text-xs hover:text-purple-400 transition-colors cursor-pointer"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteCustom(cc.id) }}
                        className="text-white/20 hover:text-red-400/70 transition-colors cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    {isSelected && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#7C3AED' }}>
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </motion.div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Start Trip CTA */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleStartTrip}
            disabled={!selectedId}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-white transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              background: selectedId ? 'linear-gradient(135deg, #7C3AED, #c84b9e)' : 'rgba(255,255,255,0.1)',
              fontSize: 15,
            }}
          >
            {selectedId
              ? `Start your trip with ${displayName}`
              : 'Select a companion to begin'
            }
          </motion.button>
        </div>
      </div>

      {/* ═══════════════ Profile Modal ═══════════════ */}
      <AnimatePresence>
        {modalCompanion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={() => setModalCompanion(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl p-6"
              style={{ background: '#161222', border: '1px solid rgba(124,58,237,0.2)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setModalCompanion(null)} className="absolute top-4 right-4 text-white/30 hover:text-white/60 cursor-pointer z-10">
                <X size={18} />
              </button>

              <div className="flex flex-col items-center mb-6">
                {modalCompanion.character.staticPortrait ? (
                  <img src={modalCompanion.character.staticPortrait} alt="" className="w-24 h-24 rounded-full object-cover mb-3" style={{ border: '2px solid rgba(124,58,237,0.3)' }} />
                ) : (
                  <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl mb-3" style={{ background: '#2D2538', border: '2px solid rgba(124,58,237,0.3)' }}>
                    {modalCompanion.character.avatar}
                  </div>
                )}
                <h3 className="text-white text-xl font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {modalCompanion.character.name}
                </h3>
                <p className="text-white/40 text-xs mt-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {modalCompanion.defaultSliders.chattiness > 50 ? 'Chatty' : 'Quiet'} · {modalCompanion.defaultSliders.planningStyle > 50 ? 'Planner' : 'Spontaneous'} · {modalCompanion.defaultSliders.vibe > 50 ? 'Thoughtful' : 'Playful'}
                </p>
              </div>

              <p className="text-white/60 text-sm leading-relaxed mb-5 text-center" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {modalCompanion.bio}
              </p>

              <div className="mb-5">
                <h4 className="text-white/40 text-[11px] uppercase tracking-[1.5px] mb-2.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Personality</h4>
                <ul className="space-y-1.5">
                  {modalCompanion.personalityTraits.map((trait, i) => (
                    <li key={i} className="text-white/50 text-xs leading-relaxed flex items-start gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      <span className="text-purple-400/50 mt-0.5">·</span>{trait}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-6">
                <h4 className="text-white/40 text-[11px] uppercase tracking-[1.5px] mb-2.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Travel style</h4>
                <ul className="space-y-1.5">
                  {modalCompanion.travelStyle.map((style, i) => (
                    <li key={i} className="text-white/50 text-xs leading-relaxed flex items-start gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      <span className="text-purple-400/50 mt-0.5">·</span>{style}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-white/[0.06] pt-5 mb-5">
                <h4 className="text-white/40 text-[11px] uppercase tracking-[1.5px] mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Tune their vibe</h4>
                {sliderConfig.map((s) => (
                  <div key={s.key} className="mb-4 last:mb-0">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-white/40 text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{s.left}</span>
                      <span className="text-white/40 text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{s.right}</span>
                    </div>
                    <input type="range" min={0} max={100} value={modalSliders[s.key]} onChange={(e) => setModalSliders((prev) => ({ ...prev, [s.key]: parseInt(e.target.value) }))} className="w-full accent-purple-500" style={{ height: 4 }} />
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2.5">
                <button onClick={handleSelectFromProfile} className="w-full py-3 rounded-xl text-white font-medium text-sm cursor-pointer" style={{ fontFamily: "'Space Grotesk', sans-serif", background: 'linear-gradient(135deg, #7C3AED, #c84b9e)' }}>
                  Select {modalCompanion.character.name}
                </button>
                <button onClick={handleOpenRemixFromProfile} className="w-full py-3 rounded-xl text-white/60 font-medium text-sm cursor-pointer flex items-center justify-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif", background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Shuffle size={14} /> Remix {modalCompanion.character.name}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════ Remix Modal ═══════════════ */}
      <AnimatePresence>
        {remixTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={handleCloseRemix}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl p-6"
              style={{ background: '#161222', border: '1px solid rgba(124,58,237,0.2)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={handleCloseRemix} className="absolute top-4 right-4 text-white/30 hover:text-white/60 cursor-pointer z-10">
                <X size={18} />
              </button>

              <h3 className="text-white text-lg font-bold mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
                {editingCustomId ? 'Edit remix' : `Remix ${remixTarget.character.name}`}
              </h3>
              <p className="text-white/30 text-xs mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Make them your own. They'll keep {remixTarget.character.name}'s core energy.
              </p>

              {/* ── Image Upload ── */}
              <div className="mb-6">
                <label className="text-purple-300/80 text-[11px] uppercase tracking-[1.5px] font-semibold block mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Appearance
                </label>

                {isCropping ? (
                  <div>
                    <div className="rounded-xl overflow-hidden" style={{ background: '#0A0810' }}>
                      <div style={{ position: 'relative', width: '100%', height: 220 }}>
                        <Cropper image={rawImage} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2 px-1">
                      <span className="text-white/30 text-xs">-</span>
                      <input type="range" min={1} max={3} step={0.05} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="flex-1 accent-purple-500 h-1" />
                      <span className="text-white/30 text-xs">+</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button className="cursor-pointer flex-1 py-2.5 rounded-xl text-sm font-medium text-white" style={{ background: 'linear-gradient(135deg, #7C3AED, #c84b9e)' }} onClick={handleCropConfirm}>Confirm</button>
                      <button className="cursor-pointer flex-1 py-2.5 rounded-xl text-sm font-medium text-white/50" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }} onClick={() => setRawImage(null)}>Cancel</button>
                    </div>
                  </div>
                ) : isStylizing ? (
                  <div className="flex flex-col items-center justify-center py-10 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <motion.div className="w-8 h-8 rounded-full border-2 border-transparent border-t-purple-400" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                    <p className="text-white/50 text-xs mt-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Animating...</p>
                  </div>
                ) : remixPhoto ? (
                  <div className="flex items-center gap-4">
                    <img src={remixPhoto} alt="" className="w-20 h-20 rounded-full object-cover" style={{ border: '2px solid rgba(124,58,237,0.3)' }} />
                    <div className="flex flex-col gap-2">
                      <button onClick={() => fileRef.current?.click()} className="text-purple-400/70 text-xs hover:text-purple-400 transition-colors cursor-pointer flex items-center gap-1.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        <Camera size={12} /> Change photo
                      </button>
                      <button onClick={() => setRemixPhoto(null)} className="text-white/30 text-xs hover:text-white/50 transition-colors cursor-pointer" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    {remixTarget.character.staticPortrait ? (
                      <img src={remixTarget.character.staticPortrait} alt="" className="w-20 h-20 rounded-full object-cover opacity-50" style={{ border: '2px dashed rgba(255,255,255,0.1)' }} />
                    ) : (
                      <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl opacity-50" style={{ background: '#2D2538', border: '2px dashed rgba(255,255,255,0.1)' }}>
                        {remixTarget.character.avatar}
                      </div>
                    )}
                    <div
                      className="flex-1 flex flex-col items-center justify-center py-4 rounded-xl cursor-pointer transition-colors"
                      style={{ border: `1px dashed ${dragging ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.08)'}`, background: 'rgba(255,255,255,0.02)' }}
                      onClick={() => fileRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
                    >
                      <Camera size={16} className="text-white/30 mb-1.5" />
                      <p className="text-white/40 text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Upload a photo</p>
                      <p className="text-white/20 text-[10px]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>We'll animate it</p>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Name ── */}
              <div className="mb-6 pt-5 border-t border-white/[0.06]">
                <label className="text-purple-300/80 text-[11px] uppercase tracking-[1.5px] font-semibold block mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Name</label>
                <input
                  type="text"
                  value={remixName}
                  onChange={(e) => setRemixName(e.target.value)}
                  placeholder={remixTarget.character.name}
                  className="w-full bg-white/[0.04] text-white text-sm rounded-lg px-3 py-2.5 outline-none placeholder:text-white/20 focus:ring-1 focus:ring-purple-500/30"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", border: '1px solid rgba(255,255,255,0.06)' }}
                />
              </div>

              {/* ── Personality Traits (chips) ── */}
              <div className="mb-6 pt-5 border-t border-white/[0.06]">
                <label className="text-purple-300/80 text-[11px] uppercase tracking-[1.5px] font-semibold block mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Personality</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {remixTraits.map((trait, i) => (
                    <span key={i} className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg text-white/60" style={{ fontFamily: "'Space Grotesk', sans-serif", background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      {trait}
                      <button onClick={() => setRemixTraits(remixTraits.filter((_, j) => j !== i))} className="text-white/30 hover:text-white/60 cursor-pointer"><X size={10} /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={newTrait} onChange={(e) => setNewTrait(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTrait())} placeholder="Add a trait..." className="flex-1 bg-white/[0.04] text-white text-xs rounded-lg px-3 py-2 outline-none placeholder:text-white/20 focus:ring-1 focus:ring-purple-500/30" style={{ fontFamily: "'Space Grotesk', sans-serif", border: '1px solid rgba(255,255,255,0.06)' }} />
                  <button onClick={addTrait} disabled={!newTrait.trim()} className="px-2.5 rounded-lg text-white/30 hover:text-white/60 cursor-pointer disabled:opacity-30" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}><Plus size={14} /></button>
                </div>
              </div>

              {/* ── Travel Style (chips) ── */}
              <div className="mb-6 pt-5 border-t border-white/[0.06]">
                <label className="text-purple-300/80 text-[11px] uppercase tracking-[1.5px] font-semibold block mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Travel style</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {remixStyles.map((style, i) => (
                    <span key={i} className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg text-white/60" style={{ fontFamily: "'Space Grotesk', sans-serif", background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      {style}
                      <button onClick={() => setRemixStyles(remixStyles.filter((_, j) => j !== i))} className="text-white/30 hover:text-white/60 cursor-pointer"><X size={10} /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={newStyle} onChange={(e) => setNewStyle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addStyle())} placeholder="Add a travel style..." className="flex-1 bg-white/[0.04] text-white text-xs rounded-lg px-3 py-2 outline-none placeholder:text-white/20 focus:ring-1 focus:ring-purple-500/30" style={{ fontFamily: "'Space Grotesk', sans-serif", border: '1px solid rgba(255,255,255,0.06)' }} />
                  <button onClick={addStyle} disabled={!newStyle.trim()} className="px-2.5 rounded-lg text-white/30 hover:text-white/60 cursor-pointer disabled:opacity-30" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}><Plus size={14} /></button>
                </div>
              </div>

              {/* Save */}
              <div className="flex flex-col gap-2.5 pt-5 border-t border-white/[0.06]">
                <button onClick={handleSaveRemix} disabled={isStylizing || isCropping} className="w-full py-3 rounded-xl text-white font-medium text-sm cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif", background: 'linear-gradient(135deg, #7C3AED, #c84b9e)' }}>
                  <Shuffle size={14} /> {editingCustomId ? 'Save changes' : 'Save remix'}
                </button>
                <button onClick={handleCloseRemix} className="w-full py-3 rounded-xl text-white/40 font-medium text-sm cursor-pointer" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); if (e.target) e.target.value = '' }} />
    </div>
  )
}
