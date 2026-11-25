import { Cake, Mail, MapPin, Pencil, Phone, Star, StickyNote, UserRound } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Drawer'
import { useLastValue } from '@/hooks/useLastValue'
import { cn } from '@/lib/cn'
import { formatCurrency, formatPhone } from '@/lib/format'
import { CustomerOrders, PointHistory } from '@/modules/customers/components/CustomerActivity'
import { MemberCard } from '@/modules/customers/components/MemberCard'
import { TierBadge } from '@/modules/customers/components/TierBadge'
import { useCustomerDetail, type CustomerDetailTab } from '@/modules/customers/hooks/useCustomerDetail'
import type { CustomerWithStats, MembershipSettings } from '@/modules/customers/types/customers.types'
import { ageOf, formatBirthday, isBirthdayMonth } from '@/modules/customers/utils/customers.utils'

interface Props {
  customer: CustomerWithStats | null
  settings: MembershipSettings | null
  onClose: () => void
  onEdit: (c: CustomerWithStats) => void
  onPoints: (c: CustomerWithStats) => void
}

const GENDER = { male: 'Nam', female: 'Nữ', other: 'Khác' }

export function CustomerDetailDrawer({ customer: open, settings, onClose, onEdit, onPoints }: Props) {
  const c = useLastValue(open)
  const detail = useCustomerDetail(open)
  if (!c || !settings) return null
  const age = ageOf(c.birthday)
  const info = [
    { icon: Phone, value: formatPhone(c.phone), href: `tel:${c.phone}` },
    c.email && { icon: Mail, value: c.email, href: `mailto:${c.email}` },
    { icon: Cake, value: c.birthday ? `${formatBirthday(c.birthday)}${age !== null ? ` (${age} tuổi)` : ''}${isBirthdayMonth(c) ? ' · Sinh nhật tháng này' : ''}` : 'Chưa có ngày sinh' },
    c.gender && { icon: UserRound, value: GENDER[c.gender] },
    c.address && { icon: MapPin, value: c.address },
    c.note && { icon: StickyNote, value: c.note },
  ].filter((x): x is { icon: typeof Phone; value: string; href?: string } => !!x)
  const tabs: [CustomerDetailTab, string][] = [
    ['orders', `Đơn hàng (${detail.orders.length})`],
    ['points', 'Lịch sử điểm'],
  ]

  return (
    <Drawer
      open={!!open}
      onClose={onClose}
      title={
        <span className="flex items-center gap-3">
          <Avatar name={c.name} className="size-10" />
          <span className="min-w-0">
            <span className="flex items-center gap-2">
              <span className="truncate">{c.name}</span>
              <TierBadge tier={c.tier} settings={settings} />
            </span>
            <span className="block text-xs font-medium text-slate-400">
              {c.id.toUpperCase()} · Tham gia {new Date(c.createdAt).toLocaleDateString('vi-VN')}
              {c.status === 'blocked' && <span className="ml-1 font-semibold text-rose-500">· Đã khóa</span>}
            </span>
          </span>
        </span>
      }
      className="max-w-[620px]"
      footer={
        <>
          <Button variant="outline" leftIcon={<Star className="size-4" />} onClick={() => onPoints(c)}>
            Điều chỉnh điểm
          </Button>
          <Button className="ml-auto" leftIcon={<Pencil className="size-4" />} onClick={() => onEdit(c)}>
            Sửa thông tin
          </Button>
        </>
      }
    >
      <MemberCard customer={c} settings={settings} />

      <div className="mt-4 grid grid-cols-4 gap-2">
        {[
          ['Chi tiêu tại FoSales', formatCurrency(c.stats.spent)],
          ['Đơn hoàn thành', String(c.stats.orders)],
          ['TB mỗi đơn', formatCurrency(c.stats.avgOrder)],
          ['Mua gần nhất', c.stats.lastOrderAt ? new Date(c.stats.lastOrderAt).toLocaleDateString('vi-VN') : '—'],
        ].map(([l, v]) => (
          <div key={l} className="rounded-lg bg-slate-50 p-3">
            <p className="truncate text-[11px] text-slate-500">{l}</p>
            <p className="truncate text-[15px] font-bold text-slate-900">{v}</p>
          </div>
        ))}
      </div>
      {c.legacySpent > 0 && <p className="mt-2 text-[11px] text-slate-400">Bao gồm {formatCurrency(c.legacySpent)} chi tiêu chuyển từ hệ thống cũ khi xét hạng.</p>}

      <ul className="mt-4 space-y-2 rounded-lg border border-slate-100 p-3 text-sm">
        {info.map(({ icon: Icon, value, href }) => (
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
      </ul>

      <div className="mt-5 mb-3 inline-flex rounded-lg bg-slate-100 p-1">
        {tabs.map(([v, l]) => (
          <button key={v} type="button" onClick={() => detail.setTab(v)} className={cn('h-8 cursor-pointer rounded-md px-3 text-xs font-semibold transition', detail.tab === v ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-800')}>
            {l}
          </button>
        ))}
      </div>
      {detail.loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-50" />
          ))}
        </div>
      ) : detail.tab === 'orders' ? (
        <CustomerOrders orders={detail.orders} />
      ) : (
        <PointHistory logs={detail.logs} />
      )}
    </Drawer>
  )
}
