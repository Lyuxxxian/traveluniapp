import { Router } from 'express'
import { loadStore, saveStore, nextId } from '../lib/store.js'
import { ok, fail, paginate } from '../lib/response.js'
import {
  filterAdminProducts,
  isPublicProductType,
  PRODUCT_STATUSES,
} from '../lib/mallQuery.js'

const router = Router()

function findProduct(store, id) {
  return (store.products || []).find((item) => item.id === id)
}

function normalizeSpecs(specs, fallbackPrice) {
  if (!Array.isArray(specs) || specs.length === 0) {
    return [{ id: 0, name: '默认规格', price: fallbackPrice }]
  }
  return specs.map((spec, index) => ({
    id: Number.isFinite(Number(spec.id)) ? Number(spec.id) : index,
    name: String(spec.name || '默认规格').trim() || '默认规格',
    price: Number(spec.price) || 0,
  }))
}

function validateProductBody(body, { isCreate = false } = {}) {
  if (isCreate && body.id !== undefined) {
    return '新建商品不可传 id'
  }

  if (body.type !== undefined && !isPublicProductType(String(body.type))) {
    return '无效的商品类型'
  }
  if (isCreate && !isPublicProductType(String(body.type || ''))) {
    return 'type 必填且须为有效商品类型'
  }

  if (body.title !== undefined && !String(body.title).trim()) {
    return 'title 不能为空'
  }
  if (isCreate && !String(body.title || '').trim()) {
    return 'title 必填'
  }

  if (body.subtitle !== undefined && !String(body.subtitle).trim()) {
    return 'subtitle 不能为空'
  }
  if (isCreate && !String(body.subtitle || '').trim()) {
    return 'subtitle 必填'
  }

  if (body.price !== undefined && !Number.isFinite(Number(body.price))) {
    return 'price 须为数字'
  }
  if (isCreate && !Number.isFinite(Number(body.price))) {
    return 'price 必填'
  }

  if (body.originPrice !== undefined && !Number.isFinite(Number(body.originPrice))) {
    return 'originPrice 须为数字'
  }
  if (isCreate && !Number.isFinite(Number(body.originPrice))) {
    return 'originPrice 必填'
  }

  if (body.coverUrl !== undefined && !String(body.coverUrl).trim()) {
    return 'coverUrl 不能为空'
  }
  if (isCreate && !String(body.coverUrl || '').trim()) {
    return 'coverUrl 必填'
  }

  if (body.stock !== undefined && !Number.isFinite(Number(body.stock))) {
    return 'stock 须为数字'
  }
  if (isCreate && !Number.isFinite(Number(body.stock))) {
    return 'stock 必填'
  }

  if (body.status !== undefined && !PRODUCT_STATUSES.has(body.status)) {
    return 'status 须为 on_sale 或 off_sale'
  }

  if (body.tags !== undefined && !Array.isArray(body.tags)) {
    return 'tags 须为数组'
  }
  if (body.coverImages !== undefined && !Array.isArray(body.coverImages)) {
    return 'coverImages 须为数组'
  }
  if (body.specs !== undefined && !Array.isArray(body.specs)) {
    return 'specs 须为数组'
  }

  return null
}

function buildProductRow(body, existing = null) {
  const isCreate = !existing
  const price = body.price !== undefined ? Number(body.price) : existing?.price ?? 0
  const coverUrl =
    body.coverUrl !== undefined ? String(body.coverUrl).trim() : existing?.coverUrl || ''

  const row = {
    id: existing?.id,
    type: body.type !== undefined ? String(body.type) : existing?.type,
    title: body.title !== undefined ? String(body.title).trim() : existing?.title,
    subtitle: body.subtitle !== undefined ? String(body.subtitle).trim() : existing?.subtitle,
    price,
    originPrice:
      body.originPrice !== undefined ? Number(body.originPrice) : existing?.originPrice ?? price,
    coverUrl,
    tags: body.tags !== undefined ? body.tags.map(String) : existing?.tags || [],
    stock: body.stock !== undefined ? Number(body.stock) : existing?.stock ?? 0,
    status: body.status !== undefined ? body.status : existing?.status || 'on_sale',
    coverImages:
      body.coverImages !== undefined
        ? body.coverImages.map(String)
        : existing?.coverImages?.length
          ? existing.coverImages
          : coverUrl
            ? [coverUrl]
            : [],
    description:
      body.description !== undefined
        ? String(body.description)
        : existing?.description || `${existing?.title || body.title || ''}。`,
    notice:
      body.notice !== undefined
        ? String(body.notice)
        : existing?.notice || '请以景区现场公告为准。',
    specs:
      body.specs !== undefined
        ? normalizeSpecs(body.specs, price)
        : existing?.specs?.length
          ? existing.specs
          : normalizeSpecs([], price),
  }

  if (isCreate) {
    row.id = nextId('product')
  }

  return row
}

router.get('/products', (req, res) => {
  const store = loadStore()
  const filtered = filterAdminProducts(store.products || [], req.query)
  if (filtered.error) return fail(res, 40001, filtered.error)

  const page = Number(req.query.page) || 1
  const pageSize = Number(req.query.pageSize) || 20
  return ok(res, paginate(filtered.list, page, pageSize))
})

router.get('/products/:id', (req, res) => {
  const store = loadStore()
  const id = Number(req.params.id)
  if (!Number.isFinite(id)) return fail(res, 40001, '无效的商品 id')

  const product = findProduct(store, id)
  if (!product) return fail(res, 40401, '商品不存在', 404)

  return ok(res, product)
})

router.post('/products', (req, res) => {
  const store = loadStore()
  const body = req.body || {}
  const err = validateProductBody(body, { isCreate: true })
  if (err) return fail(res, 40001, err)

  const row = buildProductRow(body)
  store.products = store.products || []
  store.products.push(row)
  saveStore()
  return ok(res, row)
})

router.put('/products/:id/status', (req, res) => {
  const store = loadStore()
  const id = Number(req.params.id)
  if (!Number.isFinite(id)) return fail(res, 40001, '无效的商品 id')

  const product = findProduct(store, id)
  if (!product) return fail(res, 40401, '商品不存在', 404)

  const status = req.body?.status
  if (!status || !PRODUCT_STATUSES.has(status)) {
    return fail(res, 40001, 'status 须为 on_sale 或 off_sale')
  }

  product.status = status
  saveStore()
  return ok(res, product)
})

router.put('/products/:id', (req, res) => {
  const store = loadStore()
  const id = Number(req.params.id)
  if (!Number.isFinite(id)) return fail(res, 40001, '无效的商品 id')

  const idx = (store.products || []).findIndex((item) => item.id === id)
  if (idx < 0) return fail(res, 40401, '商品不存在', 404)

  const body = req.body || {}
  if (body.id !== undefined && Number(body.id) !== id) {
    return fail(res, 40001, 'id 不可修改')
  }

  const err = validateProductBody(body)
  if (err) return fail(res, 40001, err)

  const row = buildProductRow(body, store.products[idx])
  store.products[idx] = row
  saveStore()
  return ok(res, row)
})

router.delete('/products/:id', (req, res) => {
  const store = loadStore()
  const id = Number(req.params.id)
  if (!Number.isFinite(id)) return fail(res, 40001, '无效的商品 id')

  const before = store.products?.length || 0
  store.products = (store.products || []).filter((item) => item.id !== id)
  if (store.products.length === before) return fail(res, 40401, '商品不存在', 404)

  saveStore()
  return ok(res, { deleted: true, id })
})

export default router
