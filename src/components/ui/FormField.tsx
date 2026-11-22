import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { formatNumber, parseNumber } from '@/lib/format'

export const inputClass = (error?: string) =>
  cn(
    'h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-4',
    error ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-100',
  )

interface FieldProps {
  label: string
  required?: boolean
  error?: string
  hint?: ReactNode
  children: ReactNode
  className?: string
}

export function Field({ label, required, error, hint, children, className }: FieldProps) {
  return (
    <div className={cn('block', className)}>
      <span className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-700">
        <span>
          {label} {required && <span className="text-rose-500">*</span>}
        </span>
        {hint}
      </span>
      {children}
      {error && <span className="mt-1 block text-[11px] font-medium text-rose-500">{error}</span>}
    </div>
  )
}

interface NumberInputProps {
  value: number
  onChange: (value: number) => void
  error?: string
  placeholder?: string
  suffix?: string
  className?: string
}

export function NumberInput({ value, onChange, error, placeholder = '0', suffix, className }: NumberInputProps) {
  return (
    <div className="relative">
      <input
        inputMode="numeric"
        value={value ? formatNumber(value) : ''}
        onChange={(e) => onChange(parseNumber(e.target.value))}
        placeholder={placeholder}
        className={cn(inputClass(error), 'text-right font-semibold', suffix && 'pr-8', className)}
      />
      {suffix && <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-slate-400">{suffix}</span>}
    </div>
  )
}

export function FormSection({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="mt-6 first:mt-0">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  )
}
