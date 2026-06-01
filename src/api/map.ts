import { API_PATHS } from '../config/api'
import { http } from '../utils/request'
import { MAP_CATEGORIES, MAP_POINT_SEEDS, MAP_ROUTES } from './mapData'

/**
 * 后端联调：.env 设置 VITE_MAP_USE_REMOTE_API=true 走真实 /api/map/*
 * 失败或空数据时自动回退 mock/fallback，不白屏
 * 模拟失败：VITE_MAP_SIMULATE_API_ERROR=true
 */
const USE_REMOTE_MAP_API = import.meta.env.VITE_MAP_USE_REMOTE_API === 'true'
const SIMULATE_MAP_API_ERROR = import.meta.env.VITE_MAP_SIMULATE_API_ERROR === 'true'

const MAP_HTTP_OPTS = { auth: false, showErrorToast: false } as const

/** 保留冻结的 5 类，并支持新增分类 key */
export type MapCategoryKey =
  | 'spot'
  | 'food'
  | 'toilet'
  | 'parking'
  | 'service'
  | 'entrance'
  | 'drinking'
  | 'nursery'
  | 'ticket'
  | 'facility'
  | 'guide'
  | 'shop'
  | 'hotel'
  | 'shuttle'
  | 'medical'
  | 'rest'
  | 'smoking'
  | 'plant'
  | (string & {})

export type MapPointStatus = 'open' | 'closed' | 'busy'

export type MapRouteScene = 'culture' | 'family' | 'relax' | 'food'

export type MapCategory = {
  key: string
  label: string
  icon: string
  color: string
  sort: number
}

export type MapPoint = {
  id: number
  category: string
  title: string
  latitude: number
  longitude: number
  address: string
  desc: string
  openTime?: string
  status?: MapPointStatus
  tags?: string[]
  iconKey?: string
  distanceText?: string
}

export type MapPointDetail = MapPoint & {
  images?: string[]
  suggestedDuration?: string
  serviceTags?: string[]
  relatedShowIds?: number[]
  relatedProductIds?: number[]
}

export type MapRoute = {
  id: number
  title: string
  scene: MapRouteScene
  durationText: string
  pointIds: number[]
  desc: string
}

export type MapPointQuery = {
  category?: string
  keyword?: string
  latitude?: number
  longitude?: number
  includeClosed?: boolean
}

export type MapRouteQuery = {
  scene?: MapRouteScene | string
  duration?: number
}

type MapPointSeed = Omit<MapPoint, 'category' | 'iconKey' | 'status'> & {
  category?: string
  iconKey?: string
  status?: MapPointStatus
}

function seedToPoint(category: string, seed: MapPointSeed): MapPoint {
  const { category: seedCategory, iconKey, status, ...rest } = seed
  return {
    ...rest,
    category: seedCategory ?? category,
    iconKey: iconKey ?? category,
    status: status ?? 'open',
  }
}

function buildPointsFromSeeds(): MapPoint[] {
  return Object.entries(MAP_POINT_SEEDS).flatMap(([category, seeds]) =>
    seeds.map((seed) => seedToPoint(category, seed)),
  )
}

export const fallbackMapCategories: MapCategory[] = [...MAP_CATEGORIES]

export const fallbackMapPoints: MapPoint[] = buildPointsFromSeeds()

const mockRoutes: MapRoute[] = MAP_ROUTES as MapRoute[]

const detailExtras: Record<number, Omit<MapPointDetail, keyof MapPoint>> = {
  101: {
    images: ['https://cdn.example.com/map/101.jpg'],
    suggestedDuration: '45分钟',
    serviceTags: ['讲解', '拍照', '无障碍'],
  },
  103: {
    suggestedDuration: '20分钟',
    serviceTags: ['演出'],
  },
  104: {
    suggestedDuration: '40分钟',
    serviceTags: ['参观', '讲解'],
  },
}

function simulateApiError(): Promise<never> | null {
  if (SIMULATE_MAP_API_ERROR) {
    return Promise.reject(new Error('MAP_API_SIMULATED_ERROR'))
  }
  return null
}

function isValidCategory(item: unknown): item is MapCategory {
  if (!item || typeof item !== 'object') return false
  const row = item as MapCategory
  return Boolean(row.key && row.label)
}

function isValidPoint(item: unknown): item is MapPoint {
  if (!item || typeof item !== 'object') return false
  const row = item as MapPoint
  return (
    Number.isFinite(row.id)
    && Boolean(row.category && row.title)
    && Number.isFinite(row.latitude)
    && Number.isFinite(row.longitude)
  )
}

function normalizeCategories(data: unknown): MapCategory[] {
  if (!Array.isArray(data)) return []
  return data.filter(isValidCategory).sort((a, b) => (a.sort || 0) - (b.sort || 0))
}

