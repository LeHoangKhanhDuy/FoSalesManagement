import { useEffect, useState } from 'react'
import { customersService } from '@/modules/customers/services/customers.service'
import type { CustomerWithStats, PointLog } from '@/modules/customers/types/customers.types'
import type { LegacyOrder as OrderRecord } from '@/modules/customers/mocks/orders.mock'

export type CustomerDetailTab = 'orders' | 'points'

export function useCustomerDetail(customer: CustomerWithStats | null) {
  const [tab, setTab] = useState<CustomerDetailTab>('orders')
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [logs, setLogs] = useState<PointLog[]>([])
  const [loading, setLoading] = useState(false)
  const id = customer?.id
  const points = customer?.points

  useEffect(() => {
    if (!id) return
    let alive = true
    setLoading(true)
    Promise.all([customersService.getOrders(id), customersService.getPointLogs(id)])
      .then(([o, l]) => {
        if (!alive) return
        setOrders(o)
        setLogs(l)
      })
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [id, points])

  return { tab, setTab, orders, logs, loading }
}
