import { USE_MOCK } from '@/lib/constants'
import { http, sleep } from '@/lib/http'
import { MOCK_MOVEMENTS, recordStockMovement } from '@/modules/inventory/mocks/movements.mock'
import type { AdjustStockPayload, StockMovement } from '@/modules/inventory/types/inventory.types'
import { MOCK_PRODUCTS } from '@/modules/sales/mocks/products.mock'
import type { Product } from '@/modules/sales/types/sales.types'

const findProduct = (id: string) => {
  const product = MOCK_PRODUCTS.find((p) => p.id === id)
  if (!product) throw new Error('Không tìm thấy sản phẩm')
  return product
}

export const inventoryService = {
  async getStock(): Promise<{ products: Product[]; movements: StockMovement[] }> {
    if (!USE_MOCK) {
      const [products, movements] = await Promise.all([
        http.get<Product[]>('/api/inventory'),
        http.get<StockMovement[]>('/api/inventory/movements', { params: { days: 60 } }),
      ])
      return { products, movements }
    }
    await sleep(400)
    return { products: structuredClone(MOCK_PRODUCTS), movements: structuredClone(MOCK_MOVEMENTS) }
  },

  async adjustStock(payload: AdjustStockPayload): Promise<{ product: Product; movement: StockMovement }> {
    if (!USE_MOCK) return http.post('/api/inventory/adjust', payload)
    await sleep(400)
    const product = findProduct(payload.productId)
    const delta =
      payload.mode === 'increase' ? payload.quantity : payload.mode === 'decrease' ? -payload.quantity : payload.quantity - product.stock
    const movement = recordStockMovement(product, delta >= 0 ? 'adjust-in' : 'adjust-out', delta, {
      reason: payload.reason,
      note: payload.note || undefined,
    })
    return { product: structuredClone(product), movement: structuredClone(movement) }
  },

  async updateMinStock(productId: string, minStock: number): Promise<Product> {
    if (!USE_MOCK) return http.patch<Product>(`/api/inventory/${productId}/min-stock`, { minStock })
    await sleep(250)
    const product = findProduct(productId)
    product.minStock = minStock
    return structuredClone(product)
  },
}
