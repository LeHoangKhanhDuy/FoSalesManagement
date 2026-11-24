import { USE_MOCK } from '@/lib/constants'
import { http, sleep } from '@/lib/http'
import { unitService } from '@/modules/categories/services/unit.service'
import type { CategoryRecord } from '@/modules/categories/types/categories.types'
import { sortCategories } from '@/modules/categories/utils/categories.utils'
import { registerCategoryVisuals } from '@/modules/categories/utils/category-visuals'
import { MOCK_CATEGORIES } from '@/modules/sales/mocks/categories.mock'
import { MOCK_PRODUCTS } from '@/modules/sales/mocks/products.mock'
import type { Category } from '@/modules/sales/types/sales.types'

const withCount = (c: Category): CategoryRecord => ({
  ...structuredClone(c),
  productCount: MOCK_PRODUCTS.filter((p) => p.categoryId === c.id).length,
})

export const catalogService = {
  async getCategories(): Promise<CategoryRecord[]> {
    const list = USE_MOCK
      ? await sleep(300).then(() => sortCategories(MOCK_CATEGORIES).map(withCount))
      : await http.get<CategoryRecord[]>('/api/categories', { params: { withCount: true } })
    registerCategoryVisuals(list)
    return list
  },

  getUnits: () => unitService.list(),
}

