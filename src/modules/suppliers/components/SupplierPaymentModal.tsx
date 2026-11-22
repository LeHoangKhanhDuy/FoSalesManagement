import { Banknote, Landmark } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Field, inputClass, NumberInput } from '@/components/ui/FormField'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/cn'
import { formatCurrency } from '@/lib/format'
import { useSupplierPaymentForm } from '@/modules/suppliers/hooks/useSupplierPaymentForm'
import type { PaymentFormValues, PaymentMethod, Supplier, SupplierSummary } from '@/modules/suppliers/types/suppliers.types'

interface Props {
  supplier: Supplier | null
  summary?: SupplierSummary
  paying: boolean
  onClose: () => void
  onConfirm: (v: PaymentFormValues) => void
}

const METHODS: { value: PaymentMethod; label: string; icon: typeof Banknote }[] = [
  { value: 'transfer', label: 'Chuyển khoản', icon: Landmark },
  { value: 'cash', label: 'Tiền mặt', icon: Banknote },
]

export function SupplierPaymentModal({ supplier, summary, ...rest }: Props) {
  if (!supplier || !summary) return null
  return <PaymentContent key={supplier.id} supplier={supplier} summary={summary} {...rest} />
}

function PaymentContent({ supplier, summary, paying, onClose, onConfirm }: Omit<Props, 'supplier' | 'summary'> & { supplier: Supplier; summary: SupplierSummary }) {
  const form = useSupplierPaymentForm(summary.debt, summary.overdue, onConfirm)
  const { values } = form

  return (
    <Modal
      open
      onClose={onClose}
      title="Thanh toán nhà cung cấp"
      description={`${supplier.code} · ${supplier.name}`}
      className="max-w-lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={paying}>
            Hủy
          </Button>
          <Button onClick={form.submit} loading={paying}>
            Xác nhận thanh toán
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-amber-50 p-3">
          <p className="text-[11px] text-amber-700">Công nợ hiện tại</p>
          <p className="text-lg font-bold text-amber-700">{formatCurrency(summary.debt)}</p>
        </div>
        <div className={cn('rounded-lg p-3', summary.overdue ? 'bg-rose-50' : 'bg-slate-50')}>
          <p className={cn('text-[11px]', summary.overdue ? 'text-rose-600' : 'text-slate-500')}>Đã quá hạn</p>
          <p className={cn('text-lg font-bold', summary.overdue ? 'text-rose-600' : 'text-slate-400')}>{formatCurrency(summary.overdue)}</p>
        </div>
      </div>

      <Field label="Số tiền thanh toán" required error={form.error} className="mt-4">
        <NumberInput value={values.amount} onChange={form.setAmount} error={form.error} suffix="đ" className="h-12 text-lg" />
      </Field>
      <div className="mt-2 flex flex-wrap gap-2">
        {form.quick.map((q) => (
          <button
            key={q.label}
            type="button"
            onClick={() => form.setAmount(q.value)}
            className={cn('h-8 cursor-pointer rounded-full border px-3 text-xs font-semibold', values.amount === q.value ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-600 hover:border-slate-300')}
          >
            {q.label} · {formatCurrency(q.value)}
          </button>
        ))}
      </div>

      <p className="mt-4 mb-1.5 text-xs font-semibold text-slate-700">Hình thức</p>
      <div className="grid grid-cols-2 gap-2">
        {METHODS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => form.setMethod(value)}
            className={cn('flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border text-sm font-semibold transition', values.method === value ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-600 hover:border-slate-300')}
          >
            <Icon className="size-4" /> {label}
          </button>
        ))}
      </div>
      {values.method === 'transfer' && (
        <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
          {supplier.bankAccount ? (
            <p>
              Chuyển đến <span className="font-semibold text-slate-800">{supplier.bankName}</span> · <span className="font-semibold text-slate-800">{supplier.bankAccount}</span>
              {supplier.bankHolder && ` · ${supplier.bankHolder}`}
            </p>
          ) : (
            <p>Nhà cung cấp chưa có thông tin tài khoản ngân hàng.</p>
          )}
          <input value={values.reference} onChange={(e) => form.setReference(e.target.value)} placeholder="Mã giao dịch ngân hàng (không bắt buộc)" className={cn(inputClass(), 'mt-2 h-9')} />
        </div>
      )}
      <input value={values.note} onChange={(e) => form.setNote(e.target.value)} placeholder="Ghi chú phiếu chi..." className={cn(inputClass(), 'mt-3')} />
      <p className="mt-3 text-right text-sm text-slate-500">
        Còn nợ sau thanh toán: <span className="font-bold text-slate-900">{formatCurrency(form.remaining)}</span>
      </p>
    </Modal>
  )
}
