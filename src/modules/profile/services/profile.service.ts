import { http } from '@/lib/http'
import type { ChangePasswordPayload, Profile, UpdateProfilePayload } from '@/modules/profile/types/profile.types'

export const profileService = {
  get: () => http.get<Profile>('/api/profile'),
  update: (payload: UpdateProfilePayload) => http.patch<Profile>('/api/profile', payload),
  changePassword: (payload: ChangePasswordPayload) => http.post<unknown>('/api/auth/change-password', payload),
}
