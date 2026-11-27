import { useState } from 'react'
import { useQuery } from '@/hooks/useQuery'
import { customersService } from '@/modules/customers/services/customers.service'
import type { CustomerWithStats, PointLog } from '@/modules/customers/types/customers.types'

export type CustomerDetailTab = 'orders' | 'points'

export function useCustomerDetail(customer: CustomerWithStats | null) {
  const [tab, select] = useState<CustomerDetailTab>('orders')
  const [page, setPage] = useState(1)
  const [type, setType] = useState<PointLog['type']>()
  const params = { id: customer?.id ?? '', page, balance: customer?.points }
  const orders = useQuery(({ id, page }) => customersService.getOrders(id, page), params, { enabled: !!customer && tab === 'orders' })
  const logs = useQuery(({ id, page, type }) => customersService.getPointLogs(id, page, type), { ...params, type }, { enabled: !!customer && tab === 'points' })
  const active = tab === 'orders' ? orders : logs
  return { tab, setTab: (next: CustomerDetailTab) => { select(next); setPage(1) }, page, setPage, type,
    filter: (value?: PointLog['type']) => { setType(value); setPage(1) },
    orders: orders.data?.items ?? [], logs: logs.data?.items ?? [], total: active.data?.total ?? 0, loading: active.loading, error: active.error }
}
