import { useState } from 'react'
import { Boxes, CalendarClock, PackageCheck, ScanBarcode, Truck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Field, inputClass, NumberInput } from '@/components/ui/FormField'
import { Switch } from '@/components/ui/Switch'
import { formatCurrency } from '@/lib/format'
import type { PurchaseOrder, ReceivingDraft } from '@/modules/purchasing/types/purchasing.types'
import type { useReceiving } from '@/modules/purchasing/hooks/useReceiving'

type Receiving = ReturnType<typeof useReceiving>

export function ReceivingCheckIn({ order, draft, receiving }: { order: PurchaseOrder; draft: ReceivingDraft; receiving: Receiving }) {
  const [submitted, setSubmitted] = useState(false)
  const { checkIn } = draft
  const docError = submitted && !checkIn.supplierDocNo.trim() ? 'Nhập số phiếu giao hàng / hóa đơn của NCC' : undefined
  const remainingQty = draft.lines.reduce((s, l) => s + l.expectedQty, 0)
  const remainingValue = draft.lines.reduce((s, l) => s + l.expectedQty * l.unitCost, 0)

  const start = () => {
    setSubmitted(true)
    if (!checkIn.supplierDocNo.trim()) return
    receiving.setStep('count')
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 p-6">
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Truck, label: 'Nhà cung cấp', value: order.supplierName },
          { icon: CalendarClock, label: 'Ngày giao dự kiến', value: new Date(order.expectedDate).toLocaleDateString('vi-VN') },
          { icon: Boxes, label: 'Cần nhận', value: `${draft.lines.length} SP · ${remainingQty} đv` },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-lg bg-white p-4">
            <Icon className="size-5 text-primary-600" />
            <p className="mt-2 text-xs text-slate-500">{label}</p>
            <p className="truncate text-sm font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-white p-6">
        <h2 className="text-lg font-bold text-slate-900">Bước 1 · Tiếp nhận hàng</h2>
        <p className="text-sm text-slate-500">Đối chiếu chứng từ giao hàng và kiểm tra bao bì bên ngoài trước khi kiểm đếm</p>
        <div className="mt-5 grid grid-cols-2 gap-4">
          <Field label="Số phiếu giao / hóa đơn NCC" required error={docError} className="col-span-2">
            <input autoFocus value={checkIn.supplierDocNo} onChange={(e) => receiving.setCheckIn({ supplierDocNo: e.target.value })} placeholder="VD: HĐ0012345" className={inputClass(docError)} />
          </Field>
          <Field label="Số kiện / thùng nhận được">
            <NumberInput value={checkIn.packageCount} onChange={(v) => receiving.setCheckIn({ packageCount: v })} suffix="kiện" />
          </Field>
          <Field label="Người giao hàng">
            <input value={checkIn.deliveredBy} onChange={(e) => receiving.setCheckIn({ deliveredBy: e.target.value })} placeholder="Tên tài xế / nhân viên giao" className={inputClass()} />
          </Field>
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-slate-100 p-3.5">
          <PackageCheck className="size-5 text-slate-400" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-800">Bao bì nguyên vẹn</p>
            <p className="text-xs text-slate-400">Không móp, rách, ướt hay có dấu hiệu bị mở</p>
          </div>
          <Switch checked={checkIn.packagingOk} onChange={(v) => receiving.setCheckIn({ packagingOk: v })} label="Bao bì nguyên vẹn" />
        </div>
        {!checkIn.packagingOk && (
          <textarea
            value={draft.note}
            onChange={(e) => receiving.setNote(e.target.value)}
            rows={2}
            placeholder="Mô tả tình trạng bao bì (sẽ ghi vào phiếu nhập)..."
            className="mt-3 w-full resize-none rounded-lg border border-amber-200 bg-amber-50/50 px-3 py-2 text-sm outline-none focus:border-amber-400"
          />
        )}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-xs text-slate-400">Giá trị cần nhận: {formatCurrency(remainingValue)}</p>
          <Button size="lg" leftIcon={<ScanBarcode className="size-5" />} onClick={start}>
            Bắt đầu kiểm đếm
          </Button>
        </div>
      </div>
    </div>
  )
}
