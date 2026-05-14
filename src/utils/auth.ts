/// <reference types="@dcloudio/types" />

const TOKEN_KEY = 'traveluniapp_token'
const USER_PROFILE_KEY = 'traveluniapp_user_profile'

export type UserProfile = {
  id?: number
  visitorId: string
  nickname?: string
  avatarUrl?: string
  phone?: string
}

export function getToken(): string {
  return uni.getStorageSync(TOKEN_KEY) || ''
}

export function setToken(token: string) {
  uni.setStorageSync(TOKEN_KEY, token)
}

export function clearToken() {
  uni.removeStorageSync(TOKEN_KEY)
}

export function isLoggedIn(): boolean {
  return Boolean(getToken())
}

export function getUserProfile(): UserProfile | null {
  return uni.getStorageSync(USER_PROFILE_KEY) || null
}

export function setUserProfile(profile: UserProfile) {
  uni.setStorageSync(USER_PROFILE_KEY, profile)
}

export function clearUserProfile() {
  uni.removeStorageSync(USER_PROFILE_KEY)
}

export function getDisplayName(profile = getUserProfile()): string {
  if (!profile) return ''
  return profile.nickname || profile.visitorId
}

export function clearAuth() {
  clearToken()
  clearUserProfile()
}

export function saveLoginSession(token: string, profile: UserProfile) {
  setToken(token)
  setUserProfile(profile)
}
