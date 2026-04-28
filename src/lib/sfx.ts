const cache = new Map<string, AudioBuffer>()
let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  return ctx
}

async function load(src: string): Promise<AudioBuffer> {
  const cached = cache.get(src)
  if (cached) return cached
  const res = await fetch(src)
  const buf = await getCtx().decodeAudioData(await res.arrayBuffer())
  cache.set(src, buf)
  return buf
}

export async function playSfx(src: string, volume = 0.5) {
  try {
    const c = getCtx()
    if (c.state === 'suspended') await c.resume()
    const buf = await load(src)
    const source = c.createBufferSource()
    const gain = c.createGain()
    gain.gain.value = volume
    source.buffer = buf
    source.connect(gain).connect(c.destination)
    source.start()
  } catch {
    // silent fail — sfx are non-critical
  }
}
