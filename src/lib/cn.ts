import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Gộp className + xử lý xung đột class Tailwind */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
