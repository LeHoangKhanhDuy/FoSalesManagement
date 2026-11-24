import { http } from '@/lib/http'
import type { AuthSessionItem, ChangePasswordPayload, Profile, UpdateProfilePayload } from '@/modules/profile/types/profile.types'

export const profileService = {
  get: () => http.get<Profile>('/api/profile'),
  update: (payload: UpdateProfilePayload) => http.patch<Profile>('/api/profile', payload),
  sessions: () => http.get<AuthSessionItem[]>('/api/auth/sessions'),
  revokeSession: (id: string) => http.delete<void>(`/api/auth/sessions/${encodeURIComponent(id)}`),
  changePassword: (payload: ChangePasswordPayload) => http.post<unknown>('/api/auth/change-password', payload),
}
