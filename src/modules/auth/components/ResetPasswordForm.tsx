import type { ReactNode } from 'react'
import { ArrowLeft, CircleAlert, KeyRound, LockKeyhole, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import type { ForgotPasswordState } from '@/modules/auth/hooks/useForgotPassword'

function Field({ label, error, icon, children }: { label: string; error?: string; icon: ReactNode; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-700">{label}</span>
      <span
        className={cn(
          'flex h-12 items-center gap-3 rounded-xl border bg-white px-3.5 transition focus-within:ring-4',
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

export function ResetPasswordForm({ f, onBack }: { f: ForgotPasswordState; onBack: () => void }) {
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        f.submitReset()
      }}
      className="animate-fade-in"
    >
      <button type="button" onClick={f.changeAccount} className="mb-6 flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800">
        <ArrowLeft className="size-4" /> Đổi tài khoản
      </button>
      <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900">Đặt lại mật khẩu</h1>
      <p className="mt-1.5 text-sm text-slate-500">
        Nhập mã OTP gồm 6 số đã gửi tới số <span className="font-semibold text-slate-800">{f.sentTo}</span>. Mã có hiệu lực trong 5 phút.
      </p>

      {f.resetErrors.form && (
        <p className="mt-6 flex items-start gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          <span>{f.resetErrors.form}</span>
        </p>
      )}

      <div className="mt-6 space-y-4">
        <Field label="Mã OTP" error={f.resetErrors.otp} icon={<ShieldCheck className="size-[18px] text-slate-400" />}>
          <input autoFocus inputMode="numeric" autoComplete="one-time-code" value={f.otp} onChange={(e) => f.setOtp(e.target.value)} placeholder="6 chữ số" className={cn(inputClass, 'font-mono tracking-[0.3em]')} />
        </Field>
        <Field label="Mật khẩu mới" error={f.resetErrors.newPassword} icon={<LockKeyhole className="size-[18px] text-slate-400" />}>
          <input type="password" autoComplete="new-password" value={f.newPassword} onChange={(e) => f.setNewPassword(e.target.value)} placeholder="Ít nhất 8 ký tự, gồm chữ và số" className={inputClass} />
        </Field>
        <Field label="Nhập lại mật khẩu mới" error={f.resetErrors.confirm} icon={<KeyRound className="size-[18px] text-slate-400" />}>
          <input type="password" autoComplete="new-password" value={f.confirm} onChange={(e) => f.setConfirm(e.target.value)} placeholder="Nhập lại mật khẩu mới" className={inputClass} />
        </Field>
      </div>

      <Button type="submit" size="lg" className="mt-6 w-full rounded-xl" loading={f.loading}>
        Đặt lại mật khẩu
      </Button>
      <div className="mt-4 flex items-center justify-between text-sm font-semibold">
        <button type="button" onClick={onBack} className="cursor-pointer text-slate-500 hover:text-slate-800">
          Quay lại đăng nhập
        </button>
        <button type="button" onClick={f.resend} className="cursor-pointer text-primary-600 hover:text-primary-700">
          Gửi lại mã
        </button>
      </div>
    </form>
  )
}
