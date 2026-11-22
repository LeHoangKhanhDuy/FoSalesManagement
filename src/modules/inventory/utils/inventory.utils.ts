import { ArrowDownLeft, ArrowUpRight, PackageOpen, RotateCcw, ShoppingCart, Truck, type LucideIcon } from 'lucide-react'
import type { BadgeProps } from '@/components/ui/Badge'
import { removeAccents } from '@/lib/format'
import type {
  InventoryFilters,
  InventoryItem,
  InventorySort,
  InventoryStats,
  MovementFilters,
  MovementType,
  StockLevelFilter,
  StockMovement,
  StockPoint,
} from '@/modules/inventory/types/inventory.types'
import type { Product } from '@/modules/sales/types/sales.types'
import { LOW_STOCK_THRESHOLD } from '@/modules/sales/utils/constants'

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

export const LEVEL_TABS: { value: StockLevelFilter; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'ok', label: 'Đủ hàng' },
  { value: 'low', label: 'Sắp hết' },
  { value: 'out', label: 'Hết hàng' },
  { value: 'slow', label: 'Tồn lâu' },
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

export const toInventoryItem = (p: Product, movements: StockMovement[], now = Date.now()): InventoryItem => {
  const own = movements.filter((m) => m.productId === p.id)
  const soldLast30 = own
    .filter((m) => m.type === 'sale' && now - new Date(m.createdAt).getTime() <= SLOW_DAYS * DAY)
    .reduce((s, m) => s - m.quantity, 0)
  const minStockValue = p.minStock ?? LOW_STOCK_THRESHOLD
  return {
    ...p,
    minStockValue,
    stockValue: p.stock * (p.costPrice ?? p.price),
    level: p.stock <= 0 ? 'out' : p.stock <= minStockValue ? 'low' : 'ok',
    soldLast30,
    lastMovementAt: own[0]?.createdAt,
    slow: p.stock > 0 && soldLast30 === 0,
  }
}

export const calcInventoryStats = (items: InventoryItem[]): InventoryStats =>
  items.reduce<InventoryStats>(
    (s, i) => ({
      stockValue: s.stockValue + i.stockValue,
      skuCount: s.skuCount + 1,
      units: s.units + i.stock,
      low: s.low + (i.level === 'low' ? 1 : 0),
      out: s.out + (i.level === 'out' ? 1 : 0),
      slow: s.slow + (i.slow ? 1 : 0),
    }),
    { stockValue: 0, skuCount: 0, units: 0, low: 0, out: 0, slow: 0 },
  )

export const matchLevel = (i: InventoryItem, level: StockLevelFilter) =>
  level === 'all' || (level === 'slow' ? i.slow : i.level === level)

export const filterInventory = (items: InventoryItem[], f: InventoryFilters, keyword: string) => {
  const k = removeAccents(keyword.trim())
  return items.filter(
    (i) =>
      (f.categoryId === 'all' || i.categoryId === f.categoryId) &&
      (!k || removeAccents(i.name).includes(k) || i.sku.toLowerCase().includes(k) || i.barcode.includes(k)),
  )
}

export const sortInventory = (items: InventoryItem[], sort: InventorySort) => {
  const list = [...items]
  switch (sort) {
    case 'stock-asc':
      return list.sort((a, b) => a.stock - b.stock)
    case 'stock-desc':
      return list.sort((a, b) => b.stock - a.stock)
    case 'name':
      return list.sort((a, b) => a.name.localeCompare(b.name, 'vi'))
    case 'recent':
      return list.sort((a, b) => (b.lastMovementAt ?? '').localeCompare(a.lastMovementAt ?? ''))
    default:
      return list.sort((a, b) => b.stockValue - a.stockValue)
  }
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

export const filterMovements = (list: StockMovement[], f: MovementFilters, keyword: string) => {
  const range = getMovementRange(f)
  const k = removeAccents(keyword.trim())
  return list.filter((m) => {
    if (range) {
      const t = new Date(m.createdAt)
      if (t < range.from || t >= range.to) return false
    }
    if (f.type === 'in' && m.quantity <= 0) return false
    if (f.type === 'out' && m.quantity >= 0) return false
    if (f.type !== 'all' && f.type !== 'in' && f.type !== 'out' && m.type !== f.type) return false
    return !k || removeAccents(m.productName).includes(k) || m.sku.toLowerCase().includes(k) || (m.refCode ?? '').toLowerCase().includes(k)
  })
}

export const buildStockSeries = (current: number, movements: StockMovement[], days = 30, now = new Date()): StockPoint[] => {
  const today = startOfDay(now)
  const points: StockPoint[] = []
  let stock = current
  const sorted = [...movements].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  let idx = 0
  for (let d = 0; d < days; d++) {
    const dayStart = new Date(today.getTime() - d * DAY)
    points.push({ date: dayStart, stock })
    while (idx < sorted.length && new Date(sorted[idx].createdAt) >= dayStart) {
      stock -= sorted[idx].quantity
      idx++
    }
  }
  return points.reverse()
}

export const exportMovementsCsv = (list: StockMovement[]) => {
  const header = ['Thời gian', 'Loại', 'SKU', 'Sản phẩm', 'Thay đổi', 'Tồn trước', 'Tồn sau', 'Đơn vị', 'Chứng từ', 'Lý do', 'Người thực hiện']
  const rows = list.map((m) => [
    new Date(m.createdAt).toLocaleString('vi-VN'),
    MOVEMENT_TYPES[m.type].label,
    m.sku,
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

export const timeAgo = (iso?: string, now = Date.now()) => {
  if (!iso) return '—'
  const diff = Math.max(0, now - new Date(iso).getTime())
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'Vừa xong'
  if (minutes < 60) return `${minutes} phút trước`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} giờ trước`
  const days = Math.floor(hours / 24)
  return days < 30 ? `${days} ngày trước` : new Date(iso).toLocaleDateString('vi-VN')
}
