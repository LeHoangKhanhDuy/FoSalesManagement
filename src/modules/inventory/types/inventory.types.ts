import type { Product } from '@/modules/sales/types/sales.types'

export type MovementType = 'sale' | 'return' | 'import' | 'adjust-in' | 'adjust-out' | 'initial'

export interface StockMovement {
  id: string
  productId: string
  productName: string
  sku: string
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

export interface InventoryItem extends Product {
  minStockValue: number
  stockValue: number
  level: 'ok' | 'low' | 'out'
  soldLast30: number
  lastMovementAt?: string
  slow: boolean
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
