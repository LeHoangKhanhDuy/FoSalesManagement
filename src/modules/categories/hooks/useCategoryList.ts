import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { errorMessage } from '@/lib/http'
import { categoryService } from '@/modules/categories/services/category.service'
import type { CategoryRecord } from '@/modules/categories/types/categories.types'
import { matchKeyword, sortCategories } from '@/modules/categories/utils/categories.utils'
import type { CategoryStatus } from '@/modules/sales/types/sales.types'

export function useCategoryList() {
  const [items, setItems] = useState<CategoryRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<CategoryStatus | 'all'>('all')

  const load = useCallback(() => {
    setLoading(true)
    categoryService
      .list()
      .then(setItems)
      .catch((e: unknown) => toast.error(errorMessage(e, 'Không tải được danh mục')))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  const sorted = useMemo(() => sortCategories(items), [items])
  const filtered = useMemo(
    () => sorted.filter((c) => (status === 'all' || (c.status ?? 'active') === status) && matchKeyword(keyword, c.name, c.description)),
    [sorted, keyword, status],
  )

  const upsert = useCallback((item: CategoryRecord) => setItems((list) => (list.some((c) => c.id === item.id) ? list.map((c) => (c.id === item.id ? item : c)) : [...list, item])), [])
  const patch = useCallback((id: string, changes: Partial<CategoryRecord>) => setItems((list) => list.map((c) => (c.id === id ? { ...c, ...changes } : c))), [])

  return {
    items: sorted,
    filtered,
    loading,
    keyword,
    setKeyword,
    status,
    setStatus,
    canReorder: !keyword.trim() && status === 'all',
    setItems,
    upsert,
    patch,
    reload: load,
  }
}
