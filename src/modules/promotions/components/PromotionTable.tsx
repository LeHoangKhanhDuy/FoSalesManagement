import type { ReactNode } from 'react'
import { BadgePercent, CirclePause, CirclePlay, CircleStop, Copy, Ellipsis, Eye, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Dropdown, DropdownItem, DropdownSeparator } from '@/components/ui/Dropdown'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/cn'
import type { PromotionWithUsage } from '@/modules/promotions/types/promotions.types'
import { appliesText, daysLeft, getPromotionStatus, type Namers, offerText, periodText, PROMOTION_KINDS, PROMOTION_STATUS } from '@/modules/promotions/utils/promotions.utils'

interface Props {
  promotions: PromotionWithUsage[]
  names: Namers
  loading: boolean
  hasActiveFilters: boolean
  onView: (p: PromotionWithUsage) => void
  onEdit: (p: PromotionWithUsage) => void
  onDuplicate: (p: PromotionWithUsage) => void
  onState: (p: PromotionWithUsage, state: 'active' | 'paused') => void
  onConfirm: (type: 'delete' | 'end', p: PromotionWithUsage) => void
}

const COLUMNS = ['Chương trình', 'Ưu đãi', 'Áp dụng cho', 'Thời gian', 'Lượt dùng', 'Trạng thái', '']

const Td = ({ children, className }: { children: ReactNode; className?: string }) => <td className={cn('px-4 py-3 align-middle', className)}>{children}</td>

export function PromotionTable({ promotions, names, loading, hasActiveFilters, onView, onEdit, onDuplicate, onState, onConfirm }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1120px] text-sm">
        <thead>
          <tr className="bg-slate-50 text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            {COLUMNS.map((c, i) => (
              <th key={i} className="px-4 py-3 whitespace-nowrap">
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
            : promotions.map((p) => {
                const kind = PROMOTION_KINDS[p.kind]
                const statusKey = getPromotionStatus(p, p.usage.count)
                const status = PROMOTION_STATUS[statusKey]
                const left = daysLeft(p.endAt)
                const progress = p.usageLimit ? Math.min(100, (p.usage.count / p.usageLimit) * 100) : 0
                const Icon = kind.icon
                return (
                  <tr key={p.id} onClick={() => onView(p)} className={cn('group cursor-pointer transition hover:bg-slate-50/80', statusKey === 'ended' && 'opacity-60')}>
                    <Td className="max-w-[300px]">
                      <div className="flex items-center gap-3">
                        <span className={cn('grid size-10 shrink-0 place-items-center rounded-lg', kind.tone)}>
                          <Icon className="size-5" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900 group-hover:text-primary-700">{p.name}</p>
                          <p className="flex items-center gap-1.5 text-xs text-slate-400">
                            <span className={cn('font-mono font-semibold', p.kind === 'voucher' ? 'rounded bg-primary-50 px-1.5 text-primary-700' : '')}>{p.code}</span>· {kind.short}
                          </p>
                        </div>
                      </div>
                    </Td>
                    <Td className="max-w-[240px]">
                      <p className="truncate font-medium text-slate-800" title={offerText(p, names)}>
                        {offerText(p, names)}
                      </p>
                      {p.kind === 'voucher' && p.perCustomerLimit && <p className="text-xs text-slate-400">{p.perCustomerLimit} lần / khách</p>}
                    </Td>
                    <Td className="max-w-[200px]">
                      <p className="truncate text-slate-600" title={appliesText(p, names)}>
                        {appliesText(p, names)}
                      </p>
                    </Td>
                    <Td className="whitespace-nowrap">
                      <p className="text-slate-700">{periodText(p)}</p>
                      {statusKey === 'running' && left !== null && <p className={cn('text-xs', left <= 3 ? 'font-semibold text-rose-500' : 'text-slate-400')}>Còn {left} ngày</p>}
                      {statusKey === 'scheduled' && <p className="text-xs text-sky-600">Bắt đầu sau {daysLeft(p.startAt)} ngày</p>}
                    </Td>
                    <Td>
                      <div className="w-32">
                        <p className="text-xs">
                          <span className="font-semibold text-slate-800">{p.usage.count}</span>
                          <span className="text-slate-400">{p.usageLimit ? ` / ${p.usageLimit}` : ' lượt'}</span>
                        </p>
                        {p.usageLimit ? (
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div className={cn('h-full rounded-full', progress >= 90 ? 'bg-rose-500' : 'bg-primary-500')} style={{ width: `${progress}%` }} />
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-400">Không giới hạn</p>
                        )}
                      </div>
                    </Td>
                    <Td>
                      <Badge tone={status.tone} dot className="whitespace-nowrap">
                        {status.label}
                      </Badge>
                    </Td>
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
                          <DropdownItem icon={Eye} label="Xem chi tiết" onClick={() => onView(p)} />
                          {statusKey !== 'ended' && <DropdownItem icon={Pencil} label="Chỉnh sửa" onClick={() => onEdit(p)} />}
                          <DropdownItem icon={Copy} label="Nhân bản" onClick={() => onDuplicate(p)} />
                          {(statusKey === 'running' || statusKey === 'scheduled') && <DropdownItem icon={CirclePause} label="Tạm dừng" onClick={() => onState(p, 'paused')} />}
                          {statusKey === 'paused' && <DropdownItem icon={CirclePlay} label="Tiếp tục" onClick={() => onState(p, 'active')} />}
                          {statusKey === 'draft' && <DropdownItem icon={CirclePlay} label="Kích hoạt" onClick={() => onState(p, 'active')} />}
                          <DropdownSeparator />
                          {['running', 'paused', 'scheduled'].includes(statusKey) && <DropdownItem icon={CircleStop} label="Kết thúc sớm" danger onClick={() => onConfirm('end', p)} />}
                          <DropdownItem icon={Trash2} label="Xóa" danger onClick={() => onConfirm('delete', p)} />
                        </Dropdown>
                      </div>
                    </Td>
                  </tr>
                )
              })}
        </tbody>
      </table>
      {!loading && promotions.length === 0 && (
        <EmptyState
          icon={<BadgePercent />}
          title={hasActiveFilters ? 'Không tìm thấy khuyến mãi' : 'Chưa có chương trình khuyến mãi'}
          description={hasActiveFilters ? 'Thử đổi từ khóa hoặc bộ lọc khác.' : 'Tạo mã giảm giá hoặc chương trình tự động để thu hút khách hàng.'}
          className="py-14"
        />
      )}
    </div>
  )
}
