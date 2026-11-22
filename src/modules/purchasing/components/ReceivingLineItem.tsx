import { memo, useState } from 'react'
import { ChevronDown, Minus, PackagePlus, Plus, X } from 'lucide-react'
import { DatePicker } from '@/components/ui/DatePicker'
import { inputClass, NumberInput } from '@/components/ui/FormField'
import { cn } from '@/lib/cn'
import { formatNumber, parseNumber } from '@/lib/format'
import type { ReceivingLine } from '@/modules/purchasing/types/purchasing.types'
import { getLineState, LINE_STATE } from '@/modules/purchasing/utils/receiving.utils'
import { ProductThumb } from '@/modules/sales/components/ProductThumb'

interface Props {
  line: ReceivingLine
  highlighted: boolean
  onAdd: (productId: string, qty: number) => void
  onUpdate: (productId: string, patch: Partial<ReceivingLine>) => void
  onRemove: (productId: string) => void
}

export const ReceivingLineItem = memo(function ReceivingLineItem({ line, highlighted, onAdd, onUpdate, onRemove }: Props) {
  const [open, setOpen] = useState(false)
  const state = getLineState(line)
  const meta = LINE_STATE[state]
  const percent = line.expectedQty ? Math.min(100, (line.scannedQty / line.expectedQty) * 100) : 100

  return (
    <li className={cn('rounded-lg border bg-white transition', highlighted ? 'border-primary-400 ring-4 ring-primary-100' : 'border-slate-100', meta.row)}>
      <div className="flex items-center gap-3 p-3">
        <ProductThumb categoryId={line.categoryId} image={line.image} fit={line.imageFit} alt={line.name} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={cn('size-2 shrink-0 rounded-full', meta.dot)} />
            <p className="truncate text-sm font-semibold text-slate-900">{line.name}</p>
          </div>
          <p className="text-xs text-slate-400">
            {line.sku} · {line.barcode}
          </p>
          <div className="mt-1.5 h-1.5 w-full max-w-[240px] overflow-hidden rounded-full bg-slate-100">
            <div className={cn('h-full rounded-full transition-all', state === 'complete' ? 'bg-primary-500' : state === 'partial' ? 'bg-amber-400' : 'bg-rose-400')} style={{ width: `${percent}%` }} />
          </div>
        </div>
        <div className="w-24 text-right">
          <p className="text-2xl leading-none font-extrabold text-slate-900">{formatNumber(line.scannedQty)}</p>
          <p className="mt-1 text-xs text-slate-400">{line.extra ? 'ngoài đơn' : `/ ${line.expectedQty} ${line.unit.toLowerCase()}`}</p>
          <p className={cn('text-[11px] font-semibold', meta.text)}>{meta.label}</p>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => onAdd(line.productId, -1)} disabled={!line.scannedQty} className="grid size-9 cursor-pointer place-items-center rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 disabled:opacity-40" aria-label="Bớt 1">
            <Minus className="size-4" />
          </button>
          <button type="button" onClick={() => onAdd(line.productId, 1)} className="grid size-9 cursor-pointer place-items-center rounded-lg border border-slate-200 text-slate-500 hover:border-primary-300 hover:text-primary-700" aria-label="Thêm 1">
            <Plus className="size-4" />
          </button>
          {line.packSize > 1 && (
            <button type="button" onClick={() => onAdd(line.productId, line.packSize)} className="flex h-9 cursor-pointer items-center gap-1 rounded-lg bg-primary-50 px-2.5 text-xs font-bold text-primary-700 hover:bg-primary-100" title={`+1 thùng (${line.packSize})`} aria-label={`Thêm 1 thùng (${line.packSize})`}>
              <PackagePlus className="size-4" /> {line.packSize}
            </button>
          )}
          <button type="button" onClick={() => setOpen((v) => !v)} className={cn('grid size-9 cursor-pointer place-items-center rounded-lg text-slate-400 hover:bg-slate-100', open && 'bg-slate-100 text-slate-700')} aria-label="Chi tiết">
            <ChevronDown className={cn('size-4 transition', open && 'rotate-180')} />
          </button>
          {line.extra && (
            <button type="button" onClick={() => onRemove(line.productId)} className="grid size-9 cursor-pointer place-items-center rounded-lg text-rose-400 hover:bg-rose-50" aria-label="Bỏ dòng">
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>
      {open && (
        <div className="grid animate-slide-up grid-cols-4 gap-3 border-t border-slate-100 px-3 py-3">
          <label className="text-xs font-semibold text-slate-600">
            Số lượng đếm
            <input inputMode="numeric" value={formatNumber(line.scannedQty)} onChange={(e) => onUpdate(line.productId, { scannedQty: parseNumber(e.target.value) })} className={cn(inputClass(), 'mt-1 h-9 text-right font-bold')} />
          </label>
          <label className="text-xs font-semibold text-slate-600">
            Hư hỏng / lỗi
            <div className="mt-1">
              <NumberInput value={line.damagedQty} onChange={(v) => onUpdate(line.productId, { damagedQty: v })} className="h-9 text-rose-600" />
            </div>
          </label>
          <div className="text-xs font-semibold text-slate-600">
            Hạn sử dụng
            <div className="mt-1">
              <DatePicker value={line.expiryDate ? new Date(line.expiryDate) : undefined} onChange={(d) => onUpdate(line.productId, { expiryDate: d?.toISOString() })} disablePast side="auto" className="h-9" placeholder="dd/mm/yyyy" />
            </div>
          </div>
          <label className="text-xs font-semibold text-slate-600">
            Số lô
            <input value={line.lotNo ?? ''} onChange={(e) => onUpdate(line.productId, { lotNo: e.target.value })} placeholder="VD: L2611" className={cn(inputClass(), 'mt-1 h-9')} />
          </label>
        </div>
      )}
    </li>
  )
})
