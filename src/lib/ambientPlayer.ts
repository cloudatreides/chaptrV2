const STORAGE_KEY = 'chaptr-ambient-playing'
const VOLUME = 0.35
const FADE_MS = 1500

type Vibe = 'asian-metro' | 'western-metro' | 'european-old-city' | 'latin' | 'desert-exotic' | 'nordic'

const DESTINATION_VIBES: Record<string, Vibe> = {
  tokyo: 'asian-metro',
  seoul: 'asian-metro',
  bangkok: 'asian-metro',
  taipei: 'asian-metro',
  kyoto: 'asian-metro',
  hanoi: 'asian-metro',
  'chiang-mai': 'asian-metro',
  'luang-prabang': 'asian-metro',
  'new-york': 'western-metro',
  london: 'western-metro',
  sydney: 'western-metro',
  paris: 'european-old-city',
  lisbon: 'european-old-city',
  istanbul: 'european-old-city',
  dubrovnik: 'european-old-city',
  porto: 'european-old-city',
  valletta: 'european-old-city',
  tbilisi: 'european-old-city',
  reykjavik: 'nordic',
  'mexico-city': 'latin',
  'buenos-aires': 'latin',
  medellin: 'latin',
  cartagena: 'latin',
  oaxaca: 'latin',
  marrakech: 'desert-exotic',
  'cape-town': 'desert-exotic',
  cairo: 'desert-exotic',
  zanzibar: 'desert-exotic',
  jaipur: 'desert-exotic',
}

const VIBE_FILES: Record<Vibe, string> = {
  'asian-metro': '/audio/ambient/asian-metro.mp3',
  'western-metro': '/audio/ambient/western-metro.mp3',
  'european-old-city': '/audio/ambient/european-old-city.mp3',
  'latin': '/audio/ambient/latin.mp3',
  'desert-exotic': '/audio/ambient/desert-exotic.mp3',
  'nordic': '/audio/ambient/nordic.mp3',
}

const FALLBACK_SRC = '/audio/lofi-japan.mp3'

class AmbientPlayer {
  private audio: HTMLAudioElement | null = null
  private currentSrc: string | null = null
  private _enabled: boolean
  private fadeInterval: ReturnType<typeof setInterval> | null = null

  constructor() {
    this._enabled = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) !== 'false' : true
  }

  get isEnabled(): boolean {
    return this._enabled
  }

  private getSrcForDestination(destinationId: string): string {
    const vibe = DESTINATION_VIBES[destinationId] ?? 'european-old-city'
    return VIBE_FILES[vibe]
  }

  private buildAudio(src: string): HTMLAudioElement {
    const audio = new Audio(src)
    audio.loop = true
    audio.volume = 0
    audio.preload = 'auto'
    // Fall back to the legacy lofi file if the per-vibe file is missing
    audio.addEventListener('error', () => {
      if (audio.src.includes(FALLBACK_SRC)) return
      audio.src = FALLBACK_SRC
      audio.load()
      if (this._enabled) audio.play().then(() => this.fadeTo(VOLUME)).catch(() => {})
    }, { once: true })
    return audio
  }

  play(destinationId: string): void {
    if (!this._enabled) return
    const src = this.getSrcForDestination(destinationId)
    if (!this.audio || this.currentSrc !== src) {
      if (this.audio) {
        this.audio.pause()
        this.audio.src = ''
      }
      this.audio = this.buildAudio(src)
      this.currentSrc = src
    }
    this.audio.play().then(() => this.fadeTo(VOLUME)).catch(() => {})
  }

  private fadeTo(target: number): void {
    if (!this.audio) return
    if (this.fadeInterval) clearInterval(this.fadeInterval)
    const audio = this.audio
    const steps = FADE_MS / 50
    const delta = (target - audio.volume) / steps
    let step = 0
    this.fadeInterval = setInterval(() => {
      step++
      audio.volume = Math.max(0, Math.min(1, audio.volume + delta))
      if (step >= steps) {
        audio.volume = target
        if (this.fadeInterval) clearInterval(this.fadeInterval)
        this.fadeInterval = null
        if (target === 0) audio.pause()
      }
    }, 50)
  }

  toggle(destinationId: string): boolean {
    this._enabled = !this._enabled
    localStorage.setItem(STORAGE_KEY, String(this._enabled))
    if (!this._enabled) {
      this.fadeTo(0)
    } else {
      this.play(destinationId)
    }
    return this._enabled
  }

  stop(): void {
    if (this.audio) {
      this.fadeTo(0)
    }
  }
}

export const ambientPlayer = new AmbientPlayer()
