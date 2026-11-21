import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/useDebounce'
import { removeAccents } from '@/lib/format'
import { salesService } from '@/modules/sales/services/sales.service'
import type { CartItem, Category, CategoryId, Product } from '@/modules/sales/types/sales.types'

export type ProductSort = 'default' | 'price-asc' | 'price-desc' | 'name' | 'best-seller'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [categoryId, setCategoryId] = useState<CategoryId>('all')
  const [sort, setSort] = useState<ProductSort>('default')
  const debouncedKeyword = useDebounce(keyword, 200)

  useEffect(() => {
    let mounted = true
    Promise.all([salesService.getProducts(), salesService.getCategories()])
      .then(([p, c]) => {
        if (!mounted) return
        setProducts(p)
        setCategories(c)
      })
      .catch(() => toast.error('Không tải được danh sách sản phẩm'))
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [])

  const countByCategory = useMemo(() => {
    const map: Partial<Record<CategoryId, number>> = { all: products.length }
    products.forEach((p) => (map[p.categoryId] = (map[p.categoryId] ?? 0) + 1))
    return map
  }, [products])

  const filtered = useMemo(() => {
    const k = removeAccents(debouncedKeyword.trim())
    const list = products.filter((p) => {
      if (categoryId !== 'all' && p.categoryId !== categoryId) return false
      if (!k) return true
      return removeAccents(p.name).includes(k) || p.sku.toLowerCase().includes(k) || p.barcode.includes(k)
    })
    switch (sort) {
      case 'price-asc':
        return list.sort((a, b) => a.price - b.price)
      case 'price-desc':
        return list.sort((a, b) => b.price - a.price)
      case 'name':
        return list.sort((a, b) => a.name.localeCompare(b.name, 'vi'))
      case 'best-seller':
        return list.sort((a, b) => Number(!!b.isBestSeller) - Number(!!a.isBestSeller))
      default:
        return list
    }
  }, [products, debouncedKeyword, categoryId, sort])

  /** Tìm chính xác theo mã vạch / SKU — dùng khi quét barcode + Enter */
  const findByCode = useCallback(
    (code: string) => {
      const c = code.trim().toLowerCase()
      return products.find((p) => p.barcode === c || p.sku.toLowerCase() === c)
    },
    [products],
  )

  /** Trừ tồn kho sau khi thanh toán thành công */
  const decreaseStock = useCallback((items: CartItem[]) => {
    setProducts((prev) =>
      prev.map((p) => {
        const sold = items.find((i) => i.productId === p.id)
        return sold ? { ...p, stock: Math.max(0, p.stock - sold.quantity) } : p
      }),
    )
  }, [])

  return {
    products,
    filtered,
    categories,
    countByCategory,
    loading,
    keyword,
    setKeyword,
    categoryId,
    setCategoryId,
    sort,
    setSort,
    findByCode,
    decreaseStock,
  }
}
