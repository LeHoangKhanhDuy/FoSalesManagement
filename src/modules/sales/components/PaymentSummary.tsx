import { memo, type ReactNode } from 'react'
import { CircleAlert, Coins } from 'lucide-react'
import { RetryButton } from '@/components/common/RetryButton'
import { cn } from '@/lib/cn'
import { formatCurrency, formatNumber, parseNumber } from '@/lib/format'
import type { OrderQuote } from '@/modules/orders/types/orders.types'
import type { Customer } from '@/modules/sales/types/sales.types'

interface PaymentSummaryProps {
  quote: OrderQuote | null
  loading: boolean
  syncing: boolean
  error?: string
  stockWarning?: string
  customer: Customer | null
  voucherCode?: string
  redeemPoints: number
  onRedeemChange: (points: number) => void
  onRetry: () => void
}

const Line = ({ label, value }: { label: ReactNode; value: number }) =>
  value > 0 ? (
    <div className="flex justify-between gap-3 text-primary-100">
      <dt className="truncate">{label}</dt>
      <dd className="shrink-0">-{formatCurrency(value)}</dd>
    </div>
  ) : null

export const PaymentSummary = memo(function PaymentSummary(props: PaymentSummaryProps) {
  const { quote, loading, syncing, error, stockWarning, customer, voucherCode, redeemPoints, onRedeemChange, onRetry } = props

  if (error) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg bg-rose-50 p-4 text-sm text-rose-600">
        <span className="flex items-center gap-2">
          <CircleAlert className="size-4 shrink-0" /> {error}
        </span>
        <RetryButton onClick={onRetry} />
      </div>
    )
  }

  if (loading || !quote) return <div className="h-[132px] animate-pulse rounded-lg bg-primary-100" />

  const t = quote.totals
  const maxPoints = Math.min(quote.maxRedeemPoints, customer?.points ?? 0)

  return (
    <>
      <div className={cn('rounded-lg bg-gradient-to-br from-primary-600 to-primary-800 p-5 text-white transition-opacity', syncing && 'opacity-80')}>
        <p className="text-sm text-primary-100">Khách cần trả</p>
        <p className="mt-1 text-3xl font-extrabold tracking-tight">{formatCurrency(t.due)}</p>
        <dl className="mt-3 space-y-1 border-t border-white/15 pt-3 text-xs">
          <div className="flex justify-between text-primary-100">
            <dt>Tạm tính ({t.itemCount} sản phẩm)</dt>
            <dd>{formatCurrency(t.subtotal)}</dd>
          </div>
          <Line label="Khuyến mãi sản phẩm" value={t.productDiscount} />
          <Line label="Khuyến mãi đơn" value={t.orderDiscount} />
          <Line label="Ưu đãi hạng thành viên" value={t.memberDiscount} />
          <Line label={`Mã giảm giá${voucherCode ? ` ${voucherCode}` : ''}`} value={t.voucherDiscount} />
          <Line label={`Dùng ${formatNumber(redeemPoints)} điểm`} value={t.pointsDiscount} />
          {quote.pointsToEarn > 0 && customer && (
            <div className="flex justify-between text-amber-200">
              <dt>Điểm tích lũy đơn này</dt>
              <dd>+{formatNumber(quote.pointsToEarn)} điểm</dd>
            </div>
          )}
        </dl>
      </div>

      {quote.voucherIssue && (
        <p className="mt-3 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
          <CircleAlert className="size-4 shrink-0" /> {quote.voucherIssue}
        </p>
      )}
      {stockWarning && (
        <p className="mt-3 flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
          <CircleAlert className="size-4 shrink-0" /> Không đủ tồn kho: {stockWarning}
        </p>
      )}

      {customer && maxPoints > 0 && (
        <div className="mt-3 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2">
          <Coins className="size-5 shrink-0 text-amber-500" />
          <div className="min-w-0 flex-1 text-xs">
            <p className="font-semibold text-slate-800">Dùng điểm</p>
            <p className="text-slate-500">
              Có {formatNumber(customer.points)} điểm | Tối đa: {formatNumber(maxPoints)}
            </p>
          </div>
          <input
            inputMode="numeric"
            value={redeemPoints ? formatNumber(redeemPoints) : ''}
            onChange={(e) => onRedeemChange(Math.min(maxPoints, parseNumber(e.target.value)))}
            placeholder="0"
            aria-label="Số điểm sử dụng"
            className="h-9 w-24 rounded-lg border border-slate-200 bg-white px-2 text-right text-sm font-semibold outline-none focus:border-primary-500"
          />
          <button
            type="button"
            onClick={() => onRedeemChange(redeemPoints === maxPoints ? 0 : maxPoints)}
            className="h-9 cursor-pointer rounded-lg px-2 text-xs font-semibold text-amber-700 hover:bg-amber-100"
          >
            {redeemPoints === maxPoints ? 'Bỏ' : 'Tối đa'}
          </button>
        </div>
      )}
    </>
  )
})
