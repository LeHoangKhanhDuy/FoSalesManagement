import { ChevronDown, Wand2 } from 'lucide-react'
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown'
import { Field, inputClass } from '@/components/ui/FormField'
import { cn } from '@/lib/cn'
import type { SetProductField } from '@/modules/products/hooks/useProductForm'
import type { ProductFormErrors, ProductFormValues } from '@/modules/products/types/products.types'
import { generateBarcode, generateSku } from '@/modules/products/utils/products.utils'
import type { Category, Product } from '@/modules/sales/types/sales.types'

interface ProductBasicFieldsProps {
  values: ProductFormValues
  errors: ProductFormErrors
  set: SetProductField
  products: Product[]
  categories: Category[]
  units: string[]
}

function GenerateButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex cursor-pointer items-center gap-1 font-semibold text-primary-600 hover:text-primary-700">
      <Wand2 className="size-3" /> Tạo mã
    </button>
  )
}

export function ProductBasicFields({ values, errors, set, products, categories, units }: ProductBasicFieldsProps) {
  const formCategories = categories.filter((c) => c.id !== 'all')
  const categoryName = formCategories.find((c) => c.id === values.categoryId)?.name

  return (
    <div className="grid grid-cols-2 gap-4">
      <Field label="Tên sản phẩm" required error={errors.name} className="col-span-2">
        <input
          autoFocus
          value={values.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="VD: Coca-Cola lon 330ml"
          maxLength={120}
          className={inputClass(errors.name)}
        />
      </Field>

      <Field label="Danh mục" required error={errors.categoryId}>
        <Dropdown
          align="start"
          width={260}
          trigger={
            <button
              type="button"
              className={cn(
                inputClass(errors.categoryId),
                'flex cursor-pointer items-center justify-between text-left data-[state=open]:border-primary-500 data-[state=open]:ring-4 data-[state=open]:ring-primary-100',
                !categoryName && 'text-slate-400',
              )}
            >
              {categoryName ?? 'Chọn danh mục'}
              <ChevronDown className="size-4 text-slate-400" />
            </button>
          }
        >
          {formCategories.map((c) => (
            <DropdownItem
              key={c.id}
              label={c.name}
              active={c.id === values.categoryId}
              onClick={() => set('categoryId', c.id as ProductFormValues['categoryId'])}
            />
          ))}
        </Dropdown>
      </Field>

      <Field label="Đơn vị tính" required error={errors.unit}>
        <input
          list="product-units"
          value={values.unit}
          onChange={(e) => set('unit', e.target.value)}
          placeholder="Chai, lon, gói..."
          maxLength={20}
          className={inputClass(errors.unit)}
        />
        <datalist id="product-units">
          {units.map((u) => (
            <option key={u} value={u} />
          ))}
        </datalist>
      </Field>

      <Field label="Mã SKU" required error={errors.sku} hint={<GenerateButton onClick={() => set('sku', generateSku(products))} />}>
        <input
          value={values.sku}
          onChange={(e) => set('sku', e.target.value.toUpperCase().replace(/\s/g, ''))}
          className={cn(inputClass(errors.sku), 'font-semibold tracking-wide uppercase')}
        />
      </Field>

      <Field label="Mã vạch" error={errors.barcode} hint={<GenerateButton onClick={() => set('barcode', generateBarcode())} />}>
        <input
          inputMode="numeric"
          value={values.barcode}
          onChange={(e) => set('barcode', e.target.value.replace(/\D/g, ''))}
          placeholder="Quét hoặc nhập mã vạch"
          maxLength={14}
          className={cn(inputClass(errors.barcode), 'tracking-wide')}
        />
      </Field>
    </div>
  )
}
