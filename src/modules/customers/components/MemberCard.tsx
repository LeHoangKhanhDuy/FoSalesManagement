import { Star } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/format'
import type { CustomerWithStats, MembershipSettings } from '@/modules/customers/types/customers.types'
import { nextTierInfo, TIER_STYLE, tierConfig, totalSpent } from '@/modules/customers/utils/customers.utils'

export function MemberCard({ customer, settings }: { customer: CustomerWithStats; settings: MembershipSettings }) {
  const tier = tierConfig(settings, customer.tier)
  const style = TIER_STYLE[customer.tier]
  const Icon = style.icon
  const spent = totalSpent(customer, customer.stats)
  const next = nextTierInfo(settings, customer.tier, spent)
  return (
    <div className="relative overflow-hidden rounded-xl p-5 shadow-card" style={{ background: style.gradient, color: style.text }}>
      <div className="absolute -top-10 -right-10 size-40 rounded-full bg-white/10" />
      <div className="absolute -bottom-16 left-10 size-40 rounded-full bg-white/5" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: style.muted }}>Membership</p>
          <p className="mt-1 flex items-center gap-1.5 text-lg font-bold">
            <Icon className="size-5" /> Hạng {tier.label}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px]" style={{ color: style.muted }}>Điểm hiện có</p>
          <p className="flex items-center justify-end gap-1 text-2xl font-extrabold">
            <Star className="size-5" style={{ fill: style.text }} /> {formatNumber(customer.points)}
          </p>
          <p className="text-[11px]" style={{ color: style.muted }}>≈ {formatCurrency(customer.points * settings.pointValue)}</p>
        </div>
      </div>
      <p className="relative mt-3 text-xs" style={{ color: style.muted }}>{tier.perks}</p>
      <div className="relative mt-4">
        <div className="flex justify-between text-[11px]" style={{ color: style.muted }}>
          <span>Tổng chi tiêu {formatCurrency(spent)}</span>
          <span>{next.next ? `Còn ${formatCurrency(next.remaining)} lên ${next.next.label}` : 'Hạng cao nhất'}</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full" style={{ background: style.track }}>
          <div className="h-full rounded-full" style={{ width: `${next.progress}%`, background: style.text }} />
        </div>
      </div>
    </div>
  )
}
