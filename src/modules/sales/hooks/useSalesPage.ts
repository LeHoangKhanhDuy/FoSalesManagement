import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner'
import { useHotkey } from '@/hooks/useHotkey'
import type { ViewMode } from '@/modules/sales/components/ProductToolbar'
import { useActivePromotions } from '@/modules/sales/hooks/useActivePromotions'
import { useInvoices } from '@/modules/sales/hooks/useInvoices'
import { useProducts } from '@/modules/sales/hooks/useProducts'
import { useReceiptPrinter } from '@/modules/orders/hooks/useReceiptPrinter'
import type { OrderDetail } from '@/modules/orders/types/orders.types'
import type { Product } from '@/modules/sales/types/sales.types'

export function useSalesPage() {
  const searchRef = useRef<HTMLInputElement>(null)
  const [view, setView] = useState<ViewMode>('grid')
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [completedOrder, setCompletedOrder] = useState<OrderDetail | null>(null)
  const printer = useReceiptPrinter()
  const productState = useProducts()
  const promo = useActivePromotions(productState.products)
  const invoice = useInvoices(promo.promotions, productState.products, promo.memberOf)
  const { active, totals, pricing } = invoice
  const focusSearch = useCallback(() => searchRef.current?.focus(), [])
  const addItemRef = useRef(invoice.addItem)
  addItemRef.current = invoice.addItem
  const handleAdd = useCallback((product: Product) => addItemRef.current(product), [])

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

  const handleScan = (code: string) => {
    const product = productState.findByCode(code)
    if (!product) {
      productState.setKeyword(code)
      toast.error(`Không tìm thấy sản phẩm có mã "${code}"`)
      return
    }
    invoice.addItem(product)
    productState.setKeyword('')
    toast.success(`Đã thêm ${product.name}`, { duration: 1200 })
  }

  const hasItems = active.items.length > 0
  const openPayment = useCallback(() => {
    if (!hasItems) {
      toast.info('Giỏ hàng đang trống')
      return
    }
    setPaymentOpen(true)
  }, [hasItems])

  const { decreaseStock } = productState
  const handleOrderCreated = useCallback(
    (order: OrderDetail) => {
      decreaseStock(order.lines)
      setCompletedOrder(order)
    },
    [decreaseStock],
  )

  const handleClosePayment = () => {
    setPaymentOpen(false)
    if (completedOrder) {
      invoice.closeInvoice(active.id)
      setCompletedOrder(null)
      setTimeout(focusSearch, 50)
    }
  }

  useBarcodeScanner(handleScan, { enabled: !paymentOpen })
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
    pricing,
    promoBadges: promo.badges,
    handleAdd,
    handleSearchSubmit,
    openPayment,
    handleOrderCreated,
    printer,
    handleClosePayment,
  }
}
