import jwt from 'jsonwebtoken'
import { fail } from './response.js'
import { loadStore } from './store.js'

const JWT_SECRET = process.env.JWT_SECRET || 'traveluniapp-dev-secret'

/** 允许 C 端用户 JWT 或管理端 admin JWT 上传图片 */
export function requireUserOrAdminAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) {
    return fail(res, 40101, '未登录', 401)
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    const store = loadStore()
    if (payload.adminId != null) {
      const admin = store.admins?.find((a) => a.id === payload.adminId)
      if (admin) {
        req.admin = admin
        return next()
      }
    }
    if (payload.userId != null) {
      const user = store.users.find((u) => u.id === payload.userId)
      if (user) {
        req.user = user
        return next()
      }
    }
    return fail(res, 40101, '登录已失效', 401)
  } catch {
    return fail(res, 40101, '登录已失效', 401)
  }
}
