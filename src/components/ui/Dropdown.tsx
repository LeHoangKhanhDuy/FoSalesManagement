import {
  cloneElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type KeyboardEvent,
  type KeyboardEventHandler,
  type MouseEvent,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'

export type DropdownAlign = 'start' | 'center' | 'end'
export type DropdownSide = 'top' | 'right' | 'bottom' | 'left'
export type DropdownWidth = number | string
export type DropdownIconType = ElementType

export interface DropdownBaseItemProps {
  icon?: DropdownIconType
  label: ReactNode
  description?: ReactNode
  disabled?: boolean
  shortcut?: ReactNode
  className?: string
}

export interface DropdownDangerProps {
  danger?: boolean
}

interface TriggerProps {
  ref?: Ref<HTMLElement>
  onClick?: MouseEventHandler<HTMLElement>
  onKeyDown?: KeyboardEventHandler<HTMLElement>
  disabled?: boolean
  'aria-haspopup'?: 'menu'
  'aria-expanded'?: boolean
  'aria-controls'?: string
  'data-state'?: 'open' | 'closed'
}

const SIDE_OFFSET = 8
const COLLISION_PADDING = 16
const ITEM_SELECTOR = '[role="menuitem"]:not([aria-disabled="true"])'

const DropdownContext = createContext<{ close: () => void } | null>(null)

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), Math.max(min, max))

interface DropdownProps {
  trigger: ReactElement<TriggerProps>
  children: ReactNode
  align?: DropdownAlign
  side?: DropdownSide
  width?: DropdownWidth
  disabled?: boolean
  className?: string
}

export function Dropdown({ trigger, children, align = 'end', side = 'bottom', width, disabled, className }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<{ top: number; left: number; side: DropdownSide } | null>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const focusFirstRef = useRef(false)
  const contentId = useId()

  const close = useCallback((restoreFocus = true) => {
    setOpen(false)
    setPosition(null)
    if (restoreFocus) triggerRef.current?.focus()
  }, [])

  const openMenu = (focusFirst: boolean) => {
    if (disabled) return
    focusFirstRef.current = focusFirst
    setOpen(true)
  }

  const getItems = () => Array.from(contentRef.current?.querySelectorAll<HTMLElement>(ITEM_SELECTOR) ?? [])

  const updatePosition = useCallback(() => {
    const t = triggerRef.current
    const c = contentRef.current
    if (!t || !c) return
    const r = t.getBoundingClientRect()
    const w = c.offsetWidth
    const h = c.offsetHeight
    const vw = window.innerWidth
    const vh = window.innerHeight
    const pad = COLLISION_PADDING
    const off = SIDE_OFFSET

    let s = side
    if (s === 'bottom' && r.bottom + off + h > vh - pad && r.top - off - h >= pad) s = 'top'
    else if (s === 'top' && r.top - off - h < pad && r.bottom + off + h <= vh - pad) s = 'bottom'
    else if (s === 'right' && r.right + off + w > vw - pad && r.left - off - w >= pad) s = 'left'
    else if (s === 'left' && r.left - off - w < pad && r.right + off + w <= vw - pad) s = 'right'

    let top: number
    let left: number
    if (s === 'bottom' || s === 'top') {
      top = s === 'bottom' ? r.bottom + off : r.top - off - h
      left = align === 'start' ? r.left : align === 'end' ? r.right - w : r.left + r.width / 2 - w / 2
    } else {
      left = s === 'right' ? r.right + off : r.left - off - w
      top = align === 'start' ? r.top : align === 'end' ? r.bottom - h : r.top + r.height / 2 - h / 2
    }
    setPosition({ top: clamp(top, pad, vh - pad - h), left: clamp(left, pad, vw - pad - w), side: s })
  }, [align, side])

  useLayoutEffect(() => {
    if (open) updatePosition()
  }, [open, updatePosition])

  const positioned = position !== null
  useEffect(() => {
    if (!positioned) return
    const first = contentRef.current?.querySelector<HTMLElement>(ITEM_SELECTOR)
    if (focusFirstRef.current && first) first.focus()
    else contentRef.current?.focus()
  }, [positioned])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (contentRef.current?.contains(target) || triggerRef.current?.contains(target)) return
      close(false)
    }
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open, close, updatePosition])

  const onContentKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const items = getItems()
    const index = items.indexOf(document.activeElement as HTMLElement)
    const focusAt = (i: number) => items[(i + items.length) % items.length]?.focus()

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        focusAt(index + 1)
        break
      case 'ArrowUp':
        e.preventDefault()
        focusAt(index < 0 ? items.length - 1 : index - 1)
        break
      case 'Home':
        e.preventDefault()
        focusAt(0)
        break
      case 'End':
        e.preventDefault()
        focusAt(items.length - 1)
        break
      case 'Escape':
        e.preventDefault()
        close()
        break
      case 'Tab':
        e.preventDefault()
        close()
        break
    }
  }

  const triggerProps = trigger.props
  const triggerElement = cloneElement(trigger, {
    ref: (node: HTMLElement | null) => {
      triggerRef.current = node
    },
    disabled: disabled ?? triggerProps.disabled,
    'aria-haspopup': 'menu',
    'aria-expanded': open,
    'aria-controls': open ? contentId : undefined,
    'data-state': open ? 'open' : 'closed',
    onClick: (e: MouseEvent<HTMLElement>) => {
      triggerProps.onClick?.(e)
      if (e.defaultPrevented) return
      if (open) close(false)
      else openMenu(false)
    },
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
      triggerProps.onKeyDown?.(e)
      if (e.defaultPrevented) return
      if (['ArrowDown', 'Enter', ' '].includes(e.key)) {
        e.preventDefault()
        openMenu(true)
      }
    },
  })

  const contentStyle: CSSProperties = {
    top: position?.top ?? 0,
    left: position?.left ?? 0,
    visibility: position ? 'visible' : 'hidden',
    ...(width ? { width: typeof width === 'number' ? `${width}px` : width } : {}),
  }

  return (
    <>
      {triggerElement}
      {open &&
        createPortal(
          <DropdownContext.Provider value={{ close: () => close() }}>
            <div
              ref={contentRef}
              id={contentId}
              role="menu"
              tabIndex={-1}
              data-side={position?.side ?? side}
              onKeyDown={onContentKeyDown}
              style={contentStyle}
              className={cn(
                'fixed z-[10000] max-w-[calc(100vw-2rem)] min-w-[220px] overflow-hidden rounded-lg border border-slate-100 bg-white p-1 text-slate-700 shadow-xl shadow-slate-950/10 outline-none',
                position && 'animate-scale-in',
                className,
              )}
            >
              {children}
            </div>
          </DropdownContext.Provider>,
          document.body,
        )}
    </>
  )
}

