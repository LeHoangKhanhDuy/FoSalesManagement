import { RefreshCw, X } from 'lucide-react'
import { DatePicker } from '@/components/ui/DatePicker'
import { Field, FormSection, NumberInput } from '@/components/ui/FormField'
import { Switch } from '@/components/ui/Switch'
import { cn } from '@/lib/cn'
import { formatCurrency } from '@/lib/format'
import type { PromotionFormErrors, usePromotionForm } from '@/modules/promotions/hooks/usePromotionForm'
import type { DiscountType, ScopeType } from '@/modules/promotions/types/promotions.types'
import { ProductSearchPicker } from '@/modules/purchasing/components/ProductSearchPicker'
import { ProductThumb } from '@/modules/sales/components/ProductThumb'
import type { Category, Product } from '@/modules/sales/types/sales.types'

type Form = ReturnType<typeof usePromotionForm>

export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div className="inline-flex rounded-lg bg-slate-100 p-1">
      {options.map(([v, l]) => (
        <button key={v} type="button" onClick={() => onChange(v)} className={cn('h-8 cursor-pointer rounded-md px-3 text-xs font-semibold transition', value === v ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-800')}>
          {l}
        </button>
      ))}
    </div>
  )
}

function PickedProduct({ product, onClear }: { product?: Product; onClear: () => void }) {
  if (!product) return null
  return (
    <div className="flex items-center gap-3 rounded-lg border border-primary-200 bg-primary-50/40 p-2.5">
      <ProductThumb categoryId={product.categoryId} image={product.image} fit={product.imageFit} alt={product.name} size="sm" className="size-10" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-800">{product.name}</p>
        <p className="text-xs text-slate-400">
          {product.sku} · {formatCurrency(product.price)} · Tồn {product.stock}
        </p>
      </div>
      <button type="button" onClick={onClear} className="grid size-8 cursor-pointer place-items-center rounded-md text-slate-400 hover:bg-white hover:text-rose-500" aria-label="Bỏ chọn">
        <X className="size-4" />
      </button>
    </div>
  )
}

export function RewardFields({ form, products }: { form: Form; products: Product[] }) {
  const { values: v, errors, set } = form
  if (v.kind === 'gift') {
    const find = (id?: string) => products.find((p) => p.id === id)
    return (
      <FormSection title="Điều kiện & quà tặng">
        <div className="grid grid-cols-[1fr_120px] gap-3">
          <Field label="Khách mua sản phẩm" required error={errors.buyProductId}>
            {v.buyProductId ? <PickedProduct product={find(v.buyProductId)} onClear={() => set('buyProductId', undefined)} /> : <ProductSearchPicker products={products} selectedIds={[]} onSelect={(p) => set('buyProductId', p.id)} />}
          </Field>
          <Field label="Số lượng mua" required error={errors.buyQty}>
            <NumberInput value={v.buyQty ?? 0} onChange={(n) => set('buyQty', n)} error={errors.buyQty} />
          </Field>
          <Field label="Được tặng sản phẩm" required error={errors.giftProductId}>
            {v.giftProductId ? (
              <PickedProduct product={find(v.giftProductId)} onClear={() => set('giftProductId', undefined)} />
            ) : (
              <div className="space-y-2">
                <ProductSearchPicker products={products} selectedIds={[]} onSelect={(p) => set('giftProductId', p.id)} />
                {v.buyProductId && (
                  <button type="button" onClick={() => set('giftProductId', v.buyProductId)} className="cursor-pointer text-xs font-semibold text-primary-600">
                    Tặng chính sản phẩm đang mua
                  </button>
                )}
              </div>
            )}
          </Field>
          <Field label="Số lượng tặng" required error={errors.giftQty}>
            <NumberInput value={v.giftQty ?? 0} onChange={(n) => set('giftQty', n)} error={errors.giftQty} />
          </Field>
        </div>
        <p className="mt-2 text-xs text-slate-400">Cứ mỗi {v.buyQty || 1} sản phẩm mua, khách được tặng thêm {v.giftQty || 1} sản phẩm (0đ) nếu còn tồn kho.</p>
      </FormSection>
    )
  }
  return (
    <FormSection title="Mức ưu đãi">
      <div className="mb-3">
        <Segmented<DiscountType> value={v.discountType} options={[['percent', 'Giảm theo %'], ['amount', 'Giảm số tiền']]} onChange={(t) => set('discountType', t)} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Field label={v.kind === 'product' ? 'Giảm trên mỗi sản phẩm' : 'Mức giảm'} required error={errors.discountValue}>
          <NumberInput value={v.discountValue} onChange={(n) => set('discountValue', n)} suffix={v.discountType === 'percent' ? '%' : 'đ'} error={errors.discountValue} />
        </Field>
        {v.discountType === 'percent' && v.kind !== 'product' && (
          <Field label="Giảm tối đa">
            <NumberInput value={v.maxDiscount ?? 0} onChange={(n) => set('maxDiscount', n || undefined)} suffix="đ" placeholder="Không giới hạn" />
          </Field>
        )}
        {v.kind !== 'product' && (
          <Field label="Đơn tối thiểu" required={v.kind === 'order'} error={errors.minOrder}>
            <NumberInput value={v.minOrder ?? 0} onChange={(n) => set('minOrder', n || undefined)} suffix="đ" error={errors.minOrder} />
          </Field>
        )}
      </div>
    </FormSection>
  )
}

