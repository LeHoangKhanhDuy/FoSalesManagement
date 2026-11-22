import type { Unit } from '@/modules/categories/types/categories.types'

const units: [string, string][] = [
  ['Cái', 'Đơn vị đếm chung'],
  ['Chai', 'Đồ uống, dầu gội đóng chai'],
  ['Lon', 'Nước ngọt, bia đóng lon'],
  ['Hộp', 'Sữa, bánh đóng hộp'],
  ['Gói', 'Mì, snack, bánh dạng gói'],
  ['Lốc', 'Nhiều sản phẩm đóng chung'],
  ['Túi', 'Gạo, bột giặt dạng túi'],
  ['Hũ', 'Kẹo, gia vị dạng hũ'],
  ['Tuýp', 'Kem đánh răng, sữa rửa mặt'],
  ['Kg', 'Hàng cân ký: trái cây, thịt'],
  ['Thùng', 'Hàng nguyên thùng'],
]

export const MOCK_UNITS: Unit[] = units.map(([name, description], i) => ({
  id: `u-${String(i + 1).padStart(3, '0')}`,
  name,
  description,
  createdAt: new Date(Date.UTC(2026, 7, 1 + i, 2)).toISOString(),
}))