function normalizePoints(data: unknown): MapPoint[] {
  if (!Array.isArray(data)) return []
  return data.filter(isValidPoint)
}

function normalizeRoutes(data: unknown, params: MapRouteQuery = {}): MapRoute[] {
  if (!Array.isArray(data)) return []
  let list = data.filter((item) => item && typeof item === 'object') as MapRoute[]
  if (params.scene) {
    list = list.filter((item) => item.scene === params.scene)
  }
  if (params.duration) {
    list = list.filter((item) => {
      const minutes = Number.parseInt(String(item.durationText).replace(/[^\d]/g, ''), 10)
      return !Number.isNaN(minutes) && minutes <= params.duration!
    })
  }
  return list
}

function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const earthRadiusKm = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDistanceText(km: number) {
  if (km < 1) return `距您约${Math.round(km * 1000)}米`
  return `距您约${km.toFixed(1)}公里`
}

function sortPointsByLocation(list: MapPoint[], latitude?: number, longitude?: number) {
  if (latitude === undefined || longitude === undefined) return list
  return [...list]
    .map((item) => {
      const km = getDistanceKm(latitude, longitude, item.latitude, item.longitude)
      return { item, km }
    })
    .sort((a, b) => a.km - b.km)
    .map(({ item, km }) => ({
      ...item,
      distanceText: formatDistanceText(km),
    }))
}

function filterPoints(list: MapPoint[], params: MapPointQuery = {}): MapPoint[] {
  let result = [...list]

  if (params.category) {
    result = result.filter((item) => item.category === params.category)
  }

  const keyword = params.keyword?.trim().toLowerCase()
  if (keyword) {
    result = result.filter((item) =>
      [item.title, item.desc, item.address, ...(item.tags || [])].some((text) =>
        String(text).toLowerCase().includes(keyword),
      ),
    )
  }

  if (params.includeClosed === false) {
    result = result.filter((item) => item.status !== 'closed')
  }

  return sortPointsByLocation(result, params.latitude, params.longitude)
}

function getLocalPointDetail(id: number): MapPointDetail | null {
  const point = fallbackMapPoints.find((item) => item.id === id)
  if (!point) return null
  return { ...point, ...(detailExtras[id] || {}) }
}

async function fetchRemoteOrFallback<T>(
  remoteFetcher: () => Promise<T>,
  fallback: () => T,
  isEmpty: (data: T) => boolean = () => false,
): Promise<T> {
  const simulated = simulateApiError()
  if (simulated) return simulated

  if (!USE_REMOTE_MAP_API) {
    return Promise.resolve(fallback())
  }

  try {
    const data = await remoteFetcher()
    if (isEmpty(data)) {
      return fallback()
    }
    return data
  } catch {
    return fallback()
  }
}

export async function fetchMapCategories(): Promise<MapCategory[]> {
  return fetchRemoteOrFallback(
    () => http.get<MapCategory[]>(API_PATHS.map.categories, undefined, MAP_HTTP_OPTS).then(normalizeCategories),
    () => [...fallbackMapCategories],
    (data) => !data.length,
  )
}

export async function fetchMapPoints(params: MapPointQuery = {}): Promise<MapPoint[]> {
  return fetchRemoteOrFallback(
    () =>
      http
        .get<MapPoint[]>(API_PATHS.map.points, params, MAP_HTTP_OPTS)
        .then((data) => sortPointsByLocation(normalizePoints(data), params.latitude, params.longitude)),
    () => filterPoints(fallbackMapPoints, params),
    (data) => !data.length,
  )
}

export async function fetchMapPointDetail(id: number): Promise<MapPointDetail | null> {
  const simulated = simulateApiError()
  if (simulated) return simulated

  if (USE_REMOTE_MAP_API) {
    try {
      const detail = await http.get<MapPointDetail>(
        `${API_PATHS.map.pointDetail}/${id}`,
        undefined,
        MAP_HTTP_OPTS,
      )
      if (detail && isValidPoint(detail)) {
        return detail
      }
    } catch {
      // fallback below
    }
  }

  return Promise.resolve(getLocalPointDetail(id))
}

export async function fetchMapRoutes(params: MapRouteQuery = {}): Promise<MapRoute[]> {
  return fetchRemoteOrFallback(
    () => http.get<MapRoute[]>(API_PATHS.map.routes, params, MAP_HTTP_OPTS).then((data) => normalizeRoutes(data, params)),
    () => normalizeRoutes(mockRoutes, params),
    (data) => !data.length,
  )
}

/** 是否已开启远程地图 API（供调试展示） */
export function isMapRemoteApiEnabled() {
  return USE_REMOTE_MAP_API
}
