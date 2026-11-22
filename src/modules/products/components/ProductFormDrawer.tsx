import { Button } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Drawer'
import { FormSection } from '@/components/ui/FormField'
import { ProductBasicFields } from '@/modules/products/components/ProductBasicFields'
import { ProductImageField } from '@/modules/products/components/ProductImageField'
import { ProductOptionFields } from '@/modules/products/components/ProductOptionFields'
import { ProductPricingFields } from '@/modules/products/components/ProductPricingFields'
import { useProductForm, type ProductFormMode } from '@/modules/products/hooks/useProductForm'
import type { ProductFormValues } from '@/modules/products/types/products.types'
import type { Category, Product } from '@/modules/sales/types/sales.types'

interface ProductFormDrawerProps {
  state: ProductFormMode | null
  products: Product[]
  categories: Category[]
  saving: boolean
  onClose: () => void
  onSubmit: (values: ProductFormValues) => void
}

export function ProductFormDrawer({ state, ...props }: ProductFormDrawerProps) {
  if (!state) return null
  const key = state.mode === 'create' ? 'create' : `${state.mode}-${state.product.id}`
  return <ProductFormContent key={key} state={state} {...props} />
}

function ProductFormContent({ state, products, categories, saving, onClose, onSubmit }: ProductFormDrawerProps & { state: ProductFormMode }) {
  const { values, errors, set, submit, title, description, submitLabel } = useProductForm(state, products, onSubmit)

  return (
    <Drawer
      open
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
          <ProductBasicFields values={values} errors={errors} set={set} products={products} categories={categories} />
        </FormSection>
        <FormSection title="Giá & tồn kho">
          <ProductPricingFields values={values} errors={errors} set={set} />
        </FormSection>
        <FormSection title="Tùy chọn">
          <ProductOptionFields values={values} set={set} />
        </FormSection>
        <FormSection title="Mô tả">
          <textarea
            value={values.description}
            onChange={(e) => set('description', e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Thông tin thêm về sản phẩm (không bắt buộc)"
            className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
          />
        </FormSection>
        <button type="submit" className="hidden" />
      </form>
    </Drawer>
  )
}
