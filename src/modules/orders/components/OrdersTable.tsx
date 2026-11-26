import { memo, type ReactNode } from 'react'
import { Ban, CircleCheck, Ellipsis, Eye, PackageSearch, Printer, RotateCcw, Undo2 } from 'lucide-react'
import { RetryButton } from '@/components/common/RetryButton'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Dropdown, DropdownItem, DropdownSeparator } from '@/components/ui/Dropdown'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'
import { cn } from '@/lib/cn'
import { formatCurrency, formatDate, formatNumber, formatTime } from '@/lib/format'
import type { OrderAction, OrderSummary } from '@/modules/orders/types/orders.types'
import { availableActions, ORDER_STATUS, PAGE_SIZE, paymentSummary } from '@/modules/orders/utils/orders.utils'

interface OrdersTableProps {
  orders: OrderSummary[]
  total: number
  page: number
  loading: boolean
  refreshing: boolean
  error?: string
  hasActiveFilters: boolean
  printingId: string | null
  onRetry: () => void
  onPageChange: (page: number) => void
  onView: (order: OrderSummary) => void
  onAction: (order: OrderSummary, action: OrderAction) => void
  onPrint: (order: OrderSummary) => void
  onResetFilters: () => void
}

const COLUMNS: { label: string; className?: string }[] = [
  { label: 'STT', className: 'w-14 text-center' },
  { label: 'Mã đơn' },
  { label: 'Khách hàng' },
  { label: 'SL', className: 'text-right' },
  { label: 'Thanh toán' },
  { label: 'Tổng tiền', className: 'text-right' },
  { label: 'Trạng thái' },
  { label: 'Thu ngân' },
  { label: '', className: 'w-16' },
]

const ACTION_ITEMS: Record<OrderAction, { icon: typeof Ban; label: string; danger?: boolean }> = {
  confirm: { icon: CircleCheck, label: 'Xác nhận đã nhận tiền' },
  cancel: { icon: Ban, label: 'Hủy đơn', danger: true },
  refund: { icon: Undo2, label: 'Hoàn tiền', danger: true },
}

const Cell = ({ children, className }: { children: ReactNode; className?: string }) => (
  <td className={cn('px-4 py-3.5 align-middle', className)}>{children}</td>
)

const shortDate = (iso: string) => {
  const d = new Date(iso)
  return `${formatTime(d)} · ${formatDate(d).replace(/^[^,]+,\s*/, '')}`
}

function RowActions({ order, printing, onView, onAction, onPrint }: Pick<OrdersTableProps, 'onView' | 'onAction' | 'onPrint'> & { order: OrderSummary; printing: boolean }) {
  const actions = availableActions(order)
  return (
    <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
      <Dropdown
        align="end"
        trigger={
          <button
            className="grid size-8 cursor-pointer place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 data-[state=open]:bg-slate-100 data-[state=open]:text-slate-700"
            aria-label="Thao tác khác"
          >
            <Ellipsis className="size-4" />
          </button>
        }
      >
        <DropdownItem icon={Eye} label="Xem chi tiết" onClick={() => onView(order)} />
        <DropdownItem icon={Printer} label={printing ? 'Đang chuẩn bị in...' : 'In hóa đơn'} onClick={() => onPrint(order)} />
        {actions.length > 0 && <DropdownSeparator />}
        {actions.map((a) => (
          <DropdownItem key={a} icon={ACTION_ITEMS[a].icon} label={ACTION_ITEMS[a].label} danger={ACTION_ITEMS[a].danger} onClick={() => onAction(order, a)} />
        ))}
      </Dropdown>
    </div>
  )
}

