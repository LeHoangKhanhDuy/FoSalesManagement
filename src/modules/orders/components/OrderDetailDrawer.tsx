import type { ReactNode } from 'react'
import { Ban, CircleAlert, CircleCheck, Clock, NotebookPen, Printer, Undo2, UserRound } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Drawer'
import { cn } from '@/lib/cn'
import { formatCurrency, formatDateTime } from '@/lib/format'
import type { OrderAction, OrderRecord } from '@/modules/orders/types/orders.types'
import { ORDER_STATUS } from '@/modules/orders/utils/orders.utils'
import { ProductThumb } from '@/modules/sales/components/ProductThumb'
import { PAYMENT_METHOD_LABEL, TIER_LABEL } from '@/modules/sales/utils/constants'
import { describeVoucher } from '@/modules/sales/utils/cart.utils'

interface OrderDetailDrawerProps {
  order: OrderRecord | null
  onClose: () => void
  onAction: (order: OrderRecord, action: OrderAction) => void
  onConfirmPayment: (order: OrderRecord) => void
  onPrint: (order: OrderRecord) => void
}

const Section = ({ title, children, className }: { title: string; children: ReactNode; className?: string }) => (
  <section className={cn('mt-6 first:mt-0', className)}>
    <h3 className="mb-2.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase">{title}</h3>
    {children}
  </section>
)

const Row = ({ label, children, className }: { label: ReactNode; children: ReactNode; className?: string }) => (
  <div className={cn('flex items-center justify-between gap-3', className)}>
    <dt className="text-slate-500">{label}</dt>
    <dd className="text-right font-medium text-slate-800">{children}</dd>
  </div>
)

