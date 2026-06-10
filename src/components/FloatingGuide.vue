<template>
  <view class="floating-guide" :class="animClass" @tap="goAI">
    <view class="bubble">点我问路</view>
    <view class="halo"></view>
    <view class="halo-secondary"></view>

    <view class="character-wrapper">
      <image
        class="guide-img"
        src="/static/ai/floating-guide.png"
        mode="aspectFit"
      />
      <view class="eye-glow left-glow"></view>
      <view class="eye-glow right-glow"></view>
    </view>

    <view class="sparkle s1">*</view>
    <view class="sparkle s2">*</view>
    <view class="sparkle s3">*</view>
    <view class="sparkle s4">+</view>

    <view class="shadow"></view>
  </view>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const animClass = ref('')
const animations = ['', 'breath-deep', 'sway-left', 'sway-right', 'attentive']

let animTimer = null

onMounted(() => {
  animTimer = setInterval(() => {
    const nextClass = animations[Math.floor(Math.random() * animations.length)]
    animClass.value = nextClass

    if (nextClass) {
      setTimeout(() => {
        animClass.value = ''
      }, 3000)
    }
  }, 5000)
})

onUnmounted(() => {
  if (animTimer) clearInterval(animTimer)
})

function goAI() {
  uni.navigateTo({
    url: '/pages/ai/index',
  })
}
</script>

<style scoped>
.floating-guide {
  position: fixed;
  right: 20rpx;
  bottom: 180rpx;
  width: 360rpx;
  height: 430rpx;
  z-index: 999;
  animation: floatBody 3s ease-in-out infinite;
}

.character-wrapper {
  position: relative;
  z-index: 3;
  width: 360rpx;
  height: 400rpx;
  transform-origin: center bottom;
  animation: characterIdle 3.2s ease-in-out infinite;
}

.guide-img {
  position: relative;
  z-index: 3;
  width: 360rpx;
  height: 400rpx;
  transform-origin: center 60%;
  animation: subtleBreath 2.1s ease-in-out infinite;
  will-change: transform;
}

.eye-glow {
  position: absolute;
  width: 18rpx;
  height: 24rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.55);
  box-shadow: 0 0 16rpx rgba(255, 240, 200, 0.6);
  animation: eyeShine 4s ease-in-out infinite;
  z-index: 5;
}

.left-glow {
  left: 138rpx;
  top: 112rpx;
}

.right-glow {
  right: 130rpx;
  top: 112rpx;
  animation-delay: 0.3s;
}

.bubble {
  position: absolute;
  right: 255rpx;
  top: 70rpx;
  white-space: nowrap;
  background: #fff8e8;
  color: #8a5423;
  padding: 12rpx 22rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  box-shadow: 0 8rpx 20rpx rgba(120, 78, 34, 0.18);
  animation: bubbleShow 4s infinite;
  z-index: 5;
}

.halo,
.halo-secondary {
  position: absolute;
  border-radius: 50%;
  z-index: 1;
}

.halo {
  left: 92rpx;
  top: 96rpx;
  width: 190rpx;
  height: 190rpx;
  background: radial-gradient(circle, rgba(255, 214, 122, 0.45), rgba(255, 214, 122, 0));
  animation: haloPulse 2.4s ease-in-out infinite;
}

.halo-secondary {
  left: 82rpx;
  top: 86rpx;
  width: 210rpx;
  height: 210rpx;
  background: radial-gradient(circle, rgba(255, 230, 160, 0.2), rgba(255, 214, 122, 0));
  animation: haloPulseSecondary 3s ease-in-out infinite;
}

.sparkle {
  position: absolute;
  color: #f2b84b;
  font-size: 30rpx;
  z-index: 4;
  animation: sparkleOrbit 2.4s ease-in-out infinite;
}

.s1 {
  left: 70rpx;
  top: 55rpx;
}

.s2 {
  right: 58rpx;
  top: 118rpx;
  animation-delay: 0.6s;
}

.s3 {
  left: 100rpx;
  bottom: 92rpx;
  animation-delay: 1.2s;
}

.s4 {
  right: 72rpx;
  bottom: 60rpx;
  animation-delay: 1.8s;
  font-size: 24rpx;
}

.shadow {
  position: absolute;
  left: 112rpx;
  bottom: 8rpx;
  width: 150rpx;
  height: 26rpx;
  border-radius: 50%;
  background: rgba(80, 50, 20, 0.2);
  filter: blur(6rpx);
  animation: shadowMove 3s ease-in-out infinite;
  z-index: 0;
}

