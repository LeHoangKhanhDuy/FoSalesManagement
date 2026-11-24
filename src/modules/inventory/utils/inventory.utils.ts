import { ArrowDownLeft, ArrowUpRight, Boxes, Hourglass, PackageCheck, PackageOpen, PackageX, RotateCcw, ShoppingCart, TriangleAlert, Truck, type LucideIcon } from 'lucide-react'
import type { BadgeProps } from '@/components/ui/Badge'
import { HttpError } from '@/lib/http'
import type {
  InventoryFilters,
  InventoryListParams,
  InventorySort,
  MovementFilters,
  MovementListParams,
  MovementType,
  StockLevelFilter,
  StockMovement,
} from '@/modules/inventory/types/inventory.types'

export const PAGE_SIZE = 10
export const SLOW_DAYS = 30
const DAY = 86_400_000

export const MOVEMENT_TYPES: Record<MovementType, { label: string; tone: NonNullable<BadgeProps['tone']>; icon: LucideIcon }> = {
  sale: { label: 'Xuất bán', tone: 'info', icon: ShoppingCart },
  return: { label: 'Nhập trả', tone: 'violet', icon: RotateCcw },
  import: { label: 'Nhập hàng', tone: 'success', icon: Truck },
  'adjust-in': { label: 'Điều chỉnh tăng', tone: 'primary', icon: ArrowDownLeft },
  'adjust-out': { label: 'Điều chỉnh giảm', tone: 'warning', icon: ArrowUpRight },
  initial: { label: 'Tồn đầu kỳ', tone: 'neutral', icon: PackageOpen },
}

export const MOVEMENT_TYPE_OPTIONS: { value: MovementFilters['type']; label: string }[] = [
  { value: 'all', label: 'Tất cả loại' },
  { value: 'in', label: 'Tất cả nhập (+)' },
  { value: 'out', label: 'Tất cả xuất (−)' },
  ...(Object.keys(MOVEMENT_TYPES) as MovementType[]).map((t) => ({ value: t, label: MOVEMENT_TYPES[t].label })),
]

export const LEVEL_TABS: { value: StockLevelFilter; label: string; icon: LucideIcon }[] = [
  { value: 'all', label: 'Tất cả mức tồn', icon: Boxes },
  { value: 'ok', label: 'Đủ hàng', icon: PackageCheck },
  { value: 'low', label: 'Sắp hết', icon: TriangleAlert },
  { value: 'out', label: 'Hết hàng', icon: PackageX },
  { value: 'slow', label: 'Tồn lâu', icon: Hourglass },
]

export const INVENTORY_SORT_OPTIONS: { value: InventorySort; label: string }[] = [
  { value: 'value-desc', label: 'Giá trị tồn cao → thấp' },
  { value: 'stock-asc', label: 'Tồn kho ít → nhiều' },
  { value: 'stock-desc', label: 'Tồn kho nhiều → ít' },
  { value: 'recent', label: 'Biến động gần nhất' },
  { value: 'name', label: 'Tên A → Z' },
]

export const MOVEMENT_RANGE_OPTIONS: { value: MovementFilters['range']; label: string }[] = [
  { value: 'today', label: 'Hôm nay' },
  { value: '7d', label: '7 ngày qua' },
  { value: '30d', label: '30 ngày qua' },
  { value: 'all', label: 'Toàn thời gian' },
]

export const ADJUST_REASONS = {
  increase: ['Nhập bổ sung', 'Khách trả hàng', 'Kiểm kho thừa', 'Hàng tặng kèm'],
  decrease: ['Hư hỏng', 'Hết hạn sử dụng', 'Thất thoát', 'Dùng nội bộ', 'Kiểm kho thiếu'],
  set: ['Kiểm kho định kỳ', 'Cập nhật số liệu thực tế'],
}

export const DEFAULT_INVENTORY_FILTERS: InventoryFilters = { keyword: '', categoryId: 'all', level: 'all', sort: 'value-desc' }
export const DEFAULT_MOVEMENT_FILTERS: MovementFilters = { keyword: '', type: 'all', range: '30d' }

export const EMPTY_LEVEL_COUNTS: Record<StockLevelFilter, number> = { all: 0, ok: 0, low: 0, out: 0, slow: 0 }

export const hasInventoryFilters = (f: InventoryFilters) => f.keyword.trim() !== '' || f.categoryId !== 'all' || f.level !== 'all'

export const hasMovementFilters = (f: MovementFilters) => f.keyword.trim() !== '' || f.type !== 'all' || f.range !== DEFAULT_MOVEMENT_FILTERS.range

export const toInventoryParams = (f: InventoryFilters, keyword: string, page: number): InventoryListParams => ({
  keyword: keyword.trim() || undefined,
  categoryId: f.categoryId === 'all' ? undefined : f.categoryId,
  level: f.level === 'all' ? undefined : f.level,
  sort: f.sort,
  page,
  pageSize: PAGE_SIZE,
})

export const toMovementParams = (f: MovementFilters, keyword: string, page: number, now = new Date()): MovementListParams => {
  const range = getMovementRange(f, now)
  return {
    keyword: keyword.trim() || undefined,
    type: f.type === 'all' ? undefined : f.type,
    from: range?.from.toISOString(),
    to: range?.to.toISOString(),
    page,
    pageSize: PAGE_SIZE,
  }
}

export const INVENTORY_ERROR = {
  insufficient: 'INVENTORY_INSUFFICIENT_STOCK',
  changed: 'INVENTORY_STOCK_CHANGED',
  noChange: 'INVENTORY_NO_CHANGE',
  notFound: 'INVENTORY_PRODUCT_NOT_FOUND',
} as const

export const errorCurrentStock = (error: unknown) => {
  const current = (error instanceof HttpError ? (error.data as { details?: { current?: unknown } } | null) : null)?.details?.current
  return typeof current === 'number' ? current : undefined
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

export const getMovementRange = (f: MovementFilters, now = new Date()) => {
  const today = startOfDay(now)
  const tomorrow = new Date(today.getTime() + DAY)
  switch (f.range) {
    case 'today':
      return { from: today, to: tomorrow }
    case '7d':
      return { from: new Date(today.getTime() - 6 * DAY), to: tomorrow }
    case '30d':
      return { from: new Date(today.getTime() - 29 * DAY), to: tomorrow }
    case 'custom':
      if (!f.dateFrom && !f.dateTo) return null
      return {
        from: f.dateFrom ? startOfDay(f.dateFrom) : new Date(0),
        to: f.dateTo ? new Date(startOfDay(f.dateTo).getTime() + DAY) : tomorrow,
      }
    default:
      return null
  }
}

export const exportMovementsCsv = (list: StockMovement[]) => {
  const header = ['Thời gian', 'Loại', 'SKU', 'Mã vạch', 'Sản phẩm', 'Thay đổi', 'Tồn trước', 'Tồn sau', 'Đơn vị', 'Chứng từ', 'Lý do', 'Người thực hiện']
  const rows = list.map((m) => [
    new Date(m.createdAt).toLocaleString('vi-VN'),
    MOVEMENT_TYPES[m.type].label,
    m.sku,
    m.barcode,
    m.productName,
    m.quantity > 0 ? `+${m.quantity}` : m.quantity,
    m.before,
    m.after,
    m.unit,
    m.refCode ?? '',
    [m.reason, m.note].filter(Boolean).join(' - '),
    m.createdBy,
  ])
  const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `xuat-nhap-kho-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

