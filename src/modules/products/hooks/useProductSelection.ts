import { useCallback, useMemo, useState } from 'react'
import type { Product } from '@/modules/sales/types/sales.types'

export function useProductSelection(pageItems: Product[]) {
  const [selected, setSelected] = useState<Map<string, Product>>(() => new Map())

  const update = useCallback((mutate: (next: Map<string, Product>) => void) => {
    setSelected((prev) => {
      const next = new Map(prev)
      mutate(next)
      return next
    })
  }, [])

  const toggle = useCallback(
    (id: string) =>
      update((next) => {
        const product = pageItems.find((p) => p.id === id)
        if (next.has(id)) next.delete(id)
        else if (product) next.set(id, product)
      }),
    [pageItems, update],
  )

  const togglePage = useCallback((checked: boolean) => update((next) => pageItems.forEach((p) => (checked ? next.set(p.id, p) : next.delete(p.id)))), [pageItems, update])

  const remove = useCallback((ids: string[]) => update((next) => ids.forEach((id) => next.delete(id))), [update])

  const sync = useCallback((products: Product[]) => update((next) => products.forEach((p) => next.has(p.id) && next.set(p.id, p))), [update])

  const clear = useCallback(() => setSelected(new Map()), [])

  const selectedIds = useMemo(() => new Set(selected.keys()), [selected])
  const selectedProducts = useMemo(() => [...selected.values()], [selected])

  return { selectedIds, selectedProducts, toggle, togglePage, remove, sync, clear }
}
