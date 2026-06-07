<template>
  <view class="floating-guide" @tap="goAI">
    <view class="bubble">点我问路</view>
    <view class="halo"></view>

    <image
      class="guide-img"
      src="/static/ai/floating-guide.png"
      mode="aspectFit"
    />

    <view class="sparkle s1">✦</view>
    <view class="sparkle s2">✧</view>
    <view class="sparkle s3">✦</view>

    <view class="shadow"></view>
  </view>
</template>

<script setup>
function goAI() {
  uni.navigateTo({
    url: '/pages/ai/index'
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
  z-index: 100;
  animation: floatBody 2.6s ease-in-out infinite;
}

.guide-img {
  width: 360rpx;
  height: 400rpx;
  position: relative;
  z-index: 3;
  transform-origin: center bottom;
  animation: guideMove 2.4s ease-in-out infinite;
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

.halo {
  position: absolute;
  left: 92rpx;
  top: 96rpx;
  width: 190rpx;
  height: 190rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 214, 122, 0.45), rgba(255, 214, 122, 0));
  animation: haloPulse 2s ease-in-out infinite;
  z-index: 1;
}

.sparkle {
  position: absolute;
  color: #f2b84b;
  font-size: 30rpx;
  z-index: 4;
  animation: sparkleTwinkle 1.8s ease-in-out infinite;
}

.s1 {
  left: 70rpx;
  top: 55rpx;
}

.s2 {
  right: 58rpx;
  top: 118rpx;
  animation-delay: 0.4s;
}

.s3 {
  left: 100rpx;
  bottom: 92rpx;
  animation-delay: 0.8s;
}

.shadow {
  position: absolute;
  left: 112rpx;
  bottom: 8rpx;
  width: 150rpx;
  height: 26rpx;
  border-radius: 50%;
  background: rgba(80, 50, 20, 0.2);
  filter: blur(4rpx);
  animation: shadowMove 2.6s ease-in-out infinite;
  z-index: 0;
}

.floating-guide:active .guide-img {
  animation: clickJump 0.35s ease-out;
}

@keyframes floatBody {
  0%, 100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-20rpx);
  }
}

@keyframes guideMove {
  0% {
    transform: rotate(-2deg) scale(1);
  }

  50% {
    transform: rotate(2deg) scale(1.05);
  }

  100% {
    transform: rotate(-2deg) scale(1);
  }
}

@keyframes bubbleShow {
  0%, 20% {
    opacity: 0;
    transform: translateX(12rpx);
  }

  35%, 75% {
    opacity: 1;
    transform: translateX(0);
  }

  90%, 100% {
    opacity: 0;
    transform: translateX(12rpx);
  }
}

@keyframes haloPulse {
  0% {
    transform: scale(0.88);
    opacity: 0.5;
  }

  50% {
    transform: scale(1.15);
    opacity: 0.9;
  }

  100% {
    transform: scale(0.88);
    opacity: 0.5;
  }
}

@keyframes sparkleTwinkle {
  0%, 100% {
    opacity: 0.2;
    transform: scale(0.8) rotate(0deg);
  }

  50% {
    opacity: 1;
    transform: scale(1.25) rotate(20deg);
  }
}

@keyframes shadowMove {
  0%, 100% {
    transform: scale(1);
    opacity: 0.22;
  }

  50% {
    transform: scale(0.78);
    opacity: 0.12;
  }
}

@keyframes clickJump {
  0% {
    transform: translateY(0) scale(1);
  }

  45% {
    transform: translateY(-34rpx) scale(1.1);
  }

  100% {
    transform: translateY(0) scale(1);
  }
}
</style>