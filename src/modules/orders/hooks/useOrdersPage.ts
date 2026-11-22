import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/useDebounce'
import { removeAccents } from '@/lib/format'
import { ordersService } from '@/modules/orders/services/orders.service'
import type { OrderAction, OrderFilters, OrderRecord, OrderStatus } from '@/modules/orders/types/orders.types'
import { calcOrderStats, exportOrdersCsv, getDateRange, PAGE_SIZE, sortOrders } from '@/modules/orders/utils/orders.utils'
import { PAYMENT_METHOD_LABEL } from '@/modules/sales/utils/constants'

const DEFAULT_FILTERS: OrderFilters = { keyword: '', status: 'all', range: '30d', payment: 'all', sort: 'newest' }

export function useOrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<OrderFilters>(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [actionTarget, setActionTarget] = useState<{ order: OrderRecord; action: OrderAction } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const keyword = useDebounce(filters.keyword, 250)

  const load = useCallback(() => {
    setLoading(true)
    ordersService
      .getOrders()
      .then(setOrders)
      .catch(() => toast.error('Không tải được danh sách đơn hàng'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  const updateFilter = useCallback(<K extends keyof OrderFilters>(key: K, value: OrderFilters[K]) => {
    setFilters((f) => ({ ...f, [key]: value }))
    setPage(1)
  }, [])

  const updateDateRange = useCallback((dateFrom?: Date, dateTo?: Date) => {
    setFilters((f) => ({
      ...f,
      dateFrom,
      dateTo,
      range: dateFrom || dateTo ? 'custom' : DEFAULT_FILTERS.range,
    }))
    setPage(1)
  }, [])

  const updateRangePreset = useCallback((range: OrderFilters['range']) => {
    setFilters((f) => ({ ...f, range, dateFrom: undefined, dateTo: undefined }))
    setPage(1)
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    setPage(1)
  }, [])

  const baseFiltered = useMemo(() => {
    const range = getDateRange(filters.range, { from: filters.dateFrom, to: filters.dateTo })
    const k = removeAccents(keyword.trim())
    return orders.filter((o) => {
      if (range) {
        const t = new Date(o.createdAt)
        if (t < range.from || t >= range.to) return false
      }
      if (filters.payment !== 'all' && o.paymentMethod !== filters.payment) return false
      if (!k) return true
      return (
        o.code.toLowerCase().includes(k) ||
        (o.customer && (removeAccents(o.customer.name).includes(k) || o.customer.phone.includes(k)))
      )
    })
  }, [orders, filters.range, filters.dateFrom, filters.dateTo, filters.payment, keyword])

  const statusCounts = useMemo(() => {
    const counts: Record<OrderStatus | 'all', number> = { all: baseFiltered.length, completed: 0, pending: 0, cancelled: 0, refunded: 0 }
    baseFiltered.forEach((o) => (counts[o.status] += 1))
    return counts
  }, [baseFiltered])

  const stats = useMemo(() => calcOrderStats(baseFiltered), [baseFiltered])

  const filtered = useMemo(() => {
    const list = filters.status === 'all' ? baseFiltered : baseFiltered.filter((o) => o.status === filters.status)
    return sortOrders(list, filters.sort)
  }, [baseFiltered, filters.status, filters.sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage],
  )

  const selectedOrder = useMemo(() => orders.find((o) => o.id === selectedId) ?? null, [orders, selectedId])
  const hasActiveFilters =
    filters.keyword !== '' || filters.status !== 'all' || filters.range !== DEFAULT_FILTERS.range || filters.payment !== 'all'

  const replaceOrder = (updated: OrderRecord) => setOrders((list) => list.map((o) => (o.id === updated.id ? updated : o)))

  const openDetail = useCallback((order: OrderRecord) => setSelectedId(order.id), [])
  const closeDetail = useCallback(() => setSelectedId(null), [])
  const requestAction = useCallback((order: OrderRecord, action: OrderAction) => setActionTarget({ order, action }), [])
  const closeAction = useCallback(() => !submitting && setActionTarget(null), [submitting])

  const submitAction = async (reason: string) => {
    if (!actionTarget) return
    const { order, action } = actionTarget
    setSubmitting(true)
    try {
      const updated =
        action === 'cancel' ? await ordersService.cancelOrder(order.id, reason) : await ordersService.refundOrder(order.id, reason)
      replaceOrder(updated)
      toast.success(action === 'cancel' ? `Đã hủy đơn ${order.code}` : `Đã hoàn tiền đơn ${order.code}`)
      setActionTarget(null)
    } catch {
      toast.error('Thao tác thất bại, vui lòng thử lại')
    } finally {
      setSubmitting(false)
    }
  }

  const confirmPayment = useCallback(async (order: OrderRecord) => {
    try {
      replaceOrder(await ordersService.confirmPayment(order.id))
      toast.success(`Đã xác nhận thanh toán đơn ${order.code}`)
    } catch {
      toast.error('Xác nhận thanh toán thất bại')
    }
  }, [])

  const printOrder = useCallback((order: OrderRecord) => {
    toast.info(`Đang in hóa đơn ${order.code}...`)
    window.print()
  }, [])

  const exportCsv = () => {
    if (filtered.length === 0) return toast.info('Không có đơn hàng để xuất')
    exportOrdersCsv(filtered, PAYMENT_METHOD_LABEL)
    toast.success(`Đã xuất ${filtered.length} đơn hàng`)
  }

  return {
    loading,
    filters,
    updateFilter,
    updateDateRange,
    updateRangePreset,
    resetFilters,
    hasActiveFilters,
    statusCounts,
    stats,
    filtered,
    paged,
    page: currentPage,
    setPage,
    selectedOrder,
    openDetail,
    closeDetail,
    actionTarget,
    requestAction,
    closeAction,
    submitAction,
    submitting,
    confirmPayment,
    printOrder,
    exportCsv,
    reload: load,
  }
}
