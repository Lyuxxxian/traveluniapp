/// <reference types="@dcloudio/types" />

import { API_BASE_URL, API_TIMEOUT } from '../config/api'
import { clearAuth, getToken } from './auth'

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export type ApiResponse<T> = {
  code: number
  message: string
  data: T
}

export type RequestOptions = {
  url: string
  method?: RequestMethod
  data?: unknown
  header?: Record<string, string>
  auth?: boolean
  showErrorToast?: boolean
}

function buildUrl(url: string): string {
  if (/^https?:\/\//.test(url)) return url
  return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`
}

function handleUnauthorized() {
  clearAuth()
  uni.showToast({ title: '登录已失效，请重新登录', icon: 'none' })
  uni.reLaunch({ url: '/pages/login/login' })
}

export function request<T = unknown>(options: RequestOptions): Promise<T> {
  const token = getToken()
  const shouldUseAuth = options.auth !== false
  const header: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.header,
  }

  if (shouldUseAuth && token) {
    header.Authorization = `Bearer ${token}`
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: buildUrl(options.url),
      method: (options.method || 'GET') as UniApp.RequestOptions['method'],
      data: options.data as UniApp.RequestOptions['data'],
      header,
      timeout: API_TIMEOUT,
      success: (response) => {
        const statusCode = response.statusCode
        const responseData = response.data as ApiResponse<T>

        if (statusCode === 401 || responseData?.code === 401) {
          handleUnauthorized()
          reject(new Error(responseData?.message || '登录已失效'))
          return
        }

        if (statusCode < 200 || statusCode >= 300) {
          const message = responseData?.message || `请求失败（${statusCode}）`
          if (options.showErrorToast !== false) {
            uni.showToast({ title: message, icon: 'none' })
          }
          reject(new Error(message))
          return
        }

        if (responseData && typeof responseData.code === 'number' && responseData.code !== 200) {
          const message = responseData.message || '请求失败'
          if (options.showErrorToast !== false) {
            uni.showToast({ title: message, icon: 'none' })
          }
          reject(new Error(message))
          return
        }

        resolve(responseData?.data ?? (response.data as T))
      },
      fail: (error) => {
        const message = error.errMsg || '网络异常，请稍后再试'
        if (options.showErrorToast !== false) {
          uni.showToast({ title: message, icon: 'none' })
        }
        reject(new Error(message))
      },
    })
  })
}

export const http = {
  get<T = unknown>(url: string, data?: unknown, options?: Omit<RequestOptions, 'url' | 'method' | 'data'>) {
    return request<T>({ ...options, url, method: 'GET', data })
  },

  post<T = unknown>(url: string, data?: unknown, options?: Omit<RequestOptions, 'url' | 'method' | 'data'>) {
    return request<T>({ ...options, url, method: 'POST', data })
  },

  put<T = unknown>(url: string, data?: unknown, options?: Omit<RequestOptions, 'url' | 'method' | 'data'>) {
    return request<T>({ ...options, url, method: 'PUT', data })
  },

  delete<T = unknown>(url: string, data?: unknown, options?: Omit<RequestOptions, 'url' | 'method' | 'data'>) {
    return request<T>({ ...options, url, method: 'DELETE', data })
  },
}
