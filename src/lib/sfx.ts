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

let spaceNodes: OscillatorNode[] = []
let spaceGain: GainNode | null = null

export function startWind(volume = 0.08, fadeMs = 1500) {
  try {
    const c = getCtx()
    if (c.state === 'suspended') c.resume()
    if (spaceNodes.length) return

    // Airy high-pad ambient. Earlier version sat at 55–165Hz with a 300Hz
    // lowpass — it read as "heavy" sub-bass drone. Lifted up to 330Hz–880Hz
    // (mostly triangle waves) with a 1.5kHz lowpass so some shimmer cuts
    // through. Master gain dropped to ~half so it sits as background air.
    const gain = c.createGain()
    gain.gain.setValueAtTime(0, c.currentTime)
    gain.gain.linearRampToValueAtTime(volume * 0.5, c.currentTime + fadeMs / 1000)
    gain.connect(c.destination)

    const tones = [
      { freq: 330, type: 'triangle' as OscillatorType, vol: 0.18 },
      { freq: 440, type: 'sine' as OscillatorType, vol: 0.14 },
      { freq: 660, type: 'triangle' as OscillatorType, vol: 0.08 },
      { freq: 880, type: 'sine' as OscillatorType, vol: 0.04 },
    ]

    for (const t of tones) {
      const osc = c.createOscillator()
      osc.type = t.type
      osc.frequency.value = t.freq

      const lfo = c.createOscillator()
      lfo.type = 'sine'
      lfo.frequency.value = 0.07 + Math.random() * 0.12
      const lfoGain = c.createGain()
      lfoGain.gain.value = t.freq * 0.004
      lfo.connect(lfoGain).connect(osc.frequency)
      lfo.start()

      const oscGain = c.createGain()
      oscGain.gain.value = t.vol

      const lp = c.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = 1500
      lp.Q.value = 0.5

      osc.connect(oscGain).connect(lp).connect(gain)
      osc.start()

      spaceNodes.push(osc, lfo)
    }

    spaceGain = gain
  } catch {
    // silent fail
  }
}

export function stopWind(fadeMs = 1200) {
  try {
    if (!spaceGain || !spaceNodes.length) return
    const c = getCtx()
    spaceGain.gain.linearRampToValueAtTime(0, c.currentTime + fadeMs / 1000)
    const nodes = [...spaceNodes]
    setTimeout(() => { nodes.forEach(n => { try { n.stop() } catch {} }) }, fadeMs + 100)
    spaceNodes = []
    spaceGain = null
  } catch {
    // silent fail
  }
}
