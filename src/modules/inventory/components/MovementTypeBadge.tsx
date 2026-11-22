import { Badge } from '@/components/ui/Badge'
import type { MovementType } from '@/modules/inventory/types/inventory.types'
import { MOVEMENT_TYPES } from '@/modules/inventory/utils/inventory.utils'

export function MovementTypeBadge({ type }: { type: MovementType }) {
  const config = MOVEMENT_TYPES[type]
  const Icon = config.icon
  return (
    <Badge tone={config.tone} className="whitespace-nowrap">
      <Icon className="size-3" /> {config.label}
    </Badge>
  )
}

export function QuantityChange({ value }: { value: number }) {
  return (
    <span className={value > 0 ? 'font-bold text-primary-600' : value < 0 ? 'font-bold text-rose-500' : 'font-bold text-slate-400'}>
      {value > 0 ? `+${value}` : value}
    </span>
  )
}
