import { removeAccents } from '@/lib/format'
import type {
  ProductFilters,
  ProductFormErrors,
  ProductFormValues,
  ProductSortKey,
  ProductStats,
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
  { value: 'low', label: `Sắp hết (≤ ${LOW_STOCK_THRESHOLD})` },
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
  sku: '',
  barcode: '',
  unit: 'Cái',
  price: 0,
  originalPrice: 0,
  costPrice: 0,
  stock: 0,
  image: '',
  imageFit: 'auto',
  isBestSeller: false,
  status: 'active',
  description: '',
}

export const getStockLevel = (stock: number): StockLevel =>
  stock <= 0 ? 'out' : stock <= LOW_STOCK_THRESHOLD ? 'low' : 'ok'

export const calcMargin = (price: number, cost?: number) => (price > 0 && cost ? Math.round(((price - cost) / price) * 100) : null)

export const getCategoryName = (categories: Category[], id: string) => categories.find((c) => c.id === id)?.name ?? '—'

export const filterProducts = (products: Product[], f: ProductFilters, keyword: string) => {
  const k = removeAccents(keyword.trim())
  return products.filter((p) => {
    if (f.categoryId !== 'all' && p.categoryId !== f.categoryId) return false
    const level = getStockLevel(p.stock)
    if (f.stock === 'in-stock' && level === 'out') return false
    if (f.stock === 'low' && level !== 'low') return false
    if (f.stock === 'out' && level !== 'out') return false
    if (!k) return true
    return removeAccents(p.name).includes(k) || p.sku.toLowerCase().includes(k) || p.barcode.includes(k)
  })
}

export const sortProducts = (products: Product[], sort: ProductSortKey) => {
  const list = [...products]
  switch (sort) {
    case 'name':
      return list.sort((a, b) => a.name.localeCompare(b.name, 'vi'))
    case 'price-desc':
      return list.sort((a, b) => b.price - a.price)
    case 'price-asc':
      return list.sort((a, b) => a.price - b.price)
    case 'stock-asc':
      return list.sort((a, b) => a.stock - b.stock)
    default:
      return list.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
  }
}

export const calcProductStats = (products: Product[]): ProductStats =>
  products.reduce<ProductStats>(
    (s, p) => {
      const level = getStockLevel(p.stock)
      s.total += 1
      if (p.status !== 'inactive') s.active += 1
      s.inventoryValue += p.stock * (p.costPrice ?? p.price)
      s.inventoryUnits += p.stock
      if (level === 'low') s.low += 1
      if (level === 'out') s.out += 1
      return s
    },
    { total: 0, active: 0, inventoryValue: 0, inventoryUnits: 0, low: 0, out: 0 },
  )

export const generateSku = (products: Product[]) => {
  const max = products.reduce((m, p) => Math.max(m, Number(p.sku.replace(/\D/g, '')) || 0), 0)
  return `SP${String(max + 1).padStart(4, '0')}`
}

export const generateBarcode = () => `893${String(Math.floor(Math.random() * 1e10)).padStart(10, '0')}`

export const productToForm = (p: Product): ProductFormValues => ({
  name: p.name,
  categoryId: p.categoryId,
  sku: p.sku,
  barcode: p.barcode,
  unit: p.unit,
  price: p.price,
  originalPrice: p.originalPrice ?? 0,
  costPrice: p.costPrice ?? 0,
  stock: p.stock,
  image: p.image ?? '',
  imageFit: p.imageFit ?? 'auto',
  isBestSeller: !!p.isBestSeller,
  status: p.status ?? 'active',
  description: p.description ?? '',
})

export const formToProduct = (v: ProductFormValues): Omit<Product, 'id'> => ({
  name: v.name.trim(),
  categoryId: v.categoryId as Product['categoryId'],
  sku: v.sku.trim().toUpperCase(),
  barcode: v.barcode.trim(),
  unit: v.unit.trim(),
  price: v.price,
  originalPrice: v.originalPrice > v.price ? v.originalPrice : undefined,
  costPrice: v.costPrice || undefined,
  stock: v.stock,
  image: v.image.trim() || undefined,
  imageFit: v.imageFit,
  isBestSeller: v.isBestSeller,
  status: v.status,
  description: v.description.trim() || undefined,
})

export const validateProductForm = (v: ProductFormValues, products: Product[], editingId?: string): ProductFormErrors => {
  const errors: ProductFormErrors = {}
  const others = products.filter((p) => p.id !== editingId)
  if (!v.name.trim()) errors.name = 'Vui lòng nhập tên sản phẩm'
  if (!v.categoryId) errors.categoryId = 'Vui lòng chọn danh mục'
  if (!v.unit.trim()) errors.unit = 'Vui lòng nhập đơn vị tính'
  if (v.price <= 0) errors.price = 'Giá bán phải lớn hơn 0'
  if (v.originalPrice > 0 && v.originalPrice <= v.price) errors.originalPrice = 'Giá gốc phải lớn hơn giá bán'
  if (v.costPrice > v.price) errors.costPrice = 'Giá vốn đang cao hơn giá bán'
  if (!v.sku.trim()) errors.sku = 'Vui lòng nhập mã SKU'
  else if (others.some((p) => p.sku.toLowerCase() === v.sku.trim().toLowerCase())) errors.sku = 'Mã SKU đã tồn tại'
  if (v.barcode.trim() && !/^\d{8,14}$/.test(v.barcode.trim())) errors.barcode = 'Mã vạch gồm 8–14 chữ số'
  else if (v.barcode.trim() && others.some((p) => p.barcode === v.barcode.trim())) errors.barcode = 'Mã vạch đã tồn tại'
  if (v.image.trim() && !/^(https?:\/\/|\/)/.test(v.image.trim())) errors.image = 'Đường dẫn ảnh phải bắt đầu bằng http(s):// hoặc /'
  return errors
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
  const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `san-pham-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
