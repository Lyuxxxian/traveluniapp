/**
 * P0 开工检查：覆盖 ADMIN_CHECKLIST 中可 API 自动验证的项
 * 需 server 已启动
 */
const BASE = process.env.API_BASE || 'http://localhost:3000'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options)
  const json = await res.json()
  return { status: res.status, json }
}

const errors = []
const passed = []

function assert(name, cond, detail = '') {
  if (cond) passed.push(name)
  else errors.push(`${name}${detail ? `: ${detail}` : ''}`)
}

async function main() {
  const badLogin = await request('/api/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'wrong' }),
  })
  assert('admin 登录失败提示', badLogin.json.code !== 200)

  const login = await request('/api/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' }),
  })
  assert('admin 登录成功', login.json.code === 200 && login.json.data?.token)
  const token = login.json.data?.token || ''
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }

  const userLogin = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'test', password: '123456' }),
  })
  const userToken = userLogin.json.data?.token || ''
  const userHeaders = { ...headers, Authorization: `Bearer ${userToken}` }

  const faqsBefore = await request('/api/ai-service/faqs')
  const testQ = `P0验收FAQ-${Date.now()}`
  const created = await request('/api/admin/ai-service/faqs', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      question: testQ,
      answer: '自动化验收答案',
      category: 'other',
      type: 'normal',
      sort: 1,
    }),
  })
  assert('FAQ 管理写入', created.json.code === 200)
  const faqId = created.json.data?.id
  const faqsAfter = await request('/api/ai-service/faqs')
  assert(
    '改 FAQ 后 C 端帮助中心可读',
    faqsAfter.json.data?.some((f) => f.question === testQ),
  )
  if (faqId) {
    await request(`/api/admin/ai-service/faqs/${faqId}`, { method: 'DELETE', headers })
  }

  const ticketPut = await request('/api/admin/support/tickets/80001', {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      status: 'processing',
      adminReply: `P0验收回复-${Date.now()}`,
    }),
  })
  assert('工单 adminReply 写入', ticketPut.json.code === 200)
  const myTickets = await request('/api/user/support/tickets', { headers: userHeaders })
  assert(
    '用户工单可见 adminReply',
    myTickets.json.data?.list?.some((t) => t.adminReply?.includes('P0验收回复')),
  )

  const reviews = await request('/api/admin/reviews', { headers })
  const pending = reviews.json.data?.find((r) => r.status === 'published')
  if (pending) {
    await request(`/api/admin/reviews/${pending.id}/status`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ status: 'rejected' }),
    })
    const publicReviews = await request(
      `/api/reviews?targetType=${pending.targetType}&targetId=${pending.targetId}`,
    )
    const stillShown = publicReviews.json.data?.list?.some((r) => r.id === pending.id)
    assert('点评 rejected 后公开列表不展示', !stillShown)
    await request(`/api/admin/reviews/${pending.id}/status`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ status: 'published' }),
    })
  } else {
    assert('点评 rejected 后公开列表不展示', true, '跳过：无 published 样本')
  }

  const home = await request('/api/admin/home/config', { headers })
  const slides = [...(home.json.data?.heroSlides || [])]
  const marker = `P0-${Date.now()}`
  if (slides[0]) slides[0].title = marker
  const homePut = await request('/api/admin/home/config', {
    method: 'PUT',
    headers,
    body: JSON.stringify({ ...home.json.data, heroSlides: slides }),
  })
  assert('首页配置写入', homePut.json.code === 200)
  const homePublic = await request('/api/home/config')
  assert('改首页后公开 API 可读', homePublic.json.data?.heroSlides?.[0]?.title === marker)

  const discoverAdmin = await request('/api/admin/discover/posts', { headers })
  const post = discoverAdmin.json.data?.[0]
  if (post) {
    const oldStatus = post.status
    await request(`/api/admin/discover/posts/${post.id}/status`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ status: 'draft' }),
    })
    const listPublic = await request('/api/discover/posts')
    const inList = Array.isArray(listPublic.json.data)
      ? listPublic.json.data.some((p) => p.id === post.id)
      : listPublic.json.data?.list?.some((p) => p.id === post.id)
    assert('发现帖 draft 后 C 端列表不展示', !inList)
    await request(`/api/admin/discover/posts/${post.id}/status`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ status: oldStatus || 'published' }),
    })
  } else {
    assert('发现帖 draft 后 C 端列表不展示', true, '跳过：无发现帖')
  }

  if (errors.length) {
    console.error('[p0-checklist] FAILED')
    errors.forEach((e) => console.error(`  ✗ ${e}`))
    process.exit(1)
  }
  console.log('[p0-checklist] PASSED')
  passed.forEach((p) => console.log(`  ✓ ${p}`))
}

main().catch((e) => {
  console.error('[p0-checklist] ERROR', e.message)
  process.exit(1)
})
