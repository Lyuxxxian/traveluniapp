import { Router } from 'express'
import { loadStore } from '../lib/store.js'
import { ok } from '../lib/response.js'

const router = Router()

router.get('/faqs', (_req, res) => {
  const store = loadStore()
  const list = [...store.faqs].sort((a, b) => (a.sort || 0) - (b.sort || 0))
  return ok(res, list)
})

export default router
