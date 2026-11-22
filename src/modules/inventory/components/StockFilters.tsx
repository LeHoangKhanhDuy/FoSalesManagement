import { memo } from 'react'
import { ArrowDownUp, Boxes, RotateCcw, ScanBarcode, Search, Tags, X } from 'lucide-react'
import { FilterDropdown } from '@/components/ui/Dropdown'
import { Input } from '@/components/ui/Input'
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
  const levelOption = LEVEL_TABS.find((t) => t.value === filters.level)
  const sortLabel = INVENTORY_SORT_OPTIONS.find((o) => o.value === filters.sort)?.label ?? ''

  return (
    <div>
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
          icon={levelOption?.icon ?? Boxes}
          label={filters.level === 'all' ? 'Mức tồn' : `${levelOption?.label} (${counts[filters.level] ?? 0})`}
          title="Mức tồn kho"
          value={filters.level}
          options={LEVEL_TABS.map((t) => ({ ...t, count: counts[t.value] ?? 0 }))}
          onChange={(v) => onChange('level', v)}
          active={filters.level !== 'all'}
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
