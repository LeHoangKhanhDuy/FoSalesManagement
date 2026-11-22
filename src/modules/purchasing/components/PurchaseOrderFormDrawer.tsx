import { useRef } from 'react'
import { ChevronDown, Send, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { DatePicker } from '@/components/ui/DatePicker'
import { Drawer } from '@/components/ui/Drawer'
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown'
import { Field, FormSection, inputClass, NumberInput } from '@/components/ui/FormField'
import { useLastValue } from '@/hooks/useLastValue'
import { cn } from '@/lib/cn'
import { formatCurrency } from '@/lib/format'
import { PoItemsEditor } from '@/modules/purchasing/components/PoItemsEditor'
import { ProductSearchPicker } from '@/modules/purchasing/components/ProductSearchPicker'
import { usePurchaseOrderForm } from '@/modules/purchasing/hooks/usePurchaseOrderForm'
import type { PoFormState } from '@/modules/purchasing/hooks/usePurchaseOrders'
import type { PurchaseOrderFormValues} from '@/modules/purchasing/types/purchasing.types'
import type { Supplier } from '@/modules/suppliers/types/suppliers.types'
import { formatPhone } from '@/modules/suppliers/utils/suppliers.utils'
import type { Product } from '@/modules/sales/types/sales.types'

interface PurchaseOrderFormDrawerProps {
  state: PoFormState
  products: Product[]
  suppliers: Supplier[]
  saving: boolean
  onClose: () => void
  onSubmit: (values: PurchaseOrderFormValues, place: boolean) => void
}

export function PurchaseOrderFormDrawer({ state: openState, ...props }: PurchaseOrderFormDrawerProps) {
  const state = useLastValue(openState)
  const session = useRef({ count: 0, open: false })
  if (openState && !session.current.open) session.current.count += 1
  session.current.open = !!openState
  if (!state) return null
  return <FormContent key={session.current.count} state={state} open={!!openState} {...props} />
}

function FormContent({ state, open, products, suppliers, saving, onClose, onSubmit }: Omit<PurchaseOrderFormDrawerProps, 'state'> & { state: NonNullable<PoFormState>; open: boolean }) {
  const form = usePurchaseOrderForm(state, products, suppliers, onSubmit)
  const { values, errors, totals, supplier } = form
  const editing = state.mode === 'edit' ? state.order : null

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={editing ? `Sửa đơn ${editing.code}` : 'Tạo đơn đặt hàng'}
      description="Đặt hàng từ nhà cung cấp, nhận hàng và nhập kho sau khi hàng về"
      className="max-w-[780px]"
      footer={
        <>
          <div className="text-sm">
            <p className="text-xs text-slate-500">Tổng tiền đặt</p>
            <p className="text-lg font-extrabold text-primary-600">{formatCurrency(totals.total)}</p>
          </div>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" onClick={() => form.submit(false)} disabled={saving}>
              Lưu nháp
            </Button>
            <Button leftIcon={<Send className="size-4" />} onClick={() => form.submit(true)} loading={saving}>
              Đặt hàng
            </Button>
          </div>
        </>
      }
    >
      <FormSection title="Nhà cung cấp & giao hàng">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nhà cung cấp" required error={errors.supplierId}>
            <Dropdown
              align="start"
              width={340}
              trigger={
                <button type="button" className={cn(inputClass(errors.supplierId), 'flex cursor-pointer items-center justify-between text-left', !supplier && 'text-slate-400')}>
                  <span className="truncate">{supplier?.name ?? 'Chọn nhà cung cấp'}</span>
                  <ChevronDown className="size-4 shrink-0 text-slate-400" />
                </button>
              }
            >
              {suppliers.map((s) => (
                <DropdownItem key={s.id} label={s.name} description={`${s.contact} · ${formatPhone(s.phone)}`} active={s.id === values.supplierId} onClick={() => form.set('supplierId', s.id)} />
              ))}
            </Dropdown>
          </Field>
          <Field label="Ngày giao dự kiến" required error={errors.expectedDate}>
            <DatePicker value={values.expectedDate} onChange={(d) => form.set('expectedDate', d)} disablePast />
          </Field>
        </div>
        {supplier && (
          <p className="mt-2 text-xs text-slate-500">
            {supplier.contact} · {formatPhone(supplier.phone)} · {supplier.address}
          </p>
        )}
      </FormSection>

      <FormSection
        title={`Sản phẩm (${values.items.length})`}
        action={
          <button type="button" onClick={form.addLowStock} className="flex cursor-pointer items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700">
            <TriangleAlert className="size-3.5" /> Thêm hàng sắp hết
          </button>
        }
      >
        <div className="space-y-3">
          <ProductSearchPicker products={products} selectedIds={values.items.map((i) => i.productId)} onSelect={form.addProduct} />
          <PoItemsEditor items={values.items} products={products} onUpdate={form.updateItem} onRemove={form.removeItem} />
          {errors.items && <p className="text-xs font-medium text-rose-500">{errors.items}</p>}
        </div>
      </FormSection>

      <FormSection title="Thanh toán & ghi chú">
        <div className="grid grid-cols-[1fr_240px] gap-4">
          <textarea
            value={values.note}
            onChange={(e) => form.set('note', e.target.value)}
            rows={4}
            maxLength={300}
            placeholder="Ghi chú cho nhà cung cấp (giờ giao, yêu cầu hóa đơn VAT...)"
            className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
          />
          <dl className="space-y-2 rounded-lg bg-slate-50 p-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Tạm tính ({totals.orderedQty} đv)</dt>
              <dd className="font-semibold text-slate-800">{formatCurrency(totals.subtotal)}</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-slate-500">Chiết khấu</dt>
              <dd className="w-28">
                <NumberInput value={values.discount} onChange={(v) => form.set('discount', Math.min(v, totals.subtotal))} suffix="đ" className="h-8" />
              </dd>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2">
              <dt className="font-bold text-slate-900">Tổng cộng</dt>
              <dd className="font-extrabold text-primary-600">{formatCurrency(totals.total)}</dd>
            </div>
          </dl>
        </div>
      </FormSection>
    </Drawer>
  )
}
