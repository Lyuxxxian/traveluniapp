<template>
  <TabBar activeTab="mine" :showTabbar="true">
    <view class="page">
    <!-- 顶部背景区域 -->
    <view class="header">
      <view class="header-bg"></view>
      
      <!-- 用户信息 -->
      <view class="user-info">
        <image class="avatar" src="/static/logo.png" mode="aspectFill" />
        <text class="username">{{ userName }}</text>
      </view>
    </view>

    <!-- 我的订单 -->
    <view class="section">
      <view class="section-title">
        <text>我的订单</text>
      </view>
      
      <view class="order-grid">
        <view class="order-item" v-for="item in orderItems" :key="item.key" @tap="goOrderList(item.key)">
          <image class="order-icon" :src="item.icon" mode="aspectFit" />
          <text class="order-label">{{ item.label }}</text>
        </view>
      </view>
    </view>

    <!-- 常用功能 -->
    <view class="section">
      <view class="section-title">
        <text>常用功能</text>
      </view>
      
      <view class="function-grid">
        <view class="function-item" v-for="item in functionItems" :key="item.key" @tap="goFunction(item.key)">
          <image class="function-icon" :src="item.icon" mode="aspectFit" />
          <text class="function-label">{{ item.label }}</text>
        </view>
      </view>
    </view>
    </view>
  </TabBar>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchUserName } from '../../api/mine'
import TabBar from '../../components/TabBar.vue'

const activeTab = ref('mine')
const userName = ref('')

// 订单图标（使用编译后的路径）
const orderItems = [
  { key: 'all', label: '全部订单', icon: '/static/mine/mine-sub/allorders_1777459859.png' },
  { key: 'pendingPay', label: '待付款', icon: '/static/mine/mine-sub/pending_1777460426.png' },
  { key: 'pendingUse', label: '待使用', icon: '/static/mine/mine-sub/obligation_1777460390.png' },
  { key: 'completed', label: '已完成', icon: '/static/mine/mine-sub/off_the_stocks_1777460440.png' },
]

// 常用功能图标
const functionItems = [
  { key: 'information', label: '我的信息', icon: '/static/mine/mine-using/information_1777461157.png' },
  { key: 'discount', label: '优惠券', icon: '/static/mine/mine-using/discount_1777461276.png' },
  { key: 'settings', label: '设置', icon: '/static/mine/mine-using/settings_1777461303.png' },
  { key: 'feedback', label: '意见反馈', icon: '/static/mine/mine-using/feedback_1777461336.png' },
]

onMounted(async () => {
  userName.value = await fetchUserName()
})

// 订单列表跳转
function goOrderList(status) {
  // TODO: 跳转到订单列表页面
  uni.showToast({ title: `跳转${status}订单页面`, icon: 'none' })
  // uni.navigateTo({ url: `/pages/mine/orderList?status=${status}` })
}

// 常用功能跳转
function goFunction(key) {
  // TODO: 跳转到对应功能页面
  uni.showToast({ title: `跳转${key}页面`, icon: 'none' })
  // uni.navigateTo({ url: `/pages/mine/${key}` })
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
  position: relative;
  padding-bottom: 140rpx;
}

/* 顶部区域 */
.header {
  position: relative;
  height: 400rpx;
  overflow: hidden;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #e8d5c4 0%, #d4b896 100%);
}

.user-info {
  position: absolute;
  top: 120rpx;
  left: 40rpx;
  display: flex;
  align-items: center;
  gap: 30rpx;
  z-index: 10;
}

.avatar {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  border: 6rpx solid #fff;
  background: #fff;
}

.username {
  font-size: 36rpx;
  font-weight: 700;
  color: #333;
}

/* 区块样式 */
.section {
  margin: 20rpx 24rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.section-title {
  margin-bottom: 30rpx;
}

.section-title text {
  font-size: 32rpx;
  font-weight: 700;
  color: #333;
}

/* 订单网格 */
.order-grid {
  display: flex;
  justify-content: space-around;
}

.order-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.order-icon {
  width: 80rpx;
  height: 80rpx;
}

.order-label {
  font-size: 26rpx;
  color: #666;
}

/* 功能网格 */
.function-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30rpx;
}

.function-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.function-icon {
  width: 72rpx;
  height: 72rpx;
}

.function-label {
  font-size: 24rpx;
  color: #666;
  text-align: center;
}
</style>
