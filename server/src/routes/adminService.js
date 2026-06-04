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

function formatAnswerDisplay(question, value) {
  if (!question) return value == null ? '' : String(value)
  if (question.type === 'score') return `${value} 分`
  if (question.type === 'text') return String(value ?? '')
  if (question.type === 'single') {
    const opt = question.options?.find((o) => o.id === value)
    return opt?.label || String(value)
  }
  if (question.type === 'multi' && Array.isArray(value)) {
    return value
      .map((id) => question.options?.find((o) => o.id === id)?.label || id)
      .join('、')
  }
  return JSON.stringify(value)
}

function enrichSubmissionAnswers(questionnaire, submission) {
  const questions = questionnaire?.questions || []
  return (submission.answers || []).map((a) => {
    const question = questions.find((q) => q.id === a.questionId)
    return {
      questionId: a.questionId,
      questionTitle: question?.title || `题目#${a.questionId}`,
      questionType: question?.type,
      value: a.value,
      displayValue: formatAnswerDisplay(question, a.value),
    }
  })
}

router.get('/questionnaires', (_req, res) => {
  const store = loadStore()
  const subs = store.questionnaireSubmissions || []
  const list = (store.questionnaires || []).map((q) => ({
    ...q,
    submissionCount: subs.filter((s) => s.questionnaireId === q.id).length,
  }))
  return ok(res, list)
})

router.get('/questionnaires/:id/submissions', (req, res) => {
  const store = loadStore()
  const questionnaireId = Number(req.params.id)
  const questionnaire = store.questionnaires?.find((q) => q.id === questionnaireId)
  if (!questionnaire) {
    return fail(res, 40401, '问卷不存在', 404)
  }
  const subs = (store.questionnaireSubmissions || [])
    .filter((s) => s.questionnaireId === questionnaireId)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
  const list = subs.map((s) => {
    const user = store.users?.find((u) => u.id === s.userId)
    return {
      submissionId: s.submissionId,
      userId: s.userId,
      username: user?.username,
      nickname: user?.nickname,
      phone: user?.phone,
      createdAt: s.createdAt,
      answers: enrichSubmissionAnswers(questionnaire, s),
    }
  })
  return ok(res, { questionnaireId, title: questionnaire.title, list, total: list.length })
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
