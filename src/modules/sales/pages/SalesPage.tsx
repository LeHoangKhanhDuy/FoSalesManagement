import { useCallback, useRef, useState } from 'react'
import { Keyboard } from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/Card'
import { Kbd } from '@/components/ui/Kbd'
import { useHotkey } from '@/hooks/useHotkey'
import { CartPanel } from '@/modules/sales/components/CartPanel'
import { CategoryTabs } from '@/modules/sales/components/CategoryTabs'
import { PaymentModal } from '@/modules/sales/components/PaymentModal'
import { ProductGrid } from '@/modules/sales/components/ProductGrid'
import { ProductToolbar, type ViewMode } from '@/modules/sales/components/ProductToolbar'
import { SalesStats } from '@/modules/sales/components/SalesStats'
import { useInvoices } from '@/modules/sales/hooks/useInvoices'
import { useProducts } from '@/modules/sales/hooks/useProducts'
import { useSalesStats } from '@/modules/sales/hooks/useSalesStats'
import { salesService } from '@/modules/sales/services/sales.service'
import type { Order, PaymentMethod, Product } from '@/modules/sales/types/sales.types'

const SHORTCUTS = [
  { key: 'F2', label: 'Tìm sản phẩm' },
  { key: 'F4', label: 'Hóa đơn mới' },
  { key: 'F9', label: 'Thanh toán' },
  { key: 'Esc', label: 'Đóng / xóa tìm' },
]

export default function SalesPage() {
  const searchRef = useRef<HTMLInputElement>(null)
  const [view, setView] = useState<ViewMode>('grid')
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null)

  const productState = useProducts()
  const invoice = useInvoices()
  const { stats, applyOrder } = useSalesStats()
  const { active, totals } = invoice

  const handleAdd = useCallback(
    (product: Product) => {
      invoice.addItem(product)
    },
    [invoice],
  )

  /** Enter trong ô tìm: ưu tiên khớp mã vạch/SKU, sau đó nếu chỉ còn 1 kết quả thì thêm luôn */
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
    applyOrder(order)
    setCompletedOrder(order)
    return order
  }

  const handleClosePayment = () => {
    setPaymentOpen(false)
    if (completedOrder) {
      invoice.closeInvoice(active.id)
      setCompletedOrder(null)
      setTimeout(() => searchRef.current?.focus(), 50)
    }
  }

  useHotkey('F2', () => searchRef.current?.focus())
  useHotkey('F4', invoice.addInvoice)
  useHotkey('F9', openPayment, !paymentOpen)

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 lg:h-[calc(100dvh-160px)] lg:min-h-[620px] lg:flex-none lg:flex-row">
      {/* Cột trái: sản phẩm */}
      <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[22px] font-bold tracking-tight text-slate-900">Bán hàng</h1>
            <p className="text-sm text-slate-500">Tạo hóa đơn nhanh, quét mã vạch và thanh toán tại quầy</p>
          </div>
          <div className="hidden items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs text-slate-500 shadow-soft 2xl:flex">
            <Keyboard className="size-4 text-slate-400" />
            {SHORTCUTS.map((s) => (
              <span key={s.key} className="flex items-center gap-1.5">
                <Kbd>{s.key}</Kbd> {s.label}
              </span>
            ))}
          </div>
        </div>

        <SalesStats stats={stats} />

        <Card className="flex min-h-0 flex-1 flex-col">
          <div className="space-y-3 border-b border-slate-100 p-4">
            <ProductToolbar
              ref={searchRef}
              keyword={productState.keyword}
              onKeywordChange={productState.setKeyword}
              onSubmit={handleSearchSubmit}
              sort={productState.sort}
              onSortChange={productState.setSort}
              view={view}
              onViewChange={setView}
            />
            <CategoryTabs
              categories={productState.categories}
              value={productState.categoryId}
              counts={productState.countByCategory}
              onChange={productState.setCategoryId}
            />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <ProductGrid
              products={productState.filtered}
              cartItems={active.items}
              loading={productState.loading}
              view={view}
              onAdd={handleAdd}
            />
          </div>
        </Card>
      </section>

      {/* Cột phải: giỏ hàng */}
      <div className="w-full shrink-0 lg:w-[380px] 2xl:w-[420px]">
        <CartPanel
          invoices={invoice.invoices}
          active={active}
          totals={totals}
          onSwitchInvoice={invoice.switchInvoice}
          onAddInvoice={invoice.addInvoice}
          onCloseInvoice={invoice.closeInvoice}
          onCustomerChange={invoice.setCustomer}
          onQuantityChange={invoice.updateQuantity}
          onRemove={invoice.removeItem}
          onClear={invoice.clearItems}
          onDiscountChange={invoice.setDiscount}
          onNoteChange={invoice.setNote}
          onCheckout={openPayment}
        />
      </div>

      <PaymentModal open={paymentOpen} total={totals.total} onClose={handleClosePayment} onConfirm={handleConfirmPayment} />
    </div>
  )
}
