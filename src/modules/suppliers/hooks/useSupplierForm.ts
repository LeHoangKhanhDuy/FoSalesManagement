import { useMemo, useState } from 'react'
import type { SupplierFormState } from '@/modules/suppliers/hooks/useSuppliersPage'
import type { SupplierFormValues } from '@/modules/suppliers/types/suppliers.types'
import { emptySupplierForm } from '@/modules/suppliers/utils/suppliers.utils'

export type Errors = Partial<Record<keyof SupplierFormValues, string>>

const digits = (v = '') => v.replace(/\D/g, '')

const validate = (v: SupplierFormValues): Errors => {
  const e: Errors = {}
  if (!v.name.trim()) e.name = 'Nhập tên nhà cung cấp'
  else if (v.name.trim().length < 2) e.name = 'Tên tối thiểu 2 ký tự'
  if (v.code.trim() && !/^[A-Za-z0-9_-]{2,20}$/.test(v.code.trim())) e.code = 'Mã gồm 2–20 ký tự chữ, số, - hoặc _'
  if (!v.contact.trim()) e.contact = 'Nhập người liên hệ'
  const phone = digits(v.phone)
  if (!phone) e.phone = 'Nhập số điện thoại'
  else if (!/^0\d{9}$/.test(phone)) e.phone = 'Số điện thoại gồm 10 số, bắt đầu bằng 0'
  if (v.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) e.email = 'Email không hợp lệ'
  if (!v.address.trim()) e.address = 'Nhập địa chỉ'
  const tax = digits(v.taxCode)
  if (v.taxCode?.trim() && !/^\d{10}(\d{3})?$/.test(tax)) e.taxCode = 'Mã số thuế gồm 10 hoặc 13 số'
  if (v.bankAccount?.trim() && !/^\d{6,19}$/.test(digits(v.bankAccount))) e.bankAccount = 'Số tài khoản từ 6–19 chữ số'
  if (v.status === 'suspended' && !v.suspendReason?.trim()) e.suspendReason = 'Nhập lý do tạm ngưng'
  return e
}

export interface SupplierServerError {
  errors: Errors
  values: SupplierFormValues
}

export function useSupplierForm(state: NonNullable<SupplierFormState>, serverError: SupplierServerError | null, onSubmit: (v: SupplierFormValues) => void) {
  const editingId = state.mode === 'edit' ? state.supplier.id : null
  const [values, setValues] = useState<SupplierFormValues>(() => {
    if (state.mode === 'create') return emptySupplierForm(state.code)
    const { id: _, createdAt: __, updatedAt: ___, summary: ____, ...rest } = state.supplier
    return { ...emptySupplierForm(rest.code), ...rest }
  })
  const [submitted, setSubmitted] = useState(false)

  const errors = useMemo<Errors>(() => {
    const server = serverError
      ? Object.fromEntries(Object.entries(serverError.errors).filter(([k]) => JSON.stringify(values[k as keyof SupplierFormValues]) === JSON.stringify(serverError.values[k as keyof SupplierFormValues])))
      : {}
    return { ...server, ...(submitted ? validate(values) : {}) }
  }, [submitted, values, serverError])

  const set = <K extends keyof SupplierFormValues>(key: K, value: SupplierFormValues[K]) => setValues((v) => ({ ...v, [key]: value }))

  const toggleCategory = (id: string) =>
    setValues((v) => ({ ...v, categoryIds: v.categoryIds.includes(id) ? v.categoryIds.filter((c) => c !== id) : [...v.categoryIds, id] }))

  const submit = () => {
    setSubmitted(true)
    if (Object.keys(validate(values)).length) return
    onSubmit(values)
  }

  return { values, errors, set, toggleCategory, submit, isEdit: !!editingId }
}
