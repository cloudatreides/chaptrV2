import { useRef, useState, useCallback, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Camera, Shield, RefreshCw, Sparkles, Trash2 } from 'lucide-react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'
import { useStore } from '../store/useStore'
import { stylizeSelfie } from '../lib/togetherAi'
import { getCroppedImg } from '../lib/cropImage'
import { trackEvent, uploadSelfieToStorage } from '../lib/supabase'

const ARCHETYPES = [
  {
    id: 'quiet',
    label: 'The Quiet One',
    bio: "I'm the quiet type who actually listens. People tell me things they don't tell anyone else — maybe because I never rush them.",
  },
  {
    id: 'bold',
    label: 'The Bold One',
    bio: "I say what I think. Life's too short for small talk and polite smiles. If something matters, I go after it.",
  },
  {
    id: 'dreamer',
    label: 'The Dreamer',
    bio: "I notice things other people miss — the way light hits a window, the pause before someone lies. I live half in my head and I like it there.",
  },
]

export function EditCharacterPage() {
  const { charId } = useParams<{ charId: string }>()
  const navigate = useNavigate()
  const characters = useStore((s) => s.characters)
  const updateCharacter = useStore((s) => s.updateCharacter)
  const deleteCharacter = useStore((s) => s.deleteCharacter)
  const fileRef = useRef<HTMLInputElement>(null)

  const character = characters.find((c) => c.id === charId)

  // ── Form state ──
  const [name, setName] = useState('')
  const [gender, setGender] = useState<'male' | 'female' | null>(null)
  const [selectedArch, setSelectedArch] = useState<string | null>(null)
  const [custom, setCustom] = useState('')
  const [isCustom, setIsCustom] = useState(false)

  // Selfie
  const [rawImage, setRawImage] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [originalPhoto, setOriginalPhoto] = useState<string | null>(null)
  const [styledPhoto, setStyledPhoto] = useState<string | null>(null)
  const [isStylizing, setIsStylizing] = useState(false)
  const [stylizeFailed, setStylizeFailed] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedSelfieUrl, setUploadedSelfieUrl] = useState<string | null>(null)
  const uploadIdRef = useRef(crypto.randomUUID())
  const [dragging, setDragging] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selfieChanged, setSelfieChanged] = useState(false)

  // Pre-populate form from character data
  useEffect(() => {
    if (!character) return
    setName(character.name)
    setGender(character.gender)

    if (character.bio) {
      const matchingArch = ARCHETYPES.find((a) => a.bio === character.bio)
      if (matchingArch) {
        setSelectedArch(matchingArch.id)
        setIsCustom(false)
      } else {
        setIsCustom(true)
        setCustom(character.bio)
      }
    }
  }, [character])

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  if (!character) {
    return (
      <div className="min-h-screen min-h-dvh bg-bg flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-textSecondary text-lg mb-3">Character not found</p>
          <button onClick={() => navigate('/home')} className="text-accent text-sm hover:underline">Go home</button>
        </div>
      </div>
    )
  }

  const isCropping = !!rawImage
  const hasNewPhoto = !!originalPhoto
  const existingSelfie = character.selfieUrl
  const finalPhoto = styledPhoto ?? originalPhoto
  const displayPhoto = selfieChanged ? finalPhoto : existingSelfie
  const bio = isCustom ? custom.trim() : ARCHETYPES.find((a) => a.id === selectedArch)?.bio ?? null
  const canSave = name.trim().length > 0 && gender !== null && !isStylizing && !isCropping && !isUploading

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      setRawImage(e.target?.result as string)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setCroppedAreaPixels(null)
      setOriginalPhoto(null)
      setStyledPhoto(null)
      setStylizeFailed(false)
      setUploadedSelfieUrl(null)
      uploadIdRef.current = crypto.randomUUID()
      setSelfieChanged(true)
    }
    reader.readAsDataURL(file)
  }

  const handleCropConfirm = async () => {
    if (!rawImage || !croppedAreaPixels) return
    const cropped = await getCroppedImg(rawImage, croppedAreaPixels)
    setOriginalPhoto(cropped)
    setRawImage(null)
    setIsStylizing(true)
    const result = await stylizeSelfie(cropped)
    setIsStylizing(false)
    if (result) {
      setStyledPhoto(result)
      setIsUploading(true)
      const url = await uploadSelfieToStorage(result, uploadIdRef.current)
      setUploadedSelfieUrl(url)
      setIsUploading(false)
    } else {
      setStylizeFailed(true)
    }
  }

  const handleRetry = async () => {
    if (!originalPhoto) return
    setStylizeFailed(false)
    setIsStylizing(true)
    const result = await stylizeSelfie(originalPhoto)
    setIsStylizing(false)
    if (result) {
      setStyledPhoto(result)
      setIsUploading(true)
      const url = await uploadSelfieToStorage(result, uploadIdRef.current)
      setUploadedSelfieUrl(url)
      setIsUploading(false)
    } else {
      setStylizeFailed(true)
    }
  }

  const handleSave = () => {
    if (!canSave) return
    const updates: Partial<{ name: string; gender: 'male' | 'female'; selfieUrl: string | null; bio: string | null }> = {
      name: name.trim(),
      gender: gender!,
      bio: bio || null,
    }
    if (selfieChanged) {
      updates.selfieUrl = uploadedSelfieUrl ?? finalPhoto ?? null
    }
    updateCharacter(character.id, updates)
    trackEvent('character_edited', { gender, hasPhoto: !!(updates.selfieUrl ?? existingSelfie), hasBio: !!bio })
    navigate('/home')
  }

  const handleDelete = () => {
    deleteCharacter(character.id)
    trackEvent('character_deleted', { characterId: character.id })
    navigate('/home')
  }

  return (
    <div className="min-h-screen min-h-dvh bg-bg flex flex-col">
      <div className="flex flex-col flex-1 w-full max-w-[520px] mx-auto px-5 pb-8">
        {/* Nav */}
        <div className="flex items-center justify-between pt-12 pb-2">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #c84b9e 0%, #8b5cf6 100%)' }}>
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-textPrimary font-semibold">chaptr</span>
          </div>
        </div>

        <button onClick={() => navigate('/home')} className="flex items-center gap-1 text-textSecondary text-sm mt-4 mb-6 hover:text-textPrimary transition-colors w-fit">
          <ChevronLeft size={16} />
          Back
        </button>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-textPrimary font-bold text-3xl mb-1">Edit Character</h1>
          <p className="text-textSecondary text-base mb-6">Update {character.name}'s details.</p>
        </motion.div>

        {/* ── Section 1: Name + Gender ── */}
        <motion.div className="mb-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <label className="text-textMuted text-xs uppercase tracking-widest mb-2 block">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="What should they call you?"
            maxLength={20}
            className="w-full bg-surfaceAlt border border-border rounded-xl px-4 py-3 text-textPrimary text-sm placeholder:text-textMuted focus:outline-none focus:border-accent transition-colors mb-4"
          />

          <label className="text-textMuted text-xs uppercase tracking-widest mb-2 block">Gender</label>
          <div className="grid grid-cols-2 gap-3">
            {(['male', 'female'] as const).map((g) => (
              <button
                key={g}
                className="cursor-pointer p-3 rounded-xl text-sm font-medium transition-all text-center"
                style={{
                  background: gender === g ? 'rgba(200,75,158,0.12)' : '#13101c',
                  border: gender === g ? '1px solid rgba(200,75,158,0.6)' : '1px solid #2a2040',
                  color: gender === g ? '#e060b8' : '#9ca3af',
                }}
                onClick={() => setGender(g)}
              >
                {g === 'male' ? '♂ Male' : '♀ Female'}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Section 2: Personality ── */}
        <motion.div className="mb-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <label className="text-textMuted text-xs uppercase tracking-widest mb-2 block">Personality</label>
          <p className="text-textSecondary text-sm mb-3">Shapes how characters react to you.</p>

          <div className="space-y-2 mb-3">
            {ARCHETYPES.map((arch) => (
              <button
                key={arch.id}
                className="cursor-pointer w-full text-left p-3 rounded-xl transition-all"
                style={{
                  background: selectedArch === arch.id && !isCustom ? 'rgba(200,75,158,0.12)' : '#13101c',
                  border: selectedArch === arch.id && !isCustom ? '1px solid rgba(200,75,158,0.6)' : '1px solid #2a2040',
                }}
                onClick={() => { setSelectedArch(arch.id); setIsCustom(false) }}
              >
                <p className="text-textPrimary font-semibold text-sm mb-0.5">{arch.label}</p>
                <p className="text-textSecondary text-xs leading-relaxed">{arch.bio}</p>
              </button>
            ))}
          </div>

          <button className="cursor-pointer flex items-center gap-2 text-accent text-xs font-medium mb-2" onClick={() => setIsCustom(!isCustom)}>
            <Sparkles size={12} />
            {isCustom ? 'Pick a preset instead' : 'Write your own'}
          </button>
          {isCustom && (
            <textarea
              className="w-full p-3 rounded-xl text-textPrimary text-sm leading-relaxed resize-none focus:outline-none"
              style={{ background: '#13101c', border: '1px solid #2a2040', minHeight: 80 }}
              placeholder="Describe your personality..."
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              maxLength={200}
            />
          )}
        </motion.div>

        {/* ── Section 3: Selfie ── */}
        <motion.div className="mb-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <label className="text-textMuted text-xs uppercase tracking-widest mb-2 block">Photo <span className="text-textMuted/50">optional</span></label>

          {isCropping ? (
            <div className="mb-3">
              <div className="rounded-2xl overflow-hidden" style={{ background: '#13101c' }}>
                <div style={{ position: 'relative', width: '100%', height: 280 }}>
                  <Cropper image={rawImage} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-2 px-1">
                <span className="text-textMuted text-xs">&minus;</span>
                <input type="range" min={1} max={3} step={0.05} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="flex-1 accent-accent h-1" />
                <span className="text-textMuted text-xs">+</span>
              </div>
              <div className="flex gap-2 mt-3">
                <button className="cursor-pointer flex-1 py-2.5 rounded-xl text-sm font-medium text-textPrimary" style={{ background: 'linear-gradient(90deg, #c84b9e 0%, #8b5cf6 100%)' }} onClick={handleCropConfirm}>Confirm crop</button>
                <button className="cursor-pointer flex-1 py-2.5 rounded-xl text-sm font-medium text-textSecondary" style={{ background: '#1a1525', border: '1px solid #2a2040' }} onClick={() => { setRawImage(null); setCrop({ x: 0, y: 0 }); setZoom(1) }}>Cancel</button>
              </div>
            </div>
          ) : (hasNewPhoto && selfieChanged) ? (
            <div className="mb-3">
              <div className="relative rounded-2xl overflow-hidden" style={{ background: '#13101c' }}>
                <AnimatePresence mode="wait">
                  {isStylizing ? (
                    <motion.div key="loading" className="w-full h-52 flex flex-col items-center justify-center gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${originalPhoto})`, filter: 'blur(20px) brightness(0.4)', transform: 'scale(1.1)' }} />
                      <div className="relative z-10 flex flex-col items-center gap-2">
                        <motion.div className="w-8 h-8 rounded-full border-2 border-transparent border-t-accent" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                        <p className="text-textPrimary text-sm font-medium">Stylizing...</p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.img key="photo" src={finalPhoto!} alt="Character" className="w-full h-auto max-h-[360px] object-contain" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
                  )}
                </AnimatePresence>
                {styledPhoto && !isStylizing && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: 'rgba(200,75,158,0.9)', color: 'white' }}>Story version</div>
                )}
              </div>
              <div className="flex gap-2 mt-2">
                <button className="cursor-pointer flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-textSecondary" style={{ background: '#1a1525', border: '1px solid #2a2040' }} onClick={() => fileRef.current?.click()}>
                  <Camera size={12} /> Change
                </button>
                {stylizeFailed && (
                  <button className="cursor-pointer flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-textSecondary" style={{ background: '#1a1525', border: '1px solid #2a2040' }} onClick={handleRetry}>
                    <RefreshCw size={12} /> Retry style
                  </button>
                )}
              </div>
            </div>
          ) : displayPhoto ? (
            <div className="mb-3">
              <div className="relative rounded-2xl overflow-hidden" style={{ background: '#13101c' }}>
                <img src={displayPhoto} alt="Character" className="w-full h-auto max-h-[360px] object-contain" />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: 'rgba(200,75,158,0.9)', color: 'white' }}>Current photo</div>
              </div>
              <div className="flex gap-2 mt-2">
                <button className="cursor-pointer flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-textSecondary" style={{ background: '#1a1525', border: '1px solid #2a2040' }} onClick={() => fileRef.current?.click()}>
                  <Camera size={12} /> Change photo
                </button>
              </div>
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center py-8 px-6 rounded-2xl cursor-pointer mb-3 transition-colors"
              style={{ border: `2px dashed ${dragging ? '#c84b9e' : '#2a2040'}`, background: '#13101c' }}
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2" style={{ background: 'rgba(200,75,158,0.12)' }}>
                <Camera size={18} className="text-accent" />
              </div>
              <p className="text-textSecondary text-sm mb-1">Upload a selfie</p>
              <p className="text-textMuted text-xs">We'll turn it into anime</p>
            </div>
          )}

          <div className="flex items-start gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}>
            <Shield size={12} className="text-gem shrink-0 mt-0.5" />
            <p className="text-textSecondary text-[11px]">Your anime-style photo is stored to personalise story scenes. Your original photo is never saved.</p>
          </div>
        </motion.div>

        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); if (e.target) e.target.value = '' }} />

        {/* ── CTAs ── */}
        <div className="mt-auto space-y-3 safe-bottom">
          <button
            className="btn-accent"
            onClick={handleSave}
            disabled={!canSave}
            style={{ opacity: canSave ? 1 : 0.5, cursor: canSave ? 'pointer' : 'not-allowed' }}
          >
            {isStylizing ? 'Stylizing photo...' : isUploading ? 'Uploading photo...' : 'Save Changes'}
          </button>

          {/* Delete */}
          {!showDeleteConfirm ? (
            <button
              className="cursor-pointer w-full py-3 rounded-xl text-sm font-medium text-red-400/70 hover:text-red-400 transition-colors flex items-center justify-center gap-2"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 size={14} /> Delete Character
            </button>
          ) : (
            <motion.div
              className="rounded-xl p-4 flex flex-col gap-3"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-red-400 text-sm font-medium text-center">Delete {character.name}? This removes all their story progress.</p>
              <div className="flex gap-2">
                <button
                  className="cursor-pointer flex-1 py-2.5 rounded-xl text-sm font-medium text-white"
                  style={{ background: 'rgba(239,68,68,0.8)' }}
                  onClick={handleDelete}
                >
                  Delete
                </button>
                <button
                  className="cursor-pointer flex-1 py-2.5 rounded-xl text-sm font-medium text-textSecondary"
                  style={{ background: '#1a1525', border: '1px solid #2a2040' }}
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
