import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { errorMessage, HttpError } from '@/lib/http'
import { authService } from '@/modules/auth/services/auth.service'
import { EMPTY_RESET, OTP_LENGTH, resetFieldFromCode, validateReset, type ResetErrors, type ResetField, type ResetValues } from '@/modules/auth/utils/auth.utils'

export function useResetPassword(account: string, onDone: (account: string) => void) {
  const [values, setValues] = useState<ResetValues>(EMPTY_RESET)
  const [errors, setErrors] = useState<ResetErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const submitting = useRef(false)

  const set = (field: keyof ResetValues, value: string) => {
    const next = { ...values, [field]: field === 'otp' ? value.replace(/\D/g, '').slice(0, OTP_LENGTH) : value }
    setValues(next)
    setErrors(submitted ? validateReset(next) : (e) => dropKeys(e, field, 'form'))
  }

  const submit = async () => {
    if (submitting.current) return
    setSubmitted(true)
    const invalid = validateReset(values)
    setErrors(invalid)
    if (Object.keys(invalid).length) return
    submitting.current = true
    setLoading(true)
    try {
      await authService.resetPassword({ account, otp: values.otp, newPassword: values.newPassword })
      toast.success('Đặt lại mật khẩu thành công', { description: 'Vui lòng đăng nhập bằng mật khẩu mới' })
      onDone(account)
    } catch (e) {
      const field: ResetField = e instanceof HttpError ? resetFieldFromCode(e.code) : 'form'
      setErrors({ [field]: errorMessage(e, 'Không đặt lại được mật khẩu') })
      if (field === 'otp') setValues((v) => ({ ...v, otp: '' }))
    } finally {
      submitting.current = false
      setLoading(false)
    }
  }

  const reset = () => {
    submitting.current = false
    setValues(EMPTY_RESET)
    setErrors({})
    setSubmitted(false)
  }

  return { values, errors, loading, visible, set, submit, reset, toggleVisible: () => setVisible((v) => !v) }
}

function dropKeys(errors: ResetErrors, ...keys: ResetField[]) {
  if (!keys.some((k) => k in errors)) return errors
  const next = { ...errors }
  keys.forEach((k) => delete next[k])
  return next
}

export type ResetPasswordState = ReturnType<typeof useResetPassword>
