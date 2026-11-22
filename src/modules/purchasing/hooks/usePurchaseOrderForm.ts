import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import type { PurchaseOrderFormValues, PurchaseOrderItem, Supplier } from '@/modules/purchasing/types/purchasing.types'
import type { PoFormState } from '@/modules/purchasing/hooks/usePurchaseOrders'
import { calcPoTotals, productToPoItem } from '@/modules/purchasing/utils/purchasing.utils'
import type { Product } from '@/modules/sales/types/sales.types'
import { LOW_STOCK_THRESHOLD } from '@/modules/sales/utils/constants'

type Errors = Partial<Record<'supplierId' | 'expectedDate' | 'items', string>>

const lowStockItems = (products: Product[]) =>
  products.filter((p) => p.status !== 'inactive' && p.stock <= (p.minStock ?? LOW_STOCK_THRESHOLD)).map((p) => productToPoItem(p))

export function usePurchaseOrderForm(state: NonNullable<PoFormState>, products: Product[], suppliers: Supplier[], onSubmit: (v: PurchaseOrderFormValues, place: boolean) => void) {
  const [values, setValues] = useState<PurchaseOrderFormValues>(() => {
    if (state.mode === 'edit') {
      const o = state.order
      return { supplierId: o.supplierId, expectedDate: new Date(o.expectedDate), items: structuredClone(o.items), discount: o.discount, note: o.note }
    }
    const tomorrow = new Date(Date.now() + 86_400_000)
    return { supplierId: '', expectedDate: tomorrow, items: state.preset === 'low-stock' ? lowStockItems(products) : [], discount: 0, note: '' }
  })
  const [submitted, setSubmitted] = useState(false)

  const validate = (v: PurchaseOrderFormValues): Errors => {
    const e: Errors = {}
    if (!v.supplierId) e.supplierId = 'Vui lòng chọn nhà cung cấp'
    if (!v.expectedDate) e.expectedDate = 'Chọn ngày giao dự kiến'
    if (!v.items.length) e.items = 'Thêm ít nhất 1 sản phẩm'
    else if (v.items.some((i) => i.orderedQty <= 0)) e.items = 'Số lượng đặt phải lớn hơn 0'
    return e
  }

  const errors = useMemo(() => (submitted ? validate(values) : {}), [submitted, values])
  const totals = useMemo(() => calcPoTotals(values.items, values.discount), [values.items, values.discount])
  const supplier = suppliers.find((s) => s.id === values.supplierId)

  const set = <K extends keyof PurchaseOrderFormValues>(key: K, value: PurchaseOrderFormValues[K]) => setValues((v) => ({ ...v, [key]: value }))

  const addProduct = (p: Product) => {
    const exists = values.items.find((i) => i.productId === p.id)
    if (exists) {
      updateItem(p.id, { orderedQty: exists.orderedQty + Math.max(1, exists.packSize) })
      toast.info(`Đã tăng số lượng ${p.name}`)
      return
    }
    setValues((v) => ({ ...v, items: [...v.items, productToPoItem(p)] }))
  }

  const addLowStock = () => {
    const extra = lowStockItems(products).filter((i) => !values.items.some((x) => x.productId === i.productId))
    if (!extra.length) return toast.info('Không còn sản phẩm sắp hết nào để thêm')
    setValues((v) => ({ ...v, items: [...v.items, ...extra] }))
    toast.success(`Đã thêm ${extra.length} sản phẩm sắp hết hàng`)
  }

  const updateItem = (productId: string, patch: Partial<PurchaseOrderItem>) =>
    setValues((v) => ({ ...v, items: v.items.map((i) => (i.productId === productId ? { ...i, ...patch } : i)) }))

  const removeItem = (productId: string) => setValues((v) => ({ ...v, items: v.items.filter((i) => i.productId !== productId) }))

  const submit = (place: boolean) => {
    setSubmitted(true)
    if (Object.keys(validate(values)).length) return
    onSubmit(values, place)
  }

  return { values, errors, totals, supplier, set, addProduct, addLowStock, updateItem, removeItem, submit }
}
