import type { BadgeProps } from '@/components/ui/Badge'
import { HttpError } from '@/lib/http'
import type {
  SupplierFilters,
  SupplierFormValues,
  SupplierListItem,
  SupplierListParams,
  SupplierSort,
  SupplierStatsData,
  SupplierStatus,
  SupplierSummary,
  SupplierTab,
} from '@/modules/suppliers/types/suppliers.types'

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

export const EMPTY_SUMMARY: SupplierSummary = { orderCount: 0, openOrders: 0, purchased: 0, paid: 0, debt: 0, overdue: 0 }

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

export const EMPTY_TAB_COUNTS: Record<SupplierTab, number> = { all: 0, active: 0, suspended: 0, debt: 0, inactive: 0 }

export const EMPTY_STATS: SupplierStatsData = { total: 0, active: 0, suspended: 0, purchased30: 0, openOrders: 0, debt: 0, debtors: 0, overdue: 0, overdueCount: 0 }

export const hasSupplierFilters = (f: SupplierFilters) => f.keyword.trim() !== '' || f.tab !== 'all' || f.categoryId !== 'all'

export const toSupplierParams = (f: SupplierFilters, keyword: string, page: number): SupplierListParams => ({
  keyword: keyword.trim() || undefined,
  tab: f.tab === 'all' ? undefined : f.tab,
  categoryId: f.categoryId === 'all' ? undefined : f.categoryId,
  sort: f.sort,
  page,
  pageSize: SUPPLIER_PAGE_SIZE,
})

export const SUPPLIER_ERROR = {
  hasTransactions: 'SUPPLIER_HAS_TRANSACTIONS',
  paymentExceedsDebt: 'SUPPLIER_PAYMENT_EXCEEDS_DEBT',
  notFound: 'SUPPLIER_NOT_FOUND',
} as const

const FIELD_BY_CODE: Partial<Record<string, keyof SupplierFormValues>> = {
  SUPPLIER_CODE_TAKEN: 'code',
  SUPPLIER_NAME_TAKEN: 'name',
  SUPPLIER_PHONE_TAKEN: 'phone',
  SUPPLIER_TAX_CODE_TAKEN: 'taxCode',
  SUPPLIER_CATEGORY_INVALID: 'categoryIds',
}

export const supplierFieldError = (error: unknown): Partial<Record<keyof SupplierFormValues, string>> | null => {
  const field = error instanceof HttpError && error.code ? FIELD_BY_CODE[error.code] : undefined
  return field && error instanceof Error ? { [field]: error.message } : null
}

export const errorDebt = (error: unknown) => {
  const debt = (error instanceof HttpError ? (error.data as { details?: { debt?: unknown } } | null) : null)?.details?.debt
  return typeof debt === 'number' ? debt : undefined
}

export const exportSuppliersCsv = (suppliers: SupplierListItem[]) => {
  const head = ['Mã', 'Tên nhà cung cấp', 'Người liên hệ', 'Điện thoại', 'Email', 'Địa chỉ', 'MST', 'Hạn thanh toán', 'Tổng nhập', 'Đã trả', 'Còn nợ', 'Trạng thái']
  const rows = suppliers.map((s) => {
    const m = s.summary
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
