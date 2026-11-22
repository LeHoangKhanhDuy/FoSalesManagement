import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Field, inputClass, NumberInput } from '@/components/ui/FormField'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/cn'
import { formatCurrency, formatNumber } from '@/lib/format'
import type { AdjustPointsPayload, CustomerWithStats } from '@/modules/customers/types/customers.types'
import { ADJUST_REASONS } from '@/modules/customers/utils/customers.utils'

interface Props {
  customer: CustomerWithStats | null
  pointValue: number
  saving: boolean
  onClose: () => void
  onConfirm: (payload: AdjustPointsPayload) => void
}

export function AdjustPointsModal({ customer, ...rest }: Props) {
  if (!customer) return null
  return <AdjustContent key={customer.id} customer={customer} {...rest} />
}

function AdjustContent({ customer, pointValue, saving, onClose, onConfirm }: Omit<Props, 'customer'> & { customer: CustomerWithStats }) {
  const [mode, setMode] = useState<'add' | 'sub'>('add')
  const [amount, setAmount] = useState(0)
  const [reason, setReason] = useState('')
  const delta = mode === 'add' ? amount : -amount
  const after = customer.points + delta
  const error = mode === 'sub' && after < 0 ? `Khách chỉ còn ${formatNumber(customer.points)} điểm` : undefined
  const valid = amount > 0 && !!reason.trim() && !error

  return (
    <Modal
      open
      onClose={onClose}
      title="Điều chỉnh điểm thành viên"
      description={`${customer.name} · Hiện có ${formatNumber(customer.points)} điểm`}
      className="max-w-md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Hủy
          </Button>
          <Button disabled={!valid} loading={saving} onClick={() => onConfirm({ points: delta, reason: reason.trim() })}>
            Xác nhận
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-2">
        {([
          ['add', 'Cộng điểm', Plus],
          ['sub', 'Trừ điểm', Minus],
        ] as const).map(([m, l, Icon]) => (
          <button key={m} type="button" onClick={() => setMode(m)} className={cn('flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border text-sm font-semibold transition', mode === m ? (m === 'add' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-rose-400 bg-rose-50 text-rose-600') : 'border-slate-200 text-slate-600')}>
            <Icon className="size-4" /> {l}
          </button>
        ))}
      </div>
      <Field label="Số điểm" required error={error} className="mt-4">
        <NumberInput value={amount} onChange={setAmount} suffix="điểm" error={error} className="h-12 text-lg" />
      </Field>
      <p className="mt-2 mb-1.5 text-xs font-semibold text-slate-700">
        Lý do <span className="text-rose-500">*</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {ADJUST_REASONS.map((r) => (
          <button key={r} type="button" onClick={() => setReason(r)} className={cn('h-8 cursor-pointer rounded-full border px-3 text-xs font-semibold', reason === r ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-600 hover:border-slate-300')}>
            {r}
          </button>
        ))}
      </div>
      <input value={ADJUST_REASONS.includes(reason) ? '' : reason} onChange={(e) => setReason(e.target.value)} placeholder="Hoặc nhập lý do khác..." className={cn(inputClass(), 'mt-3')} />
      <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 p-3 text-sm">
        <span className="text-slate-500">Sau điều chỉnh</span>
        <span className={cn('font-bold', error ? 'text-rose-500' : 'text-slate-900')}>
          {formatNumber(Math.max(0, after))} điểm <span className="font-normal text-slate-400">≈ {formatCurrency(Math.max(0, after) * pointValue)}</span>
        </span>
      </div>
    </Modal>
  )
}
