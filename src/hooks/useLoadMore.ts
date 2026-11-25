import { useCallback, useEffect, useRef, useState } from 'react'
import { errorMessage } from '@/lib/http'
import type { Paginated } from '@/types/common'

export function useLoadMore<T>(fetchPage: (page: number) => Promise<Paginated<T>>, key: string, options: { enabled?: boolean; errorText?: string } = {}) {
  const { enabled = true, errorText = 'Không tải được dữ liệu' } = options
  const [items, setItems] = useState<T[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()
  const latest = useRef(0)
  const fetchRef = useRef(fetchPage)
  fetchRef.current = fetchPage

  const load = useCallback(
    (next: number) => {
      const id = ++latest.current
      setLoading(true)
      fetchRef
        .current(next)
        .then((res) => {
          if (id !== latest.current) return
          setItems((list) => (next === 1 ? res.items : [...list, ...res.items]))
          setTotal(res.total)
          setPage(next)
          setError(undefined)
        })
        .catch((e: unknown) => id === latest.current && setError(errorMessage(e, errorText)))
        .finally(() => id === latest.current && setLoading(false))
    },
    [errorText],
  )

  useEffect(() => {
    if (enabled) load(1)
    else latest.current++
  }, [enabled, key, load])

  return {
    items,
    total,
    loading,
    error,
    hasMore: items.length < total,
    loadMore: useCallback(() => load(page + 1), [load, page]),
    reload: useCallback(() => load(1), [load]),
  }
}
