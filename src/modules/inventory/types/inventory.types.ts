import type { Product } from '@/modules/sales/types/sales.types'

export type MovementType = 'sale' | 'return' | 'import' | 'adjust-in' | 'adjust-out' | 'initial'

export interface StockMovement {
  id: string
  productId: string
  productName: string
  sku: string
  barcode: string
  unit: string
  type: MovementType
  quantity: number
  before: number
  after: number
  reason?: string
  note?: string
  refCode?: string
  createdBy: string
  createdAt: string
}

export type StockLevelFilter = 'all' | 'ok' | 'low' | 'out' | 'slow'
export type InventorySort = 'value-desc' | 'stock-asc' | 'stock-desc' | 'name' | 'recent'

export type StockLevel = 'ok' | 'low' | 'out'

export interface InventoryItem extends Product {
  minStockValue: number
  stockValue: number
  level: StockLevel
  soldLast30: number
  lastMovementAt?: string
  slow: boolean
}

export interface InventoryListParams {
  keyword?: string
  categoryId?: string
  level?: Exclude<StockLevelFilter, 'all'>
  sort: InventorySort
  page: number
  pageSize: number
}

export interface InventoryListResult {
  items: InventoryItem[]
  total: number
  levelCounts: Record<StockLevelFilter, number>
}

export interface MovementListParams {
  keyword?: string
  type?: MovementFilters['type']
  productId?: string
  from?: string
  to?: string
  page: number
  pageSize: number
}

export interface MovementSummary {
  inQty: number
  outQty: number
}

export interface MovementListResult {
  items: StockMovement[]
  total: number
  summary: MovementSummary
}

export interface InventoryDetail {
  item: InventoryItem
  series: StockPoint[]
  recent: StockMovement[]
}

export interface AdjustStockResult {
  item: InventoryItem
  movement: StockMovement
}

export interface InventoryFilters {
  keyword: string
  categoryId: string
  level: StockLevelFilter
  sort: InventorySort
}

export type MovementRange = 'today' | '7d' | '30d' | 'all' | 'custom'

export interface MovementFilters {
  keyword: string
  type: MovementType | 'all' | 'in' | 'out'
  range: MovementRange
  dateFrom?: Date
  dateTo?: Date
}

export type AdjustMode = 'increase' | 'decrease' | 'set'

export interface AdjustStockPayload {
  productId: string
  mode: AdjustMode
  quantity: number
  reason: string
  note: string
  expectedStock?: number
}

export interface InventoryStats {
  stockValue: number
  skuCount: number
  units: number
  low: number
  out: number
  slow: number
}

export interface StockPoint {
  date: Date
  stock: number
}
