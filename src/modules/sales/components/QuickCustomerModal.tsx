import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Field, inputClass } from '@/components/ui/FormField'
import { Modal } from '@/components/ui/Modal'
import type { useQuickCustomer } from '@/modules/sales/hooks/useQuickCustomer'

export function QuickCustomerModal({ quick }: { quick: ReturnType<typeof useQuickCustomer> }) {
  if (!quick.open) return null
  return (
    <Modal
      open
      onClose={quick.close}
      title="Thêm khách hàng mới"
      description="Khách được tích điểm ngay từ hóa đơn này"
      className="max-w-sm"
      footer={
        <>
          <Button variant="outline" onClick={quick.close} disabled={quick.saving}>
            Hủy
          </Button>
          <Button leftIcon={<UserPlus className="size-4" />} onClick={quick.submit} loading={quick.saving}>
            Thêm & chọn
          </Button>
        </>
      }
    >
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault()
          quick.submit()
        }}
      >
        <Field label="Họ và tên" required>
          <input autoFocus={!quick.name} value={quick.name} onChange={(e) => quick.setName(e.target.value)} placeholder="VD: Nguyễn Văn An" className={inputClass()} />
        </Field>
        <Field label="Số điện thoại" required>
          <input autoFocus={!!quick.name} inputMode="tel" value={quick.phone} onChange={(e) => quick.setPhone(e.target.value.replace(/[^\d\s]/g, ''))} placeholder="09xx xxx xxx" className={inputClass()} />
        </Field>
        {quick.error && <p className="text-xs font-medium text-rose-500">{quick.error}</p>}
        <button type="submit" className="hidden" />
      </form>
    </Modal>
  )
}
