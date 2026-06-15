import { API_PATHS } from '../config/api'
import { getToken, getUserProfile, saveLoginSession, setUserProfile } from '../utils/auth'
import type { UserProfile } from '../utils/auth'
import { http } from '../utils/request'

const WECHAT_UID_KEY = 'traveluniapp_wechat_uid'

export type LoginPayload = {
  username: string
  password: string
  wechatId?: string
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

export type VisitorInfo = {
  id: number
  name: string
  phone: string
  idCard: string
  isDefault?: boolean
}

export type CreateVisitorPayload = {
  name: string
  phone: string
  idCard: string
  isDefault?: boolean
}

export type FetchUserProfileOptions = {
  silent?: boolean
}

function getOrCreateWechatUid(): string {
  let id = uni.getStorageSync(WECHAT_UID_KEY) as string
  if (!id) {
    id = `wx_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    uni.setStorageSync(WECHAT_UID_KEY, id)
  }
  return id
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const session = await http.post<LoginResponse>(API_PATHS.auth.login, payload, {
    auth: false,
    showErrorToast: false,
  })
  saveLoginSession(session.token, session.user)
  return session
}

export function loginByWechat(): Promise<LoginResponse> {
  const wechatId = getOrCreateWechatUid()
  return login({
    username: wechatId,
    password: 'wechat_auth',
    wechatId,
  })
}

export function loginByPhone(phone: string): Promise<LoginResponse> {
  return login({
    username: phone.trim(),
    password: 'phone_auth',
  })
}

export async function register(username: string, password: string): Promise<LoginResponse> {
  const session = await http.post<LoginResponse>(
    API_PATHS.auth.register,
    { username: username.trim(), password },
    { auth: false, showErrorToast: false },
  )
  saveLoginSession(session.token, session.user)
  return session
}

export async function fetchUserProfile(options: FetchUserProfileOptions = {}): Promise<UserProfileResponse> {
  if (!getToken()) {
    throw new Error('未登录')
  }
  const profile = await http.get<UserProfileResponse>(API_PATHS.user.profile, undefined, {
    showErrorToast: !options.silent,
  })
  setUserProfile(profile)
  return profile
}

export async function updateUserProfile(payload: UpdateUserProfilePayload): Promise<UserProfileResponse> {
  const profile = await http.put<UserProfileResponse>(API_PATHS.user.profile, payload)
  setUserProfile(profile)
  return profile
}

export function getCachedUserProfile(): UserProfile | null {
  return getUserProfile()
}

export async function fetchVisitors(): Promise<VisitorInfo[]> {
  if (!getToken()) return []
  return http.get<VisitorInfo[]>(API_PATHS.user.visitors)
}

export async function createVisitor(payload: CreateVisitorPayload): Promise<VisitorInfo> {
  return http.post<VisitorInfo>(API_PATHS.user.visitors, payload)
}
