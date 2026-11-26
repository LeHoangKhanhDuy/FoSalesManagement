import { http } from '@/lib/http'
import type {
  CreateOrderPayload,
  OrderCustomer,
  OrderDetail,
  OrderLine,
  OrderListResult,
  OrderPayment,
  OrderPromotion,
  OrderQuery,
  OrderQuote,
  OrderReturn,
  OrderStats,
  OrderSummary,
  OrderTotals,
  QuoteRequest,
  ReceiptData,
  RefundPayload,
  StatusCounts,
  TodayStats,
} from '@/modules/orders/types/orders.types'

const BASE = '/api/orders'
const EXPORT_PAGE_SIZE = 100
const EXPORT_MAX_PAGES = 50

type Raw<T> = { [K in keyof T]?: T[K] | null }
type RawSummary = Raw<OrderSummary> & { totals?: Raw<OrderTotals> | null }
type RawDetail = RawSummary & {
  lines?: Raw<OrderLine>[] | null
  items?: Raw<OrderLine>[] | null
  payments?: Raw<OrderPayment>[] | null
  promotions?: Raw<OrderPromotion>[] | null
  returns?: Raw<OrderReturn>[] | null
  pointsEarned?: number | null
  pointsRedeemed?: number | null
  completedAt?: string | null
  cancelledAt?: string | null
}
type RawQuote = Omit<Raw<OrderQuote>, 'totals' | 'promotions'> & { totals?: Raw<OrderTotals> | null; promotions?: Raw<OrderPromotion>[] | null }

const num = (v: number | null | undefined) => v ?? 0
const opt = <T>(v: T | null | undefined) => (v === null || v === '' ? undefined : v)
const idem = (key: string) => ({ headers: { 'Idempotency-Key': key } })

const toTotals = (t: Raw<OrderTotals> | null | undefined): OrderTotals => {
  const total = num(t?.total)
  return {
    itemCount: num(t?.itemCount),
    subtotal: num(t?.subtotal),
    productDiscount: num(t?.productDiscount),
    orderDiscount: num(t?.orderDiscount),
    memberDiscount: num(t?.memberDiscount),
    voucherDiscount: num(t?.voucherDiscount),
    pointsDiscount: num(t?.pointsDiscount),
    discountAmount: num(t?.discountAmount),
    total,
    due: t?.due ?? total - num(t?.pointsDiscount),
  }
}

const toCustomer = (c: Raw<OrderCustomer> | null | undefined): OrderCustomer | null =>
  c?.id ? { id: c.id, code: opt(c.code), name: c.name ?? '', phone: c.phone ?? '', tier: c.tier ?? 'retail', points: num(c.points) } : null

const toSummary = (o: RawSummary): OrderSummary => ({
  id: o.id ?? '',
  code: o.code ?? '',
  status: o.status ?? 'completed',
  channel: o.channel ?? 'pos',
  createdAt: o.createdAt ?? '',
  updatedAt: o.updatedAt ?? o.createdAt ?? '',
  customer: toCustomer(o.customer as Raw<OrderCustomer> | null),
  cashier: o.cashier ?? '',
  totals: toTotals(o.totals),
  paidAmount: num(o.paidAmount),
  changeAmount: num(o.changeAmount),
  paymentMethod: o.paymentMethod ?? 'cash',
  paymentMethods: o.paymentMethods?.length ? o.paymentMethods : o.paymentMethod ? [o.paymentMethod] : [],
  pendingAmount: num(o.pendingAmount),
  voucherCode: opt(o.voucherCode),
  refundedTotal: num(o.refundedTotal),
  note: opt(o.note),
  reason: opt(o.reason),
})

const toLine = (l: Raw<OrderLine>, index: number): OrderLine => {
  const price = num(l.price)
  const quantity = num(l.quantity)
  const productDiscount = num(l.productDiscount)
  const allocatedDiscount = num(l.allocatedDiscount)
  return {
    id: l.id ?? `${l.productId}-${index}`,
    productId: l.productId ?? '',
    name: l.name ?? '',
    sku: l.sku ?? '',
    barcode: opt(l.barcode),
    unit: l.unit ?? '',
    categoryId: opt(l.categoryId),
    image: opt(l.image),
    price,
    quantity,
    productDiscount,
    allocatedDiscount,
    netAmount: l.netAmount ?? price * quantity - productDiscount - allocatedDiscount,
    isGift: !!l.isGift,
    promotionName: opt(l.promotionName),
    returnedQty: num(l.returnedQty),
  }
}

const toPayment = (p: Raw<OrderPayment>, index: number): OrderPayment => ({
  id: p.id ?? String(index),
  method: p.method ?? 'cash',
  amount: num(p.amount),
  tendered: opt(p.tendered),
  reference: opt(p.reference),
  status: p.status ?? 'confirmed',
  confirmedAt: opt(p.confirmedAt),
})

