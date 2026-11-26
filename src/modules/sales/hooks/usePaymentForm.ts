import { useMemo, useState } from 'react'
import type { PaymentInput } from '@/modules/orders/types/orders.types'

export type NonCashMethod = 'transfer' | 'card' | 'ewallet'
export type PaymentChoice = 'cash' | NonCashMethod
export type PaymentFormStatus = 'ready' | 'empty' | 'shortfall'

const isConfirmed = (method: NonCashMethod, received: boolean) => method === 'card' || received

export function usePaymentForm(due: number) {
  const [method, setMethodState] = useState<PaymentChoice>('cash')
  const [tendered, setTendered] = useState(0)
  const [cashPart, setCashPart] = useState<number | null>(null)
  const [reference, setReference] = useState('')
  const [received, setReceived] = useState(false)

  const split = cashPart !== null && cashPart > 0 && cashPart < due
  const nonCashMethod: NonCashMethod | null = method === 'cash' ? null : method

  const result = useMemo(() => {
    const ref = reference.trim() || undefined
    if (due <= 0) return { payments: [] as PaymentInput[], status: 'ready' as PaymentFormStatus, change: 0, shortfall: 0, rest: 0, pending: false }
    if (split && nonCashMethod) {
      const rest = due - (cashPart ?? 0)
      return {
        payments: [
          { method: 'cash', amount: cashPart, tendered: cashPart },
          { method: nonCashMethod, amount: rest, reference: ref, confirmed: isConfirmed(nonCashMethod, received) },
        ] as PaymentInput[],
        status: 'ready' as PaymentFormStatus,
        change: 0,
        shortfall: 0,
        rest,
        pending: !isConfirmed(nonCashMethod, received),
      }
    }
    if (nonCashMethod) {
      return {
        payments: [{ method: nonCashMethod, amount: due, reference: ref, confirmed: isConfirmed(nonCashMethod, received) }] as PaymentInput[],
        status: 'ready' as PaymentFormStatus,
        change: 0,
        shortfall: 0,
        rest: 0,
        pending: !isConfirmed(nonCashMethod, received),
      }
    }
    const shortfall = Math.max(0, due - tendered)
    return {
      payments: [{ method: 'cash', amount: due, tendered }] as PaymentInput[],
      status: (tendered <= 0 ? 'empty' : shortfall > 0 ? 'shortfall' : 'ready') as PaymentFormStatus,
      change: Math.max(0, tendered - due),
      shortfall,
      rest: 0,
      pending: false,
    }
  }, [due, split, cashPart, nonCashMethod, tendered, reference, received])

  const resetNonCash = () => {
    setReference('')
    setReceived(false)
  }

  return {
    method,
    setMethod: (next: PaymentChoice) => {
      setMethodState(next)
      resetNonCash()
    },
    tendered,
    setTendered,
    split,
    cashPart: cashPart ?? 0,
    payRestWithOther: () => {
      setCashPart(tendered)
      setMethodState('transfer')
      resetNonCash()
    },
    editCash: () => {
      setCashPart(null)
      setMethodState('cash')
      resetNonCash()
    },
    reference,
    setReference,
    received,
    setReceived,
    nonCashMethod,
    ...result,
  }
}
