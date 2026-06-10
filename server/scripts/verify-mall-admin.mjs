/**
 * M2 商城管理端冒烟（需 server 运行）
 * 覆盖：管理端商品 CRUD、上下架；公开 API 仅 on_sale
 *
 * 运行：cd server && npm run verify:mall-admin
 */
import { fileURLToPath } from 'node:url'

const BASE = process.env.API_BASE || 'http://localhost:3000'
const ADMIN_USER = process.env.ADMIN_DEV_USERNAME || 'admin'
const ADMIN_PASS = process.env.ADMIN_DEV_PASSWORD || 'DevOnly!2026'
const VERIFY_TITLE = '__verify_mall_admin__'

export async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options)
  const json = await res.json()
  return { status: res.status, json }
}

export async function runMallAdminVerify(errors = [], { adminToken: presetToken } = {}) {
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

  const noAuth = await request('/api/admin/mall/products')
  assert('admin mall auth required', noAuth.status === 401 || noAuth.json.code === 40101)

  const adminList = await request('/api/admin/mall/products?page=1&pageSize=5', { headers })
  assert(
    'admin mall products list',
    adminList.json.code === 200 && adminList.json.data?.list?.length > 0,
  )

  const offSaleList = await request('/api/admin/mall/products?status=off_sale', { headers })
  assert('admin mall off_sale filter', offSaleList.json.code === 200)

  const stale = await request(
    `/api/admin/mall/products?keyword=${encodeURIComponent(VERIFY_TITLE)}`,
    { headers },
  )
  const staleItems = stale.json.data?.list || []
  for (const item of staleItems.filter((row) => row.title === VERIFY_TITLE)) {
    await request(`/api/admin/mall/products/${item.id}`, { method: 'DELETE', headers })
  }

  const created = await request('/api/admin/mall/products', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      type: 'ticket',
      title: VERIFY_TITLE,
      subtitle: 'M2 verify-mall-admin 创建',
      price: 100,
      originPrice: 200,
      coverUrl: 'https://example.com/cover.jpg',
      stock: 10,
      tags: ['验收'],
      specs: [{ id: 1, name: '测试规格', price: 100 }],
    }),
  })
  assert('admin mall product create', created.json.code === 200 && created.json.data?.id)
  const productId = created.json.data?.id

  const adminGet = await request(`/api/admin/mall/products/${productId}`, { headers })
  assert(
    'admin mall product detail',
    adminGet.json.code === 200 && adminGet.json.data?.title === VERIFY_TITLE,
  )

  const publicVisible = await request('/api/mall/products?type=ticket')
  assert(
    'public mall sees on_sale product',
    (publicVisible.json.data?.list || []).some((item) => item.id === productId),
  )

  const offSale = await request(`/api/admin/mall/products/${productId}/status`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ status: 'off_sale' }),
  })
  assert(
    'admin mall product off_sale',
    offSale.json.code === 200 && offSale.json.data?.status === 'off_sale',
  )

  const publicHidden = await request('/api/mall/products?type=ticket')
  assert(
    'public mall hides off_sale product',
    !(publicHidden.json.data?.list || []).some((item) => item.id === productId),
  )

  const publicDetail = await request(`/api/mall/products/${productId}`)
  assert(
    'public mall detail 404 when off_sale',
    publicDetail.status === 404 && publicDetail.json.code === 40401,
  )

  const updated = await request(`/api/admin/mall/products/${productId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      type: 'ticket',
      title: `${VERIFY_TITLE}-已更新`,
      subtitle: 'M2 verify-mall-admin 更新',
      price: 150,
      originPrice: 200,
      coverUrl: 'https://example.com/cover2.jpg',
      stock: 8,
      status: 'on_sale',
    }),
  })
  assert(
    'admin mall product update',
    updated.json.code === 200 && updated.json.data?.title === `${VERIFY_TITLE}-已更新`,
  )

  const publicAfterUpdate = await request('/api/mall/products?type=ticket')
  assert(
    'public mall sees product after on_sale update',
    (publicAfterUpdate.json.data?.list || []).some(
      (item) => item.id === productId && item.title === `${VERIFY_TITLE}-已更新`,
    ),
  )

  const removed = await request(`/api/admin/mall/products/${productId}`, {
    method: 'DELETE',
    headers,
  })
  assert('admin mall product delete', removed.json.code === 200)

  const gone = await request(`/api/admin/mall/products/${productId}`, { headers })
  assert('admin mall product gone', gone.status === 404 && gone.json.code === 40401)

  return errors
}

async function main() {
  const errors = []
  try {
    const health = await request('/health')
    if (!health.json.ok) errors.push('health check failed')
    await runMallAdminVerify(errors)
  } catch (e) {
    errors.push(`服务未启动或不可达: ${e.message}（请先 cd server && npm run dev）`)
  }

  if (errors.length) {
    console.error('[mall-admin-verify] FAILED')
    errors.forEach((e) => console.error(`  ✗ ${e}`))
    process.exit(1)
  }

  console.log('[mall-admin-verify] PASSED')
  console.log('  ✓ 管理端 GET/POST/PUT/DELETE /api/admin/mall/products')
  console.log('  ✓ PUT /api/admin/mall/products/:id/status 上下架')
  console.log('  ✓ 公开 GET /api/mall/products 仅 status=on_sale')
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main()
}
