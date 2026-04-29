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
// rough cost-at-scale comparison, not billing.
const MODEL_COST_USD: Record<ModelId, number> = {
  'flux2': 0.04,
  'kontext': 0.03,
  'schnell': 0.0027,
  'nano-banana-2': 0.039,
  'nano-banana-pro': 0.039,
  'nano-banana': 0.039,
}

const NANO_MODEL_IDS: Partial<Record<ModelId, string>> = {
  'nano-banana-2': 'gemini-3.1-flash-image-preview',
  'nano-banana-pro': 'gemini-3-pro-image-preview',
  'nano-banana': 'gemini-2.5-flash-image',
}

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

        {twinUrlIsEphemeral && (
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
