/**
 * 服务层 API 层静态自检（第 1 步）
 * 运行：npm run verify:service
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function read(rel) {
  return readFileSync(join(root, rel), 'utf8')
}

const errors = []
const apiTs = read('src/config/api.ts')
const serviceTs = read('src/api/service.ts')
const serviceData = read('src/api/serviceData.ts')
const envExample = read('.env.example')

const requiredExports = [
  'fetchFaqs',
  'fetchServiceConfig',
  'fetchReviewsByTarget',
  'fetchUserReviews',
  'submitReview',
  'submitFeedback',
  'fetchQuestionnaires',
  'fetchQuestionnaireDetail',
  'submitQuestionnaire',
  'submitSupportTicket',
  'fetchUserSupportTickets',
  'isServiceRemoteApiEnabled',
]

requiredExports.forEach((name) => {
  if (!serviceTs.includes(`export async function ${name}`) && !serviceTs.includes(`export function ${name}`)) {
    errors.push(`service.ts 缺少导出: ${name}`)
  }
})

;[
  'reviews:',
  'userReviews:',
  'feedback:',
  'questionnaires:',
  'supportTickets:',
  'userSupportTickets:',
  'config:',
].forEach((token) => {
  if (!apiTs.includes(token)) errors.push(`api.ts API_PATHS.service 缺少 ${token}`)
})

if (serviceTs.includes("from './ai'") || serviceTs.includes('from "../api/ai"')) {
  errors.push('service.ts 禁止引用 ai.ts')
}

if (!serviceTs.includes('VITE_SERVICE_USE_REMOTE_API')) {
  errors.push('service.ts 缺少 VITE_SERVICE_USE_REMOTE_API')
}
if (!serviceTs.includes('VITE_SERVICE_SIMULATE_API_ERROR')) {
  errors.push('service.ts 缺少 VITE_SERVICE_SIMULATE_API_ERROR')
}
if (!serviceTs.includes('AI_PROXY_PATHS.faqs')) {
  errors.push('service.ts 应通过 AI_PROXY_PATHS.faqs 拉取 FAQ')
}
if (!serviceData.includes('MOCK_FAQS')) {
  errors.push('serviceData.ts 缺少 MOCK_FAQS')
}
if (!serviceData.includes("type: 'human'")) {
  errors.push('serviceData.ts MOCK_FAQS 应含人工客服条目')
}
if (!envExample.includes('VITE_SERVICE_USE_REMOTE_API')) {
  errors.push('.env.example 缺少 VITE_SERVICE_USE_REMOTE_API 说明')
}

if (errors.length) {
  console.error('[service-api] FAILED')
  errors.forEach((e) => console.error(`  ✗ ${e}`))
  process.exit(1)
}

console.log('[service-api] PASSED')
console.log(`  ✓ 导出函数 ${requiredExports.length} 个`)
console.log('  ✓ API_PATHS.service 已配置')
console.log('  ✓ 未引用 ai.ts / FAQ 走 AI_PROXY_PATHS')
