import { useMemo, useState } from 'react'
import type { ProductFormErrors, ProductFormValues } from '@/modules/products/types/products.types'
import { EMPTY_FORM, generateBarcode, generateSku, productToForm, validateProductForm } from '@/modules/products/utils/products.utils'
import type { Product } from '@/modules/sales/types/sales.types'

export type ProductFormMode = { mode: 'create' } | { mode: 'edit'; product: Product } | { mode: 'duplicate'; product: Product }

export type SetProductField = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) => void

const getInitialValues = (state: ProductFormMode, products: Product[]): ProductFormValues => {
  if (state.mode === 'create') return { ...EMPTY_FORM, sku: generateSku(products), barcode: generateBarcode() }
  const base = productToForm(state.product)
  if (state.mode === 'duplicate') return { ...base, name: `${base.name} (bản sao)`, sku: generateSku(products), barcode: '' }
  return base
}

export function useProductForm(state: ProductFormMode, products: Product[], onSubmit: (values: ProductFormValues) => void) {
  const editingId = state.mode === 'edit' ? state.product.id : undefined
  const [values, setValues] = useState(() => getInitialValues(state, products))
  const [submitted, setSubmitted] = useState(false)

  const errors: ProductFormErrors = useMemo(
    () => (submitted ? validateProductForm(values, products, editingId) : {}),
    [submitted, values, products, editingId],
  )

  const set: SetProductField = (key, value) => setValues((v) => ({ ...v, [key]: value }))

  const submit = () => {
    setSubmitted(true)
    if (Object.keys(validateProductForm(values, products, editingId)).length > 0) return
    onSubmit(values)
  }

  const title = state.mode === 'edit' ? 'Chỉnh sửa sản phẩm' : state.mode === 'duplicate' ? 'Nhân bản sản phẩm' : 'Thêm sản phẩm mới'
  const description = state.mode === 'edit' ? `${state.product.sku} · ${state.product.name}` : 'Điền thông tin để bắt đầu bán sản phẩm'
  const submitLabel = state.mode === 'edit' ? 'Lưu thay đổi' : 'Thêm sản phẩm'

  return { values, errors, set, submit, title, description, submitLabel }
}
