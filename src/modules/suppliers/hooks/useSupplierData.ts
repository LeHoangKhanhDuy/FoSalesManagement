import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { catalogService } from '@/modules/categories/services/catalog.service'
import { purchasingService } from '@/modules/purchasing/services/purchasing.service'
import type { PurchaseOrder } from '@/modules/purchasing/types/purchasing.types'
import type { Category } from '@/modules/sales/types/sales.types'
import { suppliersService } from '@/modules/suppliers/services/suppliers.service'
import type { PaymentFormValues, Supplier, SupplierFormValues, SupplierPayment, SupplierStatus, SupplierSummary, SuspendPayload } from '@/modules/suppliers/types/suppliers.types'
import { summarizeSupplier } from '@/modules/suppliers/utils/suppliers.utils'

export function useSupplierData() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [payments, setPayments] = useState<SupplierPayment[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(() => {
    setLoading(true)
    Promise.all([suppliersService.getSuppliers(), purchasingService.getPurchaseOrders(), suppliersService.getPayments(), catalogService.getCategories()])
      .then(([s, o, p, c]) => {
        setSuppliers(s)
        setOrders(o)
        setPayments(p)
        setCategories(c)
      })
      .catch(() => toast.error('Không tải được danh sách nhà cung cấp'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(reload, [reload])

  const summaries = useMemo(() => {
    const now = Date.now()
    return Object.fromEntries(suppliers.map((s) => [s.id, summarizeSupplier(s, orders, payments, now)])) as Record<string, SupplierSummary>
  }, [suppliers, orders, payments])

  const stats = useMemo(() => {
    const list = Object.values(summaries)
    return {
      total: suppliers.length,
      active: suppliers.filter((s) => s.status === 'active').length,
      suspended: suppliers.filter((s) => s.status === 'suspended').length,
      openOrders: list.reduce((n, m) => n + m.openOrders, 0),
      purchased30: orders
        .flatMap((o) => o.receipts)
        .filter((r) => Date.now() - new Date(r.receivedAt).getTime() <= 30 * 86_400_000)
        .reduce((s, r) => s + r.value, 0),
      debt: list.reduce((s, m) => s + m.debt, 0),
      debtors: list.filter((m) => m.debt > 0).length,
      overdue: list.reduce((s, m) => s + m.overdue, 0),
      overdueCount: list.filter((m) => m.overdue > 0).length,
    }
  }, [summaries, suppliers, orders])

  const save = async (id: string | null, values: SupplierFormValues) => {
    const saved = id ? await suppliersService.updateSupplier(id, values) : await suppliersService.createSupplier(values)
    setSuppliers((list) => (id ? list.map((s) => (s.id === id ? saved : s)) : [saved, ...list]))
    if (id) setOrders((list) => list.map((o) => (o.supplierId === id ? { ...o, supplierName: saved.name } : o)))
    return saved
  }

  const setStatus = async (id: string, status: SupplierStatus, suspend?: SuspendPayload) => {
    const saved = await suppliersService.setStatus(id, status, suspend)
    setSuppliers((list) => list.map((s) => (s.id === id ? saved : s)))
  }

  const remove = async (id: string) => {
    await suppliersService.deleteSupplier(id)
    setSuppliers((list) => list.filter((s) => s.id !== id))
  }

  const pay = async (supplierId: string, values: PaymentFormValues) => {
    const payment = await suppliersService.recordPayment(supplierId, values)
    setPayments((list) => [payment, ...list])
    return payment
  }

  return { suppliers, orders, payments, categories, loading, reload, summaries, stats, save, setStatus, remove, pay }
}
