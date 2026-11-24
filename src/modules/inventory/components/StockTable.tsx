import { memo, type ReactNode } from 'react'
import { CircleAlert, PackageSearch, SlidersHorizontal } from 'lucide-react'
import { RetryButton } from '@/components/common/RetryButton'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'
import { cn } from '@/lib/cn'
import { formatCurrency, formatNumber, timeAgo } from '@/lib/format'
import type { InventoryItem } from '@/modules/inventory/types/inventory.types'
import { getCategoryName } from '@/modules/products/utils/products.utils'
import { PAGE_SIZE } from '@/modules/inventory/utils/inventory.utils'
import { ProductThumb } from '@/modules/sales/components/ProductThumb'
import type { Category } from '@/modules/sales/types/sales.types'
import { ProductCode } from '@/components/common/ProductCode'

interface StockTableProps {
  items: InventoryItem[]
  categories: Category[]
  total: number
  page: number
  loading: boolean
  refreshing: boolean
  error?: string
  onRetry: () => void
  onPageChange: (page: number) => void
  onView: (item: InventoryItem) => void
  onAdjust: (item: InventoryItem) => void
}

const COLUMNS = [
  { label: 'Sản phẩm' },
  { label: 'Danh mục' },
  { label: 'Tồn kho', className: 'w-44' },
  { label: 'Tối thiểu', className: 'text-right' },
  { label: 'Bán 30 ngày', className: 'text-right' },
  { label: 'Giá trị tồn', className: 'text-right' },
  { label: 'Biến động', className: 'whitespace-nowrap' },
  { label: '', className: 'w-32' },
]

const LEVEL_BADGE = {
  ok: { label: 'Đủ hàng', tone: 'success' },
  low: { label: 'Sắp hết', tone: 'warning' },
  out: { label: 'Hết hàng', tone: 'danger' },
} as const

const Td = ({ children, className }: { children: ReactNode; className?: string }) => (
  <td className={cn('px-4 py-3 align-middle', className)}>{children}</td>
)

function StockLevelCell({ item }: { item: InventoryItem }) {
  const max = Math.max(item.minStockValue * 3, item.stock, 1)
  const badge = LEVEL_BADGE[item.level]
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className={cn('font-bold', item.level === 'out' ? 'text-rose-500' : item.level === 'low' ? 'text-amber-600' : 'text-slate-900')}>
          {formatNumber(item.stock)} <span className="text-xs font-medium text-slate-400">{item.unit.toLowerCase()}</span>
        </span>
        <Badge tone={badge.tone} className="px-2 py-0 text-[10px]">
          {item.slow && item.level === 'ok' ? 'Tồn lâu' : badge.label}
        </Badge>
      </div>
      <div className="relative mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn('h-full rounded-full', item.level === 'out' ? 'bg-rose-400' : item.level === 'low' ? 'bg-amber-400' : 'bg-primary-500')}
          style={{ width: `${item.level === 'out' ? 0 : Math.max(4, (item.stock / max) * 100)}%` }}
        />
        <span className="absolute inset-y-0 w-0.5 bg-slate-400/70" style={{ left: `${(item.minStockValue / max) * 100}%` }} />
      </div>
    </div>
  )
}

export const StockTable = memo(function StockTable({ items, categories, total, page, loading, refreshing, error, onRetry, onPageChange, onView, onAdjust }: StockTableProps) {
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
              {COLUMNS.map((c, i) => (
                <th key={i} className={cn('px-4 py-3 whitespace-nowrap', c.className)}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={cn('divide-y divide-slate-100 transition-opacity', refreshing && 'pointer-events-none opacity-60')}>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {COLUMNS.map((_, j) => (
                      <Td key={j}>
                        <div className={cn('h-4 animate-pulse rounded bg-slate-100', j === 0 ? 'w-48' : 'w-16')} />
                      </Td>
                    ))}
                  </tr>
                ))
              : items.map((item) => (
                  <tr key={item.id} onClick={() => onView(item)} className="group cursor-pointer transition hover:bg-slate-50/80">
                    <Td>
                      <div className="flex items-center gap-3">
                        <ProductThumb categoryId={item.categoryId} image={item.image} fit={item.imageFit} alt={item.name} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900 group-hover:text-primary-700">{item.name}</p>
                          <ProductCode sku={item.sku} barcode={item.barcode} />
                        </div>
                      </div>
                    </Td>
                    <Td className="whitespace-nowrap text-slate-600">{getCategoryName(categories, item.categoryId)}</Td>
                    <Td>
                      <StockLevelCell item={item} />
                    </Td>
                    <Td className="text-right text-slate-600">{formatNumber(item.minStockValue)}</Td>
                    <Td className={cn('text-right font-medium', item.soldLast30 ? 'text-slate-800' : 'text-slate-400')}>
                      {formatNumber(item.soldLast30)}
                    </Td>
                    <Td className="text-right font-semibold whitespace-nowrap text-slate-900">{formatCurrency(item.stockValue)}</Td>
                    <Td className="whitespace-nowrap text-xs text-slate-500">{timeAgo(item.lastMovementAt)}</Td>
                    <Td>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onAdjust(item)
                          }}
                          className="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold whitespace-nowrap text-slate-600 transition hover:border-primary-300 hover:text-primary-700"
                        >
                          <SlidersHorizontal className="size-3.5" /> Điều chỉnh
                        </button>
                      </div>
                    </Td>
                  </tr>
                ))}
          </tbody>
        </table>
        {!loading && items.length === 0 && (
          <EmptyState
            icon={error ? <CircleAlert /> : <PackageSearch />}
            title={error ? 'Không tải được tồn kho' : 'Không có sản phẩm phù hợp'}
            description={error ?? 'Thử đổi từ khóa hoặc bộ lọc.'}
            className="py-16"
            action={error && <RetryButton onClick={onRetry} />}
          />
        )}
      </div>
      {!loading && total > 0 && (
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={onPageChange} unit="sản phẩm" className="border-t border-slate-100 px-4 py-3" />
      )}
    </div>
  )
})
