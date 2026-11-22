import { memo } from 'react'
import { ArrowDownUp, RotateCcw, Search, Tags, X } from 'lucide-react'
import { FilterDropdown } from '@/components/ui/Dropdown'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/cn'
import type { Category } from '@/modules/sales/types/sales.types'
import type { SupplierFilters as Filters, SupplierTab } from '@/modules/suppliers/types/suppliers.types'
import { SUPPLIER_SORTS, SUPPLIER_TABS } from '@/modules/suppliers/utils/suppliers.utils'

interface Props {
  filters: Filters
  categories: Category[]
  counts: Record<SupplierTab, number>
  onChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void
  onReset: () => void
  hasActiveFilters: boolean
}

export const SupplierFilters = memo(function SupplierFilters({ filters, categories, counts, onChange, onReset, hasActiveFilters }: Props) {
  const categoryOptions = [{ value: 'all', label: 'Tất cả nhóm hàng' }, ...categories.map((c) => ({ value: c.id, label: c.name }))]
  const categoryLabel = filters.categoryId === 'all' ? 'Nhóm hàng' : (categories.find((c) => c.id === filters.categoryId)?.name ?? '')

  return (
    <div>
      <div className="scrollbar-none flex gap-1 overflow-x-auto border-b border-slate-100 px-4">
        {SUPPLIER_TABS.map((tab) => {
          const active = filters.tab === tab.value
          return (
            <button
              key={tab.value}
              onClick={() => onChange('tab', tab.value)}
              className={cn('relative flex h-12 shrink-0 cursor-pointer items-center gap-2 px-3 text-sm font-semibold transition', active ? 'text-primary-700' : 'text-slate-500 hover:text-slate-800')}
            >
              {tab.label}
              <span
                className={cn(
                  'rounded-full px-2 text-[11px] leading-5',
                  active ? 'bg-primary-600 text-white' : (tab.value === 'debt' || tab.value === 'suspended') && counts[tab.value] ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500',
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
          placeholder="Tìm tên, mã, số điện thoại, người liên hệ, MST..."
          leftIcon={<Search />}
          wrapperClassName="min-w-[260px] flex-1"
          rightSlot={
            filters.keyword && (
              <button onClick={() => onChange('keyword', '')} className="cursor-pointer text-slate-400 hover:text-slate-600" aria-label="Xóa tìm kiếm">
                <X className="size-4" />
              </button>
            )
          }
        />
        <FilterDropdown icon={Tags} label={categoryLabel} title="Nhóm hàng cung cấp" value={filters.categoryId} options={categoryOptions} onChange={(v) => onChange('categoryId', v)} active={filters.categoryId !== 'all'} />
        <FilterDropdown icon={ArrowDownUp} label={SUPPLIER_SORTS.find((o) => o.value === filters.sort)?.label ?? ''} title="Sắp xếp" value={filters.sort} options={SUPPLIER_SORTS} onChange={(v) => onChange('sort', v)} />
        {hasActiveFilters && (
          <button onClick={onReset} className="flex h-11 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800">
            <RotateCcw className="size-4" /> Đặt lại
          </button>
        )}
      </div>
    </div>
  )
})
