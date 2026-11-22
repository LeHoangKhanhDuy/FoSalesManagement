import type { Customer, CustomerTier } from '@/modules/sales/types/sales.types'

export type Gender = 'male' | 'female' | 'other'
export type CustomerStatus = 'active' | 'blocked'

export interface CustomerProfile extends Customer {
  email?: string
  gender?: Gender
  birthday?: string
  address?: string
  note?: string
  status: CustomerStatus
  legacySpent: number
  createdAt: string
}

export interface TierConfig {
  tier: CustomerTier
  label: string
  minSpent: number
  discountPercent: number
  pointMultiplier: number
  perks: string
}

export interface MembershipSettings {
  amountPerPoint: number
  pointValue: number
  tiers: TierConfig[]
}

export type PointLogType = 'opening' | 'earn' | 'revoke' | 'adjust' | 'redeem'

export interface PointLog {
  id: string
  customerId: string
  type: PointLogType
  points: number
  balance: number
  refCode?: string
  reason?: string
  createdAt: string
  createdBy: string
}

export interface CustomerStats {
  spent: number
  orders: number
  avgOrder: number
  lastOrderAt?: string
  firstOrderAt?: string
  orders30: number
}

export type CustomerWithStats = CustomerProfile & { stats: CustomerStats }

export type CustomerTab = CustomerTier | 'all'
export type CustomerSort = 'newest' | 'spent' | 'points' | 'recent' | 'name'
export type CustomerSegment = 'all' | 'birthday' | 'inactive60' | 'new30' | 'blocked'

export interface CustomerFilters {
  keyword: string
  tab: CustomerTab
  segment: CustomerSegment
  sort: CustomerSort
}

export type CustomerFormValues = Pick<CustomerProfile, 'name' | 'phone' | 'email' | 'gender' | 'birthday' | 'address' | 'note' | 'status'>

export interface AdjustPointsPayload {
  points: number
  reason: string
}
