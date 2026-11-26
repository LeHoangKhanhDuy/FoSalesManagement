import type { BadgeProps } from '@/components/ui/Badge'
import type {
  DateRange,
  OrderAction,
  OrderFilters,
  OrderQuery,
  OrderStatus,
  OrderSummary,
  PaymentMethod,
  RefundMethod,
} from '@/modules/orders/types/orders.types'

export const PAGE_SIZE = 10

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  cash: 'Tiền mặt',
  transfer: 'Chuyển khoản',
  card: 'Thẻ',
  ewallet: 'Ví điện tử',
  points: 'Điểm',
}

export const REFUND_METHODS: RefundMethod[] = ['cash', 'transfer', 'card', 'ewallet']

export const ORDER_STATUS: Record<OrderStatus, { label: string; tone: NonNullable<BadgeProps['tone']> }> = {
  completed: { label: 'Hoàn thành', tone: 'success' },
  pending: { label: 'Chờ thanh toán', tone: 'warning' },
  cancelled: { label: 'Đã hủy', tone: 'neutral' },
  partially_refunded: { label: 'Hoàn một phần', tone: 'violet' },
  refunded: { label: 'Đã hoàn tiền', tone: 'danger' },
}

export const STATUS_TABS: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'pending', label: 'Chờ thanh toán' },
  { value: 'cancelled', label: 'Đã hủy' },
  { value: 'partially_refunded', label: 'Hoàn một phần' },
  { value: 'refunded', label: 'Hoàn tiền' },
]

export const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: 'today', label: 'Hôm nay' },
  { value: 'yesterday', label: 'Hôm qua' },
  { value: '7d', label: '7 ngày qua' },
  { value: '30d', label: '30 ngày qua' },
  { value: 'month', label: 'Tháng này' },
  { value: 'all', label: 'Toàn thời gian' },
]

export const SORT_OPTIONS: { value: OrderFilters['sort']; label: string }[] = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'oldest', label: 'Cũ nhất' },
  { value: 'total-desc', label: 'Tổng tiền cao → thấp' },
  { value: 'total-asc', label: 'Tổng tiền thấp → cao' },
]

export const ACTION_CONFIG: Record<OrderAction, { title: string; confirm: string; reasons: string[]; danger: boolean }> = {
  cancel: {
    title: 'Hủy đơn hàng',
    confirm: 'Xác nhận hủy',
    reasons: ['Khách không chuyển khoản', 'Khách đổi ý', 'Nhập sai đơn', 'Hết hàng'],
    danger: true,
  },
  refund: {
    title: 'Hoàn tiền đơn hàng',
    confirm: 'Xác nhận hoàn tiền',
    reasons: ['Sản phẩm lỗi', 'Sai sản phẩm', 'Hết hạn sử dụng', 'Khách trả hàng'],
    danger: true,
  },
  confirm: {
    title: 'Xác nhận đã nhận tiền',
    confirm: 'Đã nhận tiền',
    reasons: [],
    danger: false,
  },
}

export const isToday = (iso: string, now = new Date()) => new Date(iso).toDateString() === now.toDateString()

export const availableActions = (o: Pick<OrderSummary, 'status' | 'createdAt'>): OrderAction[] => {
  switch (o.status) {
    case 'pending':
      return ['confirm', 'cancel']
    case 'completed':
      return isToday(o.createdAt) ? ['refund', 'cancel'] : ['refund']
    case 'partially_refunded':
      return ['refund']
    default:
      return []
  }
}

export const refundableAmount = (o: Pick<OrderSummary, 'totals' | 'refundedTotal'>) => Math.max(0, o.totals.total - o.refundedTotal)

export const paymentSummary = (o: Pick<OrderSummary, 'paymentMethods' | 'paymentMethod'>) =>
  (o.paymentMethods.length ? o.paymentMethods : [o.paymentMethod]).map((m) => PAYMENT_METHOD_LABEL[m]).join(' + ')

const DAY = 86_400_000
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

export const getDateRange = (range: DateRange, custom: { from?: Date; to?: Date } = {}, now = new Date()): { from: Date; to: Date } | null => {
  const today = startOfDay(now)
  const tomorrow = new Date(today.getTime() + DAY)
  switch (range) {
    case 'custom':
      if (!custom.from && !custom.to) return null
      return {
        from: custom.from ? startOfDay(custom.from) : new Date(0),
        to: custom.to ? new Date(startOfDay(custom.to).getTime() + DAY) : tomorrow,
      }
    case 'today':
      return { from: today, to: tomorrow }
    case 'yesterday':
      return { from: new Date(today.getTime() - DAY), to: today }
    case '7d':
      return { from: new Date(today.getTime() - 6 * DAY), to: tomorrow }
    case '30d':
      return { from: new Date(today.getTime() - 29 * DAY), to: tomorrow }
    case 'month':
      return { from: new Date(today.getFullYear(), today.getMonth(), 1), to: tomorrow }
    default:
      return null
  }
}

export const toRangeParams = (filters: Pick<OrderFilters, 'range' | 'dateFrom' | 'dateTo'>) => {
  const range = getDateRange(filters.range, { from: filters.dateFrom, to: filters.dateTo })
  return range ? { from: range.from.toISOString(), to: range.to.toISOString() } : {}
}

export const toOrderQuery = (filters: OrderFilters, keyword: string): Omit<OrderQuery, 'page' | 'pageSize'> => ({
  ...toRangeParams(filters),
  keyword: keyword.trim() || undefined,
  status: filters.status === 'all' ? undefined : filters.status,
  payment: filters.payment === 'all' ? undefined : filters.payment,
  sort: filters.sort,
})

export const exportOrdersCsv = (orders: OrderSummary[]) => {
  const header = ['Mã đơn', 'Thời gian', 'Khách hàng', 'SĐT', 'Số SP', 'Tạm tính', 'Giảm giá', 'Mã giảm giá', 'Tổng tiền', 'Đã hoàn', 'Thanh toán', 'Chờ xác nhận', 'Trạng thái', 'Thu ngân', 'Ghi chú']
  const rows = orders.map((o) => [
    o.code,
    new Date(o.createdAt).toLocaleString('vi-VN'),
    o.customer?.name ?? 'Khách lẻ',
    o.customer?.phone ?? '',
    o.totals.itemCount,
    o.totals.subtotal,
    o.totals.discountAmount,
    o.voucherCode ?? '',
    o.totals.total,
    o.refundedTotal,
    paymentSummary(o),
    o.pendingAmount,
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
