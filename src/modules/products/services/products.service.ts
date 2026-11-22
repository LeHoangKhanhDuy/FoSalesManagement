import { USE_MOCK } from '@/lib/constants'
import { http, sleep } from '@/lib/http'
import { MOCK_PRODUCTS } from '@/modules/sales/mocks/products.mock'
import type { Product, ProductStatus } from '@/modules/sales/types/sales.types'

const findIndex = (id: string) => {
  const index = MOCK_PRODUCTS.findIndex((p) => p.id === id)
  if (index < 0) throw new Error('Không tìm thấy sản phẩm')
  return index
}

export const productsService = {
  async getProducts(): Promise<Product[]> {
    if (USE_MOCK) return sleep(400).then(() => structuredClone(MOCK_PRODUCTS))
    return http.get<Product[]>('/api/products')
  },

  async createProduct(data: Omit<Product, 'id'>): Promise<Product> {
    if (!USE_MOCK) return http.post<Product>('/api/products', data)
    await sleep(450)
    const now = new Date().toISOString()
    const product: Product = { ...data, id: `p-${crypto.randomUUID().slice(0, 8)}`, createdAt: now, updatedAt: now }
    MOCK_PRODUCTS.unshift(product)
    return structuredClone(product)
  },

  async updateProduct(id: string, data: Partial<Omit<Product, 'id'>>): Promise<Product> {
    if (!USE_MOCK) return http.put<Product>(`/api/products/${id}`, data)
    await sleep(450)
    const index = findIndex(id)
    const updated: Product = { ...MOCK_PRODUCTS[index], ...data, id, updatedAt: new Date().toISOString() }
    MOCK_PRODUCTS[index] = updated
    return structuredClone(updated)
  },

  async setStatus(ids: string[], status: ProductStatus): Promise<void> {
    if (!USE_MOCK) return http.patch<void>('/api/products/status', { ids, status })
    await sleep(300)
    ids.forEach((id) => (MOCK_PRODUCTS[findIndex(id)].status = status))
  },

  async deleteProducts(ids: string[]): Promise<void> {
    if (!USE_MOCK) return http.post<void>('/api/products/bulk-delete', { ids })
    await sleep(400)
    ids.forEach((id) => MOCK_PRODUCTS.splice(findIndex(id), 1))
  },
}
