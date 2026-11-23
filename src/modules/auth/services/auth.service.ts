import { http } from '@/lib/http'
import type { AuthResponse, AuthUser, LoginPayload, ResetPasswordPayload } from '@/modules/auth/types/auth.types'

export const authService = {
  login: (payload: LoginPayload) => http.post<AuthResponse>('/api/auth/login', payload),
  me: () => http.get<AuthUser>('/api/auth/me'),
  logout: () => http.post<void>('/api/auth/logout'),
  requestReset: (account: string) => http.post<{ maskedTarget: string }>('/api/auth/forgot-password', { account }),
  resetPassword: (payload: ResetPasswordPayload) => http.post<void>('/api/auth/reset-password', payload),
}
