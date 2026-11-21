import { useEffect, useMemo, useState } from 'react'
import { Banknote, CircleCheck, CreditCard, Printer, QrCode, ShoppingCart, Smartphone, type LucideIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/cn'
import { formatCurrency, formatDateTime, formatNumber, parseNumber } from '@/lib/format'
import type { Order, PaymentMethod } from '@/modules/sales/types/sales.types'
import { suggestCashAmounts } from '@/modules/sales/utils/cart.utils'
import { PAYMENT_METHOD_LABEL } from '@/modules/sales/utils/constants'

const METHODS: { value: PaymentMethod; icon: LucideIcon }[] = [
  { value: 'cash', icon: Banknote },
  { value: 'transfer', icon: QrCode },
  { value: 'card', icon: CreditCard },
  { value: 'ewallet', icon: Smartphone },
]

interface PaymentModalProps {
  open: boolean
  total: number
  onClose: () => void
  onConfirm: (method: PaymentMethod, paidAmount: number) => Promise<Order>
}

/** QR minh họa (giả lập) — thay bằng VietQR từ BE khi tích hợp */
function FakeQr({ seed }: { seed: number }) {
  const cells = useMemo(() => {
    const out: boolean[] = []
    let x = seed || 1
    for (let i = 0; i < 21 * 21; i++) {
      x = (x * 1103515245 + 12345) & 0x7fffffff
      out.push(x % 3 === 0)
    }
    return out
  }, [seed])
  const finder = (r: number, c: number) =>
    [
      [0, 0],
      [0, 14],
      [14, 0],
    ].some(([fr, fc]) => r >= fr && r < fr + 7 && c >= fc && c < fc + 7)
  const finderOn = (r: number, c: number) => {
    const lr = r % 14 === r ? r : r - 14
    const lc = c % 14 === c ? c : c - 14
    const edge = lr === 0 || lr === 6 || lc === 0 || lc === 6
    const core = lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4
    return edge || core
  }
  return (
    <svg viewBox="0 0 21 21" className="size-40" shapeRendering="crispEdges">
      {cells.map((on, i) => {
        const r = Math.floor(i / 21)
        const c = i % 21
        const fill = finder(r, c) ? finderOn(r, c) : on
        return fill ? <rect key={i} x={c} y={r} width={1} height={1} fill="#0f172a" /> : null
      })}
    </svg>
  )
}

export function PaymentModal({ open, total, onClose, onConfirm }: PaymentModalProps) {
  const [method, setMethod] = useState<PaymentMethod>('cash')
  const [paid, setPaid] = useState(total)
  const [submitting, setSubmitting] = useState(false)
  const [order, setOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (open) {
      setMethod('cash')
      setPaid(total)
      setOrder(null)
    }
  }, [open, total])

  const isCash = method === 'cash'
  const paidAmount = isCash ? paid : total
  const change = paidAmount - total
  const suggestions = suggestCashAmounts(total)

  const submit = async () => {
    if (paidAmount < total) {
      toast.error('Số tiền khách đưa chưa đủ')
      return
    }
    setSubmitting(true)
    try {
      const created = await onConfirm(method, paidAmount)
      setOrder(created)
      toast.success(`Thanh toán thành công đơn ${created.code}`)
    } catch {
      toast.error('Thanh toán thất bại, vui lòng thử lại')
    } finally {
      setSubmitting(false)
    }
  }

  // Màn hình hóa đơn sau khi thanh toán
  if (order) {
    return (
      <Modal open={open} onClose={onClose} hideClose className="max-w-md">
        <div className="text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-primary-50 ring-8 ring-primary-50/60">
            <CircleCheck className="size-9 text-primary-600" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-900">Thanh toán thành công</h2>
          <p className="mt-1 text-sm text-slate-500">
            Mã đơn <span className="font-semibold text-slate-800">{order.code}</span> · {formatDateTime(new Date(order.createdAt))}
          </p>
        </div>

        <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-4 text-sm">
          <ul className="space-y-1.5">
            {order.items.map((i) => (
              <li key={i.productId} className="flex justify-between gap-3">
                <span className="truncate text-slate-600">
                  {i.quantity} × {i.name}
                </span>
                <span className="shrink-0 font-medium text-slate-800">{formatCurrency(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="my-3 border-t border-dashed border-slate-200" />
          <dl className="space-y-1.5">
            {order.totals.discountAmount > 0 && (
              <div className="flex justify-between text-rose-500">
                <dt>Giảm giá</dt>
                <dd>-{formatCurrency(order.totals.discountAmount)}</dd>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-slate-900">
              <dt>Tổng cộng</dt>
              <dd className="text-primary-600">{formatCurrency(order.totals.total)}</dd>
            </div>
            <div className="flex justify-between text-slate-500">
              <dt>{PAYMENT_METHOD_LABEL[order.paymentMethod]}</dt>
              <dd>{formatCurrency(order.paidAmount)}</dd>
            </div>
            {order.changeAmount > 0 && (
              <div className="flex justify-between font-semibold text-slate-800">
                <dt>Tiền thừa trả khách</dt>
                <dd>{formatCurrency(order.changeAmount)}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button variant="outline" leftIcon={<Printer className="size-4" />} onClick={() => window.print()}>
            In hóa đơn
          </Button>
          <Button leftIcon={<ShoppingCart className="size-4" />} onClick={onClose} autoFocus>
            Đơn mới
          </Button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal
      open={open}
      onClose={() => !submitting && onClose()}
      title="Thanh toán"
      description="Chọn phương thức và xác nhận số tiền"
      className="max-w-xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button onClick={submit} loading={submitting} className="min-w-40">
            Xác nhận thanh toán
          </Button>
        </>
      }
    >
      <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 p-5 text-white">
        <p className="text-sm text-primary-100">Khách cần trả</p>
        <p className="mt-1 text-3xl font-extrabold tracking-tight">{formatCurrency(total)}</p>
      </div>

      <p className="mt-5 mb-2 text-sm font-semibold text-slate-800">Phương thức thanh toán</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {METHODS.map(({ value, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setMethod(value)}
            className={cn(
              'flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-semibold transition',
              method === value
                ? 'border-primary-500 bg-primary-50 text-primary-700 ring-4 ring-primary-100'
                : 'border-slate-200 text-slate-600 hover:border-slate-300',
            )}
          >
            <Icon className="size-5" />
            {PAYMENT_METHOD_LABEL[value]}
          </button>
        ))}
      </div>

      {isCash && (
        <div className="mt-5">
          <label className="mb-2 block text-sm font-semibold text-slate-800">Tiền khách đưa</label>
          <div className="flex h-12 items-center rounded-xl border border-slate-200 px-4 focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-100">
            <input
              autoFocus
              inputMode="numeric"
              value={paid ? formatNumber(paid) : ''}
              onChange={(e) => setPaid(parseNumber(e.target.value))}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              className="w-full text-lg font-bold text-slate-900 outline-none"
              placeholder="0"
            />
            <span className="font-semibold text-slate-400">đ</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => setPaid(s)}
                className={cn(
                  'h-8 cursor-pointer rounded-lg border px-3 text-xs font-semibold transition',
                  paid === s
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-slate-200 text-slate-600 hover:border-primary-300',
                )}
              >
                {formatNumber(s)}
              </button>
            ))}
          </div>
          <div
            className={cn(
              'mt-4 flex items-center justify-between rounded-xl px-4 py-3',
              change >= 0 ? 'bg-primary-50 text-primary-800' : 'bg-rose-50 text-rose-600',
            )}
          >
            <span className="text-sm font-semibold">{change >= 0 ? 'Tiền thừa trả khách' : 'Còn thiếu'}</span>
            <span className="text-lg font-bold">{formatCurrency(Math.abs(change))}</span>
          </div>
        </div>
      )}

      {method === 'transfer' && (
        <div className="mt-5 flex flex-col items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/60 p-5 sm:flex-row">
          <div className="rounded-xl bg-white p-2 shadow-soft">
            <FakeQr seed={total} />
          </div>
          <dl className="space-y-1.5 text-sm">
            <div>
              <dt className="text-xs text-slate-400">Ngân hàng</dt>
              <dd className="font-semibold text-slate-800">Vietcombank</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Số tài khoản</dt>
              <dd className="font-semibold text-slate-800">0123 456 789</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Chủ tài khoản</dt>
              <dd className="font-semibold text-slate-800">CONG TY FOTECH</dd>
            </div>
            <p className="pt-1 text-[11px] text-slate-400">* Mã QR minh họa — sẽ tạo VietQR thật khi kết nối BE</p>
          </dl>
        </div>
      )}

      {(method === 'card' || method === 'ewallet') && (
        <p className="mt-5 rounded-xl bg-sky-50 px-4 py-3 text-sm text-sky-700">
          Vui lòng thực hiện giao dịch trên {method === 'card' ? 'máy POS' : 'ứng dụng ví'} và xác nhận khi hoàn tất.
        </p>
      )}
    </Modal>
  )
}
