<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import * as PIXI from 'pixi.js'
import { Live2DModel } from 'pixi-live2d-display/cubism4'

;(window as any).PIXI = PIXI

const props = defineProps<{
  modelUrl?: string
  width?: number
  height?: number
  status?: string
}>()

const containerRef = ref<HTMLDivElement | null>(null)
const loading = ref(true)
const error = ref(false)

let app: any = null
let model: any = null
let mouthTimer: ReturnType<typeof setTimeout> | null = null
let statusTimer: ReturnType<typeof setInterval> | null = null

const defaultUrl = '/static/tianqing/tianqing.model3.json'

function clearMouth() {
  if (mouthTimer) {
    clearTimeout(mouthTimer)
    mouthTimer = null
  }
  if (model) {
    try {
      model.internalModel.coreModel.setParameterValueById('ParamMouthOpenY', 0)
    } catch {}
  }
}

function startMouthAnimation() {
  clearMouth()
  function tick() {
    if (!model) return
    try {
      const value = Math.random() * 0.8 + 0.1
      model.internalModel.coreModel.setParameterValueById('ParamMouthOpenY', value)
    } catch {}
    const delay = Math.random() < 0.03 ? 150 : 250
    mouthTimer = setTimeout(tick, delay)
  }
  tick()
}

function clearStatusTimer() {
  if (statusTimer) {
    clearInterval(statusTimer)
    statusTimer = null
  }
}

function playMotion(groupName: string) {
  if (!model) return
  try {
    if (typeof model.motion === 'function') model.motion(groupName)
  } catch {}
}

function applyStatus(status: string) {
  clearStatusTimer()
  clearMouth()
  if (!model) return

  if (status === 'thinking') {
    statusTimer = setInterval(() => playMotion('tap'), 5000)
  }
  if (status === 'speaking') {
    playMotion('tap')
    statusTimer = setInterval(() => playMotion('tap'), 2600)
    startMouthAnimation()
  }
}

watch(() => props.status, (s) => { if (s) applyStatus(s) })

onMounted(async () => {
  await nextTick()
  const container = containerRef.value
  if (!container) return

  const width = container.offsetWidth || (props.width ?? 280)
  const height = container.offsetHeight || (props.height ?? 380)

  try {
    app = new PIXI.Application({
      width,
      height,
      autoStart: true,
      backgroundAlpha: 0,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
    })
    app.view.style.width = '100%'
    app.view.style.height = '100%'
    container.appendChild(app.view)

    const url = props.modelUrl || defaultUrl
    model = await Live2DModel.from(url)

    const fitScale = Math.min(width / model.width, height / model.height) * 2.0
    model.scale.set(fitScale)
    model.x = (width - model.width) / 2
    model.y = (height - model.height * 0.5) / 2

    app.stage.addChild(model)

    // 去水印
    try {
      model.internalModel.coreModel.setParameterValueById('Param75', 1)
    } catch {}

    loading.value = false
  } catch (err) {
    console.warn('[Live2D] 加载失败:', err)
    error.value = true
    loading.value = false
  }
})

onUnmounted(() => {
  clearStatusTimer()
  clearMouth()
  model?.destroy()
  app?.destroy(true, { children: true })
})
</script>

<template>
  <div class="live2d-viewer" :style="{ width: (props.width ?? 280) + 'px', height: (props.height ?? 380) + 'px' }">
    <div ref="containerRef" class="live2d-canvas"></div>
    <div v-if="loading" class="live2d-loading">
      <div class="loading-ring"></div>
      <span>加载中...</span>
    </div>
    <div v-if="error && !loading" class="live2d-error">
      <span>模型加载失败</span>
    </div>
  </div>
</template>

<style scoped>
.live2d-viewer {
  position: relative;
  overflow: visible;
  border-radius: 16px;
  background: linear-gradient(180deg, #fff7df, #d5a866);
  box-shadow: 0 8px 24px rgba(111, 74, 29, 0.15);
  flex-shrink: 0;
}

.live2d-canvas {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.live2d-canvas :deep(canvas) {
  display: block;
}

.live2d-loading,
.live2d-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #8a6a3d;
}

.loading-ring {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(141, 100, 49, 0.2);
  border-top-color: #8a5a2b;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
