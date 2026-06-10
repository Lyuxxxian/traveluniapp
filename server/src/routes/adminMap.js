import { Router } from 'express'
import { loadStore, saveStore, nextId } from '../lib/store.js'
import { ok, fail, paginate } from '../lib/response.js'
import { filterMapPoints, sortAdminMapPoints, sortMapCategories } from '../lib/mapQuery.js'
import {
  FROZEN_MAP_CATEGORY_KEYS,
  MAP_POINT_STATUSES,
  buildMapPointBase,
  validateMapPointBase,
  pickMapDetailFromBody,
  setMapPointDetailExtras,
  removeMapPointDetailExtras,
  mergeMapPointDetail,
  isMapPointReferencedInRoutes,
  findMapCategory,
  hasMapPointsInCategory,
  validateMapCategoryCreate,
  validateMapCategoryUpdate,
  buildMapCategoryRow,
} from '../lib/mapStore.js'

const router = Router()

function findMapPoint(store, id) {
  return (store.mapPoints || []).find((item) => item.id === id)
}

router.get('/categories', (_req, res) => {
  const store = loadStore()
  return ok(res, sortMapCategories(store.mapCategories || []))
})

router.post('/categories', (req, res) => {
  const store = loadStore()
  const body = req.body || {}
  const err = validateMapCategoryCreate(body, store)
  if (err) return fail(res, 40001, err)

  const row = buildMapCategoryRow(body)
  store.mapCategories = store.mapCategories || []
  store.mapCategories.push(row)
  saveStore()
  return ok(res, row)
})

router.put('/categories/:key', (req, res) => {
  const store = loadStore()
  const key = String(req.params.key)
  const body = req.body || {}
  const err = validateMapCategoryUpdate(body)
  if (err) return fail(res, 40001, err)

  const idx = (store.mapCategories || []).findIndex((item) => item.key === key)
  if (idx < 0) return fail(res, 40401, '分类不存在', 404)

  const current = store.mapCategories[idx]
  const updated = {
    ...current,
    key: current.key,
    label: body.label !== undefined ? String(body.label).trim() : current.label,
    icon: body.icon !== undefined ? String(body.icon).trim() : current.icon,
    color: body.color !== undefined ? String(body.color).trim() : current.color,
    sort: body.sort !== undefined ? Number(body.sort) : current.sort,
  }
  store.mapCategories[idx] = updated
  saveStore()
  return ok(res, updated)
})

router.delete('/categories/:key', (req, res) => {
  const store = loadStore()
  const key = String(req.params.key)

  if (FROZEN_MAP_CATEGORY_KEYS.has(key)) {
    return fail(res, 40301, '禁止删除冻结分类', 403)
  }

  if (!findMapCategory(store, key)) {
    return fail(res, 40401, '分类不存在', 404)
  }

  if (hasMapPointsInCategory(store, key)) {
    return fail(res, 40901, '分类仍有关联点位，无法删除')
  }

  const before = store.mapCategories?.length || 0
  store.mapCategories = (store.mapCategories || []).filter((item) => item.key !== key)
  if (store.mapCategories.length === before) {
    return fail(res, 40401, '分类不存在', 404)
  }

  saveStore()
  return ok(res, { deleted: true, key })
})

router.get('/points', (req, res) => {
  const store = loadStore()
  let list = filterMapPoints(store.mapPoints || [], {
    category: req.query.category ? String(req.query.category) : undefined,
    keyword: req.query.keyword ? String(req.query.keyword) : undefined,
    includeClosed: true,
  })

  const status = req.query.status ? String(req.query.status) : undefined
  if (status) {
    list = list.filter((item) => item.status === status)
  }

  list = sortAdminMapPoints(list, store.mapCategories || [])

  if (req.query.page || req.query.pageSize) {
    return ok(res, paginate(list, req.query.page, req.query.pageSize))
  }
  return ok(res, list)
})

router.get('/points/:id', (req, res) => {
  const store = loadStore()
  const id = Number(req.params.id)
  if (!Number.isFinite(id)) return fail(res, 40001, '无效的点位 id')

  const point = findMapPoint(store, id)
  if (!point) return fail(res, 40401, '点位不存在', 404)

  return ok(res, mergeMapPointDetail(store, point))
})

router.post('/points', (req, res) => {
  const store = loadStore()
  const body = req.body || {}
  const base = buildMapPointBase(body)
  const err = validateMapPointBase(base, store)
  if (err) return fail(res, 40001, err)

  const id = nextId('mapPoint')
  const row = {
    id,
    ...base,
    latitude: Number(base.latitude),
    longitude: Number(base.longitude),
    iconKey: base.iconKey || base.category,
  }

  store.mapPoints = store.mapPoints || []
  store.mapPoints.push(row)
  setMapPointDetailExtras(store, id, pickMapDetailFromBody(body))
  saveStore()

  return ok(res, mergeMapPointDetail(store, row))
})

router.put('/points/:id/status', (req, res) => {
  const store = loadStore()
  const id = Number(req.params.id)
  if (!Number.isFinite(id)) return fail(res, 40001, '无效的点位 id')

  const point = findMapPoint(store, id)
  if (!point) return fail(res, 40401, '点位不存在', 404)

  const status = req.body?.status
  if (!status || !MAP_POINT_STATUSES.has(status)) {
    return fail(res, 40001, 'status 须为 open、closed 或 busy')
  }

  point.status = status
  saveStore()
  return ok(res, { ...point })
})

router.put('/points/:id', (req, res) => {
  const store = loadStore()
  const id = Number(req.params.id)
  if (!Number.isFinite(id)) return fail(res, 40001, '无效的点位 id')

  const idx = (store.mapPoints || []).findIndex((item) => item.id === id)
  if (idx < 0) return fail(res, 40401, '点位不存在', 404)

  const body = req.body || {}
  const merged = buildMapPointBase(body, store.mapPoints[idx])
  const err = validateMapPointBase(merged, store)
  if (err) return fail(res, 40001, err)

  const row = {
    id,
    ...merged,
    latitude: Number(merged.latitude),
    longitude: Number(merged.longitude),
    iconKey: merged.iconKey || merged.category,
  }
  store.mapPoints[idx] = row
  setMapPointDetailExtras(store, id, pickMapDetailFromBody(body))
  saveStore()

  return ok(res, mergeMapPointDetail(store, row))
})

router.delete('/points/:id', (req, res) => {
  const store = loadStore()
  const id = Number(req.params.id)
  if (!Number.isFinite(id)) return fail(res, 40001, '无效的点位 id')

  const before = store.mapPoints?.length || 0
  const point = findMapPoint(store, id)
  if (!point) return fail(res, 40401, '点位不存在', 404)

  if (isMapPointReferencedInRoutes(store, id)) {
    return fail(res, 40901, '点位仍被路线引用，无法删除')
  }

  store.mapPoints = (store.mapPoints || []).filter((item) => item.id !== id)
  if (store.mapPoints.length === before) return fail(res, 40401, '点位不存在', 404)

  removeMapPointDetailExtras(store, id)
  saveStore()
  return ok(res, { deleted: true, id })
})

export default router
