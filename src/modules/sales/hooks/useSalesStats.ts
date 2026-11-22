import { useCallback, useEffect, useState } from 'react'
import { salesService } from '@/modules/sales/services/sales.service'
import type { Order, SalesStats } from '@/modules/sales/types/sales.types'

export function useSalesStats() {
  const [stats, setStats] = useState<SalesStats | null>(null)

  useEffect(() => {
    salesService.getTodayStats().then(setStats)
  }, [])

  const applyOrder = useCallback((order: Order) => {
    setStats((s) =>
      s
        ? {
            ...s,
            revenue: s.revenue + order.totals.total,
            orders: s.orders + 1,
            itemsSold: s.itemsSold + order.totals.itemCount,
            customers: order.customer ? s.customers + 1 : s.customers,
          }
        : s,
    )
  }, [])

  return { stats, applyOrder }
}
