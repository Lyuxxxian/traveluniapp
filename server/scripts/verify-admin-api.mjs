/**
 * 管理端 API 冒烟（需 server 运行；默认 admin/admin123）
 */
const BASE = process.env.API_BASE || 'http://localhost:3000'

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
  let adminToken = ''

  try {
    const login = await request('/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' }),
    })
    assert('admin login', login.json.code === 200 && login.json.data?.token)
    adminToken = login.json.data?.token || ''
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    }

    const overview = await request('/api/admin/statistics/overview', { headers })
    assert('statistics/overview', overview.json.code === 200 && overview.json.data?.faqsTotal >= 0)

    const faqs = await request('/api/admin/ai-service/faqs', { headers })
    assert('admin faqs', faqs.json.code === 200 && Array.isArray(faqs.json.data))

    const homeAdmin = await request('/api/admin/home/config', { headers })
    assert('admin home', homeAdmin.json.code === 200 && homeAdmin.json.data?.heroSlides?.length)

    const discoverAdmin = await request('/api/admin/discover/posts', { headers })
    assert('admin discover', discoverAdmin.json.code === 200 && discoverAdmin.json.data?.length)

    const homePublic = await request('/api/home/config')
    assert('public home', homePublic.json.code === 200 && homePublic.json.data?.matrixItems?.length)

    const discoverPublic = await request('/api/discover/posts?page=1&pageSize=5')
    assert('public discover list', discoverPublic.json.code === 200 && discoverPublic.json.data?.list?.length)

    const detail = await request('/api/discover/posts/1')
    assert('public discover detail', detail.json.code === 200 && detail.json.data?.id === 1)

    const fb = await request('/api/admin/feedback', { headers })
    assert('admin feedback', fb.json.code === 200)
  } catch (e) {
    errors.push(`服务未启动或不可达: ${e.message}（请先 cd server && npm run dev）`)
  }

  if (errors.length) {
    console.error('[admin-verify] FAILED')
    errors.forEach((e) => console.error(`  ✗ ${e}`))
    process.exit(1)
  }

  console.log('[admin-verify] PASSED')
}

main()
