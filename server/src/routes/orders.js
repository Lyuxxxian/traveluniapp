import { Router } from 'express'
import { requireAuth } from '../lib/auth.js'
import { loadStore, saveStore, nextId } from '../lib/store.js'
import { ok, fail } from '../lib/response.js'
import { toOrderDetail, toOrderListItem } from '../lib/orderQuery.js'

const router = Router()

function nowText() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function findUserOrder(store, userId, orderId) {
  return store.orders?.find((o) => o.id === Number(orderId) && o.userId === userId)
}

router.get('/orders', requireAuth, (req, res) => {
  const store = loadStore()
  const status = req.query.status
  let list = (store.orders || []).filter((o) => o.userId === req.user.id)
  if (status && status !== 'all') {
    list = list.filter((o) => o.status === status)
  }
  list = list.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
  return ok(res, list.map(toOrderListItem))
})

router.get('/orders/:id', requireAuth, (req, res) => {
  const store = loadStore()
  const order = findUserOrder(store, req.user.id, req.params.id)
  if (!order) {
    return fail(res, 40401, '订单不存在', 404)
  }
  return ok(res, toOrderDetail(order))
})

router.post('/orders', requireAuth, (req, res) => {
  const {
    title,
    coverUrl,
    items,
    couponId,
    productType,
    buyerName,
    buyerPhone,
    buyerIdCard,
    visitDate,
    ticketSaleMode,
  } = req.body || {}
  if (!title || !Array.isArray(items) || !items.length) {
    return fail(res, 40001, '订单参数不完整')
  }
  if (productType === 'ticket') {
    if (!buyerName || !buyerPhone || !buyerIdCard) {
      return fail(res, 40001, '请填写订购人姓名、手机号和身份证号')
    }
    if (!/^1\d{10}$/.test(String(buyerPhone))) {
      return fail(res, 40001, '手机号格式不正确')
    }
    if (!/^[0-9A-Za-z]{6,20}$/.test(String(buyerIdCard))) {
      return fail(res, 40001, '身份证号格式不正确')
    }
    if (ticketSaleMode === 'presale' && !visitDate) {
      return fail(res, 40001, '预售门票请选择购买日期')
    }
  }

  const store = loadStore()
  const totalAmount = items.reduce(
    (sum, it) => sum + Number(it.skuPrice || 0) * Number(it.quantity || 1),
    0,
  )

  let couponDiscount = 0
  let couponTitle = ''
  if (couponId) {
    const coupon = (store.userCoupons || []).find(
      (c) => c.id === Number(couponId) && c.userId === req.user.id && c.status === 'available',
    )
    if (coupon && totalAmount >= coupon.minAmount) {
      couponDiscount = coupon.discountAmount
      couponTitle = coupon.title
      coupon.status = 'used'
    }
  }

  const id = nextId('order')
  const orderNo = `LS${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(id).padStart(4, '0')}`
  const createdAt = nowText()
  const payAmount = Math.max(0, totalAmount - couponDiscount)
  const quantity = items.reduce((sum, it) => sum + Number(it.quantity || 1), 0)

  const order = {
    id,
    userId: req.user.id,
    orderNo,
    status: 'pendingPay',
    title: String(title),
    coverUrl: coverUrl || '',
    payAmount,
    quantity,
    createdAt,
    couponDiscount,
    couponTitle,
    productType: productType || 'ticket',
    buyerName: buyerName ? String(buyerName).trim() : '',
    buyerPhone: buyerPhone ? String(buyerPhone).trim() : '',
    buyerIdCard: buyerIdCard ? String(buyerIdCard).trim() : '',
    visitDate: visitDate ? String(visitDate).trim() : '',
    ticketSaleMode: ticketSaleMode === 'presale' ? 'presale' : 'daily',
    items: items.map((it) => ({
      title: it.title || title,
      skuName: it.skuName || '默认规格',
      quantity: Number(it.quantity || 1),
      price: Number(it.skuPrice || 0),
    })),
    qrCodeUrl: '',
    payAt: '',
    remark: '',
  }

  if (!store.orders) store.orders = []
  store.orders.unshift(order)
  saveStore()

  return ok(res, {
    id,
    orderNo,
    payAmount,
    status: 'pendingPay',
  })
})

router.post('/orders/:id/cancel', requireAuth, (req, res) => {
  const store = loadStore()
  const order = findUserOrder(store, req.user.id, req.params.id)
  if (!order) {
    return fail(res, 40401, '订单不存在', 404)
  }
  if (order.status !== 'pendingPay') {
    return fail(res, 40001, '当前状态不可取消')
  }
  order.status = 'cancelled'
  saveStore()
  return ok(res, { id: order.id, status: 'cancelled' })
})

router.post('/orders/:id/mock-pay', requireAuth, (req, res) => {
  const store = loadStore()
  const order = findUserOrder(store, req.user.id, req.params.id)
  if (!order) {
    return fail(res, 40401, '订单不存在', 404)
  }
  if (order.status !== 'pendingPay') {
    return fail(res, 40001, '当前状态不可支付')
  }
  order.status = 'pendingUse'
  order.payAt = nowText()
  saveStore()
  return ok(res, { id: order.id, status: 'pendingUse', payAt: order.payAt })
})

export default router
