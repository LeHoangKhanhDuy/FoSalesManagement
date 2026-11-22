import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import type { CustomerWithStats } from '@/modules/customers/types/customers.types'

interface Props {
  customer: CustomerWithStats | null
  deleting: boolean
  onClose: () => void
  onConfirm: () => void
  onBlock: (c: CustomerWithStats) => void
}

export function DeleteCustomerModal({ customer: c, deleting, onClose, onConfirm, onBlock }: Props) {
  if (!c) return null
  const hasOrders = c.stats.orders > 0 || c.points > 0
  return (
    <Modal
      open
      onClose={onClose}
      className="max-w-md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={deleting}>
            Đóng
          </Button>
          {hasOrders ? (
            c.status === 'active' && (
              <Button
                onClick={() => {
                  onBlock(c)
                  onClose()
                }}
              >
                Khóa khách hàng
              </Button>
            )
          ) : (
            <Button onClick={onConfirm} loading={deleting} className="bg-rose-600 shadow-none hover:bg-rose-700">
              Xóa vĩnh viễn
            </Button>
          )}
        </>
      }
    >
      <div className="text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-rose-50 ring-8 ring-rose-50/50">
          <Trash2 className="size-6 text-rose-500" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-slate-900">{hasOrders ? 'Không thể xóa khách hàng' : 'Xóa khách hàng?'}</h2>
        <p className="mt-1 text-sm font-semibold text-slate-800">{c.name}</p>
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          {hasOrders ? 'Khách hàng đã có đơn hàng hoặc điểm tích lũy nên cần giữ lại để đối soát. Bạn có thể khóa khách hàng thay vì xóa.' : 'Khách hàng chưa phát sinh giao dịch. Thao tác này không thể hoàn tác.'}
        </p>
      </div>
    </Modal>
  )
}
