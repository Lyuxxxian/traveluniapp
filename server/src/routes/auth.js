import { Router } from 'express'
import { signToken } from '../lib/auth.js'
import { loadStore, saveStore } from '../lib/store.js'
import { ok, fail } from '../lib/response.js'

const router = Router()

function issueSession(user, res) {
  const { password: _pw, ...rest } = user
  return ok(res, {
    token: signToken(user),
    user: rest,
  })
}

router.post('/login', (req, res) => {
  const { username, password } = req.body || {}
  if (!username || !password) {
    return fail(res, 40001, '请输入用户名和密码')
  }

  const store = loadStore()
  let user = store.users.find((u) => u.username === String(username).trim())

  if (!user) {
    const id = store.counters.user + 1
    store.counters.user = id
    user = {
      id,
      username: String(username).trim(),
      password: String(password),
      nickname: '',
      visitorId: `灵山居士_${username}`,
      avatarUrl: '/static/logo.png',
      phone: '',
    }
    store.users.push(user)
    saveStore()
    return issueSession(user, res)
  }

  if (user.password !== String(password)) {
    return fail(res, 40001, '用户名或密码错误')
  }

  return issueSession(user, res)
})

router.post('/register', (req, res) => {
  const { username, password } = req.body || {}
  if (!username || !password) {
    return fail(res, 40001, '请输入用户名和密码')
  }
  const store = loadStore()
  if (store.users.some((u) => u.username === String(username).trim())) {
    return fail(res, 40901, '用户名已存在')
  }
  const id = store.counters.user + 1
  store.counters.user = id
  const user = {
    id,
    username: String(username).trim(),
    password: String(password),
    nickname: '',
    visitorId: `灵山居士_${username}`,
    avatarUrl: '/static/logo.png',
    phone: '',
  }
  store.users.push(user)
  saveStore()
  return issueSession(user, res)
})

export default router
