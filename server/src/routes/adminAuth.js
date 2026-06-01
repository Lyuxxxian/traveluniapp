import { Router } from 'express'
import { loadStore } from '../lib/store.js'
import { signAdminToken } from '../lib/adminAuth.js'
import { ok, fail } from '../lib/response.js'

const router = Router()

router.post('/login', (req, res) => {
  const username = String(req.body?.username || '').trim()
  const password = String(req.body?.password || '')
  if (!username || !password) {
    return fail(res, 40001, '请输入用户名和密码')
  }
  const store = loadStore()
  const admin = store.admins?.find((a) => a.username === username && a.password === password)
  if (!admin) {
    return fail(res, 40102, '用户名或密码错误', 401)
  }
  const token = signAdminToken(admin)
  return ok(res, {
    token,
    admin: { id: admin.id, name: admin.name, role: admin.role },
  })
})

export default router
