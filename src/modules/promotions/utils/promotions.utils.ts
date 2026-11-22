import { Gift, PackageMinus, ReceiptText, TicketPercent, type LucideIcon } from 'lucide-react'
import type { BadgeProps } from '@/components/ui/Badge'
import { formatCurrency, removeAccents } from '@/lib/format'
import type {
  DiscountType,
  Promotion,
  PromotionFilters,
  PromotionFormValues,
  PromotionKind,
  PromotionScope,
  PromotionSort,
  PromotionStatus,
  PromotionTab,
  PromotionUsage,
  PromotionWithUsage,
} from '@/modules/promotions/types/promotions.types'
import type { Voucher } from '@/modules/sales/types/sales.types'

const DAY = 86_400_000

export const PROMOTION_PAGE_SIZE = 10

export const PROMOTION_KINDS: Record<PromotionKind, { label: string; short: string; description: string; icon: LucideIcon; tone: string }> = {
  voucher: { label: 'Mã giảm giá', short: 'Mã giảm giá', description: 'Khách nhập mã khi thanh toán để được giảm', icon: TicketPercent, tone: 'bg-primary-50 text-primary-600' },
  product: { label: 'Giảm giá sản phẩm', short: 'Giảm sản phẩm', description: 'Tự động giảm giá cho sản phẩm hoặc danh mục', icon: PackageMinus, tone: 'bg-sky-50 text-sky-600' },
  order: { label: 'Giảm theo hóa đơn', short: 'Giảm hóa đơn', description: 'Tự động giảm khi tổng hóa đơn đạt mức tối thiểu', icon: ReceiptText, tone: 'bg-amber-50 text-amber-600' },
  gift: { label: 'Mua X tặng Y', short: 'Mua X tặng Y', description: 'Mua đủ số lượng sản phẩm được tặng thêm sản phẩm', icon: Gift, tone: 'bg-violet-50 text-violet-600' },
}

export const PROMOTION_STATUS: Record<PromotionStatus, { label: string; tone: NonNullable<BadgeProps['tone']> }> = {
  running: { label: 'Đang chạy', tone: 'success' },
  scheduled: { label: 'Sắp diễn ra', tone: 'info' },
  paused: { label: 'Tạm dừng', tone: 'warning' },
  ended: { label: 'Đã kết thúc', tone: 'neutral' },
  draft: { label: 'Nháp', tone: 'violet' },
}

export const PROMOTION_TABS: { value: PromotionTab; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'running', label: 'Đang chạy' },
  { value: 'scheduled', label: 'Sắp diễn ra' },
  { value: 'paused', label: 'Tạm dừng' },
  { value: 'ended', label: 'Đã kết thúc' },
  { value: 'draft', label: 'Nháp' },
]

export const PROMOTION_SORTS: { value: PromotionSort; label: string }[] = [
  { value: 'newest', label: 'Mới tạo gần đây' },
  { value: 'ending', label: 'Sắp kết thúc' },
  { value: 'usage', label: 'Lượt dùng nhiều nhất' },
]

export const DEFAULT_PROMOTION_FILTERS: PromotionFilters = { keyword: '', tab: 'all', kind: 'all', sort: 'newest' }

export const EMPTY_USAGE: PromotionUsage = { count: 0, discount: 0, revenue: 0, last30Count: 0, last30Discount: 0 }

export const isAutoKind = (kind: PromotionKind) => kind !== 'voucher'

export const getPromotionStatus = (p: Promotion, usageCount = 0, now = Date.now()): PromotionStatus => {
  if (p.state === 'draft' || p.state === 'paused' || p.state === 'ended') return p.state
  if (new Date(p.startAt).getTime() > now) return 'scheduled'
  if (p.endAt && new Date(p.endAt).getTime() < now) return 'ended'
  if (p.usageLimit && usageCount >= p.usageLimit) return 'ended'
  return 'running'
}

export const isRunningAt = (p: Promotion, at: number) =>
  p.state !== 'draft' &&
  new Date(p.startAt).getTime() <= at &&
  (!p.endAt || new Date(p.endAt).getTime() >= at) &&
  !((p.state === 'ended' || p.state === 'paused') && p.updatedAt && new Date(p.updatedAt).getTime() < at)

export const endedReason = (p: Promotion, usage: PromotionUsage) => {
  if (p.state === 'ended') return 'Kết thúc sớm'
  if (p.usageLimit && usage.count >= p.usageLimit) return 'Hết lượt sử dụng'
  return 'Hết thời gian'
}

export const discountText = (type: DiscountType, value: number, max?: number) =>
  type === 'percent' ? `Giảm ${value}%${max ? ` (tối đa ${formatCurrency(max)})` : ''}` : `Giảm ${formatCurrency(value)}`

export const describePromotion = (p: Pick<Promotion, 'kind' | 'discountType' | 'discountValue' | 'maxDiscount' | 'minOrder' | 'buyQty' | 'giftQty'>, names?: { buy?: string; gift?: string }) => {
  if (p.kind === 'gift') return `Mua ${p.buyQty ?? 1} ${names?.buy ?? 'sản phẩm'} tặng ${p.giftQty ?? 1} ${names?.gift ?? 'sản phẩm'}`
  const base = discountText(p.discountType, p.discountValue, p.discountType === 'percent' ? p.maxDiscount : undefined)
  return p.minOrder ? `${base} · Đơn từ ${formatCurrency(p.minOrder)}` : base
}

