import { useRef } from 'react'
import { Check, Rocket, Shuffle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Drawer'
import { Field, FormSection, inputClass } from '@/components/ui/FormField'
import { useLastValue } from '@/hooks/useLastValue'
import { cn } from '@/lib/cn'
import { RewardFields, ScheduleFields, ScopeField } from '@/modules/promotions/components/PromotionFormSections'
import { usePromotionForm } from '@/modules/promotions/hooks/usePromotionForm'
import type { PromotionFormState } from '@/modules/promotions/hooks/usePromotionsPage'
import type { Promotion, PromotionFormValues, PromotionKind } from '@/modules/promotions/types/promotions.types'
import { PROMOTION_KINDS } from '@/modules/promotions/utils/promotions.utils'
import type { Category, Product } from '@/modules/sales/types/sales.types'

interface Props {
  state: PromotionFormState
  promotions: Promotion[]
  categories: Category[]
  products: Product[]
  saving: boolean
  onClose: () => void
  onSubmit: (values: PromotionFormValues, activate: boolean) => void
}

export function PromotionFormDrawer({ state: openState, ...props }: Props) {
  const state = useLastValue(openState)
  const session = useRef({ count: 0, open: false })
  if (openState && !session.current.open) session.current.count += 1
  session.current.open = !!openState
  if (!state) return null
  return <FormContent key={session.current.count} state={state} open={!!openState} {...props} />
}

function FormContent({ state, open, promotions, categories, products, saving, onClose, onSubmit }: Omit<Props, 'state'> & { state: NonNullable<PromotionFormState>; open: boolean }) {
  const form = usePromotionForm(state, promotions, onSubmit)
  const { values: v, errors, set } = form
  const kind = PROMOTION_KINDS[v.kind]
  const title = form.isEdit ? `Sửa: ${v.name || kind.label}` : state.mode === 'duplicate' ? 'Nhân bản khuyến mãi' : 'Tạo khuyến mãi'

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={title}
      description={kind.description}
      className="max-w-[720px]"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Hủy
          </Button>
          <div className="ml-auto flex gap-2">
            {form.isDraft && (
              <Button variant="outline" onClick={() => form.submit(false)} disabled={saving}>
                Lưu nháp
              </Button>
            )}
            <Button leftIcon={form.isDraft ? <Rocket className="size-4" /> : <Check className="size-4" />} onClick={() => form.submit(true)} loading={saving}>
              {form.isDraft ? 'Kích hoạt' : 'Lưu thay đổi'}
            </Button>
          </div>
        </>
      }
    >
      {state.mode === 'create' && (
        <FormSection title="Loại khuyến mãi">
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(PROMOTION_KINDS) as PromotionKind[]).map((k) => {
              const item = PROMOTION_KINDS[k]
              const Icon = item.icon
              const on = v.kind === k
              return (
                <button key={k} type="button" onClick={() => !on && form.setKind(k)} className={cn('flex cursor-pointer flex-col items-start gap-2 rounded-lg border p-3 text-left transition', on ? 'border-primary-500 bg-primary-50/50 ring-4 ring-primary-100' : 'border-slate-200 hover:border-slate-300')}>
                  <span className={cn('grid size-9 place-items-center rounded-lg', item.tone)}>
                    <Icon className="size-[18px]" />
                  </span>
                  <span className="text-[13px] leading-tight font-semibold text-slate-800">{item.label}</span>
                </button>
              )
            })}
          </div>
        </FormSection>
      )}

      <FormSection title="Thông tin chung">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Tên chương trình" required error={errors.name} className="col-span-2">
            <input autoFocus value={v.name} onChange={(e) => set('name', e.target.value)} placeholder={v.kind === 'gift' ? 'VD: Mua 2 tặng 1 mì gói' : 'VD: Giảm 10% cuối tuần'} className={inputClass(errors.name)} />
          </Field>
          <Field
            label={v.kind === 'voucher' ? 'Mã giảm giá' : 'Mã chương trình'}
            required={v.kind === 'voucher'}
            error={errors.code}
            hint={
              v.kind === 'voucher' && (
                <button type="button" onClick={form.generateCode} className="flex cursor-pointer items-center gap-1 font-semibold text-primary-600">
                  <Shuffle className="size-3" /> Tạo mã
                </button>
              )
            }
          >
            <input value={v.code} onChange={(e) => set('code', e.target.value.toUpperCase().replace(/\s/g, ''))} placeholder="VD: GIAM10" maxLength={20} className={cn(inputClass(errors.code), 'font-mono font-semibold tracking-wide uppercase placeholder:font-sans placeholder:font-normal placeholder:normal-case')} />
          </Field>
          <Field label="Mô tả" className="col-span-3">
            <input value={v.description ?? ''} onChange={(e) => set('description', e.target.value)} placeholder="Ghi chú nội bộ, nội dung truyền thông..." className={inputClass()} />
          </Field>
        </div>
      </FormSection>

      <RewardFields form={form} products={products} />
      <ScopeField form={form} categories={categories} products={products} />
      <ScheduleFields form={form} />
    </Drawer>
  )
}
