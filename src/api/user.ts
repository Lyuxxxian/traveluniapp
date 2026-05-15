import { API_PATHS } from '../config/api'
import { getUserProfile, saveLoginSession, setUserProfile } from '../utils/auth'
import type { UserProfile } from '../utils/auth'
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

export type FetchUserProfileOptions = {
  silent?: boolean
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

export function loginByWechat(): Promise<LoginResponse> {
  return login({
    username: 'wechat_member',
    password: 'wechat_auth',
  })
}

export function loginByPhone(phone: string): Promise<LoginResponse> {
  return login({
    username: phone,
    password: 'phone_auth',
  })
}

export async function fetchUserProfile(options: FetchUserProfileOptions = {}): Promise<UserProfileResponse> {
  try {
    const profile = await http.get<UserProfileResponse>(API_PATHS.user.profile, undefined, {
      showErrorToast: !options.silent,
    })
    setUserProfile(profile)
    return profile
  } catch (error) {
    const cachedProfile = getUserProfile()

    if (import.meta.env.DEV && cachedProfile) {
      return cachedProfile
    }

    throw error
  }
}

export async function updateUserProfile(payload: UpdateUserProfilePayload): Promise<UserProfileResponse> {
  const profile = await http.put<UserProfileResponse>(API_PATHS.user.profile, payload)
  setUserProfile(profile)
  return profile
}
