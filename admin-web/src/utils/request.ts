import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

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
  (err) => Promise.reject(err),
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
