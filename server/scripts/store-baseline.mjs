#!/usr/bin/env node
/**
 * 运营数据 baseline 发布 / 同步（供 Git 协作）
 *
 *   npm run store:publish   # admin 改完后：导出到 data/baseline 并提交 Git
 *   npm run store:sync      # 队友 pull 后：强制把 baseline 写入 store.json
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  applyBaselineToStore,
  exportBaselineFromStore,
  readBaseline,
} from '../src/lib/baseline.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const STORE_FILE = path.join(__dirname, '../data/store.json')
const BACKUP_DIR = path.join(__dirname, '../data/backups')

function loadStoreFile() {
  if (!fs.existsSync(STORE_FILE)) {
    console.error('[store-baseline] 未找到 data/store.json，请先启动 server 生成或执行 npm run dev')
    process.exit(1)
  }
  return JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'))
}

function saveStoreFile(store) {
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf8')
}

function backupStoreFile(reason) {
  if (!fs.existsSync(STORE_FILE)) return null
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true })
  }
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupFile = path.join(BACKUP_DIR, `store.${reason}.${stamp}.json`)
  fs.copyFileSync(STORE_FILE, backupFile)
  return backupFile
}

const cmd = process.argv[2] || 'help'

if (cmd === 'publish') {
  const store = loadStoreFile()
  const manifest = exportBaselineFromStore(store)
  console.log('[store-baseline] 已导出运营数据到 server/data/baseline/')
  console.log(`  updatedAt: ${manifest.updatedAt}`)
  console.log('  下一步: git add server/data/baseline && git commit && git push')
  process.exit(0)
}

if (cmd === 'sync') {
  const baseline = readBaseline()
  if (!baseline) {
    console.error('[store-baseline] 未找到 data/baseline，请先 git pull 或请队友执行 store:publish')
    process.exit(1)
  }
  const store = loadStoreFile()
  const changed = applyBaselineToStore(store, baseline, { force: true })
  if (!changed) {
    console.log('[store-baseline] 无需更新')
    process.exit(0)
  }
  const backupFile = backupStoreFile('before-baseline-sync')
  saveStoreFile(store)
  console.log(`[store-baseline] 已同步 baseline（${baseline.manifest.updatedAt}）到 store.json`)
  if (backupFile) console.log(`  已备份原 store: ${backupFile}`)
  console.log('  请重启 server（npm run dev）使内存缓存生效')
  process.exit(0)
}

console.log(`用法:
  npm run store:publish   从 store.json 导出运营数据到 data/baseline（提交 Git）
  npm run store:sync      将 data/baseline 强制写入 store.json`)
process.exit(cmd === 'help' ? 0 : 1)
