import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Bell, Check, ChevronDown, LogOut, Menu, Search, Settings, Store, UserRound } from 'lucide-react'
import { Kbd } from '@/components/ui/Kbd'
import { useClickOutside } from '@/hooks/useClickOutside'
import { useHotkey } from '@/hooks/useHotkey'
import { cn } from '@/lib/cn'
import { useAuth } from '@/modules/auth/hooks/useAuth'
import { PATHS } from '@/routes/paths'

const STORES = [
  { id: 'hcm-01', name: 'FoTech Mart Quận 1', code: 'CN-HCM01' },
  { id: 'hcm-07', name: 'FoTech Mart Quận 7', code: 'CN-HCM07' },
  { id: 'hn-01', name: 'FoTech Mart Cầu Giấy', code: 'CN-HN01' },
]

export function Header({ onOpenMenu }: { onOpenMenu: () => void }) {
  const [storeId, setStoreId] = useState(STORES[0].id)
  const [storeOpen, setStoreOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const storeRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const store = STORES.find((s) => s.id === storeId) ?? STORES[0]
  const { user, roleLabel, initials, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    setUserOpen(false)
    await logout()
    toast.success('Đã đăng xuất')
    navigate(PATHS.login, { replace: true })
  }

  useClickOutside(storeRef, () => setStoreOpen(false), storeOpen)
  useClickOutside(userRef, () => setUserOpen(false), userOpen)
  useHotkey('ctrl+k', () => searchRef.current?.focus())

  return (
    <header className="sticky top-0 z-30 flex h-[76px] shrink-0 items-center gap-3 border-b border-slate-100 bg-white/85 px-4 backdrop-blur-md lg:px-6">
      <button
        onClick={onOpenMenu}
        className="grid size-10 cursor-pointer place-items-center rounded-lg border border-slate-200 text-slate-600 lg:hidden"
        aria-label="Mở menu"
      >
        <Menu className="size-5" />
      </button>

      <div ref={storeRef} className="relative">
        <button
          onClick={() => setStoreOpen((v) => !v)}
          className="flex h-12 cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white pr-3 pl-2 shadow-soft transition hover:border-slate-300"
        >
          <span className="grid size-8 place-items-center rounded-lg bg-primary-50 text-primary-600">
            <Store className="size-[18px]" />
          </span>
          <span className="hidden text-left leading-tight sm:block">
            <span className="block text-[13px] font-bold text-slate-900">{store.name}</span>
            <span className="block text-[10px] font-semibold tracking-wide text-slate-400">{store.code}</span>
          </span>
          <ChevronDown className={cn('size-4 text-slate-400 transition', storeOpen && 'rotate-180')} />
        </button>
        {storeOpen && (
          <div className="absolute top-14 left-0 w-64 animate-slide-up rounded-lg border border-slate-100 bg-white p-1.5 shadow-card">
            <p className="px-2.5 py-1.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase">Chi nhánh</p>
            {STORES.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setStoreId(s.id)
                  setStoreOpen(false)
                }}
                className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-left hover:bg-slate-50"
              >
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-slate-800">{s.name}</span>
                  <span className="block text-[11px] text-slate-400">{s.code}</span>
                </span>
                {s.id === storeId && <Check className="size-4 text-primary-600" />}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mx-auto hidden w-full max-w-md md:block">
        <label className="flex h-11 items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3.5 transition focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-100">
          <Search className="size-[18px] text-slate-400" />
          <input
            ref={searchRef}
            placeholder="Tìm kiếm đơn hàng, sản phẩm, khách hàng..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
          <Kbd>Ctrl K</Kbd>
        </label>
      </div>

      <div className="ml-auto flex items-center gap-2 md:ml-0">
        <button
          className="relative grid size-11 cursor-pointer place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          aria-label="Thông báo"
        >
          <Bell className="size-5" />
          <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        <div ref={userRef} className="relative">
          <button
            onClick={() => setUserOpen((v) => !v)}
            className="flex h-12 cursor-pointer items-center gap-2.5 rounded-lg border border-slate-200 bg-white pr-3 pl-1.5 shadow-soft transition hover:border-slate-300"
          >
            <span className="grid size-9 place-items-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 text-xs font-bold text-white">
              {initials}
            </span>
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-[13px] font-bold text-slate-900">{user?.name}</span>
              <span className="block text-[11px] text-slate-400">{roleLabel}</span>
            </span>
            <ChevronDown className="size-4 text-slate-400" />
          </button>
          {userOpen && (
            <div className="absolute top-14 right-0 w-56 animate-slide-up rounded-lg border border-slate-100 bg-white p-1.5 shadow-card">
              <div className="px-2.5 py-2">
                <p className="truncate text-sm font-semibold text-slate-900">{user?.name}</p>
                <p className="truncate text-xs text-slate-400">
                  @{user?.username} · {roleLabel}
                </p>
              </div>
              <div className="my-1 h-px bg-slate-100" />
              {[
                { icon: UserRound, label: 'Hồ sơ của tôi' },
                { icon: Settings, label: 'Cài đặt' },
              ].map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Icon className="size-4 text-slate-400" /> {label}
                </button>
              ))}
              <div className="my-1 h-px bg-slate-100" />
              <button onClick={handleLogout} className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-rose-600 hover:bg-rose-50">
                <LogOut className="size-4" /> Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
