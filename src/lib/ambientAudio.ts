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
  // Warm, cinematic — for story beats and narrative prose
  story: {
    freqs: [110, 164.81, 220, 329.63],  // A2, E3, A3, E4
    detune: [0, -3, 5, -2],
    volume: 0.06,
    filterFreq: 800,
  },
  // Intimate, quieter — for chat conversations
  chat: {
    freqs: [130.81, 196, 261.63],  // C3, G3, C4
    detune: [0, -5, 3],
    volume: 0.035,
    filterFreq: 600,
  },
  // Tension/anticipation — for choice points
  choice: {
    freqs: [146.83, 185, 220, 277.18],  // D3, F#3, A3, C#4
    detune: [-2, 4, 0, -3],
    volume: 0.05,
    filterFreq: 700,
  },
  // Ethereal, expansive — for the reveal
  reveal: {
    freqs: [130.81, 196, 261.63, 392],  // C3, G3, C4, G4
    detune: [0, -2, 3, -1],
    volume: 0.055,
    filterFreq: 1200,
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
    filter.Q.value = 0.7
    filter.connect(this.state.masterGain!)

    for (let i = 0; i < config.freqs.length; i++) {
      // Main oscillator — sine for warmth
      const osc = ctx.createOscillator()
      osc.type = i === 0 ? 'sine' : 'triangle'
      osc.frequency.value = config.freqs[i]
      osc.detune.value = config.detune[i] ?? 0

      // Individual gain for this voice
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(config.volume / config.freqs.length, now + fadeTime)

      // Slow LFO for gentle movement
      const lfo = ctx.createOscillator()
      const lfoGain = ctx.createGain()
      lfo.frequency.value = 0.1 + (i * 0.05) // slightly different rates
      lfoGain.gain.value = 2 + (i * 0.5) // subtle detune wobble
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
