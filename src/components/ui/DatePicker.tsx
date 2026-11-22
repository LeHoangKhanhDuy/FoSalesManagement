import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'

export type DateMatcher =
  | Date
  | Date[]
  | ((date: Date) => boolean)
  | { before?: Date; after?: Date }
  | { from: Date; to: Date }
  | { dayOfWeek: number[] }

export type DatePickerValue = Date | undefined
export type DatePickerMode = 'default' | 'past' | 'future'
export type CalendarView = 'days' | 'months' | 'years'

export interface DateValidationProps {
  mode?: DatePickerMode
  minDate?: Date
  maxDate?: Date
  disabledDates?: Date[]
  disablePast?: boolean
  disableFuture?: boolean
}

export interface DatePickerProps extends DateValidationProps {
  value?: Date
  onChange?: (date?: Date) => void
  placeholder?: string
  disabled?: boolean
  align?: 'start' | 'end'
  side?: 'top' | 'bottom' | 'auto'
  className?: string
}

export interface CalendarProps {
  className?: string
  disabled?: DateMatcher | DateMatcher[]
  mode?: 'single'
  selected?: Date
  onSelect?: (date?: Date) => void
  fromYear?: number
  toYear?: number
}

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] as const
const MONTHS = Array.from({ length: 12 }, (_, i) => i)
const POPUP_WIDTH = 340
const POPUP_HEIGHT = 350
const GAP = 12

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1)
const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1)
const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
const isSameMonth = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
const isBefore = (a: Date, b: Date) => a.getTime() < b.getTime()
const isAfter = (a: Date, b: Date) => a.getTime() > b.getTime()
const pad = (n: number) => String(n).padStart(2, '0')
const formatDay = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`

const getCalendarDays = (month: Date) => {
  const first = startOfMonth(month)
  const offset = (first.getDay() + 6) % 7
  const start = new Date(first.getFullYear(), first.getMonth(), 1 - offset)
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const total = Math.ceil((offset + daysInMonth) / 7) * 7
  return Array.from({ length: total }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i))
}

const matchMatcher = (day: Date, matcher: DateMatcher): boolean => {
  if (matcher instanceof Date) return isSameDay(day, matcher)
  if (Array.isArray(matcher)) return matcher.some((m) => matchMatcher(day, m))
  if (typeof matcher === 'function') return matcher(day)
  if ('dayOfWeek' in matcher) return matcher.dayOfWeek.includes(day.getDay())
  if ('from' in matcher) return !isBefore(day, matcher.from) && !isAfter(day, matcher.to)
  if (matcher.before && isBefore(day, matcher.before)) return true
  if (matcher.after && isAfter(day, matcher.after)) return true
  return false
}

const isDateDisabled = (day: Date, disabled?: DateMatcher | DateMatcher[]) => {
  if (!disabled) return false
  return Array.isArray(disabled) ? disabled.some((m) => matchMatcher(day, m)) : matchMatcher(day, disabled)
}

const gridButton =
  'h-11 cursor-pointer rounded-lg text-sm font-semibold text-slate-700 transition hover:bg-slate-100'
const gridButtonActive = 'bg-primary-600 text-white hover:bg-primary-600'

export function Calendar({
  className,
  disabled,
  selected,
  onSelect,
  fromYear = 1900,
  toYear = new Date().getFullYear() + 50,
}: CalendarProps) {
  const [displayMonth, setDisplayMonth] = useState(() => startOfMonth(selected ?? new Date()))
  const [view, setView] = useState<CalendarView>('days')
  const yearGridRef = useRef<HTMLDivElement>(null)
  const selectedYearRef = useRef<HTMLButtonElement>(null)

  const minYear = Math.min(fromYear, toYear)
  const maxYear = Math.max(fromYear, toYear)
  const days = useMemo(() => getCalendarDays(displayMonth), [displayMonth])
  const years = useMemo(() => Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i), [minYear, maxYear])

  useLayoutEffect(() => {
    const grid = yearGridRef.current
    const year = selectedYearRef.current
    if (view !== 'years' || !grid || !year) return
    grid.scrollTop = year.offsetTop - grid.clientHeight / 2 + year.clientHeight / 2
  }, [view, displayMonth, years])

  const shift = (direction: 1 | -1) => {
    if (view === 'years') {
      setDisplayMonth((cur) => {
        const year = Math.min(maxYear, Math.max(minYear, cur.getFullYear() + direction * 10))
        return new Date(year, cur.getMonth(), 1)
      })
      return
    }
    setDisplayMonth((cur) => addMonths(cur, direction))
  }

  const selectToday = () => {
    const today = startOfDay(new Date())
    setDisplayMonth(startOfMonth(today))
    onSelect?.(today)
  }

  const navButton =
    'flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-800'

  return (
    <section className={cn('w-full rounded-lg bg-white p-3 text-slate-700 sm:p-4', className)}>
      <div className="flex h-10 items-center justify-between">
        <button type="button" onClick={() => shift(-1)} className={navButton} aria-label="Tháng trước">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center justify-center gap-1 text-sm font-bold tracking-wide uppercase">
          <button
            type="button"
            onClick={() => setView(view === 'months' ? 'days' : 'months')}
            className="cursor-pointer rounded-lg px-2 py-1 text-primary-600 transition hover:bg-slate-100"
          >
            Tháng {displayMonth.getMonth() + 1}
          </button>
          <button
            type="button"
            onClick={() => setView(view === 'years' ? 'days' : 'years')}
            className="cursor-pointer rounded-lg px-2 py-1 text-slate-800 transition hover:bg-slate-100"
          >
            {displayMonth.getFullYear()}
          </button>
        </div>
        <button type="button" onClick={() => shift(1)} className={navButton} aria-label="Tháng sau">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {view === 'months' && (
        <div className="mt-5 grid grid-cols-3 gap-2">
          {MONTHS.map((month) => (
            <button
              key={month}
              type="button"
              onClick={() => {
                setDisplayMonth((cur) => new Date(cur.getFullYear(), month, 1))
                setView('days')
              }}
              className={cn(gridButton, month === displayMonth.getMonth() && gridButtonActive)}
            >
              Tháng {month + 1}
            </button>
          ))}
        </div>
      )}

      {view === 'years' && (
        <div ref={yearGridRef} className="scrollbar-none mt-5 grid max-h-64 grid-cols-3 gap-2 overflow-y-auto">
          {years.map((year) => {
            const active = year === displayMonth.getFullYear()
            return (
              <button
                key={year}
                ref={active ? selectedYearRef : undefined}
                type="button"
                onClick={() => {
                  setDisplayMonth((cur) => new Date(year, cur.getMonth(), 1))
                  setView('days')
                }}
                className={cn(gridButton, active && gridButtonActive)}
              >
                {year}
              </button>
            )
          })}
        </div>
      )}

      {view === 'days' && (
        <>
          <div className="mt-5 grid grid-cols-7 gap-1">
            {WEEKDAYS.map((w) => (
              <div key={w} className="flex h-8 items-center justify-center text-xs font-medium text-slate-400">
                {w}
              </div>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {days.map((day) => {
              const outside = !isSameMonth(day, displayMonth)
              const isDisabled = isDateDisabled(day, disabled)
              const isSelected = !!selected && isSameDay(day, selected)
              const isToday = isSameDay(day, new Date())
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => onSelect?.(day)}
                  className={cn(
                    'flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-sm font-semibold text-slate-700 transition sm:h-10 sm:w-10',
                    'hover:bg-slate-100 focus:bg-slate-100 focus:outline-none',
                    outside && 'text-slate-400/40',
                    isToday && 'border border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white',
                    isSelected && 'bg-primary-600 text-white shadow-xs hover:bg-primary-600 focus:bg-primary-600',
                    isDisabled && 'pointer-events-none cursor-not-allowed text-slate-400/25',
                  )}
                >
                  {day.getDate()}
                </button>
              )
            })}
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={selectToday}
              className="cursor-pointer rounded-lg px-2 py-1 text-sm font-semibold text-primary-600 transition hover:bg-slate-100"
            >
              Hôm nay
            </button>
            <button
              type="button"
              onClick={() => onSelect?.(undefined)}
              className="cursor-pointer rounded-lg px-2 py-1 text-sm font-semibold text-slate-400 transition hover:bg-slate-100 hover:text-slate-800"
            >
              Xóa chọn
            </button>
          </div>
        </>
      )}
    </section>
  )
}

function useDisabledMatchers({ mode = 'default', minDate, maxDate, disabledDates, disablePast, disableFuture }: DateValidationProps) {
  return useMemo<DateMatcher[]>(() => {
    const matchers: DateMatcher[] = []
    const today = startOfDay(new Date())
    if (minDate) matchers.push({ before: startOfDay(minDate) })
    if (maxDate) matchers.push({ after: startOfDay(maxDate) })
    if (disablePast || mode === 'future') matchers.push({ before: today })
    if (disableFuture || mode === 'past') matchers.push({ after: today })
    if (disabledDates?.length) matchers.push((date) => disabledDates.some((d) => isSameDay(d, date)))
    return matchers
  }, [mode, minDate, maxDate, disabledDates, disablePast, disableFuture])
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Chọn ngày',
  disabled,
  mode = 'default',
  minDate,
  maxDate,
  disabledDates,
  disablePast,
  disableFuture,
  align,
  side = 'bottom',
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const disabledMatchers = useDisabledMatchers({ mode, minDate, maxDate, disabledDates, disablePast, disableFuture })

  const updateCoords = useCallback(() => {
    const rect = wrapperRef.current?.getBoundingClientRect()
    if (!rect) return
    const width = Math.min(POPUP_WIDTH, window.innerWidth - 24)
    const spaceBelow = window.innerHeight - rect.bottom - GAP
    const spaceAbove = rect.top - GAP
    const toTop = side === 'top' || (side === 'auto' && spaceBelow < POPUP_HEIGHT && spaceAbove >= spaceBelow)
    const top = toTop
      ? Math.max(GAP, rect.top - POPUP_HEIGHT - 8)
      : Math.min(rect.bottom + 8, window.innerHeight - POPUP_HEIGHT - GAP)
    const alignRight = align === 'end' || (!align && rect.left + width > window.innerWidth - GAP)
    const left = alignRight
      ? Math.max(GAP, rect.right - width)
      : Math.max(GAP, Math.min(rect.left, window.innerWidth - width - GAP))
    setCoords({ top, left })
  }, [align, side])

  useEffect(() => {
    if (!open) return
    updateCoords()
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (!wrapperRef.current?.contains(target) && !popupRef.current?.contains(target)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('resize', updateCoords)
    window.addEventListener('scroll', updateCoords, true)
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('resize', updateCoords)
      window.removeEventListener('scroll', updateCoords, true)
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, updateCoords])

  const currentYear = new Date().getFullYear()
  const fromYear = minDate?.getFullYear() ?? (disablePast || mode === 'future' ? currentYear : 1900)
  const toYear = maxDate?.getFullYear() ?? (disableFuture || mode === 'past' ? currentYear : currentYear + 50)

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        data-state={open ? 'open' : 'closed'}
        className={cn(
          'flex h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 text-left text-sm text-slate-800 outline-none transition hover:border-primary-300 disabled:pointer-events-none disabled:opacity-50',
          !value && 'text-slate-400',
          className,
        )}
      >
        <span className="truncate">{value ? formatDay(value) : placeholder}</span>
        <CalendarIcon className="h-4 w-4 shrink-0 text-slate-400" />
      </button>

      {open &&
        coords &&
        createPortal(
          <div
            ref={popupRef}
            style={{ position: 'fixed', top: coords.top, left: coords.left, zIndex: 99999 }}
            className="w-[min(340px,calc(100vw-1.5rem))] animate-scale-in overflow-hidden rounded-lg border border-slate-100 bg-white shadow-2xl outline-none sm:w-[340px]"
          >
            <Calendar
              mode="single"
              selected={value}
              disabled={disabledMatchers}
              fromYear={fromYear}
              toYear={toYear}
              onSelect={(date) => {
                onChange?.(date)
                setOpen(false)
              }}
            />
          </div>,
          document.body,
        )}
    </div>
  )
}
