import { ChevronDown, Wand2 } from 'lucide-react'
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown'
import { Field, inputClass } from '@/components/ui/FormField'
import { cn } from '@/lib/cn'
import type { SetProductField } from '@/modules/products/hooks/useProductForm'
import type { ProductFormErrors, ProductFormValues, UnitOption } from '@/modules/products/types/products.types'
import { generateBarcode } from '@/modules/products/utils/products.utils'
import type { Category } from '@/modules/sales/types/sales.types'

interface ProductBasicFieldsProps {
  values: ProductFormValues
  errors: ProductFormErrors
  set: SetProductField
  categories: Category[]
  units: UnitOption[]
}

function SelectField({
  value,
  placeholder,
  error,
  options,
  onSelect,
}: {
  value?: string
  placeholder: string
  error?: string
  options: { id: string; name: string }[]
  onSelect: (id: string) => void
}) {
  const label = options.find((o) => o.id === value)?.name
  return (
    <Dropdown
      align="start"
      width={260}
      trigger={
        <button
          type="button"
          className={cn(
            inputClass(error),
            'flex cursor-pointer items-center justify-between text-left data-[state=open]:border-primary-500 data-[state=open]:ring-4 data-[state=open]:ring-primary-100',
            !label && 'text-slate-400',
          )}
        >
          <span className="truncate">{label ?? placeholder}</span>
          <ChevronDown className="size-4 shrink-0 text-slate-400" />
        </button>
      }
    >
      {options.length === 0 && <p className="px-3 py-2 text-sm text-slate-400">Chưa có dữ liệu</p>}
      {options.map((o) => (
        <DropdownItem key={o.id} label={o.name} active={o.id === value} onClick={() => onSelect(o.id)} />
      ))}
    </Dropdown>
  )
}

function GenerateButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex cursor-pointer items-center gap-1 font-semibold text-primary-600 hover:text-primary-700">
      <Wand2 className="size-3" /> Tạo mã
    </button>
  )
}

export function ProductBasicFields({ values, errors, set, categories, units }: ProductBasicFieldsProps) {
  const formCategories = categories.filter((c) => c.id !== 'all')

  return (
    <div className="grid grid-cols-2 gap-4">
      <Field label="Tên sản phẩm" required error={errors.name} className="col-span-2">
        <input
          autoFocus
          value={values.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="VD: Coca-Cola lon 330ml"
          maxLength={150}
          className={inputClass(errors.name)}
        />
      </Field>

      <Field label="Danh mục" required error={errors.categoryId}>
        <SelectField value={values.categoryId} placeholder="Chọn danh mục" error={errors.categoryId} options={formCategories} onSelect={(id) => set('categoryId', id)} />
      </Field>

      <Field label="Đơn vị tính" required error={errors.unitId}>
        <SelectField value={values.unitId} placeholder="Chọn đơn vị" error={errors.unitId} options={units} onSelect={(id) => set('unitId', id)} />
      </Field>

      <Field label="Mã SKU" error={errors.sku}>
        <input
          value={values.sku}
          onChange={(e) => set('sku', e.target.value.toUpperCase().replace(/\s/g, ''))}
          placeholder="Để trống để tự sinh"
          maxLength={32}
          className={cn(inputClass(errors.sku), 'font-semibold tracking-wide uppercase placeholder:font-normal placeholder:tracking-normal placeholder:normal-case')}
        />
      </Field>

      <Field label="Mã vạch" error={errors.barcode} hint={<GenerateButton onClick={() => set('barcode', generateBarcode())} />}>
        <input
          inputMode="numeric"
          value={values.barcode}
          onChange={(e) => set('barcode', e.target.value.replace(/\D/g, '').slice(0, 14))}
          placeholder="Quét hoặc nhập mã vạch"
          className={cn(inputClass(errors.barcode), 'tracking-wide')}
        />
      </Field>
    </div>
  )
}
