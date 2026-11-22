import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { catalogService } from '@/modules/categories/services/catalog.service'
import { inventoryService } from '@/modules/inventory/services/inventory.service'
import type { AdjustStockPayload, StockMovement } from '@/modules/inventory/types/inventory.types'
import { toInventoryItem } from '@/modules/inventory/utils/inventory.utils'
import type { Category, Product } from '@/modules/sales/types/sales.types'

export function useInventoryData() {
  const [products, setProducts] = useState<Product[]>([])
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([inventoryService.getStock(), catalogService.getCategories()])
      .then(([stock, cats]) => {
        setProducts(stock.products)
        setMovements(stock.movements)
        setCategories([{ id: 'all', name: 'Tất cả' }, ...cats])
      })
      .catch(() => toast.error('Không tải được dữ liệu tồn kho'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  const items = useMemo(() => {
    const now = Date.now()
    return products.map((p) => toInventoryItem(p, movements, now))
  }, [products, movements])

  const adjust = useCallback(async (payload: AdjustStockPayload) => {
    const { product, movement } = await inventoryService.adjustStock(payload)
    setProducts((list) => list.map((p) => (p.id === product.id ? product : p)))
    setMovements((list) => [movement, ...list])
    return movement
  }, [])

  const updateMinStock = useCallback(async (productId: string, minStock: number) => {
    const product = await inventoryService.updateMinStock(productId, minStock)
    setProducts((list) => list.map((p) => (p.id === product.id ? product : p)))
  }, [])

  return { items, movements, categories, loading, reload: load, adjust, updateMinStock }
}
