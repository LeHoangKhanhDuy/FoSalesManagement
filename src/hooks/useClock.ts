import { useEffect, useState } from 'react'

/** Trả về thời gian hiện tại, cập nhật mỗi `interval` ms */
export function useClock(interval = 1000) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), interval)
    return () => clearInterval(id)
  }, [interval])
  return now
}
