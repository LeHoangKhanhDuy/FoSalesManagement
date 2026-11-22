import { Ban, CircleAlert, FileText, Pencil, Printer, ScanBarcode, Send } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Drawer'
import { FormSection } from '@/components/ui/FormField'
import { useLastValue } from '@/hooks/useLastValue'
import { cn } from '@/lib/cn'
import { formatCurrency, formatDateTime } from '@/lib/format'
import type { PurchaseOrder } from '@/modules/purchasing/types/purchasing.types'
import { calcPoTotals, isOverdue, PO_STATUS, receivedValue } from '@/modules/purchasing/utils/purchasing.utils'
import { ProductThumb } from '@/modules/sales/components/ProductThumb'

interface Props {
  order: PurchaseOrder | null
  onClose: () => void
  onEdit: (o: PurchaseOrder) => void
  onPlace: (o: PurchaseOrder) => void
  onReceive: (o: PurchaseOrder) => void
  onCancel: (o: PurchaseOrder) => void
}

export function PurchaseOrderDetailDrawer({ order: openOrder, onClose, onEdit, onPlace, onReceive, onCancel }: Props) {
  const order = useLastValue(openOrder)
  if (!order) return null
  const status = PO_STATUS[order.status]
  const totals = calcPoTotals(order.items, order.discount)
  const canReceive = ['ordered', 'receiving', 'partial'].includes(order.status)

  return (
    <Drawer
      open={!!openOrder}
      onClose={onClose}
      title={order.code}
      description={order.supplierName}
      className="max-w-[640px]"
      headerExtra={
        <Badge tone={status.tone} dot className="mt-1 whitespace-nowrap">
          {status.label}
        </Badge>
      }
      footer={
        <>
          <Button variant="outline" leftIcon={<Printer className="size-4" />} onClick={() => window.print()}>
            In
          </Button>
          {['draft', 'ordered'].includes(order.status) && (
            <Button variant="danger" leftIcon={<Ban className="size-4" />} onClick={() => onCancel(order)}>
              Hủy đơn
            </Button>
          )}
          <div className="ml-auto flex gap-2">
            {order.status === 'draft' && (
              <>
                <Button variant="outline" leftIcon={<Pencil className="size-4" />} onClick={() => onEdit(order)}>
                  Sửa
                </Button>
                <Button leftIcon={<Send className="size-4" />} onClick={() => onPlace(order)}>
                  Gửi nhà cung cấp
                </Button>
              </>
            )}
            {canReceive && (
              <Button leftIcon={<ScanBarcode className="size-4" />} onClick={() => onReceive(order)}>
                {order.status === 'receiving' ? 'Tiếp tục kiểm đếm' : 'Nhận hàng'}
              </Button>
            )}
          </div>
        </>
      }
    >
      {order.status === 'cancelled' && order.cancelReason && (
        <p className="mb-5 flex gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
          <CircleAlert className="mt-0.5 size-4 shrink-0" /> Lý do hủy: {order.cancelReason}
        </p>
      )}
      {isOverdue(order) && (
        <p className="mb-5 flex gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
          <CircleAlert className="mt-0.5 size-4 shrink-0" /> Đã quá ngày giao dự kiến ({new Date(order.expectedDate).toLocaleDateString('vi-VN')}). Liên hệ nhà cung cấp để xác nhận.
        </p>
      )}

      <div className="grid grid-cols-3 gap-2">
        {[
          ['Giá trị đặt', formatCurrency(totals.total)],
          ['Đã nhập kho', formatCurrency(receivedValue(order))],
          ['Tiến độ', `${totals.receivedQty}/${totals.orderedQty}`],
        ].map(([l, v]) => (
          <div key={l} className="rounded-lg bg-slate-50 p-3">
            <p className="text-[11px] text-slate-500">{l}</p>
            <p className="text-base font-bold text-slate-900">{v}</p>
          </div>
        ))}
      </div>

      <FormSection title="Sản phẩm">
        <ul className="divide-y divide-slate-100 rounded-lg border border-slate-100">
          {order.items.map((i) => {
            const remaining = Math.max(0, i.orderedQty - i.receivedQty)
            return (
              <li key={i.productId} className="flex items-center gap-3 p-3">
                <ProductThumb categoryId={i.categoryId} image={i.image} fit={i.imageFit} alt={i.name} size="sm" className="size-10" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{i.name}</p>
                  <p className="text-xs text-slate-400">
                    {i.sku} · {formatCurrency(i.unitCost)}/{i.unit.toLowerCase()}
                  </p>
                </div>
                <div className="text-right text-xs">
                  <p>
                    <span className="font-bold text-slate-900">{i.receivedQty}</span>
                    <span className="text-slate-400">/{i.orderedQty} đã nhận</span>
                  </p>
                  {remaining > 0 && order.status !== 'cancelled' && <p className="font-semibold text-amber-600">Còn thiếu {remaining}</p>}
                  {i.damagedQty > 0 && <p className="font-semibold text-rose-500">Hỏng {i.damagedQty}</p>}
                </div>
              </li>
            )
          })}
        </ul>
      </FormSection>

      {order.receipts.length > 0 && (
        <FormSection title={`Phiếu nhập kho (${order.receipts.length})`}>
          <ul className="space-y-2">
            {order.receipts.map((r) => (
              <li key={r.id} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 text-sm">
                <span className="grid size-9 place-items-center rounded-lg bg-primary-50 text-primary-600">
                  <FileText className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800">{r.code}</p>
                  <p className="text-xs text-slate-400">
                    {formatDateTime(new Date(r.receivedAt))} · {r.receivedBy}
                    {r.supplierDocNo && ` · CT NCC ${r.supplierDocNo}`}
                  </p>
                </div>
                <p className="font-bold text-slate-900">{formatCurrency(r.value)}</p>
              </li>
            ))}
          </ul>
        </FormSection>
      )}

      {order.note && (
        <FormSection title="Ghi chú">
          <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{order.note}</p>
        </FormSection>
      )}

      <FormSection title="Lịch sử">
        <ol className="space-y-3">
          {[...order.history].reverse().map((h, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', i === 0 ? 'bg-primary-500 ring-4 ring-primary-100' : 'bg-slate-300')} />
              <div>
                <p className="font-medium text-slate-800">{h.label}</p>
                <p className="text-xs text-slate-400">
                  {formatDateTime(new Date(h.at))} · {h.by}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </FormSection>
    </Drawer>
  )
}
