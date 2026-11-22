import { memo, useCallback } from 'react'
import { NotebookPen, ShoppingBasket, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Kbd } from '@/components/ui/Kbd'
import { formatCurrency } from '@/lib/format'
import type { Customer, Invoice, InvoiceTotals, Voucher } from '@/modules/sales/types/sales.types'
import { CartItemRow } from '@/modules/sales/components/CartItemRow'
import { CustomerPicker } from '@/modules/sales/components/CustomerPicker'
import { InvoiceTabs } from '@/modules/sales/components/InvoiceTabs'
import { VoucherInput } from '@/modules/sales/components/VoucherInput'

interface CartPanelProps {
  invoices: Invoice[]
  active: Invoice
  totals: InvoiceTotals
  onSwitchInvoice: (id: string) => void
  onAddInvoice: () => void
  onCloseInvoice: (id: string) => void
  onCustomerChange: (c: Customer | null) => void
  onQuantityChange: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
  onClear: () => void
  onVoucherChange: (voucher: Voucher | null) => void
  onNoteChange: (note: string) => void
  onCheckout: () => void
}

export const CartPanel = memo(function CartPanel(props: CartPanelProps) {
  const { active, totals, onVoucherChange } = props
  const voucher = active.voucher ?? null
  const removeVoucher = useCallback(() => onVoucherChange(null), [onVoucherChange])
  const empty = active.items.length === 0

  return (
    <aside className="flex min-h-[560px] flex-col rounded-lg bg-white lg:h-full lg:min-h-0">
      <div className="border-b border-slate-100 p-3">
        <InvoiceTabs
          invoices={props.invoices}
          activeId={active.id}
          onSwitch={props.onSwitchInvoice}
          onAdd={props.onAddInvoice}
          onClose={props.onCloseInvoice}
        />
      </div>

      <div className="space-y-3 p-4 pb-2">
        <CustomerPicker customer={active.customer} onChange={props.onCustomerChange} />
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-slate-900">
            Giỏ hàng <span className="font-medium text-slate-400">({totals.itemCount} sản phẩm)</span>
          </p>
          {!empty && (
            <button
              onClick={props.onClear}
              className="flex cursor-pointer items-center gap-1 text-xs font-semibold text-slate-400 hover:text-rose-500"
            >
              Xóa tất cả
            </button>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2">
        {empty ? (
          <EmptyState
            icon={<ShoppingBasket />}
            title="Chưa có sản phẩm nào"
            description="Chọn sản phẩm bên trái hoặc quét mã vạch để thêm vào hóa đơn."
            className="h-full"
          />
        ) : (
          <ul className="space-y-0.5 pb-2">
            {active.items.map((item, idx) => (
              <CartItemRow
                key={item.productId}
                item={item}
                index={idx + 1}
                onQuantityChange={props.onQuantityChange}
                onRemove={props.onRemove}
              />
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-3 border-t border-dashed border-slate-200 p-4">
        <label className="flex h-9 items-center gap-2 rounded-lg bg-slate-50 px-3 focus-within:ring-2 focus-within:ring-primary-100">
          <NotebookPen className="size-4 text-slate-400" />
          <input
            value={active.note}
            onChange={(e) => props.onNoteChange(e.target.value)}
            placeholder="Ghi chú đơn hàng..."
            className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400"
          />
        </label>

        <VoucherInput voucher={voucher} subtotal={totals.subtotal} onApply={onVoucherChange} onRemove={removeVoucher} />

        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Tạm tính</dt>
            <dd className="font-semibold text-slate-800">{formatCurrency(totals.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">
              Giảm giá
              {voucher && totals.discountAmount > 0 && (
                <span className="ml-1.5 rounded bg-primary-50 px-1.5 py-0.5 text-[10px] font-bold text-primary-700">
                  {voucher.code}
                </span>
              )}
            </dt>
            <dd className={totals.discountAmount > 0 ? 'font-semibold text-rose-500' : 'font-semibold text-slate-400'}>
              {totals.discountAmount > 0 ? `-${formatCurrency(totals.discountAmount)}` : formatCurrency(0)}
            </dd>
          </div>
          <div className="flex items-end justify-between border-t border-slate-100 pt-3">
            <dt>
              <span className="block font-bold text-slate-900">Khách cần trả</span>
              <span className="text-[11px] text-slate-400">Đã bao gồm VAT</span>
            </dt>
            <dd className="text-2xl font-extrabold tracking-tight text-primary-600">{formatCurrency(totals.total)}</dd>
          </div>
        </dl>

        <Button size="lg" className="w-full" disabled={empty} onClick={props.onCheckout} leftIcon={<Wallet className="size-5" />}>
          Thanh toán
          <Kbd className="ml-1 border-white/30 bg-white/15 text-white">F9</Kbd>
        </Button>
      </div>
    </aside>
  )
})
