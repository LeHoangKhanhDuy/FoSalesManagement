import { useCallback, useEffect, useState } from 'react'

export function useCountdown() {
  const [until, setUntil] = useState(0)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!until) return
    const timer = setInterval(() => {
      const current = Date.now()
      setNow(current)
      if (current >= until) setUntil(0)
    }, 500)
    return () => clearInterval(timer)
  }, [until])

  const start = useCallback((seconds: number) => {
    const current = Date.now()
    setNow(current)
    setUntil(seconds > 0 ? current + seconds * 1000 : 0)
  }, [])

  const stop = useCallback(() => setUntil(0), [])

  return { left: until ? Math.max(0, Math.ceil((until - now) / 1000)) : 0, start, stop }
}
