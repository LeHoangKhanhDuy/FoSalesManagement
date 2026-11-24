import { ArrowRight, CircleAlert, Eye, EyeOff, LockKeyhole, TriangleAlert, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Switch'
import { cn } from '@/lib/cn'
import { useLoginForm } from '@/modules/auth/hooks/useLoginForm'

const fieldClass = (error?: string) =>
  cn(
    'flex h-12 items-center gap-3 rounded-lg border bg-white px-3.5 transition focus-within:ring-4',
    error ? 'border-rose-300 focus-within:border-rose-400 focus-within:ring-rose-100' : 'border-slate-200 hover:border-slate-300 focus-within:border-primary-500 focus-within:ring-primary-100',
  )

export function LoginForm({ onSuccess, onForgot, defaultUsername }: { onSuccess: () => void; onForgot: () => void; defaultUsername?: string }) {
  const f = useLoginForm(onSuccess, defaultUsername)
  const locked = f.lockLeft > 0

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        f.submit()
      }}
      className="animate-fade-in"
    >
      <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900">Đăng nhập</h1>
      <p className="mt-1.5 text-sm text-slate-500">Chào mừng trở lại! Đăng nhập để bắt đầu ca bán hàng.</p>

      {f.errors.form && (
        <p className={cn('mt-6 flex items-start gap-2 rounded-lg p-3 text-sm', locked ? 'bg-amber-50 text-amber-800' : 'bg-rose-50 text-rose-700')}>
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          <span>{locked ? `${f.errors.form} Thử lại sau ${f.lockLeft} giây.` : f.errors.form}</span>
        </p>
      )}

      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-slate-700">Tên đăng nhập hoặc số điện thoại</span>
          <span className={fieldClass(f.errors.username)}>
            <UserRound className="size-[18px] text-slate-400" />
            <input
              autoFocus={!f.username}
              autoComplete="username"
              value={f.username}
              onChange={(e) => f.setUsername(e.target.value)}
              placeholder="VD: admin hoặc 0909 000 111"
              className="h-full w-full bg-transparent text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
            />
          </span>
          {f.errors.username && <span className="mt-1 block text-xs font-medium text-rose-500">{f.errors.username}</span>}
        </label>

        <div>
          <span className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-700">
            Mật khẩu
            <button type="button" onClick={onForgot} className="cursor-pointer font-semibold text-primary-600 hover:text-primary-700">
              Quên mật khẩu?
            </button>
          </span>
          <label className={fieldClass(f.errors.password)}>
            <LockKeyhole className="size-[18px] text-slate-400" />
            <input
              autoFocus={!!f.username}
              type={f.showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={f.password}
              onChange={(e) => f.setPassword(e.target.value)}
              onKeyDown={f.detectCaps}
              onKeyUp={f.detectCaps}
              placeholder="Nhập mật khẩu"
              className="h-full w-full bg-transparent text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
            />
            <button type="button" onClick={f.toggleShowPassword} className="grid size-8 cursor-pointer place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label={f.showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>
              {f.showPassword ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
            </button>
          </label>
          {f.errors.password && <span className="mt-1 block text-xs font-medium text-rose-500">{f.errors.password}</span>}
          {f.capsLock && (
            <span className="mt-1 flex items-center gap-1 text-xs font-medium text-amber-600">
              <TriangleAlert className="size-3.5" /> Caps Lock đang bật
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2.5">
        <Checkbox checked={f.remember} onChange={f.setRemember} label="Ghi nhớ đăng nhập" />
        <button type="button" onClick={() => f.setRemember(!f.remember)} className="cursor-pointer text-sm text-slate-600 select-none">
          Ghi nhớ đăng nhập trong 30 ngày
        </button>
      </div>

      <Button type="submit" size="lg" className="mt-6 w-full rounded-lg" loading={f.loading} disabled={locked} rightIcon={!f.loading && <ArrowRight className="size-5" />}>
        {locked ? `Thử lại sau ${f.lockLeft}s` : f.loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </Button>
    </form>
  )
}
