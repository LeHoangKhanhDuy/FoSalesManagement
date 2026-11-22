import { ArrowDownLeft, ArrowRight, ArrowUpRight, CalendarDays, Download, Filter, PackageSearch, RotateCcw, Search, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { DatePicker } from '@/components/ui/DatePicker'
import { FilterDropdown } from '@/components/ui/Dropdown'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import { cn } from '@/lib/cn'
import { formatDateTime, formatNumber } from '@/lib/format'
import { MovementTypeBadge, QuantityChange } from '@/modules/inventory/components/MovementTypeBadge'
import type { useMovementHistory } from '@/modules/inventory/hooks/useMovementHistory'
import { MOVEMENT_RANGE_OPTIONS, MOVEMENT_TYPE_OPTIONS, PAGE_SIZE } from '@/modules/inventory/utils/inventory.utils'
import { ProductCode } from '@/components/common/ProductCode'

type History = ReturnType<typeof useMovementHistory>

const COLUMNS = ['Thời gian', 'Loại', 'Sản phẩm', 'Thay đổi', 'Tồn kho', 'Chứng từ / Lý do', 'Người thực hiện']

const Td = ({ children, className }: { children: ReactNode; className?: string }) => (
  <td className={cn('px-4 py-3 align-middle', className)}>{children}</td>
)

export function MovementHistory({ history, loading }: { history: History; loading: boolean }) {
  const { filters, updateFilter, setRangePreset, setCustomRange, resetFilters, hasActiveFilters, filtered, summary, paged, page, setPage, exportCsv } = history
  const rangeLabel = filters.range === 'custom' ? 'Tùy chọn' : (MOVEMENT_RANGE_OPTIONS.find((o) => o.value === filters.range)?.label ?? '')
  const typeLabel = filters.type === 'all' ? 'Loại' : (MOVEMENT_TYPE_OPTIONS.find((o) => o.value === filters.type)?.label ?? '')

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2.5 p-4">
        <Input
          value={filters.keyword}
          onChange={(e) => updateFilter('keyword', e.target.value)}
          placeholder="Tìm sản phẩm, SKU, mã vạch, mã chứng từ..."
          leftIcon={<Search />}
          wrapperClassName="min-w-[240px] flex-1"
          rightSlot={
            filters.keyword && (
              <button onClick={() => updateFilter('keyword', '')} className="cursor-pointer text-slate-400 hover:text-slate-600" aria-label="Xóa tìm kiếm">
                <X className="size-4" />
              </button>
            )
          }
        />
        <FilterDropdown icon={Filter} label={typeLabel} title="Loại biến động" value={filters.type} options={MOVEMENT_TYPE_OPTIONS} onChange={(v) => updateFilter('type', v)} active={filters.type !== 'all'} />
        <FilterDropdown icon={CalendarDays} label={rangeLabel} title="Thời gian" value={filters.range} options={MOVEMENT_RANGE_OPTIONS} onChange={setRangePreset} active={filters.range !== '30d'} />
        <div className={cn('flex h-11 items-center gap-1 rounded-lg border bg-white pr-1 pl-3', filters.range === 'custom' ? 'border-primary-300' : 'border-slate-200')}>
          <span className="text-xs font-semibold text-slate-400">Từ</span>
          <div className="w-[128px]">
            <DatePicker value={filters.dateFrom} onChange={(d) => setCustomRange(d, filters.dateTo)} maxDate={filters.dateTo} disableFuture placeholder="dd/mm/yyyy" align="start" side="auto" className="h-9 border-transparent px-2 hover:border-transparent hover:bg-slate-50" />
          </div>
          <ArrowRight className="size-3.5 shrink-0 text-slate-300" />
          <span className="pl-1 text-xs font-semibold text-slate-400">Đến</span>
          <div className="w-[128px]">
            <DatePicker value={filters.dateTo} onChange={(d) => setCustomRange(filters.dateFrom, d)} minDate={filters.dateFrom} disableFuture placeholder="dd/mm/yyyy" align="end" side="auto" className="h-9 border-transparent px-2 hover:border-transparent hover:bg-slate-50" />
          </div>
        </div>
        {hasActiveFilters && (
          <button onClick={resetFilters} className="flex h-11 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800">
            <RotateCcw className="size-4" /> Đặt lại
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-slate-100 bg-slate-50/60 px-4 py-2.5 text-sm">
        <span className="text-slate-500">
          <span className="font-semibold text-slate-800">{formatNumber(filtered.length)}</span> biến động
        </span>
        <span className="flex items-center gap-1.5 text-slate-500">
          <ArrowDownLeft className="size-4 text-primary-600" /> Tổng nhập <span className="font-bold text-primary-600">+{formatNumber(summary.inQty)}</span>
        </span>
        <span className="flex items-center gap-1.5 text-slate-500">
          <ArrowUpRight className="size-4 text-rose-500" /> Tổng xuất <span className="font-bold text-rose-500">−{formatNumber(summary.outQty)}</span>
        </span>
        <button onClick={exportCsv} className="ml-auto flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-primary-300 hover:text-primary-700">
          <Download className="size-3.5" /> Xuất Excel
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
              {COLUMNS.map((c) => (
                <th key={c} className={cn('px-4 py-3 whitespace-nowrap', c === 'Thay đổi' && 'text-right')}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {COLUMNS.map((c) => (
                      <Td key={c}>
                        <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
                      </Td>
                    ))}
                  </tr>
                ))
              : paged.map((m) => (
                  <tr key={m.id} className="transition hover:bg-slate-50/80">
                    <Td className="whitespace-nowrap text-slate-600">{formatDateTime(new Date(m.createdAt))}</Td>
                    <Td>
                      <MovementTypeBadge type={m.type} />
                    </Td>
                    <Td>
                      <p className="max-w-[260px] truncate font-semibold text-slate-900">{m.productName}</p>
                      <ProductCode sku={m.sku} barcode={m.barcode} />
                    </Td>
                    <Td className="text-right whitespace-nowrap">
                      <QuantityChange value={m.quantity} /> <span className="text-xs text-slate-400">{m.unit.toLowerCase()}</span>
                    </Td>
                    <Td className="whitespace-nowrap text-slate-500">
                      {formatNumber(m.before)} <ArrowRight className="inline size-3 text-slate-300" /> <span className="font-semibold text-slate-800">{formatNumber(m.after)}</span>
                    </Td>
                    <Td className="max-w-[240px]">
                      {m.refCode && <p className="truncate font-medium text-slate-700">{m.refCode}</p>}
                      {(m.reason || m.note) && <p className="truncate text-xs text-slate-400">{[m.reason, m.note].filter(Boolean).join(' · ')}</p>}
                      {!m.refCode && !m.reason && !m.note && <span className="text-slate-300">—</span>}
                    </Td>
                    <Td className="whitespace-nowrap text-slate-600">{m.createdBy}</Td>
                  </tr>
                ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <EmptyState icon={<PackageSearch />} title="Không có biến động phù hợp" description="Thử đổi bộ lọc thời gian hoặc loại biến động." className="py-16" />
        )}
      </div>
      {!loading && filtered.length > 0 && (
        <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} unit="biến động" className="border-t border-slate-100 px-4 py-3" />
      )}
    </div>
  )
}
