import { API_PATHS } from '../config/api'
import { setUserProfile, type UserProfile } from '../utils/auth'
import { http } from '../utils/request'

export type UserProfileResponse = UserProfile & {
  displayName?: string
  createdAt?: string
}

export type UpdateUserProfilePayload = {
  nickname?: string
  avatarUrl?: string
}

export async function fetchUserProfile(): Promise<UserProfileResponse> {
  const profile = await http.get<UserProfileResponse>(API_PATHS.user.profile)
  setUserProfile(profile)
  return profile
}

export async function updateUserProfile(payload: UpdateUserProfilePayload): Promise<UserProfileResponse> {
  const profile = await http.put<UserProfileResponse>(API_PATHS.user.profile, payload)
  setUserProfile(profile)
  return profile
}
