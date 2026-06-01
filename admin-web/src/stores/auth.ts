import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AdminUser } from '@/api/admin'

const TOKEN_KEY = 'admin_token'
const ADMIN_KEY = 'admin_user'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY) || '')
  const admin = ref<AdminUser | null>(
    localStorage.getItem(ADMIN_KEY) ? JSON.parse(localStorage.getItem(ADMIN_KEY)!) : null,
  )

  function setSession(t: string, user: AdminUser) {
    token.value = t
    admin.value = user
    localStorage.setItem(TOKEN_KEY, t)
    localStorage.setItem(ADMIN_KEY, JSON.stringify(user))
  }

  function logout() {
    token.value = ''
    admin.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(ADMIN_KEY)
  }

  const isLoggedIn = () => !!token.value

  return { token, admin, setSession, logout, isLoggedIn }
})
