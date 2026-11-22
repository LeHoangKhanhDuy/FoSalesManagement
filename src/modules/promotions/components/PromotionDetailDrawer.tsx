import { CircleAlert, CirclePause, CirclePlay, Copy, Pencil, ReceiptText } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Drawer'
import { EmptyState } from '@/components/ui/EmptyState'
import { FormSection } from '@/components/ui/FormField'
import { useLastValue } from '@/hooks/useLastValue'
import { cn } from '@/lib/cn'
import { formatCurrency, formatDateTime } from '@/lib/format'
import { usePromotionDetail } from '@/modules/promotions/hooks/usePromotionDetail'
import type { PromotionWithUsage } from '@/modules/promotions/types/promotions.types'
import { appliesText, endedReason, getPromotionStatus, type Namers, offerText, periodText, PROMOTION_KINDS, PROMOTION_STATUS } from '@/modules/promotions/utils/promotions.utils'

interface Props {
  promotion: PromotionWithUsage | null
  names: Namers
  onClose: () => void
  onEdit: (p: PromotionWithUsage) => void
  onDuplicate: (p: PromotionWithUsage) => void
  onState: (p: PromotionWithUsage, state: 'active' | 'paused') => void
}

export function PromotionDetailDrawer({ promotion: open, names, onClose, onEdit, onDuplicate, onState }: Props) {
  const p = useLastValue(open)
  const { orders, loading } = usePromotionDetail(open)
  if (!p) return null
  const statusKey = getPromotionStatus(p, p.usage.count)
  const status = PROMOTION_STATUS[statusKey]
  const kind = PROMOTION_KINDS[p.kind]
  const Icon = kind.icon
  const info: [string, string][] = [
    ['Loại', kind.label],
    ['Ưu đãi', offerText(p, names)],
    ['Áp dụng cho', appliesText(p, names)],
    ['Thời gian', periodText(p)],
    ['Giới hạn', [p.usageLimit ? `${p.usageLimit} lượt` : 'Không giới hạn lượt', p.perCustomerLimit ? `${p.perCustomerLimit} lần/khách` : ''].filter(Boolean).join(' · ')],
  ]
  if (p.kind === 'voucher') info.push(['Dùng chung', p.stackable ? 'Được dùng chung với giảm theo hóa đơn' : 'Không dùng chung, chọn ưu đãi có lợi hơn'])
  if (p.description) info.push(['Mô tả', p.description])

  return (
    <Drawer
      open={!!open}
      onClose={onClose}
      title={
        <span className="flex items-center gap-3">
          <span className={cn('grid size-10 shrink-0 place-items-center rounded-lg', kind.tone)}>
            <Icon className="size-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate">{p.name}</span>
            <span className="block font-mono text-xs font-semibold text-slate-400">{p.code}</span>
          </span>
        </span>
      }
      className="max-w-[640px]"
      headerExtra={
        <Badge tone={status.tone} dot className="mt-1 whitespace-nowrap">
          {status.label}
        </Badge>
      }
      footer={
        <>
          <Button variant="outline" leftIcon={<Copy className="size-4" />} onClick={() => onDuplicate(p)}>
            Nhân bản
          </Button>
          <div className="ml-auto flex gap-2">
            {(statusKey === 'running' || statusKey === 'scheduled') && (
              <Button variant="outline" leftIcon={<CirclePause className="size-4" />} onClick={() => onState(p, 'paused')}>
                Tạm dừng
              </Button>
            )}
            {(statusKey === 'paused' || statusKey === 'draft') && (
              <Button variant="outline" leftIcon={<CirclePlay className="size-4" />} onClick={() => onState(p, 'active')}>
                {statusKey === 'draft' ? 'Kích hoạt' : 'Tiếp tục'}
              </Button>
            )}
            {statusKey !== 'ended' && (
              <Button leftIcon={<Pencil className="size-4" />} onClick={() => onEdit(p)}>
                Sửa
              </Button>
            )}
          </div>
        </>
      }
    >
      {statusKey === 'ended' && (
        <p className="mb-4 flex gap-2 rounded-lg bg-slate-100 p-3 text-sm text-slate-600">
          <CircleAlert className="mt-0.5 size-4 shrink-0" /> Chương trình đã kết thúc: {endedReason(p, p.usage).toLowerCase()}.
        </p>
      )}
      {statusKey === 'paused' && (
        <p className="mb-4 flex gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
          <CircleAlert className="mt-0.5 size-4 shrink-0" /> Đang tạm dừng — POS không áp dụng chương trình này cho tới khi tiếp tục.
        </p>
      )}

      <div className="grid grid-cols-4 gap-2">
        {[
          ['Lượt dùng', `${p.usage.count}${p.usageLimit ? `/${p.usageLimit}` : ''}`],
          ['Đã giảm', formatCurrency(p.usage.discount)],
          ['Doanh thu đơn', formatCurrency(p.usage.revenue)],
          ['Giảm TB/đơn', formatCurrency(p.usage.count ? p.usage.discount / p.usage.count : 0)],
        ].map(([l, val]) => (
          <div key={l} className="rounded-lg bg-slate-50 p-3">
            <p className="text-[11px] text-slate-500">{l}</p>
            <p className="truncate text-[15px] font-bold text-slate-900">{val}</p>
          </div>
        ))}
      </div>

      <dl className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-100 text-sm">
        {info.map(([l, val]) => (
          <div key={l} className="flex gap-3 px-3 py-2.5">
            <dt className="w-28 shrink-0 text-slate-500">{l}</dt>
            <dd className="min-w-0 flex-1 font-medium text-slate-800">{val}</dd>
          </div>
        ))}
      </dl>

      <FormSection title={`Đơn hàng áp dụng (${p.usage.count})`}>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-50" />
            ))}
          </div>
        ) : orders.length ? (
          <ul className="divide-y divide-slate-100 rounded-lg border border-slate-100">
            {orders.map((o) => {
              const amount = o.promotions?.find((x) => x.id === p.id)?.amount ?? 0
              return (
                <li key={o.id} className="flex items-center gap-3 p-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-50 text-slate-400">
                    <ReceiptText className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">{o.code}</p>
                    <p className="truncate text-xs text-slate-400">
                      {formatDateTime(new Date(o.createdAt))} · {o.customer?.name ?? 'Khách lẻ'}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-bold text-slate-900">{formatCurrency(o.totals.total)}</p>
                    <p className={cn('text-xs font-semibold', p.kind === 'gift' ? 'text-violet-600' : 'text-rose-500')}>
                      {p.kind === 'gift' ? 'Quà ' : '-'}
                      {formatCurrency(amount)}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <EmptyState icon={<ReceiptText />} title="Chưa có đơn hàng áp dụng" className="py-8" />
        )}
      </FormSection>
    </Drawer>
  )
}
