import type { CategoryId, ImageFit, Product, ProductStatus } from '@/modules/sales/types/sales.types'

export type StockFilter = 'all' | 'in-stock' | 'low' | 'out'
export type ProductSortKey = 'newest' | 'name' | 'price-desc' | 'price-asc' | 'stock-asc'
export type StockLevel = 'ok' | 'low' | 'out'

export interface ProductFilters {
  keyword: string
  status: ProductStatus | 'all'
  categoryId: CategoryId
  stock: StockFilter
  sort: ProductSortKey
}

export interface ProductFormValues {
  name: string
  categoryId: Product['categoryId'] | ''
  sku: string
  barcode: string
  unit: string
  price: number
  originalPrice: number
  costPrice: number
  stock: number
  image: string
  imageFit: ImageFit
  isBestSeller: boolean
  status: ProductStatus
  description: string
}

export type ProductFormErrors = Partial<Record<keyof ProductFormValues, string>>

export interface ProductStats {
  total: number
  active: number
  inventoryValue: number
  inventoryUnits: number
  low: number
  out: number
}
