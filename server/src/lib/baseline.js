import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASELINE_DIR = path.join(__dirname, '../../data/baseline')
const MANIFEST_FILE = path.join(BASELINE_DIR, 'manifest.json')
const CONTENT_FILE = path.join(BASELINE_DIR, 'content.json')

/** 经 Git 同步的运营数据字段（不含账号、订单、用户行为等本地数据） */
export const BASELINE_KEYS = [
  'mapPoints',
  'mapCategories',
  'mapPointDetails',
  'mapRoutes',
  'products',
  'homeConfig',
  'discoverPosts',
  'faqs',
  'questionnaires',
  'serviceConfig',
  'couponPackages',
]

/** 同步 baseline 时 counters 取较大值，避免新 ID 冲突 */
export const BASELINE_COUNTER_KEYS = [
  'mapPoint',
  'product',
  'faq',
  'questionnaire',
  'discoverPost',
]

function ensureBaselineDir() {
  if (!fs.existsSync(BASELINE_DIR)) {
    fs.mkdirSync(BASELINE_DIR, { recursive: true })
  }
}

export function readBaseline() {
  if (!fs.existsSync(MANIFEST_FILE) || !fs.existsSync(CONTENT_FILE)) {
    return null
  }
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8'))
  const content = JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf8'))
  return { manifest, content }
}

function mergeCounters(store, baselineCounters = {}) {
  store.counters = store.counters || {}
  for (const key of BASELINE_COUNTER_KEYS) {
    const current = Number(store.counters[key] || 0)
    const incoming = Number(baselineCounters[key] || 0)
    if (incoming > current) {
      store.counters[key] = incoming
    }
  }
}

export function applyBaselineToStore(store, baseline, { force = false } = {}) {
  if (!baseline?.content || !baseline?.manifest) return false

  const appliedAt = store._meta?.baselineAppliedAt || ''
  if (!force && baseline.manifest.updatedAt <= appliedAt) {
    return false
  }

  for (const key of BASELINE_KEYS) {
    if (baseline.content[key] !== undefined) {
      store[key] = structuredClone(baseline.content[key])
    }
  }
  mergeCounters(store, baseline.content.counters)
  store._meta = {
    ...(store._meta || {}),
    baselineAppliedAt: baseline.manifest.updatedAt,
    baselineVersion: baseline.manifest.version ?? 1,
  }
  return true
}

export function exportBaselineFromStore(store) {
  ensureBaselineDir()
  const content = {}
  for (const key of BASELINE_KEYS) {
    if (store[key] !== undefined) {
      content[key] = structuredClone(store[key])
    }
  }
  content.counters = {}
  for (const key of BASELINE_COUNTER_KEYS) {
    if (store.counters?.[key] !== undefined) {
      content.counters[key] = store.counters[key]
    }
  }

  const manifest = {
    version: 1,
    updatedAt: new Date().toISOString(),
    keys: BASELINE_KEYS,
  }

  fs.writeFileSync(CONTENT_FILE, JSON.stringify(content, null, 2), 'utf8')
  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2), 'utf8')
  return manifest
}
