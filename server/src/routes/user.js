import { Router } from 'express'
import { requireAuth } from '../lib/auth.js'
import { loadStore, saveStore } from '../lib/store.js'
import { ok, fail } from '../lib/response.js'
import { nextId } from '../lib/store.js'

const router = Router()

router.get('/profile', requireAuth, (req, res) => {
  const { password: _pw, ...rest } = req.user
  return ok(res, rest)
})

router.get('/coupons', requireAuth, (req, res) => {
  const store = loadStore()
  const list = (store.userCoupons || []).filter((c) => c.userId === req.user.id)
  return ok(res, list)
})

router.get('/coupons/available', requireAuth, (req, res) => {
  const store = loadStore()
  const amount = Number(req.query.amount) || 0
  const type = String(req.query.type || '')
  const list = (store.userCoupons || []).filter(
    (c) =>
      c.userId === req.user.id
      && c.status === 'available'
      && amount >= c.minAmount
      && (c.scopeTypes?.includes(type) || (c.scopeTypes?.length || 0) >= 3),
  )
  return ok(res, list)
})

router.post('/coupons', requireAuth, (req, res) => {
  const store = loadStore()
  const packageId = Number(req.body?.couponPackageId)
  const templates = store.couponPackages || []
  const tpl = templates.find((p) => p.id === packageId)
  if (!tpl) {
    return fail(res, 40401, '优惠券不存在', 404)
  }
  const dup = (store.userCoupons || []).find(
    (c) => c.userId === req.user.id && c.couponPackageId === packageId && c.status === 'available',
  )
  if (dup) {
    return fail(res, 40901, '已领取过该优惠券')
  }
  const id = nextId('userCoupon')
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const validFrom = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  const end = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
  const validTo = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`
  const row = {
    id,
    userId: req.user.id,
    ...tpl,
    validFrom,
    validTo,
    status: 'available',
  }
  if (!store.userCoupons) store.userCoupons = []
  store.userCoupons.push(row)
  saveStore()
  return ok(res, row)
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
