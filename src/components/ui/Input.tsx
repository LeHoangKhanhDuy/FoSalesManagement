import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ReactNode
  rightSlot?: ReactNode
  wrapperClassName?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, wrapperClassName, leftIcon, rightSlot, ...props }, ref) => (
    <div
      className={cn(
        'group flex h-11 items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3.5 transition-all focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-100',
        wrapperClassName,
      )}
    >
      {leftIcon && (
        <span className="text-slate-400 transition-colors group-focus-within:text-primary-600 [&_svg]:size-[18px]">
          {leftIcon}
        </span>
      )}
      <input
        ref={ref}
        className={cn(
          'h-full w-full min-w-0 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400',
          className,
        )}
        {...props}
      />
      {rightSlot}
    </div>
  ),
)
Input.displayName = 'Input'
