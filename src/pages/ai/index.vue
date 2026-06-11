<template>
  <view class="ai-page">
    <view class="top-card">
      <view class="back" @tap="goBack">‹</view>

      <view class="title-area">
        <view class="title">灵山数字人AI导游</view>
        <view class="subtitle">智慧问答 · 景点讲解 · 个性路线推荐</view>
      </view>
    </view>

    <view class="human-section">
      <view class="light-circle"></view>

      <Live2DCharacter
        ref="live2dRef"
        class="human-card-live2d"
        :width="250"
        :height="320"
        :model-url="live2dModelUrl"
        :fallback-url="live2dCdnFallback"
        :status="live2dStatus"
        fallback-img="/static/ai/floating-guide.png"
        @loaded="onLive2DLoaded"
        @error="onLive2DError"
        @tap="onCharacterTap"
      />

      <view v-if="!live2dReady" class="human-status">
        {{ humanStatus }}
      </view>

      <view class="intro-card">
        <view class="intro-title">您好，我是灵儿</view>
        <view class="intro-text">
          我是灵山胜境数字人导游，可以听您说话、为您语音讲解景点历史、推荐游览路线，也可以回答门票、演出、亲子游等问题。
        </view>
      </view>
    </view>

    <view class="quick-section">
      <view class="section-title">快捷提问</view>

      <view class="quick-list">
        <view
          v-for="(item, index) in quickQuestions"
          :key="index"
          class="quick-item"
          @tap="askQuick(item)"
        >
          {{ item }}
        </view>
      </view>
    </view>

    <scroll-view
      class="chat-list"
      scroll-y
      :scroll-into-view="scrollIntoView"
    >
      <view
        v-for="(msg, index) in messages"
        :id="'msg-' + index"
        :key="index"
        class="message-row"
        :class="msg.role === 'user' ? 'message-user' : 'message-ai'"
      >
        <view class="message-bubble">
          {{ msg.content }}
        </view>
      </view>
    </scroll-view>

    <view class="voice-panel">
      <view
        class="voice-control"
        :class="{ active: isListening }"
        @tap="toggleVoiceInput"
      >
        {{ isListening ? '停止聆听' : '语音输入' }}
      </view>

      <view
        class="voice-control"
        :class="{ disabled: !canPauseSpeech }"
        @tap="pauseSpeech"
      >
        暂停播报
      </view>

      <view
        class="voice-control"
        :class="{ disabled: !canResumeSpeech }"
        @tap="resumeSpeech"
      >
        继续播报
      </view>

      <view
        class="voice-control"
        :class="{ disabled: !canStopSpeech }"
        @tap="stopSpeech"
      >
        停止播报
      </view>
    </view>

    <view class="input-bar">
      <input
        v-model="inputText"
        class="input"
        placeholder="请输入或点击语音输入"
        confirm-type="send"
        @confirm="sendMessage"
      />

      <view class="voice-btn" :class="{ listening: isListening }" @tap="toggleVoiceInput">
        {{ isListening ? '听' : '说' }}
      </view>

      <view class="send-btn" @tap="sendMessage">
        发送
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { askAI } from '@/api/ai'
import Live2DCharacter from '@/components/Live2DCharacter.vue'
import {
  matchDocumentKnowledge,
  matchLocalKnowledge,
} from '@/data/knowledge'
import { matchPersonalizedRecommendation } from '@/data/personalizedRecommendation'

const inputText = ref('')
const humanStatus = ref('在线待命')
const scrollIntoView = ref('')
const live2dRef = ref(null)
const live2dReady = ref(false)
const live2dError = ref(false)
const isListening = ref(false)
const isSpeaking = ref(false)
const isPaused = ref(false)
const availableVoices = ref([])

let recognition = null
let currentUtterance = null

const live2dModelUrl = '/static/HeiJiao/yachiyo.model3.json'
const live2dCdnFallback = ''

const canPauseSpeech = computed(() => isSpeaking.value && !isPaused.value)
const canResumeSpeech = computed(() => isSpeaking.value && isPaused.value)
const canStopSpeech = computed(() => isSpeaking.value || isPaused.value)

