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

if (!mapTs.includes('VITE_MAP_USE_REMOTE_API')) {
  errors.push('map.ts 缺少 VITE_MAP_USE_REMOTE_API 远程联调开关')
}
if (!mapTs.includes('isMapRemoteApiEnabled')) {
  errors.push('map.ts 缺少 isMapRemoteApiEnabled 导出')
}
if (!mapTs.includes('fetchRemoteOrFallback')) {
  errors.push('map.ts 缺少远程失败回退逻辑 fetchRemoteOrFallback')
}

// --- 8b：分类横向滚动、marker 上限、跳转 keyword ---
;['category-scroll', 'scroll-into-view', 'markerDisplayPoints', 'MAX_MAP_MARKERS', 'markersTruncated'].forEach(
  (token) => {
    if (!mapVue.includes(token)) errors.push(`map.vue 8b 缺少: ${token}`)
  },
)

/** 与 map.vue / fetchMapPoints 一致：在 title/desc/tags/address 中子串匹配 */
function collectSearchableTexts(data) {
  const texts = []
  ;[...data.matchAll(/seeds\([^,]+,\s*\d+,\s*\[([\s\S]*?)\]/g)].forEach((m) => {
    ;[...m[1].matchAll(/'([^']+)'/g)].forEach((t) => texts.push(t[1]))
  })
  ;[...data.matchAll(/numberedTitles\('([^']+)',\s*(\d+)\)/g)].forEach((m) => {
    const prefix = m[1]
    const count = Number(m[2])
    texts.push(prefix)
    for (let i = 1; i <= count; i += 1) texts.push(`${prefix}${i}`)
  })
  ;[...data.matchAll(/title:\s*'([^']+)'/g)].forEach((m) => texts.push(m[1]))
  ;[...data.matchAll(/desc:\s*'([^']+)'/g)].forEach((m) => texts.push(m[1]))
  return texts
}

function keywordHitsMock(kw, texts) {
  const k = kw.trim().toLowerCase()
  if (!k) return true
  return texts.some((text) => String(text).toLowerCase().includes(k))
}

const searchableTexts = collectSearchableTexts(mapData)
const NAV_KEYWORDS = ['灵山大佛', '九龙灌浴', '灵山梵宫', '历史文化深度游', '亲子家庭轻松游']
const NAV_KEYWORD_WARN_ONLY = ['梵宫素斋', '集章']

NAV_KEYWORDS.forEach((kw) => {
  if (!keywordHitsMock(kw, searchableTexts)) errors.push(`跳转 keyword 在 mapData 无匹配: ${kw}`)
})
NAV_KEYWORD_WARN_ONLY.forEach((kw) => {
  if (!keywordHitsMock(kw, searchableTexts)) {
    warnings.push(`跳转 keyword 暂无 mock 点位（2.6 可补）: ${kw}`)
  }
})

;[101, 103].forEach((id) => {
  if (!idSet.has(id)) errors.push(`跳转 pointId 不存在: ${id}`)
})

function extractMapKeywords(fileContent) {
  return [...fileContent.matchAll(/target:\s*\{[^}]*type:\s*'map'[^}]*keyword:\s*'([^']+)'/g)].map(
    (m) => m[1],
  )
}

const uniqueMapTargets = [
  ...new Set(
    ['home.ts', 'discover.ts', 'search.ts'].flatMap((f) => extractMapKeywords(read(`src/api/${f}`))),
  ),
]

uniqueMapTargets.forEach((kw) => {
  if (NAV_KEYWORD_WARN_ONLY.includes(kw)) {
    if (!keywordHitsMock(kw, searchableTexts)) {
      warnings.push(`首页/发现/搜索地图 keyword 待数据补全: ${kw}`)
    }
    return
  }
  if (!keywordHitsMock(kw, searchableTexts)) {
    errors.push(`首页/发现/搜索地图跳转 keyword 无 mock 匹配: ${kw}`)
  }
})

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

console.log('[map-regression] PASSED (8a + 8b 静态项)')
console.log(`  ✓ 冻结分类: ${FROZEN_CATEGORIES.join(', ')}`)
console.log(`  ✓ 全部分类: ${uniqueCategories.length} 个`)
console.log(`  ✓ 点位: ${totalPoints} 个，id 无重复`)
console.log(`  ✓ 路线点位引用: ${routePointIds.length} 处`)
console.log(`  ✓ 远程 API 开关与 fallback 逻辑已接入`)
console.log(`  ✓ 8b：分类 scroll-view、marker 上限、跳转 keyword ${uniqueMapTargets.length} 处`)
if (warnings.length) {
  console.log('  提示:')
  warnings.forEach((w) => console.log(`    ! ${w}`))
}
console.log('')
console.log('手动回归（小程序）建议逐项勾选:')
console.log('  1. 18 类分类横向滑动，选中项 scroll-into-view 可见')
console.log('  2. facility 等大类 marker 截断提示（≤80）')
console.log('  3. 点击 marker → 详情卡 → 导航')
console.log('  4. 从首页/发现/搜索带 keyword、pointId 进地图')
console.log('  5. VITE_MAP_SIMULATE_API_ERROR=true 仍不白屏')
console.log('  6. VITE_MAP_USE_REMOTE_API=true 且后端未就绪时自动 fallback')
console.log('  7. 从子页进入地图后返回栈正常')
