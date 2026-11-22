import { CircleStop, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import type { PromotionConfirm } from '@/modules/promotions/hooks/usePromotionsPage'

interface Props {
  confirm: PromotionConfirm
  loading: boolean
  onClose: () => void
  onConfirm: () => void
}

export function PromotionConfirmModal({ confirm, loading, onClose, onConfirm }: Props) {
  if (!confirm) return null
  const { type, promotion: p } = confirm
  const used = p.usage.count > 0
  const blocked = type === 'delete' && used
  const Icon = type === 'delete' ? Trash2 : CircleStop
  return (
    <Modal
      open
      onClose={onClose}
      className="max-w-md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {blocked ? 'Đóng' : 'Quay lại'}
          </Button>
          {!blocked && (
            <Button onClick={onConfirm} loading={loading} className="bg-rose-600 shadow-none hover:bg-rose-700">
              {type === 'delete' ? 'Xóa chương trình' : 'Kết thúc ngay'}
            </Button>
          )}
        </>
      }
    >
      <div className="text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-rose-50 ring-8 ring-rose-50/50">
          <Icon className="size-6 text-rose-500" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-slate-900">{blocked ? 'Không thể xóa' : type === 'delete' ? 'Xóa khuyến mãi?' : 'Kết thúc sớm?'}</h2>
        <p className="mt-1 text-sm text-slate-500">
          <span className="font-semibold text-slate-800">{p.name}</span> ({p.code})
        </p>
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          {blocked
            ? `Chương trình đã áp dụng cho ${p.usage.count} đơn hàng nên cần giữ lại để đối soát. Hãy dùng "Kết thúc sớm".`
            : type === 'delete'
              ? 'Chương trình chưa được dùng cho đơn nào. Thao tác này không thể hoàn tác.'
              : 'POS sẽ ngừng áp dụng ngay lập tức. Bạn vẫn có thể nhân bản để chạy lại sau.'}
        </p>
      </div>
    </Modal>
  )
}
