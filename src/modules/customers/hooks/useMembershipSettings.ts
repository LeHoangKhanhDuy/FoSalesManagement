import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import type { MembershipSettings, TierConfig } from '@/modules/customers/types/customers.types'
import type { CustomerTier } from '@/modules/sales/types/sales.types'

export function useMembershipSettings(initial: MembershipSettings, onSave: (s: MembershipSettings) => Promise<void>) {
  const [draft, setDraft] = useState<MembershipSettings>(() => structuredClone(initial))
  const [saving, setSaving] = useState(false)
  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(initial), [draft, initial])

  const errors = useMemo(() => {
    const e: Partial<Record<CustomerTier | 'amountPerPoint' | 'pointValue', string>> = {}
    if (draft.amountPerPoint < 1000) e.amountPerPoint = 'Tối thiểu 1.000đ'
    if (draft.pointValue <= 0) e.pointValue = 'Nhập giá trị điểm'
    draft.tiers.forEach((t, i) => {
      const prev = draft.tiers[i - 1]
      if (!t.label.trim()) e[t.tier] = 'Nhập tên hạng'
      else if (prev && t.minSpent <= prev.minSpent) e[t.tier] = `Mức chi tiêu phải lớn hơn hạng ${prev.label}`
      else if (t.discountPercent > 50) e[t.tier] = 'Giảm tối đa 50%'
    })
    return e
  }, [draft])

  const setRule = (key: 'amountPerPoint' | 'pointValue', value: number) => setDraft((d) => ({ ...d, [key]: value }))
  const setTier = (tier: CustomerTier, patch: Partial<TierConfig>) => setDraft((d) => ({ ...d, tiers: d.tiers.map((t) => (t.tier === tier ? { ...t, ...patch } : t)) }))
  const reset = () => setDraft(structuredClone(initial))

  const save = async () => {
    if (Object.keys(errors).length) return toast.error('Vui lòng kiểm tra lại cấu hình hạng')
    setSaving(true)
    try {
      await onSave(draft)
      toast.success('Đã lưu cấu hình thành viên, hạng khách hàng được tính lại')
    } catch {
      toast.error('Lưu cấu hình thất bại')
    } finally {
      setSaving(false)
    }
  }

  return { draft, dirty, errors, saving, setRule, setTier, reset, save }
}
