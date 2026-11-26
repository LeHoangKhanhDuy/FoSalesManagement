import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { cn } from '@/lib/cn'
import { formatNumber, parseNumber } from '@/lib/format'
import { suggestCashAmounts } from '@/modules/sales/utils/cart.utils'

const CASH_DENOMINATIONS = [1_000, 2_000, 5_000, 10_000, 20_000, 50_000, 100_000, 200_000, 500_000]

interface CashTenderedProps {
  label: string
  value: number
  target: number
  onChange: (value: number) => void
  onEnter: () => void
}

export function CashTendered({ label, value, target, onChange, onEnter }: CashTenderedProps) {
  const [noteCounts, setNoteCounts] = useState<Record<number, number>>({})
  const set = (v: number) => {
    onChange(v)
    setNoteCounts({})
  }
  const addNote = (note: number) => {
    onChange(value + note)
    setNoteCounts((c) => ({ ...c, [note]: (c[note] ?? 0) + 1 }))
  }
  const suggestions = suggestCashAmounts(target, 4).filter((v) => v !== target)

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-800">{label}</label>
        {value > 0 && (
          <button
            type="button"
            onClick={() => set(0)}
            className="flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <RotateCcw className="size-3.5" /> Nhập lại
          </button>
        )}
      </div>
      <div className="flex h-12 items-center rounded-lg border border-slate-200 px-4 focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-100">
        <input
          autoFocus
          inputMode="numeric"
          value={value ? formatNumber(value) : ''}
          onChange={(e) => set(parseNumber(e.target.value))}
          onKeyDown={(e) => e.key === 'Enter' && onEnter()}
          className="w-full text-lg font-bold text-slate-900 outline-none"
          placeholder="0"
          aria-label={label}
        />
        <span className="font-semibold text-slate-400">đ</span>
      </div>
      <div className="mt-3 grid grid-cols-5 gap-2">
        {CASH_DENOMINATIONS.map((note) => {
          const count = noteCounts[note] ?? 0
          return (
            <button
              key={note}
              type="button"
              onClick={() => addNote(note)}
              className={cn(
                'relative h-11 cursor-pointer rounded-lg border text-sm font-semibold transition select-none active:scale-95',
                count > 0 ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-700 hover:border-primary-300 hover:bg-slate-50',
              )}
            >
              {formatNumber(note)}
              {count > 0 && (
                <span className="absolute -top-2 -right-2 grid h-5 min-w-5 place-items-center rounded-full bg-primary-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                  ×{count}
                </span>
              )}
            </button>
          )
        })}
        <button
          type="button"
          onClick={() => set(target)}
          className={cn(
            'h-11 cursor-pointer rounded-lg text-sm font-bold transition select-none active:scale-95',
            value === target && Object.keys(noteCounts).length === 0 ? 'bg-primary-600 text-white' : 'bg-primary-50 text-primary-700 hover:bg-primary-100',
          )}
        >
          Đủ tiền
        </button>
      </div>
      {suggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => set(s)}
              className="h-7 cursor-pointer rounded-full border border-slate-200 px-2.5 text-xs font-semibold text-slate-600 hover:border-primary-300 hover:text-primary-700"
            >
              {formatNumber(s)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
