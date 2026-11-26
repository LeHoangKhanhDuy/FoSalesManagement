import { ArrowDownRight, ArrowUpRight, ReceiptText, Star } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/cn'
import { formatCurrency, formatDateTime, formatNumber } from '@/lib/format'
import type { PointLog } from '@/modules/customers/types/customers.types'
import { POINT_LOG_LABEL } from '@/modules/customers/utils/customers.utils'
import type { LegacyOrder as OrderRecord } from '@/modules/customers/mocks/orders.mock'
import { ORDER_STATUS } from '@/modules/orders/utils/orders.utils'

export function CustomerOrders({ orders }: { orders: OrderRecord[] }) {
  if (!orders.length) return <EmptyState icon={<ReceiptText />} title="Chưa có đơn hàng" className="py-10" />
  return (
    <ul className="divide-y divide-slate-100 rounded-lg border border-slate-100">
      {orders.map((o) => {
        const status = ORDER_STATUS[o.status]
        return (
          <li key={o.id} className="flex items-center gap-3 p-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-50 text-slate-400">
              <ReceiptText className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800">{o.code}</p>
              <p className="truncate text-xs text-slate-400">
                {formatDateTime(new Date(o.createdAt))} · {o.totals.itemCount} sản phẩm
              </p>
            </div>
            <p className="text-sm font-bold text-slate-900">{formatCurrency(o.totals.total)}</p>
            <Badge tone={status.tone} dot className="w-[104px] justify-center whitespace-nowrap">
              {status.label}
            </Badge>
          </li>
        )
      })}
    </ul>
  )
}

export function PointHistory({ logs }: { logs: PointLog[] }) {
  if (!logs.length) return <EmptyState icon={<Star />} title="Chưa có lịch sử điểm" className="py-10" />
  return (
    <ul className="divide-y divide-slate-100 rounded-lg border border-slate-100">
      {logs.map((l) => {
        const meta = POINT_LOG_LABEL[l.type]
        const plus = l.points >= 0
        return (
          <li key={l.id} className="flex items-center gap-3 p-3">
            <span className={cn('grid size-9 shrink-0 place-items-center rounded-lg', plus ? 'bg-primary-50 text-primary-600' : 'bg-rose-50 text-rose-500')}>
              {plus ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">
                <span className={meta.tone}>{meta.label}</span>
                {l.refCode && <span className="font-normal text-slate-500"> · {l.refCode}</span>}
              </p>
              <p className="truncate text-xs text-slate-400">
                {formatDateTime(new Date(l.createdAt))} · {l.reason ?? l.createdBy}
              </p>
            </div>
            <div className="text-right">
              <p className={cn('text-sm font-bold', plus ? 'text-primary-600' : 'text-rose-500')}>
                {plus ? '+' : ''}
                {formatNumber(l.points)}
              </p>
              <p className="text-[11px] text-slate-400">Còn {formatNumber(l.balance)}</p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
