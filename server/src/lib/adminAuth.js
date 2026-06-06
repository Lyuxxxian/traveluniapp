import jwt from 'jsonwebtoken'
import { fail } from './response.js'
import { loadStore } from './store.js'

const JWT_SECRET = process.env.JWT_SECRET || 'traveluniapp-dev-secret'
const JWT_EXPIRES = '7d'
const IS_PRODUCTION = process.env.NODE_ENV === 'production'
const AUTH_DISABLED = !IS_PRODUCTION && process.env.ADMIN_AUTH_DISABLED === 'true'

export function signAdminToken(admin) {
  return jwt.sign(
    { adminId: admin.id, username: admin.username, role: admin.role || 'admin' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES },
  )
}

export function verifyAdminToken(token) {
  return jwt.verify(token, JWT_SECRET)
}

export function requireAdminAuth(req, res, next) {
  if (AUTH_DISABLED) {
    req.admin = { id: 0, username: 'dev', name: '开发模式', role: 'admin' }
    return next()
  }
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) {
    return fail(res, 40101, '管理员未登录', 401)
  }
  try {
    const payload = verifyAdminToken(token)
    const store = loadStore()
    const admin = store.admins?.find((a) => a.id === payload.adminId)
    if (!admin) {
      return fail(res, 40101, '登录已失效', 401)
    }
    req.admin = {
      id: admin.id,
      username: admin.username,
      name: admin.name,
      role: admin.role,
    }
    return next()
  } catch {
    return fail(res, 40101, '登录已失效', 401)
  }
}
