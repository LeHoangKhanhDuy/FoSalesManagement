import { useCallback, useEffect, useState } from 'react'
import { errorMessage } from '@/lib/http'
import { authStore } from '@/modules/auth/utils/auth.utils'
import { useChangePassword } from '@/modules/profile/hooks/useChangePassword'
import { useProfileForm } from '@/modules/profile/hooks/useProfileForm'
import { useSessions } from '@/modules/profile/hooks/useSessions'
import { profileService } from '@/modules/profile/services/profile.service'
import type { Profile } from '@/modules/profile/types/profile.types'

const syncAuthUser = (p: Profile) => {
  const session = authStore.get()
  if (!session || session.user.id !== p.id) return
  if (session.user.name === p.name && session.user.phone === p.phone) return
  authStore.set({ ...session, user: { ...session.user, name: p.name, phone: p.phone } })
}

export function useProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    profileService
      .get()
      .then((p) => {
        setProfile(p)
        syncAuthUser(p)
      })
      .catch((e: unknown) => setError(errorMessage(e, 'Không tải được hồ sơ, vui lòng thử lại')))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  const applyProfile = useCallback((p: Profile) => {
    setProfile(p)
    syncAuthUser(p)
  }, [])

  const sessions = useSessions()
  const reloadSessions = sessions.reload

  const reloadAll = useCallback(() => {
    load()
    reloadSessions()
  }, [load, reloadSessions])

  const info = useProfileForm(profile, applyProfile)
  const password = useChangePassword(reloadAll)

  return { profile, loading, error, reload: reloadAll, info, password, sessions }
}
