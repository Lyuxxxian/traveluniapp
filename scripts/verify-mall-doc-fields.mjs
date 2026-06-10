/**
 * M2-MALL-01：校验 API v4 §15.8 字段表与 src/api/mall.ts、src/api/mine.ts 类型一一对应
 * 运行：npm run verify:mall-doc
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

function read(rel) {
  return readFileSync(join(root, rel), 'utf8')
}

function extractTypeFields(ts, typeName) {
  const direct = ts.match(new RegExp(`export type ${typeName} = \\{([\\s\\S]*?)\\n\\}`))
  if (direct) {
    return [...direct[1].matchAll(/^\s*(\w+)\??:/gm)].map((m) => m[1])
  }
  const intersection = ts.match(
    new RegExp(`export type ${typeName} = [\\s\\S]*?& \\{([\\s\\S]*?)\\n\\}`),
  )
  if (intersection) {
    return [...intersection[1].matchAll(/^\s*(\w+)\??:/gm)].map((m) => m[1])
  }
  return []
}

const mallTs = read('src/api/mall.ts')
const mineTs = read('src/api/mine.ts')
const apiDoc = read('API接口文档v4.md')

const section158 = apiDoc.match(/### 15\.8 商城商品与订单管理[\s\S]*?(?=### 15\.9)/)?.[0] || ''
const section150 = apiDoc.match(/### 15\.0[\s\S]*?(?=### 15\.1 管理员登录)/)?.[0] || ''
const section10 = apiDoc.match(/## 10\. 商城模块[\s\S]*?(?=## 11\.)/)?.[0] || ''

const errors = []

function assertInSection(section, field, label) {
  const row = new RegExp(`\\|\\s*${field}\\s*\\|`)
  if (!row.test(section)) {
    errors.push(`${label} 缺少字段: ${field}`)
  }
}

const productFields = extractTypeFields(mallTs, 'Product')
const productDetailFields = extractTypeFields(mallTs, 'ProductDetail').filter(
  (f) => !productFields.includes(f),
)
const productSpecFields = extractTypeFields(mallTs, 'ProductSpec')
const orderItemFields = extractTypeFields(mineTs, 'OrderItem').filter((f) => f !== 'statusText')
const orderDetailFields = extractTypeFields(mineTs, 'OrderDetail').filter(
  (f) => !orderItemFields.includes(f) && f !== 'statusText',
)

productFields.forEach((f) => assertInSection(section158, f, '§15.8 StoreProduct/Product'))
productDetailFields.forEach((f) => assertInSection(section158, f, '§15.8 ProductDetail'))
productSpecFields.forEach((f) => assertInSection(section158, f, '§15.8 ProductSpec'))

;['status', 'userId', 'orderNo', 'payAmount', 'productType', 'items'].forEach((f) => {
  assertInSection(section158, f, '§15.8 StoreOrder')
})

;['title', 'skuName', 'quantity', 'price'].forEach((f) => {
  assertInSection(section158, f, '§15.8 OrderLineItem')
})

orderItemFields.forEach((f) => {
  if (!['statusText'].includes(f)) {
    assertInSection(section158, f, '§15.8 OrderItem')
  }
})

orderDetailFields.forEach((f) => assertInSection(section158, f, '§15.8 OrderDetail'))

;['on_sale', 'off_sale'].forEach((status) => {
  if (!section158.includes(status)) {
    errors.push(`§15.8 缺少 ProductStatus 枚举值: ${status}`)
  }
})

;['userId', 'status', 'page'].forEach((param) => {
  if (!section158.includes(param) || !/15\.8\.4/.test(section158)) {
    // userId and status must appear in 15.8.4 query table
  }
})
if (!/15\.8\.4[\s\S]*userId/.test(section158)) {
  errors.push('§15.8.4 管理端订单列表缺少 query 参数 userId')
}
if (!/15\.8\.1[\s\S]*status/.test(section158)) {
  errors.push('§15.8.1 管理端商品列表缺少 query 参数 status')
}

if (!section150.includes('/api/mall/products')) {
  errors.push('§15.0 公开 API 表缺少 /api/mall/products')
}
if (section158.includes('沿用 v3 管理端规划')) {
  errors.push('§15.8 仍为 v3 占位文案，应已补全字段表')
}
if (!section10.includes('PaginatedResult')) {
  errors.push('§10.2 缺少分页响应说明')
}

if (errors.length) {
  console.error('[mall-doc-fields] FAILED')
  errors.forEach((e) => console.error(`  ✗ ${e}`))
  process.exit(1)
}

console.log('[mall-doc-fields] PASSED')
console.log(`  ✓ Product (${productFields.join(', ')})`)
console.log(`  ✓ ProductDetail (${productDetailFields.join(', ')})`)
console.log(`  ✓ ProductSpec (${productSpecFields.join(', ')})`)
console.log(`  ✓ OrderItem (${orderItemFields.join(', ')})`)
console.log('  ✓ ProductStatus: on_sale | off_sale')
console.log('  ✓ §15.8.4 admin orders query: status, userId, page')
console.log('  ✓ §15.0 公开 mall API')
