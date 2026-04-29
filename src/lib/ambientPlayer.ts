const STORAGE_KEY = 'chaptr-ambient-playing'
const TRACK_INDEX_KEY = 'chaptr-ambient-track-index'
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

const VIBE_TRACKS: Record<Vibe, string[]> = {
  'asian-metro': ['/audio/ambient/asian-metro.mp3'],
  'western-metro': ['/audio/ambient/western-metro.mp3'],
  'european-old-city': ['/audio/ambient/european-old-city.mp3'],
  'latin': ['/audio/ambient/latin.mp3'],
  'desert-exotic': ['/audio/ambient/desert-exotic.mp3'],
  'nordic': ['/audio/ambient/nordic.mp3'],
}

const FALLBACK_TRACKS = [
  '/audio/ambient/lofi-1.mp3',
  '/audio/ambient/lofi-2.mp3',
  '/audio/ambient/lofi-3.mp3',
  '/audio/ambient/lofi-4.mp3',
  '/audio/ambient/lofi-5.mp3',
  '/audio/ambient/lofi-6.mp3',
  '/audio/ambient/lofi-7.mp3',
]

class AmbientPlayer {
  private audio: HTMLAudioElement | null = null
  private currentTracks: string[] = FALLBACK_TRACKS
  private trackIndex = 0
  private _enabled: boolean
  private fadeInterval: ReturnType<typeof setInterval> | null = null

  constructor() {
    this._enabled = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) !== 'false' : true
    const stored = typeof localStorage !== 'undefined' ? parseInt(localStorage.getItem(TRACK_INDEX_KEY) ?? '0', 10) : 0
    this.trackIndex = Number.isFinite(stored) ? stored : 0
  }

  get isEnabled(): boolean {
    return this._enabled
  }

  get trackCount(): number {
    return this.currentTracks.length
  }

  private getTracksForDestination(destinationId: string): string[] {
    const vibe = DESTINATION_VIBES[destinationId]
    if (!vibe) return FALLBACK_TRACKS
    return VIBE_TRACKS[vibe] ?? FALLBACK_TRACKS
  }

  private currentSrc(): string {
    const idx = ((this.trackIndex % this.currentTracks.length) + this.currentTracks.length) % this.currentTracks.length
    return this.currentTracks[idx]
  }

  private buildAudio(src: string): HTMLAudioElement {
    const audio = new Audio(src)
    audio.loop = true
    audio.volume = 0
    audio.preload = 'auto'
    audio.addEventListener('error', () => {
      // Per-vibe file missing → swap entire track list to fallback so prev/next cycles through it
      if (this.currentTracks === FALLBACK_TRACKS) return
      this.currentTracks = FALLBACK_TRACKS
      this.trackIndex = 0
      this.persistIndex()
      this.loadAndPlay()
    }, { once: true })
    return audio
  }

  private loadAndPlay(): void {
    if (this.audio) {
      this.audio.pause()
      this.audio.src = ''
    }
    this.audio = this.buildAudio(this.currentSrc())
    if (this._enabled) {
      this.audio.play().then(() => this.fadeTo(VOLUME)).catch(() => {})
    }
  }

  play(destinationId: string): void {
    const tracks = this.getTracksForDestination(destinationId)
    const tracksChanged = tracks.join('|') !== this.currentTracks.join('|')
    if (tracksChanged) {
      this.currentTracks = tracks
      this.trackIndex = 0
      this.persistIndex()
    }
    if (!this._enabled) return
    if (!this.audio || this.audio.src === '' || tracksChanged) {
      this.loadAndPlay()
    } else {
      this.audio.play().then(() => this.fadeTo(VOLUME)).catch(() => {})
    }
  }

  next(): void {
    if (this.currentTracks.length <= 1) {
      // Single track → restart from 0
      if (this.audio) {
        this.audio.currentTime = 0
        if (this._enabled) this.audio.play().then(() => this.fadeTo(VOLUME)).catch(() => {})
      }
      return
    }
    this.trackIndex = (this.trackIndex + 1) % this.currentTracks.length
    this.persistIndex()
    this.loadAndPlay()
  }

  prev(): void {
    // Mirror typical media players: if more than 3s in, restart current; otherwise go back a track
    if (this.audio && this.audio.currentTime > 3) {
      this.audio.currentTime = 0
      return
    }
    if (this.currentTracks.length <= 1) {
      if (this.audio) {
        this.audio.currentTime = 0
        if (this._enabled) this.audio.play().then(() => this.fadeTo(VOLUME)).catch(() => {})
      }
      return
    }
    this.trackIndex = (this.trackIndex - 1 + this.currentTracks.length) % this.currentTracks.length
    this.persistIndex()
    this.loadAndPlay()
  }

  private persistIndex(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(TRACK_INDEX_KEY, String(this.trackIndex))
    }
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
