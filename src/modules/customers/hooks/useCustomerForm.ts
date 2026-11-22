import { useMemo, useState } from 'react'
import type { CustomerFormState } from '@/modules/customers/hooks/useCustomersPage'
import type { CustomerFormValues, CustomerProfile } from '@/modules/customers/types/customers.types'
import { customerToForm, emptyCustomerForm } from '@/modules/customers/utils/customers.utils'

type Errors = Partial<Record<'name' | 'phone' | 'email' | 'birthday', string>>

export function useCustomerForm(state: NonNullable<CustomerFormState>, customers: CustomerProfile[], onSubmit: (v: CustomerFormValues) => void) {
  const editingId = state.mode === 'edit' ? state.customer.id : null
  const [values, setValues] = useState<CustomerFormValues>(() => (state.mode === 'edit' ? customerToForm(state.customer) : emptyCustomerForm()))
  const [submitted, setSubmitted] = useState(false)

  const validate = (v: CustomerFormValues): Errors => {
    const e: Errors = {}
    if (!v.name.trim()) e.name = 'Nhập họ tên khách hàng'
    const phone = v.phone.replace(/\D/g, '')
    if (!phone) e.phone = 'Nhập số điện thoại'
    else if (!/^0\d{9}$/.test(phone)) e.phone = 'Số điện thoại gồm 10 số, bắt đầu bằng 0'
    else if (customers.some((c) => c.id !== editingId && c.phone === phone)) e.phone = 'Số điện thoại đã thuộc khách hàng khác'
    if (v.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) e.email = 'Email không hợp lệ'
    if (v.birthday && new Date(v.birthday).getTime() > Date.now()) e.birthday = 'Ngày sinh không hợp lệ'
    return e
  }

  const errors = useMemo(() => (submitted ? validate(values) : {}), [submitted, values])
  const set = <K extends keyof CustomerFormValues>(key: K, value: CustomerFormValues[K]) => setValues((v) => ({ ...v, [key]: value }))

  const submit = () => {
    setSubmitted(true)
    if (Object.keys(validate(values)).length) return
    onSubmit(values)
  }

  return { values, errors, set, submit, isEdit: !!editingId }
}
