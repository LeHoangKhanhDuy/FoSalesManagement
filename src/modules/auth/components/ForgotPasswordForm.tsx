import { ArrowLeft, MailCheck, Send, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { useForgotPassword } from '@/modules/auth/hooks/useForgotPassword'

export function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const f = useForgotPassword()

  if (f.sentTo) {
    return (
      <div className="animate-fade-in text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary-50 text-primary-600 ring-8 ring-primary-50/50">
          <MailCheck className="size-8" />
        </div>
        <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-slate-900">Đã gửi yêu cầu</h1>
        <p className="mt-2 text-sm text-slate-500">
          Mã đặt lại mật khẩu đã được gửi tới số <span className="font-semibold text-slate-800">{f.sentTo}</span>. Vui lòng kiểm tra tin nhắn hoặc liên hệ quản lý cửa hàng.
        </p>
        <Button size="lg" className="mt-8 w-full rounded-xl" leftIcon={<ArrowLeft className="size-5" />} onClick={onBack}>
          Quay lại đăng nhập
        </Button>
        <button type="button" onClick={f.reset} className="mt-4 cursor-pointer text-sm font-semibold text-slate-500 hover:text-slate-800">
          Gửi lại mã
        </button>
      </div>
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
        <ArrowLeft className="size-4" /> Quay lại
      </button>
      <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900">Quên mật khẩu?</h1>
      <p className="mt-1.5 text-sm text-slate-500">Nhập tên đăng nhập hoặc số điện thoại, chúng tôi sẽ gửi mã để đặt lại mật khẩu.</p>
      <label className="mt-6 block">
        <span className="mb-1.5 block text-xs font-semibold text-slate-700">Tên đăng nhập hoặc số điện thoại</span>
        <span
          className={cn(
            'flex h-12 items-center gap-3 rounded-xl border bg-white px-3.5 transition focus-within:ring-4',
            f.error ? 'border-rose-300 focus-within:ring-rose-100' : 'border-slate-200 focus-within:border-primary-500 focus-within:ring-primary-100',
          )}
        >
          <UserRound className="size-[18px] text-slate-400" />
          <input autoFocus value={f.account} onChange={(e) => f.setAccount(e.target.value)} placeholder="VD: thungan hoặc 0123456789" className="h-full w-full bg-transparent text-[15px] outline-none placeholder:text-slate-400" />
        </span>
        {f.error && (
          <span className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-500">
            {f.error}
          </span>
        )}
      </label>
      <Button type="submit" size="lg" className="mt-6 w-full rounded-xl" loading={f.loading} leftIcon={!f.loading && <Send className="size-5" />}>
        Gửi mã đặt lại
      </Button>
    </form>
  )
}
