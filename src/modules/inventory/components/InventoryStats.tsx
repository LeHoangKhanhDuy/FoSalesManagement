import { memo } from 'react'
import { Hourglass, PackageX, Boxes, TriangleAlert, Warehouse, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import { formatCompact, formatNumber } from '@/lib/format'
import type { InventoryStats as Stats, StockLevelFilter } from '@/modules/inventory/types/inventory.types'
import { SLOW_DAYS } from '@/modules/inventory/utils/inventory.utils'

interface InventoryStatsProps {
  stats: Stats
  loading: boolean
  active: StockLevelFilter
  onSelect: (level: StockLevelFilter) => void
}

export const InventoryStats = memo(function InventoryStats({ stats, loading, active, onSelect }: InventoryStatsProps) {
  const items: { label: string; value: string; hint: string; icon: LucideIcon; tone: string; level?: StockLevelFilter }[] = [
    { label: 'Giá trị tồn kho', value: formatCompact(stats.stockValue), hint: 'Tính theo giá vốn', icon: Warehouse, tone: 'bg-primary-50 text-primary-600' },
    { label: 'Mặt hàng', value: formatNumber(stats.skuCount), hint: `${formatNumber(stats.units)} đơn vị trong kho`, icon: Boxes, tone: 'bg-sky-50 text-sky-600', level: 'all' },
    { label: 'Sắp hết hàng', value: formatNumber(stats.low), hint: 'Dưới mức tối thiểu', icon: TriangleAlert, tone: 'bg-amber-50 text-amber-600', level: 'low' },
    { label: 'Hết hàng', value: formatNumber(stats.out), hint: 'Cần nhập ngay', icon: PackageX, tone: 'bg-rose-50 text-rose-500', level: 'out' },
    { label: 'Tồn lâu', value: formatNumber(stats.slow), hint: `Không bán ${SLOW_DAYS} ngày`, icon: Hourglass, tone: 'bg-violet-50 text-violet-600', level: 'slow' },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {items.map((i) => (
          <div key={i.label} className="h-[84px] animate-pulse rounded-lg bg-white" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      {items.map(({ label, value, hint, icon: Icon, tone, level }) => (
        <button
          key={label}
          type="button"
          disabled={!level}
          onClick={() => level && onSelect(level)}
          className={cn(
            'flex items-center gap-3.5 rounded-lg bg-white p-4 text-left transition enabled:cursor-pointer enabled:hover:ring-2 enabled:hover:ring-primary-100',
            level && level !== 'all' && active === level && 'ring-2 ring-primary-300',
          )}
        >
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
