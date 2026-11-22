import { Banknote, CreditCard, QrCode, Smartphone, type LucideIcon } from 'lucide-react'
import type { BadgeProps } from '@/components/ui/Badge'
import type { PaymentMethod } from '@/modules/sales/types/sales.types'
import type { DateRange, OrderAction, OrderRecord, OrderSort, OrderStats, OrderStatus } from '@/modules/orders/types/orders.types'

export const PAGE_SIZE = 10

export const ORDER_STATUS: Record<OrderStatus, { label: string; tone: NonNullable<BadgeProps['tone']> }> = {
  completed: { label: 'Hoàn thành', tone: 'success' },
  pending: { label: 'Chờ thanh toán', tone: 'warning' },
  cancelled: { label: 'Đã hủy', tone: 'neutral' },
  refunded: { label: 'Đã hoàn tiền', tone: 'danger' },
}

export const STATUS_TABS: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'pending', label: 'Chờ thanh toán' },
  { value: 'cancelled', label: 'Đã hủy' },
  { value: 'refunded', label: 'Hoàn tiền' },
]

export const PAYMENT_ICON: Record<PaymentMethod, LucideIcon> = {
  cash: Banknote,
  transfer: QrCode,
  card: CreditCard,
  ewallet: Smartphone,
}

export const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: 'today', label: 'Hôm nay' },
  { value: 'yesterday', label: 'Hôm qua' },
  { value: '7d', label: '7 ngày qua' },
  { value: '30d', label: '30 ngày qua' },
  { value: 'month', label: 'Tháng này' },
  { value: 'all', label: 'Toàn thời gian' },
]

export const SORT_OPTIONS: { value: OrderSort; label: string }[] = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'oldest', label: 'Cũ nhất' },
  { value: 'total-desc', label: 'Tổng tiền cao → thấp' },
  { value: 'total-asc', label: 'Tổng tiền thấp → cao' },
]

export const ACTION_CONFIG: Record<OrderAction, { title: string; confirm: string; reasons: string[]; nextStatus: OrderStatus }> = {
  cancel: {
    title: 'Hủy đơn hàng',
    confirm: 'Xác nhận hủy',
    reasons: ['Khách đổi ý', 'Khách không thanh toán', 'Nhập sai đơn', 'Hết hàng'],
    nextStatus: 'cancelled',
  },
  refund: {
    title: 'Hoàn tiền đơn hàng',
    confirm: 'Xác nhận hoàn tiền',
    reasons: ['Sản phẩm lỗi', 'Sai sản phẩm', 'Hết hạn sử dụng', 'Khách trả hàng'],
    nextStatus: 'refunded',
  },
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

export const getDateRange = (
  range: DateRange,
  custom: { from?: Date; to?: Date } = {},
  now = new Date(),
): { from: Date; to: Date } | null => {
  const today = startOfDay(now)
  const tomorrow = new Date(today.getTime() + 86_400_000)
  switch (range) {
    case 'custom':
      if (!custom.from && !custom.to) return null
      return {
        from: custom.from ? startOfDay(custom.from) : new Date(0),
        to: custom.to ? new Date(startOfDay(custom.to).getTime() + 86_400_000) : tomorrow,
      }
    case 'today':
      return { from: today, to: tomorrow }
    case 'yesterday':
      return { from: new Date(today.getTime() - 86_400_000), to: today }
    case '7d':
      return { from: new Date(today.getTime() - 6 * 86_400_000), to: tomorrow }
    case '30d':
      return { from: new Date(today.getTime() - 29 * 86_400_000), to: tomorrow }
    case 'month':
      return { from: new Date(today.getFullYear(), today.getMonth(), 1), to: tomorrow }
    default:
      return null
  }
}

export const sortOrders = (orders: OrderRecord[], sort: OrderSort) => {
  const list = [...orders]
  switch (sort) {
    case 'oldest':
      return list.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    case 'total-desc':
      return list.sort((a, b) => b.totals.total - a.totals.total)
    case 'total-asc':
      return list.sort((a, b) => a.totals.total - b.totals.total)
    default:
      return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }
}

export const calcOrderStats = (orders: OrderRecord[]): OrderStats => {
  const stats: OrderStats = { revenue: 0, orders: orders.length, avgOrderValue: 0, pending: 0, pendingAmount: 0, cancelled: 0, cancelledAmount: 0 }
  let completed = 0
  for (const o of orders) {
    if (o.status === 'completed') {
      stats.revenue += o.totals.total
      completed += 1
    } else if (o.status === 'pending') {
      stats.pending += 1
      stats.pendingAmount += o.totals.total
    } else {
      stats.cancelled += 1
      stats.cancelledAmount += o.totals.total
    }
  }
  stats.avgOrderValue = completed ? Math.round(stats.revenue / completed) : 0
  return stats
}

export const exportOrdersCsv = (orders: OrderRecord[], paymentLabel: Record<PaymentMethod, string>) => {
  const header = ['Mã đơn', 'Thời gian', 'Khách hàng', 'SĐT', 'Số SP', 'Tạm tính', 'Giảm giá', 'Mã giảm giá', 'Tổng tiền', 'Thanh toán', 'Trạng thái', 'Thu ngân', 'Ghi chú']
  const rows = orders.map((o) => [
    o.code,
    new Date(o.createdAt).toLocaleString('vi-VN'),
    o.customer?.name ?? 'Khách lẻ',
    o.customer?.phone ?? '',
    o.totals.itemCount,
    o.totals.subtotal,
    o.totals.discountAmount,
    o.voucher?.code ?? '',
    o.totals.total,
    paymentLabel[o.paymentMethod],
    ORDER_STATUS[o.status].label,
    o.cashier,
    o.reason ?? o.note ?? '',
  ])
  const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `don-hang-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
