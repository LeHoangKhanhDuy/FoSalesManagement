import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/useDebounce'
import { useQuery } from '@/hooks/useQuery'
import { errorMessage } from '@/lib/http'
import { categoryService } from '@/modules/categories/services/category.service'
import { useSupplierActions } from '@/modules/suppliers/hooks/useSupplierActions'
import { suppliersService } from '@/modules/suppliers/services/suppliers.service'
import type { SupplierFilters, SupplierListItem } from '@/modules/suppliers/types/suppliers.types'
import { DEFAULT_SUPPLIER_FILTERS, EMPTY_STATS, EMPTY_TAB_COUNTS, exportSuppliersCsv, hasSupplierFilters, SUPPLIER_PAGE_SIZE, toSupplierParams } from '@/modules/suppliers/utils/suppliers.utils'
import { PATHS } from '@/routes/paths'

export type { SupplierFormState } from '@/modules/suppliers/hooks/useSupplierActions'

const fetchStats = () => suppliersService.stats()
const fetchCategories = () => categoryService.list()

export function useSuppliersPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<SupplierFilters>(DEFAULT_SUPPLIER_FILTERS)
  const [page, setPage] = useState(1)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const keyword = useDebounce(filters.keyword, 300)

  const params = useMemo(() => toSupplierParams(filters, keyword, page), [filters, keyword, page])
  const list = useQuery(suppliersService.list, params, { errorText: 'Không tải được danh sách nhà cung cấp' })
  const stats = useQuery(fetchStats, null, { errorText: 'Không tải được thống kê nhà cung cấp' })
  const categories = useQuery(fetchCategories, null, { errorText: 'Không tải được danh mục' })
  const { setData: setList, reload: reloadList } = list
  const { reload: reloadStats } = stats

  const replaceItem = useCallback(
    (item: SupplierListItem) => setList((d) => (d ? { ...d, items: d.items.map((s) => (s.id === item.id ? item : s)) } : d)),
    [setList],
  )

  const refresh = useCallback(() => {
    reloadList()
    reloadStats()
  }, [reloadList, reloadStats])

  const actions = useSupplierActions({
    onSaved: (item, created) => {
      if (created && page !== 1) setPage(1)
      else if (created) reloadList()
      else replaceItem(item)
      reloadStats()
    },
    onChanged: (item) => {
      replaceItem(item)
      refresh()
    },
    onDeleted: (id) => {
      if (detailId === id) setDetailId(null)
      refresh()
    },
    onStale: refresh,
  })

  const updateFilter = useCallback(<K extends keyof SupplierFilters>(key: K, value: SupplierFilters[K]) => {
    setFilters((f) => ({ ...f, [key]: value }))
    setPage(1)
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_SUPPLIER_FILTERS)
    setPage(1)
  }, [])

  const showDebt = useCallback(() => {
    setFilters((f) => ({ ...f, tab: 'debt', sort: 'debt' }))
    setPage(1)
  }, [])

  const items = useMemo(() => list.data?.items ?? [], [list.data])
  const total = list.data?.total ?? 0
  const detail = useMemo(() => items.find((s) => s.id === detailId) ?? null, [items, detailId])

  const createOrder = useCallback((s: SupplierListItem) => navigate(PATHS.inventory, { state: { tab: 'purchasing', supplierId: s.id } }), [navigate])

  const exportCsv = async () => {
    if (exporting) return
    if (!total) return toast.info('Không có nhà cung cấp để xuất')
    setExporting(true)
    try {
      const { page: _, pageSize: __, ...query } = params
      const all = await suppliersService.listAll(query)
      exportSuppliersCsv(all)
      toast.success(`Đã xuất ${all.length} nhà cung cấp`)
    } catch (e) {
      toast.error(errorMessage(e, 'Xuất file thất bại'))
    } finally {
      setExporting(false)
    }
  }

  return {
    filters,
    updateFilter,
    resetFilters,
    showDebt,
    hasActiveFilters: hasSupplierFilters(filters),
    counts: list.data?.tabCounts ?? EMPTY_TAB_COUNTS,
    items,
    total,
    page: Math.min(page, Math.max(1, Math.ceil(total / SUPPLIER_PAGE_SIZE))),
    setPage,
    loading: list.initialLoading,
    refreshing: list.loading && !list.initialLoading,
    error: list.error,
    stats: stats.data ?? EMPTY_STATS,
    statsLoading: stats.initialLoading,
    categories: categories.data ?? [],
    reload: () => {
      refresh()
      categories.reload()
    },
    reloading: list.loading || stats.loading,
    detail,
    openDetail: useCallback((s: SupplierListItem) => setDetailId(s.id), []),
    closeDetail: useCallback(() => setDetailId(null), []),
    actions,
    createOrder,
    exporting,
    exportCsv,
  }
}
