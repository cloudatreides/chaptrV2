/**
 * Ambient audio generator using Web Audio API.
 * Creates gentle, evolving ambient pads — no audio files needed.
 * Each mood has different harmonic character and texture.
 */

type AmbientMood = 'story' | 'chat' | 'choice' | 'reveal' | 'silent'

interface AmbientState {
  ctx: AudioContext | null
  masterGain: GainNode | null
  activeSources: OscillatorNode[]
  activeGains: GainNode[]
  currentMood: AmbientMood
  isMuted: boolean
  isPlaying: boolean
}

const MOOD_CONFIGS: Record<AmbientMood, { freqs: number[]; detune: number[]; volume: number; filterFreq: number }> = {
  // Warm lofi pad — Cmaj7 voicing, muffled and gentle
  story: {
    freqs: [65.41, 130.81, 164.81, 196],  // C2, C3, E3, G3
    detune: [0, -1, 2, -1],
    volume: 0.045,
    filterFreq: 500,
  },
  // Soft intimate lofi — Fmaj9, barely there
  chat: {
    freqs: [87.31, 130.81, 174.61, 196],  // F2, C3, F3, G3
    detune: [0, -1, 1, 0],
    volume: 0.03,
    filterFreq: 400,
  },
  // Gentle anticipation — Am7, warm not tense
  choice: {
    freqs: [110, 130.81, 164.81, 196],  // A2, C3, E3, G3
    detune: [0, 1, -1, 0],
    volume: 0.04,
    filterFreq: 450,
  },
  // Dreamy, open — Cmaj9, slightly brighter
  reveal: {
    freqs: [65.41, 130.81, 164.81, 293.66],  // C2, C3, E3, D4
    detune: [0, -1, 1, -1],
    volume: 0.04,
    filterFreq: 600,
  },
  silent: {
    freqs: [],
    detune: [],
    volume: 0,
    filterFreq: 0,
  },
}

const MUTE_KEY = 'chaptr-audio-muted'

class AmbientAudioManager {
  private state: AmbientState = {
    ctx: null,
    masterGain: null,
    activeSources: [],
    activeGains: [],
    currentMood: 'silent',
    isMuted: typeof localStorage !== 'undefined' ? localStorage.getItem(MUTE_KEY) === 'true' : false,
    isPlaying: false,
  }

  private lfoNodes: OscillatorNode[] = []

  get isMuted(): boolean {
    return this.state.isMuted
  }

  get currentMood(): AmbientMood {
    return this.state.currentMood
  }

  private ensureContext(): AudioContext {
    if (!this.state.ctx || this.state.ctx.state === 'closed') {
      this.state.ctx = new AudioContext()
      this.state.masterGain = this.state.ctx.createGain()
      this.state.masterGain.gain.value = this.state.isMuted ? 0 : 1
      this.state.masterGain.connect(this.state.ctx.destination)
    }
    if (this.state.ctx.state === 'suspended') {
      this.state.ctx.resume()
    }
    return this.state.ctx
  }

  private unlocked = false

  /** Must be called from a user gesture (click/tap) to unlock audio */
  unlock(): void {
    this.ensureContext()
    if (!this.unlocked) {
      this.unlocked = true
      // If a mood was queued before unlock, start it now
      if (this.state.currentMood !== 'silent' && !this.state.isMuted) {
        const mood = this.state.currentMood
        this.state.currentMood = 'silent' // reset so crossfadeTo doesn't skip
        this.crossfadeTo(mood)
      }
    }
  }

  setMood(mood: AmbientMood): void {
    if (mood === this.state.currentMood) return
    // Before user gesture, just record the mood — don't create audio nodes
    if (!this.unlocked) {
      this.state.currentMood = mood
      return
    }
    this.crossfadeTo(mood)
  }

  toggleMute(): boolean {
    this.state.isMuted = !this.state.isMuted
    localStorage.setItem(MUTE_KEY, String(this.state.isMuted))

    if (this.state.masterGain && this.state.ctx) {
      const now = this.state.ctx.currentTime
      this.state.masterGain.gain.cancelScheduledValues(now)
      this.state.masterGain.gain.setValueAtTime(this.state.masterGain.gain.value, now)
      this.state.masterGain.gain.linearRampToValueAtTime(
        this.state.isMuted ? 0 : 1,
        now + 0.3,
      )
    }

    return this.state.isMuted
  }

