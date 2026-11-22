import { ArrowDownLeft, ArrowUpRight, ClipboardList, Package, Wallet } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/cn'
import { formatCurrency, formatDateTime } from '@/lib/format'
import type { PurchaseOrder } from '@/modules/purchasing/types/purchasing.types'
import { calcPoTotals, PO_STATUS } from '@/modules/purchasing/utils/purchasing.utils'
import { ProductThumb } from '@/modules/sales/components/ProductThumb'
import type { LedgerEntry, TopProduct } from '@/modules/suppliers/types/suppliers.types'

export function SupplierLedger({ entries }: { entries: LedgerEntry[] }) {
  if (!entries.length) return <EmptyState icon={<Wallet />} title="Chưa phát sinh công nợ" description="Công nợ tăng khi nhập kho và giảm khi thanh toán." className="py-10" />
  return (
    <ul className="divide-y divide-slate-100 rounded-lg border border-slate-100">
      {entries.map((e) => {
        const isPay = e.kind === 'payment'
        return (
          <li key={e.id} className="flex items-center gap-3 p-3">
            <span className={cn('grid size-9 shrink-0 place-items-center rounded-lg', isPay ? 'bg-primary-50 text-primary-600' : 'bg-amber-50 text-amber-600')}>
              {isPay ? <ArrowUpRight className="size-4" /> : <ArrowDownLeft className="size-4" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">
                {e.code} <span className="font-normal text-slate-500">· {e.label}</span>
              </p>
              <p className="text-xs text-slate-400">{formatDateTime(new Date(e.at))}</p>
            </div>
            <div className="text-right">
              <p className={cn('text-sm font-bold', isPay ? 'text-primary-600' : 'text-slate-900')}>
                {isPay ? '−' : '+'}
                {formatCurrency(Math.abs(e.amount))}
              </p>
              <p className="text-[11px] text-slate-400">Dư nợ {formatCurrency(e.balance)}</p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export function SupplierOrders({ orders }: { orders: PurchaseOrder[] }) {
  if (!orders.length) return <EmptyState icon={<ClipboardList />} title="Chưa có đơn đặt hàng" className="py-10" />
  return (
    <ul className="divide-y divide-slate-100 rounded-lg border border-slate-100">
      {orders.map((o) => {
        const totals = calcPoTotals(o.items, o.discount)
        const status = PO_STATUS[o.status]
        return (
          <li key={o.id} className="flex items-center gap-3 p-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800">{o.code}</p>
              <p className="text-xs text-slate-400">
                {new Date(o.createdAt).toLocaleDateString('vi-VN')} · {totals.lines} SP · {totals.receivedQty}/{totals.orderedQty} đv
              </p>
            </div>
            <p className="text-sm font-bold text-slate-900">{formatCurrency(totals.total)}</p>
            <Badge tone={status.tone} dot className="w-[118px] justify-center whitespace-nowrap">
              {status.label}
            </Badge>
          </li>
        )
      })}
    </ul>
  )
}

export function SupplierProducts({ products }: { products: TopProduct[] }) {
  if (!products.length) return <EmptyState icon={<Package />} title="Chưa nhập sản phẩm nào" className="py-10" />
  const max = products[0].qty
  return (
    <ul className="space-y-2">
      {products.map((p) => (
        <li key={p.productId} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3">
          <ProductThumb categoryId={p.categoryId} image={p.image} alt={p.name} size="sm" className="size-10" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">{p.name}</p>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-primary-500" style={{ width: `${(p.qty / max) * 100}%` }} />
            </div>
          </div>
          <div className="w-28 text-right text-xs">
            <p className="font-bold text-slate-900">
              {p.qty} {p.unit.toLowerCase()}
            </p>
            <p className="text-slate-400">Giá gần nhất {formatCurrency(p.lastCost)}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
