import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const staticDir = join(__dirname, '..', 'src', 'static', 'live2d')

const AVAILABLE_MODELS = {
  haru: {
    name: 'Haru',
    description: 'Live2D 示例模型',
    npmPackage: 'live2d-widget-model-haru',
    version: '1.0.5',
    modelFile: 'haru.model.json',
  },
  hijiki: {
    name: 'Hijiki',
    description: 'Live2D 示例模型',
    npmPackage: 'live2d-widget-model-hijiki',
    version: '1.0.5',
    modelFile: 'hijiki.model.json',
  },
  tororo: {
    name: 'Tororo',
    description: 'Live2D 示例模型',
    npmPackage: 'live2d-widget-model-tororo',
    version: '1.0.5',
    modelFile: 'tororo.model.json',
  },
}

function run(command, options = {}) {
  return execSync(command, {
    stdio: 'pipe',
    encoding: 'utf-8',
    ...options,
  })
}

function downloadModel(modelKey) {
  const model = AVAILABLE_MODELS[modelKey]
  const modelDir = join(staticDir, modelKey)

  if (existsSync(modelDir)) {
    console.log(`模型 ${model.name} 已存在，跳过下载: ${modelDir}`)
    return true
  }

  console.log(`下载模型 ${model.name}...`)
  try {
    const tempDir = join(__dirname, '..', 'node_modules', '.temp-live2d')
    mkdirSync(tempDir, { recursive: true })

    const packName = `${model.npmPackage}@${model.version}`
    run(`npm pack ${packName} --pack-destination "${tempDir}"`, {
      cwd: join(__dirname, '..'),
    })

    const files = run(`dir "${tempDir}" /b`).trim().split(/\r?\n/)
    const tgzFile = files.find((file) => file.includes(model.npmPackage) && file.endsWith('.tgz'))
    if (!tgzFile) throw new Error('未找到下载的模型包')

    mkdirSync(modelDir, { recursive: true })
    run(`tar -xzf "${join(tempDir, tgzFile.trim())}" -C "${modelDir}" --strip-components=2`)
    run(`del "${join(tempDir, tgzFile.trim())}"`)
    console.log(`模型 ${model.name} 已下载到: ${modelDir}`)
    return true
  } catch (err) {
    console.error(`模型 ${model.name} 下载失败: ${err.message}`)
    console.log(`可手动从 https://unpkg.com/${model.npmPackage}@${model.version}/ 下载并放入 ${modelDir}`)
    return false
  }
}

function updateConfig() {
  const configPath = join(staticDir, 'models.json')
  const config = {
    defaultModel: 'haru',
    localBasePath: '/static/live2d',
    cdnBaseUrl: 'https://unpkg.com',
    models: {},
  }

  for (const [key, model] of Object.entries(AVAILABLE_MODELS)) {
    const localModelFile = join(staticDir, key, model.modelFile)
    config.models[key] = {
      name: model.name,
      description: model.description,
      localUrl: existsSync(localModelFile) ? `/static/live2d/${key}/${model.modelFile}` : null,
      cdnUrl: `https://unpkg.com/${model.npmPackage}@${model.version}/assets/${model.modelFile}`,
      available: existsSync(localModelFile),
    }
  }

  writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8')
  console.log(`模型配置已更新: ${configPath}`)
}

console.log('=== Live2D 模型设置工具 ===')
mkdirSync(staticDir, { recursive: true })

for (const key of Object.keys(AVAILABLE_MODELS)) {
  downloadModel(key)
}

updateConfig()
console.log('Live2D 模型设置完成')
