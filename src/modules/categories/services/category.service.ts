import { http } from '@/lib/http'
import type { CategoryFormValues, CategoryListParams, CategoryRecord } from '@/modules/categories/types/categories.types'
import { registerCategoryVisuals } from '@/modules/categories/utils/category-visuals'

const BASE = '/api/categories'

type CategoryResponse = Omit<CategoryRecord, 'description'> & { description: string | null }

const normalize = (c: CategoryResponse): CategoryRecord => ({ ...c, description: c.description ?? undefined })

const toPayload = (values: Partial<CategoryFormValues>) => ({
  ...values,
  ...(values.name !== undefined && { name: values.name.trim().replace(/\s+/g, ' ') }),
  ...(values.description !== undefined && { description: values.description.trim() }),
})

const remember = (list: CategoryRecord[]) => {
  registerCategoryVisuals(list)
  return list
}

export const categoryService = {
  list: (params: CategoryListParams = {}) =>
    http.get<CategoryResponse[]>(BASE, { params: { withCount: true, ...params } }).then((list) => remember(list.map(normalize))),

  create: (values: CategoryFormValues) => http.post<CategoryResponse>(BASE, toPayload(values)).then((c) => remember([normalize(c)])[0]),

  update: (id: string, values: Partial<CategoryFormValues>) =>
    http.patch<CategoryResponse>(`${BASE}/${encodeURIComponent(id)}`, toPayload(values)).then((c) => remember([normalize(c)])[0]),

  reorder: (ids: string[]) => http.put<void>(`${BASE}/order`, { ids }),

  remove: (id: string, moveTo?: string) => http.delete<void>(`${BASE}/${encodeURIComponent(id)}`, { params: { moveTo } }),
}
