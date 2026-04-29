import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Loader2, Image as ImageIcon, AlertTriangle, Trash2, RefreshCcw } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { useStore } from '../store/useStore'
import { generateSceneImage } from '../lib/togetherAi'
import { generateNanoBananaImage } from '../lib/nanoBanana'
import { getTravelCompanion, TRAVEL_COMPANIONS } from '../data/travel/companions'

const BENCH_STORAGE_KEY = 'chaptr-image-bench-inputs'

function isEphemeralLike(u: string): boolean {
  return u.includes('api.together.ai/shrt') || u.includes('api.together.xyz/shrt') || u.includes('together.ai/imgproxy')
}

const SG = "'Space Grotesk', sans-serif"

const DEFAULT_PROMPT = `Anime illustration, two people in the foreground, posing for a photo together at an airport gate: a young man on the left and a young woman on the right, both smiling at the camera, both wearing backpacks, excited to travel to Bangkok. Behind them, large terminal windows show a plane on the tarmac in warm golden hour light. No text, no signs, no departure boards`

// Travel-mode companions only. Derived from TRAVEL_COMPANIONS so this stays in
// sync as new travel companions are added — no manual maintenance.
const TRAVEL_COMPANION_OPTIONS = TRAVEL_COMPANIONS
  .filter((c) => !!c.character.staticPortrait)
  .map((c) => ({ name: c.character.name, url: c.character.staticPortrait! }))

type ModelId = 'flux2' | 'kontext' | 'schnell' | 'nano-banana-2' | 'nano-banana-pro' | 'nano-banana'

const MODEL_LABELS: Record<ModelId, string> = {
  'flux2': 'FLUX.2 Pro',
  'kontext': 'Kontext Pro',
  'schnell': 'Schnell',
  'nano-banana-2': 'Nano Banana 2 (Gemini 3.1 Flash)',
  'nano-banana-pro': 'Nano Banana Pro (Gemini 3 Pro)',
  'nano-banana': 'Nano Banana (Gemini 2.5)',
}

// Public per-image pricing in USD as of Apr 2026. Approximate; useful for
// rough cost-at-scale comparison, not billing. Gemini prices are 1K
// (1024x1024) tier — bench renders at 768x576 which falls into the same
// or lower bracket. Source: ai.google.dev/gemini-api/docs/pricing
const MODEL_COST_USD: Record<ModelId, number> = {
  'flux2': 0.03,             // FLUX.2 [pro] via together.ai/pricing
  'kontext': 0.04,           // FLUX.1 Kontext [pro] via together.ai/pricing
  'schnell': 0.0027,         // FLUX.1 [schnell] via together.ai/pricing
  'nano-banana': 0.039,      // Gemini 2.5 Flash Image — original Nano Banana
  'nano-banana-2': 0.067,    // Gemini 3.1 Flash Image Preview — newer Flash tier
  'nano-banana-pro': 0.134,  // Gemini 3 Pro Image — premium
}

const NANO_MODEL_IDS: Partial<Record<ModelId, string>> = {
  'nano-banana-2': 'gemini-3.1-flash-image-preview',
  'nano-banana-pro': 'gemini-3-pro-image-preview',
  'nano-banana': 'gemini-2.5-flash-image',
}

// Audit table: every place in the app that calls an image-gen model.
// Source-of-truth reference for admins comparing model choices and prompts.
// When the production code changes, update this table to match.
interface ImageGenAction {
  feature: string
  category: 'Twin' | 'Travel' | 'Story' | 'Chat reaction' | 'Cast'
  trigger: string
  source: string  // file:line
  model: string   // tier as actually used in prod
  references: 'twin + companion' | 'twin only' | 'companion only' | 'none'
  promptTemplate: string
  notes?: string
}

