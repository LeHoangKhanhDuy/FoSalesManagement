import { useState } from 'react'
import { toast } from 'sonner'
import { errorMessage } from '@/lib/http'
import { authService } from '@/modules/auth/services/auth.service'

type ResetField = 'otp' | 'newPassword' | 'confirm' | 'form'
type ResetErrors = Partial<Record<ResetField, string>>

const STRONG_PASSWORD = /^(?=.*\p{L})(?=.*\d).{8,128}$/u

const validateReset = (otp: string, newPassword: string, confirm: string): ResetErrors => {
  const errors: ResetErrors = {}
  if (!/^\d{6}$/.test(otp)) errors.otp = 'Mã OTP gồm 6 chữ số'
  if (!STRONG_PASSWORD.test(newPassword)) errors.newPassword = 'Mật khẩu mới phải có từ 8 ký tự, gồm cả chữ và số'
  if (confirm !== newPassword) errors.confirm = 'Mật khẩu nhập lại không khớp'
  return errors
}

export function useForgotPassword(onDone: () => void) {
  const [account, setAccount] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [resetErrors, setResetErrors] = useState<ResetErrors>({})

  const submit = async () => {
    if (!account.trim()) return setError('Nhập tên đăng nhập hoặc số điện thoại')
    setLoading(true)
    setError(null)
    try {
      setSentTo((await authService.requestReset(account.trim())).maskedTarget)
    } catch (e) {
      setError(errorMessage(e, 'Không gửi được yêu cầu, vui lòng thử lại'))
    } finally {
      setLoading(false)
    }
  }

  const resend = async () => {
    try {
      await authService.requestReset(account.trim())
      toast.success('Đã gửi lại mã OTP')
    } catch (e) {
      toast.error(errorMessage(e, 'Không gửi lại được mã'))
    }
  }

  const submitReset = async () => {
    const errors = validateReset(otp, newPassword, confirm)
    setResetErrors(errors)
    if (Object.keys(errors).length) return
    setLoading(true)
    try {
      await authService.resetPassword({ account: account.trim(), otp, newPassword })
      toast.success('Đặt lại mật khẩu thành công, vui lòng đăng nhập lại')
      onDone()
    } catch (e) {
      setResetErrors({ form: errorMessage(e, 'Không đặt lại được mật khẩu') })
    } finally {
      setLoading(false)
    }
  }

  const clearResetError = (field: ResetField) => setResetErrors((x) => ({ ...x, [field]: undefined, form: undefined }))

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
    resend,
    otp,
    setOtp: (v: string) => {
      setOtp(v.replace(/\D/g, '').slice(0, 6))
      clearResetError('otp')
    },
    newPassword,
    setNewPassword: (v: string) => {
      setNewPassword(v)
      clearResetError('newPassword')
    },
    confirm,
    setConfirm: (v: string) => {
      setConfirm(v)
      clearResetError('confirm')
    },
    resetErrors,
    submitReset,
    changeAccount: () => {
      setSentTo(null)
      setOtp('')
      setNewPassword('')
      setConfirm('')
      setResetErrors({})
    },
  }
}

export type ForgotPasswordState = ReturnType<typeof useForgotPassword>
