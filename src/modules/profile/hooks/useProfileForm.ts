import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { errorMessage } from '@/lib/http'
import { profileService } from '@/modules/profile/services/profile.service'
import type { Profile, ProfileFormValues } from '@/modules/profile/types/profile.types'
import { buildProfilePayload, fieldFromError, isPhoneChanged, profileToForm, type ProfileErrors, validateProfile } from '@/modules/profile/utils/profile.utils'

const EMPTY: ProfileFormValues = { name: '', phone: '', currentPassword: '' }

export function useProfileForm(profile: Profile | null, onSaved: (p: Profile) => void) {
  const [base, setBase] = useState(profile)
  const [values, setValues] = useState<ProfileFormValues>(() => (profile ? profileToForm(profile) : EMPTY))
  const [submitted, setSubmitted] = useState(false)
  const [serverErrors, setServerErrors] = useState<ProfileErrors>({})
  const [saving, setSaving] = useState(false)

  if (profile !== base) {
    setBase(profile)
    setValues(profile ? profileToForm(profile) : EMPTY)
    setSubmitted(false)
    setServerErrors({})
  }

  const payload = useMemo(() => (profile ? buildProfilePayload(profile, values) : {}), [profile, values])
  const dirty = Object.keys(payload).length > 0
  const phoneChanged = !!profile && isPhoneChanged(profile, values)
  const errors = useMemo<ProfileErrors>(() => ({ ...(submitted && profile ? validateProfile(profile, values) : {}), ...serverErrors }), [submitted, profile, values, serverErrors])

  const set = <K extends keyof ProfileFormValues>(key: K, value: ProfileFormValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }))
    setServerErrors((e) => {
      if (!(key in e)) return e
      const { [key]: _, ...rest } = e
      return rest
    })
  }

  const reset = () => {
    if (!profile) return
    setValues(profileToForm(profile))
    setSubmitted(false)
    setServerErrors({})
  }

  const submit = async () => {
    if (!profile || saving) return
    setSubmitted(true)
    if (Object.keys(validateProfile(profile, values)).length) return
    if (!dirty) return toast.info('Không có thay đổi nào')
    setSaving(true)
    try {
      const updated = await profileService.update(payload)
      onSaved(updated)
      toast.success('Đã cập nhật hồ sơ')
    } catch (e) {
      const field = fieldFromError(e)
      if (field && field in values) setServerErrors({ [field]: errorMessage(e) })
      else toast.error(errorMessage(e, 'Cập nhật hồ sơ thất bại'))
    } finally {
      setSaving(false)
    }
  }

  return { values, errors, dirty, phoneChanged, saving, set, reset, submit }
}
