import { memo, useMemo } from 'react'
import { PackageSearch } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/cn'
import type { CartItem, Product } from '@/modules/sales/types/sales.types'
import { ProductCard } from '@/modules/sales/components/ProductCard'
import type { ViewMode } from '@/modules/sales/components/ProductToolbar'

interface ProductGridProps {
  products: Product[]
  cartItems: CartItem[]
  loading: boolean
  view: ViewMode
  onAdd: (product: Product) => void
}

export const ProductGrid = memo(function ProductGrid({ products, cartItems, loading, view, onAdd }: ProductGridProps) {
  const qtyMap = useMemo(() => new Map(cartItems.map((i) => [i.productId, i.quantity])), [cartItems])

  const gridClass =
    view === 'grid' ? 'grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-5 xl:grid-cols-4' : 'flex flex-col gap-2'

  if (loading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className={cn('animate-pulse rounded-2xl border border-slate-100 bg-white p-2.5', view === 'list' && 'h-[68px]')}
          >
            {view === 'grid' && (
              <>
                <div className="aspect-[4/3] rounded-lg bg-slate-100" />
                <div className="mt-3 h-3 w-4/5 rounded bg-slate-100" />
                <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
                <div className="mt-4 h-4 w-2/5 rounded bg-slate-100" />
              </>
            )}
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={<PackageSearch />}
        title="Không tìm thấy sản phẩm"
        description="Thử tìm bằng từ khóa khác, mã SKU hoặc quét lại mã vạch."
        className="py-16"
      />
    )
  }

  return (
    <div className={gridClass}>
      {products.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          view={view}
          inCart={qtyMap.get(p.id) ?? 0}
          onAdd={onAdd}
        />
      ))}
    </div>
  )
})