const live2dStatus = computed(() => {
  if (live2dError.value || !live2dReady.value) return 'idle'
  if (humanStatus.value === '正在聆听') return 'listening'
  if (humanStatus.value === '思考中...') return 'thinking'
  if (humanStatus.value === '正在讲解') return 'speaking'
  return 'idle'
})

const quickQuestions = [
  '我对历史文化感兴趣，推荐一条路线',
  '喜欢自然风光和拍照，怎么游览',
  '带孩子轻松玩，推荐亲子路线',
  '想祈福慢游，不想太累',
  '灵山梵宫有什么特色',
  '门票多少钱',
]

const messages = ref([
  {
    role: 'ai',
    content:
      '您好，我是灵儿，您的灵山胜境数字人AI导游。您可以打字，也可以点“语音输入”直接和我说话；我讲解时可以随时暂停、继续或停止播报。',
  },
])

onMounted(() => {
  initVoices()
})

onUnmounted(() => {
  stopVoiceInput()
  stopSpeech()
})

function onLive2DLoaded() {
  live2dReady.value = true
}

function onLive2DError() {
  live2dError.value = true
}

function onCharacterTap() {
  const randomQuestion = quickQuestions[Math.floor(Math.random() * quickQuestions.length)]
  inputText.value = randomQuestion
}

function goBack() {
  stopSpeech()
  stopVoiceInput()
  uni.navigateBack()
}

function askQuick(text) {
  inputText.value = text
  sendMessage()
}

async function resolveAnswer(question) {
  let answer = matchPersonalizedRecommendation(question)

  if (!answer) {
    answer = matchLocalKnowledge(question)
  }

  if (!answer) {
    answer = matchDocumentKnowledge(question)
  }

  if (!answer) {
    answer = await askAI(question)
  }

  return answer || '我暂时没有找到准确答案，您可以换一种问法再试试。'
}

function sendMessage() {
  const question = inputText.value.trim()

  if (!question) {
    uni.showToast({
      title: '请输入问题',
      icon: 'none',
    })
    return
  }

  stopVoiceInput()
  stopSpeech()

  messages.value.push({
    role: 'user',
    content: question,
  })

  inputText.value = ''
  humanStatus.value = '思考中...'
  scrollToBottom()

  setTimeout(async () => {
    const answer = await resolveAnswer(question)

    messages.value.push({
      role: 'ai',
      content: answer,
    })

    scrollToBottom()
    speakText(answer)
  }, 500)
}

function getBrowserWindow() {
  return typeof window !== 'undefined' ? window : null
}

function getSpeechRecognition() {
  const browserWindow = getBrowserWindow()
  return browserWindow?.SpeechRecognition || browserWindow?.webkitSpeechRecognition
}

function toggleVoiceInput() {
  if (isListening.value) {
    stopVoiceInput()
  } else {
    startVoiceInput()
  }
}

function startVoiceInput() {
  const SpeechRecognition = getSpeechRecognition()

  if (!SpeechRecognition) {
    uni.showToast({
      title: '当前环境不支持语音识别，请使用 Chrome H5 端体验',
      icon: 'none',
    })
    return
  }

  stopSpeech()
  recognition = new SpeechRecognition()
  recognition.lang = 'zh-CN'
  recognition.continuous = false
  recognition.interimResults = true
  recognition.maxAlternatives = 1

  isListening.value = true
  humanStatus.value = '正在聆听'

  recognition.onresult = (event) => {
    let finalText = ''
    let interimText = ''

    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const transcript = event.results[index][0].transcript
      if (event.results[index].isFinal) {
        finalText += transcript
      } else {
        interimText += transcript
      }
    }

    inputText.value = (finalText || interimText).trim()

    if (finalText.trim()) {
      stopVoiceInput()
      sendMessage()
    }
  }

  recognition.onerror = () => {
    isListening.value = false
    humanStatus.value = '在线待命'
    uni.showToast({
      title: '语音识别失败，请重试',
      icon: 'none',
    })
  }

  recognition.onend = () => {
    if (isListening.value) {
      isListening.value = false
      humanStatus.value = inputText.value.trim() ? '在线待命' : '在线待命'
    }
  }

  recognition.start()
}

