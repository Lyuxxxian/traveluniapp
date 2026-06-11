<template>
  <!-- #ifdef H5 -->
  <view class="live2d-character" :style="containerStyle">
    <view :id="containerId" class="live2d-container"></view>

    <view v-if="loading" class="live2d-loading">
      <view class="loading-ring"></view>
      <text class="loading-text">灵儿加载中...</text>
    </view>

    <view v-if="error && !loading" class="live2d-fallback" :class="fallbackAnimClass" @tap="emit('tap')">
      <image :src="fallbackImg" mode="aspectFit" class="fallback-img" />
      <view v-if="statusText" class="fallback-status">{{ statusText }}</view>
    </view>
  </view>
  <!-- #endif -->
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

// #ifdef H5
import * as PIXI from 'pixi.js'
import { Live2DModel } from 'pixi-live2d-display/cubism4'
window.PIXI = PIXI
// #endif

const props = defineProps({
  modelUrl: {
    type: String,
    default: '/static/tianqing/tianqing.model3.json',
  },
  fallbackUrl: {
    type: String,
    default: '',
  },
  width: {
    type: Number,
    default: 250,
  },
  height: {
    type: Number,
    default: 320,
  },
  status: {
    type: String,
    default: 'idle',
  },
  fallbackImg: {
    type: String,
    default: '/static/ai/floating-guide.png',
  },
  scale: {
    type: Number,
    default: 1,
  },
})

const emit = defineEmits(['loaded', 'error', 'tap'])

const containerId = 'live2d-character-container'
const loading = ref(true)
const error = ref(false)

let app = null
let model = null
let statusTimer = null
let mouthTimer = null

// 表情功能已关闭（当前模型无表情数据）
// const expressions = ['smile', 'squint', 'tears', 'teardrop']
// let expressionTimer = null

const containerStyle = computed(() => ({
  width: `${props.width}rpx`,
  height: `${props.height}rpx`,
}))

const statusText = computed(() => {
  const labels = {
    idle: '在线待命',
    listening: '正在聆听',
    thinking: '思考中...',
    speaking: '正在讲解',
  }
  return labels[props.status] || ''
})

const fallbackAnimClass = computed(() => `fallback-${props.status}`)

function bindInteraction(m) {
  m.buttonMode = true

  let startX = 0
  let startY = 0
  let isDragging = false

  m.on('pointerdown', (e) => {
    isDragging = false
    startX = e.data.global.x
    startY = e.data.global.y
    m.dragging = true
    m._pointerX = e.data.global.x - m.x
    m._pointerY = e.data.global.y - m.y
  })

  m.on('pointermove', (e) => {
    if (m.dragging) {
      const dx = e.data.global.x - startX
      const dy = e.data.global.y - startY
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        isDragging = false
      }
      m.position.x = e.data.global.x - m._pointerX
      m.position.y = e.data.global.y - m._pointerY
    }
  })

  m.on('pointerup', () => {
    m.dragging = false
    emit('tap')
  })

  m.on('pointerupoutside', () => {
    m.dragging = false
  })
}

// 表情功能已关闭
// function triggerRandomExpression(m) {
//   if (expressionTimer) clearTimeout(expressionTimer)
//   const name = expressions[Math.floor(Math.random() * expressions.length)]
//   m.expression(name)
//   expressionTimer = setTimeout(() => {
//     m.expression()
//   }, 2000)
// }

function initApp() {
  const container = document.getElementById(containerId)
  if (!container) return

  const width = container.offsetWidth
  const height = container.offsetHeight

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
}

async function loadModel() {
  const container = document.getElementById(containerId)
  if (!container || !app) return

  const width = container.offsetWidth
  const height = container.offsetHeight

  if (model) {
    app.stage.removeChild(model)
    model.destroy()
    model = null
  }

  const urls = [props.modelUrl]
  if (props.fallbackUrl && props.fallbackUrl !== props.modelUrl) {
    urls.push(props.fallbackUrl)
  }

  let lastError = null
  for (const url of urls) {
    try {
      model = await Live2DModel.from(url)
      break
    } catch (err) {
      lastError = err
    }
  }

  if (!model) {
    throw lastError || new Error('Live2D 模型加载失败')
  }

  const fitScale = Math.min(width / model.width, height / model.height) * 2.0 * props.scale
  model.scale.set(fitScale)
  model.x = (width - model.width) / 2
  model.y = (height - model.height * 0.5) / 2

  bindInteraction(model)
  app.stage.addChild(model)

  // 去水印
  try {
    model.internalModel.coreModel.setParameterValueById('Param75', 1)
  } catch {}

  loading.value = false
  emit('loaded')
}

