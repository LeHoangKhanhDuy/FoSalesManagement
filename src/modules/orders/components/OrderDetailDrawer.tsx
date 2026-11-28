import type { ReactNode } from 'react'
import { Ban, CircleAlert, CircleCheck, Clock, NotebookPen, Undo2, UserRound } from 'lucide-react'
import { ProductCode } from '@/components/common/ProductCode'
import { RetryButton } from '@/components/common/RetryButton'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Drawer'
import { useLastValue } from '@/hooks/useLastValue'
import { cn } from '@/lib/cn'
import { formatCurrency, formatDateTime, formatNumber } from '@/lib/format'
import type { OrderAction, OrderDetail, OrderPayment, OrderSummary } from '@/modules/orders/types/orders.types'
import { availableActions, ORDER_STATUS, PAYMENT_METHOD_LABEL } from '@/modules/orders/utils/orders.utils'
import { ProductThumb } from '@/modules/sales/components/ProductThumb'
import { TIER_LABEL } from '@/modules/sales/utils/constants'

interface OrderDetailDrawerProps {
  summary: OrderSummary | null
  order: OrderDetail | null
  loading: boolean
  error?: string
  printing: boolean
  onRetry: () => void
  onClose: () => void
  onAction: (order: OrderSummary, action: OrderAction, payments?: OrderPayment[]) => void
  onPrint: (order: OrderSummary) => void
}

const ACTION_BUTTONS: Record<OrderAction, { label: string; icon: typeof Ban; variant?: 'danger' }> = {
  cancel: { label: 'Hủy đơn', icon: Ban, variant: 'danger' },
  refund: { label: 'Hoàn tiền', icon: Undo2, variant: 'danger' },
  confirm: { label: 'Đã nhận tiền', icon: CircleCheck },
}

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="mt-6 first:mt-0">
    <h3 className="mb-2.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase">{title}</h3>
    {children}
  </section>
)

const Row = ({ label, children, className }: { label: ReactNode; children: ReactNode; className?: string }) => (
  <div className={cn('flex items-center justify-between gap-3', className)}>
    <dt className="min-w-0 text-slate-500">{label}</dt>
    <dd className="shrink-0 text-right font-medium text-slate-800">{children}</dd>
  </div>
)

const Discount = ({ label, amount }: { label: ReactNode; amount: number }) =>
  amount > 0 ? (
    <Row label={label}>
      <span className="text-rose-500">-{formatCurrency(amount)}</span>
    </Row>
  ) : null

const Skeleton = () => (
  <div className="space-y-2">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-100" />
    ))}
  </div>
)

const buildTimeline = (s: OrderSummary, d: OrderDetail | null) => {
  const confirmedAt = d?.payments.reduce<string | undefined>((max, p) => (p.confirmedAt && (!max || p.confirmedAt > max) ? p.confirmedAt : max), undefined)
  const items = [{ label: 'Tạo đơn', time: s.createdAt, icon: Clock, tone: 'bg-sky-50 text-sky-600' }]
  if (s.status !== 'pending' && s.status !== 'cancelled')
    items.push({ label: 'Đã thanh toán', time: d?.completedAt ?? confirmedAt ?? s.createdAt, icon: CircleCheck, tone: 'bg-primary-50 text-primary-600' })
  d?.returns.forEach((r) =>
    items.push({ label: `Hoàn ${formatCurrency(r.refundTotal)} · ${r.code}`, time: r.createdAt, icon: Undo2, tone: 'bg-rose-50 text-rose-500' }),
  )
  if (s.status === 'cancelled') items.push({ label: 'Đã hủy đơn', time: d?.cancelledAt ?? s.updatedAt, icon: Ban, tone: 'bg-slate-100 text-slate-500' })
  return items
}

const PaymentRow = ({ p }: { p: OrderPayment }) => (
  <div className="flex items-start justify-between gap-3">
    <dt className="min-w-0 text-slate-500">
      <span className="flex items-center gap-1.5">
        {PAYMENT_METHOD_LABEL[p.method]}
        {p.status === 'pending' && <Badge tone="warning">Chờ xác nhận</Badge>}
        {p.status === 'voided' && <Badge tone="neutral">Đã hủy</Badge>}
      </span>
      {p.reference && <span className="block truncate text-[11px] text-slate-400">Mã GD: {p.reference}</span>}
      {p.method === 'cash' && !!p.tendered && p.tendered !== p.amount && (
        <span className="block text-[11px] text-slate-400">Khách đưa {formatCurrency(p.tendered)}</span>
      )}
    </dt>
    <dd className={cn('shrink-0 font-medium', p.status === 'voided' ? 'text-slate-400 line-through' : 'text-slate-800')}>{formatCurrency(p.amount)}</dd>
  </div>
)

