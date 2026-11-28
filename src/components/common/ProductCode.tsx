import type { ReactNode } from 'react'
import { Barcode } from 'lucide-react'
import { cn } from '@/lib/cn'

interface ProductCodeProps {
  sku?: string
  barcode?: string
  extra?: ReactNode
  className?: string
}

export function ProductCode({barcode, extra, className }: ProductCodeProps) {
  return (
    <span className={cn('flex min-w-0 items-center gap-1.5 text-xs text-slate-400', className)}>
      {barcode && (
        <span className="inline-flex shrink-0 items-center gap-1 tabular-nums" title={`Mã vạch ${barcode}`}>
          <Barcode className="size-3 shrink-0" />
          {barcode}
        </span>
      )}
      {extra && (
        <>
          <span className="shrink-0 text-slate-300">|</span>
          <span className="truncate">{extra}</span>
        </>
      )}
    </span>
  )
}
