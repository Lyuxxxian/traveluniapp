/**
 * 地图 8a 静态回归自检（不依赖小程序运行时）
 * 运行：npm run verify:map
 */
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

function read(rel) {
  return readFileSync(join(root, rel), 'utf8')
}

const errors = []
const warnings = []

const FROZEN_CATEGORIES = ['spot', 'food', 'toilet', 'parking', 'service']
const LIFE_CIRCLE = ['service', 'toilet', 'parking', 'drinking', 'nursery', 'medical']

const mapData = read('src/api/mapData.ts')
const mapTs = read('src/api/map.ts')
const mapVue = read('src/pages/map/map.vue')
const apiTs = read('src/config/api.ts')
const navTs = read('src/utils/navigation.ts')

// --- 冻结分类存在 ---
FROZEN_CATEGORIES.forEach((key) => {
  if (!mapData.includes(`key: '${key}'`)) {
    errors.push(`缺少冻结分类: ${key}`)
  }
})

// --- 分类数量（原 5 类 + 新增）---
const categoryKeys = [...mapData.matchAll(/key: '([a-z]+)'/g)].map((m) => m[1])
const uniqueCategories = [...new Set(categoryKeys)]
if (uniqueCategories.length < 10) {
  errors.push(`分类数量过少: ${uniqueCategories.length}`)
}

// --- 从 mapData 推算点位 id（seeds 运行时 id = idStart + index）---
const idSet = new Set()
let totalPoints = 0

function addIdsFromSeed(startId, count) {
  for (let i = 0; i < count; i += 1) {
    const id = startId + i
    if (idSet.has(id)) errors.push(`重复点位 id: ${id}`)
    idSet.add(id)
  }
  totalPoints += count
}

;[...mapData.matchAll(/seeds\([^,]+,\s*(\d+),\s*\[([\s\S]*?)\]\s*(?:,|\))/g)].forEach((m) => {
  const start = Number(m[1])
  const titles = (m[2].match(/'([^']+)'/g) || []).length
  addIdsFromSeed(start, titles)
})

;[...mapData.matchAll(/seeds\([^,]+,\s*(\d+),\s*numberedTitles\([^,]+,\s*(\d+)\)/g)].forEach((m) => {
  addIdsFromSeed(Number(m[1]), Number(m[2]))
})

if (totalPoints < 100) {
  errors.push(`点位总数过少: ${totalPoints}`)
}

const countInRange = (min, max) => [...idSet].filter((id) => id >= min && id <= max).length
const frozenRanges = {
  spot: [101, 199],
  food: [201, 299],
  toilet: [301, 399],
  parking: [401, 499],
  service: [501, 599],
}
Object.entries(frozenRanges).forEach(([cat, [min, max]]) => {
  if (countInRange(min, max) === 0) errors.push(`冻结分类 ${cat} 无点位 (id ${min}-${max})`)
})

// --- 路线 pointIds 均可解析 ---
const routeBlocks = mapData.match(/export const MAP_ROUTES = \[[\s\S]*?\n\]/)?.[0] || ''
const routePointIds = [...routeBlocks.matchAll(/pointIds: \[([^\]]+)\]/g)].flatMap((m) =>
  m[1].split(',').map((s) => Number(s.trim())),
)
routePointIds.forEach((id) => {
  if (!idSet.has(id)) errors.push(`路线引用了不存在的点位 id: ${id}`)
})

// --- API 路径 ---
;['categories', 'points', 'routes'].forEach((key) => {
  if (!apiTs.includes(`/api/map/${key === 'points' ? 'points' : key}`)) {
    errors.push(`API_PATHS.map 缺少 ${key}`)
  }
})

// --- 页面接入 ---
;[
  'fetchMapCategories',
  'fetchMapPoints',
  'fetchMapPointDetail',
  'fetchMapRoutes',
  'fallbackMapCategories',
  'fallbackMapPoints',
  'uni.openLocation',
  'ensureMapFallbackState',
  'bootstrapMapPage',
  'pageReady',
].forEach((token) => {
  if (!mapVue.includes(token)) errors.push(`map.vue 缺少: ${token}`)
})

if (!navTs.includes("uni.navigateTo") || !navTs.includes('/pages/map/map')) {
  errors.push('navigation.ts 未使用 navigateTo 进入地图')
}

if (!mapTs.includes('VITE_MAP_SIMULATE_API_ERROR')) {
  warnings.push('未配置 VITE_MAP_SIMULATE_API_ERROR 模拟失败开关')
}

// --- 生活圈分类在数据中有体现 ---
LIFE_CIRCLE.forEach((key) => {
  if (!mapData.includes(`key: '${key}'`) && key !== 'service') {
    warnings.push(`生活圈分类 ${key} 未在 MAP_CATEGORIES 登记`)
  }
})

if (errors.length) {
  console.error('[map-regression] FAILED')
  errors.forEach((e) => console.error(`  ✗ ${e}`))
  if (warnings.length) warnings.forEach((w) => console.warn(`  ! ${w}`))
  process.exit(1)
}

console.log('[map-regression] PASSED (8a 静态项)')
console.log(`  ✓ 冻结分类: ${FROZEN_CATEGORIES.join(', ')}`)
console.log(`  ✓ 全部分类: ${uniqueCategories.length} 个`)
console.log(`  ✓ 点位: ${totalPoints} 个，id 无重复`)
console.log(`  ✓ 路线点位引用: ${routePointIds.length} 处`)
if (warnings.length) {
  console.log('  提示:')
  warnings.forEach((w) => console.log(`    ! ${w}`))
}
console.log('')
console.log('手动回归（小程序）建议逐项勾选:')
console.log('  1. 切换 toilet / parking / service / spot 等分类，marker 正常')
console.log('  2. 点击 marker → 详情卡 → 导航')
console.log('  3. 从首页/搜索带 keyword、pointId 进地图')
console.log('  4. 设置 VITE_MAP_SIMULATE_API_ERROR=true 后仍不白屏')
console.log('  5. 从子页进入地图后返回栈正常')
