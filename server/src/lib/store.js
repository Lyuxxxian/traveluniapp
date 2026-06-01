import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { seedData } from '../data/seed.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, '../../data')
const STORE_FILE = path.join(DATA_DIR, 'store.json')

let cache = null

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

function mergeDefaults(store) {
  let changed = false
  for (const key of Object.keys(seedData)) {
    if (store[key] === undefined) {
      store[key] = structuredClone(seedData[key])
      changed = true
    }
  }
  if (!store.counters) store.counters = structuredClone(seedData.counters)
  for (const [k, v] of Object.entries(seedData.counters)) {
    if (store.counters[k] === undefined) {
      store.counters[k] = v
      changed = true
    }
  }
  if (changed) saveStore()
  return store
}

export function loadStore() {
  if (cache) return cache
  ensureDir()
  if (!fs.existsSync(STORE_FILE)) {
    cache = structuredClone(seedData)
    saveStore()
    return cache
  }
  cache = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'))
  mergeDefaults(cache)
  return cache
}

export function saveStore() {
  ensureDir()
  fs.writeFileSync(STORE_FILE, JSON.stringify(cache, null, 2), 'utf8')
}

export function nextId(key) {
  const store = loadStore()
  store.counters[key] = (store.counters[key] || 0) + 1
  saveStore()
  return store.counters[key]
}

const TARGET_TITLES = {
  spot: { 101: '灵山大佛', 103: '九龙灌浴', 104: '灵山梵宫' },
}

export function resolveTargetTitle(targetType, targetId) {
  if (targetType === 'spot' && TARGET_TITLES.spot[targetId]) {
    return TARGET_TITLES.spot[targetId]
  }
  return `${targetType} #${targetId}`
}
