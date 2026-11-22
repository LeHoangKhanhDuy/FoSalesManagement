import type { BadgeProps } from '@/components/ui/Badge'
import type { PurchaseOrder, PurchaseOrderItem, PurchaseOrderStatus } from '@/modules/purchasing/types/purchasing.types'
import type { Product } from '@/modules/sales/types/sales.types'
import { LOW_STOCK_THRESHOLD } from '@/modules/sales/utils/constants'

export const PO_PAGE_SIZE = 10
export const APPROVAL_THRESHOLD = 0.05

export const PO_STATUS: Record<PurchaseOrderStatus, { label: string; tone: NonNullable<BadgeProps['tone']> }> = {
  draft: { label: 'Nháp', tone: 'neutral' },
  ordered: { label: 'Chờ giao', tone: 'info' },
  receiving: { label: 'Đang kiểm đếm', tone: 'violet' },
  partial: { label: 'Nhận một phần', tone: 'warning' },
  completed: { label: 'Hoàn tất', tone: 'success' },
  cancelled: { label: 'Đã hủy', tone: 'danger' },
}

export const PO_STATUS_TABS: { value: PurchaseOrderStatus | 'all' | 'open'; label: string }[] = [
  { value: 'open', label: 'Cần xử lý' },
  { value: 'all', label: 'Tất cả' },
  { value: 'draft', label: 'Nháp' },
  { value: 'ordered', label: 'Chờ giao' },
  { value: 'partial', label: 'Nhận một phần' },
  { value: 'completed', label: 'Hoàn tất' },
  { value: 'cancelled', label: 'Đã hủy' },
]

export const OPEN_STATUSES: PurchaseOrderStatus[] = ['ordered', 'receiving', 'partial']

const PACK_BY_UNIT: Record<string, number> = { lon: 24, chai: 24, gói: 30, hộp: 12, lốc: 6, tuýp: 12 }

export const productToPoItem = (p: Product, orderedQty?: number): PurchaseOrderItem => {
  const min = p.minStock ?? LOW_STOCK_THRESHOLD
  return {
    productId: p.id,
    name: p.name,
    sku: p.sku,
    barcode: p.barcode,
    unit: p.unit,
    categoryId: p.categoryId,
    image: p.image,
    imageFit: p.imageFit,
    orderedQty: orderedQty ?? Math.max(min * 3 - p.stock, min),
    unitCost: p.costPrice ?? Math.round(p.price * 0.75),
    packSize: PACK_BY_UNIT[p.unit.toLowerCase()] ?? 1,
    receivedQty: 0,
    damagedQty: 0,
  }
}

export const calcPoTotals = (items: PurchaseOrderItem[], discount = 0) => {
  const subtotal = items.reduce((s, i) => s + i.orderedQty * i.unitCost, 0)
  const orderedQty = items.reduce((s, i) => s + i.orderedQty, 0)
  const receivedQty = items.reduce((s, i) => s + i.receivedQty, 0)
  return { subtotal, total: Math.max(0, subtotal - discount), orderedQty, receivedQty, lines: items.length }
}

export const receivedValue = (order: PurchaseOrder) => order.receipts.reduce((s, r) => s + r.value, 0)

export const isOverdue = (order: PurchaseOrder, now = new Date()) =>
  (order.status === 'ordered' || order.status === 'partial') && new Date(order.expectedDate) < new Date(now.getFullYear(), now.getMonth(), now.getDate())

export const generateCode = (prefix: string, date = new Date()) => {
  const ymd = `${String(date.getFullYear()).slice(-2)}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
  return `${prefix}${ymd}-${Math.floor(Math.random() * 9000 + 1000)}`
}

export const formatPack = (qty: number, packSize: number, unit: string) => {
  if (packSize <= 1 || qty < packSize) return `${qty} ${unit.toLowerCase()}`
  const packs = Math.floor(qty / packSize)
  const rest = qty % packSize
  return `${packs} thùng${rest ? ` + ${rest}` : ''} (${qty} ${unit.toLowerCase()})`
}
