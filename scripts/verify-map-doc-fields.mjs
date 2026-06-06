/**
 * M2-MAP-01：校验 API v4 §15.4–15.5 字段表与 src/api/map.ts 类型一一对应
 * 运行：npm run verify:map-doc
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

const mapTs = read('src/api/map.ts')
const apiDoc = read('API接口文档v4.md')

const section154 = apiDoc.match(/### 15\.4 地图点位管理[\s\S]*?(?=### 15\.5)/)?.[0] || ''
const section155 = apiDoc.match(/### 15\.5 地图分类管理[\s\S]*?(?=### 15\.6)/)?.[0] || ''
const section150 = apiDoc.match(/### 15\.0[\s\S]*?(?=### 15\.1 管理员登录)/)?.[0] || ''

const errors = []

function assertInSection(section, field, label) {
  const row = new RegExp(`\\|\\s*${field}\\s*\\|`)
  if (!row.test(section)) {
    errors.push(`${label} 缺少字段: ${field}`)
  }
}

const mapCategoryFields = extractTypeFields(mapTs, 'MapCategory')
const mapPointFields = extractTypeFields(mapTs, 'MapPoint')
const mapDetailFields = extractTypeFields(mapTs, 'MapPointDetail').filter(
  (f) => !mapPointFields.includes(f),
)

mapCategoryFields.forEach((f) => assertInSection(section155, f, '§15.5 MapCategory'))
mapPointFields.forEach((f) => assertInSection(section154, f, '§15.4 MapPoint'))
mapDetailFields.forEach((f) => assertInSection(section154, f, '§15.4 MapPointDetail'))

;['open', 'closed', 'busy'].forEach((status) => {
  if (!section154.includes(status)) {
    errors.push(`§15.4 缺少 MapPointStatus 枚举值: ${status}`)
  }
})

if (section150.match(/本期不做.*15\.4/)) {
  errors.push('§15.0 仍将 15.4–15.5 标为「本期不做」，应改为 M2 已纳入')
}
if (!section150.includes('M2 已纳入')) {
  errors.push('§15.0 缺少 M2 已纳入 说明')
}

if (errors.length) {
  console.error('[map-doc-fields] FAILED')
  errors.forEach((e) => console.error(`  ✗ ${e}`))
  process.exit(1)
}

console.log('[map-doc-fields] PASSED')
console.log(`  ✓ MapCategory (${mapCategoryFields.join(', ')})`)
console.log(`  ✓ MapPoint (${mapPointFields.join(', ')})`)
console.log(`  ✓ MapPointDetail 增强 (${mapDetailFields.join(', ')})`)
console.log('  ✓ MapPointStatus: open | closed | busy')
console.log('  ✓ §15.0 M2 已纳入 15.4–15.5')
