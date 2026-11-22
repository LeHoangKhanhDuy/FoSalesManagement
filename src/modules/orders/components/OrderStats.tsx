import { memo } from 'react'
import { CircleX, Clock, DollarSign, ReceiptText, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import { formatCompact, formatCurrency, formatNumber } from '@/lib/format'
import type { OrderStats as Stats } from '@/modules/orders/types/orders.types'

interface StatItem {
  label: string
  value: string
  hint: string
  icon: LucideIcon
  tone: string
}

export const OrderStats = memo(function OrderStats({ stats, loading }: { stats: Stats; loading: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[84px] animate-pulse rounded-lg bg-white" />
        ))}
      </div>
    )
  }

  const items: StatItem[] = [
    {
      label: 'Tổng doanh thu',
      value: formatCompact(stats.revenue),
      hint: 'Từ đơn hoàn thành',
      icon: DollarSign,
      tone: 'bg-primary-50 text-primary-600',
    },
    {
      label: 'Số đơn hàng',
      value: formatNumber(stats.orders),
      hint: `Trung bình: ${formatCurrency(stats.avgOrderValue)}/đơn`,
      icon: ReceiptText,
      tone: 'bg-sky-50 text-sky-600',
    },
    {
      label: 'Chờ thanh toán',
      value: formatNumber(stats.pending),
      hint: formatCurrency(stats.pendingAmount),
      icon: Clock,
      tone: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Hủy / Hoàn tiền',
      value: formatNumber(stats.cancelled),
      hint: formatCurrency(stats.cancelledAmount),
      icon: CircleX,
      tone: 'bg-rose-50 text-rose-500',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {items.map(({ label, value, hint, icon: Icon, tone }) => (
        <div key={label} className="flex items-center gap-3.5 rounded-lg bg-white p-4">
          <span className={cn('grid size-12 shrink-0 place-items-center rounded-lg', tone)}>
            <Icon className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-slate-500">{label}</p>
            <p className="text-xl font-bold tracking-tight text-slate-900">{value}</p>
            <p className="truncate text-[11px] text-slate-400">{hint}</p>
          </div>
        </div>
      ))}
    </div>
  )
})
