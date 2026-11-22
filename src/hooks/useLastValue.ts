import { useRef } from 'react'

export function useLastValue<T>(value: T | null | undefined): T | null {
  const ref = useRef<T | null>(value ?? null)
  if (value !== null && value !== undefined) ref.current = value
  return ref.current
}
