import type { Voucher } from '@/modules/sales/types/sales.types'

export const MOCK_VOUCHERS: Voucher[] = [
  {
    code: 'FOSALE10',
    name: 'Giảm 10% toàn đơn',
    type: 'percent',
    value: 10,
    maxDiscount: 50_000,
    minOrder: 100_000,
    expiresAt: '2026-12-31',
  },
  { code: 'GIAM20K', name: 'Giảm 20.000đ', type: 'amount', value: 20_000, minOrder: 150_000, expiresAt: '2026-12-31' },
  {
    code: 'KHAITRUONG',
    name: 'Khai trương giảm 15%',
    type: 'percent',
    value: 15,
    maxDiscount: 100_000,
    minOrder: 300_000,
    expiresAt: '2026-12-15',
  },
  { code: 'VIP50K', name: 'Ưu đãi khách VIP', type: 'amount', value: 50_000, minOrder: 500_000, expiresAt: '2027-03-31' },
  { code: 'BLACKFRIDAY', name: 'Black Friday giảm 30%', type: 'percent', value: 30, maxDiscount: 200_000, expiresAt: '2026-11-01' },
]
