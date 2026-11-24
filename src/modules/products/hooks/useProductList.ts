import { useCallback, useEffect, useRef, useState } from 'react'
import { errorMessage } from '@/lib/http'
import { productsService } from '@/modules/products/services/products.service'
import type { ProductListParams } from '@/modules/products/types/products.types'
import type { Product } from '@/modules/sales/types/sales.types'

export function useProductList(params: ProductListParams) {
  const [items, setItems] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string>()
  const latest = useRef(0)
  const key = JSON.stringify(params)

  const load = useCallback(() => {
    const id = ++latest.current
    setLoading(true)
    productsService
      .list(JSON.parse(key) as ProductListParams)
      .then((res) => {
        if (id !== latest.current) return
        setItems(res.items)
        setTotal(res.total)
        setError(undefined)
        setLoaded(true)
      })
      .catch((e: unknown) => id === latest.current && setError(errorMessage(e, 'Không tải được danh sách sản phẩm')))
      .finally(() => id === latest.current && setLoading(false))
  }, [key])

  useEffect(load, [load])

  const patchItems = useCallback((update: (list: Product[]) => Product[]) => setItems(update), [])

  return { items, total, loading, initialLoading: loading && !loaded, error, reload: load, patchItems }
}