function stopVoiceInput() {
  if (!recognition) return

  try {
    recognition.onend = null
    recognition.stop()
  } catch {
    // Recognition may already be stopped by the browser.
  }

  recognition = null
  isListening.value = false
  if (!isSpeaking.value && !isPaused.value) {
    humanStatus.value = '在线待命'
  }
}

function initVoices() {
  const browserWindow = getBrowserWindow()
  const synth = browserWindow?.speechSynthesis
  if (!synth) return

  const load = () => {
    availableVoices.value = synth.getVoices()
  }

  load()
  synth.onvoiceschanged = load
}

function pickCuteChineseVoice() {
  const voices = availableVoices.value.length
    ? availableVoices.value
    : getBrowserWindow()?.speechSynthesis?.getVoices() || []

  const zhVoices = voices.filter((voice) => /zh|cmn|yue/i.test(voice.lang || ''))
  const preferredNames = [
    'xiaoxiao',
    'xiaoyi',
    'xiaomeng',
    'xiaobei',
    'xiaoxuan',
    'xiaozhen',
    'huihui',
    'tingting',
    'meijia',
    'yaoyao',
    'female',
  ]

  return zhVoices.find((voice) => {
    const name = `${voice.name} ${voice.voiceURI}`.toLowerCase()
    return preferredNames.some((keyword) => name.includes(keyword))
  }) || zhVoices[0] || voices[0] || null
}

function speakText(text) {
  const browserWindow = getBrowserWindow()
  const synth = browserWindow?.speechSynthesis

  if (!synth) {
    humanStatus.value = '正在讲解'
    isSpeaking.value = true
    setTimeout(() => {
      humanStatus.value = '在线待命'
      isSpeaking.value = false
    }, 3000)
    return
  }

  synth.cancel()
  currentUtterance = new SpeechSynthesisUtterance(text)
  currentUtterance.lang = 'zh-CN'
  currentUtterance.rate = 0.95
  currentUtterance.pitch = 1.18
  currentUtterance.volume = 1

  const voice = pickCuteChineseVoice()
  if (voice) {
    currentUtterance.voice = voice
  }

  currentUtterance.onstart = () => {
    humanStatus.value = '正在讲解'
    isSpeaking.value = true
    isPaused.value = false
  }

  currentUtterance.onend = () => {
    humanStatus.value = '在线待命'
    isSpeaking.value = false
    isPaused.value = false
    currentUtterance = null
  }

  currentUtterance.onerror = () => {
    humanStatus.value = '在线待命'
    isSpeaking.value = false
    isPaused.value = false
    currentUtterance = null
  }

  synth.speak(currentUtterance)
}

function pauseSpeech() {
  const synth = getBrowserWindow()?.speechSynthesis
  if (!synth || !canPauseSpeech.value) return

  synth.pause()
  isPaused.value = true
  humanStatus.value = '播报已暂停'
}

function resumeSpeech() {
  const synth = getBrowserWindow()?.speechSynthesis
  if (!synth || !canResumeSpeech.value) return

  synth.resume()
  isPaused.value = false
  humanStatus.value = '正在讲解'
}

function stopSpeech() {
  const synth = getBrowserWindow()?.speechSynthesis
  if (synth) {
    synth.cancel()
  }

  currentUtterance = null
  isSpeaking.value = false
  isPaused.value = false
  if (!isListening.value) {
    humanStatus.value = '在线待命'
  }
}

function scrollToBottom() {
  nextTick(() => {
    const lastIndex = messages.value.length - 1
    scrollIntoView.value = `msg-${lastIndex}`
  })
}
</script>

