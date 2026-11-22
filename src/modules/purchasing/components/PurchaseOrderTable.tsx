import type { ReactNode } from 'react'
import { Ban, ClipboardList, Ellipsis, Eye, PackageCheck, Pencil, ScanBarcode, Send } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Dropdown, DropdownItem, DropdownSeparator } from '@/components/ui/Dropdown'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/cn'
import { formatCurrency } from '@/lib/format'
import type { PurchaseOrder } from '@/modules/purchasing/types/purchasing.types'
import { calcPoTotals, isOverdue, PO_STATUS } from '@/modules/purchasing/utils/purchasing.utils'

interface PurchaseOrderTableProps {
  orders: PurchaseOrder[]
  loading: boolean
  onView: (o: PurchaseOrder) => void
  onEdit: (o: PurchaseOrder) => void
  onPlace: (o: PurchaseOrder) => void
  onReceive: (o: PurchaseOrder) => void
  onCancel: (o: PurchaseOrder) => void
}

const COLUMNS = ['Mã đơn', 'Nhà cung cấp', 'Mặt hàng', 'Tiến độ nhận', 'Giá trị', 'Ngày giao', 'Trạng thái', '']

const Td = ({ children, className }: { children: ReactNode; className?: string }) => <td className={cn('px-4 py-3 align-middle', className)}>{children}</td>

const shortDate = (iso: string) => new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })

function PrimaryAction({ order, onPlace, onReceive }: Pick<PurchaseOrderTableProps, 'onPlace' | 'onReceive'> & { order: PurchaseOrder }) {
  const base = 'flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold whitespace-nowrap transition'
  if (order.status === 'draft')
    return (
      <button onClick={() => onPlace(order)} className={cn(base, 'border border-slate-200 text-slate-600 hover:border-primary-300 hover:text-primary-700')}>
        <Send className="size-3.5" /> Gửi NCC
      </button>
    )
  if (['ordered', 'receiving', 'partial'].includes(order.status))
    return (
      <button onClick={() => onReceive(order)} className={cn(base, 'bg-primary-600 text-white shadow-primary hover:bg-primary-700')}>
        <ScanBarcode className="size-3.5" /> {order.status === 'receiving' ? 'Tiếp tục' : 'Nhận hàng'}
      </button>
    )
  return null
}

export function PurchaseOrderTable({ orders, loading, onView, onEdit, onPlace, onReceive, onCancel }: PurchaseOrderTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1080px] text-sm">
        <thead>
          <tr className="bg-slate-50 text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            {COLUMNS.map((c, i) => (
              <th key={i} className={cn('px-4 py-3 whitespace-nowrap', c === 'Giá trị' && 'text-right')}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  {COLUMNS.map((_, j) => (
                    <Td key={j}>
                      <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
                    </Td>
                  ))}
                </tr>
              ))
            : orders.map((o) => {
                const totals = calcPoTotals(o.items, o.discount)
                const progress = totals.orderedQty ? Math.min(100, (totals.receivedQty / totals.orderedQty) * 100) : 0
                const status = PO_STATUS[o.status]
                const overdue = isOverdue(o)
                return (
                  <tr key={o.id} onClick={() => onView(o)} className="group cursor-pointer transition hover:bg-slate-50/80">
                    <Td>
                      <p className="font-semibold text-slate-900 group-hover:text-primary-700">{o.code}</p>
                      <p className="text-xs text-slate-400">Tạo {shortDate(o.createdAt)}</p>
                    </Td>
                    <Td className="max-w-[240px]">
                      <p className="truncate font-medium text-slate-800">{o.supplierName}</p>
                    </Td>
                    <Td className="whitespace-nowrap text-slate-600">
                      {totals.lines} SP · {totals.orderedQty} đv
                    </Td>
                    <Td>
                      <div className="w-36">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-slate-700">
                            {totals.receivedQty}/{totals.orderedQty}
                          </span>
                          <span className="text-slate-400">{Math.round(progress)}%</span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div className={cn('h-full rounded-full', progress >= 100 ? 'bg-primary-500' : 'bg-amber-400')} style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    </Td>
                    <Td className="text-right font-bold whitespace-nowrap text-slate-900">{formatCurrency(totals.total)}</Td>
                    <Td className={cn('whitespace-nowrap', overdue ? 'font-semibold text-rose-500' : 'text-slate-600')}>
                      {shortDate(o.expectedDate)}
                      {overdue && <span className="block text-[11px] font-medium">Trễ hẹn</span>}
                    </Td>
                    <Td>
                      <Badge tone={status.tone} dot className="whitespace-nowrap">
                        {status.label}
                      </Badge>
                    </Td>
                    <Td>
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <PrimaryAction order={o} onPlace={onPlace} onReceive={onReceive} />
                        <Dropdown
                          align="end"
                          trigger={
                            <button className="grid size-8 cursor-pointer place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Thao tác khác">
                              <Ellipsis className="size-4" />
                            </button>
                          }
                        >
                          <DropdownItem icon={Eye} label="Xem chi tiết" onClick={() => onView(o)} />
                          {o.status === 'draft' && <DropdownItem icon={Pencil} label="Chỉnh sửa" onClick={() => onEdit(o)} />}
                          {['ordered', 'partial', 'receiving'].includes(o.status) && <DropdownItem icon={PackageCheck} label="Nhận hàng" onClick={() => onReceive(o)} />}
                          {['draft', 'ordered'].includes(o.status) && (
                            <>
                              <DropdownSeparator />
                              <DropdownItem icon={Ban} label="Hủy đơn" danger onClick={() => onCancel(o)} />
                            </>
                          )}
                        </Dropdown>
                      </div>
                    </Td>
                  </tr>
                )
              })}
        </tbody>
      </table>
      {!loading && orders.length === 0 && (
        <EmptyState icon={<ClipboardList />} title="Không có đơn nhập hàng" description="Tạo đơn đặt hàng gửi nhà cung cấp để bắt đầu nhập kho." className="py-14" />
      )}
    </div>
  )
}
