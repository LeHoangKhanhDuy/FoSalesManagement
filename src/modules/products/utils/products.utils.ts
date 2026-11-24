import { generateEan13, isValidEan13 } from '@/lib/barcode'
import { HttpError } from '@/lib/http'
import type {
  ProductFilters,
  ProductFormErrors,
  ProductFormMode,
  ProductFormValues,
  ProductListParams,
  ProductPayload,
  ProductSortKey,
  StockFilter,
  StockLevel,
} from '@/modules/products/types/products.types'
import type { Category, Product, ProductStatus } from '@/modules/sales/types/sales.types'
import { LOW_STOCK_THRESHOLD } from '@/modules/sales/utils/constants'

export const PAGE_SIZE = 10

export const STATUS_TABS: { value: ProductStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'active', label: 'Đang bán' },
  { value: 'inactive', label: 'Ngừng bán' },
]

export const STOCK_OPTIONS: { value: StockFilter; label: string }[] = [
  { value: 'all', label: 'Tất cả tồn kho' },
  { value: 'in-stock', label: 'Còn hàng' },
  { value: 'low', label: 'Sắp hết (≤ tồn tối thiểu)' },
  { value: 'out', label: 'Hết hàng' },
]

export const SORT_OPTIONS: { value: ProductSortKey; label: string }[] = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'name', label: 'Tên A → Z' },
  { value: 'price-desc', label: 'Giá bán cao → thấp' },
  { value: 'price-asc', label: 'Giá bán thấp → cao' },
  { value: 'stock-asc', label: 'Tồn kho ít → nhiều' },
]

export const DEFAULT_FILTERS: ProductFilters = { keyword: '', status: 'all', categoryId: 'all', stock: 'all', sort: 'newest' }

export const EMPTY_FORM: ProductFormValues = {
  name: '',
  categoryId: '',
  unitId: '',
  sku: '',
  barcode: '',
  price: 0,
  originalPrice: 0,
  costPrice: 0,
  minStock: LOW_STOCK_THRESHOLD,
  stock: 0,
  image: '',
  imageFit: 'auto',
  isBestSeller: false,
  status: 'active',
  description: '',
}

export const hasActiveFilters = (f: ProductFilters) => f.keyword.trim() !== '' || f.status !== 'all' || f.categoryId !== 'all' || f.stock !== 'all'

export const toListParams = (f: ProductFilters, keyword: string, page: number, pageSize = PAGE_SIZE): ProductListParams => ({
  keyword: keyword.trim() || undefined,
  categoryId: f.categoryId === 'all' ? undefined : f.categoryId,
  status: f.status === 'all' ? undefined : f.status,
  stock: f.stock === 'all' ? undefined : f.stock,
  sort: f.sort,
  page,
  pageSize,
})

export const getStockLevel = (stock: number, minStock = LOW_STOCK_THRESHOLD): StockLevel =>
  stock <= 0 ? 'out' : stock <= minStock ? 'low' : 'ok'

export const calcMargin = (price: number, cost?: number) => (price > 0 && cost ? Math.round(((price - cost) / price) * 100) : null)

export const getCategoryName = (categories: Category[], id: string) => categories.find((c) => c.id === id)?.name ?? '—'

export const generateBarcode = () => generateEan13()

const collapse = (value: string) => value.trim().replace(/\s+/g, ' ')

export const productToForm = (p: Product, unitIdByName: (name: string) => string | undefined): ProductFormValues => ({
  name: p.name,
  categoryId: p.categoryId,
  unitId: p.unitId ?? unitIdByName(p.unit) ?? '',
  sku: p.sku,
  barcode: p.barcode,
  price: p.price,
  originalPrice: p.originalPrice ?? 0,
  costPrice: p.costPrice ?? 0,
  minStock: p.minStock ?? LOW_STOCK_THRESHOLD,
  stock: p.stock,
  image: p.image ?? '',
  imageFit: p.imageFit ?? 'auto',
  isBestSeller: !!p.isBestSeller,
  status: p.status ?? 'active',
  description: p.description ?? '',
})

export const initialFormValues = (state: ProductFormMode, unitIdByName: (name: string) => string | undefined): ProductFormValues => {
  if (state.mode === 'create') return { ...EMPTY_FORM, barcode: generateBarcode() }
  const base = productToForm(state.product, unitIdByName)
  return state.mode === 'duplicate' ? { ...base, name: `${base.name} (bản sao)`, sku: '', barcode: '', stock: 0 } : base
}

