import type { ReactNode } from 'react'
import { Cake, Ellipsis, Eye, Lock, LockOpen, Pencil, Star, Trash2, Users } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Dropdown, DropdownItem, DropdownSeparator } from '@/components/ui/Dropdown'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/cn'
import { formatCurrency, formatNumber, timeAgo } from '@/lib/format'
import { TierBadge } from '@/modules/customers/components/TierBadge'
import type { CustomerWithStats, MembershipSettings } from '@/modules/customers/types/customers.types'
import { isBirthdayMonth, nextTierInfo, TIER_STYLE, totalSpent } from '@/modules/customers/utils/customers.utils'
import { formatPhone } from '@/modules/suppliers/utils/suppliers.utils'

interface Props {
  customers: CustomerWithStats[]
  settings: MembershipSettings | null
  loading: boolean
  hasActiveFilters: boolean
  onView: (c: CustomerWithStats) => void
  onEdit: (c: CustomerWithStats) => void
  onPoints: (c: CustomerWithStats) => void
  onToggleBlock: (c: CustomerWithStats) => void
  onDelete: (c: CustomerWithStats) => void
}

const COLUMNS = ['Khách hàng', 'Hạng thành viên', 'Điểm', 'Tổng chi tiêu', 'Đơn hàng', 'Mua gần nhất', '']

const Td = ({ children, className }: { children: ReactNode; className?: string }) => <td className={cn('px-4 py-3 align-middle', className)}>{children}</td>

export function CustomerTable({ customers, settings, loading, hasActiveFilters, onView, onEdit, onPoints, onToggleBlock, onDelete }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1040px] text-sm">
        <thead>
          <tr className="bg-slate-50 text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            {COLUMNS.map((c, i) => (
              <th key={i} className={cn('px-4 py-3 whitespace-nowrap', ['Điểm', 'Tổng chi tiêu'].includes(c) && 'text-right')}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  {COLUMNS.map((_, j) => (
                    <Td key={j}>
                      <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
                    </Td>
                  ))}
                </tr>
              ))
            : customers.map((c) => {
                const spent = totalSpent(c, c.stats)
                const next = settings ? nextTierInfo(settings, c.tier, spent) : null
                const blocked = c.status === 'blocked'
                return (
                  <tr key={c.id} onClick={() => onView(c)} className={cn('group cursor-pointer transition hover:bg-slate-50/80', blocked && 'opacity-60')}>
                    <Td className="max-w-[280px]">
                      <div className="flex items-center gap-3">
                        <Avatar name={c.name} className="size-10" />
                        <div className="min-w-0">
                          <p className="flex items-center gap-1.5 truncate font-semibold text-slate-900 group-hover:text-primary-700">
                            <span className="truncate">{c.name}</span>
                            {isBirthdayMonth(c) && <Cake className="size-3.5 shrink-0 text-rose-500" aria-label="Sinh nhật tháng này" />}
                            {blocked && <Lock className="size-3.5 shrink-0 text-slate-400" aria-label="Đã khóa" />}
                          </p>
                          <p className="text-xs text-slate-400">
                            {formatPhone(c.phone)} · {c.id.toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <TierBadge tier={c.tier} settings={settings} />
                      {next?.next ? (
                        <div className="mt-1.5 w-36" title={`Còn ${formatCurrency(next.remaining)} để lên ${next.next.label}`}>
                          <div className="h-1 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full" style={{ width: `${next.progress}%`, backgroundColor: TIER_STYLE[next.next.tier].bar }} />
                          </div>
                          <p className="mt-0.5 truncate text-[10px] text-slate-400">
                            Còn {formatCurrency(next.remaining)} lên {next.next.label}
                          </p>
                        </div>
                      ) : (
                        <p className="mt-1 text-[10px] text-slate-400">Hạng cao nhất</p>
                      )}
                    </Td>
                    <Td className="text-right font-semibold whitespace-nowrap text-amber-600">
                      <span className="inline-flex items-center gap-1">
                        <Star className="size-3.5 fill-amber-400 text-amber-400" />
                        {formatNumber(c.points)}
                      </span>
                    </Td>
                    <Td className="text-right font-semibold whitespace-nowrap text-slate-900">{formatCurrency(spent)}</Td>
                    <Td className="whitespace-nowrap">
                      <p className="font-medium text-slate-800">{c.stats.orders} đơn</p>
                      <p className="text-xs text-slate-400">TB {formatCurrency(c.stats.avgOrder)}</p>
                    </Td>
                    <Td className="whitespace-nowrap text-slate-600">{c.stats.lastOrderAt ? timeAgo(c.stats.lastOrderAt) : <span className="text-slate-400">Chưa mua</span>}</Td>
                    <Td>
                      <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                        <Dropdown
                          align="end"
                          trigger={
                            <button className="grid size-8 cursor-pointer place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Thao tác khác">
                              <Ellipsis className="size-4" />
                            </button>
                          }
                        >
                          <DropdownItem icon={Eye} label="Xem chi tiết" onClick={() => onView(c)} />
                          <DropdownItem icon={Pencil} label="Chỉnh sửa" onClick={() => onEdit(c)} />
                          <DropdownItem icon={Star} label="Điều chỉnh điểm" onClick={() => onPoints(c)} />
                          <DropdownItem icon={blocked ? LockOpen : Lock} label={blocked ? 'Mở khóa' : 'Khóa khách hàng'} onClick={() => onToggleBlock(c)} />
                          <DropdownSeparator />
                          <DropdownItem icon={Trash2} label="Xóa" danger onClick={() => onDelete(c)} />
                        </Dropdown>
                      </div>
                    </Td>
                  </tr>
                )
              })}
        </tbody>
      </table>
      {!loading && customers.length === 0 && (
        <EmptyState icon={<Users />} title={hasActiveFilters ? 'Không tìm thấy khách hàng' : 'Chưa có khách hàng'} description={hasActiveFilters ? 'Thử đổi từ khóa hoặc bộ lọc khác.' : 'Thêm khách hàng để tích điểm và chăm sóc thành viên.'} className="py-14" />
      )}
    </div>
  )
}
