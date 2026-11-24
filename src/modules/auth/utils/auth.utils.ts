import { clearCsrf, setUnauthorizedHandler } from '@/lib/http'
import type { AuthSession, UserRole } from '@/modules/auth/types/auth.types'

export const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Quản trị viên',
  manager: 'Quản lý cửa hàng',
  cashier: 'Thu ngân',
}

export const STRONG_PASSWORD = /^(?=.*\p{L})(?=.*\d).{8,128}$/u
export const PASSWORD_RULE_MESSAGE = 'Mật khẩu mới phải có từ 8 ký tự, gồm cả chữ và số'

export const OTP_LENGTH = 6
export const OTP_TTL_SECONDS = 300
export const OTP_RESEND_SECONDS = 60

export type ResetField = 'otp' | 'newPassword' | 'confirm' | 'form'
export type ResetErrors = Partial<Record<ResetField, string>>
export interface ResetValues {
  otp: string
  newPassword: string
  confirm: string
}

export const EMPTY_RESET: ResetValues = { otp: '', newPassword: '', confirm: '' }

export const validateAccount = (account: string) => (account.trim() ? undefined : 'Nhập tên đăng nhập hoặc số điện thoại')

export const validateReset = ({ otp, newPassword, confirm }: ResetValues): ResetErrors => {
  const errors: ResetErrors = {}
  if (!new RegExp(`^\\d{${OTP_LENGTH}}$`).test(otp)) errors.otp = `Mã OTP gồm ${OTP_LENGTH} chữ số`
  if (!STRONG_PASSWORD.test(newPassword)) errors.newPassword = PASSWORD_RULE_MESSAGE
  if (!confirm) errors.confirm = 'Nhập lại mật khẩu mới'
  else if (confirm !== newPassword) errors.confirm = 'Mật khẩu nhập lại không khớp'
  return errors
}

export const resetFieldFromCode = (code?: string): ResetField => {
  if (code?.includes('OTP')) return 'otp'
  if (code?.includes('PASSWORD')) return 'newPassword'
  return 'form'
}

export const formatSeconds = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

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

const persist = (session: AuthSession | null, remember: boolean) => {
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
}

const channel = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel('fosales-auth')

channel?.addEventListener('message', (event: MessageEvent<AuthSession | null>) => {
  const session = event.data
  if (!session) {
    if (current) persist(null, false)
    return
  }
  current = session
  notify()
})

export const authStore = {
  get: () => current,
  isRestored: () => restored,
  subscribe: (fn: Listener) => {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },
  set: (session: AuthSession | null, remember = isPersistent()) => {
    persist(session, remember)
    channel?.postMessage(session)
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
