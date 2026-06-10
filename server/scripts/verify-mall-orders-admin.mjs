/**
 * M2 商城管理端订单冒烟（需 server 运行）
 * 覆盖：GET /api/admin/orders、GET :id、PUT :id/status
 *
 * 运行：cd server && npm run verify:mall-orders-admin
 */
import { fileURLToPath } from 'node:url'

const BASE = process.env.API_BASE || 'http://localhost:3000'
const ADMIN_USER = process.env.ADMIN_DEV_USERNAME || 'admin'
const ADMIN_PASS = process.env.ADMIN_DEV_PASSWORD || 'DevOnly!2026'

export async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options)
  const json = await res.json()
  return { status: res.status, json }
}

export async function runMallOrdersAdminVerify(errors = [], { adminToken: presetToken } = {}) {
  function assert(name, cond, detail = '') {
    if (!cond) errors.push(`${name}${detail ? `: ${detail}` : ''}`)
  }

  let adminToken = presetToken || ''

  if (!adminToken) {
    const login = await request('/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: ADMIN_USER, password: ADMIN_PASS }),
    })
    assert(
      'admin login',
      login.json.code === 200 && login.json.data?.token,
      login.json.code !== 200 ? `message=${login.json.message}` : '',
    )
    adminToken = login.json.data?.token || ''
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminToken}`,
  }

  const noAuth = await request('/api/admin/orders')
  assert('admin orders auth required', noAuth.status === 401 || noAuth.json.code === 40101)

  const listRes = await request('/api/admin/orders?page=1&pageSize=10', { headers })
  assert(
    'admin orders list',
    listRes.json.code === 200 && listRes.json.data?.list?.length > 0,
  )
  assert(
    'admin orders list has userId',
    listRes.json.data?.list?.every((row) => Number.isFinite(row.userId)),
  )
  const user1Order = (listRes.json.data?.list || []).find((row) => row.userId === 1)
  if (user1Order) {
    assert(
      'admin orders list has userPhone',
      typeof user1Order.userPhone === 'string' && user1Order.userPhone.length > 0,
    )
  }

  const pendingPayRes = await request('/api/admin/orders?status=pendingPay', { headers })
  assert('admin orders status filter', pendingPayRes.json.code === 200)

  const sampleOrderId = 9002
  const detail = await request(`/api/admin/orders/${sampleOrderId}`, { headers })
  assert(
    'admin order detail',
    detail.json.code === 200
      && Number.isFinite(detail.json.data?.userId)
      && Array.isArray(detail.json.data?.items),
  )

  if (detail.json.data?.status === 'pendingPay') {
    const cancelled = await request(`/api/admin/orders/${sampleOrderId}/status`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ status: 'cancelled' }),
    })
    assert(
      'admin order cancel pendingPay',
      cancelled.json.code === 200 && cancelled.json.data?.status === 'cancelled',
    )
  }

  if (detail.json.data?.status === 'cancelled' || detail.json.data?.status === 'pendingPay') {
    const blocked = await request(`/api/admin/orders/${sampleOrderId}/status`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ status: 'pendingUse' }),
    })
    assert(
      'admin order invalid transition blocked',
      blocked.json.code === 40001,
    )
  }

  const userFilter = await request('/api/admin/orders?userId=1&page=1&pageSize=5', { headers })
  assert(
    'admin orders userId filter',
    userFilter.json.code === 200 && (userFilter.json.data?.list || []).every((row) => row.userId === 1),
  )

  const keyword = await request('/api/admin/orders?keyword=LS202605140001', { headers })
  assert(
    'admin orders keyword filter',
    keyword.json.code === 200
      && (keyword.json.data?.list || []).some((row) => row.orderNo === 'LS202605140001'),
  )

  return errors
}

async function main() {
  const errors = []
  try {
    const health = await request('/health')
    if (!health.json.ok) errors.push('health check failed')
    await runMallOrdersAdminVerify(errors)
  } catch (e) {
    errors.push(`服务未启动或不可达: ${e.message}（请先 cd server && npm run dev）`)
  }

  if (errors.length) {
    console.error('[mall-orders-admin-verify] FAILED')
    errors.forEach((e) => console.error(`  ✗ ${e}`))
    process.exit(1)
  }

  console.log('[mall-orders-admin-verify] PASSED')
  console.log('  ✓ GET /api/admin/orders 分页与 status/userId/keyword 筛选')
  console.log('  ✓ GET /api/admin/orders/:id 详情含 userId、items')
  console.log('  ✓ PUT /api/admin/orders/:id/status 状态流转校验')
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main()
}
