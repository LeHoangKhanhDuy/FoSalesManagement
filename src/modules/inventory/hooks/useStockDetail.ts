import { useMemo } from 'react'
import { useQuery } from '@/hooks/useQuery'
import { inventoryService } from '@/modules/inventory/services/inventory.service'

const fetchDetail = (productId: string | null) => inventoryService.detail(productId ?? '')

export function useStockDetail(productId: string | null) {
  const query = useQuery(fetchDetail, productId, { enabled: !!productId, errorText: 'Không tải được chi tiết tồn kho' })
  const detail = useMemo(() => (productId && query.data?.item.id === productId ? query.data : null), [productId, query.data])
  return { detail, loading: query.loading, error: query.error, reload: query.reload, setData: query.setData }
}
