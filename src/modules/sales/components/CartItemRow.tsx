import { Minus, Plus, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import type { CartItem } from '@/modules/sales/types/sales.types'
import { ProductThumb } from '@/modules/sales/components/ProductThumb'
import { ProductCode } from '@/components/common/ProductCode'

interface CartItemRowProps {
  item: CartItem
  index: number
  onQuantityChange: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
}

export function CartItemRow({ item, index, onQuantityChange, onRemove }: CartItemRowProps) {
  return (
    <li className="group flex animate-slide-up gap-3 rounded-xl p-2 transition hover:bg-slate-50">
      <div className="relative">
        <ProductThumb categoryId={item.categoryId} image={item.image} fit={item.imageFit} alt={item.name} size="sm" />
        <span className="absolute -top-1.5 -left-1.5 grid size-5 place-items-center rounded-full bg-white text-[10px] font-bold text-slate-500 ring-1 ring-slate-200">
          {index}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p className="line-clamp-1 flex-1 text-[13px] font-semibold text-slate-800">{item.name}</p>
          <button
            onClick={() => onRemove(item.productId)}
            className="cursor-pointer text-slate-300 transition hover:text-rose-500"
            aria-label="Xóa sản phẩm"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
        <ProductCode barcode={item.barcode} extra={item.unit} className="text-[11px]" />
        <div className="mt-1.5 flex items-center justify-between">
          <div className="flex h-8 items-center rounded-lg border border-slate-200 bg-white">
            <button
              onClick={() => onQuantityChange(item.productId, item.quantity - 1)}
              className="grid h-full w-8 cursor-pointer place-items-center rounded-l-lg text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              aria-label="Giảm"
            >
              <Minus className="size-3.5" />
            </button>
            <input
              type="number"
              min={0}
              value={item.quantity}
              onChange={(e) => onQuantityChange(item.productId, Number(e.target.value))}
              onFocus={(e) => e.target.select()}
              className="h-full w-10 border-x border-slate-200 text-center text-sm font-semibold text-slate-900 outline-none"
            />
            <button
              onClick={() => onQuantityChange(item.productId, item.quantity + 1)}
              className="grid h-full w-8 cursor-pointer place-items-center rounded-r-lg text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              aria-label="Tăng"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
          <p className="text-sm font-bold text-slate-900">{formatCurrency(item.price * item.quantity)}</p>
        </div>
      </div>
    </li>
  )
}
