import { clearCsrf, setUnauthorizedHandler } from '@/lib/http'
import type { AuthSession, UserRole } from '@/modules/auth/types/auth.types'

export const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Quản trị viên',
  manager: 'Quản lý cửa hàng',
  cashier: 'Thu ngân',
}

export const STRONG_PASSWORD = /^(?=.*\p{L})(?=.*\d).{8,128}$/u
export const PASSWORD_RULE_MESSAGE = 'Mật khẩu mới phải có từ 8 ký tự, gồm cả chữ và số'

const SESSION_KEY = 'fosales_session'
const LEGACY_TOKEN_KEY = 'fosales_token'
const LAST_USER_KEY = 'fosales_last_username'

type Listener = () => void
const listeners = new Set<Listener>()

const read = (): AuthSession | null => {
  try {
    localStorage.removeItem(LEGACY_TOKEN_KEY)
    const raw = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY)
    const session = raw ? (JSON.parse(raw) as AuthSession) : null
    return session?.user ? session : null
  } catch {
    return null
  }
}

const isPersistent = () => {
  try {
    return !!localStorage.getItem(SESSION_KEY)
  } catch {
    return false
  }
}

let current: AuthSession | null = read()
let restored = false

const notify = () => listeners.forEach((fn) => fn())

export const authStore = {
  get: () => current,
  isRestored: () => restored,
  subscribe: (fn: Listener) => {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },
  set: (session: AuthSession | null, remember = isPersistent()) => {
    current = session
    try {
      localStorage.removeItem(SESSION_KEY)
      sessionStorage.removeItem(SESSION_KEY)
      if (session) {
        ;(remember ? localStorage : sessionStorage).setItem(SESSION_KEY, JSON.stringify(session))
        localStorage.setItem(LAST_USER_KEY, session.user.username)
      } else {
        clearCsrf()
      }
    } catch {
      current = session
    }
    notify()
  },
  markRestored: () => {
    if (restored) return
    restored = true
    notify()
  },
  lastUsername: () => {
    try {
      return localStorage.getItem(LAST_USER_KEY) ?? ''
    } catch {
      return ''
    }
  },
}

setUnauthorizedHandler(() => {
  if (current) authStore.set(null)
})

export const initialsOf = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

export const greeting = (date = new Date()) => {
  const h = date.getHours()
  return h < 11 ? 'Chào buổi sáng' : h < 14 ? 'Chào buổi trưa' : h < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'
}
