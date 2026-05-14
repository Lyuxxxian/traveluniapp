import { API_PATHS } from '../config/api'
import { saveLoginSession, setUserProfile, type UserProfile } from '../utils/auth'
import { http } from '../utils/request'

export type LoginPayload = {
  username: string
  password: string
}

export type LoginResponse = {
  token: string
  user: UserProfile
}

export type UserProfileResponse = UserProfile & {
  displayName?: string
  createdAt?: string
}

export type UpdateUserProfilePayload = {
  nickname?: string
  avatarUrl?: string
}

function createMockLoginSession(username: string): LoginResponse {
  const visitorId = `灵山居士_${username || '12345'}`

  return {
    token: `mock_token_${Date.now()}`,
    user: {
      id: Date.now(),
      visitorId,
      nickname: '',
      avatarUrl: '/static/logo.png',
    },
  }
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  try {
    const session = await http.post<LoginResponse>(API_PATHS.auth.login, payload, {
      auth: false,
      showErrorToast: false,
    })
    saveLoginSession(session.token, session.user)
    return session
  } catch (error) {
    if (import.meta.env.DEV) {
      const session = createMockLoginSession(payload.username.trim())
      saveLoginSession(session.token, session.user)
      return session
    }

    throw error
  }
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