export function ScopeField({ form, categories, products }: { form: Form; categories: Category[]; products: Product[] }) {
  const { values: v, errors, setScope, toggleInScope } = form
  if (v.kind !== 'voucher' && v.kind !== 'product') return null
  const options: [ScopeType, string][] = [['all', 'Tất cả sản phẩm'], ['categories', 'Theo danh mục'], ['products', 'Sản phẩm cụ thể']]
  return (
    <FormSection title="Phạm vi áp dụng">
      <Segmented<ScopeType> value={v.scope.type} options={options} onChange={(type) => setScope({ type })} />
      {v.scope.type === 'categories' && (
        <div className="mt-3 flex flex-wrap gap-2">
          {categories.map((c) => {
            const on = v.scope.categoryIds.includes(c.id)
            return (
              <button key={c.id} type="button" onClick={() => toggleInScope('categoryIds', c.id)} className={cn('h-8 cursor-pointer rounded-full border px-3 text-xs font-semibold transition', on ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-600 hover:border-slate-300')}>
                {c.name}
              </button>
            )
          })}
        </div>
      )}
      {v.scope.type === 'products' && (
        <div className="mt-3 space-y-2">
          <ProductSearchPicker products={products} selectedIds={v.scope.productIds} onSelect={(p) => !v.scope.productIds.includes(p.id) && toggleInScope('productIds', p.id)} />
          <div className="flex flex-wrap gap-2">
            {v.scope.productIds.map((id) => (
              <span key={id} className="flex h-8 items-center gap-1.5 rounded-full bg-slate-100 pr-1 pl-3 text-xs font-semibold text-slate-700">
                {products.find((p) => p.id === id)?.name ?? id}
                <button type="button" onClick={() => toggleInScope('productIds', id)} className="grid size-6 cursor-pointer place-items-center rounded-full text-slate-400 hover:bg-white hover:text-rose-500" aria-label="Bỏ">
                  <X className="size-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
      {errors.scope && <p className="mt-1.5 text-[11px] font-medium text-rose-500">{errors.scope}</p>}
    </FormSection>
  )
}

const startOfDay = (d?: Date) => (d ? new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString() : '')
const endOfDay = (d?: Date) => (d ? new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59).toISOString() : undefined)

export function ScheduleFields({ form }: { form: Form }) {
  const { values: v, errors, set } = form
  const e = errors as PromotionFormErrors
  return (
    <FormSection title="Thời gian & giới hạn">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Bắt đầu" required error={e.startAt}>
          <DatePicker value={v.startAt ? new Date(v.startAt) : undefined} onChange={(d) => set('startAt', startOfDay(d))} placeholder="dd/mm/yyyy" />
        </Field>
        <Field label="Kết thúc" error={e.endAt} hint={v.endAt && <button type="button" onClick={() => set('endAt', undefined)} className="cursor-pointer font-normal text-slate-400 hover:text-rose-500">Bỏ ngày kết thúc</button>}>
          <DatePicker value={v.endAt ? new Date(v.endAt) : undefined} onChange={(d) => set('endAt', endOfDay(d))} minDate={v.startAt ? new Date(v.startAt) : undefined} placeholder="Không giới hạn" align="end" />
        </Field>
        <Field label="Tổng lượt sử dụng">
          <NumberInput value={v.usageLimit ?? 0} onChange={(n) => set('usageLimit', n || undefined)} placeholder="Không giới hạn" suffix="lượt" />
        </Field>
        {v.kind === 'voucher' && (
          <Field label="Mỗi khách được dùng">
            <NumberInput value={v.perCustomerLimit ?? 0} onChange={(n) => set('perCustomerLimit', n || undefined)} placeholder="Không giới hạn" suffix="lần" />
          </Field>
        )}
      </div>
      {v.kind === 'voucher' && (
        <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-100 p-3">
          <div>
            <p className="text-sm font-semibold text-slate-800">Dùng chung với giảm giá theo hóa đơn</p>
            <p className="text-xs text-slate-400">Tắt: nếu đơn đã có giảm theo hóa đơn, hệ thống chọn ưu đãi có lợi hơn cho khách</p>
          </div>
          <Switch checked={v.stackable} onChange={(on) => set('stackable', on)} label="Dùng chung" />
        </div>
      )}
      {v.perCustomerLimit ? <p className="mt-2 flex items-center gap-1 text-xs text-slate-400"><RefreshCw className="size-3" /> Giới hạn theo khách yêu cầu chọn khách hàng khi bán.</p> : null}
    </FormSection>
  )
}
