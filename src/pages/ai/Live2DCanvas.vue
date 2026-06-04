<template>
  <view class="live2d-wrapper" v-show="visible">
    <!-- #ifdef H5 -->
    <view id="live2d-container" class="live2d-container"></view>
    <!-- #endif -->
    <!-- #ifndef H5 -->
    <canvas
      type="webgl"
      canvas-id="live2dCanvas"
      id="live2dCanvas"
      class="live2d-canvas"
      @touchstart="onTouch"
      @touchmove="onTouch"
      @touchend="onTouch"
      @touchcancel="onTouch"
    ></canvas>
    <!-- #endif -->
  </view>
  <view class="live2d-toggle" @tap="toggle">
    <text>{{ visible ? '隐藏' : '显示' }}</text>
  </view>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue'

// ============ H5 平台 ============
// #ifdef H5
import * as PIXI from 'pixi.js'
import { Live2DModel } from 'pixi-live2d-display/cubism4'
window.PIXI = PIXI
// #endif

const visible = ref(true)
let app = null
let model = null

const expressions = ['smile', 'squint', 'tears', 'teardrop']
let expressionTimer = null

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
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) isDragging = false
      m.position.x = e.data.global.x - m._pointerX
      m.position.y = e.data.global.y - m._pointerY
    }
  })

  m.on('pointerup', () => {
    m.dragging = false
    if (!isDragging) triggerRandomExpression(m)
  })

  m.on('pointerupoutside', () => { m.dragging = false })
}

function triggerRandomExpression(m) {
  if (expressionTimer) clearTimeout(expressionTimer)
  const name = expressions[Math.floor(Math.random() * expressions.length)]
  m.expression(name)
  expressionTimer = setTimeout(() => { m.expression() }, 2000)
}

// ---- H5 专属逻辑 ----
// #ifdef H5
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
    console.error('H5 模型加载失败:', error)
  }
}

function initH5() {
  const container = document.getElementById('live2d-container')
  if (!container) return
  const width = container.offsetWidth
  const height = container.offsetHeight

  app = new PIXI.Application({
    width, height,
    autoStart: true,
    backgroundAlpha: 0,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
  })
  app.view.style.width = '100%'
  app.view.style.height = '100%'
  container.appendChild(app.view)
}
// #endif

// ---- 小程序专属逻辑 ----
// #ifndef H5
let mpPIXI = null
let mpRenderer = null
let mpStage = null
let mpCanvas = null
let animFrameId = null

function onTouch(e) {
  if (mpPIXI) mpPIXI.dispatchEvent(e)
}

function initMiniProgram() {
  try {
    const pixiModule = require('@/libs/pixi.miniprogram')
    const unsafeEval = require('@/libs/unsafeEval')
    const live2dLib = require('@/libs/live2d.min')
    const cubismCore = require('@/libs/live2dcubismcore.min')
    const installCubism4 = require('@/libs/cubism4')
    const installPixiLive2d = require('@/libs/pixi-live2d-display')

    const query = uni.createSelectorQuery()
    query.select('#live2dCanvas').node().exec(async (res) => {
      if (!res || !res[0] || !res[0].node) {
        console.error('无法获取 canvas 节点')
        return
      }

      const canvas = res[0].node
      mpCanvas = canvas

      const info = uni.getSystemInfoSync()
      const sw = info.windowWidth
      const sh = info.windowHeight
      canvas.width = sw * info.pixelRatio
      canvas.height = sh * info.pixelRatio

      const stageWidth = 750
      const stageHeight = parseInt(stageWidth * sh / sw)

      mpPIXI = pixiModule.createPIXI(canvas, stageWidth)
      unsafeEval(mpPIXI)
      installCubism4(mpPIXI, cubismCore)
      installPixiLive2d(mpPIXI, live2dLib, cubismCore)

      mpRenderer = mpPIXI.autoDetectRenderer({
        width: stageWidth,
        height: stageHeight,
        backgroundAlpha: 0,
        premultipliedAlpha: true,
        preserveDrawingBuffer: true,
        view: canvas,
      })

      mpStage = new mpPIXI.Container()

      try {
        const modelUrl = '/static/HeiJiao/yachiyo.model3.json'
        const live2dModel = await mpPIXI.live2d.Live2DModel.from(modelUrl)
        const scale = Math.min(
          stageWidth / live2dModel.width,
          stageHeight / live2dModel.height
        ) * 0.3
        live2dModel.scale.set(scale)
        live2dModel.x = (stageWidth - live2dModel.width * scale) / 2
        live2dModel.y = (stageHeight - live2dModel.height * scale) / 2
        mpStage.addChild(live2dModel)
      } catch (err) {
        console.error('小程序模型加载失败:', err)
      }

      function animate() {
        animFrameId = canvas.requestAnimationFrame(animate)
        mpRenderer.render(mpStage)
      }
      animate()
    })
  } catch (err) {
    console.error('小程序 PIXI 初始化失败:', err)
  }
}
// #endif

// ---- 切换显隐 ----
async function toggle() {
  visible.value = !visible.value
  // #ifdef H5
  if (visible.value) {
    await nextTick()
    if (!app) initH5()
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

onMounted(async () => {
  // #ifdef H5
  initH5()
  await loadModel()
  // #endif
  // #ifndef H5
  initMiniProgram()
  // #endif
})

onUnmounted(() => {
  if (expressionTimer) clearTimeout(expressionTimer)
  // #ifdef H5
  model?.destroy()
  app?.destroy(true, { children: true })
  // #endif
  // #ifndef H5
  if (animFrameId && mpCanvas) {
    mpCanvas.cancelAnimationFrame(animFrameId)
  }
  // #endif
})
</script>

<style scoped>
.live2d-wrapper {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
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

.live2d-canvas {
  width: 100%;
  height: 100%;
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
  }

  .live2d-toggle {
    bottom: 20px;
    right: 20px;
    padding: 4px 10px;
    font-size: 0.8rem;
  }
}
</style>
