import { useRef, useState, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Camera, Shield, RefreshCw, Sparkles } from 'lucide-react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'
import { useStore } from '../store/useStore'
import { stylizeSelfie } from '../lib/togetherAi'
import { getCroppedImg } from '../lib/cropImage'
import { trackEvent, uploadSelfieToStorage } from '../lib/supabase'

const ALL_ARCHETYPES = [
  { id: 'quiet', label: 'The Quiet One', bio: "I'm usually the last to speak up in a group, but people end up telling me everything. Good listener, bad at faking interest." },
  { id: 'bold', label: 'The Bold One', bio: "I'll be the one to say what everyone's thinking. Probably too direct sometimes, but at least you always know where you stand with me." },
  { id: 'dreamer', label: 'The Dreamer', bio: "I zone out a lot. Honestly I'm probably thinking about some random scenario that'll never happen. My notes app is chaos." },
  { id: 'protector', label: 'The Protector', bio: "If someone messes with my people, that's my problem now. I'm the friend who walks you to your car at night without being asked." },
  { id: 'flirt', label: 'The Flirt', bio: "I'm naturally flirty and I can't really turn it off. It's not always intentional, I just like making people smile." },
  { id: 'cynic', label: 'The Realist', bio: "I'm the friend who reads the reviews before we go. Not trying to kill the vibe, I've just been burned enough times." },
  { id: 'golden', label: 'The Overachiever', bio: "I pick things up fast and people expect a lot from me. Honestly the pressure is kind of suffocating but I can't stop." },
  { id: 'rebel', label: 'The Rebel', bio: "I have a problem with being told what to do. Not in an edgy way, I just genuinely need to figure things out myself." },
  { id: 'healer', label: 'The Emotional One', bio: "I cry at movies, I cry when my friends cry, I cried at a dog video this morning. I feel everything really intensely." },
  { id: 'trickster', label: 'The Class Clown', bio: "I use humor to deal with basically everything. My friends say I'm funny but they also worry about me sometimes. Fair enough." },
  { id: 'stoic', label: 'The Calm One', bio: "People freak out and look at me like 'why aren't you stressed?' I am, I just don't see how panicking helps." },
  { id: 'romantic', label: 'The Hopeless Romantic', bio: "I still believe in love letters and big romantic gestures. My friends think I watch too many movies. They're probably right." },
  { id: 'strategist', label: 'The Planner', bio: "I have a spreadsheet for my trip next month and a backup plan for the backup plan. Spontaneous people stress me out." },
  { id: 'wildcard', label: 'The Wildcard', bio: "Last Tuesday I booked a flight to a city I've never been to. My decision-making process is basically vibes." },
  { id: 'artist', label: 'The Creative', bio: "I doodle during meetings, rearrange my room every month, and have strong opinions about fonts. It's just how my brain works." },
  { id: 'loner', label: 'The Lone Wolf', bio: "Friday nights alone with a book or a show is genuinely my ideal plan. I like people, I just need a lot of time to recharge." },
  { id: 'caretaker', label: 'The Mom Friend', bio: "I'm the one with snacks in my bag, bandaids in my wallet, and I always check if everyone got home safe." },
  { id: 'provocateur', label: 'The Debater', bio: "I will play devil's advocate about anything. Not to be annoying, I just think it's boring when everyone agrees too fast." },
  { id: 'optimist', label: 'The Optimist', bio: "Things usually work out and I genuinely believe that. People say I'm naive but I've been right more than they have." },
  { id: 'ghost', label: 'The Ghost', bio: "I disappear for like three days and come back like nothing happened. My read receipts are off and I'm not sorry about it." },
  { id: 'scholar', label: 'The Nerd', bio: "I go down Wikipedia rabbit holes for fun and I'll randomly know facts about deep sea creatures or medieval farming. It's a problem." },
  { id: 'performer', label: 'The Main Character', bio: "I'm loud, I talk with my hands, and I've never entered a room quietly in my life. Shy is not in my vocabulary." },
  { id: 'empath', label: 'The Sensitive One', bio: "I can tell when something's off with someone before they say anything. It's useful but honestly kind of exhausting." },
  { id: 'phoenix', label: 'The Comeback Kid', bio: "I've had some rough patches that I don't really talk about. But I'm still here and honestly I'm doing pretty well now." },
  { id: 'detective', label: 'The Nosy One', bio: "I notice everything. Who liked whose post, who changed their bio, whose story didn't add up. I should've been a detective." },
  { id: 'idealist', label: 'The Idealist', bio: "I volunteer, I sign petitions, I get genuinely upset about things that don't affect me. I just think we should try harder." },
  { id: 'shadow', label: 'The Observer', bio: "I'm the quiet one at the party who's memorized everyone's drink order and knows who's about to start drama." },
  { id: 'charmer', label: 'The Smooth Talker', bio: "I got out of a parking ticket once just by being friendly. People say I could sell anything. I just like talking to people." },
  { id: 'old-soul', label: 'The Old Soul', bio: "My friends want to go clubbing and I want to sit somewhere quiet with wine and talk about life. I've been 40 since I was 16." },
  { id: 'hothead', label: 'The Hothead', bio: "I have a short fuse and I know it. Working on it. But if you come at me wrong I'm not going to pretend it's fine." },
  { id: 'wallflower', label: 'The Wallflower', bio: "I take a while to open up but once I do I'm actually pretty fun. Most people just don't wait around long enough to find out." },
  { id: 'mentor', label: 'The Big Sibling', bio: "I give unsolicited advice and I check in on people even when they don't ask. I've made a lot of mistakes so I might as well be useful." },
  { id: 'drifter', label: 'The Drifter', bio: "I move cities, change jobs, switch up my whole look every year. I like reinventing myself. Commitment to a place isn't really my thing." },
  { id: 'perfectionist', label: 'The Perfectionist', bio: "I rewrite texts three times before sending them. My room is either spotless or a disaster, no in between." },
  { id: 'comedian', label: 'The Funny One', bio: "Making people laugh is my whole thing. Group chat MVP. I'll workshop a joke in my head for 20 minutes before I send it." },
  { id: 'enigma', label: 'The Mystery', bio: "People say they can't read me and honestly that's fine. I don't need everyone to get me, just the right ones." },
  { id: 'nurturer', label: 'The Caregiver', bio: "I'll make sure you've eaten, ask how your doctor's appointment went, and remember your dog's birthday. It's just what I do." },
  { id: 'maverick', label: 'The Trendsetter', bio: "I was into things before they were cool and I'll never let you forget it. I just don't like doing what everyone else is doing." },
  { id: 'mediator', label: 'The Peacekeeper', bio: "When my friends fight they both call me. I can see everyone's side which is great for them and exhausting for me." },
  { id: 'survivalist', label: 'The Tough One', bio: "I've dealt with stuff that aged me ten years in two. Don't really talk about it much but it made me hard to rattle." },
  { id: 'sage', label: 'The Wise One', bio: "My friends come to me for advice and I give it to them straight. I don't sugarcoat things but I'm never mean about it." },
  { id: 'thrill-seeker', label: 'The Adrenaline Junkie', bio: "Skydiving, spicy food, horror movies, bad decisions at 2am. I get bored really easily and I need things to be a little dangerous." },
  { id: 'loyalist', label: 'The Ride or Die', bio: "I have like four close friends and I'd do anything for them. My circle is small on purpose. I don't do surface-level." },
  { id: 'philosopher', label: 'The Overthinker', bio: "I stayed up until 3am last night thinking about whether free will is real. My brain doesn't have an off switch." },
  { id: 'sweetheart', label: 'The Sweetheart', bio: "I leave nice notes for people, I remember the small things, and I genuinely mean it when I ask how you're doing." },
  { id: 'antagonist', label: 'The Instigator', bio: "I stir the pot sometimes. Not to be mean, I just think things get interesting when you shake them up a little." },
  { id: 'adventurer', label: 'The Adventurer', bio: "I said yes to a road trip with 2 hours notice last month. Planning is overrated, the best stories start with bad ideas." },
  { id: 'introvert', label: 'The Introvert', bio: "Social battery dies after like 3 hours max. I need a full day alone to recover from a party. No I'm not mad, I'm just tired." },
  { id: 'guardian', label: 'The Guardian', bio: "I walk on the street side of the sidewalk, I check the locks twice, and I always know where the exits are. Can't help it." },
  { id: 'free-spirit', label: 'The Free Spirit', bio: "I quit a stable job to travel once and everyone thought I was insane. Turned out to be the best decision I ever made." },
]

