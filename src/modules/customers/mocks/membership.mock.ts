import type { MembershipSettings } from '@/modules/customers/types/customers.types'

export const MOCK_MEMBERSHIP: MembershipSettings = {
  amountPerPoint: 10_000,
  pointValue: 100,
  tiers: [
    { tier: 'retail', label: 'Thành viên', minSpent: 0, discountPercent: 0, pointMultiplier: 1, perks: 'Tích điểm mọi hóa đơn' },
    { tier: 'silver', label: 'Bạc', minSpent: 1_000_000, discountPercent: 2, pointMultiplier: 1.2, perks: 'Giảm 2% mỗi hóa đơn, x1.2 điểm' },
    { tier: 'gold', label: 'Vàng', minSpent: 3_000_000, discountPercent: 3, pointMultiplier: 1.5, perks: 'Giảm 3% mỗi hóa đơn, x1.5 điểm, quà sinh nhật' },
    { tier: 'diamond', label: 'Kim cương', minSpent: 8_000_000, discountPercent: 5, pointMultiplier: 2, perks: 'Giảm 5% mỗi hóa đơn, x2 điểm, quà sinh nhật, ưu tiên giao hàng' },
  ],
}
