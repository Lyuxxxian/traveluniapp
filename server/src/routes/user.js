import { Router } from 'express'
import { requireAuth } from '../lib/auth.js'
import { loadStore, saveStore } from '../lib/store.js'
import { ok } from '../lib/response.js'

const router = Router()

router.get('/profile', requireAuth, (req, res) => {
  const { password: _pw, ...rest } = req.user
  return ok(res, rest)
})

router.put('/profile', requireAuth, (req, res) => {
  const store = loadStore()
  const user = store.users.find((u) => u.id === req.user.id)
  if (!user) return ok(res, req.user)

  if (req.body.nickname !== undefined) user.nickname = String(req.body.nickname)
  if (req.body.avatarUrl !== undefined) user.avatarUrl = String(req.body.avatarUrl)
  saveStore()

  const { password: _pw, ...rest } = user
  return ok(res, rest)
})

export default router
