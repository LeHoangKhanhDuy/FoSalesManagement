import { memo } from 'react'
import { AlarmClock, HandCoins, PackageCheck, Truck, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import { formatCompact, formatNumber } from '@/lib/format'

interface Stats {
  total: number
  active: number
  suspended: number
  openOrders: number
  purchased30: number
  debt: number
  debtors: number
  overdue: number
  overdueCount: number
}

interface Props {
  stats: Stats
  loading: boolean
  onShowDebt: () => void
}

export const SupplierStats = memo(function SupplierStats({ stats, loading, onShowDebt }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[84px] animate-pulse rounded-lg bg-white" />
        ))}
      </div>
    )
  }

  const items: { label: string; value: string; hint: string; icon: LucideIcon; tone: string; action?: () => void; alert?: boolean }[] = [
    { label: 'Nhà cung cấp', value: formatNumber(stats.total), hint: stats.suspended ? `${stats.active} đang hợp tác · ${stats.suspended} tạm ngưng` : `${stats.active} đang hợp tác`, icon: Truck, tone: 'bg-primary-50 text-primary-600' },
    { label: 'Nhập hàng 30 ngày', value: formatCompact(stats.purchased30), hint: `${stats.openOrders} đơn đang chờ giao`, icon: PackageCheck, tone: 'bg-sky-50 text-sky-600' },
    { label: 'Nợ phải trả', value: formatCompact(stats.debt), hint: `${stats.debtors} nhà cung cấp còn nợ`, icon: HandCoins, tone: 'bg-amber-50 text-amber-600', action: onShowDebt },
    {
      label: 'Quá hạn thanh toán',
      value: formatCompact(stats.overdue),
      hint: stats.overdueCount ? `${stats.overdueCount} nhà cung cấp cần trả ngay` : 'Không có khoản quá hạn',
      icon: AlarmClock,
      tone: 'bg-rose-50 text-rose-500',
      action: onShowDebt,
      alert: stats.overdue > 0,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {items.map(({ label, value, hint, icon: Icon, tone, action, alert }) => (
        <button
          key={label}
          type="button"
          disabled={!action}
          onClick={action}
          className="flex items-center gap-3.5 rounded-lg bg-white p-4 text-left transition enabled:cursor-pointer enabled:hover:ring-2 enabled:hover:ring-primary-100"
        >
          <span className={cn('relative grid size-12 shrink-0 place-items-center rounded-lg', tone)}>
            <Icon className="size-5" />
            {alert && <span className="absolute -top-0.5 -right-0.5 size-2.5 animate-pulse rounded-full bg-rose-500 ring-2 ring-white" />}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-xs font-medium text-slate-500">{label}</span>
            <span className={cn('block text-xl font-bold tracking-tight', alert ? 'text-rose-600' : 'text-slate-900')}>{value}</span>
            <span className="block truncate text-[11px] text-slate-400">{hint}</span>
          </span>
        </button>
      ))}
    </div>
  )
})
