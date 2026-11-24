import { Fragment } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, House, UserRound, type LucideIcon } from 'lucide-react'
import { findNavItem } from '@/config/navigation'
import { useClock } from '@/hooks/useClock'
import { formatDate, formatTime } from '@/lib/format'
import { PATHS } from '@/routes/paths'

const EXTRA_CRUMBS: Record<string, { label: string; icon?: LucideIcon }[]> = {
  [PATHS.profile]: [{ label: 'Tài khoản' }, { label: 'Hồ sơ cá nhân', icon: UserRound }],
}

export function PageBar() {
  const { pathname } = useLocation()
  const now = useClock(30_000)
  const nav = findNavItem(pathname)

  const crumbs: { label: string; icon?: LucideIcon }[] = nav && nav.item.path !== '/' ? [{ label: nav.group.title }, { label: nav.item.label, icon: nav.item.icon }] : (EXTRA_CRUMBS[pathname] ?? [])

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-5 pb-4 lg:px-6">
      <nav className="flex items-center gap-2 text-sm">
        <Link to="/" className="flex items-center gap-1.5 text-slate-500 hover:text-primary-600">
          <House className="size-4" /> Trang chủ
        </Link>
        {crumbs.filter((c, i) => c.label !== crumbs[i - 1]?.label).map((c, i, list) => {
          const Icon = c.icon
          const last = i === list.length - 1
          return (
            <Fragment key={`${i}-${c.label}`}>
              <ChevronRight className="size-4 text-slate-300" />
              <span className={last ? 'flex items-center gap-1.5 font-semibold text-slate-900' : 'text-slate-500'}>
                {Icon && <Icon className="size-4" />}
                {c.label}
              </span>
            </Fragment>
          )
        })}
      </nav>
      <p className="text-xs text-slate-500 first-letter:uppercase">
        {formatDate(now)} <span className="mx-1 text-slate-300">·</span>
        <span className="font-semibold text-slate-900">{formatTime(now)}</span>
      </p>
    </div>
  )
}
