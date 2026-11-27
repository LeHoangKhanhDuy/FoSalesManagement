import { Crown, Gem, Medal, UserRound, type LucideIcon } from 'lucide-react'
import type {
  CustomerFilters,
  CustomerFormValues,
  CustomerProfile,
  CustomerSegment,
  CustomerSort,
  CustomerStats,
  CustomerWithStats,
  MembershipSettings,
  PointLogType,
  TierConfig,
} from '@/modules/customers/types/customers.types'
import type { CustomerTier } from '@/modules/sales/types/sales.types'


export const CUSTOMER_PAGE_SIZE = 10

export const TIER_ORDER: CustomerTier[] = ['retail', 'silver', 'gold', 'diamond']

export interface TierStyle {
  icon: LucideIcon
  main: string
  gradient: string
  text: string
  muted: string
  track: string
  chip: { background: string; color: string; borderColor: string }
  bar: string
}

export const TIER_STYLE: Record<CustomerTier, TierStyle> = {
  retail: {
    icon: UserRound,
    main: '#475569',
    gradient: 'linear-gradient(135deg, #64748B 0%, #334155 55%, #1E293B 100%)',
    text: '#FFFFFF',
    muted: 'rgba(255,255,255,0.72)',
    track: 'rgba(255,255,255,0.25)',
    chip: { background: '#F1F5F9', color: '#475569', borderColor: '#CBD5E1' },
    bar: '#64748B',
  },
  silver: {
    icon: Medal,
    main: '#94A3B8',
    gradient: 'linear-gradient(135deg, #E2E8F0 0%, #94A3B8 50%, #64748B 100%)',
    text: '#0F172A',
    muted: 'rgba(15,23,42,0.68)',
    track: 'rgba(15,23,42,0.15)',
    chip: { background: '#F8FAFC', color: '#475569', borderColor: '#94A3B8' },
    bar: '#94A3B8',
  },
  gold: {
    icon: Crown,
    main: '#D97706',
    gradient: 'linear-gradient(135deg, #FDE047 0%, #EAB308 45%, #A16207 100%)',
    text: '#422006',
    muted: 'rgba(66,32,6,0.72)',
    track: 'rgba(66,32,6,0.18)',
    chip: { background: '#FEFCE8', color: '#A16207', borderColor: '#FACC15' },
    bar: '#D97706',
  },
  diamond: {
    icon: Gem,
    main: '#D7D7CE',
    gradient: 'linear-gradient(135deg, #F5F5F1 0%, #D7D7CE 50%, #A9A99C 100%)',
    text: '#1C1C17',
    muted: 'rgba(28,28,23,0.66)',
    track: 'rgba(28,28,23,0.14)',
    chip: { background: '#F7F7F3', color: '#5E5E54', borderColor: '#D7D7CE' },
    bar: '#B4B4A6',
  },
}

export const SEGMENTS: { value: CustomerSegment; label: string }[] = [
  { value: 'all', label: 'Tất cả khách hàng' },
  { value: 'birthday', label: 'Sinh nhật tháng này' },
  { value: 'new30', label: 'Khách mới 30 ngày' },
  { value: 'inactive60', label: 'Lâu chưa quay lại (60 ngày)' },
  { value: 'blocked', label: 'Đã khóa' },
]

export const CUSTOMER_SORTS: { value: CustomerSort; label: string }[] = [
  { value: 'newest', label: 'Mới tham gia' },
  { value: 'spent', label: 'Chi tiêu nhiều nhất' },
  { value: 'points', label: 'Điểm cao nhất' },
  { value: 'recent', label: 'Mua gần đây' },
  { value: 'name', label: 'Tên A → Z' },
]

export const DEFAULT_CUSTOMER_FILTERS: CustomerFilters = { keyword: '', tab: 'all', segment: 'all', sort: 'newest' }

export const POINT_LOG_LABEL: Record<PointLogType, { label: string; tone: string }> = {
  opening: { label: 'Số dư đầu kỳ', tone: 'text-slate-500' },
  earn: { label: 'Tích điểm', tone: 'text-primary-600' },
  revoke: { label: 'Thu hồi (hoàn đơn)', tone: 'text-rose-500' },
  adjust: { label: 'Điều chỉnh', tone: 'text-amber-600' },
  redeem: { label: 'Đổi điểm', tone: 'text-violet-600' },
}

export const ADJUST_REASONS = ['Tặng điểm sinh nhật', 'Bù điểm đơn hàng', 'Khuyến mãi tích điểm', 'Trừ điểm nhập sai', 'Đổi quà tại quầy']

export const tierConfig = (settings: MembershipSettings, tier: CustomerTier): TierConfig =>
  settings.tiers.find((t) => t.tier === tier) ?? settings.tiers[0]

export const nextTierInfo = (settings: MembershipSettings, tier: CustomerTier, totalSpent: number) => {
  const idx = TIER_ORDER.indexOf(tier)
  const next = settings.tiers.find((t) => t.tier === TIER_ORDER[idx + 1])
  const cur = tierConfig(settings, tier)
  if (!next) return { next: null, remaining: 0, progress: 100 }
  const span = Math.max(1, next.minSpent - cur.minSpent)
  return { next, remaining: Math.max(0, next.minSpent - totalSpent), progress: Math.min(100, Math.max(0, ((totalSpent - cur.minSpent) / span) * 100)) }
}

export const totalSpent = (c: Pick<CustomerProfile, 'legacySpent'>, stats: CustomerStats) => c.legacySpent + stats.spent

export const isBirthdayMonth = (c: CustomerProfile, now = new Date()) => !!c.birthday && Number(c.birthday.slice(5, 7)) === now.getMonth() + 1

export const ageOf = (birthday?: string, now = new Date()) => {
  if (!birthday) return null
  const b = new Date(birthday)
  let age = now.getFullYear() - b.getFullYear()
  if (now.getMonth() < b.getMonth() || (now.getMonth() === b.getMonth() && now.getDate() < b.getDate())) age -= 1
  return age
}

export const formatBirthday = (birthday?: string) => (birthday ? new Date(birthday).toLocaleDateString('vi-VN') : '—')

export const emptyCustomerForm = (): CustomerFormValues => ({ name: '', phone: '', email: '', gender: undefined, birthday: undefined, address: '', note: '', status: 'active' })

export const customerToForm = (c: CustomerProfile): CustomerFormValues => ({
  name: c.name,
  phone: c.phone,
  email: c.email ?? '',
  gender: c.gender,
  birthday: c.birthday,
  address: c.address ?? '',
  note: c.note ?? '',
  status: c.status,
})

export const exportCustomersCsv = (list: CustomerWithStats[], settings: MembershipSettings) => {
  const head = ['Mã', 'Họ tên', 'Điện thoại', 'Email', 'Giới tính', 'Ngày sinh', 'Hạng', 'Điểm', 'Tổng chi tiêu', 'Số đơn', 'Mua gần nhất', 'Trạng thái']
  const gender = { male: 'Nam', female: 'Nữ', other: 'Khác' }
  const rows = list.map((c) => [
    c.code ?? c.id,
    c.name,
    c.phone,
    c.email ?? '',
    c.gender ? gender[c.gender] : '',
    formatBirthday(c.birthday),
    tierConfig(settings, c.tier).label,
    c.points,
    totalSpent(c, c.stats),
    c.stats.orders,
    c.stats.lastOrderAt ? new Date(c.stats.lastOrderAt).toLocaleDateString('vi-VN') : '',
    c.status === 'blocked' ? 'Đã khóa' : 'Hoạt động',
  ])
  const csv = [head, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
  const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `khach-hang-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
