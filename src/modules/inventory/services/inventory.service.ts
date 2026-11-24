import { http } from '@/lib/http'
import type {
  AdjustStockPayload,
  AdjustStockResult,
  InventoryDetail,
  InventoryItem,
  InventoryListParams,
  InventoryListResult,
  InventoryStats,
  MovementListParams,
  MovementListResult,
  StockMovement,
} from '@/modules/inventory/types/inventory.types'

const BASE = '/api/inventory'
const EXPORT_PAGE_SIZE = 100
const EXPORT_MAX_PAGES = 50

type Nullable<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: T[P] | null }
type ItemResponse = Nullable<InventoryItem, 'barcode' | 'image' | 'originalPrice' | 'costPrice' | 'description' | 'lastMovementAt'>
type MovementResponse = Nullable<StockMovement, 'barcode' | 'reason' | 'note' | 'refCode'>

const toItem = (i: ItemResponse): InventoryItem => ({
  ...i,
  barcode: i.barcode ?? '',
  image: i.image ?? undefined,
  originalPrice: i.originalPrice ?? undefined,
  costPrice: i.costPrice ?? undefined,
  description: i.description ?? undefined,
  lastMovementAt: i.lastMovementAt ?? undefined,
})

const toMovement = (m: MovementResponse): StockMovement => ({
  ...m,
  barcode: m.barcode ?? '',
  reason: m.reason ?? undefined,
  note: m.note ?? undefined,
  refCode: m.refCode ?? undefined,
})

const byProduct = (productId: string) => `${BASE}/${encodeURIComponent(productId)}`

export const inventoryService = {
  list: (params: InventoryListParams) =>
    http
      .get<Omit<InventoryListResult, 'items'> & { items: ItemResponse[] }>(BASE, { params: { ...params } })
      .then((res): InventoryListResult => ({ ...res, items: res.items.map(toItem) })),

  stats: () => http.get<InventoryStats>(`${BASE}/stats`),

  detail: (productId: string, days = 30) =>
    http
      .get<{ item: ItemResponse; series: { date: string; stock: number }[]; recent: MovementResponse[] }>(byProduct(productId), { params: { days } })
      .then(
        (res): InventoryDetail => ({
          item: toItem(res.item),
          series: res.series.map((p) => ({ date: new Date(p.date), stock: p.stock })),
          recent: res.recent.map(toMovement),
        }),
      ),

  movements: (params: MovementListParams) =>
    http
      .get<Omit<MovementListResult, 'items'> & { items: MovementResponse[] }>(`${BASE}/movements`, { params: { ...params } })
      .then((res): MovementListResult => ({ ...res, items: res.items.map(toMovement) })),

  async movementsAll(params: Omit<MovementListParams, 'page' | 'pageSize'>): Promise<StockMovement[]> {
    const items: StockMovement[] = []
    for (let page = 1; page <= EXPORT_MAX_PAGES; page++) {
      const res = await inventoryService.movements({ ...params, page, pageSize: EXPORT_PAGE_SIZE })
      items.push(...res.items)
      if (items.length >= res.total || res.items.length === 0) break
    }
    return items
  },

  adjust: (payload: AdjustStockPayload, idempotencyKey: string) =>
    http
      .post<{ item: ItemResponse; movement: MovementResponse }>(`${BASE}/adjust`, payload, { headers: { 'Idempotency-Key': idempotencyKey } })
      .then((res): AdjustStockResult => ({ item: toItem(res.item), movement: toMovement(res.movement) })),

  updateMinStock: (productId: string, minStock: number) => http.patch<ItemResponse>(`${byProduct(productId)}/min-stock`, { minStock }).then(toItem),
}
