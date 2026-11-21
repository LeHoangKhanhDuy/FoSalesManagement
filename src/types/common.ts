export type ID = string

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export type Status = 'active' | 'inactive'
