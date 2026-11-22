import { useMemo, useState } from 'react'
import type { PromotionFormState } from '@/modules/promotions/hooks/usePromotionsPage'
import { promotionsService } from '@/modules/promotions/services/promotions.service'
import type { Promotion, PromotionFormValues, PromotionKind, PromotionScope } from '@/modules/promotions/types/promotions.types'
import { emptyPromotionForm, generatePromoCode, promotionToForm } from '@/modules/promotions/utils/promotions.utils'

export type PromotionFormErrors = Partial<Record<'code' | 'name' | 'discountValue' | 'minOrder' | 'scope' | 'buyProductId' | 'giftProductId' | 'buyQty' | 'giftQty' | 'startAt' | 'endAt', string>>

const initial = (state: NonNullable<PromotionFormState>): PromotionFormValues => {
  if (state.mode === 'create') return emptyPromotionForm(state.kind, state.kind === 'voucher' ? '' : promotionsService.nextAutoCode())
  const v = promotionToForm(state.promotion)
  if (state.mode === 'edit') return v
  return { ...v, name: `${v.name} (bản sao)`, code: v.kind === 'voucher' ? generatePromoCode() : promotionsService.nextAutoCode() }
}

export function usePromotionForm(state: NonNullable<PromotionFormState>, promotions: Promotion[], onSubmit: (v: PromotionFormValues, activate: boolean) => void) {
  const [values, setValues] = useState<PromotionFormValues>(() => initial(state))
  const [submitted, setSubmitted] = useState(false)
  const editingId = state.mode === 'edit' ? state.promotion.id : null
  const isDraft = state.mode !== 'edit' || state.promotion.state === 'draft'

  const validate = (v: PromotionFormValues): PromotionFormErrors => {
    const e: PromotionFormErrors = {}
    if (!v.name.trim()) e.name = 'Nhập tên chương trình'
    const code = v.code.trim().toUpperCase()
    if (v.kind === 'voucher') {
      if (!code) e.code = 'Nhập mã giảm giá'
      else if (!/^[A-Z0-9_-]{4,20}$/.test(code)) e.code = 'Mã 4–20 ký tự, chỉ gồm chữ, số, - và _'
    }
    if (code && promotions.some((p) => p.id !== editingId && p.code === code)) e.code = 'Mã đã được sử dụng'
    if (v.kind !== 'gift') {
      if (!v.discountValue) e.discountValue = 'Nhập mức giảm'
      else if (v.discountType === 'percent' && v.discountValue > 100) e.discountValue = 'Tối đa 100%'
      if (v.kind === 'order' && !v.minOrder) e.minOrder = 'Nhập giá trị đơn tối thiểu'
      if (v.discountType === 'amount' && v.minOrder && v.discountValue >= v.minOrder) e.discountValue = 'Mức giảm phải nhỏ hơn đơn tối thiểu'
    }
    if ((v.kind === 'voucher' || v.kind === 'product') && v.scope.type !== 'all' && !(v.scope.type === 'categories' ? v.scope.categoryIds : v.scope.productIds).length)
      e.scope = v.scope.type === 'categories' ? 'Chọn ít nhất 1 danh mục' : 'Chọn ít nhất 1 sản phẩm'
    if (v.kind === 'gift') {
      if (!v.buyProductId) e.buyProductId = 'Chọn sản phẩm khách cần mua'
      if (!v.giftProductId) e.giftProductId = 'Chọn sản phẩm tặng'
      if (!v.buyQty || v.buyQty < 1) e.buyQty = 'Tối thiểu 1'
      if (!v.giftQty || v.giftQty < 1) e.giftQty = 'Tối thiểu 1'
    }
    if (!v.startAt) e.startAt = 'Chọn ngày bắt đầu'
    if (v.endAt && v.startAt && v.endAt <= v.startAt) e.endAt = 'Ngày kết thúc phải sau ngày bắt đầu'
    return e
  }

  const errors = useMemo(() => (submitted ? validate(values) : {}), [submitted, values])

  const set = <K extends keyof PromotionFormValues>(key: K, value: PromotionFormValues[K]) => setValues((v) => ({ ...v, [key]: value }))
  const setScope = (patch: Partial<PromotionScope>) => setValues((v) => ({ ...v, scope: { ...v.scope, ...patch } }))
  const toggleInScope = (key: 'categoryIds' | 'productIds', id: string) =>
    setValues((v) => ({ ...v, scope: { ...v.scope, [key]: v.scope[key].includes(id) ? v.scope[key].filter((x) => x !== id) : [...v.scope[key], id] } }))
  const setKind = (kind: PromotionKind) => setValues((v) => ({ ...emptyPromotionForm(kind, kind === 'voucher' ? '' : promotionsService.nextAutoCode()), name: v.name, description: v.description, startAt: v.startAt, endAt: v.endAt }))

  const submit = (activate: boolean) => {
    setSubmitted(true)
    if (Object.keys(validate(values)).length) return
    onSubmit(values, activate)
  }

  return { values, errors, set, setScope, toggleInScope, setKind, submit, isDraft, isEdit: !!editingId, generateCode: () => set('code', generatePromoCode()) }
}
