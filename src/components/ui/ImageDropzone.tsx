import { useRef, useState, type ClipboardEvent, type DragEvent, type ReactNode } from 'react'
import { IMAGE_ACCEPT, validateImageFile } from '@/lib/image'
import { cn } from '@/lib/cn'

interface ImageDropzoneProps {
  onFile: (file: File) => void
  onError?: (message: string) => void
  maxSizeMB?: number
  disabled?: boolean
  className?: string
  children: (state: { dragging: boolean; open: () => void }) => ReactNode
}

export function ImageDropzone({ onFile, onError, maxSizeMB = 5, disabled, className, children }: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const dragDepth = useRef(0)
  const [dragging, setDragging] = useState(false)

  const open = () => !disabled && inputRef.current?.click()

  const accept = (file?: File | null) => {
    if (!file || disabled) return
    const error = validateImageFile(file, maxSizeMB)
    if (error) onError?.(error)
    else onFile(file)
  }

  const hasFiles = (e: DragEvent) => Array.from(e.dataTransfer.types).includes('Files')

  const onDragEnter = (e: DragEvent) => {
    if (!hasFiles(e)) return
    e.preventDefault()
    dragDepth.current += 1
    setDragging(true)
  }

  const onDragLeave = (e: DragEvent) => {
    if (!hasFiles(e)) return
    dragDepth.current = Math.max(0, dragDepth.current - 1)
    if (dragDepth.current === 0) setDragging(false)
  }

  const onDrop = (e: DragEvent) => {
    if (!hasFiles(e)) return
    e.preventDefault()
    dragDepth.current = 0
    setDragging(false)
    accept(e.dataTransfer.files[0])
  }

  const onPaste = (e: ClipboardEvent) => {
    const file = Array.from(e.clipboardData.files).find((f) => f.type.startsWith('image/'))
    if (!file) return
    e.preventDefault()
    accept(file)
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Tải ảnh lên"
      aria-disabled={disabled}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          open()
        }
      }}
      onDragEnter={onDragEnter}
      onDragOver={(e) => hasFiles(e) && e.preventDefault()}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onPaste={onPaste}
      data-dragging={dragging || undefined}
      className={cn(
        'relative outline-none focus-visible:ring-4 focus-visible:ring-primary-100',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        className,
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT.join(',')}
        className="hidden"
        onChange={(e) => {
          accept(e.target.files?.[0])
          e.target.value = ''
        }}
      />
      {children({ dragging, open })}
    </div>
  )
}

interface DashedBorderProps {
  animated?: boolean
  radius?: number
  className?: string
}

export function DashedBorder({ animated, radius = 8, className }: DashedBorderProps) {
  return (
    <svg aria-hidden className={cn('pointer-events-none absolute inset-0 size-full overflow-visible', className)}>
      <rect
        x={1}
        y={1}
        rx={radius}
        ry={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeDasharray="8 6"
        strokeLinecap="round"
        style={{ width: 'calc(100% - 2px)', height: 'calc(100% - 2px)' }}
        className={cn(
          'motion-reduce:animate-none',
          animated ? 'animate-dash-march' : 'group-hover:animate-dash-march group-focus-visible:animate-dash-march',
        )}
      />
    </svg>
  )
}
