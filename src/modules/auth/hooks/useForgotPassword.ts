import { useState } from 'react'
import { authService } from '@/modules/auth/services/auth.service'

export function useForgotPassword() {
  const [account, setAccount] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)

  const submit = async () => {
    if (!account.trim()) return setError('Nhập tên đăng nhập hoặc số điện thoại')
    setLoading(true)
    setError(null)
    try {
      setSentTo((await authService.requestReset(account)).maskedTarget)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không gửi được yêu cầu')
    } finally {
      setLoading(false)
    }
  }

  return {
    account,
    setAccount: (v: string) => {
      setAccount(v)
      setError(null)
    },
    error,
    loading,
    sentTo,
    submit,
    reset: () => setSentTo(null),
  }
}
