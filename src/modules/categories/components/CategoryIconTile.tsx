import { cn } from '@/lib/cn'
import { getCategoryVisual } from '@/modules/categories/utils/category-visuals'

interface CategoryIconTileProps {
  icon?: string
  color?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZES = {
  sm: { box: 'size-8 rounded-lg', icon: 'size-4' },
  md: { box: 'size-11 rounded-lg', icon: 'size-5' },
  lg: { box: 'size-16 rounded-xl', icon: 'size-7' },
}

export function CategoryIconTile({ icon, color, size = 'md', className }: CategoryIconTileProps) {
  const visual = getCategoryVisual('', { icon, color })
  const Icon = visual.icon
  return (
    <span className={cn('grid shrink-0 place-items-center bg-gradient-to-br', visual.color.tone, SIZES[size].box, className)}>
      <Icon className={SIZES[size].icon} strokeWidth={1.75} />
    </span>
  )
}
