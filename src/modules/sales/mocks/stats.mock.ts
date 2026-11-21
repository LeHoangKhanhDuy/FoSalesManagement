import type { SalesStats } from '@/modules/sales/types/sales.types'

export const MOCK_TODAY_STATS: SalesStats = {
  revenue: 12_486_000,
  revenueGrowth: 12.4,
  orders: 86,
  ordersGrowth: 8.1,
  itemsSold: 342,
  itemsSoldGrowth: -3.2,
  customers: 54,
  customersGrowth: 5.6,
}
