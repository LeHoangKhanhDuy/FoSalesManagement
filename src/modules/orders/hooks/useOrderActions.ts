import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'
import { errorMessage, HttpError } from '@/lib/http'
import { ordersService } from '@/modules/orders/services/orders.service'
import type { OrderAction, OrderActionInput, OrderPayment, OrderSummary } from '@/modules/orders/types/orders.types'

export interface OrderActionTarget {
  order: OrderSummary
  action: OrderAction
  payments?: OrderPayment[]
}

const SUCCESS: Record<OrderAction, (code: string) => string> = {
  cancel: (code) => `Đã hủy đơn ${code}`,
  refund: (code) => `Đã hoàn tiền đơn ${code}`,
  confirm: (code) => `Đã xác nhận thanh toán đơn ${code}`,
}

const confirmPending = async (id: string, known: OrderPayment[] | undefined, reference: string, key: string) => {
  const payments = known ?? (await ordersService.get(id)).payments
  const pending = payments.filter((p) => p.status === 'pending')
  const ref = reference.trim() || undefined
  if (pending.length === 0) return ordersService.confirmPayment(id, { reference: ref }, key)
  for (const p of pending) await ordersService.confirmPayment(id, { paymentId: p.id, reference: ref }, `${key}:${p.id}`)
}

export function useOrderActions(callbacks: { onDone: (orderId: string) => void }) {
  const handlers = useRef(callbacks)
  handlers.current = callbacks
  const [target, setTarget] = useState<OrderActionTarget | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const key = useRef('')

  const request = useCallback((order: OrderSummary, action: OrderAction, payments?: OrderPayment[]) => {
    key.current = crypto.randomUUID()
    setTarget({ order, action, payments })
  }, [])

  const close = useCallback(() => {
    if (!submitting) setTarget(null)
  }, [submitting])

  const submit = async ({ reason, reference, refundMethod }: OrderActionInput) => {
    if (!target) return
    const { order, action, payments } = target
    setSubmitting(true)
    try {
      if (action === 'cancel') await ordersService.cancel(order.id, reason.trim(), key.current)
      else if (action === 'refund')
        await ordersService.refund(order.id, { reason: reason.trim(), refundMethod, refundReference: reference.trim() || undefined }, key.current)
      else await confirmPending(order.id, payments, reference, key.current)
      toast.success(SUCCESS[action](order.code))
      setTarget(null)
      handlers.current.onDone(order.id)
    } catch (e) {
      if (e instanceof HttpError) key.current = crypto.randomUUID()
      if (e instanceof HttpError && (e.code === 'ORDER_INVALID_STATUS' || e.status === 404)) {
        setTarget(null)
        handlers.current.onDone(order.id)
      }
      toast.error(errorMessage(e, 'Thao tác thất bại, vui lòng thử lại'))
    } finally {
      setSubmitting(false)
    }
  }

  return { target, submitting, request, close, submit }
}
