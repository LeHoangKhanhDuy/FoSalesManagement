import type { BadgeProps } from '@/components/ui/Badge'
import { removeAccents } from '@/lib/format'
import { OPEN_STATUSES } from '@/modules/purchasing/utils/purchasing.utils'
import type { PurchaseOrder } from '@/modules/purchasing/types/purchasing.types'
import type {
  LedgerEntry,
  Supplier,
  SupplierFilters,
  SupplierFormValues,
  SupplierPayment,
  SupplierSort,
  SupplierStatus,
  SupplierSummary,
  SupplierTab,
  TopProduct,
} from '@/modules/suppliers/types/suppliers.types'

const DAY = 86_400_000

export const SUPPLIER_PAGE_SIZE = 10

export const DEFAULT_SUPPLIER_FILTERS: SupplierFilters = { keyword: '', tab: 'all', categoryId: 'all', sort: 'newest' }

export const SUPPLIER_STATUS: Record<SupplierStatus, { label: string; tone: NonNullable<BadgeProps['tone']> }> = {
  active: { label: 'Đang hợp tác', tone: 'success' },
  suspended: { label: 'Tạm ngưng', tone: 'warning' },
  inactive: { label: 'Ngừng hợp tác', tone: 'neutral' },
}

export const SUSPEND_REASONS = ['Giao hàng trễ nhiều lần', 'Chất lượng hàng không đạt', 'Đang đàm phán lại giá', 'Nhà cung cấp tạm nghỉ', 'Chờ đối soát công nợ']

export const SUPPLIER_TABS: { value: SupplierTab; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'active', label: 'Đang hợp tác' },
  { value: 'suspended', label: 'Tạm ngưng' },
  { value: 'debt', label: 'Còn nợ' },
  { value: 'inactive', label: 'Ngừng hợp tác' },
]

export const SUPPLIER_SORTS: { value: SupplierSort; label: string }[] = [
  { value: 'newest', label: 'Mới thêm gần đây' },
  { value: 'name', label: 'Tên A → Z' },
  { value: 'debt', label: 'Nợ phải trả nhiều nhất' },
  { value: 'purchased', label: 'Giá trị nhập nhiều nhất' },
]

export const PAYMENT_TERMS = [0, 7, 15, 30, 45]

export const termLabel = (days: number) => (days === 0 ? 'Trả ngay' : `${days} ngày`)

export const formatPhone = (phone: string) => {
  const d = phone.replace(/\D/g, '')
  return d.length === 10 ? `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}` : phone
}

export const EMPTY_SUMMARY: SupplierSummary = { orderCount: 0, openOrders: 0, purchased: 0, paid: 0, debt: 0, overdue: 0 }

export const summarizeSupplier = (supplier: Supplier, orders: PurchaseOrder[], payments: SupplierPayment[], now = Date.now()): SupplierSummary => {
  const own = orders.filter((o) => o.supplierId === supplier.id)
  const receipts = own.flatMap((o) => o.receipts).sort((a, b) => a.receivedAt.localeCompare(b.receivedAt))
  const paid = payments.filter((p) => p.supplierId === supplier.id).reduce((s, p) => s + p.amount, 0)
  const purchased = receipts.reduce((s, r) => s + r.value, 0)
  let covered = paid
  let overdue = 0
  let nextDueAt: string | undefined
  for (const r of receipts) {
    const outstanding = Math.max(0, r.value - covered)
    covered = Math.max(0, covered - r.value)
    if (!outstanding) continue
    const due = new Date(r.receivedAt).getTime() + supplier.paymentTermDays * DAY
    if (due < now) overdue += outstanding
    else if (!nextDueAt) nextDueAt = new Date(due).toISOString()
  }
  return {
    orderCount: own.filter((o) => o.status !== 'draft').length,
    openOrders: own.filter((o) => OPEN_STATUSES.includes(o.status)).length,
    purchased,
    paid,
    debt: Math.max(0, purchased - paid),
    overdue,
    lastReceiptAt: receipts.at(-1)?.receivedAt,
    nextDueAt,
  }
}

