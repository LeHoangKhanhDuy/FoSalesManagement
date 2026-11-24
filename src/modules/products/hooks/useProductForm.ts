import { useMemo, useState } from 'react'
import type { ProductFormErrors, ProductFormMode, ProductFormValues } from '@/modules/products/types/products.types'
import { initialFormValues, validateProductForm } from '@/modules/products/utils/products.utils'

export type SetProductField = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) => void

export interface ProductServerError {
  errors: ProductFormErrors
  values: ProductFormValues
}

export function useProductForm(
  state: ProductFormMode,
  unitIdByName: (name: string) => string | undefined,
  serverError: ProductServerError | null,
  onSubmit: (values: ProductFormValues, initial: ProductFormValues) => void,
) {
  const [initial] = useState(() => initialFormValues(state, unitIdByName))
  const [values, setValues] = useState(initial)
  const [submitted, setSubmitted] = useState(false)

  const errors = useMemo<ProductFormErrors>(() => {
    const server = serverError
      ? Object.fromEntries(Object.entries(serverError.errors).filter(([k]) => values[k as keyof ProductFormValues] === serverError.values[k as keyof ProductFormValues]))
      : {}
    return { ...server, ...(submitted ? validateProductForm(values) : {}) }
  }, [submitted, values, serverError])

  const set: SetProductField = (key, value) => setValues((v) => ({ ...v, [key]: value }))

  const submit = () => {
    setSubmitted(true)
    if (Object.keys(validateProductForm(values)).length > 0) return
    onSubmit(values, initial)
  }

  const isEdit = state.mode === 'edit'
  return {
    values,
    errors,
    set,
    submit,
    isEdit,
    title: isEdit ? 'Chỉnh sửa sản phẩm' : state.mode === 'duplicate' ? 'Nhân bản sản phẩm' : 'Thêm sản phẩm mới',
    description: state.mode === 'create' ? 'Điền thông tin để bắt đầu bán sản phẩm' : `${state.product.sku} · ${state.product.name}`,
    submitLabel: isEdit ? 'Lưu thay đổi' : 'Thêm sản phẩm',
  }
}
