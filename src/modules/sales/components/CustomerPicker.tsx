import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Search, Star, UserPlus, UserRound, X } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { useClickOutside } from '@/hooks/useClickOutside'
import { useDebounce } from '@/hooks/useDebounce'
import { formatNumber } from '@/lib/format'
import { salesService } from '@/modules/sales/services/sales.service'
import type { Customer } from '@/modules/sales/types/sales.types'
import { TIER_LABEL } from '@/modules/sales/utils/constants'

interface CustomerPickerProps {
  customer: Customer | null
  onChange: (customer: Customer | null) => void
}

export function CustomerPicker({ customer, onChange }: CustomerPickerProps) {
  const [open, setOpen] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<Customer[]>([])
  const ref = useRef<HTMLDivElement>(null)
  const debounced = useDebounce(keyword, 200)

  useClickOutside(ref, () => setOpen(false), open)

  useEffect(() => {
    if (!open) return
    salesService.searchCustomers(debounced).then(setResults)
  }, [debounced, open])

  if (customer) {
    const tier = TIER_LABEL[customer.tier]
    return (
      <div className="flex items-center gap-3 rounded-xl border border-primary-100 bg-primary-50/50 p-2.5">
        <Avatar name={customer.name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-slate-900">{customer.name}</p>
            <Badge tone={tier.tone} className="px-2 text-[10px]">
              {tier.label}
            </Badge>
          </div>
          <p className="flex items-center gap-1 text-xs text-slate-500">
            {customer.phone} · <Star className="size-3 fill-amber-400 text-amber-400" /> {formatNumber(customer.points)} điểm
          </p>
        </div>
        <button
          onClick={() => onChange(null)}
          className="grid size-8 cursor-pointer place-items-center rounded-lg text-slate-400 hover:bg-white hover:text-rose-500"
          aria-label="Bỏ chọn khách hàng"
        >
          <X className="size-4" />
        </button>
      </div>
    )
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-full cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 text-left text-sm transition hover:border-slate-300"
      >
        <span className="grid size-7 place-items-center rounded-lg bg-slate-100 text-slate-500">
          <UserRound className="size-4" />
        </span>
        <span className="flex-1 text-slate-500">
          Khách lẻ <span className="text-slate-400">· Chọn khách hàng (F3)</span>
        </span>
        <ChevronDown className="size-4 text-slate-400" />
      </button>

      {open && (
        <div className="absolute inset-x-0 top-12 z-20 animate-slide-up rounded-xl border border-slate-100 bg-white p-2 shadow-card">
          <div className="flex h-10 items-center gap-2 rounded-lg bg-slate-50 px-3">
            <Search className="size-4 text-slate-400" />
            <input
              autoFocus
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tên hoặc số điện thoại..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
          <ul className="mt-1.5 max-h-60 overflow-y-auto">
            {results.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => {
                    onChange(c)
                    setOpen(false)
                    setKeyword('')
                  }}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-slate-50"
                >
                  <Avatar name={c.name} className="size-8" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-800">{c.name}</span>
                    <span className="block text-xs text-slate-400">{c.phone}</span>
                  </span>
                  <Badge tone={TIER_LABEL[c.tier].tone} className="text-[10px]">
                    {TIER_LABEL[c.tier].label}
                  </Badge>
                </button>
              </li>
            ))}
            {results.length === 0 && <li className="py-4 text-center text-xs text-slate-400">Không tìm thấy khách hàng</li>}
          </ul>
          <button className="mt-1 flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-primary-300 text-xs font-semibold text-primary-700 hover:bg-primary-50">
            <UserPlus className="size-4" /> Thêm khách hàng mới
          </button>
        </div>
      )}
    </div>
  )
}
