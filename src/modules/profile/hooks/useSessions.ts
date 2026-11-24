import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { errorMessage, HttpError } from '@/lib/http'
import { profileService } from '@/modules/profile/services/profile.service'
import type { AuthSessionItem, RevokeTarget } from '@/modules/profile/types/profile.types'
import { sortSessions } from '@/modules/profile/utils/profile.utils'

const revokeOne = (id: string) =>
  profileService.revokeSession(id).catch((e: unknown) => {
    if (e instanceof HttpError && e.status === 404) return
    throw e
  })

export function useSessions() {
  const [sessions, setSessions] = useState<AuthSessionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [target, setTarget] = useState<RevokeTarget | null>(null)
  const [revoking, setRevoking] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setError(undefined)
    profileService
      .sessions()
      .then((list) => setSessions(sortSessions(list)))
      .catch((e: unknown) => setError(errorMessage(e, 'Không tải được danh sách thiết bị')))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  const others = useMemo(() => sessions.filter((s) => !s.current), [sessions])

  const confirm = async () => {
    if (!target || revoking) return
    const ids = target.kind === 'one' ? [target.session.id] : others.map((s) => s.id)
    setRevoking(true)
    const results = await Promise.allSettled(ids.map(revokeOne))
    const done = new Set(ids.filter((_, i) => results[i].status === 'fulfilled'))
    const failed = results.find((r): r is PromiseRejectedResult => r.status === 'rejected')
    setSessions((list) => list.filter((s) => !done.has(s.id)))
    setRevoking(false)
    setTarget(null)
    if (failed) return toast.error(errorMessage(failed.reason, 'Không đăng xuất được thiết bị, vui lòng thử lại'))
    toast.success(target.kind === 'one' ? 'Đã đăng xuất thiết bị' : `Đã đăng xuất ${done.size} thiết bị khác`)
  }

  return {
    sessions,
    othersCount: others.length,
    loading,
    error,
    reload: load,
    target,
    revoking,
    askRevoke: (session: AuthSessionItem) => setTarget({ kind: 'one', session }),
    askRevokeOthers: () => setTarget({ kind: 'others', count: others.length }),
    cancel: () => !revoking && setTarget(null),
    confirm,
  }
}

export type SessionsState = ReturnType<typeof useSessions>
