import type { AuthSession, UserRole } from '@/modules/auth/types/auth.types'

export const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Quản trị viên',
  manager: 'Quản lý cửa hàng',
  cashier: 'Thu ngân',
}

export const DEMO_ACCOUNTS: { username: string; password: string; role: UserRole }[] = [
  { username: 'admin', password: '123456', role: 'admin' },
  { username: 'thungan', password: '123456', role: 'cashier' },
]

export const MAX_ATTEMPTS = 5
export const LOCK_SECONDS = 30

const SESSION_KEY = 'fosales_session'
const TOKEN_KEY = 'fosales_token'
const LAST_USER_KEY = 'fosales_last_username'

type Listener = () => void
const listeners = new Set<Listener>()

const read = (): AuthSession | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session = JSON.parse(raw) as AuthSession
    return new Date(session.expiresAt).getTime() > Date.now() ? session : null
  } catch {
    return null
  }
}

let current: AuthSession | null = read()

export const authStore = {
  get: () => current,
  subscribe: (fn: Listener) => {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },
  set: (session: AuthSession | null, remember = true) => {
    current = session
    try {
      localStorage.removeItem(SESSION_KEY)
      sessionStorage.removeItem(SESSION_KEY)
      localStorage.removeItem(TOKEN_KEY)
      if (session) {
        ;(remember ? localStorage : sessionStorage).setItem(SESSION_KEY, JSON.stringify(session))
        localStorage.setItem(TOKEN_KEY, session.token)
        localStorage.setItem(LAST_USER_KEY, session.user.username)
      }
    } catch {
      current = session
    }
    listeners.forEach((fn) => fn())
  },
  lastUsername: () => {
    try {
      return localStorage.getItem(LAST_USER_KEY) ?? ''
    } catch {
      return ''
    }
  },
}

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
