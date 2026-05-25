import { askAI } from '@/api/ai'
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

      <view class="human-card">
        <image
  class="human-img"
  :class="{
    talking: humanStatus === '正在讲解',
    thinking: humanStatus === '思考中...',
    listening: humanStatus === '正在聆听'
  }"
  src="/static/ai/guide.png"
  mode="aspectFit"
/>

        <view class="human-status">
          {{ humanStatus }}
        </view>
      </view>

      <view class="intro-card">
        <view class="intro-title">您好，我是灵儿</view>
        <view class="intro-text">
          我是灵山胜境数字人导游，可以为您讲解景点历史、推荐游览路线，也可以回答门票、演出、亲子游等问题。
        </view>
      </view>
    </view>

    <view class="quick-section">
      <view class="section-title">快捷提问</view>

      <view class="quick-list">
        <view
          class="quick-item"
          v-for="(item, index) in quickQuestions"
          :key="index"
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
        :key="index"
        :id="'msg-' + index"
        class="message-row"
        :class="msg.role === 'user' ? 'message-user' : 'message-ai'"
      >
        <view class="message-bubble">
          {{ msg.content }}
        </view>
      </view>
    </scroll-view>

    <view class="input-bar">
      <input
        class="input"
        v-model="inputText"
        placeholder="请输入您想咨询的问题"
        confirm-type="send"
        @confirm="sendMessage"
      />

      <view class="voice-btn" @tap="mockVoice">
  {{ humanStatus === '正在聆听' ? '🎙️' : '🎤' }}
</view>

      <view class="send-btn" @tap="sendMessage">
        发送
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { matchKnowledge } from '@/utils/knowledge.js'
import { askAI } from '@/api/ai'

const inputText = ref('')
const humanStatus = ref('在线待命')
const scrollIntoView = ref('')

const quickQuestions = [
  '介绍灵山大佛',
  '九龙灌浴几点演出',
  '推荐历史文化路线',
  '亲子游怎么玩',
  '灵山梵宫有什么特色',
  '门票多少钱'
]

const messages = ref([
  {
    role: 'ai',
    content:
      '您好，我是灵儿，您的灵山胜境数字人AI导游。您可以问我景点介绍、演出时间、路线推荐、亲子游攻略等问题。'
  }
])

function goBack() {
  uni.navigateBack()
}

function askQuick(text) {
  inputText.value = text
  sendMessage()
}

function sendMessage() {
  const question = inputText.value.trim()

  if (!question) {
    uni.showToast({
      title: '请输入问题',
      icon: 'none'
    })
    return
  }

  messages.value.push({
    role: 'user',
    content: question
  })

  inputText.value = ''
  humanStatus.value = '思考中...'
  scrollToBottom()

  setTimeout(async () => {
  const localAnswer = matchKnowledge(question)
  const answer = localAnswer.includes('暂时还没有') ? await askAI(question) : localAnswer

  messages.value.push({
  role: 'ai',
  content: answer
})

humanStatus.value = '正在讲解'
scrollToBottom()
speakText(answer)
  speakText(answer)
}, 500)
}

function mockVoice() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition

  if (!SpeechRecognition) {
    uni.showToast({
      title: '当前浏览器不支持语音识别，请使用 Chrome',
      icon: 'none'
    })
    return
  }

  const recognition = new SpeechRecognition()
  recognition.lang = 'zh-CN'
  recognition.continuous = false
  recognition.interimResults = false

  humanStatus.value = '正在聆听'

  recognition.start()

  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript

    inputText.value = text
    humanStatus.value = '思考中...'

    sendMessage()
  }

  recognition.onerror = () => {
    humanStatus.value = '在线待命'
    uni.showToast({
      title: '语音识别失败，请重试',
      icon: 'none'
    })
  }

  recognition.onend = () => {
    if (humanStatus.value === '正在聆听') {
      humanStatus.value = '在线待命'
    }
  }
}

function scrollToBottom() {
  nextTick(() => {
    const lastIndex = messages.value.length - 1
    scrollIntoView.value = 'msg-' + lastIndex
  })
}


function speakText(text) {
  // H5 浏览器端语音播报
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-CN'
    utterance.rate = 1
    utterance.pitch = 1
    utterance.volume = 1

    utterance.onend = () => {
      humanStatus.value = '在线待命'
    }

    utterance.onerror = () => {
      humanStatus.value = '在线待命'
    }

    window.speechSynthesis.speak(utterance)
  } else {
    setTimeout(() => {
      humanStatus.value = '在线待命'
    }, 1500)
  }
}
</script>

<style scoped>
.ai-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8efe0 0%, #fffaf2 42%, #f7f1e8 100%);
  padding-bottom: 130rpx;
  box-sizing: border-box;
}

.top-card {
  height: 128rpx;
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

.human-card {
  position: relative;
  width: 250rpx;
  height: 320rpx;
  border-radius: 36rpx;
  background: linear-gradient(180deg, #fff7df, #d5a866);
  box-shadow: 0 18rpx 36rpx rgba(111, 74, 29, 0.18);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.human-img {
  width: 220rpx;
  height: 240rpx;
}

.human-status {
  margin-top: 8rpx;
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
  padding: 18rpx 28rpx 8rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #4e351d;
  margin-bottom: 18rpx;
}

.quick-list {
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
  height: 520rpx;
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

.input-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
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
  font-size: 34rpx;
  box-shadow: 0 8rpx 18rpx rgba(121, 79, 32, 0.12);
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
.human-img.talking {
  animation: talkingMove 0.45s infinite alternate;
}

.human-img.thinking {
  animation: thinkingMove 1s infinite alternate;
}

@keyframes talkingMove {
  from {
    transform: translateY(0) scale(1);
  }

  to {
    transform: translateY(-8rpx) scale(1.02);
  }
}

@keyframes thinkingMove {
  from {
    opacity: 0.75;
  }

  to {
    opacity: 1;
  }
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

.human-img.listening {
  animation: listeningMove 0.9s infinite alternate;
}

@keyframes listeningMove {
  from {
    filter: drop-shadow(0 0 0 rgba(197, 151, 84, 0));
  }

  to {
    filter: drop-shadow(0 0 20rpx rgba(197, 151, 84, 0.75));
  }
}

</style>