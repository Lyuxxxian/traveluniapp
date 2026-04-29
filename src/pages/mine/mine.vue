<template>
  <view class="page">
    <view class="scroll">
      <view class="hero">
        <image class="hero-bg" :src="heroBgUrl" mode="aspectFill" />
        <view class="hero-overlay" />

        <view class="user-row">
          <view class="avatar">👤</view>
          <view class="user-text">
            <text class="user-name">{{ userName }}</text>
            <text class="user-sub">文旅订单管理</text>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-title">我的订单</view>

        <view class="order-tabs">
          <view
            class="order-tab"
            :class="{ active: activeOrderStatus === 'all' }"
            @tap="goOrderDetail('all')"
          >
            <image class="order-img" :src="orderIcons.all" mode="aspectFit" />
            <text class="order-text">全部订单</text>
          </view>
          <view
            class="order-tab"
            :class="{ active: activeOrderStatus === 'pendingPay' }"
            @tap="goOrderDetail('pendingPay')"
          >
            <image class="order-img" :src="orderIcons.pendingPay" mode="aspectFit" />
            <text class="order-text">待付款</text>
          </view>
          <view
            class="order-tab"
            :class="{ active: activeOrderStatus === 'pendingUse' }"
            @tap="goOrderDetail('pendingUse')"
          >
            <image class="order-img" :src="orderIcons.pendingUse" mode="aspectFit" />
            <text class="order-text">待使用</text>
          </view>
          <view
            class="order-tab"
            :class="{ active: activeOrderStatus === 'completed' }"
            @tap="goOrderDetail('completed')"
          >
            <image class="order-img" :src="orderIcons.completed" mode="aspectFit" />
            <text class="order-text">已完成</text>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-title">常用功能</view>

        <view class="func-grid">
          <view
            class="func-item"
            v-for="item in commonFunctions"
            :key="item.key"
            @tap="onFuncTap(item.key)"
          >
            <view class="func-icon-wrap">
              <image class="func-img" :src="item.iconUrl" mode="aspectFit" />
            </view>
            <text class="func-text">{{ item.label }}</text>
          </view>
        </view>
      </view>
    </view>

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
import { fetchUserName } from '../../api/mine'

const activeTab = ref('mine')
const userName = ref('游客qn8kn1')
const activeOrderStatus = ref('all')

const heroBgUrl =
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80'

const tabs = [
  { key: 'home', label: '首页', icon: '⌂' },
  { key: 'map', label: '地图', icon: '⌖' },
  { key: 'ai', label: 'AI', icon: '●', isAi: true },
  { key: 'discover', label: '发现', icon: '◈' },
  { key: 'mine', label: '我的', icon: '◉' },
]

const orderIcons = {
  all: '../../static/mine/全部订单_1777459859.png',
  pendingPay: '../../static/mine/待付款_1777460390.png',
  pendingUse: '../../static/mine/待使用_1777460426.png',
  completed: '../../static/mine/已完成_1777460440.png',
}

const commonFunctions = [
  { key: 'info', iconUrl: 'https://cdn-icons-png.flaticon.com/512/2593/2593549.png', label: '常用信息' },
  { key: 'receipt', iconUrl: 'https://cdn-icons-png.flaticon.com/512/679/679922.png', label: '收货管理' },
  { key: 'footprint', iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', label: '我的足迹' },
  { key: 'coupon', iconUrl: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png', label: '优惠券' },
  { key: 'feedback', iconUrl: 'https://cdn-icons-png.flaticon.com/512/1827/1827933.png', label: '意见反馈' },
  { key: 'support', iconUrl: 'https://cdn-icons-png.flaticon.com/512/3050/3050525.png', label: '联系客服' },
  { key: 'settings', iconUrl: 'https://cdn-icons-png.flaticon.com/512/2099/2099058.png', label: '设置' },
  { key: 'cart', iconUrl: 'https://cdn-icons-png.flaticon.com/512/263/263142.png', label: '购物车' },
  { key: 'survey', iconUrl: 'https://cdn-icons-png.flaticon.com/512/3039/3039436.png', label: '调查问卷' },
]

onLoad(async () => {
  userName.value = await fetchUserName()
})

function goOrderDetail(status) {
  activeOrderStatus.value = status
  uni.navigateTo({ url: `/pages/mine/orderDetail?status=${status}` })
}

function onAiTap() {
  uni.showToast({ title: 'AI助手页面待开发', icon: 'none' })
}

function onTabTap(item) {
  if (item.isAi) return
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
  if (item.key === 'mine') return
  uni.showToast({ title: `${item.label}页面待开发`, icon: 'none' })
}

function onFuncTap() {
  uni.showToast({ title: '功能开发中', icon: 'none' })
}
</script>

<style scoped>
.page {
  height: 100vh;
  position: relative;
  background: #f3f6f9;
  overflow: hidden;
}

.scroll {
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 0 24rpx calc(180rpx + env(safe-area-inset-bottom));
}

.hero {
  position: relative;
  height: 220rpx;
  overflow: hidden;
}

.hero-bg {
  width: 100%;
  height: 100%;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.05));
}

.user-row {
  position: absolute;
  left: 24rpx;
  right: 24rpx;
  bottom: -60rpx;
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 18rpx 20rpx;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 28rpx;
  box-shadow: 0 18rpx 36rpx rgba(0, 0, 0, 0.08);
}

.avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 36rpx;
  background: #f0f6ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34rpx;
}

.user-text {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.user-name {
  font-size: 32rpx;
  font-weight: 800;
  color: #222;
}

.user-sub {
  font-size: 24rpx;
  color: #666;
}

.card {
  margin-top: 98rpx;
  padding: 18rpx 20rpx 22rpx;
  background: #fff;
  border-radius: 28rpx;
  box-sizing: border-box;
  box-shadow: 0 14rpx 40rpx rgba(0, 0, 0, 0.04);
}

.card + .card {
  margin-top: 26rpx;
}

.card-title {
  font-size: 34rpx;
  font-weight: 900;
  color: #222;
}

.order-tabs {
  margin-top: 12rpx;
  display: flex;
  justify-content: space-between;
  padding: 10rpx 6rpx 0;
}

.order-tab {
  flex: 1;
  text-align: center;
  font-size: 28rpx;
  color: #9b9b9b;
  padding-bottom: 18rpx;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
}

.order-img {
  width: 44rpx;
  height: 44rpx;
}

.order-text {
  font-size: 24rpx;
  color: inherit;
}

.order-tab.active {
  color: #222;
  font-weight: 800;
}

.order-tab.active::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 56rpx;
  height: 6rpx;
  background: #222;
  border-radius: 6rpx;
}

.func-grid {
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx 10rpx;
  margin-top: 20rpx;
}

.func-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8rpx 4rpx;
}

.func-icon-wrap {
  width: 86rpx;
  height: 86rpx;
  border-radius: 22rpx;
  background: #f4f6f8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.func-img {
  width: 44rpx;
  height: 44rpx;
}

.func-text {
  margin-top: 10rpx;
  font-size: 22rpx;
  color: #666;
  text-align: center;
}

.tabbar {
  height: calc(120rpx + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
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
  box-sizing: border-box;
}

.tab-item {
  width: 20%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9b9b9b;
  position: relative;
  z-index: 2;
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

