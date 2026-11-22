import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useHotkey } from '@/hooks/useHotkey'
import type { ViewMode } from '@/modules/sales/components/ProductToolbar'
import { useInvoices } from '@/modules/sales/hooks/useInvoices'
import { useProducts } from '@/modules/sales/hooks/useProducts'
import { salesService } from '@/modules/sales/services/sales.service'
import type { Order, PaymentMethod, Product } from '@/modules/sales/types/sales.types'

export function useSalesPage() {
  const searchRef = useRef<HTMLInputElement>(null)
  const [view, setView] = useState<ViewMode>('grid')
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null)

  const productState = useProducts()
  const invoice = useInvoices()
  const { active, totals } = invoice

  const focusSearch = useCallback(() => searchRef.current?.focus(), [])

  const handleAdd = useCallback((product: Product) => invoice.addItem(product), [invoice])

  const handleSearchSubmit = () => {
    const { keyword, findByCode, filtered, setKeyword } = productState
    if (!keyword.trim()) return
    const exact = findByCode(keyword) ?? (filtered.length === 1 ? filtered[0] : undefined)
    if (exact) {
      invoice.addItem(exact)
      setKeyword('')
    } else if (filtered.length === 0) {
      toast.error(`Không tìm thấy sản phẩm "${keyword}"`)
    }
  }

  const openPayment = () => {
    if (active.items.length === 0) {
      toast.info('Giỏ hàng đang trống')
      return
    }
    setPaymentOpen(true)
  }

  const handleConfirmPayment = async (method: PaymentMethod, paidAmount: number) => {
    const order = await salesService.createOrder(
      {
        items: active.items.map(({ productId, price, quantity }) => ({ productId, price, quantity })),
        customerId: active.customer?.id ?? null,
        discount: active.discount,
        note: active.note,
        paymentMethod: method,
        paidAmount,
      },
      { products: productState.products, customer: active.customer },
    )
    productState.decreaseStock(order.items)
    setCompletedOrder(order)
    return order
  }

  const handleClosePayment = () => {
    setPaymentOpen(false)
    if (completedOrder) {
      invoice.closeInvoice(active.id)
      setCompletedOrder(null)
      setTimeout(focusSearch, 50)
    }
  }

  useHotkey('F2', focusSearch)
  useHotkey('F4', invoice.addInvoice)
  useHotkey('F9', openPayment, !paymentOpen)

  return {
    searchRef,
    view,
    setView,
    paymentOpen,
    productState,
    invoice,
    active,
    totals,
    handleAdd,
    handleSearchSubmit,
    openPayment,
    handleConfirmPayment,
    handleClosePayment,
  }
}
