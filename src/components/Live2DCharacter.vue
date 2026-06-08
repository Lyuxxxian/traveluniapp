<template>
  <view class="live2d-character" :style="containerStyle" ref="containerRef">
    <view v-if="loading" class="live2d-loading">
      <view class="loading-ring"></view>
      <text class="loading-text">灵儿加载中...</text>
    </view>

    <view v-if="error && !loading" class="live2d-fallback" :class="fallbackAnimClass" @tap="emit('tap')">
      <image :src="fallbackImg" mode="aspectFit" class="fallback-img" />
      <view v-if="statusText" class="fallback-status">{{ statusText }}</view>
    </view>
  </view>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  modelUrl: {
    type: String,
    default: 'https://unpkg.com/live2d-widget-model-haru@1.0.5/assets/haru.model.json',
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

const containerRef = ref(null)
const loading = ref(true)
const error = ref(false)

let app = null
let model = null
let statusTimer = null
let PIXI = null
let Live2DModel = null

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

async function loadModules() {
  const [pixiModule, live2dModule] = await Promise.all([
    import('pixi.js'),
    import('pixi-live2d-display'),
  ])
  PIXI = pixiModule
  Live2DModel = live2dModule.Live2DModel
}

async function initLive2D() {
  try {
    if (typeof window === 'undefined') {
      throw new Error('Live2D 仅在 H5 浏览器环境加载')
    }

    await loadModules()
    await nextTick()

    const container = containerRef.value
    if (!container) throw new Error('Live2D 容器未找到')

    app = new PIXI.Application({
      width: props.width * 2,
      height: props.height * 2,
      transparent: true,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      backgroundAlpha: 0,
    })

    const canvas = app.view
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.display = 'block'
    container.appendChild(canvas)

    const urls = [props.modelUrl]
    if (props.fallbackUrl && props.fallbackUrl !== props.modelUrl) {
      urls.push(props.fallbackUrl)
    }

    let lastError = null
    for (const url of urls) {
      try {
        model = await Live2DModel.from(url, { autoInteract: true })
        break
      } catch (err) {
        lastError = err
      }
    }

    if (!model) throw lastError || new Error('Live2D 模型加载失败')

    model.anchor.set(0.5, 0.5)
    model.position.set(app.screen.width / 2, app.screen.height / 2)
    const fitScale = Math.min(
      (app.screen.width * 0.85) / model.width,
      (app.screen.height * 0.9) / model.height,
    )
    model.scale.set(fitScale * props.scale)

    model.interactive = true
    model.buttonMode = true
    model.on('hit', () => {
      emit('tap')
      playMotion('tap')
    })

    app.stage.addChild(model)
    applyStatus(props.status)
    loading.value = false
    emit('loaded')
  } catch (err) {
    console.warn('[Live2D] 使用静态形象兜底:', err)
    error.value = true
    loading.value = false
    emit('error', err)
  }
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
    // Some free models do not expose the requested motion group.
  }
}

function setExpression(name) {
  if (!model) return
  try {
    if (model.internalModel?.expressionManager) {
      model.internalModel.expressionManager.setExpression(name)
    } else if (typeof model.expression === 'function') {
      model.expression(name)
    }
  } catch {
    // Expression availability depends on the model.
  }
}

function applyStatus(status) {
  clearStatusTimer()
  if (!model) return

  if (status === 'listening') {
    setExpression('happy')
  }

  if (status === 'thinking') {
    statusTimer = setInterval(() => playMotion('tap'), 5000)
  }

  if (status === 'speaking') {
    setExpression('happy')
    playMotion('tap')
    statusTimer = setInterval(() => playMotion('tap'), 2600)
  }
}

watch(() => props.status, applyStatus)

onMounted(initLive2D)

onUnmounted(() => {
  clearStatusTimer()
  if (model) {
    model.destroy()
    model = null
  }
  if (app) {
    app.destroy(true, { children: true, texture: true })
    app = null
  }
})

defineExpose({
  playMotion,
  setExpression,
  getModel: () => model,
})
</script>

<style scoped>
.live2d-character {
  position: relative;
  overflow: hidden;
  border-radius: 36rpx;
  background: linear-gradient(180deg, #fff7df, #d5a866);
  box-shadow: 0 18rpx 36rpx rgba(111, 74, 29, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
}

.live2d-loading {
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
