import { http } from '@/lib/http'
import type { UnitFormValues, UnitRecord } from '@/modules/categories/types/categories.types'

const BASE = '/api/units'

type UnitResponse = Omit<UnitRecord, 'description'> & { description: string | null }

const normalize = (u: UnitResponse): UnitRecord => ({ ...u, description: u.description ?? undefined })

const toPayload = (values: Partial<UnitFormValues>) => ({
  ...(values.name !== undefined && { name: values.name.trim().replace(/\s+/g, ' ') }),
  ...(values.description !== undefined && { description: values.description.trim() }),
})

export const unitService = {
  list: () => http.get<UnitResponse[]>(BASE, { params: { withCount: true } }).then((list) => list.map(normalize)),

  create: (values: UnitFormValues) => http.post<UnitResponse>(BASE, toPayload(values)).then(normalize),

  update: (id: string, values: Partial<UnitFormValues>) => http.patch<UnitResponse>(`${BASE}/${encodeURIComponent(id)}`, toPayload(values)).then(normalize),

  remove: (id: string, replaceWith?: string) => http.delete<void>(`${BASE}/${encodeURIComponent(id)}`, { params: { replaceWith } }),
}
