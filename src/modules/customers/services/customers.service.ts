import { http } from '@/lib/http'
import type { AdjustPointsPayload, CustomerFilters, CustomerFormValues, CustomerStatus, CustomerTab, CustomerWithStats, MembershipSettings, PointLog } from '@/modules/customers/types/customers.types'
import type { Customer } from '@/modules/sales/types/sales.types'
import type { OrderSummary } from '@/modules/orders/types/orders.types'

interface Page<T> { items: T[]; total: number; page: number; pageSize: number }
const base = '/api/customers'

export const customersService = {
  list: ({ page, pageSize, keyword, segment, sort, tab }: CustomerFilters & { page: number; pageSize: number }) =>
    http.get<Page<CustomerWithStats> & { tierCounts: Record<CustomerTab, number> }>(base, { params: { page, pageSize, keyword, sort, tier: tab === 'all' ? undefined : tab, segment: segment === 'all' ? undefined : segment } }),
  stats: () => http.get<Record<'total' | 'points' | 'birthday' | 'new30' | 'returning' | 'active30', number>>(base + '/stats'),
  detail: (id: string) => http.get<CustomerWithStats>(base + '/' + id),
  getMembership: () => http.get<MembershipSettings>('/api/membership'),
  saveMembership: (settings: MembershipSettings) => http.put('/api/membership', settings),
  quickCreate: (name: string, phone: string) => http.post<Customer>(base, { name, phone }),
  saveCustomer: (id: string | null, values: CustomerFormValues) => id ? http.patch<CustomerWithStats>(base + '/' + id, values) : http.post<CustomerWithStats>(base, values),
  setStatus: (id: string, status: CustomerStatus) => http.patch<CustomerWithStats>(base + '/' + id + '/status', { status }),
  deleteCustomer: (id: string) => http.delete<void>(base + '/' + id),
  adjustPoints: (id: string, payload: AdjustPointsPayload, key: string) => http.post<{ customer: CustomerWithStats }>(base + '/' + id + '/points', { ...payload, type: payload.reason === 'Đổi quà tại quầy' ? 'redeem' : 'adjust' }, { headers: { 'Idempotency-Key': key } }),
  getOrders: (id: string, page: number) => http.get<Page<OrderSummary>>(base + '/' + id + '/orders', { params: { page, pageSize: 10 } }),
  getPointLogs: (id: string, page: number, type?: PointLog['type']) => http.get<Page<PointLog>>(base + '/' + id + '/points', { params: { page, pageSize: 10, type } }),
  lookup: (params: { phone?: string; code?: string }) => http.get<Customer>(base + '/lookup', { params }),
  searchActive: (q: string) => http.get<Customer[]>(base + '/search', { params: { q, limit: 20 } }),
}
