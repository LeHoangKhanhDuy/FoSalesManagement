import { http } from '@/lib/http'

export interface StoreSettings {
  code: string
  name: string
  address: string | null
  phone: string | null
  taxCode: string | null
  receiptFooter: string | null
  branchName: string | null
  allowNegativeStock: boolean
  returnDays: number
}

export interface CurrentStore extends StoreSettings {
  id: string
}

const path = '/api/stores/current'

export const storesService = {
  current: () => http.get<CurrentStore>(path),
  update: (changes: Partial<StoreSettings>) => http.patch<CurrentStore>(path, changes),
}
