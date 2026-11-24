import { CircleAlert, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AccountActivityCard } from '@/modules/profile/components/AccountActivityCard'
import { ChangePasswordCard } from '@/modules/profile/components/ChangePasswordCard'
import { ProfileInfoCard } from '@/modules/profile/components/ProfileInfoCard'
import { ProfileSummaryCard } from '@/modules/profile/components/ProfileSummaryCard'
import { SessionsCard } from '@/modules/profile/components/SessionsCard'
import { useProfilePage } from '@/modules/profile/hooks/useProfilePage'

export default function ProfilePage() {
  const { profile, loading, error, reload, info, password, sessions } = useProfilePage()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-slate-900">Hồ sơ cá nhân</h1>
          <p className="text-sm text-slate-500">Quản lý thông tin tài khoản và bảo mật đăng nhập</p>
        </div>
        <Button variant="outline" size="icon" onClick={reload} title="Tải lại" aria-label="Tải lại">
          <RefreshCw className={loading ? 'size-4 animate-spin' : 'size-4'} />
        </Button>
      </div>

      {error && !profile ? (
        <div className="flex flex-col items-center gap-3 rounded-lg bg-white py-16 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-rose-50 text-rose-500">
            <CircleAlert className="size-6" />
          </span>
          <p className="text-sm text-slate-600">{error}</p>
          <Button variant="outline" leftIcon={<RefreshCw className="size-4" />} onClick={reload}>
            Thử lại
          </Button>
        </div>
      ) : !profile ? (
        <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
          <div className="space-y-4">
            <div className="h-[380px] animate-pulse rounded-lg bg-white" />
            <div className="h-48 animate-pulse rounded-lg bg-white" />
          </div>
          <div className="space-y-4">
            <div className="h-80 animate-pulse rounded-lg bg-white" />
            <div className="h-64 animate-pulse rounded-lg bg-white" />
          </div>
        </div>
      ) : (
        <div className="grid items-start gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
          <div className="space-y-4">
            <ProfileSummaryCard profile={profile} />
            <AccountActivityCard profile={profile} />
          </div>
          <div className="space-y-4">
            <ProfileInfoCard profile={profile} form={info} />
            <ChangePasswordCard form={password} />
            <SessionsCard s={sessions} />
          </div>
        </div>
      )}
    </div>
  )
}
