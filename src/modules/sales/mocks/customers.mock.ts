import type { Customer } from '@/modules/sales/types/sales.types'

export const MOCK_CUSTOMERS: Customer[] = [
  { id: 'c-001', name: 'Nguyễn Minh Anh', phone: '0901234567', tier: 'gold', points: 1280 },
  { id: 'c-002', name: 'Trần Quốc Bảo', phone: '0912345678', tier: 'silver', points: 420 },
  { id: 'c-003', name: 'Lê Thu Hà', phone: '0987654321', tier: 'diamond', points: 5630 },
  { id: 'c-004', name: 'Phạm Gia Huy', phone: '0934567890', tier: 'retail', points: 60 },
  { id: 'c-005', name: 'Võ Ngọc Trâm', phone: '0978123456', tier: 'gold', points: 2210 },
  { id: 'c-006', name: 'Đặng Hoàng Long', phone: '0868987654', tier: 'silver', points: 735 },
]
