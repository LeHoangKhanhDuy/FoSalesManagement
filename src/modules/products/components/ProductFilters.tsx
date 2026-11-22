import { memo } from 'react'
import { ArrowDownUp, Boxes, RotateCcw, Search, Tags, X } from 'lucide-react'
import { FilterDropdown } from '@/components/ui/Dropdown'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/cn'
import type { ProductFilters as Filters } from '@/modules/products/types/products.types'
import { SORT_OPTIONS, STATUS_TABS, STOCK_OPTIONS } from '@/modules/products/utils/products.utils'
import type { Category, ProductStatus } from '@/modules/sales/types/sales.types'

interface ProductFiltersProps {
  filters: Filters
  categories: Category[]
  counts: Record<ProductStatus | 'all', number>
  onChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void
  onReset: () => void
  hasActiveFilters: boolean
}

export const ProductFilters = memo(function ProductFilters({
  filters,
  categories,
  counts,
  onChange,
  onReset,
  hasActiveFilters,
}: ProductFiltersProps) {
  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.id === 'all' ? 'Tất cả danh mục' : c.name }))
  const categoryLabel = filters.categoryId === 'all' ? 'Danh mục' : (categories.find((c) => c.id === filters.categoryId)?.name ?? '')
  const stockLabel = filters.stock === 'all' ? 'Tồn kho' : (STOCK_OPTIONS.find((o) => o.value === filters.stock)?.label ?? '')
  const sortLabel = SORT_OPTIONS.find((o) => o.value === filters.sort)?.label ?? ''

  return (
    <div>
      <div className="scrollbar-none flex gap-1 overflow-x-auto border-b border-slate-100 px-4">
        {STATUS_TABS.map((tab) => {
          const active = filters.status === tab.value
          return (
            <button
              key={tab.value}
              onClick={() => onChange('status', tab.value)}
              className={cn(
                'relative flex h-12 shrink-0 cursor-pointer items-center gap-2 px-3 text-sm font-semibold transition',
                active ? 'text-primary-700' : 'text-slate-500 hover:text-slate-800',
              )}
            >
              {tab.label}
              <span
                className={cn(
                  'rounded-full px-2 text-[11px] leading-5',
                  active ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-500',
                )}
              >
                {counts[tab.value]}
              </span>
              {active && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary-600" />}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2.5 p-4">
        <Input
          value={filters.keyword}
          onChange={(e) => onChange('keyword', e.target.value)}
          placeholder="Tìm tên, mã SKU hoặc Quét mã vạch..."
          leftIcon={<Search />}
          wrapperClassName="min-w-[260px] flex-1"
          rightSlot={
            filters.keyword && (
              <button
                onClick={() => onChange('keyword', '')}
                className="cursor-pointer text-slate-400 hover:text-slate-600"
                aria-label="Xóa tìm kiếm"
              >
                <X className="size-4" />
              </button>
            )
          }
        />
        <FilterDropdown
          icon={Tags}
          label={categoryLabel}
          title="Danh mục"
          value={filters.categoryId}
          options={categoryOptions}
          onChange={(v) => onChange('categoryId', v)}
          active={filters.categoryId !== 'all'}
        />
        <FilterDropdown
          icon={Boxes}
          label={stockLabel}
          title="Tồn kho"
          value={filters.stock}
          options={STOCK_OPTIONS}
          onChange={(v) => onChange('stock', v)}
          active={filters.stock !== 'all'}
        />
        <FilterDropdown
          icon={ArrowDownUp}
          label={sortLabel}
          title="Sắp xếp"
          value={filters.sort}
          options={SORT_OPTIONS}
          onChange={(v) => onChange('sort', v)}
        />
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex h-11 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <RotateCcw className="size-4" /> Đặt lại
          </button>
        )}
      </div>
    </div>
  )
})
