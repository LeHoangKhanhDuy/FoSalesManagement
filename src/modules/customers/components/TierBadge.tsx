import { cn } from '@/lib/cn'
import type { MembershipSettings } from '@/modules/customers/types/customers.types'
import { TIER_STYLE, tierConfig } from '@/modules/customers/utils/customers.utils'
import type { CustomerTier } from '@/modules/sales/types/sales.types'

export function TierBadge({ tier, settings, className }: { tier: CustomerTier; settings: MembershipSettings | null; className?: string }) {
  const style = TIER_STYLE[tier]
  const Icon = style.icon
  return (
    <span style={style.chip} className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold whitespace-nowrap', className)}>
      <Icon className="size-3" />
      {settings ? tierConfig(settings, tier).label : tier}
    </span>
  )
}
