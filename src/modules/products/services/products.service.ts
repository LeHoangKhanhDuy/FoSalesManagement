import { http } from '@/lib/http'
import type { BulkDeleteResult, ProductListParams, ProductOption, ProductPayload, ProductStats, ProductStatsParams } from '@/modules/products/types/products.types'
import type { Product, ProductStatus } from '@/modules/sales/types/sales.types'
import type { Paginated } from '@/types/common'

const BASE = '/api/products'
const EXPORT_PAGE_SIZE = 100
const EXPORT_MAX_PAGES = 50

type Nullable<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: T[P] | null }
type ProductResponse = Nullable<Product, 'barcode' | 'image' | 'originalPrice' | 'costPrice' | 'description'>
type OptionResponse = Nullable<ProductOption, 'barcode' | 'image' | 'costPrice'>

const normalize = <T extends { barcode: string | null; image: string | null; costPrice?: number | null }>(p: T) => ({
  ...p,
  barcode: p.barcode ?? '',
  image: p.image ?? undefined,
  costPrice: p.costPrice ?? undefined,
})

const toProduct = (p: ProductResponse): Product => ({
  ...normalize(p),
  originalPrice: p.originalPrice ?? undefined,
  description: p.description ?? undefined,
})

const byId = (id: string) => `${BASE}/${encodeURIComponent(id)}`

export const productsService = {
  list: (params: ProductListParams) =>
    http.get<Paginated<ProductResponse>>(BASE, { params: { ...params } }).then((res) => ({ ...res, items: res.items.map(toProduct) })),

  async listAll(params: Omit<ProductListParams, 'page' | 'pageSize'> = {}): Promise<Product[]> {
    const items: Product[] = []
    for (let page = 1; page <= EXPORT_MAX_PAGES; page++) {
      const res = await productsService.list({ ...params, page, pageSize: EXPORT_PAGE_SIZE })
      items.push(...res.items)
      if (items.length >= res.total || res.items.length === 0) break
    }
    return items
  },

  stats: (params: ProductStatsParams = {}) => http.get<ProductStats>(`${BASE}/stats`, { params: { ...params } }),

  sellable: () => http.get<ProductResponse[]>(`${BASE}/sellable`).then((list) => list.map(toProduct)),

  options: (params: { keyword?: string; limit?: number; ids?: string[] } = {}) =>
    http
      .get<OptionResponse[]>(`${BASE}/options`, { params: { keyword: params.keyword, limit: params.limit, ids: params.ids?.join(',') } })
      .then((list) => list.map((o): ProductOption => normalize(o))),

  lookup: (code: string) => http.get<ProductResponse>(`${BASE}/lookup`, { params: { code } }).then(toProduct),

  get: (id: string) => http.get<ProductResponse>(byId(id)).then(toProduct),

  create: (payload: ProductPayload) => http.post<ProductResponse>(BASE, payload).then(toProduct),

  update: (id: string, payload: ProductPayload) => http.patch<ProductResponse>(byId(id), payload).then(toProduct),

  setStatus: (ids: string[], status: ProductStatus) => http.patch<{ updated: number }>(`${BASE}/status`, { ids, status }),

  bulkDelete: (ids: string[]) => http.post<BulkDeleteResult>(`${BASE}/bulk-delete`, { ids }),

  async uploadImage(file: File): Promise<string> {
    const body = new FormData()
    body.append('file', file)
    return (await http.post<{ url: string }>('/api/uploads/images', body)).url
  },
}
