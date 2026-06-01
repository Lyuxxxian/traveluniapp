import jwt from 'jsonwebtoken'
import { fail } from './response.js'
import { loadStore } from './store.js'

const JWT_SECRET = process.env.JWT_SECRET || 'traveluniapp-dev-secret'
const JWT_EXPIRES = '7d'

export function signToken(user) {
  return jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRES })
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET)
}

export function optionalAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) {
    req.user = null
    return next()
  }
  try {
    const payload = verifyToken(token)
    const store = loadStore()
    req.user = store.users.find((u) => u.id === payload.userId) || null
  } catch {
    req.user = null
  }
  next()
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) {
    return fail(res, 40101, '未登录', 401)
  }
  try {
    const payload = verifyToken(token)
    const store = loadStore()
    const user = store.users.find((u) => u.id === payload.userId)
    if (!user) {
      return fail(res, 40101, '登录已失效', 401)
    }
    req.user = user
    return next()
  } catch {
    return fail(res, 40101, '登录已失效', 401)
  }
}