export function OrderDetailDrawer({ order, onClose, onAction, onConfirmPayment, onPrint }: OrderDetailDrawerProps) {
  if (!order) return null
  const status = ORDER_STATUS[order.status]
  const inactive = order.status === 'cancelled' || order.status === 'refunded'

  const timeline = [
    { label: 'Tạo đơn', time: order.createdAt, icon: Clock, tone: 'bg-sky-50 text-sky-600' },
    order.status !== 'pending' &&
      order.paidAmount > 0 && { label: 'Đã thanh toán', time: order.createdAt, icon: CircleCheck, tone: 'bg-primary-50 text-primary-600' },
    order.status === 'cancelled' && { label: 'Đã hủy đơn', time: order.updatedAt ?? order.createdAt, icon: Ban, tone: 'bg-slate-100 text-slate-500' },
    order.status === 'refunded' && { label: 'Đã hoàn tiền', time: order.updatedAt ?? order.createdAt, icon: Undo2, tone: 'bg-rose-50 text-rose-500' },
  ].filter(Boolean) as { label: string; time: string; icon: typeof Clock; tone: string }[]

  return (
    <Drawer
      open
      onClose={onClose}
      title={order.code}
      description={
        <span className="flex items-center gap-1.5">
          {formatDateTime(new Date(order.createdAt))} |{' '}
          
          {order.channel === 'pos' ? 'Tại quầy' : 'Online'}
        </span>
      }
      headerExtra={
        <Badge tone={status.tone} dot className="mt-1 whitespace-nowrap">
          {status.label}
        </Badge>
      }
      footer={
        <>
          <Button variant="outline" leftIcon={<Printer className="size-4" />} onClick={() => onPrint(order)}>
            In hóa đơn
          </Button>
          <div className="ml-auto flex gap-2">
            {order.status === 'pending' && (
              <>
                <Button variant="danger" leftIcon={<Ban className="size-4" />} onClick={() => onAction(order, 'cancel')}>
                  Hủy đơn
                </Button>
                <Button leftIcon={<CircleCheck className="size-4" />} onClick={() => onConfirmPayment(order)}>
                  Đã thanh toán
                </Button>
              </>
            )}
            {order.status === 'completed' && (
              <Button variant="danger" leftIcon={<Undo2 className="size-4" />} onClick={() => onAction(order, 'refund')}>
                Hoàn tiền
              </Button>
            )}
          </div>
        </>
      }
    >
      {inactive && order.reason && (
        <div className="mb-6 flex gap-2.5 rounded-lg bg-rose-50 p-3.5 text-sm text-rose-700">
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          <p>
            <span className="font-semibold">{order.status === 'cancelled' ? 'Lý do hủy: ' : 'Lý do hoàn tiền: '}</span>
            {order.reason}
          </p>
        </div>
      )}
      {order.status === 'pending' && (
        <div className="mb-6 flex gap-2.5 rounded-lg bg-amber-50 p-3.5 text-sm text-amber-700">
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          <p>Đơn đang chờ khách chuyển khoản. Kiểm tra tài khoản rồi bấm “Đã thanh toán”.</p>
        </div>
      )}

      <Section title="Khách hàng">
        {order.customer ? (
          <div className="flex items-center gap-3 rounded-lg border border-slate-100 p-3">
            <Avatar name={order.customer.name} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-slate-900">{order.customer.name}</p>
              <p className="text-xs text-slate-500">
                {order.customer.phone} - {order.customer.points.toLocaleString('vi-VN')} điểm
              </p>
            </div>
            <Badge tone={TIER_LABEL[order.customer.tier].tone}>{TIER_LABEL[order.customer.tier].label}</Badge>
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

      <Section title={`Sản phẩm (${order.totals.itemCount})`}>
        <ul className="divide-y divide-slate-100 rounded-lg border border-slate-100">
          {order.items.map((i) => (
            <li key={i.productId} className="flex items-center gap-3 p-3">
              <ProductThumb categoryId={i.categoryId} image={i.image} fit={i.imageFit} alt={i.name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">{i.name}</p>
                <p className="text-xs text-slate-400">
                  {i.sku} | SL: {i.quantity} × {formatCurrency(i.price)}
                </p>
              </div>
              <p className="text-sm font-bold text-slate-900">{formatCurrency(i.price * i.quantity)}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Thanh toán">
        <dl className="space-y-2.5 rounded-lg bg-slate-50 p-4 text-sm">
          <Row label="Tạm tính">{formatCurrency(order.totals.subtotal)}</Row>
          {order.totals.discountAmount > 0 && (
            <Row
              label={
                <span>
                  Giảm giá
                  {order.voucher && (
                    <span
                      className="ml-1.5 rounded bg-primary-100 px-1.5 py-0.5 text-[10px] font-bold text-primary-700"
                      title={describeVoucher(order.voucher)}
                    >
                      {order.voucher.code}
                    </span>
                  )}
                </span>
              }
            >
              <span className="text-rose-500">-{formatCurrency(order.totals.discountAmount)}</span>
            </Row>
          )}
          <Row label={<span className="font-bold text-slate-900">Tổng cộng</span>} className="border-t border-slate-200 pt-2.5">
            <span className={cn('text-lg font-extrabold', inactive ? 'text-slate-400 line-through' : 'text-primary-600')}>
              {formatCurrency(order.totals.total)}
            </span>
          </Row>
          <Row
            label={
              <span className="flex items-center gap-1.5">
                {PAYMENT_METHOD_LABEL[order.paymentMethod]}
              </span>
            }
          >
            {order.paidAmount > 0 ? formatCurrency(order.paidAmount) : <span className="text-amber-600">Chưa thanh toán</span>}
          </Row>
          {order.changeAmount > 0 && <Row label="Tiền thừa trả khách">{formatCurrency(order.changeAmount)}</Row>}
        </dl>
      </Section>

      {order.note && (
        <Section title="Ghi chú">
          <p className="flex gap-2 rounded-lg border border-slate-100 p-3 text-sm text-slate-600">
            <NotebookPen className="mt-0.5 size-4 shrink-0 text-slate-400" /> {order.note}
          </p>
        </Section>
      )}

      <Section title="Lịch sử">
        <ol className="relative space-y-4 pl-1">
          {timeline.map((t, idx) => (
            <li key={t.label} className="relative flex gap-3">
              {idx < timeline.length - 1 && <span className="absolute top-8 left-[15px] h-[calc(100%-16px)] w-px bg-slate-200" />}
              <span className={cn('relative grid size-8 shrink-0 place-items-center rounded-full', t.tone)}>
                <t.icon className="size-4" />
              </span>
              <div className="pt-1 text-sm">
                <p className="font-semibold text-slate-800">{t.label}</p>
                <p className="text-xs text-slate-400">
                  {formatDateTime(new Date(t.time))} | Nhân viên: {order.cashier}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Section>
    </Drawer>
  )
}
