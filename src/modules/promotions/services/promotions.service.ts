import { http } from '@/lib/http'
import type { PromotionFilters, PromotionFormValues, PromotionState, PromotionTab, PromotionWithUsage } from '@/modules/promotions/types/promotions.types'
import type { Voucher } from '@/modules/sales/types/sales.types'

const base = '/api/promotions'
interface Page<T> { items: T[]; page: number; pageSize: number; total: number }
interface Redemption {
  id: string
  orderCode: string
  customer: { name: string } | null
  discount: number
  revenue: number
  createdAt: string
  revokedAt: string | null
}

type List = Page<PromotionWithUsage> & { statusCounts: Record<PromotionTab, number> }
const list = ({ page, pageSize, keyword, kind, tab, sort }: PromotionFilters & { page: number; pageSize: number }) =>
  http.get<List>(base, { params: { page, pageSize, keyword, kind: kind === 'all' ? undefined : kind, status: tab === 'all' ? undefined : tab, sort } })

async function stats() {
  const result = { running: 0, scheduled: 0, uses30: 0, discount30: 0, vouchersRunning: 0 }
  for (let page = 1; ; page++) {
    const batch = await list({ page, pageSize: 100, keyword: '', kind: 'all', tab: 'all', sort: 'newest' })
    result.running = batch.statusCounts.running
    result.scheduled = batch.statusCounts.scheduled
    for (const promo of batch.items) {
      result.uses30 += promo.usage.last30Count
      result.discount30 += promo.usage.last30Discount
      if (promo.kind === 'voucher' && promo.status === 'running') result.vouchersRunning++
    }
    if (!batch.items.length || page * batch.pageSize >= batch.total) return result
  }
}

export const promotionsService = {
  list,
  stats,
  detail: (id: string) => http.get<PromotionWithUsage>(base + '/' + id),
  generateCode: () => http.get<{ code: string }>(base + '/generate-code', { params: { prefix: 'FOTECH' } }),
  redemptions: ({ id, page }: { id: string; page: number }) => http.get<Page<Redemption>>(base + '/' + id + '/redemptions', { params: { page, pageSize: 10 } }),
  validateVoucher: (code: string, customerId: string | null, cartTotal: number) =>
    http.post<Voucher>(base + '/vouchers/validate', { code, customerId: customerId ?? undefined, cartTotal }),
  savePromotion: (id: string | null, v: PromotionFormValues, activate: boolean) => {
    const body = {
      code: v.code, name: v.name, description: v.description || null, scope: v.scope, discountType: v.discountType,
      discountValue: v.discountValue, maxDiscount: v.maxDiscount ?? null, minOrder: v.minOrder ?? null,
      usageLimit: v.usageLimit ?? null, perCustomerLimit: v.perCustomerLimit ?? null,
      startAt: v.startAt, endAt: v.endAt || null, stackable: v.stackable, activate,
    }
    return id ? http.patch<PromotionWithUsage>(base + '/' + id, body) : http.post<PromotionWithUsage>(base, { ...body, kind: v.kind })
  },
  setState: (id: string, state: PromotionState) => http.patch(base + '/' + id + '/state', { state }),
  deletePromotion: (id: string) => http.delete<void>(base + '/' + id),
}
