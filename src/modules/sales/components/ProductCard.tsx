import { Flame, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/cn'
import { formatCurrency } from '@/lib/format'
import type { Product } from '@/modules/sales/types/sales.types'
import { LOW_STOCK_THRESHOLD } from '@/modules/sales/utils/constants'
import { ProductThumb } from '@/modules/sales/components/ProductThumb'

interface ProductCardProps {
  product: Product
  inCart: number
  view: 'grid' | 'list'
  onAdd: (product: Product) => void
}

function StockBadge({ stock, unit }: { stock: number; unit: string }) {
  if (stock <= 0) return <Badge tone="danger">Hết hàng</Badge>
  if (stock <= LOW_STOCK_THRESHOLD) return <Badge tone="warning">Còn {stock}</Badge>
  return (
    <span className="text-[11px] text-slate-400">
      Tồn: <span className="font-semibold text-slate-600">{stock}</span> {unit.toLowerCase()}
    </span>
  )
}

export function ProductCard({ product, inCart, view, onAdd }: ProductCardProps) {
  const outOfStock = product.stock <= 0
  const discountPct = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0

  if (view === 'list') {
    return (
      <button
        onClick={() => onAdd(product)}
        disabled={outOfStock}
        className={cn(
          'group flex w-full cursor-pointer items-center gap-3 rounded-xl border border-slate-100 bg-white p-2.5 text-left transition hover:border-primary-200 hover:bg-primary-50/40 disabled:cursor-not-allowed disabled:opacity-55',
          inCart > 0 && 'border-primary-200 bg-primary-50/40',
        )}
      >
        <ProductThumb categoryId={product.categoryId} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-800">{product.name}</p>
          <p className="text-[11px] text-slate-400">
            {product.sku} · {product.unit}
          </p>
        </div>
        <StockBadge stock={product.stock} unit={product.unit} />
        <p className="w-24 text-right text-sm font-bold text-primary-700">{formatCurrency(product.price)}</p>
        <span className="grid size-8 place-items-center rounded-lg bg-primary-50 text-primary-600 transition group-hover:bg-primary-600 group-hover:text-white">
          {inCart > 0 ? <span className="text-xs font-bold">{inCart}</span> : <Plus className="size-4" />}
        </span>
      </button>
    )
  }

  return (
    <button
      onClick={() => onAdd(product)}
      disabled={outOfStock}
      className={cn(
        'group relative flex cursor-pointer flex-col rounded-2xl border border-slate-100 bg-white p-2.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-card disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0 disabled:hover:shadow-none',
        inCart > 0 && 'border-primary-300 ring-2 ring-primary-100',
      )}
    >
      <div className="relative">
        <ProductThumb categoryId={product.categoryId} />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isBestSeller && (
            <span className="flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold text-orange-600 shadow-sm">
              <Flame className="size-3" /> Bán chạy
            </span>
          )}
          {discountPct > 0 && (
            <span className="w-fit rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">-{discountPct}%</span>
          )}
        </div>
        {inCart > 0 && (
          <span className="absolute top-2 right-2 grid size-7 animate-scale-in place-items-center rounded-full bg-primary-600 text-xs font-bold text-white shadow-primary">
            {inCart}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-1 pt-2.5">
        <p className="line-clamp-2 min-h-10 text-[13px] leading-5 font-semibold text-slate-800">{product.name}</p>
        <p className="mt-0.5 text-[11px] text-slate-400">
          {product.sku} · {product.unit}
        </p>
        <div className="mt-2 flex items-end justify-between gap-2">
          <div>
            {product.originalPrice && (
              <p className="text-[11px] text-slate-400 line-through">{formatCurrency(product.originalPrice)}</p>
            )}
            <p className="text-[15px] font-bold text-primary-700">{formatCurrency(product.price)}</p>
          </div>
          <span className="grid size-8 place-items-center rounded-lg bg-primary-50 text-primary-600 transition group-hover:bg-primary-600 group-hover:text-white group-disabled:bg-slate-100 group-disabled:text-slate-400">
            <Plus className="size-4" />
          </span>
        </div>
        <div className="mt-1.5">
          <StockBadge stock={product.stock} unit={product.unit} />
        </div>
      </div>
    </button>
  )
}
