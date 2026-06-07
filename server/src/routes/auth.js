import { Router } from 'express'
import { signToken } from '../lib/auth.js'
import { loadStore, saveStore, nextId } from '../lib/store.js'
import { ok, fail } from '../lib/response.js'

const router = Router()

const PHONE_AUTH = 'phone_auth'
const WECHAT_AUTH = 'wechat_auth'

function issueSession(user, res) {
  const { password: _pw, ...rest } = user
  return ok(res, {
    token: signToken(user),
    user: rest,
  })
}

function isPhoneLike(value) {
  return /^1\d{10}$/.test(String(value || '').trim())
}

function findUserByPhone(store, phone) {
  const normalized = String(phone).trim()
  return store.users.find(
    (u) => u.phone === normalized || u.username === normalized,
  )
}

function findUserByWechatId(store, wechatId) {
  const id = String(wechatId || '').trim()
  if (!id) return null
  return store.users.find((u) => u.wechatId === id || u.username === id)
}

function createUser(store, fields) {
  const id = nextId('user')
  const user = {
    id,
    username: fields.username,
    password: fields.password,
    nickname: fields.nickname || '',
    visitorId: fields.visitorId || `灵山居士_${fields.username}`,
    avatarUrl: fields.avatarUrl || '/static/logo.png',
    phone: fields.phone || '',
    wechatId: fields.wechatId || '',
  }
  store.users.push(user)
  saveStore()
  return user
}

function loginWithPhone(store, username, res) {
  const phone = String(username).trim()
  if (!isPhoneLike(phone)) {
    return fail(res, 40001, '请输入正确的手机号')
  }

  let user = findUserByPhone(store, phone)
  if (!user) {
    user = createUser(store, {
      username: phone,
      password: PHONE_AUTH,
      phone,
      nickname: `游客${phone.slice(-4)}`,
      visitorId: `灵山居士_${phone}`,
    })
  } else if (!user.phone) {
    user.phone = phone
    saveStore()
  }

  return issueSession(user, res)
}

function loginWithWechat(store, body, res) {
  const wechatId = String(body.wechatId || body.username || '').trim()
  if (!wechatId) {
    return fail(res, 40001, '微信标识无效')
  }

  let user = findUserByWechatId(store, wechatId)
  if (!user) {
    user = createUser(store, {
      username: wechatId,
      password: WECHAT_AUTH,
      wechatId,
      nickname: '微信用户',
      visitorId: `灵山居士_${wechatId.slice(-8)}`,
    })
  }

  return issueSession(user, res)
}

router.post('/login', (req, res) => {
  const { username, password, wechatId } = req.body || {}
  if (!username || !password) {
    return fail(res, 40001, '请输入用户名和密码')
  }

  const store = loadStore()
  const pwd = String(password)

  if (pwd === PHONE_AUTH) {
    return loginWithPhone(store, username, res)
  }

  if (pwd === WECHAT_AUTH) {
    return loginWithWechat(store, { username, wechatId: wechatId || username }, res)
  }

  const user = store.users.find((u) => u.username === String(username).trim())
  if (!user) {
    return fail(res, 40001, '用户名或密码错误')
  }

  if (user.password !== pwd) {
    return fail(res, 40001, '用户名或密码错误')
  }

  return issueSession(user, res)
})

router.post('/register', (req, res) => {
  const { username, password, nickname } = req.body || {}
  if (!username || !password) {
    return fail(res, 40001, '请输入用户名和密码')
  }

  const name = String(username).trim()
  if (name.length < 2) {
    return fail(res, 40001, '账号至少 2 个字符')
  }

  const store = loadStore()
  if (store.users.some((u) => u.username === name)) {
    return fail(res, 40901, '用户名已存在')
  }

  const user = createUser(store, {
    username: name,
    password: String(password),
    nickname: nickname ? String(nickname).trim() : name,
    phone: isPhoneLike(name) ? name : '',
    visitorId: `灵山居士_${name}`,
  })

  return issueSession(user, res)
})

export default router
