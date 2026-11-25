import { useRef } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Drawer'
import { Field, FormSection, inputClass } from '@/components/ui/FormField'
import { DatePicker } from '@/components/ui/DatePicker'
import { useLastValue } from '@/hooks/useLastValue'
import { cn } from '@/lib/cn'
import type { Category } from '@/modules/sales/types/sales.types'
import { useSupplierForm, type SupplierServerError } from '@/modules/suppliers/hooks/useSupplierForm'
import type { SupplierFormState } from '@/modules/suppliers/hooks/useSuppliersPage'
import type { SupplierFormValues, SupplierStatus } from '@/modules/suppliers/types/suppliers.types'
import { PAYMENT_TERMS, SUPPLIER_STATUS, termLabel } from '@/modules/suppliers/utils/suppliers.utils'

const STATUS_ACTIVE_CLASS: Record<SupplierStatus, string> = {
  active: 'border-primary-500 bg-primary-50 text-primary-700',
  suspended: 'border-amber-500 bg-amber-50 text-amber-700',
  inactive: 'border-slate-400 bg-slate-100 text-slate-700',
}

interface Props {
  state: SupplierFormState
  serverError: SupplierServerError | null
  categories: Category[]
  saving: boolean
  onClose: () => void
  onSubmit: (values: SupplierFormValues) => void
}

export function SupplierFormDrawer({ state: openState, ...props }: Props) {
  const state = useLastValue(openState)
  const session = useRef({ count: 0, open: false })
  if (openState && !session.current.open) session.current.count += 1
  session.current.open = !!openState
  if (!state) return null
  return <FormContent key={session.current.count} state={state} open={!!openState} {...props} />
}

function FormContent({ state, open, serverError, categories, saving, onClose, onSubmit }: Omit<Props, 'state'> & { state: NonNullable<SupplierFormState>; open: boolean }) {
  const { values, errors, set, toggleCategory, submit, isEdit } = useSupplierForm(state, serverError, onSubmit)
  const text = (key: keyof SupplierFormValues, placeholder: string, extra?: string) => (
    <input value={(values[key] as string | undefined) ?? ''} onChange={(e) => set(key, e.target.value as never)} placeholder={placeholder} className={cn(inputClass(errors[key as keyof typeof errors]), extra)} />
  )

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? 'Chỉnh sửa nhà cung cấp' : 'Thêm nhà cung cấp'}
      description={isEdit ? `${values.code} · ${values.name}` : 'Lưu thông tin liên hệ, điều khoản thanh toán và tài khoản ngân hàng'}
      className="max-w-[640px]"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Hủy
          </Button>
          <Button className="ml-auto" onClick={submit} loading={saving}>
            {isEdit ? 'Lưu thay đổi' : 'Thêm nhà cung cấp'}
          </Button>
        </>
      }
    >
      <FormSection title="Thông tin chung">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Tên nhà cung cấp" required error={errors.name} className="col-span-2">
            <input autoFocus value={values.name} onChange={(e) => set('name', e.target.value)} placeholder="VD: Công ty TNHH Phân phối ABC" className={inputClass(errors.name)} />
          </Field>
          <Field label="Mã NCC" error={errors.code}>
            {text('code', 'Để trống để tự sinh', 'uppercase placeholder:normal-case')}
          </Field>
          <Field label="Mã số thuế" error={errors.taxCode}>
            {text('taxCode', '10 hoặc 13 số')}
          </Field>
          <Field label="Địa chỉ" required error={errors.address} className="col-span-2">
            {text('address', 'Số nhà, đường, phường, quận/huyện, tỉnh')}
          </Field>
        </div>
      </FormSection>

      <FormSection title="Người liên hệ">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Họ tên" required error={errors.contact}>
            {text('contact', 'VD: Anh Tuấn')}
          </Field>
          <Field label="Số điện thoại" required error={errors.phone}>
            <input inputMode="tel" value={values.phone} onChange={(e) => set('phone', e.target.value.replace(/[^\d\s]/g, ''))} placeholder="09xx xxx xxx" className={inputClass(errors.phone)} />
          </Field>
          <Field label="Email đặt hàng" error={errors.email} className="col-span-2">
            {text('email', 'order@nhacungcap.vn')}
          </Field>
        </div>
      </FormSection>

      <FormSection title={`Nhóm hàng cung cấp${values.categoryIds.length ? ` (${values.categoryIds.length})` : ''}`}>
        {errors.categoryIds && <p className="mb-2 text-xs font-medium text-rose-500">{errors.categoryIds}</p>}
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => {
            const active = values.categoryIds.includes(c.id)
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleCategory(c.id)}
                className={cn('flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition', active ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-600 hover:border-slate-300')}
              >
                {active && <Check className="size-3.5" />}
                {c.name}
              </button>
            )
          })}
        </div>
      </FormSection>

      <FormSection title="Thanh toán">
        <Field label="Hạn thanh toán (kể từ ngày nhập kho)">
          <div className="flex flex-wrap gap-2">
            {PAYMENT_TERMS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => set('paymentTermDays', d)}
                className={cn('h-9 cursor-pointer rounded-lg border px-3.5 text-sm font-semibold transition', values.paymentTermDays === d ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-600 hover:border-slate-300')}
              >
                {termLabel(d)}
              </button>
            ))}
          </div>
        </Field>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Field label="Ngân hàng">{text('bankName', 'VD: Vietcombank')}</Field>
          <Field label="Số tài khoản" error={errors.bankAccount}>
            {text('bankAccount', 'Số tài khoản nhận tiền')}
          </Field>
          <Field label="Chủ tài khoản" className="col-span-2">
            {text('bankHolder', 'Tên in trên tài khoản', 'uppercase placeholder:normal-case')}
          </Field>
        </div>
      </FormSection>

      <FormSection title="Khác">
        <textarea
          value={values.note ?? ''}
          onChange={(e) => set('note', e.target.value)}
          rows={3}
          maxLength={300}
          placeholder="Ghi chú: lịch giao hàng, chiết khấu, điều kiện đổi trả..."
          className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
        />
        {isEdit && (
          <div className="mt-4">
            <p className="mb-1.5 text-xs font-semibold text-slate-700">Trạng thái hợp tác</p>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(SUPPLIER_STATUS) as SupplierStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => set('status', st)}
                  className={cn(
                    'h-10 cursor-pointer rounded-lg border text-sm font-semibold transition',
                    values.status === st ? STATUS_ACTIVE_CLASS[st] : 'border-slate-200 text-slate-600 hover:border-slate-300',
                  )}
                >
                  {SUPPLIER_STATUS[st].label}
                </button>
              ))}
            </div>
            {values.status === 'suspended' && (
              <div className="mt-3 grid grid-cols-2 gap-3 rounded-lg bg-amber-50/60 p-3">
                <Field label="Lý do tạm ngưng" required error={errors.suspendReason}>
                  {text('suspendReason', 'VD: Giao hàng trễ nhiều lần')}
                </Field>
                <Field label="Dự kiến mở lại">
                  <DatePicker value={values.suspendedUntil ? new Date(values.suspendedUntil) : undefined} onChange={(d) => set('suspendedUntil', d?.toISOString())} disablePast side="top" placeholder="Không bắt buộc" />
                </Field>
              </div>
            )}
            <p className="mt-2 text-xs text-slate-400">Nhà cung cấp tạm ngưng hoặc ngừng hợp tác sẽ không hiện khi tạo đơn đặt hàng mới.</p>
          </div>
        )}
      </FormSection>
    </Drawer>
  )
}
