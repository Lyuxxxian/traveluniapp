/** H5 端高德地图 JS API 2.0 加载（Key 来自 .env.local，勿提交 Git） */

type AmapLngLat = { getLng: () => number; getLat: () => number }
type AmapMap = {
  setCenter: (center: [number, number]) => void
  setZoom: (zoom: number) => void
  add: (overlays: unknown | unknown[]) => void
  remove: (overlays: unknown | unknown[]) => void
  resize: () => void
  destroy: () => void
}
type AmapMarker = { on: (event: string, handler: () => void) => void }
type AmapNamespace = {
  Map: new (
    container: string | HTMLElement,
    options: { zoom: number; center: [number, number]; viewMode?: string },
  ) => AmapMap
  Marker: new (options: Record<string, unknown>) => AmapMarker
  Size: new (w: number, h: number) => unknown
  Pixel: new (x: number, y: number) => unknown
  Icon: new (options: Record<string, unknown>) => unknown
}

declare global {
  interface Window {
    _AMapSecurityConfig?: { securityJsCode: string }
    AMap?: AmapNamespace
  }
}

let loadPromise: Promise<AmapNamespace> | null = null

export function getAmapConfig() {
  const key = import.meta.env.VITE_AMAP_KEY as string | undefined
  const securityJsCode = import.meta.env.VITE_AMAP_SECURITY_JS_CODE as string | undefined
  return { key, securityJsCode }
}

export function loadAmapH5(): Promise<AmapNamespace> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('AMap 仅支持 H5 浏览器环境'))
  }

  const { key, securityJsCode } = getAmapConfig()
  if (!key || !securityJsCode) {
    return Promise.reject(new Error('请在 .env.local 配置 VITE_AMAP_KEY 与 VITE_AMAP_SECURITY_JS_CODE'))
  }

  if (window.AMap) {
    return Promise.resolve(window.AMap)
  }

  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve, reject) => {
    window._AMapSecurityConfig = { securityJsCode }

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.async = true
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${encodeURIComponent(key)}`
    script.onload = () => {
      if (window.AMap) {
        resolve(window.AMap)
        return
      }
      reject(new Error('高德地图脚本已加载但 AMap 未就绪'))
    }
    script.onerror = () => reject(new Error('高德地图脚本加载失败'))
    document.head.appendChild(script)
  })

  return loadPromise
}

export type H5MapPoint = {
  id: number
  latitude: number
  longitude: number
  title: string
}

export type H5MarkerOptions = {
  points: H5MapPoint[]
  markerColor: string
  markerIconUrl: string
  routeMode: boolean
  onMarkerClick: (pointId: number) => void
}

export const H5_MAP_CONTAINER_ID = 'amap-h5-container'

export function createH5Map(
  AMap: AmapNamespace,
  containerId: string,
  center: { latitude: number; longitude: number },
  zoom = 16,
) {
  const container = document.getElementById(containerId)
  if (!container) {
    throw new Error(`地图容器 #${containerId} 不存在`)
  }

  return new AMap.Map(containerId, {
    zoom,
    center: [center.longitude, center.latitude],
    viewMode: '2D',
  })
}

/** 等待 H5 地图容器挂载并具有尺寸（uni-app 页面切换时可能延迟） */
export async function waitForH5MapContainer(
  containerId = H5_MAP_CONTAINER_ID,
  maxTry = 30,
  intervalMs = 80,
): Promise<HTMLElement> {
  for (let i = 0; i < maxTry; i += 1) {
    const el = document.getElementById(containerId)
    if (el && el.offsetWidth > 0 && el.offsetHeight > 0) {
      return el
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }

  const fallback = document.getElementById(containerId)
  if (fallback) return fallback
  throw new Error(`地图容器 #${containerId} 未就绪`)
}

export function buildH5Markers(AMap: AmapNamespace, options: H5MarkerOptions) {
  const { points, markerColor, markerIconUrl, routeMode, onMarkerClick } = options

  return points.map((point, index) => {
    const labelContent = routeMode ? `${index + 1}. ${point.title}` : point.title
    const marker = new AMap.Marker({
      position: [point.longitude, point.latitude],
      title: point.title,
      icon: new AMap.Icon({
        image: markerIconUrl,
        size: new AMap.Size(28, 28),
        imageSize: new AMap.Size(28, 28),
      }),
      offset: new AMap.Pixel(-14, -28),
      label: {
        content: `<div style="padding:4px 8px;border-radius:12px;background:${markerColor};color:#fff;font-size:12px;border:1px solid ${markerColor};white-space:nowrap;">${labelContent}</div>`,
        direction: 'top',
      },
      zIndex: 100 + index,
    })

    marker.on('click', () => onMarkerClick(Number(point.id)))
    return marker
  })
}

export function toLngLat(center: { latitude: number; longitude: number }): [number, number] {
  return [center.longitude, center.latitude]
}
