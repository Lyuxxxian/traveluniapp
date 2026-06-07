/**
 * 地图公开 API 冒烟（需 server 运行）
 * 运行：cd server && npm run verify:map
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

function isValidPoint(item) {
  return (
    item
    && Number.isFinite(item.id)
    && Boolean(item.category && item.title)
    && Number.isFinite(item.latitude)
    && Number.isFinite(item.longitude)
  )
}

async function main() {
  try {
    const health = await request('/health')
    assert('health', health.json.ok === true, `status=${health.status}`)
  } catch (err) {
    console.error('[map-api] FAILED: 无法连接后端，请先 cd server && npm run dev')
    console.error(`  ${err.message}`)
    process.exit(1)
  }

  const categories = await request('/api/map/categories')
  assert('categories code 200', categories.json.code === 200)
  const catList = categories.json.data || []
  assert('categories non-empty', catList.length > 0)
  assert(
    'frozen category spot',
    catList.some((c) => c.key === 'spot' && c.label),
  )

  const spotPoints = await request('/api/map/points?category=spot')
  assert('points spot code 200', spotPoints.json.code === 200)
  const points = spotPoints.json.data || []
  assert('points spot non-empty', points.length > 0, `count=${points.length}`)
  assert(
    'points spot valid shape',
    points.every(isValidPoint),
    'invalid point in spot list',
  )
  assert(
    'points spot category',
    points.every((p) => p.category === 'spot'),
  )

  const keyword = await request('/api/map/points?keyword=灵山大佛')
  assert('points keyword code 200', keyword.json.code === 200)
  assert(
    'points keyword hits',
    (keyword.json.data || []).some((p) => p.title.includes('灵山大佛')),
  )

  const detail = await request('/api/map/points/101')
  assert('point detail code 200', detail.json.code === 200)
  assert('point detail id', detail.json.data?.id === 101)
  assert('point detail extras', detail.json.data?.suggestedDuration === '45分钟')

  const missing = await request('/api/map/points/99999')
  assert('point missing 404', missing.status === 404 && missing.json.code === 40401)

  const routes = await request('/api/map/routes')
  assert('routes code 200', routes.json.code === 200)
  const routeList = routes.json.data || []
  assert('routes non-empty', routeList.length > 0)
  assert(
    'routes pointIds',
    routeList.every((r) => Array.isArray(r.pointIds) && r.pointIds.length > 0),
  )

  const cultureRoutes = await request('/api/map/routes?scene=culture')
  assert(
    'routes scene filter',
    (cultureRoutes.json.data || []).every((r) => r.scene === 'culture'),
  )

  if (errors.length) {
    console.error('[map-api] FAILED')
    errors.forEach((e) => console.error(`  ✗ ${e}`))
    process.exit(1)
  }

  console.log('[map-api] PASSED')
  console.log(`  ✓ GET /api/map/categories (${catList.length} 类)`)
  console.log(`  ✓ GET /api/map/points?category=spot (${points.length} 个)`)
  console.log('  ✓ GET /api/map/points/101 详情增强字段')
  console.log(`  ✓ GET /api/map/routes (${routeList.length} 条)`)
}

main()
