import { useState } from 'react'
import { PauseCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { DatePicker } from '@/components/ui/DatePicker'
import { Field, inputClass } from '@/components/ui/FormField'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/cn'
import type { Supplier, SupplierSummary, SuspendPayload } from '@/modules/suppliers/types/suppliers.types'
import { SUSPEND_REASONS } from '@/modules/suppliers/utils/suppliers.utils'

interface Props {
  supplier: Supplier | null
  summary?: SupplierSummary
  saving: boolean
  onClose: () => void
  onConfirm: (payload: SuspendPayload) => void
}

export function SuspendSupplierModal({ supplier, ...rest }: Props) {
  if (!supplier) return null
  return <SuspendContent key={supplier.id} supplier={supplier} {...rest} />
}

function SuspendContent({ supplier, summary, saving, onClose, onConfirm }: Omit<Props, 'supplier'> & { supplier: Supplier }) {
  const [reason, setReason] = useState('')
  const [until, setUntil] = useState<Date | undefined>()

  return (
    <Modal
      open
      onClose={onClose}
      title="Tạm ngưng hợp tác"
      description={`${supplier.code} · ${supplier.name}`}
      className="max-w-md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Quay lại
          </Button>
          <Button
            leftIcon={<PauseCircle className="size-4" />}
            disabled={!reason.trim()}
            loading={saving}
            onClick={() => onConfirm({ reason: reason.trim(), until: until?.toISOString() })}
            className="bg-amber-500 shadow-none hover:bg-amber-600 disabled:bg-amber-300"
          >
            Tạm ngưng
          </Button>
        </>
      }
    >
      <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
        Nhà cung cấp sẽ không xuất hiện khi tạo đơn đặt hàng mới.
        {summary?.openOrders ? ` ${summary.openOrders} đơn đang chờ giao vẫn có thể nhận hàng bình thường.` : ''} Công nợ và lịch sử được giữ nguyên.
      </p>

      <p className="mt-4 mb-2 text-xs font-semibold text-slate-700">
        Lý do <span className="text-rose-500">*</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {SUSPEND_REASONS.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setReason(r)}
            className={cn('h-8 cursor-pointer rounded-full border px-3 text-xs font-semibold', reason === r ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-200 text-slate-600 hover:border-slate-300')}
          >
            {r}
          </button>
        ))}
      </div>
      <input value={SUSPEND_REASONS.includes(reason) ? '' : reason} onChange={(e) => setReason(e.target.value)} placeholder="Hoặc nhập lý do khác..." className={cn(inputClass(), 'mt-3')} />

      <Field label="Dự kiến mở lại" hint={<span className="font-normal text-slate-400">Không bắt buộc</span>} className="mt-4">
        <DatePicker value={until} onChange={setUntil} disablePast placeholder="Chọn ngày" />
      </Field>
    </Modal>
  )
}
