import { useState } from 'react'
import { ArrowRight, Equal, Minus, Plus, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Field, inputClass } from '@/components/ui/FormField'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/cn'
import { formatNumber, parseNumber } from '@/lib/format'
import type { AdjustMode, AdjustStockPayload, InventoryItem } from '@/modules/inventory/types/inventory.types'
import { ADJUST_REASONS } from '@/modules/inventory/utils/inventory.utils'
import { ProductThumb } from '@/modules/sales/components/ProductThumb'

interface AdjustStockModalProps {
  item: InventoryItem | null
  saving: boolean
  onClose: () => void
  onSubmit: (payload: AdjustStockPayload) => void
}

const MODES: { value: AdjustMode; label: string; icon: LucideIcon }[] = [
  { value: 'increase', label: 'Tăng', icon: Plus },
  { value: 'decrease', label: 'Giảm', icon: Minus },
  { value: 'set', label: 'Đặt số lượng', icon: Equal },
]

export function AdjustStockModal({ item, ...props }: AdjustStockModalProps) {
  if (!item) return null
  return <AdjustContent key={item.id} item={item} {...props} />
}

function AdjustContent({ item, saving, onClose, onSubmit }: AdjustStockModalProps & { item: InventoryItem }) {
  const [mode, setMode] = useState<AdjustMode>('decrease')
  const [quantity, setQuantity] = useState(mode === 'set' ? item.stock : 1)
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const after = mode === 'increase' ? item.stock + quantity : mode === 'decrease' ? item.stock - quantity : quantity
  const delta = after - item.stock
  const quantityError =
    mode === 'set'
      ? quantity === item.stock
        ? 'Số lượng mới đang bằng tồn hiện tại'
        : undefined
      : quantity <= 0
        ? 'Số lượng phải lớn hơn 0'
        : mode === 'decrease' && quantity > item.stock
          ? `Chỉ còn ${item.stock} trong kho`
          : undefined
  const reasonError = !reason.trim() ? 'Vui lòng chọn hoặc nhập lý do' : undefined

  const changeMode = (m: AdjustMode) => {
    setMode(m)
    setQuantity(m === 'set' ? item.stock : 1)
    setReason('')
  }

  const submit = () => {
    setSubmitted(true)
    if (quantityError || reasonError) return
    onSubmit({ productId: item.id, mode, quantity, reason: reason.trim(), note: note.trim() })
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Điều chỉnh tồn kho"
      description="Ghi nhận thay đổi số lượng ngoài bán hàng và nhập hàng"
      className="max-w-lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Hủy
          </Button>
          <Button onClick={submit} loading={saving} className="min-w-32">
            Xác nhận
          </Button>
        </>
      }
    >
      <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
        <ProductThumb categoryId={item.categoryId} image={item.image} fit={item.imageFit} alt={item.name} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-slate-900">{item.name}</p>
          <p className="text-xs text-slate-400">
            {item.sku} · Tối thiểu {item.minStockValue} {item.unit.toLowerCase()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-slate-400">Tồn hiện tại</p>
          <p className="text-lg font-bold text-slate-900">{formatNumber(item.stock)}</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        {MODES.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => changeMode(value)}
            className={cn(
              'flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border text-sm font-semibold transition',
              mode === value ? 'border-primary-500 bg-primary-50 text-primary-700 ring-4 ring-primary-100' : 'border-slate-200 text-slate-600 hover:border-slate-300',
            )}
          >
            <Icon className="size-4" /> {label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-end gap-3">
        <Field label={mode === 'set' ? 'Số lượng thực tế' : 'Số lượng'} error={submitted ? quantityError : undefined}>
          <div className="flex h-10 items-center rounded-lg border border-slate-200 focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-100">
            <button type="button" onClick={() => setQuantity((q) => Math.max(0, q - 1))} className="grid h-full w-10 cursor-pointer place-items-center text-slate-500 hover:text-slate-900" aria-label="Giảm">
              <Minus className="size-4" />
            </button>
            <input
              autoFocus
              inputMode="numeric"
              value={formatNumber(quantity)}
              onChange={(e) => setQuantity(parseNumber(e.target.value))}
              onFocus={(e) => e.target.select()}
              className="h-full w-full min-w-0 text-center text-base font-bold text-slate-900 outline-none"
            />
            <button type="button" onClick={() => setQuantity((q) => q + 1)} className="grid h-full w-10 cursor-pointer place-items-center text-slate-500 hover:text-slate-900" aria-label="Tăng">
              <Plus className="size-4" />
            </button>
          </div>
        </Field>
        <ArrowRight className="mb-3 size-4 text-slate-300" />
        <div>
          <p className="mb-1.5 text-xs font-semibold text-slate-700">Tồn sau điều chỉnh</p>
          <div
            className={cn(
              'flex h-10 items-center justify-between rounded-lg px-3',
              after < 0 ? 'bg-rose-50 text-rose-600' : delta > 0 ? 'bg-primary-50 text-primary-700' : delta < 0 ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-500',
            )}
          >
            <span className="text-base font-bold">{formatNumber(Math.max(after, 0))}</span>
            <span className="text-xs font-semibold">{delta > 0 ? `+${delta}` : delta}</span>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-xs font-semibold text-slate-700">
          Lý do <span className="text-rose-500">*</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {ADJUST_REASONS[mode].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setReason(r)}
              className={cn(
                'h-8 cursor-pointer rounded-lg border px-3 text-xs font-semibold transition',
                reason === r ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-600 hover:border-slate-300',
              )}
            >
              {r}
            </button>
          ))}
        </div>
        <input
          value={ADJUST_REASONS[mode].includes(reason) ? '' : reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Hoặc nhập lý do khác..."
          maxLength={80}
          className={cn(inputClass(submitted ? reasonError : undefined), 'mt-2')}
        />
        {submitted && reasonError && <p className="mt-1 text-[11px] font-medium text-rose-500">{reasonError}</p>}
      </div>

      <div className="mt-4">
        <p className="mb-1.5 text-xs font-semibold text-slate-700">Ghi chú</p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          maxLength={200}
          placeholder="Không bắt buộc"
          className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
        />
      </div>
    </Modal>
  )
}
