type Tone = 'success' | 'complete' | 'warning' | 'error'

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
