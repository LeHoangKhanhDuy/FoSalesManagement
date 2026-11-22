import type { Category, CategoryStatus } from '@/modules/sales/types/sales.types'

export type CatalogTab = 'categories' | 'units'

export interface CategoryRecord extends Category {
  productCount: number
}

export interface Unit {
  id: string
  name: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

export interface UnitRecord extends Unit {
  productCount: number
}

export interface CategoryFormValues {
  name: string
  description: string
  icon: string
  color: string
  status: CategoryStatus
}

export interface UnitFormValues {
  name: string
  description: string
}

export type FormErrors<T> = Partial<Record<keyof T, string>>

export type DeleteTarget =
  | { kind: 'category'; item: CategoryRecord }
  | { kind: 'unit'; item: UnitRecord }
