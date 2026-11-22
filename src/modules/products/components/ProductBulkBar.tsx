import { X } from 'lucide-react'
import type { Product, ProductStatus } from '@/modules/sales/types/sales.types'

interface ProductBulkBarProps {
  selectedIds: Set<string>
  selectedProducts: Product[]
  onStatusChange: (ids: string[], status: ProductStatus) => void
  onDelete: (products: Product[]) => void
  onClearSelection: () => void
}

export function ProductBulkBar({ selectedIds, selectedProducts, onStatusChange, onDelete, onClearSelection }: ProductBulkBarProps) {
  const selectedCount = selectedIds.size
  if (selectedCount === 0) return null
  const ids = [...selectedIds]

  return (
    <div className="flex flex-wrap items-center gap-2 border-y border-primary-100 bg-primary-50/60 px-4 py-2.5">
      <p className="mr-2 text-sm font-semibold text-primary-800">Đã chọn {selectedCount} sản phẩm</p>
      <button
        onClick={() => onStatusChange(ids, 'active')}
        className="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:ring-primary-300"
      >
        Mở bán
      </button>
      <button
        onClick={() => onStatusChange(ids, 'inactive')}
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
  )
}
