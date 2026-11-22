import { memo } from 'react'
import { ArrowDownUp, Crown, Filter, RotateCcw, Search, X } from 'lucide-react'
import { FilterDropdown } from '@/components/ui/Dropdown'
import { Input } from '@/components/ui/Input'
import type { CustomerFilters as Filters, CustomerTab, MembershipSettings } from '@/modules/customers/types/customers.types'
import { CUSTOMER_SORTS, SEGMENTS, TIER_ORDER, TIER_STYLE, tierConfig } from '@/modules/customers/utils/customers.utils'

interface Props {
  filters: Filters
  settings: MembershipSettings | null
  counts: Record<CustomerTab, number>
  onChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void
  onReset: () => void
  hasActiveFilters: boolean
}

export const CustomerFilters = memo(function CustomerFilters({ filters, settings, counts, onChange, onReset, hasActiveFilters }: Props) {
  const tabs: { value: CustomerTab; label: string }[] = [{ value: 'all', label: 'Tất cả hạng' }, ...TIER_ORDER.map((t) => ({ value: t as CustomerTab, label: settings ? tierConfig(settings, t).label : t }))]
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2.5 p-4">
        <Input
          value={filters.keyword}
          onChange={(e) => onChange('keyword', e.target.value)}
          placeholder="Tìm tên, số điện thoại hoặc email..."
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
          icon={filters.tab === 'all' ? Crown : TIER_STYLE[filters.tab].icon}
          label={filters.tab === 'all' ? 'Hạng thành viên' : `${tabs.find((t) => t.value === filters.tab)?.label} (${counts[filters.tab] ?? 0})`}
          title="Hạng thành viên"
          value={filters.tab}
          options={tabs.map((t) => ({ ...t, icon: t.value === 'all' ? Crown : TIER_STYLE[t.value].icon, count: counts[t.value] ?? 0 }))}
          onChange={(v) => onChange('tab', v)}
          active={filters.tab !== 'all'}
        />
        <FilterDropdown icon={Filter} label={filters.segment === 'all' ? 'Nhóm khách' : (SEGMENTS.find((s) => s.value === filters.segment)?.label ?? '')} title="Nhóm khách hàng" value={filters.segment} options={SEGMENTS} onChange={(v) => onChange('segment', v)} active={filters.segment !== 'all'} />
        <FilterDropdown icon={ArrowDownUp} label={CUSTOMER_SORTS.find((s) => s.value === filters.sort)?.label ?? ''} title="Sắp xếp" value={filters.sort} options={CUSTOMER_SORTS} onChange={(v) => onChange('sort', v)} />
        {hasActiveFilters && (
          <button onClick={onReset} className="flex h-11 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800">
            <RotateCcw className="size-4" /> Đặt lại
          </button>
        )}
      </div>
    </div>
  )
})
