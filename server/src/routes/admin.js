import { Router } from 'express'
import { loadStore, saveStore } from '../lib/store.js'
import { ok, fail } from '../lib/response.js'
import { respondList } from '../lib/listQuery.js'
import { nowText } from '../lib/time.js'

/** 管理端：反馈 / 工单 / 点评（由 adminMain 挂载 requireAdminAuth） */
const router = Router()

router.get('/feedback', (req, res) => {
  const store = loadStore()
  return respondList(res, ok, store.feedback || [], req)
})

router.put('/feedback/:id/status', (req, res) => {
  const store = loadStore()
  const row = store.feedback.find((f) => f.id === Number(req.params.id))
  if (!row) return fail(res, 40401, '反馈不存在', 404)
  row.status = req.body?.status || row.status
  saveStore()
  return ok(res, row)
})

router.get('/support/tickets', (_req, res) => {
  const store = loadStore()
  return ok(res, store.tickets)
})

router.put('/support/tickets/:id', (req, res) => {
  const store = loadStore()
  const row = store.tickets.find((t) => t.id === Number(req.params.id))
  if (!row) return fail(res, 40401, '工单不存在', 404)
  if (req.body.status) row.status = req.body.status
  if (req.body.adminReply !== undefined) row.adminReply = String(req.body.adminReply)
  row.updatedAt = nowText()
  saveStore()
  return ok(res, row)
})

router.get('/reviews', (req, res) => {
  const store = loadStore()
  return respondList(res, ok, store.reviews || [], req)
})

router.put('/reviews/:id/status', (req, res) => {
  const store = loadStore()
  const row = store.reviews.find((r) => r.id === Number(req.params.id))
  if (!row) return fail(res, 40401, '点评不存在', 404)
  row.status = req.body?.status || row.status
  saveStore()
  return ok(res, row)
})

export default router
