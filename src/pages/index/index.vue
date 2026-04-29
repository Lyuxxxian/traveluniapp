<template>
  <view class="page">
    <scroll-view scroll-y class="scroll">
      <view class="hero">
        <view class="hero-overlay" />
        <view class="top-bar">
          <view class="location">
            <view class="location-icon">▲</view>
            <view class="location-text">
              <text class="city">数字助手</text>
              <text class="city-sub">站式文旅服务</text>
            </view>
          </view>

          <view class="search">
            <text class="search-icon">🔍</text>
            <text class="search-text">找景区/酒店</text>
          </view>

          <view class="camera">◉</view>
        </view>
      </view>

      <view class="main-card">
        <view class="feature-grid">
          <view class="feature-item" v-for="item in featureList" :key="item.title">
            <view class="feature-icon">{{ item.icon }}</view>
            <text class="feature-title">{{ item.title }}</text>
            <text class="feature-sub">{{ item.sub }}</text>
          </view>
        </view>

        <view class="quick-row">
          <view class="quick-tag" v-for="item in quickTags" :key="item">
            <text>{{ item }}</text>
          </view>
        </view>

        <view class="section-title">
          <text class="fire">🔥</text>
          <text>热门景区</text>
        </view>

        <view class="spot-grid">
          <view class="spot-card" v-for="spot in spotList" :key="spot.name">
            <view class="spot-bg" :style="{ background: spot.bg }" />
            <view class="spot-mask" />
            <view class="spot-content">
              <text class="spot-name">{{ spot.name }}</text>
              <text class="spot-desc">{{ spot.desc }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

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

const activeTab = ref('home')

const featureList = [
  { icon: '🏨', title: '酒店民宿', sub: '品质住宿' },
  { icon: '🎫', title: '景区门票', sub: '节日福利' },
  { icon: '🚌', title: '交通出行', sub: '品质出行' },
]

const quickTags = ['精品路线', '精选美食', '阿坝优选']

const spotList = [
  { name: '九寨沟', desc: '“童话世界”、“人间仙境”', bg: 'linear-gradient(140deg, #84d5ff 0%, #2f78d2 100%)' },
  { name: '黄龙', desc: '“世界奇观”、“人间瑶池”', bg: 'linear-gradient(140deg, #89f0d0 0%, #2c8f5d 100%)' },
  { name: '四姑娘山', desc: '“蜀山皇后”、“东方圣山”', bg: 'linear-gradient(140deg, #8bc5ff 0%, #4d65d1 100%)' },
  { name: '达古冰川', desc: '“冰川奇观”、“最近的遥远”', bg: 'linear-gradient(140deg, #76b3ff 0%, #2145a6 100%)' },
]

const tabs = [
  { key: 'home', label: '首页', icon: '⌂' },
  { key: 'map', label: '地图', icon: '⌖' },
  { key: 'ai', label: 'AI', icon: '●', isAi: true },
  { key: 'discover', label: '发现', icon: '◈' },
  { key: 'mine', label: '我的', icon: '◉' },
]

function onTabTap(item) {
  if (item.isAi) return
  if (item.key === 'map') {
    uni.navigateTo({ url: '/pages/map/map' })
    return
  }
  if (item.key === 'discover') {
    uni.navigateTo({ url: '/pages/discover/discover' })
    return
  }
  if (item.key === 'mine') {
    uni.navigateTo({ url: '/pages/mine/mine' })
    return
  }
  activeTab.value = item.key
  uni.showToast({ title: `${item.label}页面待开发`, icon: 'none' })
}

function onAiTap() {
  uni.showToast({ title: 'AI助手页面待开发', icon: 'none' })
}
</script>

<style scoped>
.page {
  height: 100vh;
  background: #f2f4f7;
}

.scroll {
  height: calc(100vh - 120rpx);
}

.hero {
  height: 470rpx;
  padding: 26rpx 24rpx 0;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 76% 34%, rgba(255, 172, 209, 0.8), rgba(255, 172, 209, 0) 28%),
    radial-gradient(circle at 22% 20%, rgba(140, 212, 255, 0.9), rgba(140, 212, 255, 0) 34%),
    linear-gradient(145deg, #0f9db3 0%, #0e7e99 38%, #12628a 100%);
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0.25) 100%);
}

.top-bar {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.location {
  min-width: 166rpx;
  display: flex;
  align-items: center;
}

.location-icon {
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  background: #2ea8ff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  margin-right: 10rpx;
}

.location-text {
  display: flex;
  flex-direction: column;
}

.city {
  color: #fff;
  font-weight: 700;
  font-size: 30rpx;
}

.city-sub {
  color: rgba(255, 255, 255, 0.85);
  font-size: 20rpx;
}

.search {
  flex: 1;
  height: 64rpx;
  border-radius: 40rpx;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  padding: 0 20rpx;
  box-sizing: border-box;
}

.search-icon {
  margin-right: 10rpx;
  font-size: 24rpx;
}

.search-text {
  color: #777;
  font-size: 26rpx;
}

.camera {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
}

.main-card {
  margin-top: -22rpx;
  background: #f8f8f8;
  border-radius: 28rpx 28rpx 0 0;
  padding: 30rpx 24rpx 38rpx;
  min-height: 950rpx;
  box-sizing: border-box;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx 12rpx;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.feature-icon {
  width: 108rpx;
  height: 108rpx;
  border-radius: 50%;
  background: linear-gradient(160deg, #ffecc2 0%, #ffd48a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 52rpx;
}

.feature-title {
  margin-top: 12rpx;
  font-size: 40rpx;
  line-height: 1;
  font-family: STKaiti, KaiTi, serif;
  color: #3c2b21;
}

.feature-sub {
  margin-top: 10rpx;
  color: #888;
  font-size: 24rpx;
}

.quick-row {
  margin-top: 22rpx;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
}

.quick-tag {
  height: 56rpx;
  border-radius: 12rpx;
  background: linear-gradient(135deg, #ffe8bf 0%, #f5d19a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5f3f1e;
  font-size: 26rpx;
  font-weight: 600;
}

.section-title {
  margin-top: 34rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 56rpx;
  line-height: 1;
  color: #111;
  font-family: STKaiti, KaiTi, serif;
}

.fire {
  font-size: 38rpx;
}

.spot-grid {
  margin-top: 22rpx;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.spot-card {
  height: 248rpx;
  border-radius: 18rpx;
  overflow: hidden;
  position: relative;
}

.spot-bg,
.spot-mask {
  position: absolute;
  inset: 0;
}

.spot-mask {
  background: linear-gradient(to top, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.1));
}

.spot-content {
  position: absolute;
  left: 16rpx;
  right: 16rpx;
  bottom: 16rpx;
  color: #fff;
}

.spot-name {
  font-size: 46rpx;
  line-height: 1;
  font-family: STKaiti, KaiTi, serif;
}

.spot-desc {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  opacity: 0.95;
}

.tabbar {
  height: 120rpx;
  background: #fff;
  border-top: 1rpx solid #ebedf0;
  display: flex;
  align-items: center;
  justify-content: space-around;
  position: relative;
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
