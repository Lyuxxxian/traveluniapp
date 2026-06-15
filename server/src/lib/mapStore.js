/** 地图 store 读写辅助（公开 API 与管理端共用） */

export const FROZEN_MAP_CATEGORY_KEYS = new Set([
  'spot',
  'food',
  'toilet',
  'parking',
  'service',
])

export const MAP_POINT_STATUSES = new Set(['open', 'closed', 'busy'])

export const MAP_DETAIL_KEYS = [
  'images',
  'suggestedDuration',
  'serviceTags',
  'relatedShowIds',
  'relatedProductIds',
]

export function getMapPointDetailExtras(store, id) {
  const details = store.mapPointDetails || {}
  return details[id] ?? details[String(id)] ?? {}
}

export function mergeMapPointDetail(store, point) {
  if (!point) return null
  return { ...point, ...getMapPointDetailExtras(store, point.id) }
}

export function pickMapDetailFromBody(body = {}) {
  const extras = {}
  MAP_DETAIL_KEYS.forEach((key) => {
    if (body[key] !== undefined) extras[key] = body[key]
  })
  return extras
}

export function setMapPointDetailExtras(store, id, extras) {
  if (!extras || !Object.keys(extras).length) return
  store.mapPointDetails = store.mapPointDetails || {}
  const key = String(id)
  store.mapPointDetails[key] = {
    ...getMapPointDetailExtras(store, id),
    ...extras,
  }
}

export function removeMapPointDetailExtras(store, id) {
  if (!store.mapPointDetails) return
  delete store.mapPointDetails[String(id)]
  delete store.mapPointDetails[id]
}

export function buildMapPointBase(body = {}, defaults = {}) {
  const category = body.category ?? defaults.category
  return {
    category,
    title: body.title ?? defaults.title,
    latitude: body.latitude ?? defaults.latitude,
    longitude: body.longitude ?? defaults.longitude,
    address: body.address ?? defaults.address,
    desc: body.desc ?? defaults.desc,
    openTime: body.openTime ?? defaults.openTime,
    status: body.status ?? defaults.status ?? 'open',
    tags: body.tags ?? defaults.tags,
    iconKey: category,
  }
}

export function validateMapPointBase(payload, store) {
  const categories = store.mapCategories || []
  if (!payload.category || !categories.some((c) => c.key === payload.category)) {
    return '分类不存在或无效'
  }
  if (!payload.title || !String(payload.title).trim()) return '缺少 title'
  if (!Number.isFinite(Number(payload.latitude)) || !Number.isFinite(Number(payload.longitude))) {
    return '经纬度无效'
  }
  if (!payload.address || !String(payload.address).trim()) return '缺少 address'
  if (!payload.desc || !String(payload.desc).trim()) return '缺少 desc'
  if (payload.status && !MAP_POINT_STATUSES.has(payload.status)) return 'status 枚举错误'
  return null
}

export function isMapPointReferencedInRoutes(store, id) {
  return (store.mapRoutes || []).some((route) => (route.pointIds || []).includes(id))
}

export function findMapCategory(store, key) {
  return (store.mapCategories || []).find((item) => item.key === key)
}

export function hasMapPointsInCategory(store, key) {
  return (store.mapPoints || []).some((point) => point.category === key)
}

export function validateMapCategoryCreate(body = {}, store) {
  const key = body.key ? String(body.key).trim() : ''
  if (!key || !/^[a-z][a-z0-9_]*$/.test(key)) {
    return 'key 须为小写英文标识'
  }
  if (findMapCategory(store, key)) return '分类 key 已存在'
  if (!body.label || !String(body.label).trim()) return '缺少 label'
  if (!body.icon || !String(body.icon).trim()) return '缺少 icon'
  if (!body.color || !String(body.color).trim()) return '缺少 color'
  if (!Number.isFinite(Number(body.sort))) return 'sort 须为数字'
  return null
}

export function validateMapCategoryUpdate(body = {}) {
  if (body.key !== undefined) return '不可修改 key'
  if (body.label !== undefined && !String(body.label).trim()) return 'label 不能为空'
  if (body.icon !== undefined && !String(body.icon).trim()) return 'icon 不能为空'
  if (body.color !== undefined && !String(body.color).trim()) return 'color 不能为空'
  if (body.sort !== undefined && !Number.isFinite(Number(body.sort))) return 'sort 须为数字'
  const hasField = ['label', 'icon', 'color', 'sort'].some((k) => body[k] !== undefined)
  if (!hasField) return '至少提供一个可更新字段'
  return null
}

export function buildMapCategoryRow(body) {
  return {
    key: String(body.key).trim(),
    label: String(body.label).trim(),
    icon: String(body.icon).trim(),
    color: String(body.color).trim(),
    sort: Number(body.sort),
  }
}