export const buildLedger = (supplierId: string, orders: PurchaseOrder[], payments: SupplierPayment[]): LedgerEntry[] => {
  const entries = [
    ...orders
      .filter((o) => o.supplierId === supplierId)
      .flatMap((o) => o.receipts.map((r) => ({ id: r.id, kind: 'receipt' as const, code: r.code, label: `Nhập hàng theo ${o.code}`, at: r.receivedAt, amount: r.value }))),
    ...payments
      .filter((p) => p.supplierId === supplierId)
      .map((p) => ({ id: p.id, kind: 'payment' as const, code: p.code, label: p.method === 'cash' ? 'Trả tiền mặt' : `Chuyển khoản${p.reference ? ` · ${p.reference}` : ''}`, at: p.paidAt, amount: -p.amount })),
  ].sort((a, b) => a.at.localeCompare(b.at))
  let balance = 0
  return entries.map((e) => ({ ...e, balance: (balance += e.amount) })).reverse()
}

export const topProducts = (supplierId: string, orders: PurchaseOrder[], limit = 8): TopProduct[] => {
  const map = new Map<string, TopProduct>()
  orders
    .filter((o) => o.supplierId === supplierId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .forEach((o) =>
      o.items.forEach((i) => {
        const cur = map.get(i.productId) ?? { productId: i.productId, name: i.name, unit: i.unit, categoryId: i.categoryId, image: i.image, qty: 0, value: 0, lastCost: i.unitCost }
        if (i.receivedQty > 0) {
          cur.qty += i.receivedQty
          cur.value += i.receivedQty * i.unitCost
        }
        cur.lastCost = i.unitCost
        map.set(i.productId, cur)
      }),
    )
  return [...map.values()].filter((p) => p.qty > 0).sort((a, b) => b.qty - a.qty).slice(0, limit)
}

export const matchSupplier = (s: Supplier, keyword: string) => {
  const k = removeAccents(keyword.trim())
  if (!k) return true
  return [s.name, s.code, s.contact, s.phone, s.taxCode ?? '', s.email ?? ''].some((v) => removeAccents(v).replace(/\s/g, '').includes(k.replace(/\s/g, '')))
}

export const matchTab = (s: Supplier, summary: SupplierSummary, tab: SupplierTab) =>
  tab === 'all' || (tab === 'debt' ? summary.debt > 0 : s.status === tab)

export const sortSuppliers = (list: Supplier[], sort: SupplierSort, summaries: Record<string, SupplierSummary>) =>
  [...list].sort((a, b) => {
    if (sort === 'name') return a.name.localeCompare(b.name, 'vi')
    if (sort === 'debt') return (summaries[b.id]?.debt ?? 0) - (summaries[a.id]?.debt ?? 0)
    if (sort === 'purchased') return (summaries[b.id]?.purchased ?? 0) - (summaries[a.id]?.purchased ?? 0)
    return b.createdAt.localeCompare(a.createdAt)
  })

export const nextSupplierCode = (suppliers: Supplier[]) => {
  const max = suppliers.reduce((m, s) => Math.max(m, Number(s.code.replace(/\D/g, '')) || 0), 0)
  return `NCC${String(max + 1).padStart(3, '0')}`
}

export const emptySupplierForm = (code: string): SupplierFormValues => ({
  code,
  name: '',
  contact: '',
  phone: '',
  email: '',
  address: '',
  taxCode: '',
  categoryIds: [],
  paymentTermDays: 15,
  bankName: '',
  bankAccount: '',
  bankHolder: '',
  note: '',
  status: 'active',
})

export const exportSuppliersCsv = (suppliers: Supplier[], summaries: Record<string, SupplierSummary>) => {
  const head = ['Mã', 'Tên nhà cung cấp', 'Người liên hệ', 'Điện thoại', 'Email', 'Địa chỉ', 'MST', 'Hạn thanh toán', 'Tổng nhập', 'Đã trả', 'Còn nợ', 'Trạng thái']
  const rows = suppliers.map((s) => {
    const m = summaries[s.id]
    return [s.code, s.name, s.contact, s.phone, s.email ?? '', s.address, s.taxCode ?? '', termLabel(s.paymentTermDays), m?.purchased ?? 0, m?.paid ?? 0, m?.debt ?? 0, SUPPLIER_STATUS[s.status].label + (s.suspendReason ? ` (${s.suspendReason})` : '')]
  })
  const csv = [head, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `nha-cung-cap-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
