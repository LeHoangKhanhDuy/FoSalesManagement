import { HttpError } from '@/lib/http'
import { PASSWORD_RULE_MESSAGE, STRONG_PASSWORD } from '@/modules/auth/utils/auth.utils'
import type { AuthSessionItem, ChangePasswordValues, Profile, ProfileFormValues, UpdateProfilePayload } from '@/modules/profile/types/profile.types'

export type ProfileErrors = Partial<Record<keyof ProfileFormValues, string>>
export type PasswordErrors = Partial<Record<keyof ChangePasswordValues, string>>

export const collapseSpaces = (value: string) => value.trim().replace(/\s+/g, ' ')

export const normalizePhone = (value: string) => {
  const digits = value.replace(/[^\d+]/g, '')
  if (digits.startsWith('+84')) return `0${digits.slice(3)}`
  if (digits.startsWith('84') && digits.length === 11) return `0${digits.slice(2)}`
  return digits.replace(/\D/g, '')
}

export const formatPhoneDisplay = (phone: string) => {
  const d = phone.replace(/\D/g, '')
  return d.length === 10 ? `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}` : phone
}

export const profileToForm = (p: Profile): ProfileFormValues => ({ name: p.name, phone: p.phone, currentPassword: '' })

export const isPhoneChanged = (p: Profile, v: ProfileFormValues) => normalizePhone(v.phone) !== p.phone

export const buildProfilePayload = (p: Profile, v: ProfileFormValues): UpdateProfilePayload => {
  const payload: UpdateProfilePayload = {}
  const name = collapseSpaces(v.name)
  if (name !== p.name) payload.name = name
  if (isPhoneChanged(p, v)) {
    payload.phone = normalizePhone(v.phone)
    payload.currentPassword = v.currentPassword
  }
  return payload
}

export const validateProfile = (p: Profile, v: ProfileFormValues): ProfileErrors => {
  const e: ProfileErrors = {}
  const name = collapseSpaces(v.name)
  if (name.length < 2) e.name = 'Họ tên tối thiểu 2 ký tự'
  else if (name.length > 100) e.name = 'Họ tên tối đa 100 ký tự'
  if (!/^0\d{9}$/.test(normalizePhone(v.phone))) e.phone = 'Số điện thoại gồm 10 số, bắt đầu bằng 0'
  else if (isPhoneChanged(p, v) && !v.currentPassword) e.currentPassword = 'Nhập mật khẩu hiện tại để đổi số điện thoại'
  return e
}

export const validatePassword = (v: ChangePasswordValues): PasswordErrors => {
  const e: PasswordErrors = {}
  if (!v.currentPassword) e.currentPassword = 'Nhập mật khẩu hiện tại'
  if (!STRONG_PASSWORD.test(v.newPassword)) e.newPassword = PASSWORD_RULE_MESSAGE
  else if (v.newPassword === v.currentPassword) e.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại'
  if (v.confirmPassword !== v.newPassword) e.confirmPassword = 'Mật khẩu nhập lại không khớp'
  return e
}

export const passwordStrength = (value: string) => {
  let score = 0
  if (value.length >= 8) score += 1
  if (value.length >= 12) score += 1
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1
  if (/\d/.test(value)) score += 1
  if (/[^\p{L}\d]/u.test(value)) score += 1
  const level = !value ? 0 : score <= 2 ? 1 : score <= 3 ? 2 : 3
  return { level, label: ['', 'Yếu', 'Trung bình', 'Mạnh'][level] }
}

const FIELD_BY_CODE: Record<string, keyof ProfileFormValues | keyof ChangePasswordValues> = {
  PHONE_TAKEN: 'phone',
  AUTH_PASSWORD_REQUIRED: 'currentPassword',
  AUTH_INVALID_PASSWORD: 'currentPassword',
}

export const fieldFromError = (error: unknown) => (error instanceof HttpError && error.code ? FIELD_BY_CODE[error.code] : undefined)

export const formatDateTimeVi = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Chưa có'

export const sortSessions = (list: AuthSessionItem[]) =>
  [...list].sort((a, b) => Number(b.current) - Number(a.current) || new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime())

export const isMobileAgent = (userAgent: string) => /android|ios|iphone|ipad|mobile/i.test(userAgent)

export const sessionLabel = (userAgent: string) => userAgent.trim() || 'Thiết bị không xác định'
