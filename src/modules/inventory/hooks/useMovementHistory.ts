import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/useDebounce'
import { useQuery } from '@/hooks/useQuery'
import { errorMessage } from '@/lib/http'
import { inventoryService } from '@/modules/inventory/services/inventory.service'
import type { MovementFilters } from '@/modules/inventory/types/inventory.types'
import { DEFAULT_MOVEMENT_FILTERS, exportMovementsCsv, hasMovementFilters, PAGE_SIZE, toMovementParams } from '@/modules/inventory/utils/inventory.utils'

const EMPTY_SUMMARY = { inQty: 0, outQty: 0 }

export function useMovementHistory(enabled: boolean) {
  const [filters, setFilters] = useState<MovementFilters>(DEFAULT_MOVEMENT_FILTERS)
  const [page, setPage] = useState(1)
  const [exporting, setExporting] = useState(false)
  const keyword = useDebounce(filters.keyword, 300)
  const params = useMemo(() => toMovementParams(filters, keyword, page), [filters, keyword, page])
  const query = useQuery(inventoryService.movements, params, { enabled, errorText: 'Không tải được lịch sử xuất nhập' })

  const update = useCallback((patch: Partial<MovementFilters>) => {
    setFilters((f) => ({ ...f, ...patch }))
    setPage(1)
  }, [])

  const updateFilter = useCallback(<K extends keyof MovementFilters>(key: K, value: MovementFilters[K]) => update({ [key]: value }), [update])
  const setRangePreset = useCallback((range: MovementFilters['range']) => update({ range, dateFrom: undefined, dateTo: undefined }), [update])
  const setCustomRange = useCallback(
    (dateFrom?: Date, dateTo?: Date) => update({ dateFrom, dateTo, range: dateFrom || dateTo ? 'custom' : DEFAULT_MOVEMENT_FILTERS.range }),
    [update],
  )
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_MOVEMENT_FILTERS)
    setPage(1)
  }, [])

  const total = query.data?.total ?? 0

  const exportCsv = async () => {
    if (exporting) return
    if (!total) return toast.info('Không có dữ liệu để xuất')
    setExporting(true)
    try {
      const { page: _, pageSize: __, ...rest } = params
      const list = await inventoryService.movementsAll(rest)
      exportMovementsCsv(list)
      toast.success(`Đã xuất ${list.length} dòng`)
    } catch (e) {
      toast.error(errorMessage(e, 'Xuất file thất bại'))
    } finally {
      setExporting(false)
    }
  }

  return {
    filters,
    updateFilter,
    setRangePreset,
    setCustomRange,
    resetFilters,
    hasActiveFilters: hasMovementFilters(filters),
    items: query.data?.items ?? [],
    total,
    summary: query.data?.summary ?? EMPTY_SUMMARY,
    page: Math.min(page, Math.max(1, Math.ceil(total / PAGE_SIZE))),
    setPage,
    loading: query.initialLoading,
    refreshing: query.loading && !query.initialLoading,
    error: query.error,
    reload: query.reload,
    exporting,
    exportCsv,
  }
}
