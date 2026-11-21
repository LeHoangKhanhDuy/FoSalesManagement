import { forwardRef, type KeyboardEvent } from 'react'
import { ArrowDownUp, LayoutGrid, List, ScanBarcode, Search, X } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Kbd } from '@/components/ui/Kbd'
import { cn } from '@/lib/cn'
import type { ProductSort } from '@/modules/sales/hooks/useProducts'

export type ViewMode = 'grid' | 'list'

interface ProductToolbarProps {
  keyword: string
  onKeywordChange: (v: string) => void
  onSubmit: () => void
  sort: ProductSort
  onSortChange: (v: ProductSort) => void
  view: ViewMode
  onViewChange: (v: ViewMode) => void
}

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: 'default', label: 'Mặc định' },
  { value: 'best-seller', label: 'Bán chạy' },
  { value: 'price-asc', label: 'Giá tăng dần' },
  { value: 'price-desc', label: 'Giá giảm dần' },
  { value: 'name', label: 'Tên A → Z' },
]

export const ProductToolbar = forwardRef<HTMLInputElement, ProductToolbarProps>(
  ({ keyword, onKeywordChange, onSubmit, sort, onSortChange, view, onViewChange }, ref) => {
    const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') onSubmit()
      if (e.key === 'Escape') onKeywordChange('')
    }

    return (
      <div className="flex flex-wrap items-center gap-2.5">
        <Input
          ref={ref}
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Tìm tên, mã SKU hoặc quét mã vạch..."
          leftIcon={<Search />}
          wrapperClassName="min-w-[240px] flex-1"
          rightSlot={
            keyword ? (
              <button onClick={() => onKeywordChange('')} className="cursor-pointer text-slate-400 hover:text-slate-600" aria-label="Xóa">
                <X className="size-4" />
              </button>
            ) : (
              <span className="flex items-center gap-2 text-slate-400">
                <ScanBarcode className="size-[18px]" />
                <Kbd>F2</Kbd>
              </span>
            )
          }
        />

        <label className="relative flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white pr-3 pl-3 text-sm text-slate-600 focus-within:border-primary-500">
          <ArrowDownUp className="size-4 text-slate-400" />
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as ProductSort)}
            className="cursor-pointer appearance-none bg-transparent pr-1 font-medium text-slate-700 outline-none"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-white p-1">
          {(
            [
              { value: 'grid', icon: LayoutGrid, label: 'Lưới' },
              { value: 'list', icon: List, label: 'Danh sách' },
            ] as const
          ).map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => onViewChange(value)}
              title={label}
              className={cn(
                'grid size-9 cursor-pointer place-items-center rounded-lg transition',
                view === value ? 'bg-primary-50 text-primary-600' : 'text-slate-400 hover:text-slate-700',
              )}
            >
              <Icon className="size-[18px]" />
            </button>
          ))}
        </div>
      </div>
    )
  },
)
ProductToolbar.displayName = 'ProductToolbar'
