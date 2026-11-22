import { memo } from 'react'
import { ArrowDownUp, Layers, RotateCcw, Search, X } from 'lucide-react'
import { FilterDropdown } from '@/components/ui/Dropdown'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/cn'
import type { PromotionFilters as Filters, PromotionKind, PromotionTab } from '@/modules/promotions/types/promotions.types'
import { PROMOTION_KINDS, PROMOTION_SORTS, PROMOTION_TABS } from '@/modules/promotions/utils/promotions.utils'

interface Props {
  filters: Filters
  counts: Record<PromotionTab, number>
  onChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void
  onReset: () => void
  hasActiveFilters: boolean
}

const KIND_OPTIONS: { value: PromotionKind | 'all'; label: string; icon?: typeof Layers }[] = [
  { value: 'all', label: 'Tất cả loại', icon: Layers },
  ...(Object.keys(PROMOTION_KINDS) as PromotionKind[]).map((k) => ({ value: k, label: PROMOTION_KINDS[k].label, icon: PROMOTION_KINDS[k].icon })),
]

export const PromotionFilters = memo(function PromotionFilters({ filters, counts, onChange, onReset, hasActiveFilters }: Props) {
  return (
    <div>
      <div className="scrollbar-none flex gap-1 overflow-x-auto border-b border-slate-100 px-4">
        {PROMOTION_TABS.map((tab) => {
          const active = filters.tab === tab.value
          return (
            <button
              key={tab.value}
              onClick={() => onChange('tab', tab.value)}
              className={cn('relative flex h-12 shrink-0 cursor-pointer items-center gap-2 px-3 text-sm font-semibold transition', active ? 'text-primary-700' : 'text-slate-500 hover:text-slate-800')}
            >
              {tab.label}
              <span className={cn('rounded-full px-2 text-[11px] leading-5', active ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-500')}>{counts[tab.value] ?? 0}</span>
              {active && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary-600" />}
            </button>
          )
        })}
      </div>
      <div className="flex flex-wrap items-center gap-2.5 p-4">
        <Input
          value={filters.keyword}
          onChange={(e) => onChange('keyword', e.target.value)}
          placeholder="Tìm tên chương trình hoặc mã..."
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
        <FilterDropdown
          icon={filters.kind === 'all' ? Layers : PROMOTION_KINDS[filters.kind].icon}
          label={filters.kind === 'all' ? 'Loại khuyến mãi' : PROMOTION_KINDS[filters.kind].label}
          title="Loại khuyến mãi"
          value={filters.kind}
          options={KIND_OPTIONS}
          onChange={(v) => onChange('kind', v)}
          active={filters.kind !== 'all'}
        />
        <FilterDropdown icon={ArrowDownUp} label={PROMOTION_SORTS.find((o) => o.value === filters.sort)?.label ?? ''} title="Sắp xếp" value={filters.sort} options={PROMOTION_SORTS} onChange={(v) => onChange('sort', v)} />
        {hasActiveFilters && (
          <button onClick={onReset} className="flex h-11 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800">
            <RotateCcw className="size-4" /> Đặt lại
          </button>
        )}
      </div>
    </div>
  )
})
