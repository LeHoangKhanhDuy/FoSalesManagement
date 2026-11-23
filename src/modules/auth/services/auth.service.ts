import { USE_MOCK } from '@/lib/constants'
import { http, sleep } from '@/lib/http'
import { MOCK_USERS } from '@/modules/auth/mocks/users.mock'
import type { AuthSession, LoginPayload } from '@/modules/auth/types/auth.types'

export const authService = {
  async login({ username, password, remember }: LoginPayload): Promise<AuthSession> {
    if (!USE_MOCK) return http.post<AuthSession>('/api/auth/login', { username, password, remember })
    await sleep(700)
    const key = username.trim().toLowerCase()
    const found = MOCK_USERS.find((u) => u.username === key || u.phone === key.replace(/\D/g, ''))
    if (!found || found.password !== password) throw new Error('Tên đăng nhập hoặc mật khẩu không đúng')
    const { password: _, ...user } = found
    const ttl = (remember ? 30 : 1) * 86_400_000
    return { token: `mock.${crypto.randomUUID()}`, user, expiresAt: new Date(Date.now() + ttl).toISOString() }
  },

  async logout(): Promise<void> {
    if (!USE_MOCK) return http.post('/api/auth/logout')
    await sleep(150)
  },

  async requestReset(account: string): Promise<{ maskedTarget: string }> {
    if (!USE_MOCK) return http.post('/api/auth/forgot-password', { account })
    await sleep(800)
    const key = account.trim().toLowerCase()
    const found = MOCK_USERS.find((u) => u.username === key || u.phone === key.replace(/\D/g, ''))
    if (!found) throw new Error('Không tìm thấy tài khoản với thông tin này')
    return { maskedTarget: `${found.phone.slice(0, 3)}****${found.phone.slice(-3)}` }
  },
}
