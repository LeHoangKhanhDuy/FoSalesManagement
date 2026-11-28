import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { ReceivingCheckIn } from '@/modules/purchasing/components/ReceivingCheckIn'
import { ReceivingCount } from '@/modules/purchasing/components/ReceivingCount'
import { ReceivingDone } from '@/modules/purchasing/components/ReceivingDone'
import { ReceivingReview } from '@/modules/purchasing/components/ReceivingReview'
import { useReceiving } from '@/modules/purchasing/hooks/useReceiving'
import type { PurchaseOrder } from '@/modules/purchasing/types/purchasing.types'
import type { Product } from '@/modules/sales/types/sales.types'

const STEPS = [
  { value: 'check-in', label: 'Tiếp nhận' },
  { value: 'count', label: 'Quét & kiểm đếm' },
  { value: 'review', label: 'Đối chiếu & nhập kho' },
] as const

interface Props {
  order: PurchaseOrder | null
  products: Product[]
  onUpdate: (order: PurchaseOrder, stockChanged?: boolean) => void
  onClose: () => void
}

export function ReceivingScreen({ order, ...props }: Props) {
  if (!order) return null
  return <Screen key={order.id} order={order} {...props} />
}

function Screen({ order, products, onUpdate, onClose }: Props & { order: PurchaseOrder }) {
  const [initialOrder] = useState(order)
  const receiving = useReceiving({ order: initialOrder, products, onUpdate, onClose })
  const { draft, receipt } = receiving
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const stepIndex = receipt ? 3 : STEPS.findIndex((s) => s.value === draft.step)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return createPortal(
    <div className="fixed inset-0 z-[60] flex animate-fade-in flex-col bg-slate-100">
      <header className="flex h-16 shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-5">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-wider text-primary-600 uppercase">Nhận hàng</p>
          <p className="truncate text-sm font-bold text-slate-900">
            {order.code} · {order.supplierName}
          </p>
        </div>
        <ol className="mx-auto hidden items-center gap-2 md:flex">
          {STEPS.map((s, i) => {
            const done = i < stepIndex
            const active = i === stepIndex
            return (
              <li key={s.value} className="flex items-center gap-2">
                {i > 0 && <span className={cn('h-px w-8', done || active ? 'bg-primary-400' : 'bg-slate-200')} />}
                <span
                  className={cn(
                    'grid size-7 place-items-center rounded-full text-xs font-bold',
                    done ? 'bg-primary-600 text-white' : active ? 'bg-primary-50 text-primary-700 ring-2 ring-primary-500' : 'bg-slate-100 text-slate-400',
                  )}
                >
                  {done ? <Check className="size-4" /> : i + 1}
                </span>
                <span className={cn('text-sm font-semibold', active ? 'text-slate-900' : done ? 'text-primary-700' : 'text-slate-400')}>{s.label}</span>
              </li>
            )
          })}
        </ol>
        <div className="ml-auto flex items-center gap-2">
          {!receipt && draft.step !== 'check-in' && (
            <>
              <button
                onClick={() => (confirmDiscard ? receiving.discard() : setConfirmDiscard(true))}
                onBlur={() => setConfirmDiscard(false)}
                className={cn('flex h-9 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition', confirmDiscard ? 'bg-rose-600 text-white' : 'text-slate-500 hover:bg-rose-50 hover:text-rose-600')}
              >
                {confirmDiscard ? 'Bấm lần nữa để hủy' : 'Hủy phiên'}
              </button>
              <button onClick={receiving.pause} className="flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Lưu tạm & thoát
              </button>
            </>
          )}
          <button onClick={receipt || draft.step === 'check-in' ? onClose : receiving.pause} className="grid size-9 cursor-pointer place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Đóng">
            <X className="size-5" />
          </button>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {receipt ? (
          <ReceivingDone receipt={receipt} order={order} onClose={onClose} />
        ) : draft.step === 'check-in' ? (
          <ReceivingCheckIn order={order} draft={draft} receiving={receiving} />
        ) : draft.step === 'count' ? (
          <ReceivingCount receiving={receiving} />
        ) : (
          <ReceivingReview receiving={receiving} />
        )}
      </main>
    </div>,
    document.body,
  )
}
