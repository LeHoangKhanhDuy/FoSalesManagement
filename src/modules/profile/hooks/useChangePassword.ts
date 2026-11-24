import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { errorMessage } from '@/lib/http'
import { profileService } from '@/modules/profile/services/profile.service'
import type { ChangePasswordValues } from '@/modules/profile/types/profile.types'
import { fieldFromError, passwordStrength, type PasswordErrors, validatePassword } from '@/modules/profile/utils/profile.utils'

const EMPTY: ChangePasswordValues = { currentPassword: '', newPassword: '', confirmPassword: '' }

export function useChangePassword(onChanged: () => void) {
  const [values, setValues] = useState<ChangePasswordValues>(EMPTY)
  const [submitted, setSubmitted] = useState(false)
  const [serverErrors, setServerErrors] = useState<PasswordErrors>({})
  const [visible, setVisible] = useState(false)
  const [saving, setSaving] = useState(false)

  const errors = useMemo<PasswordErrors>(() => ({ ...(submitted ? validatePassword(values) : {}), ...serverErrors }), [submitted, values, serverErrors])
  const strength = passwordStrength(values.newPassword)
  const filled = !!(values.currentPassword || values.newPassword || values.confirmPassword)

  const set = <K extends keyof ChangePasswordValues>(key: K, value: ChangePasswordValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }))
    setServerErrors((e) => {
      if (!(key in e)) return e
      const { [key]: _, ...rest } = e
      return rest
    })
  }

  const reset = () => {
    setValues(EMPTY)
    setSubmitted(false)
    setServerErrors({})
  }

  const submit = async () => {
    if (saving) return
    setSubmitted(true)
    if (Object.keys(validatePassword(values)).length) return
    setSaving(true)
    try {
      await profileService.changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword })
      reset()
      toast.success('Đã đổi mật khẩu', { description: 'Các thiết bị khác đã được đăng xuất' })
      onChanged()
    } catch (e) {
      const field = fieldFromError(e)
      if (field === 'currentPassword') setServerErrors({ currentPassword: errorMessage(e) })
      else toast.error(errorMessage(e, 'Đổi mật khẩu thất bại'))
    } finally {
      setSaving(false)
    }
  }

  return { values, errors, strength, filled, visible, saving, set, reset, submit, toggleVisible: () => setVisible((v) => !v) }
}
