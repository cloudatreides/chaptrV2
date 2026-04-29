import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Loader2, Image as ImageIcon } from 'lucide-react'
import { useStore } from '../store/useStore'
import { generateSceneImage } from '../lib/togetherAi'
import { generateNanoBananaImage } from '../lib/nanoBanana'
import { getTravelCompanion } from '../data/travel/companions'

const SG = "'Space Grotesk', sans-serif"

const DEFAULT_PROMPT = `Anime illustration, two people in the foreground, posing for a photo together at an airport gate: a young man on the left and a young woman on the right, both smiling at the camera, both wearing backpacks, excited to travel to Bangkok. Behind them, large terminal windows show a plane on the tarmac in warm golden hour light. No text, no signs, no departure boards`

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
  const activeChar = characters.find((c) => c.id === activeCharId) ?? characters[0]

  const [twinUrl, setTwinUrl] = useState(activeChar?.selfieUrl ?? '')
  const [companionUrl, setCompanionUrl] = useState(getTravelCompanion('yuna')?.character.staticPortrait ?? '')
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT)
  const [results, setResults] = useState<Record<ModelId, Result>>({} as Record<ModelId, Result>)
  const [running, setRunning] = useState<Record<ModelId, boolean>>({} as Record<ModelId, boolean>)

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
    const refs = [twinUrl, companionUrl].filter(Boolean)
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

        <h1 className="text-white text-3xl font-bold mb-1">Image bench</h1>
        <p className="text-white/40 text-sm mb-6">
          Same prompt, same references, every available model. Compare identity match, style, and latency.
        </p>

        {/* Inputs */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-white/50 text-xs uppercase tracking-widest mb-1 block">Twin selfie URL</label>
            <input
              type="text"
              value={twinUrl}
              onChange={(e) => setTwinUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-[#13101c] border border-[#2a2040] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c84b9e]"
            />
            {twinUrl && (
              <img src={twinUrl} alt="twin" className="mt-2 w-20 h-20 rounded-lg object-cover" />
            )}
          </div>
          <div>
            <label className="text-white/50 text-xs uppercase tracking-widest mb-1 block">Companion portrait URL</label>
            <input
              type="text"
              value={companionUrl}
              onChange={(e) => setCompanionUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-[#13101c] border border-[#2a2040] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c84b9e]"
            />
            {companionUrl && (
              <img src={companionUrl} alt="companion" className="mt-2 w-20 h-20 rounded-lg object-cover" />
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
    </div>
  )
}
