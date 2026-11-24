import { USE_MOCK } from '@/lib/constants'
import { http, sleep } from '@/lib/http'
import { MOCK_UNITS } from '@/modules/categories/mocks/units.mock'
import type { CategoryRecord, Unit, UnitFormValues, UnitRecord } from '@/modules/categories/types/categories.types'
import { sortCategories } from '@/modules/categories/utils/categories.utils'
import { registerCategoryVisuals } from '@/modules/categories/utils/category-visuals'
import { MOCK_CATEGORIES } from '@/modules/sales/mocks/categories.mock'
import { MOCK_PRODUCTS } from '@/modules/sales/mocks/products.mock'
import type { Category } from '@/modules/sales/types/sales.types'

const withCount = (c: Category): CategoryRecord => ({
  ...structuredClone(c),
  productCount: MOCK_PRODUCTS.filter((p) => p.categoryId === c.id).length,
})

const unitWithCount = (u: Unit): UnitRecord => ({
  ...structuredClone(u),
  productCount: MOCK_PRODUCTS.filter((p) => p.unit.toLowerCase() === u.name.toLowerCase()).length,
})

const now = () => new Date().toISOString()

export const catalogService = {
  async getCategories(): Promise<CategoryRecord[]> {
    const list = USE_MOCK
      ? await sleep(300).then(() => sortCategories(MOCK_CATEGORIES).map(withCount))
      : await http.get<CategoryRecord[]>('/api/categories', { params: { withCount: true } })
    registerCategoryVisuals(list)
    return list
  },

  async getUnits(): Promise<UnitRecord[]> {
    if (!USE_MOCK) return http.get<UnitRecord[]>('/api/units', { params: { withCount: true } })
    return sleep(250).then(() => MOCK_UNITS.map(unitWithCount))
  },

  async createUnit(values: UnitFormValues): Promise<UnitRecord> {
    if (!USE_MOCK) return http.post<UnitRecord>('/api/units', values)
    await sleep(300)
    const unit: Unit = {
      id: `u-${crypto.randomUUID().slice(0, 8)}`,
      name: values.name.trim(),
      description: values.description.trim() || undefined,
      createdAt: now(),
    }
    MOCK_UNITS.push(unit)
    return unitWithCount(unit)
  },

  async updateUnit(id: string, values: UnitFormValues): Promise<UnitRecord> {
    if (!USE_MOCK) return http.patch<UnitRecord>(`/api/units/${encodeURIComponent(id)}`, values)
    await sleep(300)
    const unit = MOCK_UNITS.find((u) => u.id === id)
    if (!unit) throw new Error('Không tìm thấy đơn vị tính')
    const oldName = unit.name.toLowerCase()
    const name = values.name.trim()
    MOCK_PRODUCTS.forEach((p) => p.unit.toLowerCase() === oldName && (p.unit = name))
    Object.assign(unit, { name, description: values.description.trim() || undefined, updatedAt: now() })
    return unitWithCount(unit)
  },

  async deleteUnit(id: string, replaceWithId?: string): Promise<void> {
    if (!USE_MOCK) return http.delete<void>(`/api/units/${id}`, { params: { replaceWith: replaceWithId } })
    await sleep(400)
    const unit = MOCK_UNITS.find((u) => u.id === id)
    if (!unit) throw new Error('Không tìm thấy đơn vị tính')
    const replacement = MOCK_UNITS.find((u) => u.id === replaceWithId)
    const used = MOCK_PRODUCTS.filter((p) => p.unit.toLowerCase() === unit.name.toLowerCase())
    if (used.length && !replacement) throw new Error('Đơn vị tính đang được sử dụng')
    used.forEach((p) => replacement && (p.unit = replacement.name))
    MOCK_UNITS.splice(MOCK_UNITS.indexOf(unit), 1)
  },
}

