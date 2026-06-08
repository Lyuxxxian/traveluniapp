type ModelKey = 'haru' | 'hijiki' | 'tororo'

type Live2DModelConfig = {
  name: string
  modelFile: string
  packageName: string
  version: string
}

const MODEL_CONFIG: {
  defaultModel: ModelKey
  localBasePath: string
  cdnBaseUrl: string
  models: Record<ModelKey, Live2DModelConfig>
} = {
  defaultModel: 'haru',
  localBasePath: '/static/live2d',
  cdnBaseUrl: 'https://unpkg.com',
  models: {
    haru: {
      name: 'Haru',
      modelFile: 'haru.model.json',
      packageName: 'live2d-widget-model-haru',
      version: '1.0.5',
    },
    hijiki: {
      name: 'Hijiki',
      modelFile: 'hijiki.model.json',
      packageName: 'live2d-widget-model-hijiki',
      version: '1.0.5',
    },
    tororo: {
      name: 'Tororo',
      modelFile: 'tororo.model.json',
      packageName: 'live2d-widget-model-tororo',
      version: '1.0.5',
    },
  },
}

function getModel(modelKey?: string) {
  const key = (modelKey || MODEL_CONFIG.defaultModel) as ModelKey
  return MODEL_CONFIG.models[key] ? { key, model: MODEL_CONFIG.models[key] } : {
    key: MODEL_CONFIG.defaultModel,
    model: MODEL_CONFIG.models[MODEL_CONFIG.defaultModel],
  }
}

export function getModelUrl(modelKey?: string) {
  const { model } = getModel(modelKey)
  return `${MODEL_CONFIG.cdnBaseUrl}/${model.packageName}@${model.version}/assets/${model.modelFile}`
}

export function getLocalModelUrl(modelKey?: string) {
  const { key, model } = getModel(modelKey)
  return `${MODEL_CONFIG.localBasePath}/${key}/${model.modelFile}`
}

export function getCdnFallbackUrl(modelKey?: string) {
  return getModelUrl(modelKey)
}

export function getAvailableModels() {
  return Object.entries(MODEL_CONFIG.models).map(([key, model]) => ({
    key,
    name: model.name,
    localUrl: `${MODEL_CONFIG.localBasePath}/${key}/${model.modelFile}`,
    cdnUrl: `${MODEL_CONFIG.cdnBaseUrl}/${model.packageName}@${model.version}/assets/${model.modelFile}`,
  }))
}

export { MODEL_CONFIG }