export const OrdersTable = memo(function OrdersTable(props: OrdersTableProps) {
  const { orders, total, page, loading, refreshing, error, hasActiveFilters, printingId, onRetry, onPageChange, onView, onResetFilters } = props
  const startIndex = (page - 1) * PAGE_SIZE

  return (
    <div>
      <div className="overflow-x-auto">
        <table className={cn('w-full min-w-[1040px] text-sm transition-opacity', refreshing && 'pointer-events-none opacity-60')}>
          <thead>
            <tr className="bg-slate-50 text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
              {COLUMNS.map((c) => (
                <th key={c.label || 'actions'} className={cn('px-4 py-3 whitespace-nowrap', c.className)}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading &&
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  {COLUMNS.map((_, j) => (
                    <Cell key={j}>
                      <div className={cn('h-4 animate-pulse rounded bg-slate-100', j === 0 ? 'mx-auto w-6' : j === 1 ? 'w-28' : 'w-20')} />
                    </Cell>
                  ))}
                </tr>
              ))}

            {!loading &&
              orders.map((o, index) => {
                const status = ORDER_STATUS[o.status]
                const inactive = o.status === 'cancelled' || o.status === 'refunded'
                return (
                  <tr key={o.id} onClick={() => onView(o)} className="group cursor-pointer transition hover:bg-slate-50/80">
                    <Cell className="text-center text-slate-400">{startIndex + index + 1}</Cell>
                    <Cell>
                      <p className="font-semibold text-slate-900 group-hover:text-primary-700">{o.code}</p>
                      <p className="mt-0.5 text-xs text-slate-400">{shortDate(o.createdAt)}</p>
                    </Cell>
                    <Cell>
                      {o.customer ? (
                        <div className="flex items-center gap-2.5">
                          <Avatar name={o.customer.name} className="size-8 text-[11px]" />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-800">{o.customer.name}</p>
                            <p className="text-xs text-slate-400">{o.customer.phone}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">Khách lẻ</span>
                      )}
                    </Cell>
                    <Cell className="text-right font-semibold text-slate-700">{formatNumber(o.totals.itemCount)}</Cell>
                    <Cell>
                      <p className="whitespace-nowrap text-slate-600">{paymentSummary(o)}</p>
                      {o.pendingAmount > 0 && o.status === 'pending' && (
                        <p className="text-xs font-medium text-amber-600">Chờ xác nhận {formatCurrency(o.pendingAmount)}</p>
                      )}
                    </Cell>
                    <Cell className="text-right whitespace-nowrap">
                      <p className={cn('font-bold', inactive ? 'text-slate-400 line-through' : 'text-slate-900')}>{formatCurrency(o.totals.total)}</p>
                      {o.refundedTotal > 0 && o.status === 'partially_refunded' && (
                        <p className="text-xs text-violet-600">Đã hoàn {formatCurrency(o.refundedTotal)}</p>
                      )}
                      {o.totals.discountAmount > 0 && o.refundedTotal === 0 && (
                        <p className="text-xs text-rose-500">
                          {o.voucherCode && <span className="text-slate-400">{o.voucherCode} | </span>}-{formatCurrency(o.totals.discountAmount)}
                        </p>
                      )}
                    </Cell>
                    <Cell>
                      <Badge tone={status.tone} dot className="whitespace-nowrap">
                        {status.label}
                      </Badge>
                    </Cell>
                    <Cell className="whitespace-nowrap text-slate-600">{o.cashier}</Cell>
                    <Cell>
                      <RowActions order={o} printing={printingId === o.id} onView={onView} onAction={props.onAction} onPrint={props.onPrint} />
                    </Cell>
                  </tr>
                )
              })}
          </tbody>
        </table>

        {!loading && orders.length === 0 && error && (
          <EmptyState icon={<PackageSearch />} title="Không tải được đơn hàng" description={error} className="py-16" action={<RetryButton onClick={onRetry} />} />
        )}

        {!loading && orders.length === 0 && !error && (
          <EmptyState
            icon={<PackageSearch />}
            title="Không có đơn hàng phù hợp"
            description="Thử thay đổi từ khóa, khoảng thời gian hoặc bộ lọc trạng thái."
            className="py-16"
            action={
              hasActiveFilters && (
                <button
                  onClick={onResetFilters}
                  className="flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  <RotateCcw className="size-4" /> Xóa bộ lọc
                </button>
              )
            }
          />
        )}
      </div>

      {!loading && total > 0 && (
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={onPageChange} unit="đơn hàng" className="border-t border-slate-100 px-4 py-3" />
      )}
    </div>
  )
})
