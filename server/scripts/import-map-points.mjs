/**
 * 从 JSON 批量导入 store.mapPoints / mapPointDetails
 *
 * 用法：
 *   cd server
 *   node scripts/import-map-points.mjs --dry-run data/templates/map-points-import.example.json
 *   node scripts/import-map-points.mjs data/my-points.json
 *   node scripts/import-map-points.mjs --update data/my-points.json   # 按 id 覆盖已有点位
 *
 * 说明见 docs/MAP_DATA_INGEST.md
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadStore, saveStore, nextId } from '../src/lib/store.js'
import { setMapPointDetailExtras } from '../src/lib/mapStore.js'
import { parseImportPayload, planMapPointImport } from '../src/lib/mapImport.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const serverRoot = path.join(__dirname, '..')

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const update = args.includes('--update')
const fileArg = args.find((a) => !a.startsWith('--'))

if (!fileArg) {
  console.error('用法: node scripts/import-map-points.mjs [--dry-run] [--update] <file.json>')
  process.exit(1)
}

const filePath = path.isAbsolute(fileArg) ? fileArg : path.join(serverRoot, fileArg)
if (!fs.existsSync(filePath)) {
  console.error(`文件不存在: ${filePath}`)
  process.exit(1)
}

let payload
try {
  payload = JSON.parse(fs.readFileSync(filePath, 'utf8'))
} catch (err) {
  console.error(`JSON 解析失败: ${err.message}`)
  process.exit(1)
}

let rows
try {
  rows = parseImportPayload(payload)
} catch (err) {
  console.error(err.message)
  process.exit(1)
}

if (!rows.length) {
  console.error('points 为空，无数据可导入')
  process.exit(1)
}

const store = loadStore()
let simCounter = Math.max(
  store.counters?.mapPoint || 0,
  ...(store.mapPoints || []).map((p) => p.id),
  0,
)
const assignId = dryRun
  ? () => {
      simCounter += 1
      return simCounter
    }
  : () => nextId('mapPoint')

const { planned, errors, createCount } = planMapPointImport(store, rows, {
  update,
  assignId,
})

if (errors.length) {
  console.error('[map-import] 校验失败')
  errors.forEach((e) => console.error(`  ✗ ${e}`))
  process.exit(1)
}

if (dryRun) {
  console.log('[map-import] DRY-RUN 通过')
  console.log(`  文件: ${filePath}`)
  console.log(`  待新增: ${createCount} 条`)
  console.log(`  待更新: ${planned.length - createCount} 条`)
  const ids = planned.map((p) => p.point.id)
  console.log(`  分配 id: ${ids.join(', ')}`)
  console.log(`  id 唯一: ${new Set(ids).size === ids.length ? '是' : '否'}`)
  process.exit(0)
}

store.mapPoints = store.mapPoints || []
for (const item of planned) {
  const idx = store.mapPoints.findIndex((p) => p.id === item.point.id)
  if (item.mode === 'update' && idx >= 0) {
    store.mapPoints[idx] = item.point
  } else {
    store.mapPoints.push(item.point)
  }
  setMapPointDetailExtras(store, item.point.id, item.detail)
}

saveStore()

console.log('[map-import] 导入完成')
console.log(`  文件: ${filePath}`)
console.log(`  新增: ${createCount} 条`)
console.log(`  更新: ${planned.length - createCount} 条`)
console.log(`  store.mapPoints 总数: ${store.mapPoints.length}`)
console.log('  验证: npm run verify:map')
