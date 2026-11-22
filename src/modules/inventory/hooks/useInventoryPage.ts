import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useInventoryData } from '@/modules/inventory/hooks/useInventoryData'
import { useMovementHistory } from '@/modules/inventory/hooks/useMovementHistory'
import { useStockList } from '@/modules/inventory/hooks/useStockList'
import { usePurchaseOrders } from '@/modules/purchasing/hooks/usePurchaseOrders'
import type { AdjustStockPayload, InventoryItem } from '@/modules/inventory/types/inventory.types'

export type InventoryTab = 'stock' | 'purchasing' | 'history'

interface InventoryNavState {
  tab?: InventoryTab
  supplierId?: string
}

export function useInventoryPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const navState = location.state as InventoryNavState | null
  const [tab, setTab] = useState<InventoryTab>(navState?.tab ?? 'stock')
  const [detailId, setDetailId] = useState<string | null>(null)
  const [adjustTarget, setAdjustTarget] = useState<InventoryItem | null>(null)
  const [adjusting, setAdjusting] = useState(false)
  const data = useInventoryData()
  const stock = useStockList(data.items, tab === 'stock' && !adjustTarget && !detailId)
  const history = useMovementHistory(data.movements)
  const purchasing = usePurchaseOrders(data.reload)

  const presetSupplier = navState?.supplierId
  const { loading: poLoading, openCreate } = purchasing
  useEffect(() => {
    if (!presetSupplier || poLoading) return
    setTab('purchasing')
    openCreate(undefined, presetSupplier)
    navigate(location.pathname, { replace: true, state: null })
  }, [presetSupplier, poLoading, openCreate, navigate, location.pathname])

  const detail = useMemo(() => data.items.find((i) => i.id === detailId) ?? null, [data.items, detailId])
  const detailMovements = useMemo(() => (detailId ? data.movements.filter((m) => m.productId === detailId) : []), [data.movements, detailId])

  const openDetail = useCallback((item: InventoryItem) => setDetailId(item.id), [])
  const closeDetail = useCallback(() => setDetailId(null), [])
  const openAdjust = useCallback((item: InventoryItem) => setAdjustTarget(item), [])
  const closeAdjust = useCallback(() => !adjusting && setAdjustTarget(null), [adjusting])

  const submitAdjust = async (payload: AdjustStockPayload) => {
    setAdjusting(true)
    try {
      const m = await data.adjust(payload)
      toast.success(`${m.productName}: ${m.before} → ${m.after} ${m.unit.toLowerCase()}`)
      setAdjustTarget(null)
    } catch {
      toast.error('Điều chỉnh tồn kho thất bại')
    } finally {
      setAdjusting(false)
    }
  }

  const saveMinStock = async (productId: string, minStock: number) => {
    try {
      await data.updateMinStock(productId, minStock)
      toast.success('Đã cập nhật mức tồn tối thiểu')
    } catch {
      toast.error('Cập nhật thất bại')
    }
  }

  const viewHistoryOf = (item: InventoryItem) => {
    history.updateFilter('keyword', item.sku)
    setDetailId(null)
    setTab('history')
  }

  return {
    tab,
    setTab,
    data,
    stock,
    history,
    purchasing,
    detail,
    detailMovements,
    openDetail,
    closeDetail,
    adjustTarget,
    openAdjust,
    closeAdjust,
    submitAdjust,
    adjusting,
    saveMinStock,
    viewHistoryOf,
  }
}
