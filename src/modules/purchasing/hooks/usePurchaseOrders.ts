import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/useDebounce'
import { removeAccents } from '@/lib/format'
import { productsService } from '@/modules/products/services/products.service'
import { purchasingService } from '@/modules/purchasing/services/purchasing.service'
import type { PurchaseOrder, PurchaseOrderFormValues, PurchaseOrderStatus} from '@/modules/purchasing/types/purchasing.types'
import type { Supplier } from '@/modules/suppliers/types/suppliers.types'
import { OPEN_STATUSES, PO_PAGE_SIZE, PO_STATUS_TABS } from '@/modules/purchasing/utils/purchasing.utils'
import type { Product } from '@/modules/sales/types/sales.types'

export type PoTab = PurchaseOrderStatus | 'all' | 'open'
export type PoFormState = { mode: 'create'; preset?: 'low-stock'; supplierId?: string } | { mode: 'edit'; order: PurchaseOrder } | null

const matchTab = (o: PurchaseOrder, tab: PoTab) =>
  tab === 'all' || (tab === 'open' ? OPEN_STATUSES.includes(o.status) : tab === 'ordered' ? o.status === 'ordered' || o.status === 'receiving' : o.status === tab)

export function usePurchaseOrders(onStockChanged: () => void) {
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTabState] = useState<PoTab>('open')
  const [keyword, setKeywordState] = useState('')
  const [page, setPage] = useState(1)
  const [form, setForm] = useState<PoFormState>(null)
  const [saving, setSaving] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [cancelTarget, setCancelTarget] = useState<PurchaseOrder | null>(null)
  const [receivingId, setReceivingId] = useState<string | null>(null)
  const debounced = useDebounce(keyword, 250)

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([purchasingService.getPurchaseOrders(), purchasingService.getSuppliers(), productsService.getProducts()])
      .then(([o, s, p]) => {
        setOrders(o)
        setSuppliers(s)
        setProducts(p)
      })
      .catch(() => toast.error('Không tải được đơn nhập hàng'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  const setTab = useCallback((t: PoTab) => {
    setTabState(t)
    setPage(1)
  }, [])
  const setKeyword = useCallback((k: string) => {
    setKeywordState(k)
    setPage(1)
  }, [])

  const searched = useMemo(() => {
    const k = removeAccents(debounced.trim())
    return orders.filter((o) => !k || o.code.toLowerCase().includes(k) || removeAccents(o.supplierName).includes(k) || o.items.some((i) => removeAccents(i.name).includes(k)))
  }, [orders, debounced])

  const counts = useMemo(() => Object.fromEntries(PO_STATUS_TABS.map((t) => [t.value, searched.filter((o) => matchTab(o, t.value)).length])) as Record<PoTab, number>, [searched])
  const filtered = useMemo(() => searched.filter((o) => matchTab(o, tab)), [searched, tab])
  const totalPages = Math.max(1, Math.ceil(filtered.length / PO_PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = useMemo(() => filtered.slice((currentPage - 1) * PO_PAGE_SIZE, currentPage * PO_PAGE_SIZE), [filtered, currentPage])

  const replace = (order: PurchaseOrder) => setOrders((list) => (list.some((o) => o.id === order.id) ? list.map((o) => (o.id === order.id ? order : o)) : [order, ...list]))

  const detail = useMemo(() => orders.find((o) => o.id === detailId) ?? null, [orders, detailId])
  const receivingOrder = useMemo(() => orders.find((o) => o.id === receivingId) ?? null, [orders, receivingId])

  const submitForm = async (values: PurchaseOrderFormValues, place: boolean) => {
    if (!form) return
    setSaving(true)
    try {
      const saved = await purchasingService.savePurchaseOrder(form.mode === 'edit' ? form.order.id : null, values, place)
      replace(saved)
      toast.success(place ? `Đã gửi đơn ${saved.code} cho nhà cung cấp` : `Đã lưu nháp ${saved.code}`)
      setForm(null)
    } catch {
      toast.error('Lưu đơn đặt hàng thất bại')
    } finally {
      setSaving(false)
    }
  }

  const placeOrder = useCallback(async (order: PurchaseOrder) => {
    try {
      replace(await purchasingService.placeOrder(order.id))
      toast.success(`Đã gửi đơn ${order.code} cho nhà cung cấp`)
    } catch {
      toast.error('Gửi đơn thất bại')
    }
  }, [])

  const confirmCancel = async (reason: string) => {
    if (!cancelTarget) return
    try {
      replace(await purchasingService.cancelOrder(cancelTarget.id, reason))
      toast.success(`Đã hủy đơn ${cancelTarget.code}`)
      setCancelTarget(null)
    } catch {
      toast.error('Hủy đơn thất bại')
    }
  }

  const startReceiving = useCallback((order: PurchaseOrder) => {
    setDetailId(null)
    setReceivingId(order.id)
  }, [])

  const onReceivingUpdate = useCallback(
    (order: PurchaseOrder, stockChanged = false) => {
      replace(order)
      if (stockChanged) {
        productsService.getProducts().then(setProducts)
        onStockChanged()
      }
    },
    [onStockChanged],
  )

  return {
    orders,
    suppliers,
    products,
    loading,
    reload: load,
    tab,
    setTab,
    keyword,
    setKeyword,
    counts,
    filtered,
    paged,
    page: currentPage,
    setPage,
    form,
    openCreate: useCallback((preset?: 'low-stock', supplierId?: string) => setForm({ mode: 'create', preset, supplierId }), []),
    openEdit: useCallback((order: PurchaseOrder) => setForm({ mode: 'edit', order }), []),
    closeForm: useCallback(() => !saving && setForm(null), [saving]),
    submitForm,
    saving,
    detail,
    openDetail: useCallback((order: PurchaseOrder) => setDetailId(order.id), []),
    closeDetail: useCallback(() => setDetailId(null), []),
    placeOrder,
    cancelTarget,
    requestCancel: useCallback((order: PurchaseOrder) => setCancelTarget(order), []),
    closeCancel: useCallback(() => setCancelTarget(null), []),
    confirmCancel,
    receivingOrder,
    startReceiving,
    closeReceiving: useCallback(() => setReceivingId(null), []),
    onReceivingUpdate,
  }
}
