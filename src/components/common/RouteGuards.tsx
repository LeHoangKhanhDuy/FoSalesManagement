import type { ReactNode } from 'react'
import { LoaderCircle } from 'lucide-react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/modules/auth/hooks/useAuth'
import { PATHS } from '@/routes/paths'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, checking } = useAuth()
  const location = useLocation()
  if (checking) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 text-slate-400">
        <LoaderCircle className="size-8 animate-spin" />
      </div>
    )
  }
  if (!isAuthenticated) return <Navigate to={PATHS.login} replace state={{ from: location.pathname }} />
  return children
}

export function GuestOnly({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to={PATHS.pos} replace />
  return children
}
