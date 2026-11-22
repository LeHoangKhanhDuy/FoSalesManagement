import {
  Apple,
  Baby,
  Beef,
  Beer,
  Cake,
  Candy,
  Coffee,
  Cookie,
  CupSoda,
  Fish,
  Gift,
  IceCreamCone,
  Milk,
  Package,
  PawPrint,
  Pill,
  Sandwich,
  Shirt,
  Soup,
  Sparkles,
  SprayCan,
  WashingMachine,
  Wheat,
  Wine,
  type LucideIcon,
} from 'lucide-react'
import type { Category, ImageFit } from '@/modules/sales/types/sales.types'

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  package: Package,
  'cup-soda': CupSoda,
  coffee: Coffee,
  milk: Milk,
  beer: Beer,
  wine: Wine,
  cookie: Cookie,
  candy: Candy,
  cake: Cake,
  'ice-cream': IceCreamCone,
  sandwich: Sandwich,
  soup: Soup,
  wheat: Wheat,
  apple: Apple,
  beef: Beef,
  fish: Fish,
  'spray-can': SprayCan,
  'washing-machine': WashingMachine,
  sparkles: Sparkles,
  pill: Pill,
  baby: Baby,
  'paw-print': PawPrint,
  shirt: Shirt,
  gift: Gift,
}

export const CATEGORY_COLORS: Record<string, { label: string; tone: string; swatch: string; soft: string }> = {
  slate: { label: 'Xám', tone: 'from-slate-50 to-slate-100 text-slate-500', swatch: 'bg-slate-400', soft: 'bg-slate-100 text-slate-600' },
  sky: { label: 'Xanh trời', tone: 'from-sky-50 to-sky-100 text-sky-600', swatch: 'bg-sky-500', soft: 'bg-sky-50 text-sky-600' },
  indigo: { label: 'Chàm', tone: 'from-indigo-50 to-blue-100 text-indigo-500', swatch: 'bg-indigo-500', soft: 'bg-indigo-50 text-indigo-600' },
  violet: { label: 'Tím', tone: 'from-violet-50 to-purple-100 text-violet-600', swatch: 'bg-violet-500', soft: 'bg-violet-50 text-violet-600' },
  pink: { label: 'Hồng', tone: 'from-pink-50 to-fuchsia-100 text-pink-600', swatch: 'bg-pink-500', soft: 'bg-pink-50 text-pink-600' },
  rose: { label: 'Đỏ', tone: 'from-rose-50 to-red-100 text-rose-600', swatch: 'bg-rose-500', soft: 'bg-rose-50 text-rose-600' },
  orange: { label: 'Cam', tone: 'from-orange-50 to-red-100 text-orange-600', swatch: 'bg-orange-500', soft: 'bg-orange-50 text-orange-600' },
  amber: { label: 'Vàng', tone: 'from-amber-50 to-orange-100 text-amber-600', swatch: 'bg-amber-500', soft: 'bg-amber-50 text-amber-600' },
  lime: { label: 'Xanh lá', tone: 'from-lime-50 to-green-100 text-green-600', swatch: 'bg-green-500', soft: 'bg-green-50 text-green-600' },
  teal: { label: 'Xanh ngọc', tone: 'from-teal-50 to-cyan-100 text-teal-600', swatch: 'bg-teal-500', soft: 'bg-teal-50 text-teal-600' },
}

export const DEFAULT_ICON = 'package'
export const DEFAULT_COLOR = 'slate'

const DEFAULT_FIT: Record<string, ImageFit> = {
  drinks: 'contain',
  dairy: 'contain',
  fruit: 'cover',
  personal: 'contain',
  household: 'contain',
}

const registry = new Map<string, { icon: string; color: string }>()

export const registerCategoryVisuals = (categories: Category[]) => {
  categories.forEach((c) => {
    if (c.id !== 'all') registry.set(c.id, { icon: c.icon ?? DEFAULT_ICON, color: c.color ?? DEFAULT_COLOR })
  })
}

export const getCategoryVisual = (categoryId: string, override?: { icon?: string; color?: string }) => {
  const saved = registry.get(categoryId)
  const iconKey = override?.icon ?? saved?.icon ?? DEFAULT_ICON
  const colorKey = override?.color ?? saved?.color ?? DEFAULT_COLOR
  return {
    icon: CATEGORY_ICONS[iconKey] ?? Package,
    color: CATEGORY_COLORS[colorKey] ?? CATEGORY_COLORS[DEFAULT_COLOR],
    fit: DEFAULT_FIT[categoryId] ?? ('auto' as ImageFit),
  }
}
