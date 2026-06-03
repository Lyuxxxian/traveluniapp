<template>
  <!-- #ifdef H5 -->
  <view class="live2d-wrapper" v-show="visible">
    <view id="live2d-container" class="live2d-container"></view>
  </view>
  <view class="live2d-toggle" @tap="toggle">
    <text>{{ visible ? '隐藏' : '显示' }}</text>
  </view>
  <!-- #endif -->
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue'

// #ifdef H5
import * as PIXI from 'pixi.js'
import { Live2DModel } from 'pixi-live2d-display/cubism4'

window.PIXI = PIXI
// #endif

const visible = ref(true)
let app = null
let model = null

// 可用表情列表（对应 model3.json 中的 Expressions）
const expressions = ['smile', 'squint', 'tears', 'teardrop']
let expressionTimer = null

/**
 * 绑定模型交互：拖拽 + 点击触发表情
 */
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
    if (!isDragging) {
      triggerRandomExpression(m)
    }
  })

  m.on('pointerupoutside', () => {
    m.dragging = false
  })
}

/**
 * 触发随机表情，2秒后恢复默认
 */
function triggerRandomExpression(m) {
  if (expressionTimer) clearTimeout(expressionTimer)

  const name = expressions[Math.floor(Math.random() * expressions.length)]
  m.expression(name)

  expressionTimer = setTimeout(() => {
    m.expression()
  }, 2000)
}

/**
 * 加载模型到 canvas
 */
async function loadModel() {
  const container = document.getElementById('live2d-container')
  if (!container || !app) return

  const width = container.offsetWidth
  const height = container.offsetHeight

  if (model) {
    app.stage.removeChild(model)
    model.destroy()
    model = null
  }

  try {
    model = await Live2DModel.from('/static/HeiJiao/yachiyo.model3.json')

    const scale = Math.min(width / model.width, height / model.height) * 0.8
    model.scale.set(scale)
    model.x = (width - model.width * scale) / 2
    model.y = (height - model.height * scale) / 2

    app.stage.addChild(model)
    bindInteraction(model)
  } catch (error) {
    console.error('模型加载失败:', error)
  }
}

/**
 * 切换显隐
 */
async function toggle() {
  // #ifdef H5
  visible.value = !visible.value
  if (visible.value) {
    await nextTick()
    if (!app) {
      initApp()
    }
    await loadModel()
  } else {
    if (model) {
      app.stage.removeChild(model)
      model.destroy()
      model = null
    }
  }
  // #endif
}

/**
 * 初始化 PIXI Application
 */
function initApp() {
  const container = document.getElementById('live2d-container')
  if (!container) return

  const width = container.offsetWidth
  const height = container.offsetHeight

  app = new PIXI.Application({
    width: width,
    height: height,
    autoStart: true,
    backgroundAlpha: 0,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
  })

  // 让 canvas 填满容器
  app.view.style.width = '100%'
  app.view.style.height = '100%'
  container.appendChild(app.view)
}

onMounted(async () => {
  // #ifdef H5
  initApp()
  await loadModel()
  // #endif
})

onUnmounted(() => {
  if (expressionTimer) clearTimeout(expressionTimer)
  model?.destroy()
  app?.destroy(true, { children: true })
})
</script>

<style scoped>
.live2d-wrapper {
  position: fixed;
  bottom: 120px;
  right: 120px;
  width: 600px;
  height: 800px;
  pointer-events: none;
  z-index: 9998;
}

.live2d-container {
  width: 100%;
  height: 100%;
  pointer-events: auto;
}

.live2d-toggle {
  position: fixed;
  bottom: 45px;
  right: 45px;
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 182, 193, 0.3);
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  z-index: 9999;
  font-size: 0.85rem;
  color: #ff6b9d;
  transition: all 0.3s;
}

.live2d-toggle:hover {
  background: rgba(255, 182, 193, 0.3);
}

/* 手机端适配 */
@media screen and (max-width: 768px) {
  .live2d-wrapper {
    width: 200px;
    height: 280px;
    bottom: 70px;
    right: 20px;
  }

  .live2d-toggle {
    bottom: 20px;
    right: 20px;
    padding: 4px 10px;
    font-size: 0.8rem;
  }
}
</style>
