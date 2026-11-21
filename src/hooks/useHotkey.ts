import { useEffect, useRef } from 'react'

/**
 * Đăng ký phím tắt toàn cục. Ví dụ: useHotkey('F2', focusSearch)
 * Hỗ trợ tổ hợp: 'ctrl+k', 'shift+F9'
 */
export function useHotkey(combo: string, handler: (e: KeyboardEvent) => void, enabled = true) {
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    if (!enabled) return
    const parts = combo.toLowerCase().split('+')
    const key = parts.pop()
    const listener = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== key) return
      if (parts.includes('ctrl') !== (e.ctrlKey || e.metaKey)) return
      if (parts.includes('shift') !== e.shiftKey) return
      if (parts.includes('alt') !== e.altKey) return
      e.preventDefault()
      handlerRef.current(e)
    }
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [combo, enabled])
}
