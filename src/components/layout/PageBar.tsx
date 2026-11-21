import { Fragment } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, House } from 'lucide-react'
import { findNavItem } from '@/config/navigation'
import { useClock } from '@/hooks/useClock'
import { formatDate, formatTime } from '@/lib/format'

/** Thanh breadcrumb + ngày giờ — giống HRM */
export function PageBar() {
  const { pathname } = useLocation()
  const now = useClock(30_000)
  const nav = findNavItem(pathname)

  const crumbs = nav && nav.item.path !== '/' ? [{ label: nav.group.title }, { label: nav.item.label, icon: nav.item.icon }] : []

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-5 pb-4 lg:px-6">
      <nav className="flex items-center gap-2 text-sm">
        <Link to="/" className="flex items-center gap-1.5 text-slate-500 hover:text-primary-600">
          <House className="size-4" /> Trang chủ
        </Link>
        {crumbs.map((c, i) => {
          const Icon = c.icon
          const last = i === crumbs.length - 1
          return (
            <Fragment key={c.label}>
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
