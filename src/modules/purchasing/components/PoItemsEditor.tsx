import { PackageOpen, Trash2 } from 'lucide-react'
import { NumberInput } from '@/components/ui/FormField'
import { formatCurrency } from '@/lib/format'
import type { PurchaseOrderItem } from '@/modules/purchasing/types/purchasing.types'
import { ProductThumb } from '@/modules/sales/components/ProductThumb'
import type { Product } from '@/modules/sales/types/sales.types'
import { ProductCode } from '@/components/common/ProductCode'

interface PoItemsEditorProps {
  items: PurchaseOrderItem[]
  products: Product[]
  onUpdate: (productId: string, patch: Partial<PurchaseOrderItem>) => void
  onRemove: (productId: string) => void
}

export function PoItemsEditor({ items, products, onUpdate, onRemove }: PoItemsEditorProps) {
  if (!items.length) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-slate-200 py-8 text-center">
        <PackageOpen className="size-8 text-slate-300" />
        <p className="text-sm font-semibold text-slate-600">Chưa có sản phẩm</p>
        <p className="text-xs text-slate-400">Tìm/quét sản phẩm ở trên hoặc bấm “Thêm hàng sắp hết”</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-100">
      <div className="grid grid-cols-[minmax(0,1fr)_96px_80px_112px_104px_32px] gap-2 bg-slate-50 px-3 py-2 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
        <span>Sản phẩm</span>
        <span className="text-right">SL đặt</span>
        <span className="text-right">Quy cách</span>
        <span className="text-right">Giá nhập</span>
        <span className="text-right">Thành tiền</span>
        <span />
      </div>
      <ul className="divide-y divide-slate-100">
        {items.map((i) => {
          const stock = products.find((p) => p.id === i.productId)?.stock
          return (
            <li key={i.productId} className="grid grid-cols-[minmax(0,1fr)_96px_80px_112px_104px_32px] items-center gap-2 px-3 py-2.5">
              <div className="flex min-w-0 items-center gap-2.5">
                <ProductThumb categoryId={i.categoryId} image={i.image} fit={i.imageFit} alt={i.name} size="sm" className="size-9" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">{i.name}</p>
                  <ProductCode sku={i.sku} barcode={i.barcode} extra={`Tồn ${stock ?? '—'} ${i.unit.toLowerCase()}`} className="text-[11px]" />
                </div>
              </div>
              <div>
                <NumberInput value={i.orderedQty} onChange={(v) => onUpdate(i.productId, { orderedQty: v })} className="h-9" />
                {i.packSize > 1 && i.orderedQty >= i.packSize && (
                  <p className="mt-0.5 text-right text-[10px] text-slate-400">
                    ≈ {Math.floor(i.orderedQty / i.packSize)} thùng{i.orderedQty % i.packSize ? ` + ${i.orderedQty % i.packSize}` : ''}
                  </p>
                )}
              </div>
              <NumberInput value={i.packSize} onChange={(v) => onUpdate(i.productId, { packSize: Math.max(1, v) })} suffix="/th" className="h-9" />
              <NumberInput value={i.unitCost} onChange={(v) => onUpdate(i.productId, { unitCost: v })} suffix="đ" className="h-9" />
              <p className="text-right text-sm font-bold text-slate-900">{formatCurrency(i.orderedQty * i.unitCost)}</p>
              <button
                type="button"
                onClick={() => onRemove(i.productId)}
                className="grid size-8 cursor-pointer place-items-center rounded-lg text-slate-300 transition hover:bg-rose-50 hover:text-rose-500"
                aria-label={`Xóa ${i.name}`}
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
