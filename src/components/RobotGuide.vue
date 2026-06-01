<template>
  <view class="robot-wrap" :class="statusClass">
    <view class="aura"></view>

    <view class="robot">
      <view class="antenna"></view>

      <view class="head">
        <view class="eye left"></view>
        <view class="eye right"></view>
        <view class="mouth"></view>
      </view>

      <view class="body">
        <view class="screen">
          {{ statusText }}
        </view>
      </view>
    </view>

    <view class="waves" v-if="status === '正在聆听'">
      <view></view>
      <view></view>
      <view></view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    default: '在线待命'
  }
})

const statusClass = computed(() => {
  if (props.status === '正在讲解') return 'talking'
  if (props.status === '正在聆听') return 'listening'
  if (props.status === '思考中...') return 'thinking'
  return 'idle'
})

const statusText = computed(() => props.status)
</script>

<style scoped>
.robot-wrap {
  width: 260rpx;
  height: 320rpx;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.aura {
  position: absolute;
  width: 230rpx;
  height: 230rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(215, 169, 90, 0.45), rgba(255, 255, 255, 0));
  animation: auraPulse 2.4s infinite;
}

.robot {
  position: relative;
  z-index: 2;
  width: 170rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: breathe 2.8s ease-in-out infinite;
}

.antenna {
  width: 8rpx;
  height: 38rpx;
  background: #8a5a2b;
  border-radius: 999rpx;
  position: relative;
}

.antenna::after {
  content: '';
  position: absolute;
  top: -16rpx;
  left: -10rpx;
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  background: #f4c56d;
  box-shadow: 0 0 18rpx rgba(244, 197, 109, 0.8);
}

.head {
  width: 160rpx;
  height: 120rpx;
  border-radius: 42rpx;
  background: linear-gradient(145deg, #fff6dc, #d9a85c);
  border: 8rpx solid #8a5a2b;
  position: relative;
  box-shadow: 0 14rpx 28rpx rgba(90, 59, 25, 0.22);
}

.eye {
  position: absolute;
  top: 40rpx;
  width: 24rpx;
  height: 28rpx;
  border-radius: 50%;
  background: #563515;
  animation: blink 4s infinite;
}

.eye.left {
  left: 38rpx;
}

.eye.right {
  right: 38rpx;
}

.mouth {
  position: absolute;
  left: 58rpx;
  top: 76rpx;
  width: 44rpx;
  height: 10rpx;
  border-radius: 999rpx;
  background: #563515;
}

.body {
  margin-top: -4rpx;
  width: 138rpx;
  height: 92rpx;
  border-radius: 26rpx 26rpx 32rpx 32rpx;
  background: linear-gradient(145deg, #9b642f, #d8aa61);
  border: 7rpx solid #8a5a2b;
  display: flex;
  align-items: center;
  justify-content: center;
}

.screen {
  width: 100rpx;
  height: 38rpx;
  border-radius: 999rpx;
  background: rgba(255, 250, 235, 0.85);
  color: #7a4a20;
  font-size: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.talking .robot {
  animation: talkBody 0.35s infinite alternate;
}

.talking .mouth {
  animation: talkMouth 0.22s infinite alternate;
}

.thinking .robot {
  animation: thinking 0.9s infinite alternate;
}

.listening .aura {
  background: radial-gradient(circle, rgba(67, 180, 255, 0.45), rgba(255, 255, 255, 0));
}

.waves {
  position: absolute;
  right: 0;
  top: 120rpx;
  display: flex;
  gap: 8rpx;
}

.waves view {
  width: 8rpx;
  border-radius: 999rpx;
  background: #4aa3ff;
  animation: waveBar 0.8s infinite alternate;
}

.waves view:nth-child(1) {
  height: 26rpx;
}

.waves view:nth-child(2) {
  height: 44rpx;
  animation-delay: 0.15s;
}

.waves view:nth-child(3) {
  height: 32rpx;
  animation-delay: 0.3s;
}

@keyframes breathe {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8rpx); }
}

@keyframes auraPulse {
  0% { transform: scale(0.9); opacity: 0.75; }
  100% { transform: scale(1.25); opacity: 0; }
}

@keyframes blink {
  0%, 92%, 100% { transform: scaleY(1); }
  95% { transform: scaleY(0.1); }
}

@keyframes talkBody {
  from { transform: translateY(0) scale(1); }
  to { transform: translateY(-7rpx) scale(1.035); }
}

@keyframes talkMouth {
  from { height: 8rpx; border-radius: 999rpx; }
  to { height: 24rpx; border-radius: 50%; }
}

@keyframes thinking {
  from { filter: brightness(0.9); }
  to { filter: brightness(1.15); }
}

@keyframes waveBar {
  from { transform: scaleY(0.5); opacity: 0.5; }
  to { transform: scaleY(1.15); opacity: 1; }
}
</style>