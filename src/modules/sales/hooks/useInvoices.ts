import { useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import type { Customer, Invoice, Product, Voucher } from '@/modules/sales/types/sales.types'
import { calcTotals, createInvoice, productToCartItem } from '@/modules/sales/utils/cart.utils'
import { MAX_INVOICES } from '@/modules/sales/utils/constants'

interface InvoiceState {
  invoices: Invoice[]
  activeId: string
}

const initState = (): InvoiceState => {
  const first = createInvoice(1)
  return { invoices: [first], activeId: first.id }
}

export function useInvoices() {
  const [state, setState] = useLocalStorage<InvoiceState>('fosales_pos_invoices', initState)
  const active = state.invoices.find((i) => i.id === state.activeId) ?? state.invoices[0] ?? createInvoice(1)
  const totals = useMemo(() => calcTotals(active), [active])

  const updateActive = useCallback(
    (updater: (inv: Invoice) => Invoice) =>
      setState((s) => ({
        ...s,
        invoices: s.invoices.map((inv) => (inv.id === s.activeId ? updater(inv) : inv)),
      })),
    [setState],
  )

  const addItem = useCallback(
    (product: Product, quantity = 1) => {
      if (product.stock <= 0) {
        toast.error(`${product.name} đã hết hàng`)
        return
      }
      const existing = active.items.find((i) => i.productId === product.id)
      if (existing && existing.quantity + quantity > product.stock) {
        toast.warning(`Chỉ còn ${product.stock} ${product.unit.toLowerCase()} trong kho`)
        return
      }
      updateActive((inv) => {
        const found = inv.items.find((i) => i.productId === product.id)
        const items = found
          ? inv.items.map((i) => (i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i))
          : [{ ...productToCartItem(product), quantity }, ...inv.items]
        return { ...inv, items }
      })
    },
    [active.items, updateActive],
  )

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      const item = active.items.find((i) => i.productId === productId)
      if (!item) return
      if (quantity > item.stock) {
        toast.warning(`Chỉ còn ${item.stock} ${item.unit.toLowerCase()} trong kho`)
        quantity = item.stock
      }
      updateActive((inv) => ({
        ...inv,
        items:
          quantity <= 0
            ? inv.items.filter((i) => i.productId !== productId)
            : inv.items.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
      }))
    },
    [active.items, updateActive],
  )

  const removeItem = useCallback(
    (productId: string) => updateActive((inv) => ({ ...inv, items: inv.items.filter((i) => i.productId !== productId) })),
    [updateActive],
  )

  const clearItems = useCallback(
    () => updateActive((inv) => ({ ...inv, items: [], voucher: null, note: '' })),
    [updateActive],
  )

  const setCustomer = useCallback(
    (customer: Customer | null) => updateActive((inv) => ({ ...inv, customer })),
    [updateActive],
  )
  const setVoucher = useCallback((voucher: Voucher | null) => updateActive((inv) => ({ ...inv, voucher })), [updateActive])
  const setNote = useCallback((note: string) => updateActive((inv) => ({ ...inv, note })), [updateActive])

  const addInvoice = useCallback(() => {
    if (state.invoices.length >= MAX_INVOICES) {
      toast.warning(`Tối đa ${MAX_INVOICES} hóa đơn cùng lúc`)
      return
    }
    setState((s) => {
      const nextIndex = Math.max(0, ...s.invoices.map((i) => Number(i.name.replace(/\D/g, '')) || 0)) + 1
      const inv = createInvoice(nextIndex)
      return { invoices: [...s.invoices, inv], activeId: inv.id }
    })
  }, [setState, state.invoices.length])

  const closeInvoice = useCallback(
    (id: string) =>
      setState((s) => {
        if (s.invoices.length === 1) {
          const fresh = createInvoice(1)
          return { invoices: [fresh], activeId: fresh.id }
        }
        const idx = s.invoices.findIndex((i) => i.id === id)
        const invoices = s.invoices.filter((i) => i.id !== id)
        const activeId = s.activeId === id ? invoices[Math.max(0, idx - 1)].id : s.activeId
        return { invoices, activeId }
      }),
    [setState],
  )

  const switchInvoice = useCallback((id: string) => setState((s) => ({ ...s, activeId: id })), [setState])

  return {
    invoices: state.invoices,
    active,
    totals,
    addItem,
    updateQuantity,
    removeItem,
    clearItems,
    setCustomer,
    setVoucher,
    setNote,
    addInvoice,
    closeInvoice,
    switchInvoice,
  }
}
