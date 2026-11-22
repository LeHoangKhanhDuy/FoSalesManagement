import { useMemo, useState } from 'react'
import { removeAccents } from '@/lib/format'
import type { SupplierFormState } from '@/modules/suppliers/hooks/useSuppliersPage'
import type { Supplier, SupplierFormValues } from '@/modules/suppliers/types/suppliers.types'
import { emptySupplierForm, nextSupplierCode } from '@/modules/suppliers/utils/suppliers.utils'

type Errors = Partial<Record<'name' | 'code' | 'contact' | 'phone' | 'email' | 'taxCode' | 'bankAccount' | 'suspendReason', string>>

const digits = (v = '') => v.replace(/\D/g, '')

export function useSupplierForm(state: NonNullable<SupplierFormState>, suppliers: Supplier[], onSubmit: (v: SupplierFormValues) => void) {
  const editingId = state.mode === 'edit' ? state.supplier.id : null
  const [values, setValues] = useState<SupplierFormValues>(() => {
    if (state.mode === 'create') return emptySupplierForm(nextSupplierCode(suppliers))
    const { id: _, createdAt: __, ...rest } = state.supplier
    return { ...emptySupplierForm(rest.code), ...rest }
  })
  const [submitted, setSubmitted] = useState(false)

  const others = useMemo(() => suppliers.filter((s) => s.id !== editingId), [suppliers, editingId])

  const validate = (v: SupplierFormValues): Errors => {
    const e: Errors = {}
    if (!v.name.trim()) e.name = 'Nhập tên nhà cung cấp'
    else if (others.some((s) => removeAccents(s.name) === removeAccents(v.name.trim()))) e.name = 'Tên nhà cung cấp đã tồn tại'
    if (!v.code.trim()) e.code = 'Nhập mã nhà cung cấp'
    else if (others.some((s) => s.code.toLowerCase() === v.code.trim().toLowerCase())) e.code = 'Mã đã được sử dụng'
    if (!v.contact.trim()) e.contact = 'Nhập người liên hệ'
    const phone = digits(v.phone)
    if (!phone) e.phone = 'Nhập số điện thoại'
    else if (!/^0\d{9}$/.test(phone)) e.phone = 'Số điện thoại gồm 10 số, bắt đầu bằng 0'
    else if (others.some((s) => digits(s.phone) === phone)) e.phone = 'Số điện thoại đã thuộc nhà cung cấp khác'
    if (v.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) e.email = 'Email không hợp lệ'
    const tax = digits(v.taxCode)
    if (v.taxCode?.trim() && !/^\d{10}(\d{3})?$/.test(tax)) e.taxCode = 'Mã số thuế gồm 10 hoặc 13 số'
    else if (tax && others.some((s) => digits(s.taxCode) === tax)) e.taxCode = 'Mã số thuế đã tồn tại'
    if (v.bankAccount?.trim() && !/^\d{6,19}$/.test(digits(v.bankAccount))) e.bankAccount = 'Số tài khoản từ 6–19 chữ số'
    if (v.status === 'suspended' && !v.suspendReason?.trim()) e.suspendReason = 'Nhập lý do tạm ngưng'
    return e
  }

  const errors = useMemo(() => (submitted ? validate(values) : {}), [submitted, values])

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
