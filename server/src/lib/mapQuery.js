/**
 * 地图公开 API 查询逻辑（与 src/api/map.ts filterPoints / sortPointsByLocation 对齐）
 */

function getDistanceKm(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180
  const earthRadiusKm = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDistanceText(km) {
  if (km < 1) return `距您约${Math.round(km * 1000)}米`
  return `距您约${km.toFixed(1)}公里`
}

function sortPointsByLocation(list, latitude, longitude) {
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

export function parseBoolQuery(value) {
  if (value === undefined || value === null || value === '') return undefined
  if (value === true || value === 'true' || value === '1') return true
  if (value === false || value === 'false' || value === '0') return false
  return undefined
}

export function parseNumberQuery(value) {
  if (value === undefined || value === null || value === '') return undefined
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

export function filterMapPoints(list, params = {}) {
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

export function filterMapRoutes(list, params = {}) {
  let routes = [...list]
  if (params.scene) {
    routes = routes.filter((item) => item.scene === params.scene)
  }
  if (params.duration) {
    routes = routes.filter((item) => {
      const minutes = Number.parseInt(String(item.durationText).replace(/[^\d]/g, ''), 10)
      return !Number.isNaN(minutes) && minutes <= params.duration
    })
  }
  return routes
}

export function sortMapCategories(list) {
  return [...list].sort((a, b) => (a.sort || 0) - (b.sort || 0))
}

/** 管理端列表：先按分类顺序，同分类内按标题、id 排序（新建点位归入对应分类区段） */
export function sortAdminMapPoints(points, categories = []) {
  const categoryOrder = new Map(
    sortMapCategories(categories).map((cat, index) => [cat.key, index]),
  )

  return [...points].sort((a, b) => {
    const catA = categoryOrder.get(a.category) ?? 9999
    const catB = categoryOrder.get(b.category) ?? 9999
    if (catA !== catB) return catA - catB

    const titleCmp = String(a.title || '').localeCompare(String(b.title || ''), 'zh-CN')
    if (titleCmp !== 0) return titleCmp

    return (a.id || 0) - (b.id || 0)
  })
}