function getRandomArchetypes(count: number, exclude?: string[]): typeof ALL_ARCHETYPES {
  const pool = exclude ? ALL_ARCHETYPES.filter((a) => !exclude.includes(a.id)) : [...ALL_ARCHETYPES]
  const shuffled = pool.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

export function CreateCharacterPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')
  const createCharacter = useStore((s) => s.createCharacter)
  const updateCharacter = useStore((s) => s.updateCharacter)
  const characters = useStore((s) => s.characters)
  const editingChar = editId ? characters.find((c) => c.id === editId) : null
  const isEditMode = !!editingChar
  const fileRef = useRef<HTMLInputElement>(null)

  // ── Form state ──
  const [name, setName] = useState(editingChar?.name ?? '')
  const [gender, setGender] = useState<'male' | 'female' | null>(editingChar?.gender ?? null)

  // Personality
  const matchingArch = editingChar?.bio ? ALL_ARCHETYPES.find((a) => a.bio === editingChar.bio) : null
  const [selectedArch, setSelectedArch] = useState<string | null>(matchingArch?.id ?? null)
  const [custom, setCustom] = useState(matchingArch ? '' : editingChar?.bio ?? '')
  const [isCustom, setIsCustom] = useState(!matchingArch && !!editingChar?.bio)
  const [displayedArchetypes, setDisplayedArchetypes] = useState(() => {
    if (matchingArch) {
      const others = getRandomArchetypes(2, [matchingArch.id])
      return [matchingArch, ...others]
    }
    return getRandomArchetypes(3)
  })

  const shufflePersonalities = () => {
    setDisplayedArchetypes(getRandomArchetypes(3, displayedArchetypes.map((a) => a.id)))
    setSelectedArch(null)
  }

  // Selfie
  const [rawImage, setRawImage] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const existingSelfie = editingChar?.selfieUrl ?? null
  const isDefaultAvatar = existingSelfie?.startsWith('/default-')
  const [originalPhoto, setOriginalPhoto] = useState<string | null>(existingSelfie && !isDefaultAvatar ? existingSelfie : null)
  const [styledPhoto, setStyledPhoto] = useState<string | null>(null)
  const [isStylizing, setIsStylizing] = useState(false)
  const [stylizeFailed, setStylizeFailed] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedSelfieUrl, setUploadedSelfieUrl] = useState<string | null>(existingSelfie && !isDefaultAvatar ? existingSelfie : null)
  const uploadIdRef = useRef(crypto.randomUUID())
  const [dragging, setDragging] = useState(false)
  const [selectedDefault, setSelectedDefault] = useState<string | null>(isDefaultAvatar ? existingSelfie : null)

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  const loveInterestName = gender === 'male' ? 'Yuna' : gender === 'female' ? 'Jiwon' : null
  const isCropping = !!rawImage
  const hasPhoto = !!originalPhoto
  const finalPhoto = styledPhoto ?? originalPhoto
  const bio = isCustom ? custom.trim() : ALL_ARCHETYPES.find((a) => a.id === selectedArch)?.bio ?? null
  const canCreate = name.trim().length > 0 && gender !== null && (hasPhoto || !!selectedDefault) && !isStylizing && !isCropping && !isUploading

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
    setSelectedDefault(null)
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
    if (!canCreate) return
    const selfieUrl = uploadedSelfieUrl ?? finalPhoto ?? selectedDefault ?? null
    if (isEditMode) {
      updateCharacter(editId!, {
        name: name.trim(),
        gender: gender!,
        selfieUrl,
        bio: bio || null,
      })
      trackEvent('character_updated', { gender, hasPhoto: !!finalPhoto, hasDefault: !!selectedDefault, hasBio: !!bio })
    } else {
      createCharacter({
        name: name.trim(),
        gender: gender!,
        selfieUrl,
        bio: bio || null,
      })
      trackEvent('character_created', { gender, hasPhoto: !!finalPhoto, hasDefault: !!selectedDefault, hasBio: !!bio })
    }
    navigate(isEditMode ? '/characters' : '/')
  }

  if (!isEditMode && characters.length >= 3) {
    return (
      <div className="min-h-screen min-h-dvh bg-bg flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-textSecondary text-lg mb-3">Maximum 3 twins reached</p>
          <button onClick={() => navigate('/')} className="text-accent text-sm hover:underline">Go back</button>
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
            <div className="relative shrink-0" style={{ width: 28, height: 28 }}>
              <div className="absolute" style={{ width: 17, height: 21, borderRadius: 3, background: '#7C3AED', transform: 'rotate(8deg)', top: 0, left: 5 }} />
              <div className="absolute" style={{ width: 17, height: 21, borderRadius: 3, background: '#A78BFA', transform: 'rotate(3deg)', top: 1.5, left: 3.5 }} />
              <div className="absolute" style={{ width: 17, height: 21, borderRadius: 3, background: '#E9D5FF', top: 3, left: 2 }} />
            </div>
            <span className="font-semibold" style={{ fontFamily: "'Syne', sans-serif", background: 'linear-gradient(180deg, #D4C4F0 0%, #B8A5E0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>chaptr</span>
          </div>
        </div>

        <button onClick={() => navigate(isEditMode ? '/characters' : '/')} className="flex items-center gap-1 text-textSecondary text-sm mt-4 mb-6 hover:text-textPrimary transition-colors w-fit">
          <ChevronLeft size={16} />
          Back
        </button>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-textPrimary font-bold text-3xl mb-1">{isEditMode ? 'Edit Twin' : 'Create Your Twin'}</h1>
          <p className="text-textSecondary text-base mb-6">{isEditMode ? 'Update your character details.' : "Build who you'll be in the story."}</p>
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
            <span className="text-white/25">|</span>
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
          <label className="text-textMuted text-xs uppercase tracking-widest mb-2 block">Photo</label>

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
            <>
              <p className="text-textSecondary text-xs mb-2">Upload a selfie or pick a default</p>
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
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-textMuted text-[10px] uppercase tracking-widest">or</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              <div className="flex gap-3 mb-3">
                {[
                  { id: '/default-male.png', label: 'Male' },
                  { id: '/default-female.png', label: 'Female' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    className="cursor-pointer flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all"
                    style={{
                      background: selectedDefault === opt.id ? 'rgba(200,75,158,0.15)' : '#13101c',
                      border: selectedDefault === opt.id ? '2px solid #c84b9e' : '2px solid #2a2040',
                    }}
                    onClick={() => setSelectedDefault(selectedDefault === opt.id ? null : opt.id)}
                  >
                    <div className="w-16 h-16 rounded-full overflow-hidden">
                      <img src={opt.id} alt={opt.label} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-textSecondary text-[11px]">{opt.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {hasPhoto && (
            <div className="flex items-start gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}>
              <Shield size={12} className="text-gem shrink-0 mt-0.5" />
              <p className="text-textSecondary text-[11px]">Your anime-style photo is stored to personalise story scenes. Your original photo is never saved.</p>
            </div>
          )}
        </motion.div>

        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); if (e.target) e.target.value = '' }} />

        {/* ── CTA ── */}
        <div className="mt-auto space-y-3 safe-bottom">
          <button
            className="btn-accent"
            onClick={handleSave}
            disabled={!canCreate}
            style={{ opacity: canCreate ? 1 : 0.5, cursor: canCreate ? 'pointer' : 'not-allowed' }}
          >
            {isStylizing ? 'Stylizing photo...' : isUploading ? 'Uploading photo...' : isEditMode ? 'Save Changes' : 'Create Twin'}
          </button>
        </div>
      </div>
    </div>
  )
}
