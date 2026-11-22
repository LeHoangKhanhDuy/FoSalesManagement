import { useState } from 'react'
import { Ban, Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/cn'
import { formatCurrency } from '@/lib/format'
import type { OrderAction, OrderRecord } from '@/modules/orders/types/orders.types'
import { ACTION_CONFIG } from '@/modules/orders/utils/orders.utils'

interface OrderActionModalProps {
  target: { order: OrderRecord; action: OrderAction } | null
  submitting: boolean
  onClose: () => void
  onSubmit: (reason: string) => void
}

export function OrderActionModal({ target, ...props }: OrderActionModalProps) {
  if (!target) return null
  return <OrderActionContent key={target.order.id + target.action} target={target} {...props} />
}

function OrderActionContent({
  target: { order, action },
  submitting,
  onClose,
  onSubmit,
}: OrderActionModalProps & { target: NonNullable<OrderActionModalProps['target']> }) {
  const config = ACTION_CONFIG[action]
  const [reason, setReason] = useState('')
  const Icon = action === 'cancel' ? Ban : Undo2

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
            onClick={() => onSubmit(reason.trim())}
            disabled={!reason.trim()}
            loading={submitting}
            className="bg-rose-600 shadow-none hover:bg-rose-700 active:bg-rose-800 disabled:bg-rose-300"
          >
            {config.confirm}
          </Button>
        </>
      }
    >
      <div className="flex items-center gap-3 rounded-lg bg-rose-50 p-3.5">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white text-rose-500">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 text-sm">
          <p className="font-semibold text-slate-900">
            {action === 'cancel' ? 'Đơn hàng sẽ bị hủy' : `Hoàn ${formatCurrency(order.totals.total)} cho khách`}
          </p>
          <p className="text-xs text-slate-500">
            {order.customer?.name ?? 'Khách lẻ'} · {order.totals.itemCount} sản phẩm · Không thể hoàn tác
          </p>
        </div>
      </div>

      <p className="mt-5 mb-2 text-sm font-semibold text-slate-800">
        Lý do <span className="text-rose-500">*</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {config.reasons.map((r) => (
          <button
            key={r}
            onClick={() => setReason(r)}
            className={cn(
              'h-8 cursor-pointer rounded-full border px-3 text-xs font-semibold transition',
              reason === r
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-slate-200 text-slate-600 hover:border-slate-300',
            )}
          >
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
        className="mt-3 w-full resize-none rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
      />
    </Modal>
  )
}
