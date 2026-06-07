/**
 * M2 地图管理端冒烟（需 server 运行）
 * 覆盖：公开 /api/map/*、管理端 /api/admin/map/* 点位与分类 CRUD、公开同步
 *
 * 运行：cd server && npm run verify:map-admin
 */
import { fileURLToPath } from 'node:url'

const BASE = process.env.API_BASE || 'http://localhost:3000'
const ADMIN_USER = process.env.ADMIN_DEV_USERNAME || 'admin'
const ADMIN_PASS = process.env.ADMIN_DEV_PASSWORD || 'DevOnly!2026'

const FROZEN_CATEGORIES = ['spot', 'food', 'toilet', 'parking', 'service']

export async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options)
  const json = await res.json()
  return { status: res.status, json }
}

export async function runMapAdminVerify(errors = [], { adminToken: presetToken } = {}) {
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

  const noAuth = await request('/api/admin/map/points')
  assert('admin map auth required', noAuth.status === 401 || noAuth.json.code === 40101)

  const publicCats = await request('/api/map/categories')
  assert('public map categories', publicCats.json.code === 200 && publicCats.json.data?.length >= 18)
  FROZEN_CATEGORIES.forEach((key) => {
    assert(
      `frozen category ${key}`,
      (publicCats.json.data || []).some((c) => c.key === key),
    )
  })

  const publicSpot = await request('/api/map/points?category=spot')
  assert('public map points spot', publicSpot.json.code === 200 && publicSpot.json.data?.length > 0)

  const adminCats = await request('/api/admin/map/categories', { headers })
  assert('admin map categories list', adminCats.json.code === 200 && adminCats.json.data?.length >= 5)

  const adminPointsPage = await request('/api/admin/map/points?page=1&pageSize=5', { headers })
  assert(
    'admin map points paginated',
    adminPointsPage.json.code === 200 && adminPointsPage.json.data?.list?.length > 0,
  )

  const VERIFY_TITLE = '__verify_map_admin__'
  const adminPointsBefore = await request(
    `/api/admin/map/points?keyword=${encodeURIComponent(VERIFY_TITLE)}`,
    { headers },
  )
  const staleList = Array.isArray(adminPointsBefore.json.data)
    ? adminPointsBefore.json.data
    : adminPointsBefore.json.data?.list || []
  for (const p of staleList.filter((row) => row.title === VERIFY_TITLE)) {
    await request(`/api/admin/map/points/${p.id}`, { method: 'DELETE', headers })
  }

  const created = await request('/api/admin/map/points', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      category: 'spot',
      title: VERIFY_TITLE,
      latitude: 31.42,
      longitude: 120.11,
      address: '地图管理冒烟地址',
      desc: 'M2 verify-map-admin 创建',
      tags: ['验收'],
      suggestedDuration: '10分钟',
    }),
  })
  assert('admin map point create', created.json.code === 200 && created.json.data?.id)
  const pointId = created.json.data?.id

  const adminGet = await request(`/api/admin/map/points/${pointId}`, { headers })
  assert(
    'admin map point detail',
    adminGet.json.code === 200 && adminGet.json.data?.suggestedDuration === '10分钟',
  )

  const publicHit = await request(`/api/map/points?keyword=${encodeURIComponent(VERIFY_TITLE)}`)
  assert(
    'public map list sees new point',
    (publicHit.json.data || []).some((p) => p.id === pointId),
  )

  const NEW_TITLE = `${VERIFY_TITLE}-标题已改`
  const titleUpdated = await request(`/api/admin/map/points/${pointId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      category: 'spot',
      title: NEW_TITLE,
      latitude: 31.421,
      longitude: 120.111,
      address: '地图管理冒烟地址-已更新',
      desc: 'M2 verify-map-admin 更新',
      status: 'open',
    }),
  })
  assert('admin map point update title', titleUpdated.json.code === 200 && titleUpdated.json.data?.title === NEW_TITLE)

  const publicAfterTitle = await request(`/api/map/points?keyword=${encodeURIComponent(NEW_TITLE)}`)
  assert(
    'public map marker title sync',
    (publicAfterTitle.json.data || []).some((p) => p.id === pointId && p.title === NEW_TITLE),
  )

  const statusRes = await request(`/api/admin/map/points/${pointId}/status`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ status: 'closed' }),
  })
  assert('admin map point status closed', statusRes.json.code === 200 && statusRes.json.data?.status === 'closed')

  const hidden = await request('/api/map/points?category=spot&includeClosed=false')
  assert(
    'public map exclude closed',
    !(hidden.json.data || []).some((p) => p.id === pointId),
  )

  await request(`/api/admin/map/points/${pointId}/status`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ status: 'open' }),
  })

  const frozenDelete = await request('/api/admin/map/categories/spot', { method: 'DELETE', headers })
  assert(
    'admin map frozen category delete 403',
    frozenDelete.status === 403 && frozenDelete.json.code === 40301,
  )

  const VERIFY_CAT_KEY = 'verify_cat'
  await request(`/api/admin/map/categories/${VERIFY_CAT_KEY}`, { method: 'DELETE', headers })

  const catCreated = await request('/api/admin/map/categories', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      key: VERIFY_CAT_KEY,
      label: '验收分类',
      icon: VERIFY_CAT_KEY,
      color: '#112233',
      sort: 99,
    }),
  })
  assert('admin map category create', catCreated.json.code === 200)

  const catDeleted = await request(`/api/admin/map/categories/${VERIFY_CAT_KEY}`, {
    method: 'DELETE',
    headers,
  })
  assert('admin map category delete', catDeleted.json.code === 200)

  const TEST_LABEL = '景点-M2验收'
  await request('/api/admin/map/categories/spot', {
    method: 'PUT',
    headers,
    body: JSON.stringify({ label: TEST_LABEL }),
  })
  const catsAfter = await request('/api/map/categories')
  assert(
    'public map category label sync',
    (catsAfter.json.data || []).some((c) => c.key === 'spot' && c.label === TEST_LABEL),
  )
  await request('/api/admin/map/categories/spot', {
    method: 'PUT',
    headers,
    body: JSON.stringify({ label: '景点' }),
  })

  const removed = await request(`/api/admin/map/points/${pointId}`, { method: 'DELETE', headers })
  assert('admin map point delete', removed.json.code === 200)

  const gone = await request(`/api/map/points/${pointId}`)
  assert('public map point gone', gone.status === 404 && gone.json.code === 40401)

  return errors
}

async function main() {
  const errors = []
  try {
    const health = await request('/health')
    if (!health.json.ok) errors.push('health check failed')
    await runMapAdminVerify(errors)
  } catch (e) {
    errors.push(`服务未启动或不可达: ${e.message}（请先 cd server && npm run dev）`)
  }

  if (errors.length) {
    console.error('[map-admin-verify] FAILED')
    errors.forEach((e) => console.error(`  ✗ ${e}`))
    process.exit(1)
  }

  console.log('[map-admin-verify] PASSED')
  console.log('  ✓ 公开 GET /api/map/categories|points')
  console.log('  ✓ 管理端点位 CRUD + title 同步公开 API')
  console.log('  ✓ 管理端分类 CRUD + 冻结五类保护')
  console.log('  ✓ C 端联调: .env.local 设 VITE_MAP_USE_REMOTE_API=true')
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main()
}
