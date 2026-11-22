import { Field, NumberInput } from '@/components/ui/FormField'
import { cn } from '@/lib/cn'
import { formatCurrency } from '@/lib/format'
import type { SetProductField } from '@/modules/products/hooks/useProductForm'
import type { ProductFormErrors, ProductFormValues } from '@/modules/products/types/products.types'
import { calcMargin } from '@/modules/products/utils/products.utils'

interface ProductPricingFieldsProps {
  values: ProductFormValues
  errors: ProductFormErrors
  set: SetProductField
}

export function ProductPricingFields({ values, errors, set }: ProductPricingFieldsProps) {
  const margin = calcMargin(values.price, values.costPrice)
  const profit = values.price && values.costPrice ? values.price - values.costPrice : null
  const discount = values.originalPrice > values.price && values.price > 0 ? Math.round((1 - values.price / values.originalPrice) * 100) : null

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Giá bán" required error={errors.price}>
          <NumberInput value={values.price} onChange={(v) => set('price', v)} error={errors.price} suffix="đ" />
        </Field>
        <Field label="Giá gốc (trước KM)" error={errors.originalPrice}>
          <NumberInput
            value={values.originalPrice}
            onChange={(v) => set('originalPrice', v)}
            error={errors.originalPrice}
            placeholder="Không có"
            suffix="đ"
          />
        </Field>
        <Field label="Giá vốn" error={errors.costPrice}>
          <NumberInput value={values.costPrice} onChange={(v) => set('costPrice', v)} error={errors.costPrice} suffix="đ" />
        </Field>
        <Field label="Tồn kho">
          <NumberInput value={values.stock} onChange={(v) => set('stock', v)} />
        </Field>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 rounded-lg bg-slate-50 px-4 py-3 text-xs text-slate-500">
        <span>
          Lợi nhuận/đơn vị:{' '}
          <span className={cn('font-bold', profit !== null && profit < 0 ? 'text-rose-500' : 'text-slate-800')}>
            {profit !== null ? formatCurrency(profit) : '—'}
          </span>
        </span>
        <span>
          Tỷ suất lãi:{' '}
          <span className={cn('font-bold', margin !== null && margin < 15 ? 'text-amber-600' : 'text-primary-700')}>
            {margin !== null ? `${margin}%` : '—'}
          </span>
        </span>
        {discount !== null && (
          <span>
            Đang giảm: <span className="font-bold text-rose-500">{discount}%</span>
          </span>
        )}
      </div>
    </>
  )
}
