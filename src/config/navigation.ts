import {
  Bot,
  Boxes,
  ChartColumn,
  ChartPie,
  LayoutDashboard,
  Package,
  ReceiptText,
  Settings,
  ShoppingCart,
  Tags,
  TicketPercent,
  TrendingUp,
  Truck,
  Undo2,
  UserRoundCheck,
  Users,
} from 'lucide-react'
import { PATHS } from '@/routes/paths'
import type { NavGroup } from '@/types/navigation'

export const NAVIGATION: NavGroup[] = [
  {
    title: 'Trang chủ',
    items: [
      { label: 'Tổng quan kinh doanh', path: PATHS.dashboard, icon: LayoutDashboard },
      { label: 'Trợ lý AI', path: PATHS.ai, icon: Bot, badge: 'AI' },
    ],
  },
  {
    title: 'Bán hàng',
    items: [
      { label: 'Bán hàng (POS)', path: PATHS.pos, icon: ShoppingCart },
      { label: 'Quản lý đơn hàng', path: PATHS.orders, icon: ReceiptText },
      { label: 'Trả hàng', path: PATHS.returns, icon: Undo2 },
    ],
  },
  {
    title: 'Hàng hóa & Kho',
    items: [
      { label: 'Sản phẩm', path: PATHS.products, icon: Package },
      { label: 'Danh mục', path: PATHS.categories, icon: Tags },
      { label: 'Tồn kho', path: PATHS.inventory, icon: Boxes },
      { label: 'Nhà cung cấp', path: PATHS.suppliers, icon: Truck },
    ],
  },
  {
    title: 'Khách hàng',
    items: [
      { label: 'Khách hàng', path: PATHS.customers, icon: Users },
      { label: 'Khuyến mãi', path: PATHS.promotions, icon: TicketPercent },
    ],
  },
  {
    title: 'Thống kê',
    items: [
      { label: 'Doanh thu', path: PATHS.revenueReport, icon: TrendingUp },
      { label: 'Hàng hóa bán chạy', path: PATHS.productReport, icon: ChartColumn },
      { label: 'Hiệu suất nhân viên', path: PATHS.staffReport, icon: UserRoundCheck },
      { label: 'Báo cáo tổng hợp', path: '/reports', icon: ChartPie },
    ],
  },
  {
    title: 'Hệ thống',
    items: [{ label: 'Cài đặt', path: PATHS.settings, icon: Settings }],
  },
]

export const findNavItem = (pathname: string) => {
  for (const group of NAVIGATION) {
    const item = group.items.find((i) => i.path === pathname)
    if (item) return { group, item }
  }
  return null
}
