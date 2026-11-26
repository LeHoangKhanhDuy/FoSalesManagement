import { CircleCheck, Clock, Printer, ShoppingCart } from 'lucide-react'
import { ProductCode } from '@/components/common/ProductCode'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/cn'
import { formatCurrency, formatDateTime, formatNumber } from '@/lib/format'
import type { OrderDetail } from '@/modules/orders/types/orders.types'
import { PAYMENT_METHOD_LABEL } from '@/modules/orders/utils/orders.utils'

interface PaymentSuccessProps {
  order: OrderDetail
  printing: boolean
  onPrint: () => void
  onClose: () => void
}

const Discount = ({ label, value }: { label: string; value: number }) =>
  value > 0 ? (
    <div className="flex justify-between gap-3 text-rose-500">
      <dt className="truncate">{label}</dt>
      <dd className="shrink-0">-{formatCurrency(value)}</dd>
    </div>
  ) : null

export function PaymentSuccess({ order, printing, onPrint, onClose }: PaymentSuccessProps) {
  const pending = order.status === 'pending'
  const t = order.totals
  const Icon = pending ? Clock : CircleCheck

  return (
    <Modal open onClose={onClose} hideClose className="max-w-md">
      <div className="text-center">
        <div className={cn('mx-auto grid size-16 place-items-center rounded-full ring-8', pending ? 'bg-amber-50 ring-amber-50/60' : 'bg-primary-50 ring-primary-50/60')}>
          <Icon className={cn('size-9', pending ? 'text-amber-500' : 'text-primary-600')} />
        </div>
        <h2 className="mt-4 text-xl font-bold text-slate-900">{pending ? 'Đã tạo đơn — chờ nhận tiền' : 'Thanh toán thành công'}</h2>
        <p className="mt-1 text-sm text-slate-500">
          Mã đơn <span className="font-semibold text-slate-800">{order.code}</span> · {formatDateTime(new Date(order.createdAt))}
        </p>
        {pending && (
          <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Còn {formatCurrency(order.pendingAmount)} chưa xác nhận. Vào Quản lý đơn hàng bấm “Đã nhận tiền” khi tiền về.
          </p>
        )}
      </div>

      <div className="mt-5 rounded-lg border border-dashed border-slate-200 bg-slate-50/60 p-4 text-sm">
        <ul className="max-h-48 space-y-1.5 overflow-y-auto">
          {order.lines.map((l) => (
            <li key={l.id} className="flex justify-between gap-3">
              <span className="min-w-0 text-slate-600">
                <span className="block truncate">
                  {l.quantity} × {l.name}
                  {l.isGift && <span className="ml-1.5 rounded bg-violet-100 px-1.5 text-[10px] font-bold text-violet-700">Quà tặng</span>}
                </span>
                <ProductCode barcode={l.barcode} className="text-[11px]" />
              </span>
              <span className="shrink-0 font-medium text-slate-800">{formatCurrency(l.price * l.quantity - l.productDiscount)}</span>
            </li>
          ))}
        </ul>
        <div className="my-3 border-t border-dashed border-slate-200" />
        <dl className="space-y-1.5">
          <Discount label="Khuyến mãi đơn" value={t.orderDiscount} />
          <Discount label="Ưu đãi hạng thành viên" value={t.memberDiscount} />
          <Discount label={`Mã ${order.voucherCode ?? 'giảm giá'}`} value={t.voucherDiscount} />
          <div className="flex justify-between text-base font-bold text-slate-900">
            <dt>Tổng cộng</dt>
            <dd className="text-primary-600">{formatCurrency(t.total)}</dd>
          </div>
          {order.payments.map((p) => (
            <div key={p.id} className="flex justify-between gap-3 text-slate-500">
              <dt>
                {PAYMENT_METHOD_LABEL[p.method]}
                {p.status === 'pending' && <span className="ml-1.5 text-[11px] font-semibold text-amber-600">(chờ xác nhận)</span>}
              </dt>
              <dd>{formatCurrency(p.method === 'cash' && p.tendered ? p.tendered : p.amount)}</dd>
            </div>
          ))}
          {order.changeAmount > 0 && (
            <div className="flex justify-between font-semibold text-slate-800">
              <dt>Tiền thừa trả khách</dt>
              <dd>{formatCurrency(order.changeAmount)}</dd>
            </div>
          )}
          {order.pointsEarned > 0 && order.customer && (
            <div className="flex justify-between text-amber-600">
              <dt>Điểm tích lũy ({order.customer.name})</dt>
              <dd className="font-semibold">+{formatNumber(order.pointsEarned)} điểm</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <Button variant="outline" leftIcon={<Printer className="size-4" />} loading={printing} onClick={onPrint}>
          In hóa đơn
        </Button>
        <Button leftIcon={<ShoppingCart className="size-4" />} onClick={onClose} autoFocus>
          Đơn mới
        </Button>
      </div>
    </Modal>
  )
}
