import camOnQuyKhachAudio from '@/assets/audio/CamOnQuyKhach.mp3'
import daNhanThanhToanAudio from '@/assets/audio/DaNhanThanhToan.mp3'

type Tone = 'success' | 'complete' | 'warning' | 'error'
type VoiceClip = 'thankYou' | 'paymentReceived'

const VOICE_CLIPS: Record<VoiceClip, string> = {
  thankYou: camOnQuyKhachAudio,
  paymentReceived: daNhanThanhToanAudio,
}

const PATTERNS: Record<Tone, { freq: number; duration: number; gap?: number }[]> = {
  success: [{ freq: 1320, duration: 0.07 }],
  complete: [
    { freq: 1046, duration: 0.08, gap: 0.03 },
    { freq: 1568, duration: 0.12 },
  ],
  warning: [
    { freq: 740, duration: 0.09, gap: 0.06 },
    { freq: 740, duration: 0.09 },
  ],
  error: [{ freq: 220, duration: 0.28 }],
}

let ctx: AudioContext | null = null

export const playTone = (tone: Tone) => {
  try {
    ctx ??= new AudioContext()
    let t = ctx.currentTime
    for (const { freq, duration, gap = 0 } of PATTERNS[tone]) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = tone === 'error' ? 'square' : 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.exponentialRampToValueAtTime(0.18, t + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration)
      osc.connect(gain).connect(ctx.destination)
      osc.start(t)
      osc.stop(t + duration + 0.02)
      t += duration + gap
    }
  } catch {
    return
  }
}

let activeAudio: HTMLAudioElement | null = null

export const playVoice = (clip: VoiceClip) => {
  try {
    if (activeAudio) {
      activeAudio.pause()
      activeAudio.currentTime = 0
    }
    const audio = new Audio(VOICE_CLIPS[clip])
    activeAudio = audio
    void audio.play().catch(() => {})
  } catch {
    return
  }
}
