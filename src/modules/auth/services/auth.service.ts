import { http } from '@/lib/http'
import type { AuthResponse, AuthUser, ForgotPasswordPayload, ForgotPasswordResponse, LoginPayload, ResetPasswordPayload } from '@/modules/auth/types/auth.types'

export const authService = {
  login: (payload: LoginPayload) => http.post<AuthResponse>('/api/auth/login', payload),
  me: () => http.get<AuthUser>('/api/auth/me'),
  logout: () => http.post<void>('/api/auth/logout'),
  forgotPassword: (payload: ForgotPasswordPayload) => http.post<ForgotPasswordResponse | undefined>('/api/auth/forgot-password', payload),
  resetPassword: (payload: ResetPasswordPayload) => http.post<void>('/api/auth/reset-password', payload),
}
