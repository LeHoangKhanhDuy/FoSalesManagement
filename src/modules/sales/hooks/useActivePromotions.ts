import { useCallback, useEffect, useMemo, useState } from 'react'
import { formatCurrency } from '@/lib/format'
import { customersService } from '@/modules/customers/services/customers.service'
import type { MembershipSettings } from '@/modules/customers/types/customers.types'
import { promotionsService } from '@/modules/promotions/services/promotions.service'
import type { Promotion } from '@/modules/promotions/types/promotions.types'
import { calcDiscount, inScope } from '@/modules/promotions/utils/promotions.utils'
import type { CustomerTier, Product } from '@/modules/sales/types/sales.types'

export interface ProductPromoBadge {
  label: string
  salePrice?: number
  tone: 'sale' | 'gift'
  title: string
}

export function useActivePromotions(products: Product[]) {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [membership, setMembership] = useState<MembershipSettings | null>(null)

  useEffect(() => {
    promotionsService.getRunningAuto().then(setPromotions).catch(() => setPromotions([]))
    customersService.getMembership().then(setMembership).catch(() => setMembership(null))
  }, [])

  const memberOf = useCallback(
    (tier: CustomerTier) => {
      const t = membership?.tiers.find((x) => x.tier === tier)
      return t && t.discountPercent > 0 ? { tier: t.tier, label: t.label, discountPercent: t.discountPercent } : null
    },
    [membership],
  )

  const badges = useMemo(() => {
    const map = new Map<string, ProductPromoBadge>()
    for (const product of products) {
      let best: { promo: Promotion; unit: number } | null = null
      for (const p of promotions) {
        if (p.kind !== 'product' || !inScope(p.scope, { productId: product.id, categoryId: product.categoryId })) continue
        const unit = calcDiscount(product.price, p.discountType, p.discountValue)
        if (unit > 0 && (!best || unit > best.unit)) best = { promo: p, unit }
      }
      if (best) {
        const label = best.promo.discountType === 'percent' ? `KM -${best.promo.discountValue}%` : `KM -${formatCurrency(best.unit)}`
        map.set(product.id, { label, salePrice: product.price - best.unit, tone: 'sale', title: best.promo.name })
        continue
      }
      const gift = promotions.find((p) => p.kind === 'gift' && p.buyProductId === product.id)
      if (gift) {
        const same = gift.giftProductId === product.id
        map.set(product.id, { label: same ? `Mua ${gift.buyQty} tặng ${gift.giftQty}` : 'Có quà tặng', tone: 'gift', title: gift.name })
      }
    }
    return map
  }, [promotions, products])

  return { promotions, badges, memberOf, membership }
}
