import { useCallback, useEffect, useState } from 'react'
import { customersService } from '@/modules/customers/services/customers.service'
import type { MembershipSettings } from '@/modules/customers/types/customers.types'
import type { Promotion } from '@/modules/promotions/types/promotions.types'
import type { CustomerTier } from '@/modules/sales/types/sales.types'

export interface ProductPromoBadge {
  label: string
  salePrice?: number
  tone: 'sale' | 'gift'
  title: string
}

const promotions: Promotion[] = []
const badges = new Map<string, ProductPromoBadge>()

export function useActivePromotions() {

  const [membership, setMembership] = useState<MembershipSettings | null>(null)

  useEffect(() => {
    customersService.getMembership().then(setMembership).catch(() => setMembership(null))
  }, [])

  const memberOf = useCallback(
    (tier: CustomerTier) => {
      const t = membership?.tiers.find((x) => x.tier === tier)
      return t && t.discountPercent > 0 ? { tier: t.tier, label: t.label, discountPercent: t.discountPercent } : null
    },
    [membership],
  )

  return { promotions, badges, memberOf, membership }
}
