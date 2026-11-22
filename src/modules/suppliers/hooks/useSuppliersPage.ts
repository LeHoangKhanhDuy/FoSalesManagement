import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/useDebounce'
import { formatCurrency } from '@/lib/format'
import { PATHS } from '@/routes/paths'
import { useSupplierData } from '@/modules/suppliers/hooks/useSupplierData'
import type { PaymentFormValues, Supplier, SupplierFilters, SupplierFormValues, SupplierStatus, SupplierTab, SuspendPayload } from '@/modules/suppliers/types/suppliers.types'
import {
  DEFAULT_SUPPLIER_FILTERS,
  EMPTY_SUMMARY,
  exportSuppliersCsv,
  matchSupplier,
  matchTab,
  SUPPLIER_PAGE_SIZE,
  SUPPLIER_TABS,
  sortSuppliers,
} from '@/modules/suppliers/utils/suppliers.utils'

export type SupplierFormState = { mode: 'create' } | { mode: 'edit'; supplier: Supplier } | null

export function useSuppliersPage() {
  const data = useSupplierData()
  const navigate = useNavigate()
  const [filters, setFilters] = useState<SupplierFilters>(DEFAULT_SUPPLIER_FILTERS)
  const [page, setPage] = useState(1)
  const [form, setForm] = useState<SupplierFormState>(null)
  const [saving, setSaving] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [payId, setPayId] = useState<string | null>(null)
  const [paying, setPaying] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null)
  const [suspendTarget, setSuspendTarget] = useState<Supplier | null>(null)
  const [suspending, setSuspending] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const keyword = useDebounce(filters.keyword, 250)
  const { suppliers, summaries } = data

  const updateFilter = useCallback(<K extends keyof SupplierFilters>(key: K, value: SupplierFilters[K]) => {
    setFilters((f) => ({ ...f, [key]: value }))
    setPage(1)
  }, [])
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_SUPPLIER_FILTERS)
    setPage(1)
  }, [])

  const searched = useMemo(
    () => suppliers.filter((s) => matchSupplier(s, keyword) && (filters.categoryId === 'all' || s.categoryIds.includes(filters.categoryId))),
    [suppliers, keyword, filters.categoryId],
  )
  const counts = useMemo(
    () => Object.fromEntries(SUPPLIER_TABS.map((t) => [t.value, searched.filter((s) => matchTab(s, summaries[s.id] ?? EMPTY_SUMMARY, t.value)).length])) as Record<SupplierTab, number>,
    [searched, summaries],
  )
  const filtered = useMemo(
    () => sortSuppliers(searched.filter((s) => matchTab(s, summaries[s.id] ?? EMPTY_SUMMARY, filters.tab)), filters.sort, summaries),
    [searched, summaries, filters.tab, filters.sort],
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / SUPPLIER_PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = useMemo(() => filtered.slice((currentPage - 1) * SUPPLIER_PAGE_SIZE, currentPage * SUPPLIER_PAGE_SIZE), [filtered, currentPage])
  const hasActiveFilters = filters.keyword !== '' || filters.tab !== 'all' || filters.categoryId !== 'all'

  const detail = useMemo(() => suppliers.find((s) => s.id === detailId) ?? null, [suppliers, detailId])
  const payTarget = useMemo(() => suppliers.find((s) => s.id === payId) ?? null, [suppliers, payId])

  const submitForm = async (values: SupplierFormValues) => {
    if (!form) return
    setSaving(true)
    try {
      const saved = await data.save(form.mode === 'edit' ? form.supplier.id : null, values)
      toast.success(form.mode === 'edit' ? `Đã cập nhật "${saved.name}"` : `Đã thêm nhà cung cấp "${saved.name}"`)
      setForm(null)
    } catch {
      toast.error('Lưu nhà cung cấp thất bại')
    } finally {
      setSaving(false)
    }
  }

  const { setStatus } = data
  const changeStatus = useCallback(
    async (s: Supplier, status: SupplierStatus) => {
      if (status === 'suspended') return setSuspendTarget(s)
      try {
        await setStatus(s.id, status)
        toast.success(status === 'active' ? `Đã mở lại hợp tác với ${s.name}` : `Đã ngừng hợp tác với ${s.name}`)
      } catch {
        toast.error('Cập nhật trạng thái thất bại')
      }
    },
    [setStatus],
  )

  const confirmSuspend = async (payload: SuspendPayload) => {
    if (!suspendTarget) return
    setSuspending(true)
    try {
      await setStatus(suspendTarget.id, 'suspended', payload)
      toast.success(`Đã tạm ngưng hợp tác với ${suspendTarget.name}`, {
        description: payload.until ? `Dự kiến mở lại ${new Date(payload.until).toLocaleDateString('vi-VN')}` : payload.reason,
      })
      setSuspendTarget(null)
    } catch {
      toast.error('Tạm ngưng thất bại')
    } finally {
      setSuspending(false)
    }
  }

  const submitPayment = async (values: PaymentFormValues) => {
    if (!payTarget) return
    setPaying(true)
    try {
      const p = await data.pay(payTarget.id, values)
      toast.success(`Đã ghi nhận ${p.code}: trả ${formatCurrency(p.amount)} cho ${payTarget.name}`)
      setPayId(null)
    } catch {
      toast.error('Ghi nhận thanh toán thất bại')
    } finally {
      setPaying(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await data.remove(deleteTarget.id)
      toast.success(`Đã xóa "${deleteTarget.name}"`)
      setDeleteTarget(null)
      setDetailId(null)
    } catch {
      toast.error('Không thể xóa nhà cung cấp đã có giao dịch')
    } finally {
      setDeleting(false)
    }
  }

  const createOrder = useCallback((s: Supplier) => navigate(PATHS.inventory, { state: { tab: 'purchasing', supplierId: s.id } }), [navigate])

  const showDebt = useCallback(() => {
    setFilters((f) => ({ ...f, tab: 'debt', sort: 'debt' }))
    setPage(1)
  }, [])

  const deleteHasOrders = !!deleteTarget && data.orders.some((o) => o.supplierId === deleteTarget.id)

  const exportCsv = () => {
    if (!filtered.length) return toast.info('Không có nhà cung cấp để xuất')
    exportSuppliersCsv(filtered, summaries)
    toast.success(`Đã xuất ${filtered.length} nhà cung cấp`)
  }

  return {
    data,
    filters,
    updateFilter,
    resetFilters,
    showDebt,
    hasActiveFilters,
    counts,
    filtered,
    paged,
    page: currentPage,
    setPage,
    form,
    saving,
    openCreate: useCallback(() => setForm({ mode: 'create' }), []),
    openEdit: useCallback((supplier: Supplier) => setForm({ mode: 'edit', supplier }), []),
    closeForm: useCallback(() => !saving && setForm(null), [saving]),
    submitForm,
    detail,
    openDetail: useCallback((s: Supplier) => setDetailId(s.id), []),
    closeDetail: useCallback(() => setDetailId(null), []),
    payTarget,
    paying,
    openPay: useCallback((s: Supplier) => setPayId(s.id), []),
    closePay: useCallback(() => !paying && setPayId(null), [paying]),
    submitPayment,
    deleteTarget,
    deleteHasOrders,
    deleting,
    requestDelete: useCallback((s: Supplier) => setDeleteTarget(s), []),
    closeDelete: useCallback(() => !deleting && setDeleteTarget(null), [deleting]),
    confirmDelete,
    changeStatus,
    suspendTarget,
    suspending,
    closeSuspend: useCallback(() => !suspending && setSuspendTarget(null), [suspending]),
    confirmSuspend,
    createOrder,
    exportCsv,
  }
}
