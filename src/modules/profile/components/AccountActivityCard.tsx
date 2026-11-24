import { History, KeyRound, LogIn, TriangleAlert } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { timeAgo } from '@/lib/format'
import type { Profile } from '@/modules/profile/types/profile.types'
import { formatDateTimeVi } from '@/modules/profile/utils/profile.utils'

const PASSWORD_MAX_AGE_DAYS = 90

export function AccountActivityCard({ profile }: { profile: Profile }) {
  const passwordAgeDays = profile.passwordChangedAt ? Math.floor((Date.now() - new Date(profile.passwordChangedAt).getTime()) / 86_400_000) : null
  const items = [
    { icon: LogIn, label: 'Đăng nhập gần nhất', at: profile.lastLoginAt },
    { icon: KeyRound, label: 'Đổi mật khẩu gần nhất', at: profile.passwordChangedAt },
    { icon: History, label: 'Tạo tài khoản', at: profile.createdAt },
  ]
  return (
    <Card>
      <CardHeader title="Hoạt động tài khoản" description="Thông tin do hệ thống ghi nhận" />
      <ul className="space-y-3 p-5 pt-4">
        {items.map(({ icon: Icon, label, at }) => (
          <li key={label} className="flex items-center gap-3 text-sm">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary-50 text-primary-600">
              <Icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-slate-400">{label}</p>
              <p className="font-medium text-slate-800">{formatDateTimeVi(at)}</p>
            </div>
            {at && <span className="shrink-0 text-[11px] text-slate-400">{timeAgo(at)}</span>}
          </li>
        ))}
      </ul>
      {passwordAgeDays !== null && passwordAgeDays >= PASSWORD_MAX_AGE_DAYS && (
        <p className="mx-5 mb-5 flex gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
          <TriangleAlert className="size-4 shrink-0" /> Mật khẩu đã dùng {passwordAgeDays} ngày. Nên đổi mật khẩu định kỳ để bảo vệ tài khoản.
        </p>
      )}
    </Card>
  )
}
