import { Card } from '@/components/ui/Card'
import { CartPanel } from '@/modules/sales/components/CartPanel'
import { CategoryTabs } from '@/modules/sales/components/CategoryTabs'
import { PaymentModal } from '@/modules/sales/components/PaymentModal'
import { ProductGrid } from '@/modules/sales/components/ProductGrid'
import { ProductToolbar } from '@/modules/sales/components/ProductToolbar'
import { useSalesPage } from '@/modules/sales/hooks/useSalesPage'

export default function SalesPage() {
  const {
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
  } = useSalesPage()

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 lg:h-[calc(100dvh-160px)] lg:min-h-[620px] lg:flex-none lg:flex-row">
      <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
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
          onVoucherChange={invoice.setVoucher}
          onNoteChange={invoice.setNote}
          onCheckout={openPayment}
        />
      </div>

      <PaymentModal open={paymentOpen} total={totals.total} onClose={handleClosePayment} onConfirm={handleConfirmPayment} />
    </div>
  )
}