export function DropdownIcon({ icon: Icon, className }: { icon?: DropdownIconType; className?: string }) {
  if (!Icon) return null
  return (
    <span className={cn('flex h-4 w-4 shrink-0 items-center justify-center', className)}>
      <Icon className="h-4 w-4" aria-hidden="true" />
    </span>
  )
}

interface DropdownItemProps extends DropdownBaseItemProps, DropdownDangerProps {
  onClick?: MouseEventHandler<HTMLDivElement>
  active?: boolean
}

export function DropdownItem({
  icon,
  label,
  description,
  danger,
  disabled,
  shortcut,
  onClick,
  active,
  className,
}: DropdownItemProps) {
  const ctx = useContext(DropdownContext)

  const select = (e: MouseEvent<HTMLDivElement>) => {
    if (disabled) return
    onClick?.(e)
    if (!e.defaultPrevented) ctx?.close()
  }

  return (
    <div
      role="menuitem"
      tabIndex={disabled ? undefined : -1}
      aria-disabled={disabled || undefined}
      data-disabled={disabled ? '' : undefined}
      onClick={select}
      onMouseMove={(e) => !disabled && e.currentTarget.focus()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          e.currentTarget.click()
        }
      }}
      className={cn(
        'group my-0.5 flex min-h-9 cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm outline-none transition-colors select-none',
        !active && 'text-slate-700 hover:bg-slate-100 focus:bg-slate-100',
        'data-[disabled]:pointer-events-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
        danger && !active && 'text-rose-600 hover:bg-rose-50 focus:bg-rose-50 focus:text-rose-600',
        active && 'bg-primary-50 text-primary-700 hover:bg-primary-100/70 focus:bg-primary-100/70',
        className,
      )}
    >
      <DropdownIcon
        icon={icon}
        className={cn(
          danger ? 'text-rose-600' : 'text-slate-400 group-hover:text-slate-700 group-focus:text-slate-700',
          active && 'text-primary-600 group-hover:text-primary-600 group-focus:text-primary-600',
        )}
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{label}</span>
        {description ? (
          <span className={cn('mt-0.5 block truncate text-xs text-slate-400', active && 'text-primary-600/70')}>
            {description}
          </span>
        ) : null}
      </span>
      {shortcut ? (
        <span className={cn('ml-auto shrink-0 text-xs font-medium text-slate-400', active && 'text-primary-600/70')}>
          {shortcut}
        </span>
      ) : null}
    </div>
  )
}

export function DropdownLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('px-3 py-2 text-xs font-bold tracking-wide text-slate-400 uppercase', className)}>{children}</div>
  )
}

export function DropdownSeparator({ className }: { className?: string }) {
  return <div role="separator" className={cn('my-1 border-t border-slate-100', className)} />
}

export interface FilterDropdownProps<T extends string> {
  icon: LucideIcon
  label: string
  title: string
  value: T
  options: { value: T; label: string; icon?: LucideIcon; count?: number }[]
  onChange: (value: T) => void
  active?: boolean
}

export function FilterDropdown<T extends string>({ icon: Icon, label, title, value, options, onChange, active }: FilterDropdownProps<T>) {
  return (
    <Dropdown
      align="start"
      trigger={
        <button
          className={cn(
            'group flex h-11 cursor-pointer items-center gap-2 rounded-lg border bg-white px-3 text-sm transition hover:border-slate-300 focus-visible:outline-none data-[state=open]:border-primary-500 data-[state=open]:ring-4 data-[state=open]:ring-primary-100',
            active ? 'border-primary-300 text-primary-700' : 'border-slate-200 text-slate-600',
          )}
        >
          <Icon className={cn('size-4', active ? 'text-primary-600' : 'text-slate-400')} />
          <span className="font-medium whitespace-nowrap">{label}</span>
          <ChevronDown className="size-4 text-slate-400 transition group-data-[state=open]:rotate-180" />
        </button>
      }
    >
      <DropdownLabel>{title}</DropdownLabel>
      {options.map((o) => (
        <DropdownItem
          key={o.value}
          icon={o.icon}
          label={o.label}
          active={o.value === value}
          shortcut={
            o.count !== undefined ? (
              <span className="flex items-center gap-1.5">
                <span className={cn('rounded-full px-2 text-[11px] leading-5 font-semibold', o.value === value ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-500')}>{o.count}</span>
                {o.value === value && <Check className="size-4" />}
              </span>
            ) : o.value === value ? (
              <Check className="size-4" />
            ) : undefined
          }
          onClick={() => onChange(o.value)}
        />
      ))}
    </Dropdown>
  )
}
