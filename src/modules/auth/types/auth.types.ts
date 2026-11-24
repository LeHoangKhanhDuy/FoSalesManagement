export type UserRole = 'admin' | 'manager' | 'cashier'

export interface AuthUser {
  id: string
  username: string
  phone: string
  name: string
  role: UserRole
  storeId: string
}

export interface AuthSession {
  user: AuthUser
  expiresAt?: string
}

export interface AuthResponse {
  user: AuthUser
  expiresAt: string
  csrfToken: string
}

export interface LoginPayload {
  username: string
  password: string
  remember: boolean
}

export interface ForgotPasswordPayload {
  account: string
}

export interface ForgotPasswordResponse {
  maskedTarget?: string | null
  expiresIn?: number
  resendIn?: number
}

export interface ResetPasswordPayload {
  account: string
  otp: string
  newPassword: string
}
