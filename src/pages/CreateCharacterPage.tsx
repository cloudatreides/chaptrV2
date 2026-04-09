import { useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Camera, Shield, RefreshCw, Sparkles } from 'lucide-react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'
import { useStore } from '../store/useStore'
import { stylizeSelfie } from '../lib/togetherAi'
import { getCroppedImg } from '../lib/cropImage'
import { trackEvent, uploadSelfieToStorage } from '../lib/supabase'

const ALL_ARCHETYPES = [
  { id: 'quiet', label: 'The Quiet One', bio: "I'm the quiet type who actually listens. People tell me things they don't tell anyone else — maybe because I never rush them." },
  { id: 'bold', label: 'The Bold One', bio: "I say what I think. Life's too short for small talk and polite smiles. If something matters, I go after it." },
  { id: 'dreamer', label: 'The Dreamer', bio: "I notice things other people miss — the way light hits a window, the pause before someone lies. I live half in my head and I like it there." },
  { id: 'protector', label: 'The Protector', bio: "I don't start fights, but I finish them. The people I care about don't get hurt — not on my watch." },
  { id: 'flirt', label: 'The Flirt', bio: "I can't help it — I like the spark. A look, a smile, a well-timed compliment. Life's more fun when you keep people guessing." },
  { id: 'cynic', label: 'The Cynic', bio: "I've seen enough to know how things usually end. I'm not pessimistic — I'm just paying attention." },
  { id: 'golden', label: 'The Golden Child', bio: "I'm good at things. Annoyingly good. But underneath the shine, I'm terrified of the one thing I can't do: disappoint people." },
  { id: 'rebel', label: 'The Rebel', bio: "Rules were made by people who wanted to stay comfortable. I'd rather be free and uncomfortable than safe and bored." },
  { id: 'healer', label: 'The Healer', bio: "I feel what other people feel — sometimes before they do. It's a gift. It's also exhausting." },
  { id: 'trickster', label: 'The Trickster', bio: "I keep things light because the world is heavy enough. If I'm laughing, I'm coping. If I'm joking, I'm deflecting. Don't look too close." },
  { id: 'stoic', label: 'The Stoic', bio: "I don't waste energy on things I can't control. Calm isn't the absence of feeling — it's choosing not to let it drive." },
  { id: 'romantic', label: 'The Romantic', bio: "I believe in the grand gesture, the love letter, the 2am confession. Some people call it naive. I call it brave." },
  { id: 'strategist', label: 'The Strategist', bio: "I'm always three steps ahead. People think I'm calm — really I've just already planned for this." },
  { id: 'wildcard', label: 'The Wildcard', bio: "I do things that don't make sense until they do. Chaos isn't the enemy — boredom is." },
  { id: 'artist', label: 'The Artist', bio: "I see the world in textures and colours other people walk past. Creating isn't a hobby — it's how I breathe." },
  { id: 'loner', label: 'The Lone Wolf', bio: "I'm not antisocial. I just don't need a crowd to feel whole. My own company has always been enough." },
  { id: 'caretaker', label: 'The Caretaker', bio: "I remember your coffee order, your bad days, your allergies. Taking care of people isn't a burden — it's how I love." },
  { id: 'provocateur', label: 'The Provocateur', bio: "I like uncomfortable truths more than comfortable lies. If my questions make you squirm, good — you needed to think." },
  { id: 'optimist', label: 'The Optimist', bio: "I know the odds. I choose hope anyway. Not because I'm naive — because giving up has never fixed anything." },
  { id: 'ghost', label: 'The Ghost', bio: "I come and go. Sometimes I vanish for days. It's not personal — I just need space to exist without being seen." },
  { id: 'scholar', label: 'The Scholar', bio: "I'd rather read than talk. Knowledge isn't power — it's comfort. The more I understand, the less the world scares me." },
  { id: 'performer', label: 'The Performer', bio: "Every room I walk into becomes a stage. I'm not showing off — I'm surviving. Attention is the only currency I trust." },
  { id: 'empath', label: 'The Empath', bio: "I absorb other people's emotions like a sponge. It makes me a great friend and a terrible liar." },
  { id: 'phoenix', label: 'The Phoenix', bio: "I've been knocked down more times than I can count. But I keep getting back up — angrier, wiser, and less willing to stay down." },
  { id: 'detective', label: 'The Detective', bio: "I notice the detail everyone else misses — the hesitation, the cover story, the thing that doesn't add up. Truth always leaks." },
  { id: 'idealist', label: 'The Idealist', bio: "I believe the world can be better. Not perfect — just kinder. And I'll fight for that even when it costs me." },
  { id: 'shadow', label: 'The Shadow', bio: "I watch more than I speak. By the time you notice me, I already know your patterns, your tells, your exits." },
  { id: 'charmer', label: 'The Charmer', bio: "I can talk my way into — or out of — almost anything. It's not manipulation. It's just... persuasion with a smile." },
  { id: 'old-soul', label: 'The Old Soul', bio: "I've always felt older than my age. Small talk bores me. I want the 3am conversation about what makes you afraid." },
  { id: 'hothead', label: 'The Hothead', bio: "I feel everything at full volume. My anger runs hot, my love runs hotter. I don't do anything halfway." },
  { id: 'wallflower', label: 'The Wallflower', bio: "I bloom quietly. Most people don't notice me at first — but the ones who do tend to stay." },
  { id: 'mentor', label: 'The Mentor', bio: "I've made enough mistakes to help you skip a few. I don't give advice to sound smart — I give it because I care." },
  { id: 'drifter', label: 'The Drifter', bio: "I don't stay anywhere too long. Places, people, plans — I hold them loosely. Freedom is the only thing I grip tight." },
  { id: 'perfectionist', label: 'The Perfectionist', bio: "If it's worth doing, it's worth doing right. People call me intense. I call it having standards." },
  { id: 'comedian', label: 'The Comedian', bio: "If I can make you laugh, I can survive anything. Humour is my armour, my weapon, and my love language." },
  { id: 'enigma', label: 'The Enigma', bio: "People can't figure me out, and I like it that way. Mystery isn't a wall — it's a filter for who's worth letting in." },
  { id: 'nurturer', label: 'The Nurturer', bio: "I make sure everyone's eaten, rested, and okay — even when I'm falling apart. Caring for others is easier than caring for myself." },
  { id: 'maverick', label: 'The Maverick', bio: "I don't follow trends — I set them. Convention is just peer pressure from dead people." },
  { id: 'mediator', label: 'The Mediator', bio: "I see both sides of every argument. It makes me great at keeping peace — and terrible at picking one." },
  { id: 'survivalist', label: 'The Survivalist', bio: "I've been through things that would break most people. They didn't break me — they made me harder to kill." },
  { id: 'sage', label: 'The Sage', bio: "I speak when it matters and stay silent when it doesn't. Wisdom isn't about knowing everything — it's knowing what to ignore." },
  { id: 'thrill-seeker', label: 'The Thrill Seeker', bio: "I need the rush — the edge, the risk, the moment where everything could go wrong. That's where I feel alive." },
  { id: 'loyalist', label: 'The Loyalist', bio: "Once you're mine, you're mine forever. I don't do half-commitments. Betray my trust once, and we're done." },
  { id: 'philosopher', label: 'The Philosopher', bio: "I question everything — even my own questions. Most people want answers. I just want better problems." },
  { id: 'sweetheart', label: 'The Sweetheart', bio: "I believe in kindness even when it's not returned. The world is harsh enough — I'd rather be someone's soft place to land." },
  { id: 'antagonist', label: 'The Antagonist', bio: "I push buttons because comfort breeds complacency. You'll hate me at first — then you'll realise I made you stronger." },
  { id: 'adventurer', label: 'The Adventurer', bio: "I say yes first and figure out the details later. Life rewards the people who move — not the ones who plan." },
  { id: 'introvert', label: 'The Deep Introvert', bio: "My inner world is richer than anything outside. I recharge alone, think in layers, and love in silence." },
  { id: 'guardian', label: 'The Guardian', bio: "I stand between danger and the people I love. It's not heroism — it's instinct. I couldn't live with myself otherwise." },
  { id: 'free-spirit', label: 'The Free Spirit', bio: "I follow my heart, even when it makes no sense. Structure suffocates me. I need room to wander, wonder, and be wrong." },
]

