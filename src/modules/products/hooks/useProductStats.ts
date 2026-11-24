import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { productsService } from '@/modules/products/services/products.service'
import type { ProductStats, ProductStatusCounts } from '@/modules/products/types/products.types'

const EMPTY: ProductStats = { total: 0, active: 0, inventoryValue: 0, inventoryUnits: 0, low: 0, out: 0 }

export function useProductStats(categoryId: string) {
  const [stats, setStats] = useState<ProductStats | null>(null)
  const [scoped, setScoped] = useState<ProductStats | null>(null)
  const latest = useRef(0)

  const load = useCallback(() => {
    const id = ++latest.current
    const scope = categoryId === 'all' ? undefined : categoryId
    Promise.all([productsService.stats(), scope ? productsService.stats({ categoryId: scope }) : null])
      .then(([all, byCategory]) => {
        if (id !== latest.current) return
        setStats(all)
        setScoped(byCategory ?? all)
      })
      .catch(() => id === latest.current && setStats((s) => s ?? EMPTY))
  }, [categoryId])

  useEffect(load, [load])

  const counts = useMemo<ProductStatusCounts>(() => {
    const s = scoped ?? EMPTY
    return { all: s.total, active: s.active, inactive: Math.max(0, s.total - s.active) }
  }, [scoped])

  return { stats: stats ?? EMPTY, counts, loading: !stats, reload: load }
}
