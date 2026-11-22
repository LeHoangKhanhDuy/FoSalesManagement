import { memo } from 'react'
import { PackageCheck, PackageX, TriangleAlert, Warehouse, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import { formatCompact, formatNumber } from '@/lib/format'
import type { ProductStats as Stats, StockFilter } from '@/modules/products/types/products.types'

interface ProductStatsProps {
  stats: Stats
  loading: boolean
  onStockFilter: (stock: StockFilter) => void
}

export const ProductStats = memo(function ProductStats({ stats, loading, onStockFilter }: ProductStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[84px] animate-pulse rounded-lg bg-white" />
        ))}
      </div>
    )
  }

  const items: { label: string; value: string; hint: string; icon: LucideIcon; tone: string; stock?: StockFilter }[] = [
    {
      label: 'Tổng sản phẩm',
      value: formatNumber(stats.total),
      hint: `${formatNumber(stats.active)} đang bán`,
      icon: PackageCheck,
      tone: 'bg-primary-50 text-primary-600',
    },
    {
      label: 'Giá trị tồn kho',
      value: formatCompact(stats.inventoryValue),
      hint: `${formatNumber(stats.inventoryUnits)} đơn vị hàng`,
      icon: Warehouse,
      tone: 'bg-sky-50 text-sky-600',
    },
    {
      label: 'Sắp hết hàng',
      value: formatNumber(stats.low),
      hint: 'Cần nhập thêm',
      icon: TriangleAlert,
      tone: 'bg-amber-50 text-amber-600',
      stock: 'low',
    },
    {
      label: 'Hết hàng',
      value: formatNumber(stats.out),
      hint: 'Không thể bán',
      icon: PackageX,
      tone: 'bg-rose-50 text-rose-500',
      stock: 'out',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {items.map(({ label, value, hint, icon: Icon, tone, stock }) => (
        <button
          key={label}
          type="button"
          disabled={!stock}
          onClick={() => stock && onStockFilter(stock)}
          className="flex items-center gap-3.5 rounded-lg bg-white p-4 text-left transition enabled:cursor-pointer enabled:hover:ring-2 enabled:hover:ring-primary-100"
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
