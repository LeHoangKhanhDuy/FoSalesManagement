import { AlarmClock, Building2, PauseCircle, CreditCard, Mail, MapPin, Phone, StickyNote } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Drawer'
import { useLastValue } from '@/hooks/useLastValue'
import { cn } from '@/lib/cn'
import { formatCurrency, formatPhone } from '@/lib/format'
import type { Category } from '@/modules/sales/types/sales.types'
import { SupplierLedger, SupplierPayments, SupplierProducts } from '@/modules/suppliers/components/SupplierActivity'
import { useSupplierDetail, type SupplierDetailTab } from '@/modules/suppliers/hooks/useSupplierDetail'
import type { SupplierListItem } from '@/modules/suppliers/types/suppliers.types'
import { SUPPLIER_STATUS, termLabel } from '@/modules/suppliers/utils/suppliers.utils'

interface Props {
  supplier: SupplierListItem | null
  categories: Category[]
  onClose: () => void
  onEdit: (s: SupplierListItem) => void
  onPay: (s: SupplierListItem) => void
  onOrder: (s: SupplierListItem) => void
}

const TABS: { value: SupplierDetailTab; label: string }[] = [
  { value: 'ledger', label: 'Công nợ' },
  { value: 'payments', label: 'Thanh toán' },
  { value: 'products', label: 'Sản phẩm nhập' },
]

export function SupplierDetailDrawer({ supplier: open, categories, onClose, onEdit, onPay, onOrder }: Props) {
  const supplier = useLastValue(open)
  const detail = useSupplierDetail(open?.id ?? null, open ? `${open.updatedAt ?? ''}:${open.summary.debt}:${open.summary.paid}` : '')
  if (!supplier) return null
  const m = supplier.summary
  const status = SUPPLIER_STATUS[supplier.status]
  const groups = categories.filter((c) => supplier.categoryIds.includes(c.id))
  const contacts = [
    { icon: Phone, value: `${supplier.contact} · ${formatPhone(supplier.phone)}`, href: `tel:${supplier.phone}` },
    supplier.email && { icon: Mail, value: supplier.email, href: `mailto:${supplier.email}` },
    supplier.address && { icon: MapPin, value: supplier.address },
    supplier.taxCode && { icon: Building2, value: `MST ${supplier.taxCode}` },
    supplier.bankAccount && { icon: CreditCard, value: `${supplier.bankName ?? ''} · ${supplier.bankAccount}${supplier.bankHolder ? ` · ${supplier.bankHolder}` : ''}` },
    supplier.note && { icon: StickyNote, value: supplier.note },
  ].filter((c): c is { icon: typeof Phone; value: string; href?: string } => !!c)

  return (
    <Drawer
      open={!!open}
      onClose={onClose}
      title={
        <span className="flex items-center gap-3">
          <Avatar name={supplier.name} className="size-10 rounded-lg" />
          <span className="min-w-0">
            <span className="block truncate">{supplier.name}</span>
            <span className="block text-xs font-medium text-slate-400">
              {supplier.code} · Hạn thanh toán {termLabel(supplier.paymentTermDays).toLowerCase()}
            </span>
          </span>
        </span>
      }
      className="max-w-[640px]"
      headerExtra={
        <Badge tone={status.tone} dot className="mt-1 whitespace-nowrap">
          {status.label}
        </Badge>
      }
      footer={
        <>
          <Button variant="outline" onClick={() => onEdit(supplier)}>
            Sửa
          </Button>
          <div className="ml-auto flex gap-2">
            {supplier.status === 'active' && (
              <Button variant="outline" onClick={() => onOrder(supplier)}>
                Tạo đơn đặt hàng
              </Button>
            )}
            <Button onClick={() => onPay(supplier)} disabled={!m.debt}>
              Thanh toán
            </Button>
          </div>
        </>
      }
    >
      {supplier.status === 'suspended' && (
        <p className="mb-4 flex gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          <PauseCircle className="mt-0.5 size-4 shrink-0" />
          <span>
            Đang tạm ngưng: <span className="font-semibold">{supplier.suspendReason || 'Không ghi lý do'}</span>
            {supplier.suspendedUntil && ` · dự kiến mở lại ${new Date(supplier.suspendedUntil).toLocaleDateString('vi-VN')}`}. Không thể tạo đơn đặt hàng mới.
          </span>
        </p>
      )}
      {m.overdue > 0 && (
        <p className="mb-4 flex gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
          <AlarmClock className="mt-0.5 size-4 shrink-0" /> Có {formatCurrency(m.overdue)} đã quá hạn thanh toán. Liên hệ và thanh toán sớm để giữ uy tín.
        </p>
      )}

      <div className="grid grid-cols-4 gap-2">
        {[
          ['Tổng nhập', formatCurrency(m.purchased), 'text-slate-900'],
          ['Đã trả', formatCurrency(m.paid), 'text-primary-600'],
          ['Còn nợ', formatCurrency(m.debt), m.overdue ? 'text-rose-600' : m.debt ? 'text-amber-600' : 'text-slate-900'],
          ['Đơn đang mở', String(m.openOrders), 'text-slate-900'],
        ].map(([l, v, c]) => (
          <div key={l} className="rounded-lg bg-slate-50 p-3">
            <p className="text-[11px] text-slate-500">{l}</p>
            <p className={cn('truncate text-[15px] font-bold', c)}>{v}</p>
          </div>
        ))}
      </div>

      <ul className="mt-4 space-y-2 rounded-lg border border-slate-100 p-3 text-sm">
        {contacts.map(({ icon: Icon, value, href }) => (
          <li key={value} className="flex gap-2.5 text-slate-600">
            <Icon className="mt-0.5 size-4 shrink-0 text-slate-400" />
            {href ? (
              <a href={href} className="hover:text-primary-700">
                {value}
              </a>
            ) : (
              <span>{value}</span>
            )}
          </li>
        ))}
        {groups.length > 0 && (
          <li className="flex flex-wrap gap-1.5 pt-1">
            {groups.map((g) => (
              <span key={g.id} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                {g.name}
              </span>
            ))}
          </li>
        )}
      </ul>

      <div className="mt-5 mb-3 inline-flex rounded-lg bg-slate-100 p-1">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => detail.setTab(t.value)}
            className={cn('h-8 cursor-pointer rounded-md px-3 text-xs font-semibold transition', detail.tab === t.value ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-800')}
          >
            {t.label}
          </button>
        ))}
      </div>
      {detail.tab === 'ledger' && <SupplierLedger list={detail.ledger} />}
      {detail.tab === 'payments' && <SupplierPayments list={detail.payments} />}
      {detail.tab === 'products' && <SupplierProducts products={detail.products.items} loading={detail.products.loading} error={detail.products.error} />}
    </Drawer>
  )
}