const fullPayload = (v: ProductFormValues): ProductPayload => ({
  name: collapse(v.name),
  barcode: v.barcode.trim() || null,
  categoryId: v.categoryId,
  unitId: v.unitId,
  price: v.price,
  originalPrice: v.originalPrice > v.price ? v.originalPrice : null,
  costPrice: v.costPrice || null,
  minStock: v.minStock,
  image: v.image.trim() || null,
  imageFit: v.imageFit,
  isBestSeller: v.isBestSeller,
  status: v.status,
  description: v.description.trim() || null,
})

export const toCreatePayload = (v: ProductFormValues): ProductPayload => {
  const sku = v.sku.trim().toUpperCase()
  return { ...fullPayload(v), ...(sku && { sku }), ...(v.stock > 0 && { initialStock: v.stock }) }
}

export const toUpdatePayload = (v: ProductFormValues, original: ProductFormValues): ProductPayload => {
  const next: ProductPayload = { ...fullPayload(v), sku: v.sku.trim().toUpperCase() }
  const prev: ProductPayload = { ...fullPayload(original), sku: original.sku }
  const changed = Object.fromEntries(Object.entries(next).filter(([k, value]) => prev[k as keyof ProductPayload] !== value)) as ProductPayload
  return v.stock !== original.stock ? { ...changed, stock: v.stock } : changed
}

export const validateProductForm = (v: ProductFormValues): ProductFormErrors => {
  const errors: ProductFormErrors = {}
  const sku = v.sku.trim()
  const barcode = v.barcode.trim()
  if (!v.name.trim()) errors.name = 'Vui lòng nhập tên sản phẩm'
  if (!v.categoryId) errors.categoryId = 'Vui lòng chọn danh mục'
  if (!v.unitId) errors.unitId = 'Vui lòng chọn đơn vị tính'
  if (v.price <= 0) errors.price = 'Giá bán phải lớn hơn 0'
  if (v.originalPrice > 0 && v.originalPrice <= v.price) errors.originalPrice = 'Giá gốc phải lớn hơn giá bán'
  if (v.costPrice > v.price) errors.costPrice = 'Giá vốn đang cao hơn giá bán'
  if (sku && !/^[A-Za-z0-9._-]{2,32}$/.test(sku)) errors.sku = 'SKU gồm 2–32 ký tự chữ, số, dấu . _ -'
  if (barcode && !/^\d{8,14}$/.test(barcode)) errors.barcode = 'Mã vạch gồm 8–14 chữ số'
  else if (barcode.length === 13 && !isValidEan13(barcode)) errors.barcode = 'Mã EAN-13 sai số kiểm tra (chữ số cuối)'
  if (v.image.trim() && !/^(https?:\/\/|\/)/.test(v.image.trim())) errors.image = 'Đường dẫn ảnh phải bắt đầu bằng http(s):// hoặc /'
  return errors
}

const FIELD_BY_CODE: Record<string, keyof ProductFormValues> = {
  PRODUCT_SKU_TAKEN: 'sku',
  PRODUCT_BARCODE_INVALID: 'barcode',
  PRODUCT_BARCODE_TAKEN: 'barcode',
  PRODUCT_CATEGORY_INVALID: 'categoryId',
  PRODUCT_UNIT_INVALID: 'unitId',
  PRODUCT_ORIGINAL_PRICE_INVALID: 'originalPrice',
}

export const productFieldError = (error: unknown): ProductFormErrors | null => {
  const field = error instanceof HttpError && error.code ? FIELD_BY_CODE[error.code] : undefined
  return field ? { [field]: error instanceof Error ? error.message : '' } : null
}

export const exportProductsCsv = (products: Product[], categories: Category[]) => {
  const header = ['SKU', 'Mã vạch', 'Tên sản phẩm', 'Danh mục', 'Đơn vị', 'Giá bán', 'Giá gốc', 'Giá vốn', 'Tồn kho', 'Trạng thái']
  const rows = products.map((p) => [
    p.sku,
    p.barcode,
    p.name,
    getCategoryName(categories, p.categoryId),
    p.unit,
    p.price,
    p.originalPrice ?? '',
    p.costPrice ?? '',
    p.stock,
    p.status === 'inactive' ? 'Ngừng bán' : 'Đang bán',
  ])
  const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `san-pham-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
