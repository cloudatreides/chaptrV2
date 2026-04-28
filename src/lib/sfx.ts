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

let windNode: AudioBufferSourceNode | null = null
let windGain: GainNode | null = null

export function startWind(volume = 0.04, fadeMs = 1500) {
  try {
    const c = getCtx()
    if (c.state === 'suspended') c.resume()
    if (windNode) return

    const sampleRate = c.sampleRate
    const duration = 4
    const len = sampleRate * duration
    const buf = c.createBuffer(1, len, sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5
    }

    const source = c.createBufferSource()
    source.buffer = buf
    source.loop = true

    const lp = c.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 400
    lp.Q.value = 0.5

    const hp = c.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 80

    const gain = c.createGain()
    gain.gain.setValueAtTime(0, c.currentTime)
    gain.gain.linearRampToValueAtTime(volume, c.currentTime + fadeMs / 1000)

    source.connect(lp).connect(hp).connect(gain).connect(c.destination)
    source.start()

    windNode = source
    windGain = gain
  } catch {
    // silent fail
  }
}

export function stopWind(fadeMs = 1200) {
  try {
    if (!windGain || !windNode) return
    const c = getCtx()
    windGain.gain.linearRampToValueAtTime(0, c.currentTime + fadeMs / 1000)
    const node = windNode
    setTimeout(() => { try { node.stop() } catch {} }, fadeMs + 100)
    windNode = null
    windGain = null
  } catch {
    // silent fail
  }
}
