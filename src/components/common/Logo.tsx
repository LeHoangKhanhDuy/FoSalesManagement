import { cn } from '@/lib/cn'
import { APP_NAME, APP_SUBTITLE } from '@/lib/constants'
import logo from '@/assets/images/logo.png'

export function Logo({ collapsed, className }: { collapsed?: boolean; className?: string }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <img src={logo} alt={APP_NAME} className="size-11 shrink-0 object-contain" />
      {!collapsed && (
        <div className="leading-tight">
          <p className="text-[17px] font-extrabold tracking-tight text-slate-900">
            Fo<span className="text-primary-600">Sales</span>
          </p>
          <p className="text-[11px] font-medium text-slate-500">{APP_SUBTITLE}</p>
        </div>
      )}
    </div>
  )
}