.floating-guide:active .character-wrapper {
  animation: clickJump 0.4s ease-out;
}

.floating-guide:active .guide-img {
  animation: clickSquish 0.4s ease-out;
}

@keyframes floatBody {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-24rpx); }
}

@keyframes characterIdle {
  0%, 100% { transform: rotate(-1deg); }
  25% { transform: rotate(1.5deg); }
  50% { transform: rotate(-0.5deg); }
  75% { transform: rotate(1deg); }
}

@keyframes subtleBreath {
  0%, 100% { transform: scaleY(1) scaleX(1); }
  25% { transform: scaleY(1.025) scaleX(1.01); }
  50% { transform: scaleY(0.98) scaleX(0.995); }
  75% { transform: scaleY(1.018) scaleX(1.005); }
}

@keyframes eyeShine {
  0%, 90%, 100% { opacity: 0.6; transform: scale(1); }
  93% { opacity: 0.2; transform: scale(0.3); }
  96% { opacity: 0.7; transform: scale(1.1); }
}

@keyframes bubbleShow {
  0%, 20% { opacity: 0; transform: translateX(12rpx) scale(0.9); }
  35%, 75% { opacity: 1; transform: translateX(0) scale(1); }
  90%, 100% { opacity: 0; transform: translateX(12rpx) scale(0.9); }
}

@keyframes haloPulse {
  0% { transform: scale(0.88); opacity: 0.45; }
  50% { transform: scale(1.18); opacity: 0.9; }
  100% { transform: scale(0.88); opacity: 0.45; }
}

@keyframes haloPulseSecondary {
  0% { transform: scale(1.05); opacity: 0.25; }
  50% { transform: scale(0.82); opacity: 0.55; }
  100% { transform: scale(1.05); opacity: 0.25; }
}

@keyframes sparkleOrbit {
  0%, 100% { opacity: 0.15; transform: translate(0, 0) scale(0.7) rotate(0deg); }
  25% { opacity: 0.9; transform: translate(4rpx, -8rpx) scale(1.3) rotate(15deg); }
  50% { opacity: 0.3; transform: translate(-2rpx, -4rpx) scale(0.8) rotate(-10deg); }
  75% { opacity: 0.85; transform: translate(2rpx, 4rpx) scale(1.2) rotate(5deg); }
}

@keyframes shadowMove {
  0%, 100% { transform: scaleX(1) scaleY(1); opacity: 0.2; }
  50% { transform: scaleX(0.75) scaleY(0.6); opacity: 0.1; }
}

@keyframes clickJump {
  0% { transform: translateY(0) rotate(0); }
  45% { transform: translateY(-38rpx) rotate(-3deg); }
  100% { transform: translateY(0) rotate(0); }
}

@keyframes clickSquish {
  0% { transform: scaleY(1) scaleX(1); }
  30% { transform: scaleY(0.85) scaleX(1.12); }
  60% { transform: scaleY(1.12) scaleX(0.92); }
  100% { transform: scaleY(1) scaleX(1); }
}

.breath-deep .guide-img {
  animation: breathDeep 2.8s ease-in-out infinite;
}

@keyframes breathDeep {
  0%, 100% { transform: scaleY(1) scaleX(1) translateY(0); }
  30% { transform: scaleY(1.04) scaleX(1.015) translateY(-10rpx); }
  50% { transform: scaleY(0.96) scaleX(0.99) translateY(-4rpx); }
  70% { transform: scaleY(1.03) scaleX(1.01) translateY(-7rpx); }
}

.sway-left .character-wrapper {
  animation: swayLeft 3.5s ease-in-out infinite;
}

@keyframes swayLeft {
  0%, 100% { transform: rotate(-2.5deg); }
  50% { transform: rotate(2deg); }
}

.sway-right .character-wrapper {
  animation: swayRight 3.5s ease-in-out infinite;
}

@keyframes swayRight {
  0%, 100% { transform: rotate(2.5deg); }
  50% { transform: rotate(-2deg); }
}

.attentive .character-wrapper {
  animation: attentiveLean 2.2s ease-in-out infinite;
}

.attentive .sparkle {
  animation-duration: 1.2s;
}

@keyframes attentiveLean {
  0%, 100% { transform: rotate(-0.5deg) scale(1.02); }
  50% { transform: rotate(1.5deg) scale(1.05); }
}
</style>
