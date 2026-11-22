import type { Order, PaymentMethod } from '@/modules/sales/types/sales.types'

export type OrderStatus = 'completed' | 'pending' | 'cancelled' | 'refunded'
export type OrderChannel = 'pos' | 'online'

export interface OrderRecord extends Order {
  status: OrderStatus
  channel: OrderChannel
  reason?: string
  updatedAt?: string
}

export type DateRange = 'today' | 'yesterday' | '7d' | '30d' | 'month' | 'all' | 'custom'
export type OrderSort = 'newest' | 'oldest' | 'total-desc' | 'total-asc'

export interface OrderFilters {
  keyword: string
  status: OrderStatus | 'all'
  range: DateRange
  dateFrom?: Date
  dateTo?: Date
  payment: PaymentMethod | 'all'
  sort: OrderSort
}

export interface OrderStats {
  revenue: number
  orders: number
  avgOrderValue: number
  pending: number
  pendingAmount: number
  cancelled: number
  cancelledAmount: number
}

export type OrderAction = 'cancel' | 'refund'
