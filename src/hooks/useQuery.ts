import { useCallback, useEffect, useRef, useState } from 'react'
import { errorMessage } from '@/lib/http'

export function useQuery<T, P>(fetcher: (params: P) => Promise<T>, params: P, options: { enabled?: boolean; errorText?: string } = {}) {
  const { enabled = true, errorText = 'Không tải được dữ liệu' } = options
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState<string>()
  const latest = useRef(0)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher
  const key = JSON.stringify(params)

  const load = useCallback(() => {
    const id = ++latest.current
    setLoading(true)
    fetcherRef
      .current(JSON.parse(key) as P)
      .then((res) => {
        if (id !== latest.current) return
        setData(res)
        setError(undefined)
      })
      .catch((e: unknown) => id === latest.current && setError(errorMessage(e, errorText)))
      .finally(() => id === latest.current && setLoading(false))
  }, [key, errorText])

  useEffect(() => {
    if (enabled) load()
    else latest.current++
  }, [enabled, load])

  return { data, setData, loading, initialLoading: loading && data === null, error, reload: load }
}
