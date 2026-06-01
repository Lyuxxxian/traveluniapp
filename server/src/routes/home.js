import { Router } from 'express'
import { loadStore } from '../lib/store.js'
import { ok } from '../lib/response.js'

const router = Router()

router.get('/config', (_req, res) => {
  const store = loadStore()
  return ok(res, store.homeConfig || {})
})

export default router
