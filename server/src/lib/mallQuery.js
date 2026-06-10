const PUBLIC_PRODUCT_TYPES = new Set([
  'ticket',
  'hotel',
  'annualCard',
  'couponPackage',
  'food',
  'creative',
])

export function isPublicProductType(type) {
  return PUBLIC_PRODUCT_TYPES.has(type)
}

export function toProductListItem(product) {
  return {
    id: product.id,
    type: product.type,
    title: product.title,
    subtitle: product.subtitle,
    price: product.price,
    originPrice: product.originPrice,
    coverUrl: product.coverUrl,
    tags: product.tags || [],
    stock: product.stock,
  }
}

export function toProductDetail(product) {
  return {
    ...toProductListItem(product),
    coverImages: product.coverImages?.length ? product.coverImages : [product.coverUrl],
    description: product.description || `${product.title}，${product.subtitle}。`,
    notice: product.notice || '请以景区现场公告为准。',
    specs: product.specs?.length
      ? product.specs
      : [{ id: 0, name: '默认规格', price: product.price }],
  }
}

export const PRODUCT_STATUSES = new Set(['on_sale', 'off_sale'])

export function filterAdminProducts(products, query = {}) {
  let list = [...(products || [])]

  const type = query.type ? String(query.type) : ''
  if (type) {
    if (!isPublicProductType(type)) return { error: '无效的商品类型' }
    list = list.filter((item) => item.type === type)
  }

  const status = query.status ? String(query.status) : ''
  if (status) {
    if (!PRODUCT_STATUSES.has(status)) return { error: '无效的 status' }
    list = list.filter((item) => item.status === status)
  }

  const keyword = query.keyword ? String(query.keyword).trim().toLowerCase() : ''
  if (keyword) {
    list = list.filter((item) => {
      const haystack = [item.title, item.subtitle, ...(item.tags || [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(keyword)
    })
  }

  return { list }
}

export function filterPublicProducts(products, query = {}) {
  let list = (products || []).filter((item) => item.status === 'on_sale')

  const type = query.type ? String(query.type) : ''
  if (type) {
    list = list.filter((item) => item.type === type)
  }

  const keyword = query.keyword ? String(query.keyword).trim().toLowerCase() : ''
  if (keyword) {
    list = list.filter((item) => {
      const haystack = [
        item.title,
        item.subtitle,
        ...(item.tags || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(keyword)
    })
  }

  return list.map(toProductListItem)
}
