import { NavLink } from 'react-router-dom'
import { LifeBuoy, X } from 'lucide-react'
import { Logo } from '@/components/common/Logo'
import { NAVIGATION } from '@/config/navigation'
import { cn } from '@/lib/cn'

interface SidebarProps {
  mobileOpen: boolean
  onCloseMobile: () => void
}

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  return (
    <>
      <div
        onClick={onCloseMobile}
        className={cn(
          'fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[1px] transition-opacity lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col border-r border-slate-100 bg-white transition-transform duration-300 lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-[76px] shrink-0 items-center justify-between px-5">
          <Logo />
          <button
            onClick={onCloseMobile}
            className="grid size-9 cursor-pointer place-items-center rounded-lg text-slate-400 hover:bg-slate-100 lg:hidden"
            aria-label="Đóng menu"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="scrollbar-none flex-1 space-y-5 overflow-y-auto px-3 pt-2 pb-4">
          {NAVIGATION.map((group) => (
            <div key={group.title}>
              <p className="mb-1.5 px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase">{group.title}</p>
              <ul className="space-y-0.5">
                {group.items.map(({ label, path, icon: Icon, badge }) => (
                  <li key={path}>
                    <NavLink
                      to={path}
                      end
                      onClick={onCloseMobile}
                      className={({ isActive }) =>
                        cn(
                          'group flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all',
                          isActive
                            ? 'bg-primary-600 font-semibold text-white shadow-primary'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            className={cn(
                              'size-[18px] shrink-0',
                              isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary-600',
                            )}
                          />
                          <span className="flex-1 truncate">{label}</span>
                          {badge && (
                            <span
                              className={cn(
                                'rounded-full px-2 py-px text-[10px] font-bold',
                                isActive ? 'bg-white/20 text-white' : 'bg-primary-600 text-white',
                              )}
                            >
                              {badge}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="shrink-0 p-3">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 p-4 text-white">
            <div className="absolute -top-6 -right-6 size-24 rounded-full bg-white/10" />
            <div className="absolute -right-2 -bottom-10 size-20 rounded-full bg-white/10" />
            <LifeBuoy className="mb-2 size-5" />
            <p className="text-sm font-bold">Cần hỗ trợ?</p>
            <p className="mt-0.5 text-xs text-primary-100">Đội ngũ FoTech luôn sẵn sàng 24/7</p>
            <button className="relative mt-3 h-8 w-full cursor-pointer rounded-lg bg-white text-xs font-semibold text-primary-700 hover:bg-primary-50">
              Liên hệ ngay
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
