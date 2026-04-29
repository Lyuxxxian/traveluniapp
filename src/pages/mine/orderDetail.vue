<template>
  <view class="page">
    <view class="content">
      <text class="title">订单详情</text>
      <text class="desc">订单详情页面开发中...</text>
    </view>

    <!-- 底边栏 -->
    <view class="tabbar">
      <view
        class="tab-item"
        v-for="item in tabs"
        :key="item.key"
        :class="{ active: item.key === activeTab && !item.isAi }"
        @tap="onTabTap(item)"
      >
        <template v-if="!item.isAi">
          <text class="tab-icon">{{ item.icon }}</text>
          <text class="tab-text">{{ item.label }}</text>
        </template>
      </view>

      <view class="ai-button" @tap="onAiTap">
        <text class="ai-icon">🐼</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const activeTab = ref('mine')

const tabs = [
  { key: 'home', label: '首页', icon: '⌂' },
  { key: 'map', label: '地图', icon: '⌖' },
  { key: 'ai', label: 'AI', icon: '●', isAi: true },
  { key: 'discover', label: '发现', icon: '◈' },
  { key: 'mine', label: '我的', icon: '◉' },
]

function onAiTap() {
  uni.showToast({ title: 'AI助手页面待开发', icon: 'none' })
}

function onTabTap(item) {
  if (item.isAi) return
  activeTab.value = item.key

  if (item.key === 'home') {
    uni.reLaunch({ url: '/pages/index/index' })
    return
  }

  if (item.key === 'map') {
    uni.navigateTo({ url: '/pages/map/map' })
    return
  }

  if (item.key === 'discover') {
    uni.navigateTo({ url: '/pages/discover/discover' })
    return
  }

  if (item.key === 'mine') {
    uni.reLaunch({ url: '/pages/mine/mine' })
    return
  }

  uni.showToast({ title: `${item.label}页面待开发`, icon: 'none' })
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
  position: relative;
  padding-bottom: 140rpx;
}

.content {
  padding: 100rpx 40rpx;
  text-align: center;
}

.title {
  font-size: 36rpx;
  font-weight: 700;
  color: #333;
  display: block;
  margin-bottom: 20rpx;
}

.desc {
  font-size: 28rpx;
  color: #999;
  display: block;
}

.tabbar {
  height: 120rpx;
  background: #fff;
  border-top: 1rpx solid #ebedf0;
  display: flex;
  align-items: center;
  justify-content: space-around;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
}

.tab-item {
  width: 20%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9b9b9b;
}

.tab-icon {
  font-size: 34rpx;
  line-height: 1;
}

.tab-text {
  margin-top: 6rpx;
  font-size: 22rpx;
}

.tab-item.active {
  color: #3ca764;
}

.ai-button {
  position: absolute;
  left: 50%;
  top: -28rpx;
  transform: translateX(-50%);
  width: 108rpx;
  height: 108rpx;
  border-radius: 50%;
  border: 8rpx solid #fff;
  background: linear-gradient(145deg, #72d67f 0%, #48b258 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 18rpx rgba(31, 136, 56, 0.3);
}

.ai-icon {
  font-size: 54rpx;
}
</style>
