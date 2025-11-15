class SoundManager {
  private audioContext: AudioContext | null = null
  private enabled = true

  constructor() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    } catch (e) {
      console.warn('Web Audio API not supported')
    }
  }

  private createTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
    if (!this.audioContext || !this.enabled) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime)
    oscillator.type = type

    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)

    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + duration)
  }

  success() {
    this.createTone(800, 0.2)
    setTimeout(() => this.createTone(1000, 0.2), 100)
  }

  click() {
    this.createTone(600, 0.1, 'square')
  }

  error() {
    this.createTone(300, 0.3, 'sawtooth')
  }

  notification() {
    this.createTone(700, 0.15)
  }

  toggle(enabled: boolean) {
    this.enabled = enabled
  }
}

export const soundManager = new SoundManager()