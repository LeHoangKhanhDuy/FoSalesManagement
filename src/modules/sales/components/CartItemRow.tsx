import { Gift, Minus, Plus, Tag, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import type { CartItem } from '@/modules/sales/types/sales.types'
import { ProductThumb } from '@/modules/sales/components/ProductThumb'
import { ProductCode } from '@/components/common/ProductCode'
import type { GiftLine, PricedLine } from '@/modules/promotions/utils/promotion-engine'

interface CartItemRowProps {
  item: CartItem
  index: number
  line?: PricedLine
  onQuantityChange: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
}

export function CartItemRow({ item, index, line, onQuantityChange, onRemove }: CartItemRowProps) {
  const gross = item.price * item.quantity
  const discount = line?.discount ?? 0
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
        {discount > 0 && line?.promoName && (
          <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] font-semibold text-rose-500" title={line.promoName}>
            <Tag className="size-3 shrink-0" /> {line.promoName}
          </p>
        )}
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
          <div className="text-right">
            {discount > 0 && <p className="text-[11px] text-slate-400 line-through">{formatCurrency(gross)}</p>}
            <p className={discount > 0 ? 'text-sm font-bold text-rose-600' : 'text-sm font-bold text-slate-900'}>{formatCurrency(gross - discount)}</p>
          </div>
        </div>
      </div>
    </li>
  )
}

export function GiftItemRow({ gift }: { gift: GiftLine }) {
  return (
    <li className="flex animate-slide-up items-center gap-3 rounded-xl bg-violet-50/60 p-2">
      <div className="relative">
        <ProductThumb categoryId={gift.categoryId} image={gift.image} fit={gift.imageFit} alt={gift.name} size="sm" />
        <span className="absolute -top-1.5 -left-1.5 grid size-5 place-items-center rounded-full bg-violet-500 text-white ring-2 ring-white">
          <Gift className="size-3" />
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-[13px] font-semibold text-slate-800">{gift.name}</p>
        <ProductCode barcode={gift.barcode} extra={`Tặng ${gift.quantity} ${gift.unit.toLowerCase()}`} className="text-[11px]" />
        <p className="mt-0.5 truncate text-[11px] font-semibold text-violet-600" title={gift.promoName}>
          {gift.promoName}
        </p>
      </div>
      <p className="text-sm font-bold text-violet-600">0đ</p>
    </li>
  )
}
