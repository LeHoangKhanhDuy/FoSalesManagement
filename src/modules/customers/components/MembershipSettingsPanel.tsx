import { RotateCcw, Save, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Field, inputClass, NumberInput } from '@/components/ui/FormField'
import { cn } from '@/lib/cn'
import { formatCurrency, formatNumber } from '@/lib/format'
import { useMembershipSettings } from '@/modules/customers/hooks/useMembershipSettings'
import type { CustomerWithStats, MembershipSettings } from '@/modules/customers/types/customers.types'
import { TIER_STYLE } from '@/modules/customers/utils/customers.utils'

interface Props {
  settings: MembershipSettings
  customers: CustomerWithStats[]
  onSave: (s: MembershipSettings) => Promise<void>
}

export function MembershipSettingsPanel({ settings, customers, onSave }: Props) {
  const m = useMembershipSettings(settings, onSave)
  const { draft, errors } = m

  return (
    <div className="space-y-5 p-4">
      <div className="grid gap-4 rounded-lg border border-slate-100 p-4 lg:grid-cols-[1fr_220px_220px]">
        <div>
          <p className="flex items-center gap-2 font-bold text-slate-900">
            <Star className="size-4 fill-amber-400 text-amber-400" /> Quy tắc tích điểm
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Mỗi {formatCurrency(draft.amountPerPoint)} thanh toán = 1 điểm (nhân hệ số theo hạng). 1 điểm có giá trị {formatCurrency(draft.pointValue)} khi đổi quà.
          </p>
        </div>
        <Field label="Số tiền cho 1 điểm" error={errors.amountPerPoint}>
          <NumberInput value={draft.amountPerPoint} onChange={(n) => m.setRule('amountPerPoint', n)} suffix="đ" error={errors.amountPerPoint} />
        </Field>
        <Field label="Giá trị 1 điểm" error={errors.pointValue}>
          <NumberInput value={draft.pointValue} onChange={(n) => m.setRule('pointValue', n)} suffix="đ" error={errors.pointValue} />
        </Field>
      </div>

      <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
        {draft.tiers.map((t, i) => {
          const style = TIER_STYLE[t.tier]
          const Icon = style.icon
          const members = customers.filter((c) => c.tier === t.tier).length
          return (
            <div key={t.tier} className={cn('overflow-hidden rounded-lg border', errors[t.tier] ? 'border-rose-300' : 'border-slate-100')}>
              <div className="flex items-center justify-between p-4" style={{ background: style.gradient, color: style.text }}>
                <span className="flex items-center gap-2 font-bold">
                  <Icon className="size-5" /> {t.label || '—'}
                </span>
                <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: style.track }}>{formatNumber(members)} khách</span>
              </div>
              <div className="space-y-3 p-4">
                <Field label="Tên hạng">
                  <input value={t.label} onChange={(e) => m.setTier(t.tier, { label: e.target.value })} className={inputClass()} />
                </Field>
                <Field label="Tổng chi tiêu từ">
                  <NumberInput value={t.minSpent} onChange={(n) => m.setTier(t.tier, { minSpent: n })} suffix="đ" className={i === 0 ? 'bg-slate-50' : undefined} />
                </Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Giảm mỗi đơn">
                    <NumberInput value={t.discountPercent} onChange={(n) => m.setTier(t.tier, { discountPercent: n })} suffix="%" />
                  </Field>
                  <Field label="Hệ số điểm">
                    <input
                      inputMode="decimal"
                      value={t.pointMultiplier}
                      onChange={(e) => m.setTier(t.tier, { pointMultiplier: Math.max(0, Number(e.target.value.replace(',', '.')) || 0) })}
                      className={cn(inputClass(), 'text-right font-semibold')}
                    />
                  </Field>
                </div>
                <Field label="Quyền lợi hiển thị">
                  <textarea value={t.perks} onChange={(e) => m.setTier(t.tier, { perks: e.target.value })} rows={2} className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100" />
                </Field>
                {errors[t.tier] && <p className="text-[11px] font-medium text-rose-500">{errors[t.tier]}</p>}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
        <p className="text-xs text-slate-500">Hạng được xét theo tổng chi tiêu (gồm chi tiêu chuyển từ hệ thống cũ). Giảm theo hạng tự áp dụng tại quầy khi chọn khách.</p>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" leftIcon={<RotateCcw className="size-4" />} onClick={m.reset} disabled={!m.dirty || m.saving}>
            Hoàn tác
          </Button>
          <Button leftIcon={<Save className="size-4" />} onClick={m.save} disabled={!m.dirty} loading={m.saving}>
            Lưu cấu hình
          </Button>
        </div>
      </div>
    </div>
  )
}
