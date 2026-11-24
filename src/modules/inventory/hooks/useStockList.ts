import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner'
import { useDebounce } from '@/hooks/useDebounce'
import { useQuery } from '@/hooks/useQuery'
import { errorMessage, HttpError } from '@/lib/http'
import { inventoryService } from '@/modules/inventory/services/inventory.service'
import type { InventoryFilters, InventoryItem } from '@/modules/inventory/types/inventory.types'
import { DEFAULT_INVENTORY_FILTERS, EMPTY_LEVEL_COUNTS, hasInventoryFilters, PAGE_SIZE, toInventoryParams } from '@/modules/inventory/utils/inventory.utils'
import { productsService } from '@/modules/products/services/products.service'

export function useStockList(scannerEnabled: boolean) {
  const [filters, setFilters] = useState<InventoryFilters>(DEFAULT_INVENTORY_FILTERS)
  const [page, setPage] = useState(1)
  const keyword = useDebounce(filters.keyword, 300)
  const params = useMemo(() => toInventoryParams(filters, keyword, page), [filters, keyword, page])
  const query = useQuery(inventoryService.list, params, { errorText: 'Không tải được danh sách tồn kho' })
  const { setData } = query

  const updateFilter = useCallback(<K extends keyof InventoryFilters>(key: K, value: InventoryFilters[K]) => {
    setFilters((f) => ({ ...f, [key]: value }))
    setPage(1)
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_INVENTORY_FILTERS)
    setPage(1)
  }, [])

  const replaceItem = useCallback(
    (item: InventoryItem) => setData((d) => (d ? { ...d, items: d.items.map((i) => (i.id === item.id ? item : i)) } : d)),
    [setData],
  )

  useBarcodeScanner(
    (code) => {
      setFilters((f) => ({ ...f, keyword: code, level: 'all', categoryId: 'all' }))
      setPage(1)
      productsService
        .lookup(code)
        .then((p) => toast.success(`${p.name}: tồn ${p.stock} ${p.unit.toLowerCase()}`, { duration: 1800 }))
        .catch((e: unknown) =>
          toast.error(e instanceof HttpError && e.status === 404 ? `Không có sản phẩm mã "${code}"` : errorMessage(e, 'Không tra cứu được mã vạch')),
        )
    },
    { enabled: scannerEnabled },
  )

  const total = query.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return {
    filters,
    updateFilter,
    resetFilters,
    hasActiveFilters: hasInventoryFilters(filters),
    items: query.data?.items ?? [],
    total,
    levelCounts: query.data?.levelCounts ?? EMPTY_LEVEL_COUNTS,
    page: Math.min(page, totalPages),
    setPage,
    loading: query.initialLoading,
    refreshing: query.loading && !query.initialLoading,
    error: query.error,
    reload: query.reload,
    replaceItem,
  }
}