const IMAGE_GEN_AUDIT: ImageGenAction[] = [
  {
    feature: 'Stylize twin selfie',
    category: 'Twin',
    trigger: 'User uploads selfie during twin creation/edit',
    source: 'src/lib/togetherAi.ts:257 (stylizeSelfie)',
    model: 'Kontext Pro (FLUX.1-kontext-pro)',
    references: 'twin only',
    promptTemplate: 'Transform this photo into an anime-style portrait illustration. Keep the exact same person, face, gender, facial features, glasses if present, hairstyle, and expression. Apply a clean anime art style with soft studio lighting, expressive eyes, and detailed hair. Clean simple background.',
    notes: 'Returns base64 data URL → uploaded to Supabase Storage → permanent URL on twin.',
  },
  {
    feature: 'Travel departure scene',
    category: 'Travel',
    trigger: 'Trip starts (DepartureScreen mounts, no existing image)',
    source: 'src/components/travel/DepartureScreen.tsx:62',
    model: 'FLUX.2 Pro → Schnell fallback',
    references: 'twin + companion',
    promptTemplate: 'Anime illustration, two people in the foreground, posing for a photo together at an airport gate: a {protagNoun} on the left and a {compNoun} ({compShort}) on the right, both smiling at the camera, both wearing backpacks, excited to travel to {city}...',
    notes: 'Falls back to Schnell with text-only prompt if FLUX.2 fails. Relative URLs converted to absolute before passing as references.',
  },
  {
    feature: 'Travel scene (per day/scene)',
    category: 'Travel',
    trigger: 'Day advances or scene changes during a trip',
    source: 'src/pages/TravelReaderPage.tsx:1023',
    model: 'FLUX.2 Pro / Kontext / Schnell (auto)',
    references: 'twin + companion',
    promptTemplate: 'scene.imagePrompt (defined per scene in the day itinerary, generated by Claude during day-itinerary creation)',
    notes: 'Itinerary stores per-scene imagePrompt. Tier picked by reference availability and scene.protagonistVisible flag.',
  },
  {
    feature: '"Take a selfie" chat action',
    category: 'Travel',
    trigger: 'User taps 📸 Take a selfie button in trip chat',
    source: 'src/pages/TravelReaderPage.tsx:672',
    model: 'FLUX.2 Pro / Kontext / Schnell (auto)',
    references: 'twin + companion',
    promptTemplate: 'anime illustration, cel-shaded, selfie taken by {playerGender}, close-up selfie with {companionDesc}, both smiling at camera, peace signs, in {locationContext}, {activityHint}. Phone camera perspective, slight wide-angle distortion, warm natural lighting, candid happy energy, vibrant anime art',
    notes: 'Reliable identity match because gender + companion description are baked into the SCENE prompt, not just the wrapper preamble.',
  },
  {
    feature: 'Story scene image',
    category: 'Story',
    trigger: 'Story step advances (mounts a step with sceneImagePrompt)',
    source: 'src/pages/StoryReaderPage.tsx:213',
    model: 'FLUX.2 Pro / Kontext / Schnell (auto)',
    references: 'twin only',
    promptTemplate: 'currentStep.sceneImagePrompt (defined per step in src/data/stories/<id>.ts)',
    notes: 'Each story step defines its own sceneImagePrompt. Player only — companions described in text.',
  },
  {
    feature: 'Story branch option preview',
    category: 'Story',
    trigger: 'Choice point reached in story',
    source: 'src/pages/StoryReaderPage.tsx:232',
    model: 'Kontext (with selfie) / Schnell (none)',
    references: 'twin only',
    promptTemplate: 'opt.imagePrompt (per choice option in story data)',
  },
  {
    feature: 'Reveal scene',
    category: 'Story',
    trigger: 'Story complete → reveal page loads',
    source: 'src/pages/RevealPage.tsx:54',
    model: 'FLUX.2 Pro / Kontext / Schnell (auto)',
    references: 'twin only',
    promptTemplate: 'Reveal-specific prompt built from playthrough state',
  },
  {
    feature: 'NPC character portrait (AI-generated)',
    category: 'Chat reaction',
    trigger: 'Character first appears without staticPortrait',
    source: 'src/lib/togetherAi.ts:222 (generateCharacterPortrait)',
    model: 'Schnell (FLUX.1-schnell)',
    references: 'none',
    promptTemplate: 'character.portraitPrompt (defined per character in src/data/characters.ts)',
    notes: 'Most main characters have staticPortrait — this path only runs for characters without one.',
  },
  {
    feature: 'Reaction image — love letter',
    category: 'Chat reaction',
    trigger: 'Send a love letter chat action',
    source: 'src/data/chatActions.ts:266 (buildReactionImagePrompt)',
    model: 'Schnell',
    references: 'none',
    promptTemplate: '{base portrait}, holding a handwritten letter close to their chest, eyes soft and glistening with emotion, gentle blush on cheeks, tender surprised smile, warm intimate lighting, clean soft-focus background, high quality anime art style',
  },
  {
    feature: 'Reaction image — serenade',
    category: 'Chat reaction',
    trigger: 'Serenade chat action',
    source: 'src/data/chatActions.ts:266',
    model: 'Schnell',
    references: 'none',
    promptTemplate: '{base portrait}, eyes closed with a peaceful moved expression, hand over heart, soft blush, listening to music, dreamy warm lighting, deeply touched',
  },
  {
    feature: 'Reaction image — comfort (hug)',
    category: 'Chat reaction',
    trigger: 'Comfort chat action',
    source: 'src/data/chatActions.ts:266',
    model: 'Schnell',
    references: 'none',
    promptTemplate: '{base portrait}, arms open reaching out for a hug, soft vulnerable eyes glistening with tears, gentle grateful smile, warm golden lighting, emotionally moved',
  },
  {
    feature: 'Reaction image — mystery box (gift)',
    category: 'Chat reaction',
    trigger: 'Send a gift chat action',
    source: 'src/data/chatActions.ts:266',
    model: 'Schnell',
    references: 'none',
    promptTemplate: '{base portrait}, eyes wide with surprise and delight, holding a small gift box, mouth slightly open in excitement, playful curious expression, warm colorful lighting',
  },
  {
    feature: 'Reaction image — extend trip',
    category: 'Chat reaction',
    trigger: 'Stay 2 more days chat action',
    source: 'src/data/chatActions.ts:266',
    model: 'Schnell',
    references: 'none',
    promptTemplate: '{base portrait}, blushing deeply, hands clasped together near face, eyes sparkling with joyful disbelief, genuinely overwhelmed happy smile, soft warm golden lighting, emotionally touched and flustered',
  },
  {
    feature: 'Story romantic action scene (e.g. coffee)',
    category: 'Chat reaction',
    trigger: 'Chat action returns sceneImagePrompt',
    source: 'src/components/ChatScene.tsx:452',
    model: 'FLUX.2 Pro / Kontext / Schnell (auto)',
    references: 'twin only',
    promptTemplate: 'result.sceneImagePrompt (returned by Claude during chat action)',
  },
  {
    feature: 'Cast chat gift / reaction',
    category: 'Cast',
    trigger: 'Cast chat: send gift / kiss / etc',
    source: 'src/pages/CastChatPage.tsx:233,299',
    model: 'Schnell',
    references: 'none',
    promptTemplate: 'result.giftImagePrompt or result.reactionImagePrompt (from Claude tool call)',
  },
  {
    feature: 'Cast group chat reaction',
    category: 'Cast',
    trigger: 'Cast group chat: romantic action targeting one character',
    source: 'src/pages/CastGroupChatPage.tsx:345',
    model: 'Schnell',
    references: 'none',
    promptTemplate: 'result.reactionImagePrompt',
  },
]

