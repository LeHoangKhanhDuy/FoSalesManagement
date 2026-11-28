import { memo, useState, type FormEvent } from 'react'
import { CircleAlert, LoaderCircle, TicketPercent, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { formatCurrency } from '@/lib/format'
import { salesService } from '@/modules/sales/services/sales.service'
import type { Voucher } from '@/modules/sales/types/sales.types'
import { describeVoucher } from '@/modules/sales/utils/cart.utils'

interface VoucherInputProps {
  voucher: Voucher | null
  cartTotal: number
  discount: number
  issue?: string
  customerId: string | null
  onApply: (voucher: Voucher) => void
  onRemove: () => void
}

export const VoucherInput = memo(function VoucherInput({ voucher, cartTotal, discount, issue, customerId, onApply, onRemove }: VoucherInputProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e?: FormEvent) => {
    e?.preventDefault()
    const value = code.trim()
    if (!value || loading) return
    setLoading(true)
    setError(null)
    try {
      onApply(await salesService.applyVoucher(value, customerId, cartTotal))
      setCode('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không áp dụng được mã giảm giá')
    } finally {
      setLoading(false)
    }
  }

  if (voucher) {
    const eligible = !issue && discount > 0

    return (
      <div
        className={cn(
          'flex items-center gap-3 rounded-lg border border-dashed px-3 py-2',
          eligible ? 'border-primary-300 bg-primary-50/60' : 'border-amber-300 bg-amber-50/60',
        )}
      >
        <span
          className={cn(
            'grid size-8 shrink-0 place-items-center rounded-lg',
            eligible ? 'bg-primary-100 text-primary-700' : 'bg-amber-100 text-amber-700',
          )}
        >
          <TicketPercent className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-slate-900">
            {voucher.code}
            {eligible && <span className="font-semibold text-primary-700">· -{formatCurrency(discount)}</span>}
          </p>
          <p className={cn('truncate text-[11px]', eligible ? 'text-slate-500' : 'text-amber-700')}>
            {eligible ? describeVoucher(voucher) : (issue ?? describeVoucher(voucher))}
          </p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-md text-slate-400 transition hover:bg-white hover:text-rose-500"
          aria-label="Bỏ mã giảm giá"
        >
          <X className="size-4" />
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={submit}>
      <div
        className={cn(
          'flex h-10 items-center gap-2 rounded-lg border bg-white pr-1 pl-3 transition focus-within:ring-4',
          error
            ? 'border-rose-300 focus-within:border-rose-400 focus-within:ring-rose-100'
            : 'border-slate-200 focus-within:border-primary-500 focus-within:ring-primary-100',
        )}
      >
        <TicketPercent className={cn('size-4 shrink-0', error ? 'text-rose-400' : 'text-slate-400')} />
        <input
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase().replace(/\s/g, ''))
            if (error) setError(null)
          }}
          placeholder="Nhập mã giảm giá"
          maxLength={30}
          className="h-full w-full min-w-0 bg-transparent text-sm font-semibold tracking-wide text-slate-800 uppercase outline-none placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 placeholder:normal-case"
        />
        <button
          type="submit"
          disabled={!code.trim() || loading}
          className="flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-md bg-primary-600 px-3 text-xs font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
        >
          {loading && <LoaderCircle className="size-3.5 animate-spin" />}
          Áp dụng
        </button>
      </div>
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-rose-500">
          <CircleAlert className="size-3.5" /> {error}
        </p>
      )}
    </form>
  )
})
