import { Router } from 'express'
import { loadStore, saveStore, nextId } from '../lib/store.js'
import { ok, fail } from '../lib/response.js'

const router = Router()

router.get('/ai-service/faqs', (_req, res) => {
  const store = loadStore()
  return ok(res, store.faqs || [])
})

router.post('/ai-service/faqs', (req, res) => {
  const store = loadStore()
  const body = req.body || {}
  const row = {
    id: nextId('faq'),
    question: body.question || '',
    answer: body.answer,
    category: body.category || 'other',
    type: body.type || 'normal',
    sort: body.sort ?? 99,
  }
  store.faqs.push(row)
  saveStore()
  return ok(res, row)
})

router.put('/ai-service/faqs/:id', (req, res) => {
  const store = loadStore()
  const idx = store.faqs.findIndex((f) => f.id === Number(req.params.id))
  if (idx < 0) return fail(res, 40401, 'FAQ 不存在', 404)
  store.faqs[idx] = { ...store.faqs[idx], ...req.body, id: Number(req.params.id) }
  saveStore()
  return ok(res, store.faqs[idx])
})

router.delete('/ai-service/faqs/:id', (req, res) => {
  const store = loadStore()
  const before = store.faqs.length
  store.faqs = store.faqs.filter((f) => f.id !== Number(req.params.id))
  if (store.faqs.length === before) return fail(res, 40401, 'FAQ 不存在', 404)
  saveStore()
  return ok(res, { deleted: true })
})

router.get('/questionnaires', (_req, res) => {
  const store = loadStore()
  return ok(res, store.questionnaires || [])
})

router.post('/questionnaires', (req, res) => {
  const store = loadStore()
  const body = req.body || {}
  const row = {
    id: nextId('questionnaire'),
    title: body.title || '未命名问卷',
    desc: body.desc || '',
    rewardHint: body.rewardHint || '',
    deadline: body.deadline || '',
    active: body.active !== false,
    questions: body.questions || [],
  }
  store.questionnaires.push(row)
  saveStore()
  return ok(res, row)
})

router.put('/questionnaires/:id', (req, res) => {
  const store = loadStore()
  const idx = store.questionnaires.findIndex((q) => q.id === Number(req.params.id))
  if (idx < 0) return fail(res, 40401, '问卷不存在', 404)
  store.questionnaires[idx] = {
    ...store.questionnaires[idx],
    ...req.body,
    id: Number(req.params.id),
  }
  saveStore()
  return ok(res, store.questionnaires[idx])
})

router.get('/service/config', (_req, res) => {
  const store = loadStore()
  return ok(res, store.serviceConfig || {})
})

router.put('/service/config', (req, res) => {
  const store = loadStore()
  store.serviceConfig = { ...store.serviceConfig, ...req.body }
  saveStore()
  return ok(res, store.serviceConfig)
})

router.get('/statistics/overview', (_req, res) => {
  const store = loadStore()
  const feedbackOpen = (store.feedback || []).filter((f) => f.status === 'open').length
  const ticketsOpen = (store.tickets || []).filter(
    (t) => t.status === 'open' || t.status === 'processing',
  ).length
  const reviewsPending = (store.reviews || []).filter((r) => r.status === 'pending').length
  const discoverDraft = (store.discoverPosts || []).filter((p) => p.status !== 'published').length
  return ok(res, {
    feedbackTotal: store.feedback?.length || 0,
    feedbackOpen,
    ticketsTotal: store.tickets?.length || 0,
    ticketsOpen,
    reviewsTotal: store.reviews?.length || 0,
    reviewsPending,
    faqsTotal: store.faqs?.length || 0,
    questionnairesTotal: store.questionnaires?.length || 0,
    discoverPostsTotal: store.discoverPosts?.length || 0,
    discoverDraft,
  })
})

export default router
