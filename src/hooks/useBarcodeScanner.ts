import { useEffect, useRef } from 'react'

interface BarcodeScannerOptions {
  enabled?: boolean
  minLength?: number
  maxKeyInterval?: number
}

const isEditable = (el: EventTarget | null) => {
  if (!(el instanceof HTMLElement)) return false
  if (el.isContentEditable) return true
  if (el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) return true
  if (el instanceof HTMLInputElement) return !['checkbox', 'radio', 'button', 'submit', 'reset', 'range', 'color', 'file'].includes(el.type)
  return false
}

export function useBarcodeScanner(
  onScan: (code: string) => void,
  { enabled = true, minLength = 4, maxKeyInterval = 50 }: BarcodeScannerOptions = {},
) {
  const onScanRef = useRef(onScan)
  onScanRef.current = onScan

  useEffect(() => {
    if (!enabled) return
    let buffer = ''
    let lastTime = 0

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || isEditable(e.target)) {
        buffer = ''
        return
      }
      const now = performance.now()
      const fast = now - lastTime <= maxKeyInterval
      lastTime = now

      if (e.key === 'Enter' || e.key === 'Tab') {
        if (fast && buffer.length >= minLength) {
          e.preventDefault()
          e.stopPropagation()
          onScanRef.current(buffer)
        }
        buffer = ''
        return
      }

      if (e.key.length !== 1) return
      buffer = fast ? buffer + e.key : e.key
      if (buffer.length > 1) e.preventDefault()
    }

    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [enabled, minLength, maxKeyInterval])
}
