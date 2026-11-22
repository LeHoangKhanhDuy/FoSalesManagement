import { useMemo, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { ReceivingLineItem } from '@/modules/purchasing/components/ReceivingLineItem'
import { ReceivingScanPanel } from '@/modules/purchasing/components/ReceivingScanPanel'
import type { useReceiving } from '@/modules/purchasing/hooks/useReceiving'
import type { LineState } from '@/modules/purchasing/types/purchasing.types'
import { getLineState, hasDiscrepancy } from '@/modules/purchasing/utils/receiving.utils'

type Receiving = ReturnType<typeof useReceiving>
type Filter = 'all' | 'pending' | 'partial' | 'complete' | 'issue'

const FILTERS: { value: Filter; label: string; match: (s: LineState) => boolean }[] = [
  { value: 'all', label: 'Tất cả', match: () => true },
  { value: 'pending', label: 'Chưa quét', match: (s) => s === 'pending' },
  { value: 'partial', label: 'Còn thiếu', match: (s) => s === 'partial' },
  { value: 'complete', label: 'Đủ', match: (s) => s === 'complete' },
  { value: 'issue', label: 'Thừa / ngoài đơn', match: (s) => s === 'over' || s === 'extra' },
]

export function ReceivingCount({ receiving }: { receiving: Receiving }) {
  const { draft, summary, flash } = receiving
  const [filter, setFilter] = useState<Filter>('all')
  const counts = useMemo(() => Object.fromEntries(FILTERS.map((f) => [f.value, draft.lines.filter((l) => f.match(getLineState(l))).length])), [draft.lines])
  const visible = draft.lines.filter((l) => FILTERS.find((f) => f.value === filter)!.match(getLineState(l)))
  const issues = draft.lines.filter(hasDiscrepancy).length

  return (
    <div className="flex min-h-0 flex-1 gap-4 p-4">
      <section className="flex min-h-0 min-w-0 flex-1 flex-col rounded-lg bg-white">
        <div className="scrollbar-none flex gap-1.5 overflow-x-auto border-b border-slate-100 p-3">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                'flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition',
                filter === f.value ? 'border-primary-600 bg-primary-600 text-white' : 'border-slate-200 text-slate-600 hover:border-primary-300',
              )}
            >
              {f.label}
              <span className={cn('rounded-full px-1.5 text-[10px] leading-4', filter === f.value ? 'bg-white/20' : 'bg-slate-100')}>{counts[f.value]}</span>
            </button>
          ))}
        </div>
        <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
          {visible.map((l) => (
            <ReceivingLineItem key={l.productId} line={l} highlighted={flash?.productId === l.productId} onAdd={receiving.addQuantity} onUpdate={receiving.updateLine} onRemove={receiving.removeExtra} />
          ))}
          {!visible.length && <li className="py-10 text-center text-sm text-slate-400">Không có dòng hàng nào</li>}
        </ul>
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 p-3">
          <p className="text-sm text-slate-500">
            Đã quét <span className="font-bold text-slate-900">{summary.scanned}</span> / {summary.expected} đơn vị
            {issues > 0 && <span className="ml-2 font-semibold text-amber-600">· {issues} dòng chênh lệch</span>}
          </p>
          <Button disabled={!summary.scanned} rightIcon={<ArrowRight className="size-4" />} onClick={() => receiving.setStep('review')}>
            Đối chiếu & nhập kho
          </Button>
        </div>
      </section>
      <ReceivingScanPanel flash={flash} scans={draft.scans} summary={summary} onManualCode={receiving.scanCode} onUndo={receiving.undoLastScan} />
    </div>
  )
}
