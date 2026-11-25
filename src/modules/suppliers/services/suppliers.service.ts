import { http } from '@/lib/http'
import type {
  LedgerEntry,
  PaymentFormValues,
  PaymentResult,
  Supplier,
  SupplierFormValues,
  SupplierListItem,
  SupplierListParams,
  SupplierListResult,
  SupplierOption,
  SupplierPayment,
  SupplierStatsData,
  SupplierStatus,
  SupplierSummary,
  SuspendPayload,
  TopProduct,
} from '@/modules/suppliers/types/suppliers.types'
import type { Paginated } from '@/types/common'

const BASE = '/api/suppliers'
const EXPORT_PAGE_SIZE = 100
const EXPORT_MAX_PAGES = 50

type NullableKeys = 'email' | 'taxCode' | 'bankName' | 'bankAccount' | 'bankHolder' | 'note' | 'suspendReason' | 'suspendedUntil'
type SummaryResponse = Omit<SupplierSummary, 'lastReceiptAt' | 'nextDueAt'> & { lastReceiptAt: string | null; nextDueAt: string | null }
type ItemResponse = Omit<Supplier, NullableKeys> & { [K in NullableKeys]: string | null } & { summary: SummaryResponse }
type PaymentResponse = Omit<SupplierPayment, 'reference' | 'note'> & { reference: string | null; note: string | null }
type TopProductResponse = Omit<TopProduct, 'barcode' | 'image'> & { barcode: string | null; image: string | null }

const orUndef = <T>(v: T | null) => v ?? undefined

const toItem = (s: ItemResponse): SupplierListItem => ({
  ...s,
  email: orUndef(s.email),
  taxCode: orUndef(s.taxCode),
  bankName: orUndef(s.bankName),
  bankAccount: orUndef(s.bankAccount),
  bankHolder: orUndef(s.bankHolder),
  note: orUndef(s.note),
  suspendReason: orUndef(s.suspendReason),
  suspendedUntil: orUndef(s.suspendedUntil),
  summary: { ...s.summary, lastReceiptAt: orUndef(s.summary.lastReceiptAt), nextDueAt: orUndef(s.summary.nextDueAt) },
})

const toPayment = (p: PaymentResponse): SupplierPayment => ({ ...p, reference: orUndef(p.reference), note: orUndef(p.note) })

const blank = (v?: string) => {
  const t = v?.trim()
  return t ? t : null
}

const toPayload = (v: SupplierFormValues) => ({
  code: v.code.trim().toUpperCase() || undefined,
  name: v.name.trim().replace(/\s+/g, ' '),
  contact: v.contact.trim(),
  phone: v.phone.replace(/\s/g, ''),
  email: blank(v.email),
  address: v.address.trim(),
  taxCode: blank(v.taxCode?.replace(/\s/g, '')),
  categoryIds: v.categoryIds,
  paymentTermDays: v.paymentTermDays,
  bankName: blank(v.bankName),
  bankAccount: blank(v.bankAccount?.replace(/\s/g, '')),
  bankHolder: blank(v.bankHolder?.toUpperCase()),
  note: blank(v.note),
  status: v.status,
  ...(v.status === 'suspended' && { suspendReason: v.suspendReason?.trim(), suspendedUntil: v.suspendedUntil ?? null }),
})

const byId = (id: string) => `${BASE}/${encodeURIComponent(id)}`

export const suppliersService = {
  list: (params: SupplierListParams) =>
    http
      .get<Omit<SupplierListResult, 'items'> & { items: ItemResponse[] }>(BASE, { params: { ...params } })
      .then((res): SupplierListResult => ({ ...res, items: res.items.map(toItem) })),

  async listAll(params: Omit<SupplierListParams, 'page' | 'pageSize'>): Promise<SupplierListItem[]> {
    const items: SupplierListItem[] = []
    for (let page = 1; page <= EXPORT_MAX_PAGES; page++) {
      const res = await suppliersService.list({ ...params, page, pageSize: EXPORT_PAGE_SIZE })
      items.push(...res.items)
      if (items.length >= res.total || res.items.length === 0) break
    }
    return items
  },

  stats: () => http.get<SupplierStatsData>(`${BASE}/stats`),

  options: (params: { status?: SupplierStatus; categoryId?: string } = {}) => http.get<SupplierOption[]>(`${BASE}/options`, { params: { ...params } }),

  nextCode: () => http.get<{ code: string }>(`${BASE}/next-code`).then((r) => r.code),

  get: (id: string) => http.get<ItemResponse>(byId(id)).then(toItem),

  create: (values: SupplierFormValues) => http.post<ItemResponse>(BASE, toPayload(values)).then(toItem),

  update: (id: string, values: SupplierFormValues) => http.patch<ItemResponse>(byId(id), toPayload(values)).then(toItem),

  setStatus: (id: string, status: SupplierStatus, suspend?: SuspendPayload) =>
    http.patch<ItemResponse>(`${byId(id)}/status`, { status, ...suspend }).then(toItem),

  remove: (id: string) => http.delete<void>(byId(id)),

  ledger: (id: string, page = 1, pageSize = 50) => http.get<Paginated<LedgerEntry>>(`${byId(id)}/ledger`, { params: { page, pageSize } }),

  topProducts: (id: string, limit = 8) =>
    http
      .get<TopProductResponse[]>(`${byId(id)}/top-products`, { params: { limit } })
      .then((list) => list.map((p): TopProduct => ({ ...p, barcode: p.barcode ?? '', image: orUndef(p.image) }))),

  pay: (id: string, values: PaymentFormValues, idempotencyKey: string) =>
    http
      .post<{ payment: PaymentResponse; supplier: ItemResponse }>(
        `${byId(id)}/payments`,
        {
          amount: values.amount,
          method: values.method,
          reference: values.method === 'transfer' ? blank(values.reference) : null,
          note: blank(values.note),
        },
        { headers: { 'Idempotency-Key': idempotencyKey } },
      )
      .then((res): PaymentResult => ({ payment: toPayment(res.payment), supplier: toItem(res.supplier) })),
}