function clearStatusTimer() {
  if (statusTimer) {
    clearInterval(statusTimer)
    statusTimer = null
  }
}

function playMotion(groupName, index) {
  if (!model) return
  try {
    if (typeof model.motion === 'function') {
      model.motion(groupName, index)
    }
  } catch {
    // ignore
  }
}

// 表情功能已关闭
// function setExpression(name) {
//   if (!model) return
//   try {
//     if (model.internalModel?.expressionManager) {
//       model.internalModel.expressionManager.setExpression(name)
//     } else if (typeof model.expression === 'function') {
//       model.expression(name)
//     }
//   } catch {
//     // ignore
//   }
// }


function startMouthAnimation() {
  stopMouthAnimation()
  mouthTimer = setInterval(() => {
    if (!model) return
    try {
      const value = Math.random() * 0.8 + 0.2
      model.internalModel.coreModel.setParameterValueById('ParamMouthOpenY', value)
    } catch {}
  }, 250)
}

function stopMouthAnimation() {
  if (mouthTimer) {
    clearInterval(mouthTimer)
    mouthTimer = null
  }
  if (model) {
    try {
      model.internalModel.coreModel.setParameterValueById('ParamMouthOpenY', 0)
    } catch {}
  }
}

function applyStatus(status) {
  clearStatusTimer()
  stopMouthAnimation()
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

watch(() => props.status, applyStatus)

onMounted(async () => {
  try {
    if (typeof window === 'undefined') {
      throw new Error('Live2D 仅在 H5 浏览器环境加载')
    }

    await nextTick()
    initApp()
    await loadModel()
  } catch (err) {
    console.warn('[Live2D] 使用静态形象兜底:', err)
    error.value = true
    loading.value = false
    emit('error', err)
  }
})

onUnmounted(() => {
  clearStatusTimer()
  stopMouthAnimation()
  model?.destroy()
  app?.destroy(true, { children: true })
})

defineExpose({
  playMotion,
  getModel: () => model,
})
</script>

<style scoped>
.live2d-character {
  position: relative;
  overflow: visible;
  border-radius: 36rpx;
  background: linear-gradient(180deg, #fff7df, #d5a866);
  box-shadow: 0 18rpx 36rpx rgba(111, 74, 29, 0.18);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.live2d-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.live2d-container canvas {
  display: block;
}

.live2d-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.loading-ring {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid rgba(141, 100, 49, 0.2);
  border-top-color: #8a5a2b;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-text {
  font-size: 22rpx;
  color: #8a6a3d;
}

.live2d-fallback {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.fallback-img {
  width: 88%;
  height: 75%;
  transition: transform 0.3s ease;
}

.fallback-status {
  margin-top: 8rpx;
  padding: 8rpx 22rpx;
  border-radius: 999rpx;
  background: rgba(83, 54, 22, 0.72);
  color: #fff;
  font-size: 22rpx;
}

.fallback-idle .fallback-img {
  animation: idleBreath 2.8s ease-in-out infinite;
}

.fallback-listening .fallback-img {
  animation: listeningPulse 0.9s ease-in-out infinite;
  filter: drop-shadow(0 0 20rpx rgba(197, 151, 84, 0.75));
}

.fallback-thinking .fallback-img {
  animation: thinkingFlicker 1s ease-in-out infinite alternate;
}

.fallback-speaking .fallback-img {
  animation: speakingBounce 0.45s ease-in-out infinite alternate;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes idleBreath {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-8rpx) scale(1.02); }
}

@keyframes listeningPulse {
  from { filter: drop-shadow(0 0 0 rgba(197, 151, 84, 0)); }
  to { filter: drop-shadow(0 0 20rpx rgba(197, 151, 84, 0.75)); }
}

@keyframes thinkingFlicker {
  from { opacity: 0.8; }
  to { opacity: 1; }
}

@keyframes speakingBounce {
  from { transform: translateY(0) scale(1); }
  to { transform: translateY(-8rpx) scale(1.02); }
}
</style>
