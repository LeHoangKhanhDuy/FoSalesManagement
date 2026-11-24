import { Lock, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { Field, inputClass } from '@/components/ui/FormField'
import { cn } from '@/lib/cn'
import { ROLE_LABEL } from '@/modules/auth/utils/auth.utils'
import type { useProfileForm } from '@/modules/profile/hooks/useProfileForm'
import type { Profile } from '@/modules/profile/types/profile.types'

interface Props {
  profile: Profile
  form: ReturnType<typeof useProfileForm>
}

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <Field label={label}>
      <div className={cn(inputClass(), 'flex items-center justify-between bg-slate-50 text-slate-500')}>
        <span className="truncate">{value}</span>
        <Lock className="size-3.5 shrink-0 text-slate-300" />
      </div>
    </Field>
  )
}

export function ProfileInfoCard({ profile, form }: Props) {
  const { values: v, errors } = form
  return (
    <Card>
      <CardHeader title="Thông tin cá nhân" description="Cập nhật họ tên và số điện thoại dùng để đăng nhập, nhận mã OTP" />
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          form.submit()
        }}
        className="p-5 pt-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Họ và tên" required error={errors.name}>
            <input value={v.name} onChange={(e) => form.set('name', e.target.value)} maxLength={100} autoComplete="name" className={inputClass(errors.name)} />
          </Field>
          <Field label="Số điện thoại" required error={errors.phone}>
            <input inputMode="tel" value={v.phone} onChange={(e) => form.set('phone', e.target.value.replace(/[^\d\s+]/g, ''))} autoComplete="tel" className={inputClass(errors.phone)} />
          </Field>
          {form.phoneChanged && (
            <div className="rounded-lg bg-amber-50/70 p-3 sm:col-span-2">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                <ShieldAlert className="size-4" /> Đổi số điện thoại cần xác nhận mật khẩu hiện tại
              </p>
              <Field label="Mật khẩu hiện tại" required error={errors.currentPassword}>
                <input type="password" autoComplete="current-password" value={v.currentPassword} onChange={(e) => form.set('currentPassword', e.target.value)} className={inputClass(errors.currentPassword)} />
              </Field>
            </div>
          )}
          <ReadonlyField label="Tên đăng nhập" value={profile.username} />
          <ReadonlyField label="Vai trò" value={ROLE_LABEL[profile.role]} />
          <div className="sm:col-span-2">
            <ReadonlyField label="Chi nhánh" value={profile.store ? `${profile.store.name} (${profile.store.code})` : '—'} />
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-400">Tên đăng nhập, vai trò và chi nhánh do quản trị viên quản lý.</p>
          <div className="flex shrink-0 gap-2">
            <Button type="button" variant="outline" onClick={form.reset} disabled={!form.dirty || form.saving}>
              Hoàn tác
            </Button>
            <Button type="submit" loading={form.saving} disabled={!form.dirty}>
              Lưu thay đổi
            </Button>
          </div>
        </div>
      </form>
    </Card>
  )
}