  private crossfadeTo(mood: AmbientMood): void {
    const ctx = this.ensureContext()
    const config = MOOD_CONFIGS[mood]
    const now = ctx.currentTime
    const fadeTime = 2 // seconds for crossfade

    // Fade out existing sources
    for (const gain of this.state.activeGains) {
      gain.gain.cancelScheduledValues(now)
      gain.gain.setValueAtTime(gain.gain.value, now)
      gain.gain.linearRampToValueAtTime(0, now + fadeTime)
    }

    // Stop old sources after fade
    const oldSources = [...this.state.activeSources]
    const oldGains = [...this.state.activeGains]
    const oldLfos = [...this.lfoNodes]
    setTimeout(() => {
      for (const src of oldSources) { try { src.stop() } catch { /* already stopped */ } }
      for (const lfo of oldLfos) { try { lfo.stop() } catch { /* already stopped */ } }
      for (const g of oldGains) { try { g.disconnect() } catch { /* ok */ } }
    }, fadeTime * 1000 + 200)

    this.state.currentMood = mood

    if (mood === 'silent' || config.freqs.length === 0) {
      this.state.activeSources = []
      this.state.activeGains = []
      this.lfoNodes = []
      return
    }

    // Create new ambient pad
    const newSources: OscillatorNode[] = []
    const newGains: GainNode[] = []
    const newLfos: OscillatorNode[] = []

    // Low-pass filter for warmth
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = config.filterFreq
    filter.Q.value = 0.5
    filter.connect(this.state.masterGain!)

    for (let i = 0; i < config.freqs.length; i++) {
      // All sine waves for maximum warmth
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = config.freqs[i]
      osc.detune.value = config.detune[i] ?? 0

      // Individual gain for this voice
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(config.volume / config.freqs.length, now + fadeTime)

      // Very slow LFO for barely perceptible movement
      const lfo = ctx.createOscillator()
      const lfoGain = ctx.createGain()
      lfo.frequency.value = 0.04 + (i * 0.02) // very slow drift
      lfoGain.gain.value = 0.8 + (i * 0.2) // minimal wobble
      lfo.connect(lfoGain)
      lfoGain.connect(osc.detune)

      osc.connect(gain)
      gain.connect(filter)

      osc.start(now)
      lfo.start(now)

      newSources.push(osc)
      newGains.push(gain)
      newLfos.push(lfo)
    }

    this.state.activeSources = newSources
    this.state.activeGains = newGains
    this.lfoNodes = newLfos
    this.state.isPlaying = true
  }

  /** Short synthesized SFX — no audio files needed */
  playSfx(type: 'beat-tick' | 'whoosh' | 'arrival-chime'): void {
    if (this.state.isMuted) return
    const ctx = this.ensureContext()
    const now = ctx.currentTime

    if (type === 'beat-tick') {
      // Soft UI tick — two quick sine pings
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, now)
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.08)
      gain.gain.setValueAtTime(0.12, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
      osc.connect(gain)
      gain.connect(this.state.masterGain!)
      osc.start(now)
      osc.stop(now + 0.15)
    }

    if (type === 'whoosh') {
      // Filtered noise sweep — like air rushing past
      const bufferSize = ctx.sampleRate * 0.6
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1
      const noise = ctx.createBufferSource()
      noise.buffer = buffer
      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.setValueAtTime(300, now)
      filter.frequency.exponentialRampToValueAtTime(2000, now + 0.25)
      filter.frequency.exponentialRampToValueAtTime(400, now + 0.5)
      filter.Q.value = 1.5
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(0.08, now + 0.1)
      gain.gain.linearRampToValueAtTime(0, now + 0.55)
      noise.connect(filter)
      filter.connect(gain)
      gain.connect(this.state.masterGain!)
      noise.start(now)
      noise.stop(now + 0.6)
    }

    if (type === 'arrival-chime') {
      // Two-note ascending chime — warm and resolved
      const notes = [523.25, 783.99] // C5 → G5
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.value = freq
        const start = now + i * 0.15
        gain.gain.setValueAtTime(0, start)
        gain.gain.linearRampToValueAtTime(0.1, start + 0.03)
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.6)
        osc.connect(gain)
        gain.connect(this.state.masterGain!)
        osc.start(start)
        osc.stop(start + 0.6)
      })
    }
  }

  stop(): void {
    this.crossfadeTo('silent')
    this.state.isPlaying = false
  }

  destroy(): void {
    this.stop()
    if (this.state.ctx) {
      this.state.ctx.close()
      this.state.ctx = null
    }
  }
}

// Singleton
export const ambientAudio = new AmbientAudioManager()
export type { AmbientMood }
