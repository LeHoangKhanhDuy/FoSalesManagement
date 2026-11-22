import { memo, type ReactNode } from 'react'
import { Copy, Ellipsis, Flame, PackageSearch, Pencil, RotateCcw, Trash2, X } from 'lucide-react'
import { Dropdown, DropdownItem, DropdownSeparator } from '@/components/ui/Dropdown'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'
import { Checkbox, Switch } from '@/components/ui/Switch'
import { cn } from '@/lib/cn'
import { formatCurrency, formatNumber } from '@/lib/format'
import { calcMargin, getCategoryName, getStockLevel, PAGE_SIZE } from '@/modules/products/utils/products.utils'
import { ProductThumb } from '@/modules/sales/components/ProductThumb'
import type { Category, Product, ProductStatus } from '@/modules/sales/types/sales.types'
import { LOW_STOCK_THRESHOLD } from '@/modules/sales/utils/constants'

interface ProductsTableProps {
  products: Product[]
  categories: Category[]
  total: number
  page: number
  loading: boolean
  hasActiveFilters: boolean
  selectedIds: Set<string>
  selectedProducts: Product[]
  onPageChange: (page: number) => void
  onToggleSelect: (id: string) => void
  onToggleSelectPage: (checked: boolean) => void
  onClearSelection: () => void
  onEdit: (product: Product) => void
  onDuplicate: (product: Product) => void
  onDelete: (products: Product[]) => void
  onStatusChange: (ids: string[], status: ProductStatus) => void
  onResetFilters: () => void
}

const COLUMNS: { label: string; className?: string }[] = [
  { label: '', className: 'w-12' },
  { label: 'Sản phẩm' },
  { label: 'Danh mục' },
  { label: 'Giá bán', className: 'text-right' },
  { label: 'Giá vốn', className: 'text-right' },
  { label: 'Tồn kho' },
  { label: 'Đang bán', className: 'text-center' },
  { label: '', className: 'w-24' },
]

const Cell = ({ children, className }: { children: ReactNode; className?: string }) => (
  <td className={cn('px-4 py-3 align-middle', className)}>{children}</td>
)

function StockCell({ stock, unit }: { stock: number; unit: string }) {
  const level = getStockLevel(stock)
  const percent = Math.min(100, (stock / (LOW_STOCK_THRESHOLD * 10)) * 100)
  return (
    <div className="w-32">
      <p
        className={cn(
          'text-sm font-semibold',
          level === 'out' ? 'text-rose-500' : level === 'low' ? 'text-amber-600' : 'text-slate-800',
        )}
      >
        {level === 'out' ? 'Hết hàng' : `${formatNumber(stock)} ${unit.toLowerCase()}`}
      </p>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn('h-full rounded-full', level === 'out' ? 'bg-rose-400' : level === 'low' ? 'bg-amber-400' : 'bg-primary-500')}
          style={{ width: `${level === 'out' ? 0 : Math.max(6, percent)}%` }}
        />
      </div>
    </div>
  )
}

