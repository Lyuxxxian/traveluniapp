<template>
  <view class="page">
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <view class="back-icon" />
      </view>
      <text class="nav-title">我的订单</text>
      <view class="nav-placeholder" />
    </view>

    <view class="tab-row">
      <view
        class="tab-item"
        v-for="tab in tabs"
        :key="tab.key"
        :class="{ active: activeTab === tab.key }"
        @tap="switchTab(tab.key)"
      >
        <text>{{ tab.label }}</text>
        <view v-if="activeTab === tab.key" class="tab-underline" />
      </view>
    </view>

    <scroll-view scroll-y class="order-list">
      <view v-if="loading" class="loading-state">
        <text class="loading-text">加载中...</text>
      </view>

      <template v-else>
        <view v-if="orderList.length === 0" class="empty-state">
          <text class="empty-text">暂无订单</text>
        </view>

        <view
          class="order-card"
          v-for="item in orderList"
          :key="item.id"
          @tap="goOrderDetail(item.id)"
        >
          <image class="order-cover" :src="item.coverUrl" mode="aspectFill" />
          <view class="order-info">
            <text class="order-title">{{ item.title }}</text>
            <text class="order-no">{{ item.orderNo }}</text>
            <text class="order-date">{{ item.createdAt }}</text>
          </view>
          <view class="order-right">
            <view class="order-status" :class="statusClass(item.status)">
              <text>{{ item.statusText }}</text>
            </view>
            <text class="order-amount">¥{{ formatPrice(item.payAmount) }}</text>
            <text class="order-qty">共{{ item.quantity }}件</text>
          </view>
        </view>
      </template>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { fetchOrdersByStatus, tabStatuses } from '../../api/mine'

const tabs = tabStatuses
const activeTab = ref('all')
const orderList = ref([])
const loading = ref(true)

function formatPrice(priceInFen) {
  if (priceInFen === 0) return '0'
  const yuan = priceInFen / 100
  if (yuan % 1 === 0) return String(yuan)
  return yuan.toFixed(yuan < 10 ? 1 : 0)
}

function statusClass(status) {
  return `status-${status}`
}

async function switchTab(key) {
  if (activeTab.value === key) return
  activeTab.value = key
  await loadOrders()
}

async function loadOrders() {
  loading.value = true
  try {
    orderList.value = await fetchOrdersByStatus(activeTab.value)
  } catch {
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function goBack() {
  uni.navigateBack()
}

function goOrderDetail(id) {
  uni.navigateTo({ url: `/pages/mine/orderInfo?id=${id}` })
}

onLoad((options) => {
  const status = options?.status || 'all'
  activeTab.value = status
  loadOrders()
})
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 0 0 0;
  box-sizing: border-box;
  background:
    radial-gradient(circle at 12% 0%, rgba(225, 197, 145, 0.34), rgba(225, 197, 145, 0) 34%),
    linear-gradient(180deg, #f6efe2 0%, #f4f5ef 45%, #f7f1e7 100%);
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 24rpx;
  padding-top: var(--status-bar-height);
  flex-shrink: 0;
}

.nav-back {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.78);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 22rpx rgba(94, 68, 35, 0.1);
}

.back-icon {
  width: 18rpx;
  height: 18rpx;
  border-left: 4rpx solid #6f451d;
  border-bottom: 4rpx solid #6f451d;
  transform: rotate(45deg);
  margin-left: 6rpx;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 800;
  color: #312416;
}

.nav-placeholder {
  width: 64rpx;
}

.tab-row {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 24rpx;
  margin-top: 16rpx;
  border-bottom: 1rpx solid rgba(180, 150, 120, 0.18);
  flex-shrink: 0;
}

.tab-item {
  padding: 18rpx 10rpx 16rpx;
  font-size: 28rpx;
  color: #9a8265;
  position: relative;
}

.tab-item.active {
  color: #6f451d;
  font-weight: 800;
}

.tab-underline {
  position: absolute;
  left: 50%;
  bottom: -1rpx;
  transform: translateX(-50%);
  width: 48rpx;
  height: 6rpx;
  border-radius: 6rpx;
  background: linear-gradient(135deg, #8b6138 0%, #d8ad6b 100%);
}

.order-list {
  flex: 1;
  min-height: 0;
  padding: 20rpx 24rpx;
}

.loading-state,
.empty-state {
  min-height: 500rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-text {
  color: #9a8265;
  font-size: 26rpx;
}

.empty-text {
  color: #9a8265;
  font-size: 26rpx;
}

.order-card {
  margin-bottom: 18rpx;
  padding: 20rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.72);
  border-radius: 26rpx;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 16rpx 36rpx rgba(94, 68, 35, 0.08);
  display: flex;
  box-sizing: border-box;
}

.order-cover {
  width: 160rpx;
  height: 160rpx;
  border-radius: 18rpx;
  background: #eee;
  flex-shrink: 0;
}

.order-info {
  flex: 1;
  min-width: 0;
  margin-left: 18rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.order-title {
  color: #312416;
  font-size: 28rpx;
  font-weight: 800;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-no {
  margin-top: 8rpx;
  color: #b4a38a;
  font-size: 22rpx;
}

.order-date {
  margin-top: 4rpx;
  color: #9a8265;
  font-size: 22rpx;
}

.order-right {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  margin-left: 14rpx;
}

.order-status {
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  font-weight: 700;
}

.status-pendingPay {
  background: #fff3e0;
  color: #e67e22;
}

.status-pendingUse {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-completed {
  background: #f0f0f0;
  color: #888;
}

.order-amount {
  margin-top: 14rpx;
  color: #a76524;
  font-size: 30rpx;
  font-weight: 800;
}

.order-qty {
  margin-top: 6rpx;
  color: #9a8265;
  font-size: 20rpx;
}
</style>
