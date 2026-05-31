import { API_PATHS } from '../config/api'
import { MAP_CATEGORIES, MAP_POINT_SEEDS, MAP_ROUTES } from './mapData'

/** 开发联调：在 .env 设置 VITE_MAP_SIMULATE_API_ERROR=true 可验证 fallback */
const SIMULATE_MAP_API_ERROR = import.meta.env.VITE_MAP_SIMULATE_API_ERROR === 'true'

function simulateApiError() {
  if (SIMULATE_MAP_API_ERROR) {
    return Promise.reject(new Error('MAP_API_SIMULATED_ERROR'))
  }
  return null
}

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

/** 粗数据阶段仅保留核心景点略详说明，其余走列表基础字段 */
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
        text.toLowerCase().includes(keyword),
      ),
    )
  }

  if (params.includeClosed === false) {
    result = result.filter((item) => item.status !== 'closed')
  }

  return sortPointsByLocation(result, params.latitude, params.longitude)
}

export async function fetchMapCategories(): Promise<MapCategory[]> {
  const simulated = simulateApiError()
  if (simulated) return simulated
  // TODO: 对接后端 GET ${API_PATHS.map.categories}
  // return http.get<MapCategory[]>(API_PATHS.map.categories, undefined, { auth: false })
  return Promise.resolve([...fallbackMapCategories])
}

export async function fetchMapPoints(params: MapPointQuery = {}): Promise<MapPoint[]> {
  const simulated = simulateApiError()
  if (simulated) return simulated
  // TODO: 对接后端 GET ${API_PATHS.map.points}
  // return http.get<MapPoint[]>(API_PATHS.map.points, params, { auth: false })
  return Promise.resolve(filterPoints(fallbackMapPoints, params))
}

export async function fetchMapPointDetail(id: number): Promise<MapPointDetail | null> {
  const simulated = simulateApiError()
  if (simulated) return simulated
  // TODO: 对接后端 GET ${API_PATHS.map.pointDetail}/:id
  // return http.get<MapPointDetail>(`${API_PATHS.map.pointDetail}/${id}`, undefined, { auth: false })
  const point = fallbackMapPoints.find((item) => item.id === id)
  if (!point) return Promise.resolve(null)
  const extras = detailExtras[id] || {}
  return Promise.resolve({ ...point, ...extras })
}

export async function fetchMapRoutes(params: MapRouteQuery = {}): Promise<MapRoute[]> {
  const simulated = simulateApiError()
  if (simulated) return simulated
  // TODO: 对接后端 GET ${API_PATHS.map.routes}
  // return http.get<MapRoute[]>(API_PATHS.map.routes, params, { auth: false })
  let list = [...mockRoutes]
  if (params.scene) {
    list = list.filter((item) => item.scene === params.scene)
  }
  if (params.duration) {
    list = list.filter((item) => {
      const minutes = Number.parseInt(item.durationText.replace(/[^\d]/g, ''), 10)
      return !Number.isNaN(minutes) && minutes <= params.duration!
    })
  }
  return Promise.resolve(list)
}

void API_PATHS
