/**
 * M2-MAP-05：导入模板 10 条预检（不写 store）
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadStore } from '../src/lib/store.js'
import { parseImportPayload, planMapPointImport } from '../src/lib/mapImport.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const templatePath = path.join(__dirname, '../data/templates/map-points-import.example.json')

const errors = []
function assert(name, cond, detail = '') {
  if (!cond) errors.push(`${name}${detail ? `: ${detail}` : ''}`)
}

const store = loadStore()
const payload = JSON.parse(fs.readFileSync(templatePath, 'utf8'))
const rows = parseImportPayload(payload)

assert('template rows', rows.length === 10, `count=${rows.length}`)

let next = Math.max(10001, ...(store.mapPoints || []).map((p) => p.id), store.counters?.mapPoint || 0)
const { planned, errors: planErrors, createCount } = planMapPointImport(store, rows, {
  assignId: () => {
    next += 1
    return next
  },
})

assert('plan no errors', planErrors.length === 0, planErrors.join('; '))
assert('plan all create', createCount === 10, `create=${createCount}`)
const ids = planned.map((p) => p.point.id)
assert('ids unique in batch', new Set(ids).size === ids.length)
assert('ids not in store', ids.every((id) => !(store.mapPoints || []).some((p) => p.id === id)))

if (errors.length) {
  console.error('[map-import-verify] FAILED')
  errors.forEach((e) => console.error(`  ✗ ${e}`))
  process.exit(1)
}

console.log('[map-import-verify] PASSED')
console.log('  ✓ 模板 10 条可预检通过')
console.log(`  ✓ 模拟分配 id 无重复: ${ids[0]} … ${ids[ids.length - 1]}`)
