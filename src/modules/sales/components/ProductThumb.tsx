import { Apple, Cookie, CupSoda, Milk, Package, Soup, SprayCan, WashingMachine, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { Product } from '@/modules/sales/types/sales.types'

const VISUALS: Record<Product['categoryId'], { icon: LucideIcon; className: string }> = {
  drinks: { icon: CupSoda, className: 'from-sky-50 to-sky-100 text-sky-600' },
  snacks: { icon: Cookie, className: 'from-amber-50 to-orange-100 text-amber-600' },
  dairy: { icon: Milk, className: 'from-indigo-50 to-blue-100 text-indigo-500' },
  instant: { icon: Soup, className: 'from-orange-50 to-red-100 text-orange-600' },
  fruit: { icon: Apple, className: 'from-lime-50 to-green-100 text-green-600' },
  personal: { icon: SprayCan, className: 'from-pink-50 to-fuchsia-100 text-pink-600' },
  household: { icon: WashingMachine, className: 'from-teal-50 to-cyan-100 text-teal-600' },
}

interface ProductThumbProps {
  categoryId: Product['categoryId']
  size?: 'sm' | 'lg'
  className?: string
}

export function ProductThumb({ categoryId, size = 'lg', className }: ProductThumbProps) {
  const visual = VISUALS[categoryId] ?? { icon: Package, className: 'from-slate-50 to-slate-100 text-slate-500' }
  const Icon = visual.icon
  return (
    <div
      className={cn(
        'grid place-items-center bg-gradient-to-br',
        visual.className,
        size === 'lg' ? 'aspect-[4/3] w-full rounded-lg' : 'size-12 shrink-0 rounded-lg',
        className,
      )}
    >
      <Icon className={size === 'lg' ? 'size-10 drop-shadow-sm' : 'size-5'} strokeWidth={1.75} />
    </div>
  )
}
