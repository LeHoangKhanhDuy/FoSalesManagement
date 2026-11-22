import type { CustomerProfile } from '@/modules/customers/types/customers.types'

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString()

export const MOCK_CUSTOMERS: CustomerProfile[] = [
  { id: 'c-001', name: 'Nguyễn Minh Anh', phone: '0901234567', tier: 'retail', points: 0, gender: 'female', birthday: '1979-11-11', email: 'minhanh@gmail.com', address: 'Q.1, TP.HCM', status: 'active', legacySpent: 3200000, createdAt: daysAgo(301) },
  { id: 'c-002', name: 'Trần Quốc Bảo', phone: '0912345678', tier: 'retail', points: 0, gender: 'male', birthday: '1976-02-27', address: 'Q.1, TP.HCM', status: 'active', legacySpent: 900000, createdAt: daysAgo(293) },
  { id: 'c-003', name: 'Lê Thu Hà', phone: '0987654321', tier: 'retail', points: 0, gender: 'female', birthday: '1972-09-07', email: 'thuha@gmail.com', address: 'Q. Tân Bình, TP.HCM', status: 'active', legacySpent: 9500000, createdAt: daysAgo(222) },
  { id: 'c-004', name: 'Phạm Gia Huy', phone: '0934567890', tier: 'retail', points: 0, gender: 'male', birthday: '1985-07-03', email: 'giahuy@gmail.com', address: 'Q. Tân Bình, TP.HCM', status: 'active', legacySpent: 0, createdAt: daysAgo(223) },
  { id: 'c-005', name: 'Võ Ngọc Trâm', phone: '0978123456', tier: 'retail', points: 0, gender: 'female', birthday: '1977-01-27', address: 'Q.1, TP.HCM', status: 'active', legacySpent: 4100000, createdAt: daysAgo(257) },
  { id: 'c-006', name: 'Đặng Hoàng Long', phone: '0868987654', tier: 'retail', points: 0, gender: 'male', birthday: '1995-11-19', email: 'hoanglong@gmail.com', address: 'Q. Bình Thạnh, TP.HCM', status: 'active', legacySpent: 1600000, createdAt: daysAgo(212) },
  { id: 'c-007', name: 'Bùi Thanh Tâm', phone: '0908246281', tier: 'retail', points: 0, gender: 'female', birthday: '1981-10-10', email: 'thanhtam@gmail.com', address: 'Q. Bình Thạnh, TP.HCM', status: 'active', legacySpent: 250000, createdAt: daysAgo(62) },
  { id: 'c-008', name: 'Hoàng Đức Thịnh', phone: '0951819093', tier: 'retail', points: 0, gender: 'male', birthday: '1997-08-22', note: 'Khách sỉ, hay mua theo thùng', status: 'active', legacySpent: 7200000, createdAt: daysAgo(170) },
  { id: 'c-009', name: 'Ngô Phương Linh', phone: '0997543231', tier: 'retail', points: 0, gender: 'female', birthday: '2001-10-10', email: 'phuonglinh@gmail.com', status: 'active', legacySpent: 1100000, createdAt: daysAgo(185) },
  { id: 'c-010', name: 'Đỗ Văn Khánh', phone: '0949118625', tier: 'retail', points: 0, gender: 'male', birthday: '1996-03-16', email: 'vankhanh@gmail.com', address: 'Q.3, TP.HCM', status: 'active', legacySpent: 0, createdAt: daysAgo(30) },
  { id: 'c-011', name: 'Huỳnh Mỹ Duyên', phone: '0989555979', tier: 'retail', points: 0, gender: 'female', birthday: '1999-11-26', address: 'Q.3, TP.HCM', status: 'active', legacySpent: 2900000, createdAt: daysAgo(45) },
  { id: 'c-012', name: 'Phan Tuấn Kiệt', phone: '0947104974', tier: 'retail', points: 0, gender: 'male', birthday: '1992-12-13', email: 'tuankiet@gmail.com', status: 'active', legacySpent: 500000, createdAt: daysAgo(21) },
  { id: 'c-013', name: 'Vũ Hải Yến', phone: '0952917034', tier: 'retail', points: 0, gender: 'female', birthday: '1985-03-24', email: 'haiyen@gmail.com', address: 'Q. Tân Bình, TP.HCM', note: 'Thường giao hàng tận nhà', status: 'active', legacySpent: 12800000, createdAt: daysAgo(213) },
  { id: 'c-014', name: 'Trương Minh Quân', phone: '0971276842', tier: 'retail', points: 0, gender: 'male', birthday: '1987-07-28', address: 'Q. Tân Bình, TP.HCM', status: 'active', legacySpent: 180000, createdAt: daysAgo(371) },
  { id: 'c-015', name: 'Lý Bảo Ngọc', phone: '0956321223', tier: 'retail', points: 0, gender: 'female', birthday: '1970-11-08', email: 'baongoc@gmail.com', address: 'Q.7, TP.HCM', status: 'active', legacySpent: 0, createdAt: daysAgo(258) },
  { id: 'c-016', name: 'Mai Xuân Trường', phone: '0944026859', tier: 'retail', points: 0, gender: 'male', birthday: '1990-11-19', email: 'xuantruong@gmail.com', address: 'Q.1, TP.HCM', status: 'active', legacySpent: 3600000, createdAt: daysAgo(74) },
  { id: 'c-017', name: 'Đinh Khánh Vy', phone: '0978666617', tier: 'retail', points: 0, gender: 'female', birthday: '1973-11-13', address: 'Q.3, TP.HCM', status: 'active', legacySpent: 700000, createdAt: daysAgo(107) },
  { id: 'c-018', name: 'Tạ Công Danh', phone: '0937215901', tier: 'retail', points: 0, gender: 'male', birthday: '1979-01-19', email: 'congdanh@gmail.com', address: 'Q.3, TP.HCM', status: 'blocked', legacySpent: 0, createdAt: daysAgo(284) },
  { id: 'c-019', name: 'Lâm Gia Hân', phone: '0959013962', tier: 'retail', points: 0, gender: 'female', birthday: '1992-11-09', email: 'giahan@gmail.com', address: 'TP. Thủ Đức', status: 'active', legacySpent: 5400000, createdAt: daysAgo(318) },
  { id: 'c-020', name: 'Châu Nhật Nam', phone: '0971177774', tier: 'retail', points: 0, gender: 'male', birthday: '1976-02-05', address: 'TP. Thủ Đức', status: 'active', legacySpent: 90000, createdAt: daysAgo(393) },
  { id: 'c-021', name: 'Kiều Thảo My', phone: '0947280385', tier: 'retail', points: 0, gender: 'female', birthday: '1971-11-05', email: 'thaomy@gmail.com', address: 'Q. Phú Nhuận, TP.HCM', status: 'active', legacySpent: 1500000, createdAt: daysAgo(398) },
  { id: 'c-022', name: 'Hồ Quang Vinh', phone: '0914852538', tier: 'retail', points: 0, gender: 'male', birthday: '2002-09-25', email: 'quangvinh@gmail.com', address: 'Q. Bình Thạnh, TP.HCM', status: 'active', legacySpent: 0, createdAt: daysAgo(9) },
  { id: 'c-023', name: 'Dương Tú Anh', phone: '0936338750', tier: 'retail', points: 0, gender: 'female', birthday: '1987-01-26', address: 'Q. Phú Nhuận, TP.HCM', status: 'active', legacySpent: 2200000, createdAt: daysAgo(251) },
  { id: 'c-024', name: 'Cao Thành Đạt', phone: '0939575513', tier: 'retail', points: 0, gender: 'male', birthday: '2000-02-08', email: 'thanhdat@gmail.com', address: 'Q. Bình Thạnh, TP.HCM', status: 'active', legacySpent: 0, createdAt: daysAgo(12) },
]
