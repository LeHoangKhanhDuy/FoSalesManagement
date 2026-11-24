import type { UserRole } from '@/modules/auth/types/auth.types'

export interface ProfileStore {
  id: string
  code: string
  name: string
}

export interface Profile {
  id: string
  username: string
  phone: string
  name: string
  role: UserRole
  storeId: string
  store: ProfileStore | null
  lastLoginAt: string | null
  passwordChangedAt: string | null
  createdAt: string
}

export interface UpdateProfilePayload {
  name?: string
  phone?: string
  currentPassword?: string
}

export interface ProfileFormValues {
  name: string
  phone: string
  currentPassword: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export interface ChangePasswordValues extends ChangePasswordPayload {
  confirmPassword: string
}
