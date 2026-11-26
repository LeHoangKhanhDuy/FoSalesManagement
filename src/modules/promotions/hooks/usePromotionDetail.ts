import { useEffect, useState } from 'react'
import type { LegacyOrder as OrderRecord } from '@/modules/customers/mocks/orders.mock'
import { promotionsService } from '@/modules/promotions/services/promotions.service'
import type { PromotionWithUsage } from '@/modules/promotions/types/promotions.types'

export function usePromotionDetail(promotion: PromotionWithUsage | null) {
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [loading, setLoading] = useState(false)
  const id = promotion?.id
  const count = promotion?.usage.count

  useEffect(() => {
    if (!id) return
    let alive = true
    setLoading(true)
    promotionsService
      .getOrdersOf(id)
      .then((o) => alive && setOrders(o))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [id, count])

  return { orders, loading }
}
