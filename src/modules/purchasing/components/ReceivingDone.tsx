import { CircleCheck, Printer } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDateTime } from '@/lib/format'
import type { GoodsReceipt, PurchaseOrder } from '@/modules/purchasing/types/purchasing.types'
import { PO_STATUS } from '@/modules/purchasing/utils/purchasing.utils'
import { ProductCode } from '@/components/common/ProductCode'

export function ReceivingDone({ receipt, order, onClose }: { receipt: GoodsReceipt; order: PurchaseOrder; onClose: () => void }) {
  const accepted = receipt.lines.reduce((s, l) => s + l.acceptedQty, 0)
  const damaged = receipt.lines.reduce((s, l) => s + l.damagedQty, 0)
  const remaining = order.items.reduce((s, i) => s + Math.max(0, i.orderedQty - i.receivedQty), 0)

  return (
    <div className="mx-auto w-full max-w-2xl p-6">
      <div className="rounded-lg bg-white p-8 text-center">
        <div className="mx-auto grid size-16 animate-scale-in place-items-center rounded-full bg-primary-50 ring-8 ring-primary-50/60">
          <CircleCheck className="size-9 text-primary-600" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-slate-900">Nhập kho thành công</h2>
        <p className="mt-1 text-sm text-slate-500">
          Phiếu <span className="font-semibold text-slate-800">{receipt.code}</span> · {formatDateTime(new Date(receipt.receivedAt))} · Đơn {order.code} chuyển sang{' '}
          <span className="font-semibold text-slate-800">{PO_STATUS[order.status].label}</span>
        </p>
        <div className="mt-6 grid grid-cols-4 gap-2 text-left">
          {[
            ['Nhập kho', `${accepted} đv`],
            ['Giá trị', formatCurrency(receipt.value)],
            ['Hư hỏng', `${damaged} đv`],
            ['Chờ giao bù', `${remaining} đv`],
          ].map(([l, v]) => (
            <div key={l} className="rounded-lg bg-slate-50 p-3">
              <p className="text-[11px] text-slate-500">{l}</p>
              <p className="font-bold text-slate-900">{v}</p>
            </div>
          ))}
        </div>
        <ul className="mt-5 max-h-60 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-100 text-left text-sm">
          {receipt.lines.map((l) => (
            <li key={l.productId} className="flex items-center justify-between gap-3 px-3 py-2">
              <span className="min-w-0 text-slate-700">
                <span className="block truncate">{l.name}</span>
                <ProductCode barcode={l.barcode} className="text-[11px]" />
              </span>
              <span className="shrink-0 text-xs text-slate-500">
                <span className="font-bold text-primary-700">+{l.acceptedQty}</span>
                {l.damagedQty > 0 && <span className="ml-2 font-semibold text-rose-500">hỏng {l.damagedQty}</span>}
                <span className="ml-2">{formatCurrency(l.acceptedQty * l.unitCost)}</span>
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex justify-center gap-2">
          <Button variant="outline" leftIcon={<Printer className="size-4" />} onClick={() => window.print()}>
            In phiếu nhập
          </Button>
          <Button onClick={onClose} autoFocus>
            Hoàn tất
          </Button>
        </div>
      </div>
    </div>
  )
}