export const ProductsTable = memo(function ProductsTable(props: ProductsTableProps) {
  const {
    products,
    categories,
    total,
    page,
    loading,
    hasActiveFilters,
    selectedIds,
    selectedProducts,
    onPageChange,
    onToggleSelect,
    onToggleSelectPage,
    onClearSelection,
    onEdit,
    onDuplicate,
    onDelete,
    onStatusChange,
    onResetFilters,
  } = props

  const pageSelected = products.filter((p) => selectedIds.has(p.id)).length
  const allPageSelected = products.length > 0 && pageSelected === products.length
  const selectedCount = selectedIds.size

  return (
    <div>
      {selectedCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-y border-primary-100 bg-primary-50/60 px-4 py-2.5">
          <p className="mr-2 text-sm font-semibold text-primary-800">Đã chọn {selectedCount} sản phẩm</p>
          <button
            onClick={() => onStatusChange([...selectedIds], 'active')}
            className="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:ring-primary-300"
          >
            Mở bán
          </button>
          <button
            onClick={() => onStatusChange([...selectedIds], 'inactive')}
            className="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:ring-amber-300"
          >
            Ngừng bán
          </button>
          <button
            onClick={() => onDelete(selectedProducts)}
            className="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-semibold text-rose-600 ring-1 ring-slate-200 transition hover:ring-rose-300"
          >
            Xóa
          </button>
          <button
            onClick={onClearSelection}
            className="ml-auto flex h-8 cursor-pointer items-center gap-1 rounded-lg px-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            <X className="size-4" /> Bỏ chọn
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
              {COLUMNS.map((c, i) => (
                <th key={i} className={cn('px-4 py-3 whitespace-nowrap', c.className)}>
                  {i === 0 ? (
                    <Checkbox
                      checked={allPageSelected}
                      indeterminate={pageSelected > 0 && !allPageSelected}
                      onChange={onToggleSelectPage}
                      label="Chọn tất cả trên trang"
                    />
                  ) : (
                    c.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading &&
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  <Cell>
                    <div className="size-[18px] animate-pulse rounded bg-slate-100" />
                  </Cell>
                  <Cell>
                    <div className="flex items-center gap-3">
                      <div className="size-12 animate-pulse rounded-lg bg-slate-100" />
                      <div className="space-y-2">
                        <div className="h-3.5 w-44 animate-pulse rounded bg-slate-100" />
                        <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
                      </div>
                    </div>
                  </Cell>
                  {COLUMNS.slice(2).map((_, j) => (
                    <Cell key={j}>
                      <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
                    </Cell>
                  ))}
                </tr>
              ))}

            {!loading &&
              products.map((p) => {
                const selected = selectedIds.has(p.id)
                const inactive = p.status === 'inactive'
                const margin = calcMargin(p.price, p.costPrice)
                return (
                  <tr
                    key={p.id}
                    onClick={() => onEdit(p)}
                    className={cn('group cursor-pointer transition', selected ? 'bg-primary-50/40' : 'hover:bg-slate-50/80')}
                  >
                    <Cell>
                      <Checkbox checked={selected} onChange={() => onToggleSelect(p.id)} label={`Chọn ${p.name}`} />
                    </Cell>
                    <Cell>
                      <div className={cn('flex items-center gap-3', inactive && 'opacity-60')}>
                        <ProductThumb categoryId={p.categoryId} image={p.image} fit={p.imageFit} alt={p.name} size="sm" />
                        <div className="min-w-0">
                          <p className="flex items-center gap-1.5 font-semibold text-slate-900 group-hover:text-primary-700">
                            <span className="truncate">{p.name}</span>
                            {p.isBestSeller && <Flame className="size-3.5 shrink-0 text-orange-500" aria-label="Bán chạy" />}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-400">
                            {p.sku} · {p.barcode}
                          </p>
                        </div>
                      </div>
                    </Cell>
                    <Cell className="whitespace-nowrap text-slate-600">{getCategoryName(categories, p.categoryId)}</Cell>
                    <Cell className="text-right whitespace-nowrap">
                      <p className="font-bold text-slate-900">{formatCurrency(p.price)}</p>
                      {p.originalPrice && <p className="text-xs text-slate-400 line-through">{formatCurrency(p.originalPrice)}</p>}
                    </Cell>
                    <Cell className="text-right whitespace-nowrap">
                      <p className="text-slate-600">{p.costPrice ? formatCurrency(p.costPrice) : '—'}</p>
                      {margin !== null && (
                        <p className={cn('text-xs font-semibold', margin < 15 ? 'text-amber-600' : 'text-primary-600')}>
                          Lãi {margin}%
                        </p>
                      )}
                    </Cell>
                    <Cell>
                      <StockCell stock={p.stock} unit={p.unit} />
                    </Cell>
                    <Cell className="text-center">
                      <Switch
                        size="sm"
                        checked={!inactive}
                        onChange={(on) => onStatusChange([p.id], on ? 'active' : 'inactive')}
                        label={inactive ? 'Mở bán' : 'Ngừng bán'}
                      />
                    </Cell>
                    <Cell>
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <Dropdown
                          align="end"
                          trigger={
                            <button
                              className="grid size-8 cursor-pointer place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 data-[state=open]:bg-slate-100 data-[state=open]:text-slate-700"
                              aria-label="Thao tác khác"
                            >
                              <Ellipsis className="size-4" />
                            </button>
                          }
                        >
                          <DropdownItem icon={Pencil} label="Chỉnh sửa" onClick={() => onEdit(p)} />
                          <DropdownItem icon={Copy} label="Nhân bản" onClick={() => onDuplicate(p)} />
                          <DropdownSeparator />
                          <DropdownItem icon={Trash2} label="Xóa sản phẩm" danger onClick={() => onDelete([p])} />
                        </Dropdown>
                      </div>
                    </Cell>
                  </tr>
                )
              })}
          </tbody>
        </table>

        {!loading && products.length === 0 && (
          <EmptyState
            icon={<PackageSearch />}
            title="Không có sản phẩm phù hợp"
            description="Thử đổi từ khóa hoặc bộ lọc, hoặc thêm sản phẩm mới."
            className="py-16"
            action={
              hasActiveFilters && (
                <button
                  onClick={onResetFilters}
                  className="flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  <RotateCcw className="size-4" /> Xóa bộ lọc
                </button>
              )
            }
          />
        )}
      </div>

      {!loading && total > 0 && (
        <Pagination
          page={page}
          pageSize={PAGE_SIZE}
          total={total}
          onPageChange={onPageChange}
          unit="sản phẩm"
          className="border-t border-slate-100 px-4 py-3"
        />
      )}
    </div>
  )
})
