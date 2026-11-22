import type { Promotion, PromotionScope } from '@/modules/promotions/types/promotions.types'

const at = (days: number, hour = 0, minute = 0) => {
  const d = new Date(Date.now() + days * 86_400_000)
  d.setHours(hour, minute, hour === 23 ? 59 : 0, 0)
  return d.toISOString()
}
const ALL: PromotionScope = { type: 'all', categoryIds: [], productIds: [] }
const base = { description: '', stackable: true, scope: ALL, discountType: 'percent' as const, discountValue: 0 }

export const MOCK_PROMOTIONS: Promotion[] = [
  { ...base, id: 'pr-01', code: 'FOSALE10', name: 'Giảm 10% toàn đơn', kind: 'voucher', discountValue: 10, maxDiscount: 50_000, minOrder: 100_000, usageLimit: 500, state: 'active', startAt: at(-40), endAt: at(38, 23), createdAt: at(-42, 9) },
  { ...base, id: 'pr-02', code: 'GIAM20K', name: 'Giảm 20.000đ', kind: 'voucher', discountType: 'amount', discountValue: 20_000, minOrder: 150_000, usageLimit: 300, state: 'active', startAt: at(-36), endAt: at(38, 23), createdAt: at(-37, 10) },
  { ...base, id: 'pr-03', code: 'KHAITRUONG', name: 'Khai trương giảm 15%', kind: 'voucher', discountValue: 15, maxDiscount: 100_000, minOrder: 300_000, stackable: false, state: 'active', startAt: at(-33), endAt: at(22, 23), createdAt: at(-34, 8) },
  { ...base, id: 'pr-04', code: 'VIP50K', name: 'Ưu đãi khách VIP', kind: 'voucher', discountType: 'amount', discountValue: 50_000, minOrder: 500_000, perCustomerLimit: 1, state: 'active', startAt: at(-30), endAt: at(128, 23), createdAt: at(-31, 14) },
  { ...base, id: 'pr-05', code: 'SUAVIET10', name: 'Giảm 10% hàng sữa', description: 'Hợp tác cùng Nhà phân phối Sữa Việt', kind: 'voucher', discountValue: 10, maxDiscount: 30_000, scope: { type: 'categories', categoryIds: ['dairy'], productIds: [] }, usageLimit: 200, state: 'active', startAt: at(-12), endAt: at(18, 23), createdAt: at(-13, 9) },
  { ...base, id: 'pr-06', code: 'BLACKFRIDAY', name: 'Black Friday giảm 30%', kind: 'voucher', discountValue: 30, maxDiscount: 200_000, state: 'active', startAt: at(-28), endAt: at(-22, 23), createdAt: at(-30, 16) },
  { ...base, id: 'pr-07', code: 'TET2027', name: 'Tết 2027 giảm 8%', kind: 'voucher', discountValue: 8, maxDiscount: 80_000, minOrder: 200_000, usageLimit: 1000, state: 'active', startAt: at(40), endAt: at(70, 23), createdAt: at(-2, 11) },
  { ...base, id: 'pr-08', code: 'NOEL2026', name: 'Giáng sinh tặng 25.000đ', kind: 'voucher', discountType: 'amount', discountValue: 25_000, minOrder: 250_000, state: 'draft', startAt: at(25), endAt: at(33, 23), createdAt: at(-1, 15) },
  { ...base, id: 'pr-09', code: 'KM0009', name: 'Tuần lễ sữa giảm 8%', description: 'Áp dụng tự động cho toàn bộ ngành hàng sữa', kind: 'product', discountValue: 8, scope: { type: 'categories', categoryIds: ['dairy'], productIds: [] }, state: 'active', startAt: at(-6), endAt: at(8, 23), createdAt: at(-7, 10) },
  { ...base, id: 'pr-10', code: 'KM0010', name: 'Xả kho bột giặt giảm 20.000đ', kind: 'product', discountType: 'amount', discountValue: 20_000, scope: { type: 'products', categoryIds: [], productIds: ['p-0027'] }, state: 'active', startAt: at(-15), endAt: at(15, 23), createdAt: at(-15, 8) },
  { ...base, id: 'pr-11', code: 'KM0011', name: 'Bánh kẹo cuối tuần giảm 5%', kind: 'product', discountValue: 5, scope: { type: 'categories', categoryIds: ['snacks'], productIds: [] }, state: 'paused', startAt: at(-20), endAt: at(10, 23), createdAt: at(-21, 9) },
  { ...base, id: 'pr-12', code: 'KM0012', name: 'Đơn từ 300k giảm 15k', kind: 'order', discountType: 'amount', discountValue: 15_000, minOrder: 300_000, state: 'active', startAt: at(-25), endAt: at(35, 23), createdAt: at(-26, 9) },
  { ...base, id: 'pr-13', code: 'KM0013', name: 'Đơn từ 1 triệu giảm 5%', kind: 'order', discountValue: 5, maxDiscount: 100_000, minOrder: 1_000_000, state: 'active', startAt: at(3), endAt: at(33, 23), createdAt: at(-1, 17) },
  { ...base, id: 'pr-14', code: 'KM0014', name: 'Mua 2 mì khoai tây tặng 1', kind: 'gift', buyProductId: 'p-0016', buyQty: 2, giftProductId: 'p-0016', giftQty: 1, state: 'active', startAt: at(-18), endAt: at(12, 23), createdAt: at(-18, 7) },
  { ...base, id: 'pr-15', code: 'KM0015', name: 'Mua dầu gội tặng kem đánh răng', kind: 'gift', buyProductId: 'p-0022', buyQty: 1, giftProductId: 'p-0023', giftQty: 1, usageLimit: 50, state: 'active', startAt: at(-10), endAt: at(20, 23), createdAt: at(-10, 9) },
  { ...base, id: 'pr-16', code: 'KM0016', name: 'Mua 6 Coca tặng 1 Red Bull', kind: 'gift', buyProductId: 'p-0001', buyQty: 6, giftProductId: 'p-0004', giftQty: 1, state: 'ended', startAt: at(-34), endAt: at(5, 23), createdAt: at(-35, 9), updatedAt: at(-14, 18) },
]
