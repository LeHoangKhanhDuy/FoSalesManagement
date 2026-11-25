import { ArrowDownLeft, ArrowUpRight, Banknote, CircleAlert, Landmark, LoaderCircle, Package, Wallet } from 'lucide-react'
import type { ReactNode } from 'react'
import { EmptyState } from '@/components/ui/EmptyState'
import { RetryButton } from '@/components/common/RetryButton'
import { cn } from '@/lib/cn'
import { formatCurrency, formatDateTime } from '@/lib/format'
import { ProductThumb } from '@/modules/sales/components/ProductThumb'
import type { LedgerEntry, SupplierPayment, TopProduct } from '@/modules/suppliers/types/suppliers.types'
import { ProductCode } from '@/components/common/ProductCode'

interface PagedList<T> {
  items: T[]
  loading: boolean
  error?: string
  hasMore: boolean
  loadMore: () => void
  reload: () => void
}

function ListState<T>({ list, empty, children }: { list: PagedList<T>; empty: ReactNode; children: ReactNode }) {
  if (list.loading && !list.items.length) return <div className="h-32 animate-pulse rounded-lg bg-slate-50" />
  if (list.error && !list.items.length) {
    return <EmptyState icon={<CircleAlert />} title="Không tải được dữ liệu" description={list.error} action={<RetryButton onClick={list.reload} />} className="py-10" />
  }
  if (!list.items.length) return empty
  return (
    <>
      {children}
      {list.hasMore && (
        <button
          type="button"
          onClick={list.loadMore}
          disabled={list.loading}
          className="mt-2 flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-wait"
        >
          {list.loading && <LoaderCircle className="size-3.5 animate-spin" />} Xem thêm
        </button>
      )}
    </>
  )
}

export function SupplierLedger({ list }: { list: PagedList<LedgerEntry> }) {
  const now = Date.now()
  return (
    <ListState list={list} empty={<EmptyState icon={<Wallet />} title="Chưa phát sinh công nợ" description="Công nợ tăng khi nhập kho và giảm khi thanh toán." className="py-10" />}>
      <ul className="divide-y divide-slate-100 rounded-lg border border-slate-100">
        {list.items.map((e) => {
          const decrease = e.amount < 0
          const overdue = !!e.dueAt && new Date(e.dueAt).getTime() < now
          return (
            <li key={e.id} className="flex items-center gap-3 p-3">
              <span className={cn('grid size-9 shrink-0 place-items-center rounded-lg', decrease ? 'bg-primary-50 text-primary-600' : 'bg-amber-50 text-amber-600')}>
                {decrease ? <ArrowUpRight className="size-4" /> : <ArrowDownLeft className="size-4" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {e.code} <span className="font-normal text-slate-500">· {e.label}</span>
                </p>
                <p className="text-xs text-slate-400">
                  {formatDateTime(new Date(e.at))}
                  {e.dueAt && <span className={cn(overdue && 'font-semibold text-rose-500')}> · Hạn {new Date(e.dueAt).toLocaleDateString('vi-VN')}</span>}
                </p>
              </div>
              <div className="text-right">
                <p className={cn('text-sm font-bold', decrease ? 'text-primary-600' : 'text-slate-900')}>
                  {decrease ? '−' : '+'}
                  {formatCurrency(Math.abs(e.amount))}
                </p>
                <p className="text-[11px] text-slate-400">Dư nợ {formatCurrency(e.balance)}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </ListState>
  )
}

export function SupplierPayments({ list }: { list: PagedList<SupplierPayment> }) {
  return (
    <ListState list={list} empty={<EmptyState icon={<Banknote />} title="Chưa có lần thanh toán nào" className="py-10" />}>
      <ul className="divide-y divide-slate-100 rounded-lg border border-slate-100">
        {list.items.map((p) => {
          const Icon = p.method === 'cash' ? Banknote : Landmark
          return (
            <li key={p.id} className="flex items-center gap-3 p-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-50 text-primary-600">
                <Icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {p.code}{' '}
                  <span className="font-normal text-slate-500">
                    · {p.method === 'cash' ? 'Tiền mặt' : `Chuyển khoản${p.reference ? ` · ${p.reference}` : ''}`}
                  </span>
                </p>
                <p className="truncate text-xs text-slate-400">
                  {formatDateTime(new Date(p.paidAt))} · {p.paidBy}
                  {p.note && ` · ${p.note}`}
                </p>
              </div>
              <p className="text-sm font-bold text-primary-600">{formatCurrency(p.amount)}</p>
            </li>
          )
        })}
      </ul>
    </ListState>
  )
}

export function SupplierProducts({ products, loading, error }: { products: TopProduct[]; loading: boolean; error?: string }) {
  if (loading && !products.length) return <div className="h-32 animate-pulse rounded-lg bg-slate-50" />
  if (error && !products.length) return <EmptyState icon={<CircleAlert />} title="Không tải được dữ liệu" description={error} className="py-10" />
  if (!products.length) return <EmptyState icon={<Package />} title="Chưa nhập sản phẩm nào" className="py-10" />
  const max = products[0].qty
  return (
    <ul className="space-y-2">
      {products.map((p) => (
        <li key={p.productId} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3">
          <ProductThumb categoryId={p.categoryId} image={p.image} alt={p.name} size="sm" className="size-10" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">{p.name}</p>
            <ProductCode sku={p.sku} barcode={p.barcode} />
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