function getRandomArchetypes(count: number, exclude?: string[]): typeof ALL_ARCHETYPES {
  const pool = exclude ? ALL_ARCHETYPES.filter((a) => !exclude.includes(a.id)) : [...ALL_ARCHETYPES]
  const shuffled = pool.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

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
  const [displayedArchetypes, setDisplayedArchetypes] = useState(() => getRandomArchetypes(3))

  const shufflePersonalities = () => {
    setDisplayedArchetypes(getRandomArchetypes(3, displayedArchetypes.map((a) => a.id)))
    setSelectedArch(null)
  }

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

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  const loveInterestName = gender === 'male' ? 'Yuna' : gender === 'female' ? 'Jiwon' : null
  const isCropping = !!rawImage
  const hasPhoto = !!originalPhoto
  const finalPhoto = styledPhoto ?? originalPhoto
  const bio = isCustom ? custom.trim() : ALL_ARCHETYPES.find((a) => a.id === selectedArch)?.bio ?? null
  const canCreate = name.trim().length > 0 && gender !== null && !isStylizing && !isCropping && !isUploading

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
      setUploadedSelfieUrl(null)
      uploadIdRef.current = crypto.randomUUID()
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

  const handleCreate = () => {
    if (!canCreate) return
    createCharacter({
      name: name.trim(),
      gender: gender!,
      selfieUrl: uploadedSelfieUrl ?? finalPhoto ?? null,
      bio: bio || null,
    })
    trackEvent('character_created', { gender, hasPhoto: !!finalPhoto, hasBio: !!bio })
    navigate('/characters')
  }

  if (characters.length >= 3) {
    return (
      <div className="min-h-screen min-h-dvh bg-bg flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-textSecondary text-lg mb-3">Maximum 3 twins reached</p>
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
          <h1 className="text-textPrimary font-bold text-3xl mb-1">Create Twin</h1>
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
            <AnimatePresence mode="popLayout">
              {displayedArchetypes.map((arch) => (
                <motion.button
                  key={arch.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="w-full text-left p-3 rounded-xl transition-all"
                  style={{
                    background: selectedArch === arch.id && !isCustom ? 'rgba(200,75,158,0.12)' : '#13101c',
                    border: selectedArch === arch.id && !isCustom ? '1px solid rgba(200,75,158,0.6)' : '1px solid #2a2040',
                  }}
                  onClick={() => { setSelectedArch(arch.id); setIsCustom(false) }}
                >
                  <p className="text-textPrimary font-semibold text-sm mb-0.5">{arch.label}</p>
                  <p className="text-textSecondary text-xs leading-relaxed">{arch.bio}</p>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <button className="flex items-center gap-1.5 text-accent text-xs font-medium" onClick={shufflePersonalities}>
              <RefreshCw size={12} />
              Show more
            </button>
            <span className="text-white/10">|</span>
            <button className="flex items-center gap-2 text-accent text-xs font-medium" onClick={() => setIsCustom(!isCustom)}>
              <Sparkles size={12} />
              {isCustom ? 'Pick a preset instead' : 'Write your own'}
            </button>
          </div>

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
                    <motion.img key="photo" src={finalPhoto!} alt="Character" className="w-full h-auto max-h-[360px] object-contain" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
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
            <p className="text-textSecondary text-[11px]">Your anime-style photo is stored to personalise story scenes. Your original photo is never saved.</p>
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
            {isStylizing ? 'Stylizing photo...' : isUploading ? 'Uploading photo...' : 'Create Twin'}
          </button>
        </div>
      </div>
    </div>
  )
}
