import { Router } from 'express'
import { loadStore } from '../lib/store.js'
import { ok, fail, paginate } from '../lib/response.js'
import {
  filterPublicProducts,
  isPublicProductType,
  toProductDetail,
} from '../lib/mallQuery.js'

const router = Router()

router.get('/products', (req, res) => {
  const store = loadStore()
  const type = req.query.type ? String(req.query.type) : ''
  if (type && !isPublicProductType(type)) {
    return fail(res, 40001, '无效的商品类型')
  }

  const list = filterPublicProducts(store.products || [], req.query)
  const page = Number(req.query.page) || 1
  const pageSize = Number(req.query.pageSize) || 20

  return ok(res, paginate(list, page, pageSize))
})

router.get('/products/:id', (req, res) => {
  const store = loadStore()
  const id = Number(req.params.id)
  if (!Number.isFinite(id)) {
    return fail(res, 40001, '无效的商品 id')
  }

  const product = (store.products || []).find((item) => item.id === id)
  if (!product || product.status !== 'on_sale') {
    return fail(res, 40401, '商品不存在', 404)
  }

  return ok(res, toProductDetail(product))
})

export default router
