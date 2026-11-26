import { USE_MOCK } from '@/lib/constants'
import { http, sleep } from '@/lib/http'
import { MOCK_CUSTOMERS } from '@/modules/customers/mocks/customers.mock'
import { MOCK_MEMBERSHIP } from '@/modules/customers/mocks/membership.mock'
import { addPointLog, MOCK_POINT_LOGS, refreshCustomer } from '@/modules/customers/mocks/points.mock'
import type { AdjustPointsPayload, CustomerFormValues, CustomerProfile, CustomerStatus, CustomerWithStats, MembershipSettings, PointLog } from '@/modules/customers/types/customers.types'
import { computeStats, customerOrders } from '@/modules/customers/utils/customers.utils'
import { MOCK_ORDERS } from '@/modules/customers/mocks/orders.mock'
import type { LegacyOrder as OrderRecord } from '@/modules/customers/mocks/orders.mock'

const withStats = (c: CustomerProfile): CustomerWithStats => ({ ...structuredClone(c), stats: computeStats(customerOrders(MOCK_ORDERS, c.id)) })

const find = (id: string) => {
  const c = MOCK_CUSTOMERS.find((x) => x.id === id)
  if (!c) throw new Error('Không tìm thấy khách hàng')
  return c
}

const clean = (v: CustomerFormValues): CustomerFormValues => ({
  ...v,
  name: v.name.trim().replace(/\s+/g, ' '),
  phone: v.phone.replace(/\D/g, ''),
  email: v.email?.trim().toLowerCase() || undefined,
  address: v.address?.trim() || undefined,
  note: v.note?.trim() || undefined,
})

export const customersService = {
  async getCustomers(): Promise<CustomerWithStats[]> {
    if (!USE_MOCK) return http.get<CustomerWithStats[]>('/api/customers')
    await sleep(300)
    return MOCK_CUSTOMERS.map(withStats)
  },

  async getMembership(): Promise<MembershipSettings> {
    if (!USE_MOCK) return http.get<MembershipSettings>('/api/membership')
    return sleep(150).then(() => structuredClone(MOCK_MEMBERSHIP))
  },

  async saveMembership(settings: MembershipSettings): Promise<CustomerWithStats[]> {
    if (!USE_MOCK) return http.put('/api/membership', settings)
    await sleep(450)
    Object.assign(MOCK_MEMBERSHIP, structuredClone(settings))
    MOCK_CUSTOMERS.forEach(refreshCustomer)
    return MOCK_CUSTOMERS.map(withStats)
  },

  async saveCustomer(id: string | null, values: CustomerFormValues): Promise<CustomerWithStats> {
    if (!USE_MOCK) return id ? http.put(`/api/customers/${id}`, values) : http.post('/api/customers', values)
    await sleep(350)
    const data = clean(values)
    if (MOCK_CUSTOMERS.some((c) => c.id !== id && c.phone === data.phone)) throw new Error('Số điện thoại đã thuộc khách hàng khác')
    let customer: CustomerProfile
    if (id) {
      customer = find(id)
      Object.assign(customer, data)
    } else {
      const max = MOCK_CUSTOMERS.reduce((m, c) => Math.max(m, Number(c.id.replace(/\D/g, '')) || 0), 0)
      customer = { ...data, id: `c-${String(max + 1).padStart(3, '0')}`, tier: 'retail', points: 0, legacySpent: 0, createdAt: new Date().toISOString() }
      MOCK_CUSTOMERS.unshift(customer)
    }
    return withStats(customer)
  },

  async setStatus(id: string, status: CustomerStatus): Promise<CustomerWithStats> {
    if (!USE_MOCK) return http.patch(`/api/customers/${id}/status`, { status })
    await sleep(250)
    const c = find(id)
    c.status = status
    return withStats(c)
  },

  async deleteCustomer(id: string): Promise<void> {
    if (!USE_MOCK) return http.delete(`/api/customers/${id}`)
    await sleep(300)
    if (customerOrders(MOCK_ORDERS, id).length) throw new Error('Khách hàng đã có đơn hàng')
    MOCK_CUSTOMERS.splice(MOCK_CUSTOMERS.findIndex((c) => c.id === id), 1)
  },

  async adjustPoints(id: string, payload: AdjustPointsPayload): Promise<{ customer: CustomerWithStats; log: PointLog }> {
    if (!USE_MOCK) return http.post(`/api/customers/${id}/points`, payload)
    await sleep(350)
    const c = find(id)
    if (payload.points < 0 && c.points + payload.points < 0) throw new Error('Không đủ điểm để trừ')
    const log = addPointLog(c, payload.reason === 'Đổi quà tại quầy' ? 'redeem' : 'adjust', payload.points, { reason: payload.reason })
    return { customer: withStats(c), log }
  },

  async getPointLogs(id: string): Promise<PointLog[]> {
    if (!USE_MOCK) return http.get<PointLog[]>(`/api/customers/${id}/points`)
    await sleep(200)
    return structuredClone(MOCK_POINT_LOGS.filter((l) => l.customerId === id))
  },

  async getOrders(id: string): Promise<OrderRecord[]> {
    if (!USE_MOCK) return http.get<OrderRecord[]>(`/api/customers/${id}/orders`)
    await sleep(200)
    return structuredClone(customerOrders(MOCK_ORDERS, id))
  },

  async searchActive(keyword: string): Promise<CustomerProfile[]> {
    if (!USE_MOCK) return http.get<CustomerProfile[]>('/api/customers', { params: { q: keyword, status: 'active' } })
    await sleep(120)
    const k = keyword.trim().toLowerCase()
    return structuredClone(MOCK_CUSTOMERS.filter((c) => c.status === 'active' && (!k || c.name.toLowerCase().includes(k) || c.phone.includes(k.replace(/\D/g, '') || k))).slice(0, 20))
  },
}
