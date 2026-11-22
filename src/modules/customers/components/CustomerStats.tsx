import { memo } from 'react'
import { Cake, Repeat, Star, Users, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import { formatCompact, formatNumber } from '@/lib/format'

interface Props {
  stats: { total: number; new30: number; returning: number; active30: number; points: number; birthday: number }
  pointValue: number
  loading: boolean
  onBirthday: () => void
}

export const CustomerStats = memo(function CustomerStats({ stats, pointValue, loading, onBirthday }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[84px] animate-pulse rounded-lg bg-white" />
        ))}
      </div>
    )
  }
  const items: { label: string; value: string; hint: string; icon: LucideIcon; tone: string; action?: () => void }[] = [
    { label: 'Tổng khách hàng', value: formatNumber(stats.total), hint: `+${stats.new30} khách mới trong 30 ngày`, icon: Users, tone: 'bg-primary-50 text-primary-600' },
    { label: 'Mua hàng 30 ngày', value: formatNumber(stats.active30), hint: `${stats.returning} khách quay lại từ 2 lần`, icon: Repeat, tone: 'bg-sky-50 text-sky-600' },
    { label: 'Điểm đang lưu hành', value: formatNumber(stats.points), hint: `Tương đương ${formatCompact(stats.points * pointValue)}`, icon: Star, tone: 'bg-amber-50 text-amber-600' },
    { label: 'Sinh nhật tháng này', value: formatNumber(stats.birthday), hint: 'Gửi lời chúc & ưu đãi', icon: Cake, tone: 'bg-rose-50 text-rose-500', action: onBirthday },
  ]
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {items.map(({ label, value, hint, icon: Icon, tone, action }) => (
        <button key={label} type="button" disabled={!action} onClick={action} className="flex items-center gap-3.5 rounded-lg bg-white p-4 text-left transition enabled:cursor-pointer enabled:hover:ring-2 enabled:hover:ring-primary-100">
          <span className={cn('grid size-12 shrink-0 place-items-center rounded-lg', tone)}>
            <Icon className="size-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-xs font-medium text-slate-500">{label}</span>
            <span className="block text-xl font-bold tracking-tight text-slate-900">{value}</span>
            <span className="block truncate text-[11px] text-slate-400">{hint}</span>
          </span>
        </button>
      ))}
    </div>
  )
})
