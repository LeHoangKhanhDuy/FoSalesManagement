import type { AuthUser } from '@/modules/auth/types/auth.types'

export const MOCK_USERS: (AuthUser & { password: string })[] = [
  { id: 'u-001', username: 'admin', phone: '0909000111', name: 'Khánh Duy', role: 'admin', storeId: 'hcm-01', password: '123456' },
  { id: 'u-002', username: 'quanly', phone: '0909000222', name: 'Quốc Huy', role: 'manager', storeId: 'hcm-01', password: '123456' },
  { id: 'u-003', username: 'thungan', phone: '0909000333', name: 'Minh Thư', role: 'cashier', storeId: 'hcm-01', password: '123456' },
]
