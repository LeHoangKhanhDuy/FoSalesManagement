export type PromotionKind = 'voucher' | 'product' | 'order' | 'gift'
export type DiscountType = 'percent' | 'amount'
export type PromotionState = 'draft' | 'active' | 'paused' | 'ended'
export type PromotionStatus = 'draft' | 'scheduled' | 'running' | 'paused' | 'ended'
export type ScopeType = 'all' | 'categories' | 'products'

export interface PromotionScope {
  type: ScopeType
  categoryIds: string[]
  productIds: string[]
}

export interface Promotion {
  id: string
  code: string
  name: string
  description?: string
  kind: PromotionKind
  discountType: DiscountType
  discountValue: number
  maxDiscount?: number
  minOrder?: number
  scope: PromotionScope
  buyProductId?: string
  buyQty?: number
  giftProductId?: string
  giftQty?: number
  usageLimit?: number
  perCustomerLimit?: number
  stackable: boolean
  state: PromotionState
  startAt: string
  endAt?: string
  createdAt: string
  updatedAt?: string
}

export interface PromotionUsage {
  count: number
  discount: number
  revenue: number
  last30Count: number
  last30Discount: number
  lastUsedAt?: string
}

export type PromotionWithUsage = Promotion & { usage: PromotionUsage }

export type PromotionTab = PromotionStatus | 'all'
export type PromotionSort = 'newest' | 'ending' | 'usage'

export interface PromotionFilters {
  keyword: string
  tab: PromotionTab
  kind: PromotionKind | 'all'
  sort: PromotionSort
}

export type PromotionFormValues = Omit<Promotion, 'id' | 'state' | 'createdAt' | 'updatedAt'>
