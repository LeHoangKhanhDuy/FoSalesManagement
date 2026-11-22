import { memo, type ReactNode } from 'react'
import { Copy, Ellipsis, Flame, Pencil, Trash2 } from 'lucide-react'
import { Dropdown, DropdownItem, DropdownSeparator } from '@/components/ui/Dropdown'
import { Checkbox, Switch } from '@/components/ui/Switch'
import { cn } from '@/lib/cn'
import { formatCurrency, formatNumber } from '@/lib/format'
import { calcMargin, getCategoryName, getStockLevel } from '@/modules/products/utils/products.utils'
import { ProductThumb } from '@/modules/sales/components/ProductThumb'
import type { Category, Product, ProductStatus } from '@/modules/sales/types/sales.types'
import { LOW_STOCK_THRESHOLD } from '@/modules/sales/utils/constants'
import { ProductCode } from '@/components/common/ProductCode'

export const Cell = ({ children, className }: { children: ReactNode; className?: string }) => (
  <td className={cn('px-4 py-3 align-middle', className)}>{children}</td>
)

function StockCell({ stock, unit, minStock = LOW_STOCK_THRESHOLD }: { stock: number; unit: string; minStock?: number }) {
  const level = getStockLevel(stock, minStock)
  const percent = Math.min(100, (stock / (minStock * 10)) * 100)
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

interface ProductTableRowProps {
  product: Product
  categories: Category[]
  selected: boolean
  onToggleSelect: (id: string) => void
  onEdit: (product: Product) => void
  onDuplicate: (product: Product) => void
  onDelete: (products: Product[]) => void
  onStatusChange: (ids: string[], status: ProductStatus) => void
}

export const ProductTableRow = memo(function ProductTableRow({
  product: p,
  categories,
  selected,
  onToggleSelect,
  onEdit,
  onDuplicate,
  onDelete,
  onStatusChange,
}: ProductTableRowProps) {
  const inactive = p.status === 'inactive'
  const margin = calcMargin(p.price, p.costPrice)
  return (
    <tr
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
            <ProductCode sku={p.sku} barcode={p.barcode} className="mt-0.5" />
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
        <StockCell stock={p.stock} unit={p.unit} minStock={p.minStock} />
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
})
