import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/useDebounce'
import type { MovementFilters, StockMovement } from '@/modules/inventory/types/inventory.types'
import { DEFAULT_MOVEMENT_FILTERS, exportMovementsCsv, filterMovements, PAGE_SIZE } from '@/modules/inventory/utils/inventory.utils'

export function useMovementHistory(movements: StockMovement[]) {
  const [filters, setFilters] = useState<MovementFilters>(DEFAULT_MOVEMENT_FILTERS)
  const [page, setPage] = useState(1)
  const keyword = useDebounce(filters.keyword, 250)

  const updateFilter = useCallback(<K extends keyof MovementFilters>(key: K, value: MovementFilters[K]) => {
    setFilters((f) => ({ ...f, [key]: value }))
    setPage(1)
  }, [])

  const setRangePreset = useCallback((range: MovementFilters['range']) => {
    setFilters((f) => ({ ...f, range, dateFrom: undefined, dateTo: undefined }))
    setPage(1)
  }, [])

  const setCustomRange = useCallback((dateFrom?: Date, dateTo?: Date) => {
    setFilters((f) => ({ ...f, dateFrom, dateTo, range: dateFrom || dateTo ? 'custom' : DEFAULT_MOVEMENT_FILTERS.range }))
    setPage(1)
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_MOVEMENT_FILTERS)
    setPage(1)
  }, [])

  const filtered = useMemo(() => filterMovements(movements, filters, keyword), [movements, filters, keyword])
  const summary = useMemo(
    () =>
      filtered.reduce(
        (s, m) => (m.quantity >= 0 ? { ...s, inQty: s.inQty + m.quantity } : { ...s, outQty: s.outQty - m.quantity }),
        { inQty: 0, outQty: 0 },
      ),
    [filtered],
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = useMemo(() => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE), [filtered, currentPage])
  const hasActiveFilters = filters.keyword !== '' || filters.type !== 'all' || filters.range !== DEFAULT_MOVEMENT_FILTERS.range

  const exportCsv = () => {
    if (!filtered.length) return toast.info('Không có dữ liệu để xuất')
    exportMovementsCsv(filtered)
    toast.success(`Đã xuất ${filtered.length} dòng`)
  }

  return {
    filters,
    updateFilter,
    setRangePreset,
    setCustomRange,
    resetFilters,
    hasActiveFilters,
    filtered,
    summary,
    paged,
    page: currentPage,
    setPage,
    exportCsv,
  }
}