const toPromotion = (p: Raw<OrderPromotion>, index: number): OrderPromotion => ({
  id: p.id ?? String(index),
  code: opt(p.code),
  name: p.name ?? '',
  kind: p.kind ?? '',
  amount: num(p.amount),
})

const toReturn = (r: Raw<OrderReturn>): OrderReturn => ({
  id: r.id ?? '',
  code: r.code ?? '',
  refundTotal: num(r.refundTotal),
  refundMethod: r.refundMethod ?? 'cash',
  reason: r.reason ?? '',
  createdAt: r.createdAt ?? '',
})

export const toOrderDetail = (o: RawDetail): OrderDetail => ({
  ...toSummary(o),
  lines: (o.lines ?? o.items ?? []).map(toLine),
  payments: (o.payments ?? []).map(toPayment),
  promotions: (o.promotions ?? []).map(toPromotion),
  returns: (o.returns ?? []).map(toReturn),
  pointsEarned: num(o.pointsEarned),
  pointsRedeemed: num(o.pointsRedeemed),
  completedAt: opt(o.completedAt),
  cancelledAt: opt(o.cancelledAt),
})

export const toOrderQuote = (q: RawQuote): OrderQuote => ({
  totals: toTotals(q.totals),
  promotions: (q.promotions ?? []).map(toPromotion),
  voucherIssue: opt(q.voucherIssue),
  pointsToEarn: num(q.pointsToEarn),
  maxRedeemPoints: num(q.maxRedeemPoints),
  stockWarnings: q.stockWarnings ?? [],
})

const EMPTY_COUNTS: StatusCounts = { all: 0, pending: 0, completed: 0, cancelled: 0, partially_refunded: 0, refunded: 0 }

const toParams = (q: Partial<OrderQuery>) => ({
  page: q.page,
  pageSize: q.pageSize,
  keyword: q.keyword?.trim() || undefined,
  status: q.status,
  from: q.from,
  to: q.to,
  payment: q.payment,
  sort: q.sort,
})

export const ordersService = {
  async list(query: OrderQuery): Promise<OrderListResult> {
    const res = await http.get<Omit<Raw<OrderListResult>, 'items' | 'statusCounts'> & { items?: RawSummary[]; statusCounts?: Partial<StatusCounts> }>(BASE, {
      params: toParams(query),
    })
    return {
      items: (res.items ?? []).map(toSummary),
      total: num(res.total),
      page: res.page ?? query.page,
      pageSize: res.pageSize ?? query.pageSize,
      statusCounts: { ...EMPTY_COUNTS, ...res.statusCounts },
    }
  },

  async listAll(query: Omit<OrderQuery, 'page' | 'pageSize'>): Promise<OrderSummary[]> {
    const all: OrderSummary[] = []
    for (let page = 1; page <= EXPORT_MAX_PAGES; page++) {
      const res = await ordersService.list({ ...query, page, pageSize: EXPORT_PAGE_SIZE })
      all.push(...res.items)
      if (all.length >= res.total || res.items.length < EXPORT_PAGE_SIZE) break
    }
    return all
  },

  async stats(range: { from?: string; to?: string }): Promise<OrderStats> {
    const s = await http.get<Raw<OrderStats>>(`${BASE}/stats`, { params: range })
    return {
      revenue: num(s.revenue),
      orders: num(s.orders),
      avgOrderValue: num(s.avgOrderValue),
      pending: num(s.pending),
      pendingAmount: num(s.pendingAmount),
      cancelled: num(s.cancelled),
      cancelledAmount: num(s.cancelledAmount),
      refunded: num(s.refunded),
      refundedAmount: num(s.refundedAmount),
      byMethod: { cash: 0, transfer: 0, card: 0, ewallet: 0, points: 0, ...s.byMethod },
    }
  },

  today: () => http.get<TodayStats>(`${BASE}/today`),

  get: (id: string) => http.get<RawDetail>(`${BASE}/${id}`).then(toOrderDetail),

  lookup: (code: string) => http.get<RawDetail>(`${BASE}/lookup`, { params: { code: code.trim() } }).then(toOrderDetail),

  quote: (payload: QuoteRequest) => http.post<RawQuote>(`${BASE}/quote`, payload).then(toOrderQuote),

  create: (payload: CreateOrderPayload, key: string) => http.post<RawDetail>(BASE, payload, idem(key)).then(toOrderDetail),

  confirmPayment: (id: string, body: { paymentId?: string; reference?: string }, key: string) =>
    http.post<unknown>(`${BASE}/${id}/confirm-payment`, body, idem(key)),

  cancel: (id: string, reason: string, key: string) => http.post<unknown>(`${BASE}/${id}/cancel`, { reason }, idem(key)),

  refund: (id: string, payload: RefundPayload, key: string) => http.post<unknown>(`${BASE}/${id}/refund`, payload, idem(key)),

  receipt: (id: string) => http.get<ReceiptData>(`${BASE}/${id}/receipt`),

  markPrinted: (id: string) => http.post<unknown>(`${BASE}/${id}/print`),
}
