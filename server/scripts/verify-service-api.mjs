/**
 * 服务层后端 API 冒烟测试（需先 npm run dev 或 start）
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
  let token = ''

  try {
    const login = await request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'test', password: '123456' }),
    })
    assert('login', login.json.code === 200 && login.json.data?.token)
    token = login.json.data?.token || ''

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }

    const faqs = await request('/api/ai-service/faqs')
    assert('faqs', faqs.json.code === 200 && Array.isArray(faqs.json.data))

    const config = await request('/api/service/config')
    assert('service/config', config.json.code === 200 && config.json.data?.servicePhone)

    const qList = await request('/api/questionnaires', { headers })
    assert('questionnaires', qList.json.code === 200 && qList.json.data?.length)

    const reviewsPublic = await request('/api/reviews?targetType=spot&targetId=101')
    assert('reviews by target', reviewsPublic.json.code === 200 && reviewsPublic.json.data?.list)

    const fb = await request('/api/feedback', {
      method: 'POST',
      headers,
      body: JSON.stringify({ type: 'suggestion', content: '自动化测试反馈' }),
    })
    assert('feedback', fb.json.code === 200 && fb.json.data?.id)

    const ticket = await request('/api/support/tickets', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        category: 'other',
        content: '自动化测试工单',
        contact: '13800000000',
      }),
    })
    assert('support ticket', ticket.json.code === 200 && ticket.json.data?.ticketNo)

    const myTickets = await request('/api/user/support/tickets', { headers })
    assert('user tickets', myTickets.json.code === 200 && myTickets.json.data?.list?.length)

    const adminFb = await request('/api/admin/feedback')
    assert('admin feedback', adminFb.json.code === 200)
  } catch (e) {
    errors.push(`服务未启动或不可达: ${e.message}（请先 cd server && npm run dev）`)
  }

  if (errors.length) {
    console.error('[server-verify] FAILED')
    errors.forEach((e) => console.error(`  ✗ ${e}`))
    process.exit(1)
  }

  console.log('[server-verify] PASSED')
  console.log('  ✓ 认证、FAQ、配置、问卷、点评、反馈、工单、管理端可读')
}

main()
