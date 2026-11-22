import { cn } from '@/lib/cn'
import type { Category, CategoryId } from '@/modules/sales/types/sales.types'

interface CategoryTabsProps {
  categories: Category[]
  value: CategoryId
  counts: Partial<Record<CategoryId, number>>
  onChange: (id: CategoryId) => void
}

export function CategoryTabs({ categories, value, counts, onChange }: CategoryTabsProps) {
  return (
    <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 py-0.5">
      {categories.map((c) => {
        const active = c.id === value
        return (
          <button
            key={c.id}
            onClick={() => onChange(c.id)}
            className={cn(
              'flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-lg border px-3.5 text-[13px] font-semibold transition-all',
              active
                ? 'border-primary-600 bg-primary-600 text-white shadow-primary'
                : 'border-slate-200 bg-white text-slate-600 hover:border-primary-300 hover:text-primary-700',
            )}
          >
            {c.name}
            <span
              className={cn(
                'rounded-lg px-1.5 text-[11px] leading-[18px]',
                active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500',
              )}
            >
              {counts[c.id] ?? 0}
            </span>
          </button>
        )
      })}
    </div>
  )
}
