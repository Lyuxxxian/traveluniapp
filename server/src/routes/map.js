import { Router } from 'express'
import { loadStore } from '../lib/store.js'
import { ok, fail } from '../lib/response.js'
import {
  filterMapPoints,
  filterMapRoutes,
  sortMapCategories,
  parseBoolQuery,
  parseNumberQuery,
} from '../lib/mapQuery.js'
import { mergeMapPointDetail } from '../lib/mapStore.js'

const router = Router()

router.get('/categories', (_req, res) => {
  const store = loadStore()
  const list = sortMapCategories(store.mapCategories || [])
  return ok(res, list)
})

router.get('/points', (req, res) => {
  const store = loadStore()
  const params = {
    category: req.query.category ? String(req.query.category) : undefined,
    keyword: req.query.keyword ? String(req.query.keyword) : undefined,
    latitude: parseNumberQuery(req.query.latitude),
    longitude: parseNumberQuery(req.query.longitude),
    includeClosed: parseBoolQuery(req.query.includeClosed),
  }
  const list = filterMapPoints(store.mapPoints || [], params)
  return ok(res, list)
})

router.get('/points/:id', (req, res) => {
  const store = loadStore()
  const id = Number(req.params.id)
  if (!Number.isFinite(id)) {
    return fail(res, 40001, '无效的点位 id')
  }

  const point = (store.mapPoints || []).find((item) => item.id === id)
  if (!point) {
    return fail(res, 40401, '点位不存在', 404)
  }

  return ok(res, mergeMapPointDetail(store, point))
})

router.get('/routes', (req, res) => {
  const store = loadStore()
  const params = {
    scene: req.query.scene ? String(req.query.scene) : undefined,
    duration: parseNumberQuery(req.query.duration),
  }
  const list = filterMapRoutes(store.mapRoutes || [], params)
  return ok(res, list)
})

export default router
