import { memo } from 'react'
import { PackageSearch, RotateCcw } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'
import { Checkbox } from '@/components/ui/Switch'
import { cn } from '@/lib/cn'
import { ProductBulkBar } from '@/modules/products/components/ProductBulkBar'
import { Cell, ProductTableRow } from '@/modules/products/components/ProductTableRow'
import { PAGE_SIZE } from '@/modules/products/utils/products.utils'
import type { Category, Product, ProductStatus } from '@/modules/sales/types/sales.types'

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

  return (
    <div>
      <ProductBulkBar
        selectedIds={selectedIds}
        selectedProducts={selectedProducts}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
        onClearSelection={onClearSelection}
      />

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
              products.map((p) => (
                <ProductTableRow
                  key={p.id}
                  product={p}
                  categories={categories}
                  selected={selectedIds.has(p.id)}
                  onToggleSelect={onToggleSelect}
                  onEdit={onEdit}
                  onDuplicate={onDuplicate}
                  onDelete={onDelete}
                  onStatusChange={onStatusChange}
                />
              ))}
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