export function OrderDetailDrawer({ summary: openSummary, order: openOrder, loading, error, printing, onRetry, onClose, onAction, onPrint }: OrderDetailDrawerProps) {
  const summary = useLastValue(openSummary)
  const lastOrder = useLastValue(openOrder)
  if (!summary) return null
  const order = lastOrder?.id === summary.id ? lastOrder : null
  const view: OrderSummary = order ?? summary
  const status = ORDER_STATUS[view.status]
  const inactive = view.status === 'cancelled' || view.status === 'refunded'
  const totals = view.totals
  const orderPromos = order?.promotions.filter((p) => p.kind === 'order') ?? []
  const orderPromoTotal = orderPromos.reduce((s, p) => s + p.amount, 0)

  return (
    <Drawer
      open={!!openSummary}
      onClose={onClose}
      title={view.code}
      description={`${formatDateTime(new Date(view.createdAt))} | ${view.channel === 'pos' ? 'Tại quầy' : 'Online'}`}
      headerExtra={
        <Badge tone={status.tone} dot className="mt-1 whitespace-nowrap">
          {status.label}
        </Badge>
      }
      footer={
        <>
          <Button variant="outline" loading={printing} onClick={() => onPrint(view)}>
            In hóa đơn
          </Button>
          <div className="ml-auto flex gap-2">
            {availableActions(view).map((a) => {
              const { label, variant } = ACTION_BUTTONS[a]
              return (
                <Button key={a} variant={variant} onClick={() => onAction(view, a, order?.payments)}>
                  {label}
                </Button>
              )
            })}
          </div>
        </>
      }
    >
      {inactive && view.reason && (
        <div className="mb-6 flex gap-2.5 rounded-lg bg-rose-50 p-3.5 text-sm text-rose-700">
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          <p>
            <span className="font-semibold">{view.status === 'cancelled' ? 'Lý do hủy: ' : 'Lý do hoàn tiền: '}</span>
            {view.reason}
          </p>
        </div>
      )}
      {view.status === 'pending' && (
        <div className="mb-6 flex gap-2.5 rounded-lg bg-amber-50 p-3.5 text-sm text-amber-700">
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          <p>
            Còn {formatCurrency(view.pendingAmount)} chờ khách chuyển khoản. Kiểm tra tài khoản rồi bấm “Đã nhận tiền”.
          </p>
        </div>
      )}

      <Section title="Khách hàng">
        {view.customer ? (
          <div className="flex items-center gap-3 rounded-lg border border-slate-100 p-3">
            <Avatar name={view.customer.name} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-slate-900">{view.customer.name}</p>
              <p className="text-xs text-slate-500">
                {view.customer.phone} · {formatNumber(view.customer.points)} điểm
              </p>
            </div>
            <Badge tone={TIER_LABEL[view.customer.tier].tone}>{TIER_LABEL[view.customer.tier].label}</Badge>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-lg border border-dashed border-slate-200 p-3 text-sm text-slate-500">
            <span className="grid size-9 place-items-center rounded-full bg-slate-100">
              <UserRound className="size-4" />
            </span>
            Khách lẻ — không lưu thông tin
          </div>
        )}
      </Section>

      <Section title={`Sản phẩm (${totals.itemCount})`}>
        {!order && error ? (
          <div className="flex items-center justify-between gap-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-600">
            {error}
            <RetryButton onClick={onRetry} />
          </div>
        ) : !order || loading ? (
          <Skeleton />
        ) : (
          <ul className="divide-y divide-slate-100 rounded-lg border border-slate-100">
            {order.lines.map((l) => {
              const gross = l.price * l.quantity
              return (
                <li key={l.id} className={cn('flex items-center gap-3 p-3', l.isGift && 'bg-violet-50/50')}>
                  <ProductThumb categoryId={l.categoryId ?? ''} image={l.image} alt={l.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {l.name}
                      {l.isGift && <span className="ml-1.5 rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-bold text-violet-700">Quà tặng</span>}
                      {l.returnedQty > 0 && (
                        <span className="ml-1.5 rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-600">Đã trả {l.returnedQty}</span>
                      )}
                    </p>
                    <ProductCode sku={l.sku} barcode={l.barcode} extra={l.isGift ? `Tặng ${l.quantity}` : `SL: ${l.quantity} × ${formatCurrency(l.price)}`} />
                  </div>
                  <div className="text-right">
                    {l.productDiscount > 0 && <p className="text-[11px] text-slate-400 line-through">{formatCurrency(gross)}</p>}
                    <p className={cn('text-sm font-bold', l.productDiscount ? 'text-rose-600' : l.isGift ? 'text-violet-600' : 'text-slate-900')}>
                      {formatCurrency(gross - l.productDiscount)}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Section>

      <Section title="Thanh toán">
        <dl className="space-y-2.5 rounded-lg bg-slate-50 p-4 text-sm">
          <Row label="Tạm tính">{formatCurrency(totals.subtotal)}</Row>
          <Discount label="Khuyến mãi sản phẩm" amount={totals.productDiscount} />
          <Discount
            label={<span className="block truncate">{orderPromos.length ? `KM đơn: ${orderPromos.map((p) => p.name).join(', ')}` : 'Khuyến mãi đơn'}</span>}
            amount={orderPromoTotal || totals.orderDiscount}
          />
          <Discount label="Ưu đãi hạng thành viên" amount={totals.memberDiscount} />
          <Discount
            label={
              <span className="flex items-center gap-1.5">
                Mã giảm giá
                {view.voucherCode && <span className="rounded bg-primary-100 px-1.5 py-0.5 text-[10px] font-bold text-primary-700">{view.voucherCode}</span>}
              </span>
            }
            amount={totals.voucherDiscount}
          />
          <Row label={<span className="font-bold text-slate-900">Tổng cộng</span>} className="border-t border-slate-200 pt-2.5">
            <span className={cn('text-lg font-extrabold', inactive ? 'text-slate-400 line-through' : 'text-primary-600')}>{formatCurrency(totals.total)}</span>
          </Row>
          {order ? (
            order.payments.map((p) => <PaymentRow key={p.id} p={p} />)
          ) : (
            <Row label="Phương thức">{view.paymentMethods.map((m) => PAYMENT_METHOD_LABEL[m]).join(' + ')}</Row>
          )}
          {view.changeAmount > 0 && <Row label="Tiền thừa trả khách">{formatCurrency(view.changeAmount)}</Row>}
          {view.refundedTotal > 0 && (
            <Row label="Đã hoàn trả">
              <span className="text-rose-500">{formatCurrency(view.refundedTotal)}</span>
            </Row>
          )}
          {!!order?.pointsEarned && (
            <Row label="Điểm tích lũy">
              <span className="text-amber-600">+{formatNumber(order.pointsEarned)} điểm</span>
            </Row>
          )}
        </dl>
      </Section>

      {view.note && (
        <Section title="Ghi chú">
          <p className="flex gap-2 rounded-lg border border-slate-100 p-3 text-sm text-slate-600">
            <NotebookPen className="mt-0.5 size-4 shrink-0 text-slate-400" /> {view.note}
          </p>
        </Section>
      )}

      <Section title="Lịch sử">
        <ol className="relative space-y-4 pl-1">
          {buildTimeline(view, order).map((t, idx, all) => (
            <li key={`${t.label}-${idx}`} className="relative flex gap-3">
              {idx < all.length - 1 && <span className="absolute top-8 left-[15px] h-[calc(100%-16px)] w-px bg-slate-200" />}
              <span className={cn('relative grid size-8 shrink-0 place-items-center rounded-full', t.tone)}>
                <t.icon className="size-4" />
              </span>
              <div className="pt-1 text-sm">
                <p className="font-semibold text-slate-800">{t.label}</p>
                <p className="text-xs text-slate-400">
                  {formatDateTime(new Date(t.time))} | Nhân viên: {view.cashier}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Section>
    </Drawer>
  )
}
