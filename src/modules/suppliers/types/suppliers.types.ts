export type SupplierStatus = 'active' | 'suspended' | 'inactive'

export interface Supplier {
  id: string
  code: string
  name: string
  contact: string
  phone: string
  email?: string
  address: string
  taxCode?: string
  categoryIds: string[]
  paymentTermDays: number
  bankName?: string
  bankAccount?: string
  bankHolder?: string
  note?: string
  status: SupplierStatus
  suspendReason?: string
  suspendedUntil?: string
  createdAt: string
  updatedAt?: string
}

export interface SupplierListItem extends Supplier {
  summary: SupplierSummary
}

export type PaymentMethod = 'cash' | 'transfer'

export interface SupplierPayment {
  id: string
  code: string
  supplierId: string
  amount: number
  method: PaymentMethod
  reference?: string
  note?: string
  paidAt: string
  paidBy: string
}

export interface SupplierSummary {
  orderCount: number
  openOrders: number
  purchased: number
  paid: number
  debt: number
  overdue: number
  lastReceiptAt?: string
  nextDueAt?: string
}

export type SupplierTab = 'all' | 'active' | 'suspended' | 'debt' | 'inactive'

export interface SuspendPayload {
  reason: string
  until?: string
}
export type SupplierSort = 'newest' | 'name' | 'debt' | 'purchased'

export interface SupplierFilters {
  keyword: string
  tab: SupplierTab
  categoryId: string
  sort: SupplierSort
}

export type SupplierFormValues = Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>

export interface SupplierListParams {
  keyword?: string
  tab?: Exclude<SupplierTab, 'all'>
  categoryId?: string
  sort: SupplierSort
  page: number
  pageSize: number
}

export interface SupplierListResult {
  items: SupplierListItem[]
  total: number
  tabCounts: Record<SupplierTab, number>
}

export interface SupplierStatsData {
  total: number
  active: number
  suspended: number
  purchased30: number
  openOrders: number
  debt: number
  debtors: number
  overdue: number
  overdueCount: number
}

export interface PaymentResult {
  payment: SupplierPayment
  supplier: SupplierListItem
}

export interface PaymentFormValues {
  amount: number
  method: PaymentMethod
  reference: string
  note: string
}

export interface LedgerEntry {
  id: string
  kind: 'receipt' | 'payment' | 'return' | 'adjustment'
  code: string
  label: string
  at: string
  dueAt?: string
  amount: number
  balance: number
}

export interface TopProduct {
  productId: string
  name: string
  sku: string
  barcode: string
  unit: string
  categoryId: string
  image?: string
  qty: number
  value: number
  lastCost: number
}

export interface SupplierOption {
  id: string
  code: string
  name: string
  paymentTermDays: number
  status: SupplierStatus
  categoryIds: string[]
}
