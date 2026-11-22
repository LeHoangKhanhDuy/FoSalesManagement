import { useMemo, useState, type ReactNode } from 'react'
import { ChevronDown, ImageIcon, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Drawer'
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown'
import { Switch } from '@/components/ui/Switch'
import { cn } from '@/lib/cn'
import { formatCurrency, formatNumber, parseNumber } from '@/lib/format'
import { MOCK_UNITS } from '@/modules/products/mocks/units.mock'
import type { ProductFormErrors, ProductFormValues } from '@/modules/products/types/products.types'
import {
  calcMargin,
  EMPTY_FORM,
  generateBarcode,
  generateSku,
  productToForm,
  validateProductForm,
} from '@/modules/products/utils/products.utils'
import { ProductThumb } from '@/modules/sales/components/ProductThumb'
import type { Category, ImageFit, Product } from '@/modules/sales/types/sales.types'

type FormMode = { mode: 'create' } | { mode: 'edit'; product: Product } | { mode: 'duplicate'; product: Product }

interface ProductFormDrawerProps {
  state: FormMode | null
  products: Product[]
  categories: Category[]
  saving: boolean
  onClose: () => void
  onSubmit: (values: ProductFormValues) => void
}

const FIT_OPTIONS: { value: ImageFit; label: string }[] = [
  { value: 'auto', label: 'Tự động' },
  { value: 'cover', label: 'Lấp đầy' },
  { value: 'contain', label: 'Hiện trọn' },
]

const inputClass = (error?: string) =>
  cn(
    'h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-4',
    error ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-100',
  )

function Field({
  label,
  required,
  error,
  hint,
  children,
  className,
}: {
  label: string
  required?: boolean
  error?: string
  hint?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('block', className)}>
      <span className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-700">
        <span>
          {label} {required && <span className="text-rose-500">*</span>}
        </span>
        {hint}
      </span>
      {children}
      {error && <span className="mt-1 block text-[11px] font-medium text-rose-500">{error}</span>}
    </div>
  )
}

function MoneyInput({ value, onChange, error, placeholder }: { value: number; onChange: (v: number) => void; error?: string; placeholder?: string }) {
  return (
    <div className="relative">
      <input
        inputMode="numeric"
        value={value ? formatNumber(value) : ''}
        onChange={(e) => onChange(parseNumber(e.target.value))}
        placeholder={placeholder ?? '0'}
        className={cn(inputClass(error), 'pr-8 text-right font-semibold')}
      />
      <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-slate-400">đ</span>
    </div>
  )
}

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="mt-6 first:mt-0">
    <h3 className="mb-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase">{title}</h3>
    {children}
  </section>
)

export function ProductFormDrawer({ state, ...props }: ProductFormDrawerProps) {
  if (!state) return null
  const key = state.mode === 'create' ? 'create' : `${state.mode}-${state.product.id}`
  return <ProductFormContent key={key} state={state} {...props} />
}

