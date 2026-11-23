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
  token: string
  user: AuthUser
  expiresAt: string
}

export interface LoginPayload {
  username: string
  password: string
  remember: boolean
}
