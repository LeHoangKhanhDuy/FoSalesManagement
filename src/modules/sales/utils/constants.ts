import type { CustomerTier, PaymentMethod } from '@/modules/sales/types/sales.types'

export const MAX_INVOICES = 8

export const TIER_LABEL: Record<CustomerTier, { label: string; tone: 'neutral' | 'info' | 'warning' | 'violet' }> = {
  retail: { label: 'Thành viên', tone: 'neutral' },
  silver: { label: 'Bạc', tone: 'info' },
  gold: { label: 'Vàng', tone: 'warning' },
  diamond: { label: 'Kim cương', tone: 'violet' },
}

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  cash: 'Tiền mặt',
  transfer: 'Chuyển khoản',
  card: 'Thẻ',
  ewallet: 'Ví điện tử',
}

export const LOW_STOCK_THRESHOLD = 10
