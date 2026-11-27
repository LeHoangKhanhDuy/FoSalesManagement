import type { ReactNode } from 'react'
import { ArrowLeft, CircleAlert, Clock, Eye, EyeOff, KeyRound, LockKeyhole, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import type { ForgotPasswordState } from '@/modules/auth/hooks/useForgotPassword'
import type { ResetPasswordState } from '@/modules/auth/hooks/useResetPassword'
import { formatSeconds, OTP_LENGTH } from '@/modules/auth/utils/auth.utils'

function Field({ label, error, icon, children }: { label: string; error?: string; icon: ReactNode; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-700">{label}</span>
      <span
        className={cn(
          'flex h-12 items-center gap-3 rounded-lg border bg-white px-3.5 transition focus-within:ring-4',
          error ? 'border-rose-300 focus-within:ring-rose-100' : 'border-slate-200 focus-within:border-primary-500 focus-within:ring-primary-100',
        )}
      >
        {icon}
        {children}
      </span>
      {error && <span className="mt-1 block text-xs font-medium text-rose-500">{error}</span>}
    </label>
  )
}

const inputClass = 'h-full w-full bg-transparent text-[15px] outline-none placeholder:text-slate-400'

interface Props {
  f: ForgotPasswordState
  r: ResetPasswordState
  onBack: () => void
  onChangeAccount: () => void
}

export function ResetPasswordForm({ f, r, onBack, onChangeAccount }: Props) {
  const expired = f.expiresLeft === 0
  const type = r.visible ? 'text' : 'password'

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        r.submit()
      }}
      className="animate-fade-in"
    >
      <button type="button" onClick={onChangeAccount} disabled={r.loading} className="mb-6 flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 disabled:cursor-not-allowed disabled:text-slate-400">
        <ArrowLeft className="size-4" /> Đổi tài khoản
      </button>
      <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900">Đặt lại mật khẩu</h1>
      <p className="mt-1.5 text-sm text-slate-500">
        Nhập mã OTP gồm {OTP_LENGTH} số đã gửi tới {f.target ? <span className="font-semibold text-slate-800">số {f.target}</span> : 'số điện thoại đăng ký của tài khoản'}.
      </p>
      <p className={cn('mt-3 flex items-center gap-1.5 text-xs font-semibold', expired ? 'text-rose-600' : 'text-slate-500')}>
        <Clock className="size-3.5" />
        {expired ? 'Mã OTP đã hết hạn, vui lòng gửi lại mã mới' : `Mã hết hạn sau ${formatSeconds(f.expiresLeft)}`}
      </p>

      {r.errors.form && (
        <p className="mt-5 flex items-start gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          <span>{r.errors.form}</span>
        </p>
      )}

      <div className="mt-5 space-y-4">
        <Field label="Mã OTP" error={r.errors.otp} icon={<ShieldCheck className="size-[18px] text-slate-400" />}>
          <input
            autoFocus
            inputMode="numeric"
            autoComplete="one-time-code"
            value={r.values.otp}
            onChange={(e) => r.set('otp', e.target.value)}
            disabled={r.loading}
            placeholder={`${OTP_LENGTH} chữ số`}
            className={cn(inputClass, r.values.otp && 'font-mono tracking-[0.3em]')}
          />
        </Field>
        <Field label="Mật khẩu mới" error={r.errors.newPassword} icon={<LockKeyhole className="size-[18px] text-slate-400" />}>
          <input type={type} autoComplete="new-password" value={r.values.newPassword} onChange={(e) => r.set('newPassword', e.target.value)} placeholder="Ít nhất 8 ký tự, gồm chữ và số" className={inputClass} disabled={r.loading} />
          <button
            type="button"
            onClick={r.toggleVisible}
            className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label={r.visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            {r.visible ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
          </button>
        </Field>
        <Field label="Nhập lại mật khẩu mới" error={r.errors.confirm} icon={<KeyRound className="size-[18px] text-slate-400" />}>
          <input type={type} autoComplete="new-password" value={r.values.confirm} onChange={(e) => r.set('confirm', e.target.value)} placeholder="Nhập lại mật khẩu mới" className={inputClass} disabled={r.loading} />
        </Field>
      </div>

      <Button type="submit" size="lg" className="mt-6 w-full rounded-lg" loading={r.loading} disabled={expired || f.loading}>
        Đặt lại mật khẩu
      </Button>
      <div className="mt-4 flex items-center justify-between text-sm font-semibold">
        <button type="button" onClick={onBack} disabled={r.loading} className="cursor-pointer text-slate-500 hover:text-slate-800 disabled:cursor-not-allowed disabled:text-slate-400">
          Quay lại đăng nhập
        </button>
        <button
          type="button"
          onClick={f.resendCode}
          disabled={f.resendLeft > 0 || f.loading}
          className="cursor-pointer text-primary-600 hover:text-primary-700 disabled:cursor-not-allowed disabled:text-slate-400"
        >
          {f.resendLeft ? `Gửi lại mã sau ${f.resendLeft}s` : 'Gửi lại mã'}
        </button>
      </div>
    </form>
  )
}
