import { USE_MOCK } from '@/lib/constants'
import { http, sleep } from '@/lib/http'
import { MOCK_ORDERS } from '@/modules/customers/mocks/orders.mock'
import type { LegacyOrder as OrderRecord } from '@/modules/customers/mocks/orders.mock'
import { MOCK_PROMOTIONS } from '@/modules/promotions/mocks/promotions.mock'
import type { Promotion, PromotionFormValues, PromotionState, PromotionUsage, PromotionWithUsage } from '@/modules/promotions/types/promotions.types'
import { EMPTY_USAGE, getPromotionStatus, isAutoKind, toVoucher } from '@/modules/promotions/utils/promotions.utils'
import type { Voucher } from '@/modules/sales/types/sales.types'

const DAY = 86_400_000
const now = () => new Date().toISOString()

const usedOrders = (id: string) => MOCK_ORDERS.filter((o) => o.status !== 'cancelled' && o.promotions?.some((p) => p.id === id))

const usageOf = (id: string): PromotionUsage => {
  const since = Date.now() - 30 * DAY
  return usedOrders(id).reduce<PromotionUsage>((u, o) => {
    const amount = o.promotions?.find((p) => p.id === id)?.amount ?? 0
    const recent = new Date(o.createdAt).getTime() >= since
    return {
      count: u.count + 1,
      discount: u.discount + amount,
      revenue: u.revenue + o.totals.total,
      last30Count: u.last30Count + (recent ? 1 : 0),
      last30Discount: u.last30Discount + (recent ? amount : 0),
      lastUsedAt: !u.lastUsedAt || o.createdAt > u.lastUsedAt ? o.createdAt : u.lastUsedAt,
    }
  }, { ...EMPTY_USAGE })
}

const find = (id: string) => {
  const p = MOCK_PROMOTIONS.find((x) => x.id === id)
  if (!p) throw new Error('Không tìm thấy chương trình khuyến mãi')
  return p
}

const clean = (v: PromotionFormValues): PromotionFormValues => ({
  ...v,
  code: v.code.trim().toUpperCase(),
  name: v.name.trim(),
  description: v.description?.trim(),
  maxDiscount: v.discountType === 'percent' ? v.maxDiscount || undefined : undefined,
  minOrder: v.minOrder || undefined,
  usageLimit: v.usageLimit || undefined,
  perCustomerLimit: v.kind === 'voucher' ? v.perCustomerLimit || undefined : undefined,
})

const nextAutoCode = () => `KM${String(MOCK_PROMOTIONS.reduce((m, p) => Math.max(m, /^KM\d+$/.test(p.code) ? Number(p.code.slice(2)) : 0), 0) + 1).padStart(4, '0')}`

export const promotionsService = {
  async getPromotions(): Promise<PromotionWithUsage[]> {
    if (!USE_MOCK) return http.get<PromotionWithUsage[]>('/api/promotions')
    await sleep(300)
    return MOCK_PROMOTIONS.map((p) => ({ ...structuredClone(p), usage: usageOf(p.id) }))
  },

  async getRunningAuto(): Promise<Promotion[]> {
    if (!USE_MOCK) return http.get<Promotion[]>('/api/promotions/running')
    await sleep(150)
    return structuredClone(MOCK_PROMOTIONS.filter((p) => isAutoKind(p.kind) && getPromotionStatus(p, usageOf(p.id).count) === 'running'))
  },

  async getOrdersOf(id: string): Promise<OrderRecord[]> {
    if (!USE_MOCK) return http.get<OrderRecord[]>(`/api/promotions/${id}/orders`)
    await sleep(200)
    return structuredClone(usedOrders(id).slice(0, 30))
  },

  async validateVoucher(code: string, customerId: string | null): Promise<Voucher> {
    if (!USE_MOCK) return http.post<Voucher>('/api/promotions/vouchers/validate', { code, customerId })
    await sleep(300)
    const p = MOCK_PROMOTIONS.find((x) => x.kind === 'voucher' && x.code === code.trim().toUpperCase())
    if (!p || p.state === 'draft') throw new Error('Mã giảm giá không tồn tại')
    const usage = usageOf(p.id)
    const status = getPromotionStatus(p, usage.count)
    if (status === 'scheduled') throw new Error(`Mã áp dụng từ ${new Date(p.startAt).toLocaleDateString('vi-VN')}`)
    if (status === 'paused') throw new Error('Mã giảm giá đang tạm dừng')
    if (status === 'ended') throw new Error(p.usageLimit && usage.count >= p.usageLimit ? 'Mã giảm giá đã hết lượt sử dụng' : 'Mã giảm giá đã hết hạn')
    if (p.perCustomerLimit) {
      if (!customerId) throw new Error('Mã chỉ dành cho khách thành viên, hãy chọn khách hàng trước')
      const used = usedOrders(p.id).filter((o) => o.customer?.id === customerId).length
      if (used >= p.perCustomerLimit) throw new Error(`Khách đã dùng hết ${p.perCustomerLimit} lượt của mã này`)
    }
    return toVoucher(p)
  },

  async savePromotion(id: string | null, values: PromotionFormValues, activate: boolean): Promise<PromotionWithUsage> {
    if (!USE_MOCK) return id ? http.put(`/api/promotions/${id}`, { ...values, activate }) : http.post('/api/promotions', { ...values, activate })
    await sleep(400)
    const data = clean(values)
    if (MOCK_PROMOTIONS.some((p) => p.id !== id && p.code === data.code)) throw new Error('Mã chương trình đã tồn tại')
    let promo: Promotion
    if (id) {
      promo = find(id)
      Object.assign(promo, data, { updatedAt: now() }, activate && promo.state === 'draft' ? { state: 'active' } : {})
    } else {
      promo = { ...data, code: data.code || nextAutoCode(), id: `pr-${crypto.randomUUID().slice(0, 8)}`, state: activate ? 'active' : 'draft', createdAt: now() }
      MOCK_PROMOTIONS.unshift(promo)
    }
    return { ...structuredClone(promo), usage: usageOf(promo.id) }
  },

  async setState(id: string, state: PromotionState): Promise<PromotionWithUsage> {
    if (!USE_MOCK) return http.patch(`/api/promotions/${id}/state`, { state })
    await sleep(250)
    const promo = find(id)
    Object.assign(promo, { state, updatedAt: now() })
    return { ...structuredClone(promo), usage: usageOf(id) }
  },

  async deletePromotion(id: string): Promise<void> {
    if (!USE_MOCK) return http.delete(`/api/promotions/${id}`)
    await sleep(300)
    if (usedOrders(id).length) throw new Error('Chương trình đã phát sinh đơn hàng')
    MOCK_PROMOTIONS.splice(MOCK_PROMOTIONS.findIndex((p) => p.id === id), 1)
  },

  nextAutoCode,
}

export const getRunningAutoSync = () => MOCK_PROMOTIONS.filter((p) => isAutoKind(p.kind) && getPromotionStatus(p, usageOf(p.id).count) === 'running')
