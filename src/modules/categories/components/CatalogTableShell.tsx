import type { ReactNode } from 'react'
import { PackageSearch } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/cn'

export interface CatalogColumn {
  label: string
  className?: string
}

interface CatalogTableShellProps {
  columns: CatalogColumn[]
  loading: boolean
  empty: boolean
  emptyTitle: string
  emptyDescription: string
  emptyAction?: ReactNode
  children: ReactNode
}

export const Td = ({ children, className }: { children: ReactNode; className?: string }) => (
  <td className={cn('px-4 py-3 align-middle', className)}>{children}</td>
)

export function CatalogTableShell({ columns, loading, empty, emptyTitle, emptyDescription, emptyAction, children }: CatalogTableShellProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] text-sm">
        <thead>
          <tr className="bg-slate-50 text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            {columns.map((c, i) => (
              <th key={i} className={cn('px-4 py-3 whitespace-nowrap', c.className)}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((_, j) => (
                    <Td key={j}>
                      <div className={cn('h-4 animate-pulse rounded bg-slate-100', j === 1 ? 'w-48' : 'w-16')} />
                    </Td>
                  ))}
                </tr>
              ))
            : children}
        </tbody>
      </table>
      {!loading && empty && (
        <EmptyState icon={<PackageSearch />} title={emptyTitle} description={emptyDescription} action={emptyAction} className="py-14" />
      )}
    </div>
  )
}

export function RowActionButton({ onClick, title, danger, children }: { onClick: () => void; title: string; danger?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={cn(
        'grid size-8 cursor-pointer place-items-center rounded-lg text-slate-400 transition',
        danger ? 'hover:bg-rose-50 hover:text-rose-500' : 'hover:bg-primary-50 hover:text-primary-600',
      )}
    >
      {children}
    </button>
  )
}
