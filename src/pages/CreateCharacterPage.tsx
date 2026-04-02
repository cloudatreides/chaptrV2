import { useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Camera, Upload, Shield, RefreshCw, Sparkles } from 'lucide-react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'
import { useStore } from '../store/useStore'
import { stylizeSelfie } from '../lib/togetherAi'
import { getCroppedImg } from '../lib/cropImage'
import { trackEvent } from '../lib/supabase'

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

export function CreateCharacterPage() {
  const navigate = useNavigate()
  const createCharacter = useStore((s) => s.createCharacter)
  const characters = useStore((s) => s.characters)
  const fileRef = useRef<HTMLInputElement>(null)

  // ── Form state ──
  const [name, setName] = useState('')
  const [gender, setGender] = useState<'male' | 'female' | null>(null)

  // Personality
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
  const [dragging, setDragging] = useState(false)

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  const loveInterestName = gender === 'male' ? 'Yuna' : gender === 'female' ? 'Jiwon' : null
  const isCropping = !!rawImage
  const hasPhoto = !!originalPhoto
  const finalPhoto = styledPhoto ?? originalPhoto
  const bio = isCustom ? custom.trim() : ARCHETYPES.find((a) => a.id === selectedArch)?.bio ?? null
  const canCreate = name.trim().length > 0 && gender !== null && !isStylizing && !isCropping

  // ── Handlers ──

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
    if (result) setStyledPhoto(result)
    else setStylizeFailed(true)
  }

  const handleRetry = async () => {
    if (!originalPhoto) return
    setStylizeFailed(false)
    setIsStylizing(true)
    const result = await stylizeSelfie(originalPhoto)
    setIsStylizing(false)
    if (result) setStyledPhoto(result)
    else setStylizeFailed(true)
  }

  const handleCreate = () => {
    if (!canCreate) return
    createCharacter({
      name: name.trim(),
      gender: gender!,
      selfieUrl: finalPhoto ?? null,
      bio: bio || null,
    })
    trackEvent('character_created', { gender, hasPhoto: !!finalPhoto, hasBio: !!bio })
    navigate('/story')
  }

  if (characters.length >= 3) {
    return (
      <div className="min-h-screen min-h-dvh bg-bg flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-textSecondary text-lg mb-3">Maximum 3 characters reached</p>
          <button onClick={() => navigate('/characters')} className="text-accent text-sm hover:underline">Go back</button>
        </div>
      </div>
    )
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

        <button onClick={() => navigate('/characters')} className="flex items-center gap-1 text-textSecondary text-sm mt-4 mb-6 hover:text-textPrimary transition-colors w-fit">
          <ChevronLeft size={16} />
          Back
        </button>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-textPrimary font-bold text-3xl mb-1">Create Character</h1>
          <p className="text-textSecondary text-base mb-6">Build who you'll be in the story.</p>
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
                className="p-3 rounded-xl text-sm font-medium transition-all text-center"
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
          {loveInterestName && (
            <motion.p className="text-textMuted text-xs mt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              Your story partner: <span className="text-accent">{loveInterestName}</span>
            </motion.p>
          )}
        </motion.div>

        {/* ── Section 2: Personality ── */}
        <motion.div className="mb-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <label className="text-textMuted text-xs uppercase tracking-widest mb-2 block">Personality</label>
          <p className="text-textSecondary text-sm mb-3">Shapes how characters react to you.</p>

          <div className="space-y-2 mb-3">
            {ARCHETYPES.map((arch) => (
              <button
                key={arch.id}
                className="w-full text-left p-3 rounded-xl transition-all"
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

          <button className="flex items-center gap-2 text-accent text-xs font-medium mb-2" onClick={() => setIsCustom(!isCustom)}>
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

        {/* ── Section 3: Selfie (optional) ── */}
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
                <button className="flex-1 py-2.5 rounded-xl text-sm font-medium text-textPrimary" style={{ background: 'linear-gradient(90deg, #c84b9e 0%, #8b5cf6 100%)' }} onClick={handleCropConfirm}>Confirm crop</button>
                <button className="flex-1 py-2.5 rounded-xl text-sm font-medium text-textSecondary" style={{ background: '#1a1525', border: '1px solid #2a2040' }} onClick={() => { setRawImage(null); setCrop({ x: 0, y: 0 }); setZoom(1) }}>Cancel</button>
              </div>
            </div>
          ) : hasPhoto ? (
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
                    <motion.img key="photo" src={finalPhoto!} alt="Character" className="w-full h-52 object-cover" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
                  )}
                </AnimatePresence>
                {styledPhoto && !isStylizing && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: 'rgba(200,75,158,0.9)', color: 'white' }}>Story version</div>
                )}
              </div>
              <div className="flex gap-2 mt-2">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-textSecondary" style={{ background: '#1a1525', border: '1px solid #2a2040' }} onClick={() => fileRef.current?.click()}>
                  <Camera size={12} /> Change
                </button>
                {stylizeFailed && (
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-textSecondary" style={{ background: '#1a1525', border: '1px solid #2a2040' }} onClick={handleRetry}>
                    <RefreshCw size={12} /> Retry style
                  </button>
                )}
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
            <p className="text-textSecondary text-[11px]">Your photo is never stored beyond your session.</p>
          </div>
        </motion.div>

        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); if (e.target) e.target.value = '' }} />

        {/* ── CTA ── */}
        <div className="mt-auto space-y-3 safe-bottom">
          <button
            className="btn-accent"
            onClick={handleCreate}
            disabled={!canCreate}
            style={{ opacity: canCreate ? 1 : 0.5, cursor: canCreate ? 'pointer' : 'not-allowed' }}
          >
            {isStylizing ? 'Stylizing photo...' : 'Create Character'}
          </button>
        </div>
      </div>
    </div>
  )
}
