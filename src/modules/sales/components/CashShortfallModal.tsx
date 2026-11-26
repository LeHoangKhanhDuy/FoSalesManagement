import { ArrowLeftRight, CircleAlert, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { formatCurrency } from '@/lib/format'

interface CashShortfallModalProps {
  due: number
  tendered: number
  onBack: () => void
  onPayRest: () => void
}

export function CashShortfallModal({ due, tendered, onBack, onPayRest }: CashShortfallModalProps) {
  return (
    <Modal open onClose={onBack} hideClose className="max-w-sm">
      <div className="text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-amber-50 ring-8 ring-amber-50/60">
          <CircleAlert className="size-8 text-amber-500" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-slate-900">Khách đưa chưa đủ tiền</h2>
        <p className="mt-1 text-sm text-slate-500">Thanh toán phần còn lại bằng chuyển khoản, thẻ hoặc ví điện tử?</p>
      </div>

      <dl className="mt-5 space-y-2 rounded-lg bg-slate-50 p-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-500">Khách cần trả</dt>
          <dd className="font-semibold text-slate-800">{formatCurrency(due)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">Tiền mặt khách đưa</dt>
          <dd className="font-semibold text-slate-800">{formatCurrency(tendered)}</dd>
        </div>
        <div className="flex items-end justify-between border-t border-slate-200 pt-2">
          <dt className="font-semibold text-slate-800">Còn thiếu</dt>
          <dd className="text-xl font-extrabold text-rose-600">{formatCurrency(due - tendered)}</dd>
        </div>
      </dl>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <Button variant="outline" leftIcon={<RotateCcw className="size-4" />} onClick={onBack}>
          Nhập lại
        </Button>
        <Button leftIcon={<ArrowLeftRight className="size-4" />} onClick={onPayRest} autoFocus>
          Thanh toán khác
        </Button>
      </div>
    </Modal>
  )
}
