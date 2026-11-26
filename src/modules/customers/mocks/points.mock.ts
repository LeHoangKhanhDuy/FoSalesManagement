import { MOCK_CUSTOMERS } from '@/modules/customers/mocks/customers.mock'
import { MOCK_MEMBERSHIP } from '@/modules/customers/mocks/membership.mock'
import type { CustomerProfile, PointLog, PointLogType } from '@/modules/customers/types/customers.types'
import { calcEarnedPoints, computeStats, customerOrders, resolveTier, totalSpent } from '@/modules/customers/utils/customers.utils'
import { MOCK_ORDERS } from '@/modules/customers/mocks/orders.mock'

export const MOCK_POINT_LOGS: PointLog[] = []

export const refreshCustomer = (c: CustomerProfile) => {
  c.tier = resolveTier(MOCK_MEMBERSHIP, totalSpent(c, computeStats(customerOrders(MOCK_ORDERS, c.id))))
}

export const addPointLog = (c: CustomerProfile, type: PointLogType, points: number, extra: Partial<Pick<PointLog, 'refCode' | 'reason' | 'createdAt' | 'createdBy'>> = {}) => {
  c.points = Math.max(0, c.points + points)
  const log: PointLog = {
    id: `pt-${crypto.randomUUID().slice(0, 8)}`,
    customerId: c.id,
    type,
    points,
    balance: c.points,
    createdAt: new Date().toISOString(),
    createdBy: 'Khánh Duy',
    ...extra,
  }
  MOCK_POINT_LOGS.unshift(log)
  return log
}

const seed = () => {
  for (const c of MOCK_CUSTOMERS) {
    c.points = 0
    c.tier = resolveTier(MOCK_MEMBERSHIP, c.legacySpent)
    if (c.legacySpent > 0) addPointLog(c, 'opening', Math.floor(c.legacySpent / MOCK_MEMBERSHIP.amountPerPoint), { createdAt: c.createdAt, reason: 'Chuyển điểm từ hệ thống cũ', createdBy: 'Hệ thống' })
    const orders = customerOrders(MOCK_ORDERS, c.id).filter((o) => o.status === 'completed' || o.status === 'refunded').sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    let spent = c.legacySpent
    for (const o of orders) {
      const pts = calcEarnedPoints(MOCK_MEMBERSHIP, c.tier, o.totals.total)
      if (pts > 0) addPointLog(c, 'earn', pts, { refCode: o.code, createdAt: o.createdAt, createdBy: o.cashier })
      if (o.status === 'refunded' && pts > 0) addPointLog(c, 'revoke', -pts, { refCode: o.code, reason: 'Hoàn tiền đơn hàng', createdAt: o.updatedAt ?? o.createdAt, createdBy: o.cashier })
      if (o.status === 'completed') spent += o.totals.total
      c.tier = resolveTier(MOCK_MEMBERSHIP, spent)
    }
  }
  const bonus = MOCK_CUSTOMERS.filter((c) => c.status === 'active' && c.birthday?.slice(5, 7) === String(new Date().getMonth() + 1).padStart(2, '0')).slice(0, 2)
  bonus.forEach((c) => addPointLog(c, 'adjust', 100, { reason: 'Tặng điểm sinh nhật', createdAt: new Date(Date.now() - 2 * 86_400_000).toISOString() }))
  MOCK_POINT_LOGS.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

seed()
