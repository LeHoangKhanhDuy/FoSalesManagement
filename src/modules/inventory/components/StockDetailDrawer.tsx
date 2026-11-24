import { useState } from 'react'
import { Check, History, Pencil, SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Drawer'
import { useLastValue } from '@/hooks/useLastValue'
import { FormSection } from '@/components/ui/FormField'
import { cn } from '@/lib/cn'
import { formatCurrency, formatDateTime, formatNumber, parseNumber } from '@/lib/format'
import { MovementTypeBadge, QuantityChange } from '@/modules/inventory/components/MovementTypeBadge'
import { StockChart } from '@/modules/inventory/components/StockChart'
import type { InventoryItem, StockMovement, StockPoint } from '@/modules/inventory/types/inventory.types'
import { ProductThumb } from '@/modules/sales/components/ProductThumb'
import { ProductCode } from '@/components/common/ProductCode'

interface StockDetailDrawerProps {
  item: InventoryItem | null
  series: StockPoint[]
  movements: StockMovement[]
  loading: boolean
  onClose: () => void
  onAdjust: (item: InventoryItem) => void
  onSaveMinStock: (productId: string, minStock: number) => void
  onViewHistory: (item: InventoryItem) => void
}

function MinStockEditor({ value, onSave }: { value: number; onSave: (v: number) => void }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => {
          setDraft(value)
          setEditing(true)
        }}
        className="group/min flex cursor-pointer items-center gap-1.5 text-xl font-bold text-slate-900"
      >
        {formatNumber(value)}
        <Pencil className="size-3.5 text-slate-300 group-hover/min:text-primary-600" />
      </button>
    )
  }
  const save = () => {
    onSave(draft)
    setEditing(false)
  }
  return (
    <div className="flex items-center gap-1">
      <input
        autoFocus
        inputMode="numeric"
        value={formatNumber(draft)}
        onChange={(e) => setDraft(parseNumber(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === 'Enter') save()
          if (e.key === 'Escape') {
            e.stopPropagation()
            setEditing(false)
          }
        }}
        className="h-8 w-16 rounded-md border border-primary-400 px-2 text-base font-bold outline-none focus:ring-4 focus:ring-primary-100"
      />
      <button type="button" onClick={save} className="grid size-7 cursor-pointer place-items-center rounded-md bg-primary-600 text-white" aria-label="Lưu">
        <Check className="size-4" />
      </button>
      <button type="button" onClick={() => setEditing(false)} className="grid size-7 cursor-pointer place-items-center rounded-md text-slate-400 hover:bg-slate-100" aria-label="Hủy">
        <X className="size-4" />
      </button>
    </div>
  )
}

export function StockDetailDrawer({ item: openItem, series, movements: openMovements, loading, onClose, onAdjust, onSaveMinStock, onViewHistory }: StockDetailDrawerProps) {
  const item = useLastValue(openItem)
  const movements = useLastValue(openItem ? openMovements : null) ?? []
  const points = useLastValue(openItem ? series : null) ?? []
  if (!item) return null
  const recent = movements.slice(0, 8)

  return (
    <Drawer
      open={!!openItem}
      onClose={onClose}
      title={item.name}
      description={<ProductCode sku={item.sku} barcode={item.barcode} className="text-sm" />}
      footer={
        <>
          <Button variant="outline" leftIcon={<History className="size-4" />} onClick={() => onViewHistory(item)}>
            Toàn bộ lịch sử
          </Button>
          <Button className="ml-auto" leftIcon={<SlidersHorizontal className="size-4" />} onClick={() => onAdjust(item)}>
            Điều chỉnh tồn
          </Button>
        </>
      }
    >
      <div className="flex items-center gap-4">
        <div className="w-28 shrink-0">
          <ProductThumb categoryId={item.categoryId} image={item.image} fit={item.imageFit} alt={item.name} />
        </div>
        <div className="grid flex-1 grid-cols-3 gap-2">
          {[
            {
              label: 'Tồn hiện tại',
              node: (
                <p className={cn('text-xl font-bold', item.level === 'out' ? 'text-rose-500' : item.level === 'low' ? 'text-amber-600' : 'text-slate-900')}>
                  {formatNumber(item.stock)}
                </p>
              ),
            },
            { label: 'Tồn tối thiểu', node: <MinStockEditor value={item.minStockValue} onSave={(v) => onSaveMinStock(item.id, v)} /> },
            { label: 'Bán 30 ngày', node: <p className="text-xl font-bold text-slate-900">{formatNumber(item.soldLast30)}</p> },
          ].map((s) => (
            <div key={s.label} className="rounded-lg bg-slate-50 p-3">
              <p className="text-[11px] font-medium text-slate-500">{s.label}</p>
              {s.node}
            </div>
          ))}
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Giá trị tồn: <span className="font-semibold text-slate-800">{formatCurrency(item.stockValue)}</span> · Đơn vị:{' '}
        <span className="font-semibold text-slate-800">{item.unit}</span>
      </p>

      <FormSection title="Tồn kho 30 ngày">
        <div className="rounded-lg border border-slate-100 p-3">
          {loading && points.length === 0 ? (
            <div className="h-[168px] animate-pulse rounded-md bg-slate-50" />
          ) : (
            <StockChart points={points} minStock={item.minStockValue} unit={item.unit} />
          )}
        </div>
      </FormSection>

      <FormSection title="Biến động gần đây">
        {loading && recent.length === 0 ? (
          <div className="h-24 animate-pulse rounded-lg bg-slate-50" />
        ) : recent.length === 0 ? (
          <p className="rounded-lg bg-slate-50 p-4 text-center text-sm text-slate-400">Chưa có biến động</p>
        ) : (
          <ul className="divide-y divide-slate-100 rounded-lg border border-slate-100">
            {recent.map((m) => (
              <li key={m.id} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                <MovementTypeBadge type={m.type} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-slate-500">{m.refCode ?? m.reason ?? '—'}</p>
                  <p className="text-[11px] text-slate-400">
                    {formatDateTime(new Date(m.createdAt))} · {m.createdBy}
                  </p>
                </div>
                <div className="text-right">
                  <QuantityChange value={m.quantity} />
                  <p className="text-[11px] text-slate-400">
                    {m.before} → {m.after}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </FormSection>
    </Drawer>
  )
}
