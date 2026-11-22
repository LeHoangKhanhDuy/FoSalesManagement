import { removeAccents } from '@/lib/format'
import type {
  CategoryFormValues,
  CategoryRecord,
  FormErrors,
  Unit,
  UnitFormValues,
  UnitRecord,
} from '@/modules/categories/types/categories.types'
import { DEFAULT_COLOR, DEFAULT_ICON } from '@/modules/categories/utils/category-visuals'
import type { Category, CategoryStatus } from '@/modules/sales/types/sales.types'

export const CATEGORY_STATUS_OPTIONS: { value: CategoryStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Đang hiển thị' },
  { value: 'inactive', label: 'Đang ẩn' },
]

export const EMPTY_CATEGORY_FORM: CategoryFormValues = {
  name: '',
  description: '',
  icon: DEFAULT_ICON,
  color: DEFAULT_COLOR,
  status: 'active',
}

export const EMPTY_UNIT_FORM: UnitFormValues = { name: '', description: '' }

export const slugify = (value: string) =>
  removeAccents(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'danh-muc'

export const uniqueId = (base: string, taken: string[]) => {
  let id = base
  let i = 2
  while (taken.includes(id)) id = `${base}-${i++}`
  return id
}

export const sortCategories = <T extends Category>(list: T[]) =>
  [...list].sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999) || a.name.localeCompare(b.name, 'vi'))

export const matchKeyword = (keyword: string, ...fields: (string | undefined)[]) => {
  const k = removeAccents(keyword.trim())
  return !k || fields.some((f) => f && removeAccents(f).includes(k))
}

const isDuplicateName = (name: string, list: { id: string; name: string }[], editingId?: string) =>
  list.some((x) => x.id !== editingId && removeAccents(x.name) === removeAccents(name.trim()))

export const validateCategoryForm = (v: CategoryFormValues, list: CategoryRecord[], editingId?: string) => {
  const errors: FormErrors<CategoryFormValues> = {}
  if (!v.name.trim()) errors.name = 'Vui lòng nhập tên danh mục'
  else if (v.name.trim().length > 50) errors.name = 'Tên tối đa 50 ký tự'
  else if (isDuplicateName(v.name, list, editingId)) errors.name = 'Tên danh mục đã tồn tại'
  return errors
}

export const validateUnitForm = (v: UnitFormValues, list: UnitRecord[], editingId?: string) => {
  const errors: FormErrors<UnitFormValues> = {}
  if (!v.name.trim()) errors.name = 'Vui lòng nhập tên đơn vị'
  else if (v.name.trim().length > 20) errors.name = 'Tên tối đa 20 ký tự'
  else if (isDuplicateName(v.name, list, editingId)) errors.name = 'Đơn vị tính đã tồn tại'
  return errors
}

export const categoryToForm = (c: Category): CategoryFormValues => ({
  name: c.name,
  description: c.description ?? '',
  icon: c.icon ?? DEFAULT_ICON,
  color: c.color ?? DEFAULT_COLOR,
  status: c.status ?? 'active',
})

export const unitToForm = (u: Unit): UnitFormValues => ({ name: u.name, description: u.description ?? '' })

export const formatShortDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString('vi-VN') : '—')
