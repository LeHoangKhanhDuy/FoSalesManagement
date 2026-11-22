import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import type { Product } from '@/modules/sales/types/sales.types'

interface DeleteProductsModalProps {
  products: Product[] | null
  deleting: boolean
  onClose: () => void
  onConfirm: () => void
}

export function DeleteProductsModal({ products, deleting, onClose, onConfirm }: DeleteProductsModalProps) {
  if (!products) return null
  const single = products.length === 1

  return (
    <Modal
      open
      onClose={onClose}
      hideClose
      className="max-w-sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={deleting}>
            Hủy
          </Button>
          <Button
            onClick={onConfirm}
            loading={deleting}
            className="bg-rose-600 shadow-none hover:bg-rose-700 active:bg-rose-800"
          >
            Xóa {single ? 'sản phẩm' : `${products.length} sản phẩm`}
          </Button>
        </>
      }
    >
      <div className="text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-rose-50 ring-8 ring-rose-50/50">
          <Trash2 className="size-6 text-rose-500" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-slate-900">Xóa {single ? 'sản phẩm' : `${products.length} sản phẩm`}?</h2>
        <p className="mt-1 text-sm text-slate-500">
          {single ? (
            <>
              <span className="font-semibold text-slate-800">{products[0].name}</span> sẽ bị xóa vĩnh viễn.
            </>
          ) : (
            'Các sản phẩm đã chọn sẽ bị xóa vĩnh viễn.'
          )}{' '}
          Đơn hàng cũ vẫn giữ nguyên thông tin.
        </p>
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Mẹo: dùng “Ngừng bán” nếu chỉ muốn tạm ẩn sản phẩm khỏi màn hình bán hàng.
        </p>
      </div>
    </Modal>
  )
}
