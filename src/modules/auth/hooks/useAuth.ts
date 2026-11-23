import { useCallback, useSyncExternalStore } from 'react'
import { authService } from '@/modules/auth/services/auth.service'
import { authStore, initialsOf, ROLE_LABEL } from '@/modules/auth/utils/auth.utils'

export function useAuth() {
  const session = useSyncExternalStore(authStore.subscribe, authStore.get, authStore.get)

  const logout = useCallback(async () => {
    await authService.logout().catch(() => undefined)
    authStore.set(null)
  }, [])

  const user = session?.user ?? null
  return {
    session,
    user,
    isAuthenticated: !!session,
    roleLabel: user ? ROLE_LABEL[user.role] : '',
    initials: user ? initialsOf(user.name) : '',
    logout,
  }
}
