import type { Category } from '@/modules/sales/types/sales.types'

const createdAt = (day: number) => new Date(Date.UTC(2026, 7, day, 2)).toISOString()

export const MOCK_CATEGORIES: Category[] = [
  { id: 'drinks', name: 'Đồ uống', description: 'Nước ngọt, trà, cà phê, nước suối', icon: 'cup-soda', color: 'sky', status: 'active', sortOrder: 1, createdAt: createdAt(1) },
  { id: 'snacks', name: 'Bánh kẹo', description: 'Bánh quy, snack, kẹo các loại', icon: 'cookie', color: 'amber', status: 'active', sortOrder: 2, createdAt: createdAt(2) },
  { id: 'dairy', name: 'Sữa & chế phẩm', description: 'Sữa tươi, sữa chua, phô mai', icon: 'milk', color: 'indigo', status: 'active', sortOrder: 3, createdAt: createdAt(3) },
  { id: 'instant', name: 'Mì & đồ khô', description: 'Mì gói, phở ăn liền, gạo', icon: 'soup', color: 'orange', status: 'active', sortOrder: 4, createdAt: createdAt(5) },
  { id: 'fruit', name: 'Trái cây', description: 'Trái cây tươi trong nước và nhập khẩu', icon: 'apple', color: 'lime', status: 'active', sortOrder: 5, createdAt: createdAt(8) },
  { id: 'personal', name: 'Chăm sóc cá nhân', description: 'Dầu gội, sữa tắm, kem đánh răng', icon: 'spray-can', color: 'pink', status: 'active', sortOrder: 6, createdAt: createdAt(12) },
  { id: 'household', name: 'Gia dụng', description: 'Nước rửa chén, bột giặt, giấy vệ sinh', icon: 'washing-machine', color: 'teal', status: 'active', sortOrder: 7, createdAt: createdAt(15) },
  { id: 'frozen', name: 'Đồ đông lạnh', description: 'Kem, thực phẩm đông lạnh', icon: 'ice-cream', color: 'violet', status: 'inactive', sortOrder: 8, createdAt: createdAt(20) },
]
