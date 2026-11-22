import { memo } from 'react'
import { ArrowDownUp, RotateCcw, ScanBarcode, Search, Tags, X } from 'lucide-react'
import { FilterDropdown } from '@/components/ui/Dropdown'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/cn'
import type { InventoryFilters, StockLevelFilter } from '@/modules/inventory/types/inventory.types'
import { INVENTORY_SORT_OPTIONS, LEVEL_TABS } from '@/modules/inventory/utils/inventory.utils'
import type { Category } from '@/modules/sales/types/sales.types'

interface StockFiltersProps {
  filters: InventoryFilters
  categories: Category[]
  counts: Record<StockLevelFilter, number>
  onChange: <K extends keyof InventoryFilters>(key: K, value: InventoryFilters[K]) => void
  onReset: () => void
  hasActiveFilters: boolean
}

export const StockFilters = memo(function StockFilters({ filters, categories, counts, onChange, onReset, hasActiveFilters }: StockFiltersProps) {
  const categoryLabel = filters.categoryId === 'all' ? 'Danh mục' : (categories.find((c) => c.id === filters.categoryId)?.name ?? '')
  const sortLabel = INVENTORY_SORT_OPTIONS.find((o) => o.value === filters.sort)?.label ?? ''

  return (
    <div>
      <div className="scrollbar-none flex gap-1 overflow-x-auto border-b border-slate-100 px-4">
        {LEVEL_TABS.map((tab) => {
          const active = filters.level === tab.value
          return (
            <button
              key={tab.value}
              onClick={() => onChange('level', tab.value)}
              className={cn(
                'relative flex h-12 shrink-0 cursor-pointer items-center gap-2 px-3 text-sm font-semibold transition',
                active ? 'text-primary-700' : 'text-slate-500 hover:text-slate-800',
              )}
            >
              {tab.label}
              <span className={cn('rounded-full px-2 text-[11px] leading-5', active ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-500')}>
                {counts[tab.value] ?? 0}
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
          placeholder="Tìm tên, SKU hoặc quét mã vạch..."
          leftIcon={<Search />}
          wrapperClassName="min-w-[260px] flex-1"
          rightSlot={
            filters.keyword ? (
              <button onClick={() => onChange('keyword', '')} className="cursor-pointer text-slate-400 hover:text-slate-600" aria-label="Xóa tìm kiếm">
                <X className="size-4" />
              </button>
            ) : (
              <ScanBarcode className="size-[18px] text-slate-400" />
            )
          }
        />
        <FilterDropdown
          icon={Tags}
          label={categoryLabel}
          title="Danh mục"
          value={filters.categoryId}
          options={categories.map((c) => ({ value: c.id, label: c.id === 'all' ? 'Tất cả danh mục' : c.name }))}
          onChange={(v) => onChange('categoryId', v)}
          active={filters.categoryId !== 'all'}
        />
        <FilterDropdown icon={ArrowDownUp} label={sortLabel} title="Sắp xếp" value={filters.sort} options={INVENTORY_SORT_OPTIONS} onChange={(v) => onChange('sort', v)} />
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
