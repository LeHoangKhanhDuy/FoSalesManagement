import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useQuery } from '@/hooks/useQuery'
import { errorMessage } from '@/lib/http'
import { categoryService } from '@/modules/categories/services/category.service'
import { useMovementHistory } from '@/modules/inventory/hooks/useMovementHistory'
import { useStockAdjust } from '@/modules/inventory/hooks/useStockAdjust'
import { useStockDetail } from '@/modules/inventory/hooks/useStockDetail'
import { useStockList } from '@/modules/inventory/hooks/useStockList'
import { inventoryService } from '@/modules/inventory/services/inventory.service'
import type { InventoryItem, InventoryStats } from '@/modules/inventory/types/inventory.types'
import { usePurchaseOrders } from '@/modules/purchasing/hooks/usePurchaseOrders'
import type { Category } from '@/modules/sales/types/sales.types'

export type InventoryTab = 'stock' | 'purchasing' | 'history'

interface InventoryNavState {
  tab?: InventoryTab
  supplierId?: string
}

const EMPTY_STATS: InventoryStats = { stockValue: 0, skuCount: 0, units: 0, low: 0, out: 0, slow: 0 }
const ALL_CATEGORY: Category = { id: 'all', name: 'Tất cả' }
const fetchStats = () => inventoryService.stats()
const fetchCategories = () => categoryService.list()

export function useInventoryPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const navState = location.state as InventoryNavState | null
  const [tab, setTab] = useState<InventoryTab>(navState?.tab ?? 'stock')
  const [detailId, setDetailId] = useState<string | null>(null)

  const stats = useQuery(fetchStats, null, { errorText: 'Không tải được thống kê tồn kho' })
  const categories = useQuery(fetchCategories, null, { errorText: 'Không tải được danh mục' })
  const detail = useStockDetail(detailId)
  const history = useMovementHistory(tab === 'history')

  const { reload: reloadStats } = stats
  const { reload: reloadDetail } = detail
  const refreshAfterChange = useCallback(() => {
    reloadStats()
    if (detailId) reloadDetail()
  }, [reloadStats, reloadDetail, detailId])

  const adjust = useStockAdjust({
    onAdjusted: ({ item }) => {
      stock.replaceItem(item)
      refreshAfterChange()
    },
    onStale: () => {
      stock.reload()
      refreshAfterChange()
    },
  })
  const stock = useStockList(tab === 'stock' && !adjust.target && !detailId)
  const { reload: reloadStock } = stock

  const onStockChanged = useCallback(() => {
    reloadStock()
    reloadStats()
  }, [reloadStock, reloadStats])
  const purchasing = usePurchaseOrders(onStockChanged)

  const presetSupplier = navState?.supplierId
  const { loading: poLoading, openCreate } = purchasing
  useEffect(() => {
    if (!presetSupplier || poLoading) return
    setTab('purchasing')
    openCreate(undefined, presetSupplier)
    navigate(location.pathname, { replace: true, state: null })
  }, [presetSupplier, poLoading, openCreate, navigate, location.pathname])

  const detailItem = useMemo(
    () => detail.detail?.item ?? stock.items.find((i) => i.id === detailId) ?? null,
    [detail.detail, stock.items, detailId],
  )

  const saveMinStock = async (productId: string, minStock: number) => {
    try {
      const item = await inventoryService.updateMinStock(productId, minStock)
      stock.replaceItem(item)
      detail.setData((d) => (d && d.item.id === item.id ? { ...d, item } : d))
      reloadStats()
      toast.success('Đã cập nhật mức tồn tối thiểu')
    } catch (e) {
      toast.error(errorMessage(e, 'Cập nhật thất bại'))
    }
  }

  const viewHistoryOf = (item: InventoryItem) => {
    history.updateFilter('keyword', item.sku)
    setDetailId(null)
    setTab('history')
  }

  const reload = () => {
    reloadStats()
    categories.reload()
    if (tab === 'history') history.reload()
    else reloadStock()
  }

  return {
    tab,
    setTab,
    stats: stats.data ?? EMPTY_STATS,
    statsLoading: stats.initialLoading,
    categories: useMemo(() => [ALL_CATEGORY, ...(categories.data ?? [])], [categories.data]),
    stock,
    history,
    purchasing,
    detail: detailItem,
    detailSeries: detail.detail?.series ?? [],
    detailMovements: detail.detail?.recent ?? [],
    detailLoading: detail.loading,
    openDetail: useCallback((item: InventoryItem) => setDetailId(item.id), []),
    closeDetail: useCallback(() => setDetailId(null), []),
    adjust,
    saveMinStock,
    viewHistoryOf,
    reload,
    reloading: stats.loading || stock.refreshing || history.refreshing,
  }
}
