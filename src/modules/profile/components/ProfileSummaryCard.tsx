import { AtSign, CalendarDays, Phone, Store } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { initialsOf, ROLE_LABEL } from '@/modules/auth/utils/auth.utils'
import type { Profile } from '@/modules/profile/types/profile.types'
import { formatPhoneDisplay } from '@/modules/profile/utils/profile.utils'

const ROLE_TONE = { admin: 'primary', manager: 'info', cashier: 'neutral' } as const

export function ProfileSummaryCard({ profile }: { profile: Profile }) {
  const rows = [
    { icon: AtSign, label: 'Tên đăng nhập', value: profile.username },
    { icon: Phone, label: 'Số điện thoại', value: formatPhoneDisplay(profile.phone) },
    { icon: Store, label: 'Chi nhánh', value: profile.store ? `${profile.store.name} · ${profile.store.code}` : '—' },
    { icon: CalendarDays, label: 'Tham gia', value: new Date(profile.createdAt).toLocaleDateString('vi-VN') },
  ]
  return (
    <Card className="overflow-hidden">
      <div className="relative h-24 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800">
        <div className="absolute -top-10 -right-6 size-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-12 left-16 size-28 rounded-full bg-white/5" />
      </div>
      <div className="px-5 pb-5">
        <div className="relative -mt-10 flex items-end gap-3">
          <span className="grid size-20 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-2xl font-extrabold text-white shadow-card ring-4 ring-white">
            {initialsOf(profile.name)}
          </span>
        </div>
        <h2 className="mt-3 truncate text-lg font-bold text-slate-900">{profile.name}</h2>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <Badge tone={ROLE_TONE[profile.role]} dot>
            {ROLE_LABEL[profile.role]}
          </Badge>
          <span className="text-xs text-slate-400">@{profile.username}</span>
        </div>
        <dl className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm">
          {rows.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-slate-50 text-slate-400">
                <Icon className="size-4" />
              </span>
              <div className="min-w-0">
                <dt className="text-[11px] text-slate-400">{label}</dt>
                <dd className="truncate font-medium text-slate-800">{value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </Card>
  )
}
