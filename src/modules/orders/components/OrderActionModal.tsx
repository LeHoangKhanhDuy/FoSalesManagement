import { useState } from 'react'
import { Ban, CircleCheck, Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/cn'
import { formatCurrency } from '@/lib/format'
import type { OrderActionTarget } from '@/modules/orders/hooks/useOrderActions'
import type { OrderActionInput, RefundMethod } from '@/modules/orders/types/orders.types'
import { ACTION_CONFIG, PAYMENT_METHOD_LABEL, REFUND_METHODS, refundableAmount } from '@/modules/orders/utils/orders.utils'

interface OrderActionModalProps {
  target: OrderActionTarget | null
  submitting: boolean
  onClose: () => void
  onSubmit: (input: OrderActionInput) => void
}

const ICONS = { cancel: Ban, refund: Undo2, confirm: CircleCheck }

const chip = (active: boolean) =>
  cn(
    'h-8 cursor-pointer rounded-full border px-3 text-xs font-semibold transition',
    active ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-600 hover:border-slate-300',
  )

const fieldClass =
  'w-full rounded-lg border border-slate-200 px-3.5 text-sm outline-none placeholder:text-slate-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-100'

export function OrderActionModal({ target, ...props }: OrderActionModalProps) {
  if (!target) return null
  return <OrderActionContent key={target.order.id + target.action} target={target} {...props} />
}

function OrderActionContent({ target: { order, action }, submitting, onClose, onSubmit }: OrderActionModalProps & { target: OrderActionTarget }) {
  const config = ACTION_CONFIG[action]
  const [reason, setReason] = useState('')
  const [reference, setReference] = useState('')
  const [refundMethod, setRefundMethod] = useState<RefundMethod>(order.paymentMethod === 'points' ? 'cash' : order.paymentMethod)
  const Icon = ICONS[action]
  const needsReason = action !== 'confirm'
  const canSubmit = !needsReason || reason.trim().length > 0

  const headline = {
    cancel: 'Đơn hàng sẽ bị hủy',
    refund: `Hoàn ${formatCurrency(refundableAmount(order))} cho khách`,
    confirm: `Đã nhận ${formatCurrency(order.pendingAmount || order.totals.due)}`,
  }[action]
  const hint = {
    cancel: 'Hoàn kho, trả lượt voucher và điểm đã dùng · Không thể hoàn tác',
    refund: 'Trả toàn bộ hàng còn lại, nhập lại kho, thu hồi điểm · Không thể hoàn tác',
    confirm: 'Đơn chuyển sang hoàn thành và cộng điểm cho khách',
  }[action]

  const submit = () => canSubmit && onSubmit({ reason, reference, refundMethod })

  return (
    <Modal
      open
      onClose={onClose}
      title={config.title}
      description={`Đơn ${order.code}`}
      className="max-w-md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Quay lại
          </Button>
          <Button
            onClick={submit}
            disabled={!canSubmit}
            loading={submitting}
            className={config.danger ? 'bg-rose-600 shadow-none hover:bg-rose-700 active:bg-rose-800 disabled:bg-rose-300' : undefined}
          >
            {config.confirm}
          </Button>
        </>
      }
    >
      <div className={cn('flex items-center gap-3 rounded-lg p-3.5', config.danger ? 'bg-rose-50' : 'bg-primary-50')}>
        <span className={cn('grid size-10 shrink-0 place-items-center rounded-lg bg-white', config.danger ? 'text-rose-500' : 'text-primary-600')}>
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 text-sm">
          <p className="font-semibold text-slate-900">{headline}</p>
          <p className="text-xs text-slate-500">
            {order.customer?.name ?? 'Khách lẻ'} · {hint}
          </p>
        </div>
      </div>

      {action === 'refund' && (
        <>
          <p className="mt-5 mb-2 text-sm font-semibold text-slate-800">Hoàn tiền qua</p>
          <div className="flex flex-wrap gap-2">
            {REFUND_METHODS.map((m) => (
              <button key={m} type="button" onClick={() => setRefundMethod(m)} className={chip(refundMethod === m)}>
                {PAYMENT_METHOD_LABEL[m]}
              </button>
            ))}
          </div>
        </>
      )}

      {(action === 'confirm' || (action === 'refund' && refundMethod !== 'cash')) && (
        <label className="mt-5 block">
          <span className="mb-2 block text-sm font-semibold text-slate-800">
            Mã giao dịch <span className="font-normal text-slate-400">(không bắt buộc)</span>
          </span>
          <input
            autoFocus={action === 'confirm'}
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && action === 'confirm' && submit()}
            maxLength={60}
            placeholder="VD: FT26330123456"
            className={cn(fieldClass, 'h-11')}
          />
        </label>
      )}

      {needsReason && (
        <>
          <p className="mt-5 mb-2 text-sm font-semibold text-slate-800">
            Lý do <span className="text-rose-500">*</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {config.reasons.map((r) => (
              <button key={r} type="button" onClick={() => setReason(r)} className={chip(reason === r)}>
                {r}
              </button>
            ))}
          </div>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            maxLength={200}
            placeholder="Hoặc nhập lý do khác..."
            className={cn(fieldClass, 'mt-3 resize-none py-2.5')}
          />
        </>
      )}
    </Modal>
  )
}
