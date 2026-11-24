import { Check, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { Field, inputClass } from '@/components/ui/FormField'
import { cn } from '@/lib/cn'
import type { useChangePassword } from '@/modules/profile/hooks/useChangePassword'

const STRENGTH_COLOR = ['bg-slate-200', 'bg-rose-500', 'bg-amber-500', 'bg-primary-500']

export function ChangePasswordCard({ form }: { form: ReturnType<typeof useChangePassword> }) {
  const { values: v, errors, strength } = form
  const type = form.visible ? 'text' : 'password'
  const rules = [
    { ok: v.newPassword.length >= 8, label: 'Ít nhất 8 ký tự' },
    { ok: /\p{L}/u.test(v.newPassword), label: 'Có chữ cái' },
    { ok: /\d/.test(v.newPassword), label: 'Có chữ số' },
  ]
  return (
    <Card>
      <CardHeader
        title="Đổi mật khẩu"
        description="Sau khi đổi, các thiết bị khác sẽ bị đăng xuất"
        action={
          <button type="button" onClick={form.toggleVisible} className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800">
            {form.visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />} {form.visible ? 'Ẩn' : 'Hiện'} mật khẩu
          </button>
        }
      />
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          form.submit()
        }}
        className="p-5 pt-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Mật khẩu hiện tại" required error={errors.currentPassword} className="sm:col-span-2">
            <input type={type} autoComplete="current-password" value={v.currentPassword} onChange={(e) => form.set('currentPassword', e.target.value)} className={inputClass(errors.currentPassword)} />
          </Field>
          <Field label="Mật khẩu mới" required error={errors.newPassword}>
            <input type={type} autoComplete="new-password" value={v.newPassword} onChange={(e) => form.set('newPassword', e.target.value)} placeholder="Ít nhất 8 ký tự, gồm chữ và số" className={inputClass(errors.newPassword)} />
          </Field>
          <Field label="Nhập lại mật khẩu mới" required error={errors.confirmPassword}>
            <input type={type} autoComplete="new-password" value={v.confirmPassword} onChange={(e) => form.set('confirmPassword', e.target.value)} className={inputClass(errors.confirmPassword)} />
          </Field>
        </div>
        {v.newPassword && (
          <div className="mt-3">
            <div className="flex gap-1.5">
              {[1, 2, 3].map((i) => (
                <span key={i} className={cn('h-1.5 flex-1 rounded-full transition', i <= strength.level ? STRENGTH_COLOR[strength.level] : 'bg-slate-100')} />
              ))}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
              <span className="font-semibold text-slate-600">Độ mạnh: {strength.label}</span>
              {rules.map((r) => (
                <span key={r.label} className={cn('flex items-center gap-1', r.ok ? 'text-primary-600' : 'text-slate-400')}>
                  <Check className="size-3.5" /> {r.label}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button type="button" variant="outline" onClick={form.reset} disabled={!form.filled || form.saving}>
            Xóa
          </Button>
          <Button type="submit" loading={form.saving} disabled={!form.filled}>
            Đổi mật khẩu
          </Button>
        </div>
      </form>
    </Card>
  )
}
