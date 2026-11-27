import { useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/useDebounce'
import { useQuery } from '@/hooks/useQuery'
import { errorMessage, HttpError } from '@/lib/http'
import { playVoice } from '@/lib/sound'
import { ordersService, toOrderQuote } from '@/modules/orders/services/orders.service'
import type { OrderDetail, PaymentInput, QuoteRequest, StockWarning } from '@/modules/orders/types/orders.types'
import type { Invoice } from '@/modules/sales/types/sales.types'

const detailsOf = (e: HttpError) => (e.data as { details?: unknown } | undefined)?.details

export const describeStockWarnings = (warnings: StockWarning[], items: Invoice['items']) =>
  warnings
    .map((w) => {
      const name = items.find((i) => i.productId === w.productId)?.name ?? 'Sản phẩm'
      return `${name} (còn ${w.available})`
    })
    .join(', ')

export function useCheckout(invoice: Invoice, onCreated: (order: OrderDetail) => void) {
  const [redeemPoints, setRedeemPoints] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const points = useDebounce(redeemPoints, 400)
  const key = useRef(crypto.randomUUID())
  const created = useRef(onCreated)
  created.current = onCreated

  const request = useMemo<QuoteRequest>(
    () => ({
      items: invoice.items.map(({ productId, quantity }) => ({ productId, quantity })),
      customerId: invoice.customer?.id,
      voucherCode: invoice.voucher?.code,
      redeemPoints: points > 0 ? points : undefined,
    }),
    [invoice.items, invoice.customer?.id, invoice.voucher?.code, points],
  )

  const quote = useQuery(ordersService.quote, request, { errorText: 'Không lấy được báo giá từ máy chủ' })
  const syncing = quote.loading || redeemPoints !== points

  const submit = async (payments: PaymentInput[]) => {
    if (!quote.data || syncing || submitting) return
    setSubmitting(true)
    try {
      const result = await ordersService.create(
        { ...request, payments, note: invoice.note.trim() || undefined, expectedTotal: quote.data.totals.total },
        key.current,
      )
      setOrder(result)
      created.current(result)
      if (result.status !== 'pending') playVoice('thankYou')
      toast.success(result.status === 'pending' ? `Đã tạo đơn ${result.code} — chờ xác nhận chuyển khoản` : `Thanh toán thành công đơn ${result.code}`)
    } catch (e) {
      if (!(e instanceof HttpError)) {
        toast.error(errorMessage(e, 'Mất kết nối, bấm thanh toán lại để thử tiếp'))
        return
      }
      key.current = crypto.randomUUID()
      const details = detailsOf(e)
      if (e.code === 'ORDER_TOTAL_CHANGED' && details) {
        quote.setData(toOrderQuote(details as Parameters<typeof toOrderQuote>[0]))
        toast.warning('Giá đơn hàng vừa thay đổi, vui lòng kiểm tra lại số tiền')
      } else if (e.code === 'ORDER_OUT_OF_STOCK') {
        const warnings = (details as { items?: StockWarning[] } | undefined)?.items ?? []
        toast.error(warnings.length ? `Không đủ hàng: ${describeStockWarnings(warnings, invoice.items)}` : e.message)
      } else {
        toast.error(e.message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return {
    quote: quote.data,
    quoteError: quote.data ? undefined : quote.error,
    quoteLoading: quote.initialLoading,
    syncing,
    reloadQuote: quote.reload,
    redeemPoints,
    setRedeemPoints,
    submitting,
    order,
    submit,
  }
}
