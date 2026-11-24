import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { errorMessage } from '@/lib/http'
import { categoryService } from '@/modules/categories/services/category.service'
import { unitService } from '@/modules/categories/services/unit.service'
import { removeAccents } from '@/lib/format'
import type { UnitOption } from '@/modules/products/types/products.types'
import type { Category } from '@/modules/sales/types/sales.types'

const ALL: Category = { id: 'all', name: 'Tất cả' }

export function useProductCatalog() {
  const [categories, setCategories] = useState<Category[]>([ALL])
  const [units, setUnits] = useState<UnitOption[]>([])

  const load = useCallback(() => {
    Promise.all([categoryService.list(), unitService.list()])
      .then(([c, u]) => {
        setCategories([ALL, ...c])
        setUnits(u.map(({ id, name }) => ({ id, name })))
      })
      .catch((e: unknown) => toast.error(errorMessage(e, 'Không tải được danh mục / đơn vị tính')))
  }, [])

  useEffect(load, [load])

  const unitIdByName = useMemo(() => {
    const map = new Map(units.map((u) => [removeAccents(u.name), u.id]))
    return (name: string) => map.get(removeAccents(name))
  }, [units])

  return { categories, units, unitIdByName, reload: load }
}
