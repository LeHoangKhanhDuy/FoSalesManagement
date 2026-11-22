import { TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import type { Supplier, SupplierSummary } from '@/modules/suppliers/types/suppliers.types'

interface Props {
  supplier: Supplier | null
  summary?: SupplierSummary
  hasOrders: boolean
  deleting: boolean
  onClose: () => void
  onConfirm: () => void
  onDeactivate: (s: Supplier) => void
}

export function DeleteSupplierModal({ supplier, summary, hasOrders, deleting, onClose, onConfirm, onDeactivate }: Props) {
  if (!supplier) return null
  return (
    <Modal
      open
      onClose={onClose}
      title={hasOrders ? 'Không thể xóa nhà cung cấp' : 'Xóa nhà cung cấp?'}
      description={`${supplier.code} · ${supplier.name}`}
      className="max-w-md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={deleting}>
            Đóng
          </Button>
          {hasOrders ? (
            supplier.status !== 'inactive' && (
              <Button
                onClick={() => {
                  onDeactivate(supplier)
                  onClose()
                }}
              >
                Ngừng hợp tác
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
      <p className="flex gap-2.5 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
        <TriangleAlert className="mt-0.5 size-4 shrink-0" />
        {hasOrders
          ? `Nhà cung cấp đã có ${summary?.orderCount ?? 0} đơn đặt hàng và lịch sử công nợ nên cần được giữ lại để đối soát. Bạn có thể chuyển sang "Ngừng hợp tác" để ẩn khỏi danh sách đặt hàng.`
          : 'Nhà cung cấp chưa phát sinh giao dịch. Thao tác này không thể hoàn tác.'}
      </p>
    </Modal>
  )
}
