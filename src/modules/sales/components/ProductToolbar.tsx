import { forwardRef, type KeyboardEvent } from 'react'
import {
  ArrowDownAZ,
  ArrowDownUp,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  Check,
  ChevronDown,
  Flame,
  LayoutGrid,
  List,
  ListOrdered,
  ScanBarcode,
  Search,
  X,
  type LucideIcon,
} from 'lucide-react'
import { Dropdown, DropdownItem, DropdownLabel } from '@/components/ui/Dropdown'
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

const SORT_OPTIONS: { value: ProductSort; label: string; description: string; icon: LucideIcon }[] = [
  { value: 'default', label: 'Mặc định', description: 'Theo thứ tự nhập hàng', icon: ListOrdered },
  { value: 'best-seller', label: 'Bán chạy', description: 'Sản phẩm bán chạy lên đầu', icon: Flame },
  { value: 'price-asc', label: 'Giá tăng dần', description: 'Từ thấp đến cao', icon: ArrowUpNarrowWide },
  { value: 'price-desc', label: 'Giá giảm dần', description: 'Từ cao đến thấp', icon: ArrowDownWideNarrow },
  { value: 'name', label: 'Tên A → Z', description: 'Sắp xếp theo bảng chữ cái', icon: ArrowDownAZ },
]

export const ProductToolbar = forwardRef<HTMLInputElement, ProductToolbarProps>(
  ({ keyword, onKeywordChange, onSubmit, sort, onSortChange, view, onViewChange }, ref) => {
    const currentSort = SORT_OPTIONS.find((o) => o.value === sort) ?? SORT_OPTIONS[0]

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

        <Dropdown
          align="end"
          width={260}
          trigger={
            <button className="group flex h-11 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 transition hover:border-slate-300 focus-visible:border-primary-500 focus-visible:outline-none data-[state=open]:border-primary-500 data-[state=open]:ring-4 data-[state=open]:ring-primary-100">
              <ArrowDownUp className="size-4 text-slate-400" />
              <span className="font-medium text-slate-700">{currentSort.label}</span>
              <ChevronDown className="size-4 text-slate-400 transition group-data-[state=open]:rotate-180" />
            </button>
          }
        >
          <DropdownLabel>Sắp xếp theo</DropdownLabel>
          {SORT_OPTIONS.map((o) => (
            <DropdownItem
              key={o.value}
              icon={o.icon}
              label={o.label}
              description={o.description}
              active={o.value === sort}
              shortcut={o.value === sort ? <Check className="size-4" /> : undefined}
              onClick={() => onSortChange(o.value)}
            />
          ))}
        </Dropdown>

        <div className="flex h-11 items-center rounded-lg border border-slate-200 bg-white p-1">
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
