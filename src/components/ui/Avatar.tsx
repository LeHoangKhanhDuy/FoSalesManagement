import { cn } from '@/lib/cn'
import { getInitials } from '@/lib/format'

const palette = [
  'bg-primary-100 text-primary-700',
  'bg-sky-100 text-sky-700',
  'bg-violet-100 text-violet-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
]

export function Avatar({ name, className }: { name: string; className?: string }) {
  const color = palette[name.length % palette.length]
  return (
    <span className={cn('grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold', color, className)}>
      {getInitials(name)}
    </span>
  )
}
