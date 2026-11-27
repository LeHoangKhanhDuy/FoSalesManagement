import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'

const EXIT_DURATION = 250

interface DrawerProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  description?: ReactNode
  headerExtra?: ReactNode
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export function Drawer({ open, onClose, title, description, headerExtra, children, footer, className }: DrawerProps) {
  const panelRef = useRef<HTMLElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const [mounted, setMounted] = useState(open)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if (open) {
      setMounted(true)
      setClosing(false)
      return
    }
    if (!mounted) return
    setClosing(true)
    const timer = setTimeout(() => {
      setMounted(false)
      setClosing(false)
    }, EXIT_DURATION)
    return () => clearTimeout(timer)
  }, [open, mounted])

  useEffect(() => {
    if (!mounted) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !open) return
      const dialogs = document.querySelectorAll('[aria-modal="true"]')
      if (dialogs[dialogs.length - 1] !== panelRef.current) return
      onCloseRef.current()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [mounted, open])

  if (!mounted) return null

  return createPortal(
    <div className={cn('fixed inset-0 z-50 flex justify-end', closing && 'pointer-events-none')}>
      <div className={cn('absolute inset-0 bg-slate-900/40', closing ? 'animate-fade-out' : 'animate-fade-in')} onClick={onClose} />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative flex h-full w-full max-w-[520px] flex-col bg-white shadow-2xl will-change-transform',
          closing ? 'animate-slide-out-right' : 'animate-slide-in-right',
          className,
        )}
      >
        <header className="flex items-start gap-3 px-6 py-4">
          <div className="min-w-0 flex-1">
            {title && <h2 className="truncate text-lg font-bold text-slate-900 uppercase">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
          </div>
          {headerExtra}
          <button
            onClick={onClose}
            className="-mr-2 grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Đóng"
          >
            <X className="size-5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <footer className="flex items-center gap-2 px-6 py-4">{footer}</footer>}
      </aside>
    </div>,
    document.body,
  )
}
