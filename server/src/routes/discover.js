import { Router } from 'express'
import { loadStore } from '../lib/store.js'
import { ok, fail, paginate } from '../lib/response.js'

const router = Router()

function publishedPosts(store) {
  return (store.discoverPosts || []).filter((p) => p.status === 'published')
}

function toListItem(post) {
  const {
    id,
    category,
    title,
    subtitle,
    priceText,
    coverUrl,
    tagText,
    summary,
    location,
    publishTime,
    actionText,
    target,
  } = post
  return {
    id,
    category,
    title,
    subtitle,
    priceText,
    coverUrl,
    tagText,
    summary,
    location,
    publishTime,
    actionText,
    target,
  }
}

function toDetail(post) {
  return {
    ...toListItem(post),
    place: post.place || post.location,
    joinWay: post.joinWay,
    durationText: post.durationText,
    contentText: post.contentText,
    meaningText: post.meaningText,
    detailImageUrl: post.detailImageUrl || post.coverUrl,
    buttonText: post.buttonText || post.actionText,
    relatedTargets: post.relatedTargets || [],
  }
}

router.get('/posts', (req, res) => {
  const store = loadStore()
  let list = publishedPosts(store)
  const category = req.query.category
  if (category && category !== 'recommend') {
    list = list.filter((p) => p.category === category)
  }
  const page = req.query.page
  const pageSize = req.query.pageSize
  if (page || pageSize) {
    return ok(res, paginate(list.map(toListItem), page, pageSize))
  }
  return ok(res, list.map(toListItem))
})

router.get('/posts/:id', (req, res) => {
  const store = loadStore()
  const post = publishedPosts(store).find((p) => p.id === Number(req.params.id))
  if (!post) return fail(res, 40401, '内容不存在', 404)
  return ok(res, toDetail(post))
})

export { toListItem, toDetail }
export default router
