import { memo } from 'react'
import { ArrowDownUp, ArrowRight, CalendarDays, RotateCcw, Search, Wallet, X, type LucideIcon } from 'lucide-react'
import { DatePicker } from '@/components/ui/DatePicker'
import { FilterDropdown } from '@/components/ui/Dropdown'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/cn'
import type { OrderFilters, PaymentMethod, StatusCounts } from '@/modules/orders/types/orders.types'
import { DATE_RANGE_OPTIONS, PAYMENT_METHOD_LABEL, SORT_OPTIONS, STATUS_TABS } from '@/modules/orders/utils/orders.utils'

const PAYMENT_OPTIONS: { value: PaymentMethod | 'all'; label: string; icon?: LucideIcon }[] = [
  { value: 'all', label: 'Tất cả phương thức', icon: Wallet },
  ...(Object.keys(PAYMENT_METHOD_LABEL) as PaymentMethod[]).map((m) => ({
    value: m,
    label: PAYMENT_METHOD_LABEL[m],
  })),
]

interface OrderToolbarProps {
  filters: OrderFilters
  counts?: StatusCounts
  onChange: <K extends keyof OrderFilters>(key: K, value: OrderFilters[K]) => void
  onDateRangeChange: (from?: Date, to?: Date) => void
  onRangePresetChange: (range: OrderFilters['range']) => void
  onReset: () => void
  hasActiveFilters: boolean
}

export const OrderToolbar = memo(function OrderToolbar({
  filters,
  counts,
  onChange,
  onDateRangeChange,
  onRangePresetChange,
  onReset,
  hasActiveFilters,
}: OrderToolbarProps) {
  const rangeLabel =
    filters.range === 'custom' ? 'Tùy chọn' : (DATE_RANGE_OPTIONS.find((o) => o.value === filters.range)?.label ?? '')
  const paymentLabel = filters.payment === 'all' ? 'Thanh toán' : PAYMENT_METHOD_LABEL[filters.payment]
  const sortLabel = SORT_OPTIONS.find((o) => o.value === filters.sort)?.label ?? ''

  return (
    <div>
      <div className="scrollbar-none flex gap-1 overflow-x-auto px-4">
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
                {counts?.[tab.value] ?? '–'}
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
          placeholder="Tìm mã đơn, khách hàng, SĐT hoặc mã vạch sản phẩm..."
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
          icon={CalendarDays}
          label={rangeLabel}
          title="Thời gian"
          value={filters.range}
          options={DATE_RANGE_OPTIONS}
          onChange={onRangePresetChange}
          active={filters.range !== '30d'}
        />
        <div
          className={cn(
            'flex h-11 items-center gap-1 rounded-lg border bg-white pr-1 pl-3',
            filters.range === 'custom' ? 'border-primary-300' : 'border-slate-200',
          )}
        >
          <span className="text-xs font-semibold text-slate-400">Từ</span>
          <div className="w-[132px]">
            <DatePicker
              value={filters.dateFrom}
              onChange={(d) => onDateRangeChange(d, filters.dateTo)}
              maxDate={filters.dateTo}
              disableFuture
              placeholder="dd/mm/yyyy"
              align="start"
              side="auto"
              className="h-9 border-transparent px-2 hover:border-transparent hover:bg-slate-50 data-[state=open]:bg-primary-50"
            />
          </div>
          <ArrowRight className="size-3.5 shrink-0 text-slate-300" />
          <span className="pl-1 text-xs font-semibold text-slate-400">Đến</span>
          <div className="w-[132px]">
            <DatePicker
              value={filters.dateTo}
              onChange={(d) => onDateRangeChange(filters.dateFrom, d)}
              minDate={filters.dateFrom}
              disableFuture
              placeholder="dd/mm/yyyy"
              align="end"
              side="auto"
              className="h-9 border-transparent px-2 hover:border-transparent hover:bg-slate-50 data-[state=open]:bg-primary-50"
            />
          </div>
        </div>
        <FilterDropdown
          icon={Wallet}
          label={paymentLabel}
          title="Phương thức thanh toán"
          value={filters.payment}
          options={PAYMENT_OPTIONS}
          onChange={(v) => onChange('payment', v)}
          active={filters.payment !== 'all'}
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
