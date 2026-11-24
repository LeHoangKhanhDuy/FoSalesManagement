import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner'
import { useDebounce } from '@/hooks/useDebounce'
import { errorMessage, HttpError } from '@/lib/http'
import { useProductActions } from '@/modules/products/hooks/useProductActions'
import { useProductCatalog } from '@/modules/products/hooks/useProductCatalog'
import { useProductList } from '@/modules/products/hooks/useProductList'
import { useProductSelection } from '@/modules/products/hooks/useProductSelection'
import { useProductStats } from '@/modules/products/hooks/useProductStats'
import { productsService } from '@/modules/products/services/products.service'
import type { ProductFilters } from '@/modules/products/types/products.types'
import { DEFAULT_FILTERS, exportProductsCsv, hasActiveFilters, PAGE_SIZE, toListParams } from '@/modules/products/utils/products.utils'

export function useProductsPage() {
  const [filters, setFilters] = useState<ProductFilters>(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)
  const [exporting, setExporting] = useState(false)
  const keyword = useDebounce(filters.keyword, 300)

  const params = useMemo(() => toListParams(filters, keyword, page), [filters, keyword, page])
  const list = useProductList(params)
  const stats = useProductStats(filters.categoryId)
  const catalog = useProductCatalog()
  const selection = useProductSelection(list.items)
  const { reload: reloadList } = list
  const { reload: reloadStats } = stats
  const { reload: reloadCatalog } = catalog

  const totalPages = Math.max(1, Math.ceil(list.total / PAGE_SIZE))
  useEffect(() => {
    if (!list.loading && page > totalPages) setPage(totalPages)
  }, [list.loading, page, totalPages])

  const updateFilter = useCallback(<K extends keyof ProductFilters>(key: K, value: ProductFilters[K]) => {
    setFilters((f) => ({ ...f, [key]: value }))
    setPage(1)
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    setPage(1)
  }, [])

  const reload = useCallback(() => {
    reloadList()
    reloadStats()
    reloadCatalog()
  }, [reloadList, reloadStats, reloadCatalog])

  const actions = useProductActions({
    patchItems: list.patchItems,
    syncSelection: selection.sync,
    onCreated: useCallback(() => {
      reloadStats()
      if (page === 1) reloadList()
      else setPage(1)
    }, [page, reloadList, reloadStats]),
    onChanged: useCallback(
      (options?: { listStale?: boolean }) => {
        reloadStats()
        if (options?.listStale) reloadList()
      },
      [reloadList, reloadStats],
    ),
    onDeleted: useCallback(
      (ids: string[]) => {
        selection.remove(ids)
        reloadList()
        reloadStats()
      },
      [selection, reloadList, reloadStats],
    ),
  })

  useBarcodeScanner(
    (code) => {
      setFilters((f) => ({ ...f, keyword: code, status: 'all', categoryId: 'all', stock: 'all' }))
      setPage(1)
      productsService
        .lookup(code)
        .then((p) => toast.success(`Đã tìm thấy: ${p.name}`, { duration: 1500 }))
        .catch((e: unknown) =>
          e instanceof HttpError && e.status === 404
            ? toast.error(`Không có sản phẩm mã "${code}"`, { description: 'Bạn có thể thêm sản phẩm mới với mã vạch này' })
            : toast.error(errorMessage(e, 'Không tra cứu được mã vạch')),
        )
    },
    { enabled: !actions.form && !actions.deleteTarget },
  )

  const exportCsv = async () => {
    if (exporting) return
    if (list.total === 0) return toast.info('Không có sản phẩm để xuất')
    setExporting(true)
    try {
      const { page: _, pageSize: __, ...query } = toListParams(filters, keyword, 1)
      const products = await productsService.listAll(query)
      exportProductsCsv(products, catalog.categories)
      toast.success(`Đã xuất ${products.length} sản phẩm`)
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
    hasActiveFilters: hasActiveFilters(filters),
    page: Math.min(page, totalPages),
    setPage,
    list,
    stats,
    catalog,
    selection,
    actions,
    exporting,
    exportCsv,
    reload,
  }
}
