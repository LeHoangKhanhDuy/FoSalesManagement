import { Headset } from 'lucide-react'
import { Logo } from '@/components/common/Logo'
import { AuthShowcase } from '@/modules/auth/components/AuthShowcase'
import { ForgotPasswordForm } from '@/modules/auth/components/ForgotPasswordForm'
import { LoginForm } from '@/modules/auth/components/LoginForm'
import { useLoginPage } from '@/modules/auth/hooks/useLoginPage'

export default function LoginPage() {
  const { mode, setMode, onSuccess } = useLoginPage()

  return (
    <div className="grid min-h-dvh bg-white lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <AuthShowcase />
      <div className="relative flex flex-col px-6 py-8 sm:px-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-primary-50/60 to-transparent lg:hidden" />
        <Logo className="relative lg:hidden" />
        <div className="relative mx-auto my-auto w-full max-w-[400px] py-10">
          {mode === 'login' ? <LoginForm onSuccess={onSuccess} onForgot={() => setMode('forgot')} /> : <ForgotPasswordForm onBack={() => setMode('login')} />}
        </div>
        <div className="relative flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <span>Phiên bản 1.0.0</span>
          <a href="tel:19001234" className="flex items-center gap-1.5 font-medium text-slate-500 hover:text-primary-600">
            <Headset className="size-3.5" /> Hỗ trợ 1900 1234
          </a>
        </div>
      </div>
    </div>
  )
}
