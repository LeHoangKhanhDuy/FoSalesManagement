import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'
import { errorMessage, HttpError } from '@/lib/http'
import { formatCurrency } from '@/lib/format'
import type { SupplierServerError } from '@/modules/suppliers/hooks/useSupplierForm'
import { suppliersService } from '@/modules/suppliers/services/suppliers.service'
import type { PaymentFormValues, SupplierFormValues, SupplierListItem, SupplierStatus, SuspendPayload } from '@/modules/suppliers/types/suppliers.types'
import { errorDebt, SUPPLIER_ERROR, supplierFieldError } from '@/modules/suppliers/utils/suppliers.utils'

export type SupplierFormState = { mode: 'create'; code: string } | { mode: 'edit'; supplier: SupplierListItem } | null

interface Callbacks {
  onSaved: (item: SupplierListItem, created: boolean) => void
  onChanged: (item: SupplierListItem) => void
  onDeleted: (id: string) => void
  onStale: () => void
}

export function useSupplierActions(callbacks: Callbacks) {
  const handlers = useRef(callbacks)
  handlers.current = callbacks
  const [form, setForm] = useState<SupplierFormState>(null)
  const [saving, setSaving] = useState(false)
  const [serverError, setServerError] = useState<SupplierServerError | null>(null)
  const [payTarget, setPayTarget] = useState<SupplierListItem | null>(null)
  const [paying, setPaying] = useState(false)
  const payKey = useRef('')
  const [suspendTarget, setSuspendTarget] = useState<SupplierListItem | null>(null)
  const [suspending, setSuspending] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<SupplierListItem | null>(null)
  const [deleteBlocked, setDeleteBlocked] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleMissing = (e: unknown) => {
    if (!(e instanceof HttpError) || (e.status !== 404 && e.code !== SUPPLIER_ERROR.notFound)) return false
    toast.error('Nhà cung cấp không còn tồn tại')
    handlers.current.onStale()
    return true
  }

  const openCreate = useCallback(async () => {
    setServerError(null)
    const code = await suppliersService.nextCode().catch(() => '')
    setForm({ mode: 'create', code })
  }, [])

  const openEdit = useCallback((supplier: SupplierListItem) => {
    setServerError(null)
    setForm({ mode: 'edit', supplier })
  }, [])

  const submitForm = async (values: SupplierFormValues) => {
    if (!form || saving) return
    setSaving(true)
    try {
      const created = form.mode === 'create'
      const saved = created ? await suppliersService.create(values) : await suppliersService.update(form.supplier.id, values)
      handlers.current.onSaved(saved, created)
      toast.success(created ? `Đã thêm nhà cung cấp "${saved.name}"` : `Đã cập nhật "${saved.name}"`, created ? { description: `Mã ${saved.code}` } : undefined)
      setForm(null)
    } catch (e) {
      const fields = supplierFieldError(e)
      if (fields) setServerError({ errors: fields, values })
      else if (!handleMissing(e)) toast.error(errorMessage(e, 'Lưu nhà cung cấp thất bại'))
    } finally {
      setSaving(false)
    }
  }

  const applyStatus = async (s: SupplierListItem, status: SupplierStatus, suspend?: SuspendPayload) => {
    const saved = await suppliersService.setStatus(s.id, status, suspend)
    handlers.current.onChanged(saved)
    return saved
  }

  const changeStatus = useCallback(async (s: SupplierListItem, status: SupplierStatus) => {
    if (status === 'suspended') return setSuspendTarget(s)
    try {
      await applyStatus(s, status)
      toast.success(status === 'active' ? `Đã mở lại hợp tác với ${s.name}` : `Đã ngừng hợp tác với ${s.name}`)
      setDeleteTarget((t) => (t?.id === s.id ? null : t))
    } catch (e) {
      if (!handleMissing(e)) toast.error(errorMessage(e, 'Cập nhật trạng thái thất bại'))
    }
  }, [])

  const confirmSuspend = async (payload: SuspendPayload) => {
    if (!suspendTarget || suspending) return
    setSuspending(true)
    try {
      await applyStatus(suspendTarget, 'suspended', payload)
      toast.success(`Đã tạm ngưng hợp tác với ${suspendTarget.name}`, {
        description: payload.until ? `Dự kiến mở lại ${new Date(payload.until).toLocaleDateString('vi-VN')}` : payload.reason,
      })
      setSuspendTarget(null)
    } catch (e) {
      if (!handleMissing(e)) toast.error(errorMessage(e, 'Tạm ngưng thất bại'))
    } finally {
      setSuspending(false)
    }
  }

  const openPay = useCallback((s: SupplierListItem) => {
    payKey.current = crypto.randomUUID()
    setPayTarget(s)
  }, [])

  const submitPayment = async (values: PaymentFormValues) => {
    if (!payTarget || paying) return
    setPaying(true)
    try {
      const { payment, supplier } = await suppliersService.pay(payTarget.id, values, payKey.current)
      handlers.current.onChanged(supplier)
      toast.success(`Đã ghi nhận ${payment.code}: trả ${formatCurrency(payment.amount)} cho ${supplier.name}`)
      setPayTarget(null)
    } catch (e) {
      if (e instanceof HttpError) payKey.current = crypto.randomUUID()
      const debt = errorDebt(e)
      if (e instanceof HttpError && e.code === SUPPLIER_ERROR.paymentExceedsDebt && debt !== undefined) {
        setPayTarget((t) => (t ? { ...t, summary: { ...t.summary, debt, overdue: Math.min(t.summary.overdue, debt) } } : t))
        toast.warning(`Công nợ hiện tại chỉ còn ${formatCurrency(debt)}`, { description: 'Kiểm tra lại số tiền rồi xác nhận' })
        handlers.current.onStale()
      } else if (!handleMissing(e)) toast.error(errorMessage(e, 'Ghi nhận thanh toán thất bại'))
    } finally {
      setPaying(false)
    }
  }

  const requestDelete = useCallback((s: SupplierListItem) => {
    setDeleteBlocked(s.summary.orderCount > 0 || s.summary.purchased > 0 || s.summary.paid > 0)
    setDeleteTarget(s)
  }, [])

  const confirmDelete = async () => {
    if (!deleteTarget || deleting) return
    setDeleting(true)
    try {
      await suppliersService.remove(deleteTarget.id)
      handlers.current.onDeleted(deleteTarget.id)
      toast.success(`Đã xóa "${deleteTarget.name}"`)
      setDeleteTarget(null)
    } catch (e) {
      if (e instanceof HttpError && e.code === SUPPLIER_ERROR.hasTransactions) setDeleteBlocked(true)
      else if (!handleMissing(e)) toast.error(errorMessage(e, 'Xóa nhà cung cấp thất bại'))
    } finally {
      setDeleting(false)
    }
  }

  return {
    form,
    saving,
    serverError,
    openCreate,
    openEdit,
    closeForm: useCallback(() => !saving && setForm(null), [saving]),
    submitForm,
    changeStatus,
    suspendTarget,
    suspending,
    closeSuspend: useCallback(() => !suspending && setSuspendTarget(null), [suspending]),
    confirmSuspend,
    payTarget,
    paying,
    openPay,
    closePay: useCallback(() => !paying && setPayTarget(null), [paying]),
    submitPayment,
    deleteTarget,
    deleteBlocked,
    deleting,
    requestDelete,
    closeDelete: useCallback(() => !deleting && setDeleteTarget(null), [deleting]),
    confirmDelete,
  }
}
