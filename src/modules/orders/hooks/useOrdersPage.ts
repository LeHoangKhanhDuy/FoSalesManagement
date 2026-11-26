import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/useDebounce'
import { useQuery } from '@/hooks/useQuery'
import { errorMessage } from '@/lib/http'
import { useOrderActions } from '@/modules/orders/hooks/useOrderActions'
import { useReceiptPrinter } from '@/modules/orders/hooks/useReceiptPrinter'
import { ordersService } from '@/modules/orders/services/orders.service'
import type { OrderFilters, OrderSummary } from '@/modules/orders/types/orders.types'
import { exportOrdersCsv, PAGE_SIZE, toOrderQuery, toRangeParams } from '@/modules/orders/utils/orders.utils'

const DEFAULT_FILTERS: OrderFilters = { keyword: '', status: 'all', range: '30d', payment: 'all', sort: 'newest' }

export function useOrdersPage() {
  const [filters, setFilters] = useState<OrderFilters>(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<OrderSummary | null>(null)
  const [exporting, setExporting] = useState(false)
  const keyword = useDebounce(filters.keyword, 300)

  const query = useMemo(() => toOrderQuery(filters, keyword), [filters, keyword])
  const rangeParams = useMemo(
    () => toRangeParams({ range: filters.range, dateFrom: filters.dateFrom, dateTo: filters.dateTo }),
    [filters.range, filters.dateFrom, filters.dateTo],
  )

  const list = useQuery(ordersService.list, { ...query, page, pageSize: PAGE_SIZE }, { errorText: 'Không tải được danh sách đơn hàng' })
  const stats = useQuery(ordersService.stats, rangeParams, { errorText: 'Không tải được thống kê đơn hàng' })
  const detail = useQuery(ordersService.get, selected?.id ?? '', { enabled: !!selected, errorText: 'Không tải được chi tiết đơn hàng' })
  const printer = useReceiptPrinter()

  const { reload: reloadList } = list
  const { reload: reloadStats } = stats
  const { reload: reloadDetail } = detail
  const selectedId = selected?.id
  const refresh = useCallback(
    (orderId?: string) => {
      reloadList()
      reloadStats()
      if (orderId && orderId === selectedId) reloadDetail()
    },
    [reloadList, reloadStats, reloadDetail, selectedId],
  )
  const closeDetail = useCallback(() => setSelected(null), [])

  const actions = useOrderActions({ onDone: refresh })

  const updateFilter = useCallback(<K extends keyof OrderFilters>(key: K, value: OrderFilters[K]) => {
    setFilters((f) => ({ ...f, [key]: value }))
    setPage(1)
  }, [])

  const updateDateRange = useCallback((dateFrom?: Date, dateTo?: Date) => {
    setFilters((f) => ({ ...f, dateFrom, dateTo, range: dateFrom || dateTo ? 'custom' : DEFAULT_FILTERS.range }))
    setPage(1)
  }, [])

  const updateRangePreset = useCallback((range: OrderFilters['range']) => {
    setFilters((f) => ({ ...f, range, dateFrom: undefined, dateTo: undefined }))
    setPage(1)
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    setPage(1)
  }, [])

  const exportCsv = async () => {
    if (!list.data?.total) return toast.info('Không có đơn hàng để xuất')
    setExporting(true)
    try {
      const all = await ordersService.listAll(query)
      exportOrdersCsv(all)
      toast.success(`Đã xuất ${all.length} đơn hàng`)
    } catch (e) {
      toast.error(errorMessage(e, 'Xuất danh sách thất bại'))
    } finally {
      setExporting(false)
    }
  }

  const detailData = detail.data && detail.data.id === selectedId ? detail.data : null

  return {
    filters,
    updateFilter,
    updateDateRange,
    updateRangePreset,
    resetFilters,
    hasActiveFilters:
      filters.keyword !== '' || filters.status !== 'all' || filters.range !== DEFAULT_FILTERS.range || filters.payment !== 'all',
    list: {
      items: list.data?.items ?? [],
      total: list.data?.total ?? 0,
      statusCounts: list.data?.statusCounts,
      loading: list.initialLoading,
      refreshing: list.loading && !list.initialLoading,
      error: list.error,
      reload: list.reload,
    },
    page,
    setPage,
    stats: { data: stats.data, loading: stats.initialLoading, error: stats.error, reload: stats.reload },
    detail: {
      summary: selected,
      order: detailData,
      loading: !!selected && !detailData && !detail.error,
      error: detailData ? undefined : detail.error,
      reload: detail.reload,
      open: setSelected,
      close: closeDetail,
    },
    actions,
    printer,
    exporting,
    exportCsv,
    reload: () => refresh(selectedId),
  }
}