interface Result {
  url?: string
  error?: string
  elapsedMs?: number
}

export function AdminImageBenchPage() {
  const navigate = useNavigate()
  const characters = useStore((s) => s.characters)
  const activeCharId = useStore((s) => s.activeCharacterId)
  const deleteCharacter = useStore((s) => s.deleteCharacter)
  const customCompanions = useStore((s) => s.customCompanions)
  const activeChar = characters.find((c) => c.id === activeCharId) ?? characters[0]
  const { user } = useAuth()
  const [isResetting, setIsResetting] = useState(false)

  // Twins-only reset: wipes just the character array + active id. Keeps
  // trips, stories, moments, gems, etc. so you don't lose play history
  // just to fix a corrupted character record. The trips/stories that
  // referenced the wiped twins will become orphaned (their character_id
  // keys won't match anything), which is harmless — they just won't
  // appear in any character-scoped list. You can clean them up later
  // or leave them.
  async function resetTwinsOnly() {
    if (!user) {
      alert('Not signed in.')
      return
    }
    const ok = confirm(
      'RESET TWINS ONLY\n\n' +
      'Wipes the character records (the broken Nicks). Keeps your trips, stories, ' +
      'moments, gems, and affinities — but those that referenced the deleted twins ' +
      'will be orphaned (still in the data, just no longer linked to any twin).\n\n' +
      'Continue?'
    )
    if (!ok) return
    setIsResetting(true)
    try {
      const current = useStore.getState()
      const partial = {
        characters: current.characters,            // we'll override below
        activeCharacterId: current.activeCharacterId, // override below
        selectedUniverse: current.selectedUniverse,
        storyProgress: current.storyProgress,
        gemBalance: current.gemBalance,
        globalAffinities: current.globalAffinities,
        playthroughHistory: current.playthroughHistory,
        ambientPings: current.ambientPings,
        lastSessionTimestamp: Date.now(),
        castChatThreads: current.castChatThreads,
        unlockedCastIds: current.unlockedCastIds,
        groupCastThreads: current.groupCastThreads,
        favoriteCastIds: current.favoriteCastIds,
        storyMoments: current.storyMoments,
        customCompanions: current.customCompanions,
        travelTrips: current.travelTrips,
        activeTripId: current.activeTripId,
        characters_override: [] as never[],
      }
      // Build the cloud upsert with characters wiped
      const cloudState = { ...partial, characters: [], activeCharacterId: null }
      delete (cloudState as Record<string, unknown>).characters_override
      const { error } = await supabase
        .from('user_game_state')
        .upsert(
          { user_id: user.id, state: cloudState, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        )
      if (error) {
        alert('Reset failed: ' + (error.message ?? 'unknown'))
        setIsResetting(false)
        return
      }
      // Wipe in-memory characters too so the redirect doesn't briefly flash old state
      useStore.setState({ characters: [], activeCharacterId: null })
      try { localStorage.removeItem('chaptr-image-bench-inputs') } catch { /* ITP */ }
      window.location.href = '/home'
    } catch (e) {
      alert('Reset failed: ' + String(e))
      setIsResetting(false)
    }
  }


  // Remixed companions you created. Use the custom uploaded photo if present
  // and not ephemeral; otherwise fall back to the base companion's static
  // portrait so every remix is selectable in the bench.
  const remixOptions = customCompanions
    .map((c) => {
      const customUrl = c.remix.imageUrl && !isEphemeralLike(c.remix.imageUrl) ? c.remix.imageUrl : null
      const base = getTravelCompanion(c.baseId)
      const url = customUrl ?? base?.character.staticPortrait ?? null
      const label = base && base.character.name !== c.remix.name
        ? `${c.remix.name} (remix of ${base.character.name})`
        : c.remix.name
      return url ? { name: label, url } : null
    })
    .filter((o): o is { name: string; url: string } => o !== null)
  const deadRemixNames = customCompanions
    .filter((c) => c.remix.imageUrl && isEphemeralLike(c.remix.imageUrl) && !getTravelCompanion(c.baseId)?.character.staticPortrait)
    .map((c) => c.remix.name)

  // Initial values: prefer localStorage so refresh keeps your test URLs.
  // BUT: if the saved twin URL is ephemeral (dead Together AI) OR the active
  // twin's current selfie differs from what's saved (= you created/switched
  // twins since the last bench run), prefer the live twin selfie. Otherwise
  // the bench would lock onto stale URLs forever.
  const initial = (() => {
    try {
      const raw = localStorage.getItem(BENCH_STORAGE_KEY)
      if (raw) return JSON.parse(raw) as { twinUrl?: string; companionUrl?: string; prompt?: string }
    } catch { /* fall through */ }
    return null
  })()

  const liveTwinUrl = activeChar?.selfieUrl ?? ''
  const savedTwinUrl = initial?.twinUrl ?? ''
  const initialTwinUrl =
    !savedTwinUrl || isEphemeralLike(savedTwinUrl) || (liveTwinUrl && liveTwinUrl !== savedTwinUrl)
      ? liveTwinUrl
      : savedTwinUrl

  const [twinUrl, setTwinUrl] = useState(initialTwinUrl)
  const [companionUrl, setCompanionUrl] = useState(initial?.companionUrl ?? getTravelCompanion('yuna')?.character.staticPortrait ?? '')
  const [prompt, setPrompt] = useState(initial?.prompt ?? DEFAULT_PROMPT)
  const [results, setResults] = useState<Record<ModelId, Result>>({} as Record<ModelId, Result>)
  const [running, setRunning] = useState<Record<ModelId, boolean>>({} as Record<ModelId, boolean>)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [view, setView] = useState<'bench' | 'audit'>('bench')

  // Close modal on ESC
  useEffect(() => {
    if (!previewUrl) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPreviewUrl(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [previewUrl])

  // Persist inputs across refresh so the bench survives reloads.
  useEffect(() => {
    try {
      localStorage.setItem(BENCH_STORAGE_KEY, JSON.stringify({ twinUrl, companionUrl, prompt }))
    } catch { /* localStorage may be disabled */ }
  }, [twinUrl, companionUrl, prompt])

  const twinUrlIsEphemeral = !!twinUrl && isEphemeralLike(twinUrl)
  const companionUrlIsEphemeral = !!companionUrl && isEphemeralLike(companionUrl)
  const canResetToActive = !!liveTwinUrl && twinUrl !== liveTwinUrl

  const updateResult = (id: ModelId, r: Result) => setResults((prev) => ({ ...prev, [id]: r }))
  const setBusy = (id: ModelId, b: boolean) => setRunning((prev) => ({ ...prev, [id]: b }))

  async function runFlux2() {
    setBusy('flux2', true)
    updateResult('flux2', {})
    const t0 = performance.now()
    const url = await generateSceneImage({
      prompt,
      width: 768,
      height: 576,
      referenceImageUrl: twinUrl || undefined,
      companionReferenceUrl: companionUrl || undefined,
      includesProtagonist: !!twinUrl && !!companionUrl,
      protagonistGender: activeChar?.gender,
    })
    const elapsed = performance.now() - t0
    updateResult('flux2', url ? { url, elapsedMs: elapsed } : { error: 'Generation failed', elapsedMs: elapsed })
    setBusy('flux2', false)
  }

  async function runKontext() {
    setBusy('kontext', true)
    updateResult('kontext', {})
    const t0 = performance.now()
    // Kontext path: protagonist ref only, no companion ref
    const url = await generateSceneImage({
      prompt,
      width: 768,
      height: 576,
      referenceImageUrl: twinUrl || undefined,
      includesProtagonist: !!twinUrl,
      protagonistGender: activeChar?.gender,
    })
    const elapsed = performance.now() - t0
    updateResult('kontext', url ? { url, elapsedMs: elapsed } : { error: 'Generation failed', elapsedMs: elapsed })
    setBusy('kontext', false)
  }

  async function runSchnell() {
    setBusy('schnell', true)
    updateResult('schnell', {})
    const t0 = performance.now()
    // Force Schnell by passing no references and includesProtagonist=false
    const url = await generateSceneImage({
      prompt,
      width: 768,
      height: 576,
      includesProtagonist: false,
      protagonistGender: activeChar?.gender,
    })
    const elapsed = performance.now() - t0
    updateResult('schnell', url ? { url, elapsedMs: elapsed } : { error: 'Generation failed', elapsedMs: elapsed })
    setBusy('schnell', false)
  }

  async function runNano(model: ModelId) {
    const apiModel = NANO_MODEL_IDS[model]
    if (!apiModel) return
    setBusy(model, true)
    updateResult(model, {})
    const t0 = performance.now()
    // Resolve relative paths (eg /yuna-portrait.png) to absolute URLs so the
    // Edge proxy can actually fetch them.
    const toAbs = (u: string) => u.startsWith('http') ? u : `${window.location.origin}${u}`
    const refs = [twinUrl, companionUrl].filter(Boolean).map(toAbs)
    const result = await generateNanoBananaImage({
      prompt,
      referenceImageUrls: refs,
      model: apiModel,
    })
    const elapsed = performance.now() - t0
    if ('imageDataUrl' in result) {
      updateResult(model, { url: result.imageDataUrl, elapsedMs: elapsed })
    } else {
      updateResult(model, { error: result.error + (result.details ? ` — ${result.details}` : ''), elapsedMs: elapsed })
    }
    setBusy(model, false)
  }

  async function runAll() {
    runFlux2()
    runKontext()
    runSchnell()
    runNano('nano-banana-2')
    runNano('nano-banana-pro')
    runNano('nano-banana')
  }

  return (
    <div className="min-h-screen min-h-dvh" style={{ background: '#0a0810', fontFamily: SG }}>
      <div className="max-w-[1440px] mx-auto px-5 md:px-8 py-6">
        <button
          onClick={() => navigate('/home')}
          className="cursor-pointer flex items-center gap-1 text-white/40 text-sm mb-6 hover:text-white/70"
        >
          <ChevronLeft size={16} /> Back
        </button>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-white text-3xl font-bold mb-1">Image bench</h1>
            <p className="text-white/40 text-sm">
              Same prompt, same references, every available model. Compare identity match, style, and latency.
            </p>
          </div>
          <button
            onClick={resetTwinsOnly}
            disabled={isResetting}
            className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            style={{ background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.3)', color: '#c4b5fd' }}
            title="Wipe just the broken twin records. Keeps trips, stories, moments, gems."
          >
            {isResetting ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
            Reset twins only
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 border-b" style={{ borderColor: '#2a2040' }}>
          <button
            onClick={() => setView('bench')}
            className="cursor-pointer px-4 py-2 text-sm font-semibold transition-colors relative"
            style={{ color: view === 'bench' ? '#fff' : 'rgba(255,255,255,0.4)' }}
          >
            Bench
            {view === 'bench' && <div className="absolute bottom-[-1px] left-0 right-0 h-[2px]" style={{ background: '#c84b9e' }} />}
          </button>
          <button
            onClick={() => setView('audit')}
            className="cursor-pointer px-4 py-2 text-sm font-semibold transition-colors relative"
            style={{ color: view === 'audit' ? '#fff' : 'rgba(255,255,255,0.4)' }}
          >
            Image-gen actions ({IMAGE_GEN_AUDIT.length})
            {view === 'audit' && <div className="absolute bottom-[-1px] left-0 right-0 h-[2px]" style={{ background: '#c84b9e' }} />}
          </button>
        </div>

        {view === 'audit' && (
          <ImageGenAuditView
            onLoadIntoBench={(action) => {
              setPrompt(action.promptTemplate)
              setView('bench')
            }}
          />
        )}

        {view === 'bench' && twinUrlIsEphemeral && (
          <div className="mb-6 p-4 rounded-xl flex gap-3 items-start" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
            <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-red-300 text-sm font-semibold mb-1">Twin URL is dead (Together AI ephemeral)</p>
              <p className="text-red-300/70 text-xs leading-relaxed">
                The twin selfie URL is <span className="font-mono">api.together.ai/shrt/...</span> — those expire after ~1 hour. FLUX/Kontext won't have a real reference, so identity match will fail.
                Fix: go to <span className="font-mono">/home</span> → click "Upload selfie" → upload a fresh photo. The new URL will be on Supabase storage and persist. Then come back here.
              </p>
            </div>
          </div>
        )}

        {view === 'bench' && (<>
        {/* Debug panel: lists every twin in the store + URL classification.
            Diagnoses "wrong twin is active" vs "active twin's URL is dead" instantly. */}
        {characters.length > 0 && (
          <div className="mb-6 p-4 rounded-xl" style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)' }}>
            <p className="text-white/60 text-[11px] uppercase tracking-widest mb-3">Debug — your twins</p>
            <div className="flex flex-col gap-2">
              {characters.map((c) => {
                const isActive = c.id === activeCharId
                const url = c.selfieUrl ?? ''
                const kind = !url
                  ? { label: 'NO SELFIE', color: '#6b7280' }
                  : isEphemeralLike(url)
                    ? { label: 'DEAD (Together AI)', color: '#ef4444' }
                    : url.startsWith('data:')
                      ? { label: 'DATA URL (durable)', color: '#f59e0b' }
                      : url.includes('supabase.co')
                        ? { label: 'SUPABASE (good)', color: '#10b981' }
                        : { label: 'OTHER', color: '#6b7280' }
                return (
                  <div key={c.id} className="flex items-center gap-3 text-xs">
                    {url && !isEphemeralLike(url) ? (
                      <img src={url} alt={c.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg shrink-0" style={{ background: '#1a1525' }} />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold">{c.name}</span>
                        {isActive && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: '#c84b9e', color: '#fff' }}>ACTIVE</span>}
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: kind.color + '22', color: kind.color }}>{kind.label}</span>
                      </div>
                      <p className="text-white/40 font-mono text-[10px] truncate">{url || '(none)'}</p>
                    </div>
                    {url && (
                      <button
                        onClick={() => setTwinUrl(url)}
                        className="cursor-pointer text-[10px] uppercase tracking-widest text-[#c84b9e] hover:text-[#e060b8] shrink-0"
                      >
                        Use
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm(`Delete twin "${c.name}"? This removes the twin and all its trips/stories. Cannot be undone.`)) {
                          deleteCharacter(c.id)
                        }
                      }}
                      className="cursor-pointer p-1 rounded text-red-400/60 hover:text-red-400 hover:bg-red-400/10 shrink-0"
                      title="Delete this twin"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )
              })}
            </div>
            <p className="text-white/30 text-[10px] mt-3 leading-relaxed">
              Tip: if all your twins show DEAD or NO SELFIE, delete them all and create a fresh one at <span className="font-mono text-white/50">/home</span>. The current upload flow stores selfies on Supabase storage and persists them across sessions.
            </p>
          </div>
        )}

        {/* Inputs */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-white/50 text-xs uppercase tracking-widest block">
                Twin selfie URL
                {activeChar?.name && <span className="text-white/30 normal-case ml-2">({activeChar.name})</span>}
              </label>
              {canResetToActive && (
                <button
                  onClick={() => setTwinUrl(liveTwinUrl)}
                  className="cursor-pointer text-[10px] uppercase tracking-widest text-[#c84b9e] hover:text-[#e060b8]"
                >
                  Use active twin
                </button>
              )}
            </div>
            <input
              type="text"
              value={twinUrl}
              onChange={(e) => setTwinUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-[#13101c] border border-[#2a2040] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c84b9e]"
            />
            {twinUrl && (
              <button
                type="button"
                onClick={() => setPreviewUrl(twinUrl)}
                className="mt-2 cursor-pointer hover:opacity-80 transition-opacity"
                title="Click to view full size"
              >
                <img src={twinUrl} alt="twin" className="w-20 h-20 rounded-lg object-cover" />
              </button>
            )}
          </div>
          <div>
            <label className="text-white/50 text-xs uppercase tracking-widest mb-1 block">Companion portrait URL</label>
            <div className="flex gap-2 mb-2">
              <select
                value={
                  TRAVEL_COMPANION_OPTIONS.find((o) => o.url === companionUrl)?.url ??
                  remixOptions.find((o) => o.url === companionUrl)?.url ??
                  '__custom__'
                }
                onChange={(e) => {
                  const v = e.target.value
                  if (v !== '__custom__') setCompanionUrl(v)
                }}
                className="flex-1 bg-[#13101c] border border-[#2a2040] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c84b9e] cursor-pointer"
                style={{ fontFamily: SG }}
              >
                <option value="__custom__">— pick a companion —</option>
                <optgroup label="Travel companions">
                  {TRAVEL_COMPANION_OPTIONS.map((o) => (
                    <option key={o.url} value={o.url}>{o.name}</option>
                  ))}
                </optgroup>
                {remixOptions.length > 0 && (
                  <optgroup label="Your remixes">
                    {remixOptions.map((o) => (
                      <option key={o.url} value={o.url}>{o.name}</option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
            {deadRemixNames.length > 0 && (
              <p className="text-amber-300/70 text-[11px] mb-2" style={{ fontFamily: SG }}>
                Hidden ({deadRemixNames.length}): {deadRemixNames.join(', ')} — photo URL expired. Re-upload in /travel.
              </p>
            )}
            <input
              type="text"
              value={companionUrl}
              onChange={(e) => setCompanionUrl(e.target.value)}
              placeholder="/yuna-portrait.png or https://..."
              className="w-full bg-[#13101c] border border-[#2a2040] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c84b9e]"
            />
            {companionUrlIsEphemeral && (
              <p className="text-red-400/80 text-[11px] mt-1" style={{ fontFamily: SG }}>
                Companion URL is dead (Together AI ephemeral). Re-upload the companion photo, then come back here.
              </p>
            )}
            {companionUrl && (
              <button
                type="button"
                onClick={() => setPreviewUrl(companionUrl)}
                className="mt-2 cursor-pointer hover:opacity-80 transition-opacity"
                title="Click to view full size"
              >
                <img
                  src={companionUrl}
                  alt="companion"
                  className="w-20 h-20 rounded-lg object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.3' }}
                />
              </button>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label className="text-white/50 text-xs uppercase tracking-widest mb-1 block">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="w-full bg-[#13101c] border border-[#2a2040] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c84b9e]"
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <button onClick={runAll} className="cursor-pointer px-4 py-2 rounded-lg bg-[#c84b9e] text-white text-sm font-semibold">
            Run all
          </button>
          <button onClick={runFlux2} className="cursor-pointer px-4 py-2 rounded-lg bg-[#1a1525] border border-[#2a2040] text-white/80 text-sm">
            FLUX.2 only
          </button>
          <button onClick={runKontext} className="cursor-pointer px-4 py-2 rounded-lg bg-[#1a1525] border border-[#2a2040] text-white/80 text-sm">
            Kontext only
          </button>
          <button onClick={runSchnell} className="cursor-pointer px-4 py-2 rounded-lg bg-[#1a1525] border border-[#2a2040] text-white/80 text-sm">
            Schnell only
          </button>
          <button onClick={() => runNano('nano-banana-2')} className="cursor-pointer px-4 py-2 rounded-lg bg-[#1a1525] border border-[#2a2040] text-white/80 text-sm">
            Nano Banana 2 only
          </button>
          <button onClick={() => runNano('nano-banana-pro')} className="cursor-pointer px-4 py-2 rounded-lg bg-[#1a1525] border border-[#2a2040] text-white/80 text-sm">
            Nano Banana Pro only
          </button>
          <button onClick={() => runNano('nano-banana')} className="cursor-pointer px-4 py-2 rounded-lg bg-[#1a1525] border border-[#2a2040] text-white/80 text-sm">
            Nano Banana only
          </button>
        </div>

        {/* Results grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(Object.keys(MODEL_LABELS) as ModelId[]).map((id) => {
            const r = results[id]
            const isRunning = running[id]
            const cost = MODEL_COST_USD[id]
            return (
              <div key={id} className="rounded-xl overflow-hidden border border-[#2a2040] bg-[#13101c]">
                <div className="aspect-[4/3] flex items-center justify-center bg-[#0a0810] overflow-hidden">
                  {isRunning ? (
                    <Loader2 size={28} className="animate-spin text-white/40" />
                  ) : r?.url ? (
                    <img src={r.url} alt={id} className="w-full h-full object-cover" />
                  ) : r?.error ? (
                    <div className="p-3 max-h-full overflow-y-auto w-full">
                      <p className="text-red-400/80 text-[11px] font-mono whitespace-pre-wrap break-words leading-relaxed">{r.error}</p>
                    </div>
                  ) : (
                    <ImageIcon size={28} className="text-white/15" />
                  )}
                </div>
                <div className="px-3 py-2 border-b border-[#2a2040]/50 flex items-center justify-between text-[11px]">
                  <span className="text-white/40">Latency</span>
                  <span className="text-white/80 font-mono">{r?.elapsedMs ? `${(r.elapsedMs / 1000).toFixed(1)}s` : '—'}</span>
                </div>
                <div className="px-3 py-2 border-b border-[#2a2040]/50 flex items-center justify-between text-[11px]">
                  <span className="text-white/40">Cost / image</span>
                  <span className="text-white/80 font-mono">${cost.toFixed(4)}</span>
                </div>
                <div className="px-3 py-2 border-b border-[#2a2040]/50 flex items-center justify-between text-[11px]">
                  <span className="text-white/40">@ 1k images</span>
                  <span className="text-white/80 font-mono">${(cost * 1000).toFixed(0)}</span>
                </div>
                <div className="px-3 py-2 flex items-center justify-between">
                  <p className="text-white/80 text-xs font-semibold">{MODEL_LABELS[id]}</p>
                  {r?.url && <span className="text-emerald-400/60 text-[10px]">OK</span>}
                  {r?.error && <span className="text-red-400/70 text-[10px]">ERR</span>}
                </div>
              </div>
            )
          })}
        </div>
        </>)}
      </div>

      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/85 cursor-zoom-out"
          onClick={() => setPreviewUrl(null)}
        >
          <img
            src={previewUrl}
            alt="full preview"
            className="max-w-full max-h-full rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setPreviewUrl(null)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white cursor-pointer"
            aria-label="Close preview"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}

/** Audit-tab view: a categorized list of every image-gen call site in the
 *  app. Each entry shows the trigger, source location, model used,
 *  reference requirements, and the prompt template. "Load into bench"
 *  drops the prompt into the bench page for testing across models. */
function ImageGenAuditView({ onLoadIntoBench }: { onLoadIntoBench: (action: ImageGenAction) => void }) {
  const grouped = IMAGE_GEN_AUDIT.reduce((acc, action) => {
    if (!acc[action.category]) acc[action.category] = []
    acc[action.category].push(action)
    return acc
  }, {} as Record<string, ImageGenAction[]>)

  const categoryOrder: ImageGenAction['category'][] = ['Twin', 'Travel', 'Story', 'Chat reaction', 'Cast']

  const refColors: Record<ImageGenAction['references'], string> = {
    'twin + companion': '#a78bfa',
    'twin only': '#60a5fa',
    'companion only': '#fbbf24',
    'none': '#6b7280',
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-white/50 text-sm leading-relaxed">
        Every place in the app that calls an image-generation model — what triggers it, which model tier runs in production, and the actual prompt template. Click "Load into bench" to drop a template into the bench tab and run it across all models.
      </div>

      {categoryOrder.map((cat) => {
        const items = grouped[cat]
        if (!items || items.length === 0) return null
        return (
          <div key={cat}>
            <h2 className="text-white/80 text-sm font-bold uppercase tracking-widest mb-3">{cat} ({items.length})</h2>
            <div className="flex flex-col gap-3">
              {items.map((action, i) => (
                <div
                  key={`${cat}-${i}`}
                  className="rounded-xl p-4"
                  style={{ background: '#13101c', border: '1px solid #2a2040' }}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white text-sm font-semibold mb-0.5">{action.feature}</h3>
                      <p className="text-white/40 text-xs">{action.trigger}</p>
                    </div>
                    <button
                      onClick={() => onLoadIntoBench(action)}
                      className="cursor-pointer text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-md text-[#c84b9e] hover:bg-[rgba(200,75,158,0.1)] shrink-0"
                      style={{ border: '1px solid rgba(200,75,158,0.3)' }}
                    >
                      Load into bench
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div>
                      <p className="text-white/30 text-[10px] uppercase tracking-widest mb-0.5">Model</p>
                      <p className="text-white/80 text-xs font-mono">{action.model}</p>
                    </div>
                    <div>
                      <p className="text-white/30 text-[10px] uppercase tracking-widest mb-0.5">References</p>
                      <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: refColors[action.references] + '22', color: refColors[action.references] }}>
                        {action.references}
                      </span>
                    </div>
                    <div>
                      <p className="text-white/30 text-[10px] uppercase tracking-widest mb-0.5">Source</p>
                      <p className="text-white/60 text-[11px] font-mono break-all">{action.source}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-white/30 text-[10px] uppercase tracking-widest mb-1">Prompt template</p>
                    <p className="text-white/70 text-xs leading-relaxed font-mono whitespace-pre-wrap" style={{ background: '#0a0810', padding: '8px 10px', borderRadius: 6, border: '1px solid #2a2040' }}>
                      {action.promptTemplate}
                    </p>
                  </div>

                  {action.notes && (
                    <p className="mt-2 text-white/40 text-[11px] leading-relaxed italic">
                      {action.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
