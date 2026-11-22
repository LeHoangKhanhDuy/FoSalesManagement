import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner'
import { useDebounce } from '@/hooks/useDebounce'
import type { InventoryFilters, InventoryItem } from '@/modules/inventory/types/inventory.types'
import {
  calcInventoryStats,
  DEFAULT_INVENTORY_FILTERS,
  filterInventory,
  LEVEL_TABS,
  matchLevel,
  PAGE_SIZE,
  sortInventory,
} from '@/modules/inventory/utils/inventory.utils'

export function useStockList(items: InventoryItem[], scannerEnabled: boolean) {
  const [filters, setFilters] = useState<InventoryFilters>(DEFAULT_INVENTORY_FILTERS)
  const [page, setPage] = useState(1)
  const keyword = useDebounce(filters.keyword, 250)

  const updateFilter = useCallback(<K extends keyof InventoryFilters>(key: K, value: InventoryFilters[K]) => {
    setFilters((f) => ({ ...f, [key]: value }))
    setPage(1)
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_INVENTORY_FILTERS)
    setPage(1)
  }, [])

  useBarcodeScanner(
    (code) => {
      setFilters((f) => ({ ...f, keyword: code, level: 'all', categoryId: 'all' }))
      setPage(1)
      const found = items.find((i) => i.barcode === code || i.sku.toLowerCase() === code.toLowerCase())
      if (found) toast.success(`${found.name}: tồn ${found.stock} ${found.unit.toLowerCase()}`, { duration: 1800 })
      else toast.error(`Không có sản phẩm mã "${code}"`)
    },
    { enabled: scannerEnabled },
  )

  const stats = useMemo(() => calcInventoryStats(items), [items])
  const base = useMemo(() => filterInventory(items, filters, keyword), [items, filters, keyword])
  const levelCounts = useMemo(
    () => Object.fromEntries(LEVEL_TABS.map((t) => [t.value, base.filter((i) => matchLevel(i, t.value)).length])) as Record<
      InventoryFilters['level'],
      number
    >,
    [base],
  )
  const filtered = useMemo(() => sortInventory(base.filter((i) => matchLevel(i, filters.level)), filters.sort), [base, filters.level, filters.sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = useMemo(() => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE), [filtered, currentPage])
  const hasActiveFilters = filters.keyword !== '' || filters.categoryId !== 'all' || filters.level !== 'all'

  return { filters, updateFilter, resetFilters, hasActiveFilters, stats, levelCounts, filtered, paged, page: currentPage, setPage }
}
