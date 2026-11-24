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

export interface ProductListParams {
  keyword?: string
  categoryId?: string
  status?: ProductStatus
  stock?: Exclude<StockFilter, 'all'>
  sort?: ProductSortKey
  page?: number
  pageSize?: number
}

export interface ProductStatsParams {
  categoryId?: string
  status?: ProductStatus
}

export interface ProductFormValues {
  name: string
  categoryId: Product['categoryId'] | ''
  unitId: string
  sku: string
  barcode: string
  price: number
  originalPrice: number
  costPrice: number
  minStock: number
  stock: number
  image: string
  imageFit: ImageFit
  isBestSeller: boolean
  status: ProductStatus
  description: string
}

export interface ProductPayload {
  name?: string
  sku?: string
  barcode?: string | null
  categoryId?: string
  unitId?: string
  price?: number
  originalPrice?: number | null
  costPrice?: number | null
  minStock?: number
  initialStock?: number
  stock?: number
  image?: string | null
  imageFit?: ImageFit
  isBestSeller?: boolean
  status?: ProductStatus
  description?: string | null
}

export type ProductFormErrors = Partial<Record<keyof ProductFormValues, string>>

export type ProductFormMode = { mode: 'create' } | { mode: 'edit'; product: Product } | { mode: 'duplicate'; product: Product }

export interface ProductStats {
  total: number
  active: number
  inventoryValue: number
  inventoryUnits: number
  low: number
  out: number
}

export type ProductStatusCounts = Record<ProductStatus | 'all', number>

export interface ProductOption {
  id: string
  sku: string
  barcode: string
  name: string
  unit: string
  price: number
  costPrice?: number
  stock: number
  image?: string
  categoryId: string
  status: ProductStatus
}

export interface UnitOption {
  id: string
  name: string
}

export interface BulkDeleteResult {
  deleted: number
  withStock: number
}
