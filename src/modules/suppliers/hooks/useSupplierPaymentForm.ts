import { useState } from 'react'
import type { PaymentFormValues, PaymentMethod } from '@/modules/suppliers/types/suppliers.types'

export function useSupplierPaymentForm(debt: number, overdue: number, onSubmit: (v: PaymentFormValues) => void) {
  const [values, setValues] = useState<PaymentFormValues>({ amount: overdue || debt, method: 'transfer', reference: '', note: '' })
  const [submitted, setSubmitted] = useState(false)

  const error = !values.amount ? 'Nhập số tiền thanh toán' : values.amount > debt ? 'Số tiền vượt quá công nợ hiện tại' : undefined

  const quick = [
    { label: 'Trả hết', value: debt },
    ...(overdue > 0 && overdue < debt ? [{ label: 'Phần quá hạn', value: overdue }] : []),
    { label: '50%', value: Math.round(debt / 2 / 1000) * 1000 },
  ]

  return {
    values,
    error: submitted ? error : undefined,
    quick,
    remaining: Math.max(0, debt - values.amount),
    setAmount: (amount: number) => setValues((v) => ({ ...v, amount })),
    setMethod: (method: PaymentMethod) => setValues((v) => ({ ...v, method })),
    setReference: (reference: string) => setValues((v) => ({ ...v, reference })),
    setNote: (note: string) => setValues((v) => ({ ...v, note })),
    submit: () => {
      setSubmitted(true)
      if (!error) onSubmit(values)
    },
  }
}
