import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { useCountdown } from '@/hooks/useCountdown'
import { errorMessage, HttpError } from '@/lib/http'
import { authService } from '@/modules/auth/services/auth.service'
import { OTP_RESEND_SECONDS, OTP_TTL_SECONDS, validateAccount } from '@/modules/auth/utils/auth.utils'

export function useForgotPassword() {
  const [account, setAccount] = useState('')
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [target, setTarget] = useState<string | null>(null)
  const resend = useCountdown()
  const expiry = useCountdown()
  const requesting = useRef(false)

  const request = async () => {
    const res = await authService.forgotPassword({ account: account.trim() })
    setTarget(res?.maskedTarget ?? null)
    expiry.start(res?.expiresIn ?? OTP_TTL_SECONDS)
    resend.start(res?.resendIn ?? OTP_RESEND_SECONDS)
  }

  const handleError = (e: unknown, fallback: string) => {
    if (e instanceof HttpError && e.retryAfter) {
      resend.start(e.retryAfter)
      return `Bạn đã yêu cầu mã quá nhiều lần. Thử lại sau ${e.retryAfter} giây.`
    }
    return errorMessage(e, fallback)
  }

  const submit = async () => {
    if (requesting.current) return
    const invalid = validateAccount(account)
    if (invalid) return setError(invalid)
    requesting.current = true
    setLoading(true)
    setError(undefined)
    try {
      await request()
      setSent(true)
    } catch (e) {
      setError(handleError(e, 'Không gửi được yêu cầu, vui lòng thử lại'))
    } finally {
      requesting.current = false
      setLoading(false)
    }
  }

  const resendCode = async () => {
    if (requesting.current || resend.left) return
    requesting.current = true
    setLoading(true)
    try {
      await request()
      toast.success('Đã gửi lại mã OTP')
    } catch (e) {
      toast.error(handleError(e, 'Không gửi lại được mã'))
    } finally {
      requesting.current = false
      setLoading(false)
    }
  }

  const changeAccount = () => {
    setSent(false)
    setTarget(null)
    expiry.stop()
    resend.stop()
  }

  return {
    account: account.trim(),
    rawAccount: account,
    setAccount: (value: string) => {
      setAccount(value)
      setError(undefined)
    },
    error,
    loading,
    sent,
    target,
    resendLeft: resend.left,
    expiresLeft: expiry.left,
    submit,
    resendCode,
    changeAccount,
  }
}

export type ForgotPasswordState = ReturnType<typeof useForgotPassword>
