import { useMemo, useRef, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { useClickOutside } from '@/hooks/useClickOutside'
import { cn } from '@/lib/cn'
import { formatCurrency, removeAccents } from '@/lib/format'
import { ProductThumb } from '@/modules/sales/components/ProductThumb'
import type { Product } from '@/modules/sales/types/sales.types'
import { ProductCode } from '@/components/common/ProductCode'

interface ProductSearchPickerProps {
  products: Product[]
  selectedIds: string[]
  onSelect: (p: Product) => void
}

export function ProductSearchPicker({ products, selectedIds, onSelect }: ProductSearchPickerProps) {
  const [keyword, setKeyword] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  useClickOutside(ref, () => setOpen(false), open)

  const results = useMemo(() => {
    const k = removeAccents(keyword.trim())
    return products
      .filter((p) => p.status !== 'inactive')
      .filter((p) => !k || removeAccents(p.name).includes(k) || p.sku.toLowerCase().includes(k) || p.barcode.includes(k))
      .slice(0, 8)
  }, [products, keyword])

  const choose = (p?: Product) => {
    if (!p) return
    onSelect(p)
    setKeyword('')
    setActive(0)
  }

  return (
    <div ref={ref} className="relative">
      <div className="flex h-11 items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3.5 transition focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-100">
        <Search className="size-[18px] text-slate-400" />
        <input
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value)
            setOpen(true)
            setActive(0)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') setActive((a) => Math.min(a + 1, results.length - 1))
            if (e.key === 'ArrowUp') setActive((a) => Math.max(a - 1, 0))
            if (e.key === 'Enter') {
              e.preventDefault()
              const exact = products.find((p) => p.barcode === keyword.trim() || p.sku.toLowerCase() === keyword.trim().toLowerCase())
              choose(exact ?? results[active])
            }
            if (e.key === 'Escape') {
              e.stopPropagation()
              setOpen(false)
            }
          }}
          placeholder="Tìm hoặc quét mã sản phẩm để thêm vào đơn..."
          className="h-full w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
      </div>
      {open && results.length > 0 && (
        <ul className="absolute inset-x-0 top-12 z-20 max-h-80 animate-slide-up overflow-y-auto rounded-lg border border-slate-100 bg-white p-1 shadow-xl shadow-slate-950/10">
          {results.map((p, i) => {
            const added = selectedIds.includes(p.id)
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onClick={() => choose(p)}
                  className={cn('flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-left', i === active && 'bg-slate-100')}
                >
                  <ProductThumb categoryId={p.categoryId} image={p.image} fit={p.imageFit} alt={p.name} size="sm" className="size-9" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-800">{p.name}</span>
                    <ProductCode sku={p.sku} barcode={p.barcode} extra={`Tồn ${p.stock} · Giá vốn ${formatCurrency(p.costPrice ?? 0)}`} />
                  </span>
                  <span className={cn('flex items-center gap-1 text-xs font-semibold', added ? 'text-slate-400' : 'text-primary-600')}>
                    <Plus className="size-3.5" /> {added ? 'Thêm SL' : 'Thêm'}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
