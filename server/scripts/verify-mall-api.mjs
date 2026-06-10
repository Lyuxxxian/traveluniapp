/**
 * 商城公开 API 冒烟（需 server 运行）
 * 运行：cd server && npm run verify:mall
 */
const BASE = process.env.API_BASE || 'http://localhost:3000'

async function request(path) {
  const res = await fetch(`${BASE}${path}`)
  const json = await res.json()
  return { status: res.status, json }
}

const errors = []

function assert(name, cond, detail = '') {
  if (!cond) errors.push(`${name}${detail ? `: ${detail}` : ''}`)
}

function isValidProduct(item) {
  return (
    item
    && Number.isFinite(item.id)
    && typeof item.type === 'string'
    && typeof item.title === 'string'
    && typeof item.subtitle === 'string'
    && Number.isFinite(item.price)
    && Number.isFinite(item.originPrice)
    && typeof item.coverUrl === 'string'
    && Array.isArray(item.tags)
    && Number.isFinite(item.stock)
  )
}

async function main() {
  try {
    const health = await request('/health')
    assert('health', health.json.ok === true, `status=${health.status}`)
  } catch (err) {
    console.error('[mall-api] FAILED: 无法连接后端，请先 cd server && npm run dev')
    console.error(`  ${err.message}`)
    process.exit(1)
  }

  const ticketList = await request('/api/mall/products?type=ticket')
  assert('products ticket code 200', ticketList.json.code === 200)
  const ticketData = ticketList.json.data || {}
  const ticketItems = ticketData.list || []
  assert('products ticket non-empty', ticketItems.length > 0, `count=${ticketItems.length}`)
  assert(
    'products ticket valid shape',
    ticketItems.every(isValidProduct),
    'invalid product in ticket list',
  )
  assert(
    'products ticket type',
    ticketItems.every((item) => item.type === 'ticket'),
  )

  const hotelList = await request('/api/mall/products?type=hotel&page=1&pageSize=10')
  assert('products hotel code 200', hotelList.json.code === 200)
  assert('products hotel has data', (hotelList.json.data?.list || []).length >= 1)

  const annualList = await request('/api/mall/products?type=annualCard')
  assert('products annualCard code 200', annualList.json.code === 200)
  assert('products annualCard has data', (annualList.json.data?.list || []).length >= 1)

  const keyword = await request('/api/mall/products?type=ticket&keyword=成人')
  assert('products keyword code 200', keyword.json.code === 200)
  assert(
    'products keyword hits',
    (keyword.json.data?.list || []).some((item) => item.title.includes('成人')),
  )

  const detail = await request('/api/mall/products/1001')
  assert('product detail code 200', detail.json.code === 200)
  assert('product detail id', detail.json.data?.id === 1001)
  assert('product detail specs', Array.isArray(detail.json.data?.specs) && detail.json.data.specs.length > 0)
  assert('product detail description', Boolean(detail.json.data?.description))

  const missing = await request('/api/mall/products/99999')
  assert('product missing 404', missing.status === 404 && missing.json.code === 40401)

  const badType = await request('/api/mall/products?type=invalid')
  assert('products invalid type', badType.json.code === 40001)

  if (errors.length) {
    console.error('[mall-api] FAILED')
    errors.forEach((e) => console.error(`  ✗ ${e}`))
    process.exit(1)
  }

  console.log('[mall-api] PASSED')
  console.log(`  ✓ GET /api/mall/products?type=ticket (${ticketItems.length} 个)`)
  console.log('  ✓ GET /api/mall/products/1001 详情字段')
  console.log('  ✓ GET /api/mall/products?type=hotel / annualCard')
}

main()
