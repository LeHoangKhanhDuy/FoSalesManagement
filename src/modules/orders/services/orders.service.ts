import { USE_MOCK } from '@/lib/constants'
import { http, sleep } from '@/lib/http'
import { earnOrderPoints, revokeOrderPoints } from '@/modules/customers/mocks/points.mock'
import { MOCK_ORDERS } from '@/modules/orders/mocks/orders.mock'
import type { OrderRecord, OrderStatus } from '@/modules/orders/types/orders.types'

const updateMock = (id: string, status: OrderStatus, patch: Partial<OrderRecord> = {}) => {
  const order = MOCK_ORDERS.find((o) => o.id === id)
  if (!order) throw new Error('Không tìm thấy đơn hàng')
  Object.assign(order, { status, updatedAt: new Date().toISOString(), ...patch })
  return { ...order }
}

export const ordersService = {
  async getOrders(): Promise<OrderRecord[]> {
    if (USE_MOCK) return sleep(450).then(() => MOCK_ORDERS.map((o) => ({ ...o })))
    return http.get<OrderRecord[]>('/api/orders')
  },

  async cancelOrder(id: string, reason: string): Promise<OrderRecord> {
    if (USE_MOCK) return sleep(500).then(() => updateMock(id, 'cancelled', { reason }))
    return http.post<OrderRecord>(`/api/orders/${id}/cancel`, { reason })
  },

  async refundOrder(id: string, reason: string): Promise<OrderRecord> {
    if (USE_MOCK) {
      await sleep(500)
      const updated = updateMock(id, 'refunded', { reason })
      revokeOrderPoints(updated)
      return updated
    }
    return http.post<OrderRecord>(`/api/orders/${id}/refund`, { reason })
  },

  async confirmPayment(id: string): Promise<OrderRecord> {
    if (USE_MOCK) {
      await sleep(400)
      const order = MOCK_ORDERS.find((o) => o.id === id)
      const updated = updateMock(id, 'completed', { paidAmount: order?.totals.total ?? 0 })
      earnOrderPoints({ ...updated, createdAt: new Date().toISOString() })
      return updated
    }
    return http.post<OrderRecord>(`/api/orders/${id}/confirm-payment`)
  },
}
