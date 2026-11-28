import { useState } from 'react'
import { CircleAlert, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { inputClass, NumberInput } from '@/components/ui/FormField'
import { cn } from '@/lib/cn'
import { formatCurrency } from '@/lib/format'
import type { useReceiving } from '@/modules/purchasing/hooks/useReceiving'
import type { ExcessAction, ReceivingLine, ShortageAction } from '@/modules/purchasing/types/purchasing.types'
import { APPROVAL_THRESHOLD } from '@/modules/purchasing/utils/purchasing.utils'
import { acceptedQty, getLineState, hasDiscrepancy, LINE_STATE } from '@/modules/purchasing/utils/receiving.utils'
import { ProductCode } from '@/components/common/ProductCode'

type Receiving = ReturnType<typeof useReceiving>

function Segment<T extends string>({ value, options, onChange }: { value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div className="inline-flex rounded-md bg-slate-100 p-0.5">
      {options.map(([v, l]) => (
        <button key={v} type="button" onClick={() => onChange(v)} className={cn('h-7 cursor-pointer rounded px-2 text-[11px] font-semibold whitespace-nowrap', value === v ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500')}>
          {l}
        </button>
      ))}
    </div>
  )
}

function Handling({ line, onUpdate }: { line: ReceivingLine; onUpdate: Receiving['updateLine'] }) {
  const state = getLineState(line)
  return (
    <div className="flex flex-col items-start gap-1">
      {!line.extra && acceptedQty(line) < line.expectedQty ? (
        <Segment<ShortageAction> value={line.shortageAction} options={[['backorder', 'Chờ giao bù'], ['cancel', 'Hủy phần thiếu']]} onChange={(v) => onUpdate(line.productId, { shortageAction: v })} />
      ) : null}
      {state === 'over' || state === 'extra' ? (
        <Segment<ExcessAction> value={line.excessAction} options={[['accept', 'Nhận thêm'], ['return', 'Trả lại NCC']]} onChange={(v) => onUpdate(line.productId, { excessAction: v })} />
      ) : null}
      {line.damagedQty > 0 && <span className="text-[11px] font-semibold text-rose-500">{line.damagedQty} hỏng → trả NCC</span>}
      {state === 'complete' && !line.damagedQty && <span className="text-[11px] font-semibold text-primary-600">Khớp</span>}
    </div>
  )
}

export function ReceivingReview({ receiving }: { receiving: Receiving }) {
  const { draft, summary, submitting } = receiving
  const [showAll, setShowAll] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const rows = showAll ? draft.lines : draft.lines.filter(hasDiscrepancy)
  const approvalError = submitted && summary.needsApproval && !draft.approvedBy.trim()
  const diffPct = summary.expectedValue ? Math.round((summary.diffValue / summary.expectedValue) * 1000) / 10 : 0

  const confirm = () => {
    setSubmitted(true)
    if (summary.needsApproval && !draft.approvedBy.trim()) return
    receiving.complete()
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-4">
      <div className="grid grid-cols-4 gap-3">
        {[
          ['Giá trị cần nhận', formatCurrency(summary.expectedValue), 'text-slate-900'],
          ['Giá trị nhập kho', formatCurrency(summary.acceptedValue), 'text-primary-600'],
          [
            'Chênh lệch',
            `${summary.diffValue > 0 ? '+' : ''}${formatCurrency(summary.diffValue)} (${diffPct}%)`,
            summary.diffValue < 0 ? 'text-amber-600' : summary.diffValue > 0 ? 'text-rose-500' : 'text-slate-900',
          ],
          ['Số lượng nhập kho', `${summary.accepted} đv`, 'text-slate-900'],
        ].map(([l, v, c]) => (
          <div key={l} className="rounded-lg bg-white p-4">
            <p className="text-xs text-slate-500">{l}</p>
            <p className={cn('mt-1 text-lg font-bold', c)}>{v}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <p className="text-sm font-bold text-slate-900">{showAll ? 'Tất cả dòng hàng' : `Dòng có chênh lệch (${rows.length})`}</p>
          <button type="button" onClick={() => setShowAll((v) => !v)} className="cursor-pointer text-xs font-semibold text-primary-600">
            {showAll ? 'Chỉ xem chênh lệch' : 'Xem tất cả'}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                {['Sản phẩm', 'Cần nhận', 'Thực đếm', 'Hỏng', 'Nhập kho', 'Giá nhập', 'Xử lý'].map((c) => (
                  <th key={c} className="px-4 py-2.5 whitespace-nowrap">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((l) => {
                const state = getLineState(l)
                return (
                  <tr key={l.productId}>
                    <td className="max-w-[260px] px-4 py-2.5">
                      <p className="truncate font-semibold text-slate-800">{l.name}</p>
                      <ProductCode barcode={l.barcode} />
                      <p className={cn('text-xs font-semibold', LINE_STATE[state].text)}>{LINE_STATE[state].label}</p>
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">{l.extra ? '—' : l.expectedQty}</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-900">{l.scannedQty}</td>
                    <td className={cn('px-4 py-2.5', l.damagedQty ? 'font-semibold text-rose-500' : 'text-slate-400')}>{l.damagedQty}</td>
                    <td className="px-4 py-2.5 font-bold text-primary-700">{acceptedQty(l)}</td>
                    <td className="w-32 px-4 py-2.5">
                      <NumberInput value={l.unitCost} onChange={(v) => receiving.updateLine(l.productId, { unitCost: v })} suffix="đ" className="h-8" />
                    </td>
                    <td className="px-4 py-2.5">
                      <Handling line={l} onUpdate={receiving.updateLine} />
                    </td>
                  </tr>
                )
              })}
              {!rows.length && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm text-primary-600">
                    Toàn bộ danh mục hàng hóa đều trùng khớp với đơn đặt hàng (PO)
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-4">
        <textarea
          value={draft.note}
          onChange={(e) => receiving.setNote(e.target.value)}
          rows={3}
          placeholder="Ghi chú phiếu nhập (tình trạng hàng, thỏa thuận với NCC...)"
          className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
        />
        {summary.needsApproval ? (
          <div className={cn('rounded-lg p-3', approvalError ? 'bg-rose-50 ring-2 ring-rose-200' : 'bg-amber-50')}>
            <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-700">
              <CircleAlert className="size-4" /> Chênh lệch vượt {APPROVAL_THRESHOLD * 100}% — cần quản lý duyệt
            </p>
            <input
              value={draft.approvedBy}
              onChange={(e) => receiving.setApprovedBy(e.target.value)}
              placeholder="Tên quản lý duyệt *"
              className={cn(inputClass(approvalError ? 'x' : undefined), 'mt-2 h-9')}
            />
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-lg bg-primary-50 p-3 text-xs font-semibold text-primary-700">
            <ShieldCheck className="size-5" /> Chênh lệch trong ngưỡng cho phép, không cần duyệt
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => receiving.setStep('count')} disabled={submitting}>
          Quay lại kiểm đếm
        </Button>
        <Button size="lg" onClick={confirm} loading={submitting} disabled={!summary.accepted}>
          Xác nhận nhập kho ({summary.accepted} kiện)
        </Button>
      </div>
    </div>
  )
}
