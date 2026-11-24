import { useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Drawer'
import { useLastValue } from '@/hooks/useLastValue'
import { FormSection } from '@/components/ui/FormField'
import { ProductBasicFields } from '@/modules/products/components/ProductBasicFields'
import { ProductImageField } from '@/modules/products/components/ProductImageField'
import { ProductOptionFields } from '@/modules/products/components/ProductOptionFields'
import { ProductPricingFields } from '@/modules/products/components/ProductPricingFields'
import { useProductForm, type ProductServerError } from '@/modules/products/hooks/useProductForm'
import type { ProductFormMode, ProductFormValues, UnitOption } from '@/modules/products/types/products.types'
import type { Category } from '@/modules/sales/types/sales.types'

interface ProductFormDrawerProps {
  state: ProductFormMode | null
  categories: Category[]
  units: UnitOption[]
  unitIdByName: (name: string) => string | undefined
  serverError: ProductServerError | null
  saving: boolean
  onClose: () => void
  onSubmit: (values: ProductFormValues, initial: ProductFormValues) => void
}

export function ProductFormDrawer({ state: openState, ...props }: ProductFormDrawerProps) {
  const state = useLastValue(openState)
  const session = useRef({ count: 0, open: false })
  if (openState && !session.current.open) session.current.count += 1
  session.current.open = !!openState
  if (!state) return null
  const key = `${session.current.count}-${state.mode === 'create' ? 'create' : `${state.mode}-${state.product.id}`}`
  return <ProductFormContent key={key} state={state} open={!!openState} {...props} />
}

function ProductFormContent({
  state,
  open,
  categories,
  units,
  unitIdByName,
  serverError,
  saving,
  onClose,
  onSubmit,
}: ProductFormDrawerProps & { state: ProductFormMode; open: boolean }) {
  const { values, errors, set, submit, isEdit, title, description, submitLabel } = useProductForm(state, unitIdByName, serverError, onSubmit)

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      className="max-w-[600px]"
      footer={
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Hủy
          </Button>
          <Button onClick={submit} loading={saving} className="min-w-32">
            {submitLabel}
          </Button>
        </div>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
      >
        <FormSection title="Hình ảnh">
          <ProductImageField values={values} errors={errors} set={set} />
        </FormSection>
        <FormSection title="Thông tin cơ bản">
          <ProductBasicFields values={values} errors={errors} set={set} categories={categories} units={units} />
        </FormSection>
        <FormSection title="Giá & tồn kho">
          <ProductPricingFields values={values} errors={errors} set={set} isEdit={isEdit} />
        </FormSection>
        <FormSection title="Tùy chọn">
          <ProductOptionFields values={values} set={set} />
        </FormSection>
        <FormSection title="Mô tả">
          <textarea
            value={values.description}
            onChange={(e) => set('description', e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="Thông tin thêm về sản phẩm (không bắt buộc)"
            className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
          />
        </FormSection>
        <button type="submit" className="hidden" />
      </form>
    </Drawer>
  )
}
