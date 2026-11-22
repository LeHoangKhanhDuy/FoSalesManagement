import { useRef } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { DatePicker } from '@/components/ui/DatePicker'
import { Drawer } from '@/components/ui/Drawer'
import { Field, FormSection, inputClass } from '@/components/ui/FormField'
import { Switch } from '@/components/ui/Switch'
import { useLastValue } from '@/hooks/useLastValue'
import { cn } from '@/lib/cn'
import { useCustomerForm } from '@/modules/customers/hooks/useCustomerForm'
import type { CustomerFormState } from '@/modules/customers/hooks/useCustomersPage'
import type { CustomerFormValues, CustomerProfile, Gender } from '@/modules/customers/types/customers.types'

interface Props {
  state: CustomerFormState
  customers: CustomerProfile[]
  saving: boolean
  onClose: () => void
  onSubmit: (values: CustomerFormValues) => void
}

const GENDERS: [Gender, string][] = [
  ['female', 'Nữ'],
  ['male', 'Nam'],
  ['other', 'Khác'],
]

export function CustomerFormDrawer({ state: openState, ...props }: Props) {
  const state = useLastValue(openState)
  const session = useRef({ count: 0, open: false })
  if (openState && !session.current.open) session.current.count += 1
  session.current.open = !!openState
  if (!state) return null
  return <FormContent key={session.current.count} state={state} open={!!openState} {...props} />
}

function FormContent({ state, open, customers, saving, onClose, onSubmit }: Omit<Props, 'state'> & { state: NonNullable<CustomerFormState>; open: boolean }) {
  const { values: v, errors, set, submit, isEdit } = useCustomerForm(state, customers, onSubmit)
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng'}
      description={isEdit ? v.name : 'Khách hàng được tích điểm và xét hạng tự động sau mỗi đơn hàng'}
      className="max-w-[560px]"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Hủy
          </Button>
          <Button className="ml-auto" leftIcon={<Check className="size-4" />} onClick={submit} loading={saving}>
            {isEdit ? 'Lưu thay đổi' : 'Thêm khách hàng'}
          </Button>
        </>
      }
    >
      <FormSection title="Thông tin cơ bản">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Họ và tên" required error={errors.name} className="col-span-2">
            <input autoFocus value={v.name} onChange={(e) => set('name', e.target.value)} placeholder="VD: Nguyễn Văn An" className={inputClass(errors.name)} />
          </Field>
          <Field label="Số điện thoại" required error={errors.phone}>
            <input inputMode="tel" value={v.phone} onChange={(e) => set('phone', e.target.value.replace(/[^\d\s]/g, ''))} placeholder="09xx xxx xxx" className={inputClass(errors.phone)} />
          </Field>
          <Field label="Ngày sinh" error={errors.birthday}>
            <DatePicker value={v.birthday ? new Date(v.birthday) : undefined} onChange={(d) => set('birthday', d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : undefined)} disableFuture placeholder="dd/mm/yyyy" align="end" />
          </Field>
          <Field label="Giới tính">
            <div className="flex gap-2">
              {GENDERS.map(([g, l]) => (
                <button key={g} type="button" onClick={() => set('gender', v.gender === g ? undefined : g)} className={cn('h-10 flex-1 cursor-pointer rounded-lg border text-sm font-semibold transition', v.gender === g ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-600 hover:border-slate-300')}>
                  {l}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Email" error={errors.email}>
            <input value={v.email ?? ''} onChange={(e) => set('email', e.target.value)} placeholder="email@gmail.com" className={inputClass(errors.email)} />
          </Field>
          <Field label="Địa chỉ" className="col-span-2">
            <input value={v.address ?? ''} onChange={(e) => set('address', e.target.value)} placeholder="Số nhà, đường, phường, quận..." className={inputClass()} />
          </Field>
        </div>
      </FormSection>
      <FormSection title="Ghi chú">
        <textarea value={v.note ?? ''} onChange={(e) => set('note', e.target.value)} rows={3} maxLength={300} placeholder="Sở thích, thói quen mua hàng, lưu ý khi giao..." className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-100" />
        {isEdit && (
          <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-100 p-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">Cho phép mua hàng & tích điểm</p>
              <p className="text-xs text-slate-400">Tắt để khóa khách hàng, không chọn được tại quầy</p>
            </div>
            <Switch checked={v.status === 'active'} onChange={(on) => set('status', on ? 'active' : 'blocked')} label="Hoạt động" />
          </div>
        )}
      </FormSection>
    </Drawer>
  )
}
