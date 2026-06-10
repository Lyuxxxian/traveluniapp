import { Router } from 'express'
import { loadStore, saveStore } from '../lib/store.js'
import { ok, fail, paginate } from '../lib/response.js'
import {
  ORDER_STATUSES,
  canTransitionOrderStatus,
  attachOrderUserInfo,
  filterAdminOrders,
  toOrderDetail,
  toOrderListItem,
} from '../lib/orderQuery.js'

const router = Router()

function nowText() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function findOrder(store, id) {
  return (store.orders || []).find((item) => item.id === id)
}

router.get('/', (req, res) => {
  const store = loadStore()
  const filtered = filterAdminOrders(store.orders || [], req.query)
  if (filtered.error) return fail(res, 40001, filtered.error)

  const page = Number(req.query.page) || 1
  const pageSize = Number(req.query.pageSize) || 20
  const list = filtered.list.map((order) =>
    attachOrderUserInfo(store, toOrderListItem(order, { forAdmin: true })),
  )
  return ok(res, paginate(list, page, pageSize))
})

router.get('/:id', (req, res) => {
  const store = loadStore()
  const id = Number(req.params.id)
  if (!Number.isFinite(id)) return fail(res, 40001, '无效的订单 id')

  const order = findOrder(store, id)
  if (!order) return fail(res, 40401, '订单不存在', 404)

  return ok(res, attachOrderUserInfo(store, toOrderDetail(order, { forAdmin: true })))
})

router.put('/:id/status', (req, res) => {
  const store = loadStore()
  const id = Number(req.params.id)
  if (!Number.isFinite(id)) return fail(res, 40001, '无效的订单 id')

  const order = findOrder(store, id)
  if (!order) return fail(res, 40401, '订单不存在', 404)

  const status = req.body?.status
  if (!status || !ORDER_STATUSES.has(status)) {
    return fail(res, 40001, 'status 无效')
  }
  if (!canTransitionOrderStatus(order.status, status)) {
    return fail(res, 40001, `当前状态 ${order.status} 不可变更为 ${status}`)
  }

  order.status = status
  if (status === 'pendingUse' && !order.payAt) {
    order.payAt = nowText()
  }
  saveStore()
  return ok(res, attachOrderUserInfo(store, toOrderDetail(order, { forAdmin: true })))
})

export default router