export const scopeText = (scope: PromotionScope, categoryName: (id: string) => string, productName: (id: string) => string) => {
  if (scope.type === 'all') return 'Toàn bộ sản phẩm'
  const names = scope.type === 'categories' ? scope.categoryIds.map(categoryName) : scope.productIds.map(productName)
  if (!names.length) return 'Chưa chọn'
  return names.length > 2 ? `${names.slice(0, 2).join(', ')} +${names.length - 2}` : names.join(', ')
}

export const inScope = (scope: PromotionScope | undefined, item: { productId: string; categoryId: string }) =>
  !scope || scope.type === 'all' || (scope.type === 'categories' ? scope.categoryIds.includes(item.categoryId) : scope.productIds.includes(item.productId))

export const calcDiscount = (base: number, type: DiscountType, value: number, max?: number) => {
  if (base <= 0) return 0
  let raw = type === 'percent' ? (base * Math.min(value, 100)) / 100 : value
  if (type === 'percent' && max) raw = Math.min(raw, max)
  const rounded = type === 'percent' ? Math.round(raw / 100) * 100 : Math.round(raw)
  return Math.max(0, Math.min(rounded, base))
}

export const toVoucher = (p: Promotion): Voucher => ({
  id: p.id,
  code: p.code,
  name: p.name,
  type: p.discountType,
  value: p.discountValue,
  maxDiscount: p.maxDiscount,
  minOrder: p.minOrder,
  expiresAt: p.endAt,
  scope: p.scope,
  stackable: p.stackable,
})

export const daysLeft = (iso?: string, now = Date.now()) => (iso ? Math.ceil((new Date(iso).getTime() - now) / DAY) : null)

export const filterPromotions = (list: PromotionWithUsage[], filters: PromotionFilters, keyword: string, now = Date.now()) => {
  const k = removeAccents(keyword.trim())
  return list.filter(
    (p) =>
      (filters.kind === 'all' || p.kind === filters.kind) &&
      (!k || removeAccents(p.name).includes(k) || p.code.toLowerCase().includes(k)) &&
      (filters.tab === 'all' || getPromotionStatus(p, p.usage.count, now) === filters.tab),
  )
}

export const sortPromotions = (list: PromotionWithUsage[], sort: PromotionSort) =>
  [...list].sort((a, b) => {
    if (sort === 'usage') return b.usage.count - a.usage.count
    if (sort === 'ending') return (a.endAt ?? '9999').localeCompare(b.endAt ?? '9999')
    return b.createdAt.localeCompare(a.createdAt)
  })

export const generatePromoCode = (prefix = '') => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return prefix + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export const emptyPromotionForm = (kind: PromotionKind, code: string): PromotionFormValues => {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(start.getTime() + 30 * DAY)
  end.setHours(23, 59, 59, 0)
  return {
    code,
    name: '',
    description: '',
    kind,
    discountType: kind === 'order' ? 'amount' : 'percent',
    discountValue: kind === 'order' ? 20_000 : 10,
    maxDiscount: undefined,
    minOrder: kind === 'order' ? 200_000 : undefined,
    scope: { type: kind === 'product' ? 'categories' : 'all', categoryIds: [], productIds: [] },
    buyQty: kind === 'gift' ? 2 : undefined,
    giftQty: kind === 'gift' ? 1 : undefined,
    usageLimit: undefined,
    perCustomerLimit: undefined,
    stackable: true,
    startAt: start.toISOString(),
    endAt: end.toISOString(),
  }
}

export const promotionToForm = (p: Promotion): PromotionFormValues => {
  const { id: _, state: __, createdAt: ___, updatedAt: ____, ...rest } = p
  return structuredClone({ ...rest, scope: rest.scope ?? { type: 'all', categoryIds: [], productIds: [] } })
}

export const makeNamers = (categories: { id: string; name: string }[], products: { id: string; name: string }[]) => {
  const c = new Map(categories.map((x) => [x.id, x.name]))
  const p = new Map(products.map((x) => [x.id, x.name]))
  return { category: (id: string) => c.get(id) ?? id, product: (id: string) => p.get(id) ?? 'Sản phẩm đã xóa' }
}

export type Namers = ReturnType<typeof makeNamers>

export const offerText = (p: Promotion, names: Namers) =>
  describePromotion(p, { buy: p.buyProductId ? names.product(p.buyProductId) : undefined, gift: p.giftProductId ? names.product(p.giftProductId) : undefined })

export const appliesText = (p: Promotion, names: Namers) => {
  if (p.kind === 'order') return 'Toàn bộ hóa đơn'
  if (p.kind === 'gift') return p.buyProductId ? names.product(p.buyProductId) : '—'
  return scopeText(p.scope, names.category, names.product)
}

export const periodText = (p: Promotion) => {
  const fmt = (iso: string) => new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: '2-digit' })
  return `${fmt(p.startAt)} → ${p.endAt ? fmt(p.endAt) : 'Không giới hạn'}`
}
