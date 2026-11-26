import type { CustomerTier } from '@/modules/sales/types/sales.types'

export type OrderStatus = 'pending' | 'completed' | 'cancelled' | 'partially_refunded' | 'refunded'
export type OrderChannel = 'pos' | 'online'
export type PaymentMethod = 'cash' | 'transfer' | 'card' | 'ewallet' | 'points'
export type RefundMethod = Exclude<PaymentMethod, 'points'>
export type PaymentStatus = 'pending' | 'confirmed' | 'voided'
export type OrderSort = 'newest' | 'oldest' | 'total-desc' | 'total-asc'
export type DateRange = 'today' | 'yesterday' | '7d' | '30d' | 'month' | 'all' | 'custom'

export interface OrderCustomer {
  id: string
  code?: string
  name: string
  phone: string
  tier: CustomerTier
  points: number
}

export interface OrderTotals {
  itemCount: number
  subtotal: number
  productDiscount: number
  orderDiscount: number
  memberDiscount: number
  voucherDiscount: number
  pointsDiscount: number
  discountAmount: number
  total: number
  due: number
}

export interface OrderSummary {
  id: string
  code: string
  status: OrderStatus
  channel: OrderChannel
  createdAt: string
  updatedAt: string
  customer: OrderCustomer | null
  cashier: string
  totals: OrderTotals
  paidAmount: number
  changeAmount: number
  paymentMethod: PaymentMethod
  paymentMethods: PaymentMethod[]
  pendingAmount: number
  voucherCode?: string
  refundedTotal: number
  note?: string
  reason?: string
}

export interface OrderLine {
  id: string
  productId: string
  name: string
  sku: string
  barcode?: string
  unit: string
  categoryId?: string
  image?: string
  price: number
  quantity: number
  productDiscount: number
  allocatedDiscount: number
  netAmount: number
  isGift: boolean
  promotionName?: string
  returnedQty: number
}

export interface OrderPayment {
  id: string
  method: PaymentMethod
  amount: number
  tendered?: number
  reference?: string
  status: PaymentStatus
  confirmedAt?: string
}

export interface OrderPromotion {
  id: string
  code?: string
  name: string
  kind: string
  amount: number
}

export interface OrderReturn {
  id: string
  code: string
  refundTotal: number
  refundMethod: RefundMethod
  reason: string
  createdAt: string
}

export interface OrderDetail extends OrderSummary {
  lines: OrderLine[]
  payments: OrderPayment[]
  promotions: OrderPromotion[]
  returns: OrderReturn[]
  pointsEarned: number
  pointsRedeemed: number
  completedAt?: string
  cancelledAt?: string
}

export type StatusCounts = Record<OrderStatus | 'all', number>

export interface OrderListResult {
  items: OrderSummary[]
  total: number
  page: number
  pageSize: number
  statusCounts: StatusCounts
}

export interface OrderQuery {
  page: number
  pageSize: number
  keyword?: string
  status?: OrderStatus
  from?: string
  to?: string
  payment?: PaymentMethod
  sort: OrderSort
}

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
  refunded: number
  refundedAmount: number
  byMethod: Record<PaymentMethod, number>
}

export interface TodayStats {
  revenue: number
  orders: number
  itemsSold: number
  customers: number
  revenueGrowth: number
  ordersGrowth: number
  itemsSoldGrowth: number
  customersGrowth: number
}

export interface QuoteItem {
  productId: string
  quantity: number
}

export interface QuoteRequest {
  items: QuoteItem[]
  customerId?: string
  voucherCode?: string
  redeemPoints?: number
}

export interface StockWarning {
  productId: string
  available: number
}

export interface OrderQuote {
  totals: OrderTotals
  promotions: OrderPromotion[]
  voucherIssue?: string
  pointsToEarn: number
  maxRedeemPoints: number
  stockWarnings: StockWarning[]
}

export interface PaymentInput {
  method: Exclude<PaymentMethod, 'points'>
  amount: number
  tendered?: number
  reference?: string
  confirmed?: boolean
}

export interface CreateOrderPayload extends QuoteRequest {
  payments: PaymentInput[]
  note?: string
  expectedTotal: number
}

export interface RefundPayload {
  reason: string
  refundMethod: RefundMethod
  refundReference?: string
  note?: string
}

export type OrderAction = 'cancel' | 'refund' | 'confirm'

export interface OrderActionInput {
  reason: string
  reference: string
  refundMethod: RefundMethod
}

export interface ReceiptData {
  store: { name: string; branchName?: string; code?: string; address?: string; phone?: string; taxCode?: string; receiptFooter?: string; returnPolicy?: string }
  order: { code: string; createdAt: string; cashier: string; status: OrderStatus; note?: string; printCount: number }
  customer: { name: string; maskedPhone: string; tierLabel?: string; pointsEarned: number; pointsBalance: number } | null
  lines: { name: string; unit: string; quantity: number; price: number; amount: number; productDiscount: number; promoName?: string; isGift: boolean }[]
  summary: {
    itemCount: number
    subtotal: number
    productDiscount: number
    orderPromos: { name: string; amount: number }[]
    voucher: { code: string; amount: number } | null
    memberDiscount: { label: string; percent: number; amount: number } | null
    pointsDiscount: number
    total: number
    vatIncluded: number
  }
  payments: { method: PaymentMethod; label: string; amount: number; tendered?: number; change?: number; reference?: string }[]
  changeAmount: number
  barcode: string
}
