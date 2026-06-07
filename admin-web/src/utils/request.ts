import axios from 'axios'

/** 生产同域反代时可留空；开发默认 localhost:3000 */
function resolveApiBaseUrl() {
  const fromEnv = import.meta.env.VITE_API_BASE_URL
  if (fromEnv) return fromEnv
  if (import.meta.env.PROD) return ''
  return 'http://localhost:3000'
}

const baseURL = resolveApiBaseUrl()

export type ApiResponse<T> = {
  code: number
  message: string
  data: T
}

const client = axios.create({
  baseURL,
  timeout: 15000,
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (res) => {
    const body = res.data as ApiResponse<unknown>
    if (body && typeof body.code === 'number' && body.code !== 200) {
      return Promise.reject(new Error(body.message || '请求失败'))
    }
    return res
  },
  (err) => {
    if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
      const hint = baseURL
        ? `无法连接 API（${baseURL}），请确认后端已启动且 VITE_API_BASE_URL 正确`
        : '无法连接 API，请确认 Nginx 已反代 /api/ 或设置 VITE_API_BASE_URL'
      return Promise.reject(new Error(hint))
    }
    return Promise.reject(err)
  },
)

export async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const res = await client.get<ApiResponse<T>>(url, { params })
  return res.data.data
}

export async function apiPost<T>(url: string, data?: unknown): Promise<T> {
  const res = await client.post<ApiResponse<T>>(url, data)
  return res.data.data
}

export async function apiPut<T>(url: string, data?: unknown): Promise<T> {
  const res = await client.put<ApiResponse<T>>(url, data)
  return res.data.data
}

export async function apiDelete<T>(url: string): Promise<T> {
  const res = await client.delete<ApiResponse<T>>(url)
  return res.data.data
}