<style scoped>
.ai-page {
  height: 100vh;
  background: linear-gradient(180deg, #f8efe0 0%, #fffaf2 42%, #f7f1e8 100%);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

.top-card {
  height: 128rpx;
  flex-shrink: 0;
  padding: 24rpx 32rpx 10rpx;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  background: linear-gradient(135deg, #7d4d22, #c99b5a);
  color: #fff;
}

.back {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 56rpx;
  line-height: 1;
  margin-right: 20rpx;
}

.title {
  font-size: 34rpx;
  font-weight: 700;
}

.subtitle {
  margin-top: 8rpx;
  font-size: 22rpx;
  opacity: 0.88;
}

.human-section {
  position: relative;
  flex-shrink: 0;
  padding: 34rpx 28rpx 10rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.light-circle {
  position: absolute;
  left: 64rpx;
  top: 48rpx;
  width: 230rpx;
  height: 230rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(246, 206, 120, 0.55), rgba(246, 206, 120, 0));
  animation: pulse 2s infinite;
}

.human-card-live2d {
  position: relative;
  z-index: 2;
  flex-shrink: 0;
}

.human-status {
  position: relative;
  z-index: 2;
  margin-top: -28rpx;
  margin-left: 16rpx;
  align-self: flex-start;
  padding: 8rpx 22rpx;
  border-radius: 999rpx;
  background: rgba(83, 54, 22, 0.72);
  color: #fff;
  font-size: 22rpx;
}

.intro-card {
  flex: 1;
  padding: 28rpx;
  border-radius: 32rpx;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 14rpx 30rpx rgba(112, 78, 35, 0.12);
}

.intro-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #6d421a;
}

.intro-text {
  margin-top: 16rpx;
  font-size: 25rpx;
  line-height: 1.7;
  color: #725d45;
}

.quick-section {
  flex-shrink: 0;
  padding: 18rpx 28rpx 8rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #4e351d;
  margin-bottom: 18rpx;
}

.quick-list,
.voice-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 18rpx;
}

.quick-item {
  padding: 16rpx 24rpx;
  border-radius: 999rpx;
  background: #fff;
  color: #7a4c21;
  font-size: 24rpx;
  box-shadow: 0 8rpx 20rpx rgba(121, 79, 32, 0.1);
}

.chat-list {
  flex: 1;
  min-height: 0;
  height: auto;
  padding: 20rpx 28rpx;
  box-sizing: border-box;
}

.message-row {
  display: flex;
  margin-bottom: 20rpx;
}

.message-user {
  justify-content: flex-end;
}

.message-ai {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 78%;
  padding: 18rpx 22rpx;
  border-radius: 24rpx;
  font-size: 26rpx;
  line-height: 1.65;
  box-shadow: 0 8rpx 20rpx rgba(80, 55, 27, 0.08);
  white-space: pre-line;
}

.message-user .message-bubble {
  background: linear-gradient(135deg, #c8954d, #8a5a2b);
  color: #fff;
  border-bottom-right-radius: 6rpx;
}

.message-ai .message-bubble {
  background: #fff;
  color: #5a432a;
  border-bottom-left-radius: 6rpx;
}

.voice-panel {
  flex-shrink: 0;
  padding: 8rpx 24rpx 12rpx;
  background: rgba(255, 250, 242, 0.94);
}

.voice-control {
  padding: 12rpx 20rpx;
  border-radius: 999rpx;
  background: #fff;
  color: #7a4c21;
  font-size: 23rpx;
  box-shadow: 0 6rpx 14rpx rgba(121, 79, 32, 0.1);
}

.voice-control.active {
  background: #8a5a2b;
  color: #fff;
}

.voice-control.disabled {
  opacity: 0.42;
}

.input-bar {
  flex-shrink: 0;
  position: relative;
  height: 112rpx;
  padding: 18rpx 24rpx;
  background: rgba(255, 250, 242, 0.98);
  border-top: 1rpx solid rgba(152, 112, 58, 0.18);
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.input {
  flex: 1;
  height: 72rpx;
  padding: 0 26rpx;
  border-radius: 999rpx;
  background: #fff;
  font-size: 26rpx;
  box-shadow: inset 0 0 0 1rpx rgba(160, 120, 70, 0.18);
}

.voice-btn {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #7a4c21;
  box-shadow: 0 8rpx 18rpx rgba(121, 79, 32, 0.12);
}

.voice-btn.listening {
  background: #8a5a2b;
  color: #fff;
}

.send-btn {
  width: 110rpx;
  height: 72rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #9b612c, #d3a45c);
  color: #fff;
  font-size: 26rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

@keyframes pulse {
  0% {
    transform: scale(0.92);
    opacity: 0.8;
  }

  100% {
    transform: scale(1.18);
    opacity: 0;
  }
}
</style>
