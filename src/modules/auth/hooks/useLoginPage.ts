import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { authStore, greeting } from '@/modules/auth/utils/auth.utils'
import { PATHS } from '@/routes/paths'

export type LoginMode = 'login' | 'forgot'

export function useLoginPage() {
  const [mode, setMode] = useState<LoginMode>('login')
  const [prefill, setPrefill] = useState<string>()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from

  const onSuccess = () => {
    const user = authStore.get()?.user
    if (user) toast.success(`${greeting()}, ${user.name}!`)
    navigate(from && from !== '/login' ? from : PATHS.pos, { replace: true })
  }

  const onResetDone = (account: string) => {
    setPrefill(account)
    setMode('login')
  }

  return { mode, setMode, prefill, onSuccess, onResetDone }
}
