import { useCallback, useState } from 'react'
import { useCategoryManager } from '@/modules/categories/hooks/useCategoryManager'
import { useUnitManager } from '@/modules/categories/hooks/useUnitManager'
import type { CatalogTab } from '@/modules/categories/types/categories.types'

export function useCategoriesPage() {
  const [tab, setTab] = useState<CatalogTab>('categories')
  const categories = useCategoryManager()
  const units = useUnitManager()

  const openCreate = useCallback(() => (tab === 'categories' ? categories.openCreate() : units.openCreate()), [tab, categories, units])
  const reload = useCallback(() => (tab === 'categories' ? categories.reload() : units.reload()), [tab, categories, units])

  return { tab, setTab, categories, units, openCreate, reload, loading: tab === 'categories' ? categories.loading : units.loading }
}
