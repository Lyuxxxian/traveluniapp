import { Router } from 'express'
import { loadStore, saveStore, nextId } from '../lib/store.js'
import { ok, fail } from '../lib/response.js'

const router = Router()

router.get('/posts', (req, res) => {
  const store = loadStore()
  let list = [...(store.discoverPosts || [])]
  const category = req.query.category
  const status = req.query.status
  if (category) list = list.filter((p) => p.category === category)
  if (status) list = list.filter((p) => p.status === status)
  return ok(res, list)
})

router.post('/posts', (req, res) => {
  const store = loadStore()
  const body = req.body || {}
  const row = {
    id: nextId('discoverPost'),
    status: body.status || 'draft',
    category: body.category || 'activity',
    title: body.title || '未命名',
    subtitle: body.subtitle || '',
    priceText: body.priceText || '',
    coverUrl: body.coverUrl || '',
    tagText: body.tagText || '',
    summary: body.summary || '',
    location: body.location || '',
    publishTime: body.publishTime || '刚刚',
    actionText: body.actionText || '查看',
    target: body.target,
    place: body.place,
    joinWay: body.joinWay,
    durationText: body.durationText,
    contentText: body.contentText,
    meaningText: body.meaningText,
    detailImageUrl: body.detailImageUrl,
    buttonText: body.buttonText,
    relatedTargets: body.relatedTargets || [],
  }
  store.discoverPosts = store.discoverPosts || []
  store.discoverPosts.push(row)
  saveStore()
  return ok(res, row)
})

router.put('/posts/:id', (req, res) => {
  const store = loadStore()
  const idx = (store.discoverPosts || []).findIndex((p) => p.id === Number(req.params.id))
  if (idx < 0) return fail(res, 40401, '内容不存在', 404)
  store.discoverPosts[idx] = { ...store.discoverPosts[idx], ...req.body, id: Number(req.params.id) }
  saveStore()
  return ok(res, store.discoverPosts[idx])
})

router.put('/posts/:id/status', (req, res) => {
  const store = loadStore()
  const row = (store.discoverPosts || []).find((p) => p.id === Number(req.params.id))
  if (!row) return fail(res, 40401, '内容不存在', 404)
  row.status = req.body?.status || row.status
  saveStore()
  return ok(res, row)
})

router.delete('/posts/:id', (req, res) => {
  const store = loadStore()
  const before = store.discoverPosts?.length || 0
  store.discoverPosts = (store.discoverPosts || []).filter((p) => p.id !== Number(req.params.id))
  if (store.discoverPosts.length === before) return fail(res, 40401, '内容不存在', 404)
  saveStore()
  return ok(res, { deleted: true })
})

export default router
