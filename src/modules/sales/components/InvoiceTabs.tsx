import { Plus, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { Invoice } from '@/modules/sales/types/sales.types'

interface InvoiceTabsProps {
  invoices: Invoice[]
  activeId: string
  onSwitch: (id: string) => void
  onAdd: () => void
  onClose: (id: string) => void
}

export function InvoiceTabs({ invoices, activeId, onSwitch, onAdd, onClose }: InvoiceTabsProps) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="scrollbar-none flex flex-1 gap-1.5 overflow-x-auto">
        {invoices.map((inv) => {
          const active = inv.id === activeId
          const count = inv.items.reduce((s, i) => s + i.quantity, 0)
          return (
            <div
              key={inv.id}
              onClick={() => onSwitch(inv.id)}
              className={cn(
                'group flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg pr-1.5 pl-3 text-[13px] font-semibold transition',
                active ? 'bg-primary-50 text-primary-700 ring-1 ring-primary-200' : 'text-slate-500 hover:bg-slate-100',
              )}
            >
              {inv.name}
              {count > 0 && (
                <span
                  className={cn(
                    'rounded-full px-1.5 text-[10px] leading-4',
                    active ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-600',
                  )}
                >
                  {count}
                </span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onClose(inv.id)
                }}
                className="grid size-5 cursor-pointer place-items-center rounded text-slate-400 opacity-60 hover:bg-white hover:text-rose-500 hover:opacity-100"
                aria-label={`Đóng ${inv.name}`}
              >
                <X className="size-3.5" />
              </button>
            </div>
          )
        })}
      </div>
      <button
        onClick={onAdd}
        title="Thêm hóa đơn (F4)"
        className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg border border-dashed border-slate-300 text-slate-500 transition hover:border-primary-400 hover:bg-primary-50 hover:text-primary-600"
      >
        <Plus className="size-4" />
      </button>
    </div>
  )
}
