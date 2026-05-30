export type ApiEnv = 'development' | 'test' | 'production'

const DEFAULT_API_BASE_URL = 'http://localhost:3000'

const envBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined

export const API_BASE_URL = envBaseUrl || DEFAULT_API_BASE_URL

export const API_TIMEOUT = 15000

export const API_PATHS = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
  },
  user: {
    profile: '/api/user/profile',
  },
  upload: {
    image: '/api/upload/image',
  },
  home: {
    config: '/api/home/config',
    shows: '/api/shows',
    weather: '/api/home/weather',
  },
  discover: {
    posts: '/api/discover/posts',
    detail: '/api/discover/posts',
  },
  search: {
    hotKeywords: '/api/search/hot-keywords',
    global: '/api/search',
  },
  map: {
    categories: '/api/map/categories',
    points: '/api/map/points',
    pointDetail: '/api/map/points',
    routes: '/api/map/routes',
  },
} as const

// Never expose third-party API keys in frontend code.
// AI provider calls should go through your backend, then backend reads the key from server env.
export const AI_PROXY_PATHS = {
  chat: '/api/ai-service/chat',
  faqs: '/api/ai-service/faqs',
} as const
