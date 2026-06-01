import { Router } from 'express'
import { optionalAuth, requireAuth } from '../lib/auth.js'
import { loadStore, nextId, resolveTargetTitle, saveStore } from '../lib/store.js'
import { ok, fail, paginate } from '../lib/response.js'
import { nowText } from '../lib/time.js'

const router = Router()

router.get('/service/config', (_req, res) => {
  const store = loadStore()
  return ok(res, store.serviceConfig)
})

router.post('/reviews', requireAuth, (req, res) => {
  const { targetType, targetId, rating, content, images, orderId } = req.body || {}
  if (!targetType || targetId === undefined || !rating || !content?.trim()) {
    return fail(res, 40001, '参数不完整')
  }
  if (rating < 1 || rating > 5) {
    return fail(res, 40001, '评分须在 1-5 之间')
  }

  const store = loadStore()
  const duplicate = store.reviews.find(
    (r) =>
      r.userId === req.user.id
      && r.targetType === targetType
      && Number(r.targetId) === Number(targetId),
  )
  if (duplicate) {
    return fail(res, 40901, '您已评价过该对象')
  }

  const id = nextId('review')
  const createdAt = nowText()
  store.reviews.unshift({
    id,
    userId: req.user.id,
    targetType,
    targetId: Number(targetId),
    targetTitle: resolveTargetTitle(targetType, Number(targetId)),
    rating: Number(rating),
    content: String(content).trim(),
    images: Array.isArray(images) ? images : [],
    orderId: orderId ?? null,
    createdAt,
    status: 'published',
  })
  saveStore()
  return ok(res, { id, createdAt })
})

router.get('/reviews', optionalAuth, (req, res) => {
  const { targetType, targetId, page, pageSize } = req.query
  if (!targetType || targetId === undefined) {
    return fail(res, 40001, '缺少 targetType 或 targetId')
  }

  const store = loadStore()
  const list = store.reviews
    .filter(
      (r) =>
        r.targetType === targetType
        && Number(r.targetId) === Number(targetId)
        && r.status === 'published',
    )
    .map(({ userId, status, ...rest }) => rest)

  return ok(res, paginate(list, page, pageSize))
})

router.get('/user/reviews', requireAuth, (req, res) => {
  const { page, pageSize, targetType } = req.query
  const store = loadStore()
  let list = store.reviews.filter((r) => r.userId === req.user.id)
  if (targetType) {
    list = list.filter((r) => r.targetType === targetType)
  }
  return ok(res, paginate(list, page, pageSize))
})

router.post('/feedback', requireAuth, (req, res) => {
  const { type, content, images, contact, relatedPointId, relatedOrderId } = req.body || {}
  if (!type || !content?.trim()) {
    return fail(res, 40001, '请填写反馈类型和内容')
  }

  const store = loadStore()
  const id = nextId('feedback')
  const createdAt = nowText()
  store.feedback.unshift({
    id,
    userId: req.user.id,
    type,
    content: String(content).trim(),
    images: Array.isArray(images) ? images : [],
    contact: contact || '',
    relatedPointId: relatedPointId ?? null,
    relatedOrderId: relatedOrderId ?? null,
    status: 'open',
    createdAt,
  })
  saveStore()
  return ok(res, { id, createdAt })
})

router.get('/questionnaires', optionalAuth, (req, res) => {
  const store = loadStore()
  const userId = req.user?.id
  const list = store.questionnaires
    .filter((q) => q.active !== false)
    .map(({ questions, active, ...summary }) => ({
      ...summary,
      submitted: userId
        ? store.questionnaireSubmissions.some(
            (s) => s.userId === userId && s.questionnaireId === summary.id,
          )
        : false,
    }))
  return ok(res, list)
})

router.get('/questionnaires/:id', optionalAuth, (req, res) => {
  const store = loadStore()
  const q = store.questionnaires.find((item) => item.id === Number(req.params.id))
  if (!q) {
    return fail(res, 40401, '问卷不存在', 404)
  }
  const { active, ...detail } = q
  return ok(res, detail)
})

router.post('/questionnaires/:id/submit', requireAuth, (req, res) => {
  const questionnaireId = Number(req.params.id)
  const { answers } = req.body || {}
  if (!Array.isArray(answers) || !answers.length) {
    return fail(res, 40001, '请提交答案')
  }

  const store = loadStore()
  const q = store.questionnaires.find((item) => item.id === questionnaireId)
  if (!q) {
    return fail(res, 40401, '问卷不存在', 404)
  }

  const dup = store.questionnaireSubmissions.find(
    (s) => s.userId === req.user.id && s.questionnaireId === questionnaireId,
  )
  if (dup) {
    return fail(res, 40902, '您已填写过该问卷')
  }

  const submissionId = nextId('submission')
  const createdAt = nowText()
  store.questionnaireSubmissions.push({
    submissionId,
    userId: req.user.id,
    questionnaireId,
    answers,
    createdAt,
  })
  saveStore()
  return ok(res, {
    submissionId,
    rewardHint: q.rewardHint,
    createdAt,
  })
})

router.post('/support/tickets', requireAuth, (req, res) => {
  const { category, content, contact, images, relatedOrderId, relatedPointId } = req.body || {}
  if (!category || !content?.trim() || !contact?.trim()) {
    return fail(res, 40001, '请填写分类、描述和联系电话')
  }

  const store = loadStore()
  const id = nextId('ticket')
  const ticketNo = `TK${Date.now()}`
  const createdAt = nowText()
  store.tickets.unshift({
    id,
    userId: req.user.id,
    ticketNo,
    category,
    content: String(content).trim(),
    contact: String(contact).trim(),
    images: Array.isArray(images) ? images : [],
    relatedOrderId: relatedOrderId ?? null,
    relatedPointId: relatedPointId ?? null,
    status: 'open',
    adminReply: '',
    createdAt,
    updatedAt: createdAt,
  })
  saveStore()
  return ok(res, { id, ticketNo, status: 'open', createdAt })
})

router.get('/user/support/tickets', requireAuth, (req, res) => {
  const { page, pageSize } = req.query
  const store = loadStore()
  const list = store.tickets
    .filter((t) => t.userId === req.user.id)
    .map((t) => ({
      id: t.id,
      ticketNo: t.ticketNo,
      category: t.category,
      content: t.content.length > 80 ? `${t.content.slice(0, 80)}…` : t.content,
      status: t.status,
      adminReply: t.adminReply || undefined,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }))
  return ok(res, paginate(list, page, pageSize))
})

export default router
