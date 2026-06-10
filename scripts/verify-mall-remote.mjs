/**
 * M2-MALL-05：验收 C 端远程商城 API 契约
 * 模拟 VITE_MALL_USE_REMOTE_API=true 时 C 端拿到的公开数据：
 * 后台下架商品 → GET /api/mall/products 不可见
 *
 * 运行：npm run verify:mall-remote（需 server 运行）
 */
const BASE = process.env.API_BASE || 'http://localhost:3000'
const ADMIN_USER = process.env.ADMIN_DEV_USERNAME || 'admin'
const ADMIN_PASS = process.env.ADMIN_DEV_PASSWORD || 'DevOnly!2026'
const TEST_PRODUCT_ID = 1001

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options)
  const json = await res.json()
  return { status: res.status, json }
}

const errors = []

function assert(name, cond, detail = '') {
  if (!cond) errors.push(`${name}${detail ? `: ${detail}` : ''}`)
}

async function main() {
  try {
    const health = await request('/health')
    assert('health', health.json.ok === true)
  } catch (err) {
    console.error('[mall-remote] FAILED: 无法连接后端，请先 cd server && npm run dev')
    console.error(`  ${err.message}`)
    process.exit(1)
  }

  const login = await request('/api/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: ADMIN_USER, password: ADMIN_PASS }),
  })
  assert('admin login', login.json.code === 200 && login.json.data?.token)
  const token = login.json.data?.token || ''
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }

  const before = await request('/api/mall/products?type=ticket')
  assert('public ticket list', before.json.code === 200)
  const beforeIds = (before.json.data?.list || []).map((item) => item.id)
  assert('product 1001 on_sale visible', beforeIds.includes(TEST_PRODUCT_ID))

  await request(`/api/admin/mall/products/${TEST_PRODUCT_ID}/status`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ status: 'off_sale' }),
  })

  const hidden = await request('/api/mall/products?type=ticket')
  const hiddenIds = (hidden.json.data?.list || []).map((item) => item.id)
  assert('off_sale hidden from public list', !hiddenIds.includes(TEST_PRODUCT_ID))

  const detail = await request(`/api/mall/products/${TEST_PRODUCT_ID}`)
  assert('off_sale detail 404', detail.status === 404 && detail.json.code === 40401)

  await request(`/api/admin/mall/products/${TEST_PRODUCT_ID}/status`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ status: 'on_sale' }),
  })

  const restored = await request('/api/mall/products?type=ticket')
  const restoredIds = (restored.json.data?.list || []).map((item) => item.id)
  assert('on_sale restored visible', restoredIds.includes(TEST_PRODUCT_ID))

  if (errors.length) {
    console.error('[mall-remote] FAILED')
    errors.forEach((e) => console.error(`  ✗ ${e}`))
    process.exit(1)
  }

  console.log('[mall-remote] PASSED')
  console.log('  ✓ 公开列表仅 on_sale 商品')
  console.log('  ✓ 下架后 C 端远程列表不可见（设 VITE_MALL_USE_REMOTE_API=true）')
  console.log('  ✓ 下架后详情 404，不回退 mock')
}

main()
