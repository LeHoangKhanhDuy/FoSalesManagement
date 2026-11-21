import { cn } from '@/lib/cn'
import { formatNumber, parseNumber } from '@/lib/format'
import type { Discount } from '@/modules/sales/types/sales.types'

interface DiscountInputProps {
  value: Discount
  onChange: (discount: Discount) => void
}

export function DiscountInput({ value, onChange }: DiscountInputProps) {
  return (
    <div className="flex h-8 items-center overflow-hidden rounded-lg border border-slate-200 bg-white focus-within:border-primary-500">
      <input
        inputMode="numeric"
        value={value.value ? formatNumber(value.value) : ''}
        onChange={(e) => {
          const n = parseNumber(e.target.value)
          onChange({ ...value, value: value.type === 'percent' ? Math.min(n, 100) : n })
        }}
        placeholder="0"
        className="h-full w-24 px-2 text-right text-sm font-semibold text-slate-900 outline-none"
      />
      <div className="flex h-full border-l border-slate-200 bg-slate-50 p-0.5">
        {(['amount', 'percent'] as const).map((t) => (
          <button
            key={t}
            onClick={() => onChange({ type: t, value: 0 })}
            className={cn(
              'cursor-pointer rounded-md px-2 text-xs font-bold transition',
              value.type === t ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-400',
            )}
          >
            {t === 'amount' ? 'đ' : '%'}
          </button>
        ))}
      </div>
    </div>
  )
}
