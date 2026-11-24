import { CircleAlert, LogOut, Monitor, RefreshCw, ShieldCheck, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/cn'
import { timeAgo } from '@/modules/inventory/utils/inventory.utils'
import type { SessionsState } from '@/modules/profile/hooks/useSessions'
import type { AuthSessionItem } from '@/modules/profile/types/profile.types'
import { formatDateTimeVi, isMobileAgent, sessionLabel } from '@/modules/profile/utils/profile.utils'

function SessionRow({ session, onRevoke }: { session: AuthSessionItem; onRevoke: () => void }) {
  const Icon = isMobileAgent(session.userAgent) ? Smartphone : Monitor
  return (
    <li className="flex items-center gap-3 px-5 py-3.5">
      <span className={cn('grid size-10 shrink-0 place-items-center rounded-lg', session.current ? 'bg-primary-50 text-primary-600' : 'bg-slate-100 text-slate-500')}>
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-800">
          {sessionLabel(session.userAgent)}
          {session.current && <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-semibold text-primary-700">Thiết bị này</span>}
          {session.remember && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">Ghi nhớ</span>}
        </p>
        <p className="mt-0.5 truncate text-xs text-slate-500">
          IP {session.ip} · {session.current ? 'Đang hoạt động' : `Hoạt động ${timeAgo(session.lastUsedAt).toLowerCase()}`}
        </p>
        <p className="text-[11px] text-slate-400">Đăng nhập lúc {formatDateTimeVi(session.createdAt)}</p>
      </div>
      {!session.current && (
        <Button variant="outline" size="sm" onClick={onRevoke} leftIcon={<LogOut className="size-3.5" />}>
          Đăng xuất
        </Button>
      )}
    </li>
  )
}

function RevokeModal({ s }: { s: SessionsState }) {
  const t = s.target
  if (!t) return null
  const title = t.kind === 'one' ? 'Đăng xuất thiết bị này?' : `Đăng xuất ${t.count} thiết bị khác?`
  const detail =
    t.kind === 'one'
      ? `${sessionLabel(t.session.userAgent)} (IP ${t.session.ip}) sẽ phải đăng nhập lại để tiếp tục sử dụng.`
      : 'Tất cả thiết bị trừ thiết bị bạn đang dùng sẽ phải đăng nhập lại.'
  return (
    <Modal
      open
      onClose={s.cancel}
      hideClose
      className="max-w-md"
      footer={
        <>
          <Button variant="outline" onClick={s.cancel} disabled={s.revoking}>
            Hủy
          </Button>
          <Button onClick={s.confirm} loading={s.revoking} className="bg-rose-600 shadow-none hover:bg-rose-700 active:bg-rose-800 disabled:bg-rose-300">
            Đăng xuất
          </Button>
        </>
      }
    >
      <div className="text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-rose-50 ring-8 ring-rose-50/50">
          <LogOut className="size-6 text-rose-500" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-slate-900">{title}</h3>
        <p className="mt-1.5 text-sm text-slate-500">{detail}</p>
      </div>
    </Modal>
  )
}

export function SessionsCard({ s }: { s: SessionsState }) {
  return (
    <Card>
      <CardHeader
        title="Thiết bị đăng nhập"
        description="Các phiên đang đăng nhập tài khoản của bạn"
        action={
          <div className="flex shrink-0 items-center gap-2">
            {s.othersCount > 0 && (
              <Button variant="danger" size="sm" onClick={s.askRevokeOthers}>
                Đăng xuất thiết bị khác
              </Button>
            )}
            <Button variant="ghost" size="icon-sm" onClick={s.reload} aria-label="Tải lại danh sách thiết bị" title="Tải lại">
              <RefreshCw className={cn('size-4', s.loading && 'animate-spin')} />
            </Button>
          </div>
        }
      />
      {s.error && !s.sessions.length ? (
        <p className="m-5 flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
          <CircleAlert className="size-4 shrink-0" /> {s.error}
        </p>
      ) : s.loading && !s.sessions.length ? (
        <div className="space-y-3 p-5">
          {[0, 1].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      ) : (
        <ul className="mt-3 divide-y divide-slate-100 border-t border-slate-100">
          {s.sessions.map((session) => (
            <SessionRow key={session.id} session={session} onRevoke={() => s.askRevoke(session)} />
          ))}
        </ul>
      )}
      {!s.loading && !s.error && s.othersCount === 0 && (
        <p className="flex items-center gap-2 border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
          <ShieldCheck className="size-4 text-primary-600" /> Chỉ có thiết bị này đang đăng nhập
        </p>
      )}
      <RevokeModal s={s} />
    </Card>
  )
}