function ProductFormContent({ state, products, categories, saving, onClose, onSubmit }: ProductFormDrawerProps & { state: FormMode }) {
  const editingId = state.mode === 'edit' ? state.product.id : undefined
  const [values, setValues] = useState<ProductFormValues>(() => {
    if (state.mode === 'create') return { ...EMPTY_FORM, sku: generateSku(products), barcode: generateBarcode() }
    const base = productToForm(state.product)
    if (state.mode === 'duplicate') return { ...base, name: `${base.name} (bản sao)`, sku: generateSku(products), barcode: '' }
    return base
  })
  const [submitted, setSubmitted] = useState(false)

  const errors: ProductFormErrors = useMemo(
    () => (submitted ? validateProductForm(values, products, editingId) : {}),
    [submitted, values, products, editingId],
  )

  const set = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) => setValues((v) => ({ ...v, [key]: value }))

  const margin = calcMargin(values.price, values.costPrice)
  const profit = values.price && values.costPrice ? values.price - values.costPrice : null
  const formCategories = categories.filter((c) => c.id !== 'all')
  const categoryName = formCategories.find((c) => c.id === values.categoryId)?.name

  const submit = () => {
    setSubmitted(true)
    if (Object.keys(validateProductForm(values, products, editingId)).length > 0) return
    onSubmit(values)
  }

  const title = state.mode === 'edit' ? 'Chỉnh sửa sản phẩm' : state.mode === 'duplicate' ? 'Nhân bản sản phẩm' : 'Thêm sản phẩm mới'

  return (
    <Drawer
      open
      onClose={onClose}
      title={title}
      description={state.mode === 'edit' ? `${state.product.sku} · ${state.product.name}` : 'Điền thông tin để bắt đầu bán sản phẩm'}
      className="max-w-[600px]"
      footer={
        <>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Hủy
            </Button>
            <Button onClick={submit} loading={saving} className="min-w-32">
              {state.mode === 'edit' ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
            </Button>
          </div>
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
      >
        <Section title="Hình ảnh">
          <div className="flex gap-4">
            <div className="w-36 shrink-0">
              {values.categoryId ? (
                <ProductThumb
                  key={values.image}
                  categoryId={values.categoryId}
                  image={values.image.trim() || undefined}
                  fit={values.imageFit}
                  alt={values.name}
                />
              ) : (
                <div className="grid aspect-[4/3] w-full place-items-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-slate-300">
                  <ImageIcon className="size-8" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-3">
              <Field label="Đường dẫn ảnh" error={errors.image}>
                <input
                  value={values.image}
                  onChange={(e) => set('image', e.target.value)}
                  placeholder="https://... hoặc /products/ten-anh.png"
                  className={inputClass(errors.image)}
                />
              </Field>
              <div>
                <p className="mb-1.5 text-xs font-semibold text-slate-700">Cách hiển thị ảnh</p>
                <div className="inline-flex rounded-lg bg-slate-100 p-1">
                  {FIT_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => set('imageFit', o.value)}
                      className={cn(
                        'h-7 cursor-pointer rounded-md px-3 text-xs font-semibold transition',
                        values.imageFit === o.value ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-800',
                      )}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Section>

        <Section title="Thông tin cơ bản">
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
                {MOCK_UNITS.map((u) => (
                  <option key={u} value={u} />
                ))}
              </datalist>
            </Field>
            <Field
              label="Mã SKU"
              required
              error={errors.sku}
              hint={
                <button
                  type="button"
                  onClick={() => set('sku', generateSku(products))}
                  className="flex cursor-pointer items-center gap-1 font-semibold text-primary-600 hover:text-primary-700"
                >
                  <Wand2 className="size-3" /> Tạo mã
                </button>
              }
            >
              <input
                value={values.sku}
                onChange={(e) => set('sku', e.target.value.toUpperCase().replace(/\s/g, ''))}
                className={cn(inputClass(errors.sku), 'font-semibold tracking-wide uppercase')}
              />
            </Field>
            <Field
              label="Mã vạch"
              error={errors.barcode}
              hint={
                <button
                  type="button"
                  onClick={() => set('barcode', generateBarcode())}
                  className="flex cursor-pointer items-center gap-1 font-semibold text-primary-600 hover:text-primary-700"
                >
                  <Wand2 className="size-3" /> Tạo mã
                </button>
              }
            >
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
        </Section>

        <Section title="Giá & tồn kho">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Giá bán" required error={errors.price}>
              <MoneyInput value={values.price} onChange={(v) => set('price', v)} error={errors.price} />
            </Field>
            <Field label="Giá gốc (trước KM)" error={errors.originalPrice}>
              <MoneyInput value={values.originalPrice} onChange={(v) => set('originalPrice', v)} error={errors.originalPrice} placeholder="Không có" />
            </Field>
            <Field label="Giá vốn" error={errors.costPrice}>
              <MoneyInput value={values.costPrice} onChange={(v) => set('costPrice', v)} error={errors.costPrice} />
            </Field>
            <Field label="Tồn kho">
              <input
                inputMode="numeric"
                value={values.stock ? formatNumber(values.stock) : ''}
                onChange={(e) => set('stock', parseNumber(e.target.value))}
                placeholder="0"
                className={cn(inputClass(), 'text-right font-semibold')}
              />
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
            {values.originalPrice > values.price && values.price > 0 && (
              <span>
                Đang giảm:{' '}
                <span className="font-bold text-rose-500">{Math.round((1 - values.price / values.originalPrice) * 100)}%</span>
              </span>
            )}
          </div>
        </Section>

        <Section title="Tùy chọn">
          <div className="divide-y divide-slate-100 rounded-lg border border-slate-100">
            <div className="flex items-center gap-3 p-3.5">
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">Đang bán</p>
                <p className="text-xs text-slate-400">Tắt để ẩn sản phẩm khỏi màn hình bán hàng</p>
              </div>
              <Switch checked={values.status === 'active'} onChange={(on) => set('status', on ? 'active' : 'inactive')} label="Đang bán" />
            </div>
            <div className="flex items-center gap-3 p-3.5">
              <div className="flex-1">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                  Sản phẩm bán chạy
                </p>
                <p className="text-xs text-slate-400">Hiện nhãn “Bán chạy” trên màn hình bán hàng</p>
              </div>
              <Switch checked={values.isBestSeller} onChange={(on) => set('isBestSeller', on)} label="Bán chạy" />
            </div>
          </div>
        </Section>

        <Section title="Mô tả">
          <textarea
            value={values.description}
            onChange={(e) => set('description', e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Thông tin thêm về sản phẩm (không bắt buộc)"
            className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
          />
        </Section>
        <button type="submit" className="hidden" />
      </form>
    </Drawer>
  )
}
