import { ArrowLeft, CircleAlert, Send, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { ResetPasswordForm } from '@/modules/auth/components/ResetPasswordForm'
import { useForgotPassword } from '@/modules/auth/hooks/useForgotPassword'
import { useResetPassword } from '@/modules/auth/hooks/useResetPassword'

export function ForgotPasswordForm({ onBack, onDone }: { onBack: () => void; onDone: (account: string) => void }) {
  const f = useForgotPassword()
  const r = useResetPassword(f.account, onDone)

  if (f.sent) {
    return (
      <ResetPasswordForm
        f={f}
        r={r}
        onBack={onBack}
        onChangeAccount={() => {
          r.reset()
          f.changeAccount()
        }}
      />
    )
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        f.submit()
      }}
      className="animate-fade-in"
    >
      <button type="button" onClick={onBack} className="mb-6 flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800">
        <ArrowLeft className="size-4" /> Quay lại đăng nhập
      </button>
      <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900">Quên mật khẩu?</h1>
      <p className="mt-1.5 text-sm text-slate-500">Nhập tên đăng nhập hoặc số điện thoại, chúng tôi sẽ gửi mã OTP để bạn đặt lại mật khẩu.</p>
      <label className="mt-6 block">
        <span className="mb-1.5 block text-xs font-semibold text-slate-700">Tên đăng nhập hoặc số điện thoại</span>
        <span
          className={cn(
            'flex h-12 items-center gap-3 rounded-lg border bg-white px-3.5 transition focus-within:ring-4',
            f.error ? 'border-rose-300 focus-within:ring-rose-100' : 'border-slate-200 focus-within:border-primary-500 focus-within:ring-primary-100',
          )}
        >
          <UserRound className="size-[18px] text-slate-400" />
          <input
            autoFocus
            autoComplete="username"
            value={f.rawAccount}
            onChange={(e) => f.setAccount(e.target.value)}
            placeholder="VD: admin hoặc 0909 000 111"
            className="h-full w-full bg-transparent text-[15px] outline-none placeholder:text-slate-400"
          />
        </span>
        {f.error && (
          <span className="mt-1.5 flex items-start gap-1 text-xs font-medium text-rose-500">
            <CircleAlert className="mt-px size-3.5 shrink-0" /> {f.error}
          </span>
        )}
      </label>
      <Button type="submit" size="lg" className="mt-6 w-full rounded-lg" loading={f.loading} disabled={f.resendLeft > 0} leftIcon={!f.loading && <Send className="size-5" />}>
        {f.resendLeft ? `Gửi lại sau ${f.resendLeft}s` : 'Gửi mã OTP'}
      </Button>
    </form>
  )
}
