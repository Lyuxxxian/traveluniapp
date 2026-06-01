import { Router } from 'express'
import { loadStore, saveStore } from '../lib/store.js'
import { ok } from '../lib/response.js'

const router = Router()

router.get('/config', (_req, res) => {
  const store = loadStore()
  return ok(res, store.homeConfig || {})
})

router.put('/config', (req, res) => {
  const store = loadStore()
  store.homeConfig = req.body || store.homeConfig
  saveStore()
  return ok(res, store.homeConfig)
})

export default router
