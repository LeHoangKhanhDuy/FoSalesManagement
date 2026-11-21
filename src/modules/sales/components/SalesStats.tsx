import { DollarSign, PackageCheck, ReceiptText, TrendingDown, TrendingUp, UsersRound, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import { formatCompact, formatNumber } from '@/lib/format'
import type { SalesStats as Stats } from '@/modules/sales/types/sales.types'

interface StatItem {
  label: string
  value: string
  growth: number
  icon: LucideIcon
  tone: string
}

export function SalesStats({ stats }: { stats: Stats | null }) {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[76px] animate-pulse rounded-2xl border border-slate-100 bg-white" />
        ))}
      </div>
    )
  }

  const items: StatItem[] = [
    { label: 'Doanh thu hôm nay', value: formatCompact(stats.revenue), growth: stats.revenueGrowth, icon: DollarSign, tone: 'bg-primary-50 text-primary-600' },
    { label: 'Đơn hàng', value: formatNumber(stats.orders), growth: stats.ordersGrowth, icon: ReceiptText, tone: 'bg-sky-50 text-sky-600' },
    { label: 'Sản phẩm đã bán', value: formatNumber(stats.itemsSold), growth: stats.itemsSoldGrowth, icon: PackageCheck, tone: 'bg-amber-50 text-amber-600' },
    { label: 'Khách thành viên', value: formatNumber(stats.customers), growth: stats.customersGrowth, icon: UsersRound, tone: 'bg-violet-50 text-violet-600' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {items.map(({ label, value, growth, icon: Icon, tone }) => {
        const up = growth >= 0
        return (
          <div key={label} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-soft">
            <span className={cn('grid size-11 shrink-0 place-items-center rounded-xl', tone)}>
              <Icon className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs text-slate-500">{label}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-lg font-bold text-slate-900">{value}</p>
                <span className={cn('flex items-center gap-0.5 text-[11px] font-semibold', up ? 'text-primary-600' : 'text-rose-500')}>
                  {up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                  {Math.abs(growth)}%
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
