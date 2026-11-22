import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import { formatNumber } from '@/lib/format'

interface PaginationProps {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  unit?: string
  className?: string
}

const getPages = (page: number, totalPages: number): (number | '…')[] => {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
  const pages: (number | '…')[] = [1]
  const start = Math.max(2, page - 1)
  const end = Math.min(totalPages - 1, page + 1)
  if (start > 2) pages.push('…')
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < totalPages - 1) pages.push('…')
  pages.push(totalPages)
  return pages
}

export function Pagination({ page, pageSize, total, onPageChange, unit = 'bản ghi', className }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  const navBtn =
    'grid size-9 cursor-pointer place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200'

  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-3', className)}>
      <p className="text-sm text-slate-500">
        Hiển thị <span className="font-semibold text-slate-800">{formatNumber(from)}</span>–
        <span className="font-semibold text-slate-800">{formatNumber(to)}</span> trong{' '}
        <span className="font-semibold text-slate-800">{formatNumber(total)}</span> {unit}
      </p>
      <nav className="flex items-center gap-1.5" aria-label="Phân trang">
        <button className={navBtn} disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="Trang trước">
          <ChevronLeft className="size-4" />
        </button>
        {getPages(page, totalPages).map((p, i) =>
          p === '…' ? (
            <span key={`e${i}`} className="grid size-9 place-items-center text-sm text-slate-400">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              aria-current={p === page ? 'page' : undefined}
              className={cn(
                'grid size-9 cursor-pointer place-items-center rounded-lg text-sm font-semibold transition',
                p === page ? 'bg-primary-600 text-white shadow-primary' : 'text-slate-600 hover:bg-slate-100',
              )}
            >
              {p}
            </button>
          ),
        )}
        <button
          className={navBtn}
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Trang sau"
        >
          <ChevronRight className="size-4" />
        </button>
      </nav>
    </div>
  )
}
