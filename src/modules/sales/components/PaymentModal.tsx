import { memo, useCallback, useState } from 'react'
import { Banknote, CreditCard, Pencil, QrCode, Smartphone, type LucideIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/cn'
import { formatCurrency } from '@/lib/format'
import type { OrderDetail } from '@/modules/orders/types/orders.types'
import { PAYMENT_METHOD_LABEL } from '@/modules/orders/utils/orders.utils'
import { CashShortfallModal } from '@/modules/sales/components/CashShortfallModal'
import { CashTendered } from '@/modules/sales/components/CashTendered'
import { PaymentSuccess } from '@/modules/sales/components/PaymentSuccess'
import { PaymentSummary } from '@/modules/sales/components/PaymentSummary'
import { describeStockWarnings, useCheckout } from '@/modules/sales/hooks/useCheckout'
import { usePaymentForm, type NonCashMethod, type PaymentChoice } from '@/modules/sales/hooks/usePaymentForm'
import type { Invoice } from '@/modules/sales/types/sales.types'

const METHODS: { value: PaymentChoice; label: string; icon: LucideIcon }[] = [
  { value: 'cash', label: PAYMENT_METHOD_LABEL.cash, icon: Banknote },
  { value: 'transfer', label: PAYMENT_METHOD_LABEL.transfer, icon: QrCode },
  { value: 'card', label: PAYMENT_METHOD_LABEL.card, icon: CreditCard },
  { value: 'ewallet', label: PAYMENT_METHOD_LABEL.ewallet, icon: Smartphone },
]

const REFERENCE_LABEL: Record<NonCashMethod, string> = {
  transfer: 'Mã giao dịch chuyển khoản',
  card: 'Mã chuẩn chi / 4 số cuối thẻ',
  ewallet: 'Mã giao dịch ví',
}

interface PaymentModalProps {
  open: boolean
  invoice: Invoice
  printingId: string | null
  onClose: () => void
  onCreated: (order: OrderDetail) => void
  onPrint: (orderId: string) => void
}

export const PaymentModal = memo(function PaymentModal(props: PaymentModalProps) {
  if (!props.open) return null
  return <PaymentModalContent {...props} />
})

function PaymentModalContent({ invoice, printingId, onClose, onCreated, onPrint }: PaymentModalProps) {
  const checkout = useCheckout(invoice, onCreated)
  const due = checkout.quote?.totals.due ?? 0
  const form = usePaymentForm(due)
  const { submitting, order } = checkout
  const [shortfallOpen, setShortfallOpen] = useState(false)
  const handleClose = useCallback(() => {
    if (!submitting) onClose()
  }, [submitting, onClose])

  if (order) return <PaymentSuccess order={order} printing={printingId === order.id} onPrint={() => onPrint(order.id)} onClose={onClose} />

  const stockWarning = checkout.quote?.stockWarnings.length ? describeStockWarnings(checkout.quote.stockWarnings, invoice.items) : undefined
  const canSubmit = !!checkout.quote && !checkout.syncing && !stockWarning
  const submit = () => {
    if (!canSubmit || submitting) return
    if (form.status === 'empty') return toast.info('Nhập số tiền khách đưa')
    if (form.status === 'shortfall') return setShortfallOpen(true)
    checkout.submit(form.payments)
  }
  const method = form.nonCashMethod
  const methods = form.split ? METHODS.filter((m) => m.value !== 'cash') : METHODS

  if (shortfallOpen)
    return (
      <CashShortfallModal
        due={due}
        tendered={form.tendered}
        onBack={() => setShortfallOpen(false)}
        onPayRest={() => {
          form.payRestWithOther()
          setShortfallOpen(false)
        }}
      />
    )

  return (
    <Modal
      open
      onClose={handleClose}
      title="Thanh toán"
      description="Giá đã được máy chủ tính lại theo khuyến mãi, hạng thành viên và voucher"
      className="max-w-xl"
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={submitting}>
            Hủy
          </Button>
          <Button onClick={submit} loading={submitting} disabled={!canSubmit} className="min-w-40">
            {form.pending ? 'Tạo đơn chờ chuyển khoản' : 'Xác nhận thanh toán'}
          </Button>
        </>
      }
    >
      <PaymentSummary
        quote={checkout.quote ?? null}
        loading={checkout.quoteLoading}
        syncing={checkout.syncing}
        error={checkout.quoteError}
        stockWarning={stockWarning}
        customer={invoice.customer}
        voucherCode={invoice.voucher?.code}
        redeemPoints={checkout.redeemPoints}
        onRedeemChange={checkout.setRedeemPoints}
        onRetry={checkout.reloadQuote}
      />

      {checkout.quote && due > 0 && (
        <>
          {form.split && (
            <div className="mt-5 rounded-lg border border-slate-100 bg-slate-50/60 p-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Tiền mặt khách đưa</span>
                <span className="flex items-center gap-2 font-semibold text-slate-800">
                  {formatCurrency(form.cashPart)}
                  <button
                    type="button"
                    onClick={form.editCash}
                    className="grid size-7 cursor-pointer place-items-center rounded-md text-slate-400 transition hover:bg-white hover:text-primary-700"
                    aria-label="Sửa tiền mặt"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3 border-t border-slate-200 pt-2">
                <span className="font-semibold text-slate-800">Còn lại cần thanh toán</span>
                <span className="text-xl font-extrabold text-primary-700">{formatCurrency(form.rest)}</span>
              </div>
            </div>
          )}

          <p className="mt-5 mb-2 text-sm font-semibold text-slate-800">{form.split ? 'Thanh toán phần còn lại bằng' : 'Phương thức thanh toán'}</p>
          <div className={cn('grid gap-2', form.split ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4')}>
            {methods.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => form.setMethod(value)}
                className={cn(
                  'flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border p-3 text-xs font-semibold transition',
                  form.method === value ? 'border-primary-500 bg-primary-50 text-primary-700 ring-4 ring-primary-100' : 'border-slate-200 text-slate-600 hover:border-slate-300',
                )}
              >
                <Icon className="size-5" />
                {label}
              </button>
            ))}
          </div>

          {form.method === 'cash' && (
            <div className="mt-5">
              <CashTendered label="Tiền khách đưa" value={form.tendered} target={due} onChange={form.setTendered} onEnter={submit} />
              <div className={cn('mt-4 flex items-center justify-between rounded-lg px-4 py-3', form.shortfall === 0 ? 'bg-primary-50 text-primary-800' : 'bg-rose-50 text-rose-600')}>
                <span className="text-sm font-semibold">{form.shortfall === 0 ? 'Tiền thừa trả khách' : 'Còn thiếu'}</span>
                <span className="text-lg font-bold">{formatCurrency(form.shortfall || form.change)}</span>
              </div>
            </div>
          )}

          {method && (
            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                  {REFERENCE_LABEL[method]} <span className="font-normal text-slate-400">(không bắt buộc)</span>
                </span>
                <input
                  value={form.reference}
                  onChange={(e) => form.setReference(e.target.value)}
                  maxLength={60}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                />
              </label>
              {method === 'card' ? (
                <p className="rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-700">Quẹt thẻ trên máy POS rồi xác nhận khi giao dịch thành công.</p>
              ) : (
                <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-slate-200 p-3 text-sm">
                  <input type="checkbox" checked={form.received} onChange={(e) => form.setReceived(e.target.checked)} className="mt-0.5 size-4 accent-primary-600" />
                  <span>
                    <span className="font-semibold text-slate-800">Đã thấy tiền vào tài khoản</span>
                    <span className="block text-xs text-slate-500">
                      Bỏ trống nếu chưa nhận — đơn sẽ ở trạng thái “Chờ thanh toán”, xác nhận sau ở Quản lý đơn hàng.
                    </span>
                  </span>
                </label>
              )}
            </div>
          )}
        </>
      )}
    </Modal>
  )
}
