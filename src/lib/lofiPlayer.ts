const STORAGE_KEY = 'chaptr-lofi-playing'
const VOLUME = 0.35
const FADE_MS = 1500

class LofiPlayer {
  private audio: HTMLAudioElement | null = null
  private _playing: boolean
  private fadeInterval: ReturnType<typeof setInterval> | null = null

  constructor() {
    this._playing = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) !== 'false' : true
  }

  get isPlaying(): boolean {
    return this._playing
  }

  private ensureAudio(): HTMLAudioElement {
    if (!this.audio) {
      this.audio = new Audio('/audio/lofi-japan.mp3')
      this.audio.loop = true
      this.audio.volume = 0
      this.audio.preload = 'none'
    }
    return this.audio
  }

  play(): void {
    if (!this._playing) return
    const audio = this.ensureAudio()
    audio.play().then(() => this.fadeTo(VOLUME)).catch(() => {})
  }

  private fadeTo(target: number): void {
    if (this.fadeInterval) clearInterval(this.fadeInterval)
    const audio = this.ensureAudio()
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

  toggle(): boolean {
    this._playing = !this._playing
    localStorage.setItem(STORAGE_KEY, String(this._playing))
    if (!this._playing) {
      this.fadeTo(0)
    } else {
      const audio = this.ensureAudio()
      audio.play().then(() => this.fadeTo(VOLUME)).catch(() => {})
    }
    return this._playing
  }

  stop(): void {
    if (this.audio) {
      this.fadeTo(0)
    }
  }
}

export const lofiPlayer = new LofiPlayer()
