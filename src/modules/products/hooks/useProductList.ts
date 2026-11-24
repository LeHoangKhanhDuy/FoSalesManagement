import { useCallback } from 'react'
import { useQuery } from '@/hooks/useQuery'
import { productsService } from '@/modules/products/services/products.service'
import type { ProductListParams } from '@/modules/products/types/products.types'
import type { Product } from '@/modules/sales/types/sales.types'

export function useProductList(params: ProductListParams) {
  const query = useQuery(productsService.list, params, { errorText: 'Không tải được danh sách sản phẩm' })
  const { setData } = query

  const patchItems = useCallback((update: (list: Product[]) => Product[]) => setData((d) => (d ? { ...d, items: update(d.items) } : d)), [setData])

  return {
    items: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    loading: query.loading,
    initialLoading: query.initialLoading,
    error: query.error,
    reload: query.reload,
    patchItems,
  }
}
