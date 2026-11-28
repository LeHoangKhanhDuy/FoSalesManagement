import { useState } from 'react'
import { useQuery } from '@/hooks/useQuery'
import { promotionsService } from '@/modules/promotions/services/promotions.service'
import type { PromotionWithUsage } from '@/modules/promotions/types/promotions.types'

export function usePromotionDetail(promotion: PromotionWithUsage | null) {
  const [page, setPage] = useState(1)
  const history = useQuery(promotionsService.redemptions, { id: promotion?.id ?? '', page }, { enabled: !!promotion })
  return { orders: history.data?.items ?? [], total: history.data?.total ?? 0, page, setPage, loading: history.loading, error: history.error }
}
