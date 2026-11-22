import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { inputClass } from '@/components/ui/FormField'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/cn'
import type { PurchaseOrder } from '@/modules/purchasing/types/purchasing.types'

const REASONS = ['Nhà cung cấp hết hàng', 'Đặt nhầm sản phẩm', 'Đổi nhà cung cấp', 'Không còn nhu cầu']

interface Props {
  order: PurchaseOrder | null
  onClose: () => void
  onConfirm: (reason: string) => void
}

export function CancelPurchaseOrderModal({ order, onClose, onConfirm }: Props) {
  const [reason, setReason] = useState('')
  if (!order) return null
  return (
    <Modal
      open
      onClose={onClose}
      title="Hủy đơn đặt hàng"
      description={`${order.code} · ${order.supplierName}`}
      className="max-w-md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Quay lại
          </Button>
          <Button disabled={!reason.trim()} onClick={() => onConfirm(reason.trim())} className="bg-rose-600 shadow-none hover:bg-rose-700 disabled:bg-rose-300">
            Xác nhận hủy
          </Button>
        </>
      }
    >
      <p className="mb-2 text-sm font-semibold text-slate-800">
        Lý do <span className="text-rose-500">*</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {REASONS.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setReason(r)}
            className={cn('h-8 cursor-pointer rounded-full border px-3 text-xs font-semibold', reason === r ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-600')}
          >
            {r}
          </button>
        ))}
      </div>
      <input value={REASONS.includes(reason) ? '' : reason} onChange={(e) => setReason(e.target.value)} placeholder="Hoặc nhập lý do khác..." className={cn(inputClass(), 'mt-3')} />
    </Modal>
  )
}
