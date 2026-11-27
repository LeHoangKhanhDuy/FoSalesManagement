import { useEffect, useSyncExternalStore } from 'react'
import { HttpError } from '@/lib/http'
import { authService } from '@/modules/auth/services/auth.service'
import { authStore, initialsOf, ROLE_LABEL } from '@/modules/auth/utils/auth.utils'

let restoring: Promise<void> | null = null
let loggingOut: Promise<boolean> | null = null

const endSession = () => {
  loggingOut ??= authService
    .logout()
    .then(() => {
      authStore.set(null)
      return true
    })
    .catch(() => false)
    .finally(() => {
      loggingOut = null
    })
  return loggingOut
}

const restoreSession = () => {
  const initial = authStore.get()
  restoring ??= authService
    .me()
    .then((user) => {
      if (authStore.get() === initial) authStore.set({ ...initial, user, draftId: initial?.user.id === user.id && initial.draftId ? initial.draftId : crypto.randomUUID() })
    })
    .catch((error: unknown) => {
      if (error instanceof HttpError && (error.status === 401 || error.status === 403) && authStore.get() === initial) authStore.set(null)
    })
    .finally(() => authStore.markRestored())
  return restoring
}

export function useAuth() {
  const session = useSyncExternalStore(authStore.subscribe, authStore.get, authStore.get)
  const restored = useSyncExternalStore(authStore.subscribe, authStore.isRestored, authStore.isRestored)

  useEffect(() => {
    void restoreSession()
  }, [])

  const user = session?.user ?? null
  return {
    session,
    user,
    isAuthenticated: !!session,
    checking: !restored,
    roleLabel: user ? ROLE_LABEL[user.role] : '',
    initials: user ? initialsOf(user.name) : '',
    logout: endSession,
  }
}
