<template>
  <view class="page">
    <view class="top-bar">
      <text class="back" @tap="goBack">‹</text>
      <text class="title">我的订单</text>
      <view class="right">
        <text class="dot" @tap="onMore">•••</text>
        <text class="circle" @tap="onCircle">◎</text>
      </view>
    </view>

    <view class="segment-row">
      <view
        class="segment-item"
        v-for="item in segmentTabs"
        :key="item.key"
        :class="{ active: item.key === activeStatus }"
        @tap="goStatus(item.key)"
      >
        <text class="segment-text">{{ item.label }}</text>
        <view class="segment-underline" />
      </view>
    </view>

    <view class="content">
      <template v-if="orders.length">
        <view class="order-list">
          <view class="order-item" v-for="o in orders" :key="o.id" @tap="onOrderTap(o.id)">
            <view class="order-left">
              <text class="order-title">{{ o.title }}</text>
              <text class="order-time">{{ o.timeText }}</text>
            </view>
            <text class="order-amount">{{ o.amountText }}</text>
          </view>
        </view>
      </template>

      <template v-else>
        <view class="empty">
          <view class="empty-illus">📋</view>
          <text class="empty-text">暂时没有订单哦~</text>
        </view>
      </template>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { fetchOrdersByStatus } from '../../api/mine'

const orders = ref([])
const activeStatus = ref('all')

const segmentTabs = [
  { key: 'all', label: '全部订单' },
  { key: 'pendingPay', label: '待付款' },
  { key: 'pendingUse', label: '待使用' },
  { key: 'completed', label: '已完成' },
]

function goBack() {
  uni.navigateBack({ delta: 1 })
}

function goStatus(status) {
  uni.redirectTo({ url: `/pages/mine/orderDetail?status=${status}` })
}

function onMore() {
  uni.showToast({ title: '更多功能待开发', icon: 'none' })
}

function onCircle() {
  uni.showToast({ title: '功能待开发', icon: 'none' })
}

function onOrderTap(_id) {
  uni.showToast({ title: '订单详情待开发', icon: 'none' })
}

onLoad(async (options) => {
  const status = options?.status || 'all'
  activeStatus.value = status
  orders.value = await fetchOrdersByStatus(activeStatus.value)
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f3f6f9;
}

.top-bar {
  height: 110rpx;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24rpx;
  box-sizing: border-box;
}

.back {
  width: 72rpx;
  height: 72rpx;
  border-radius: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 44rpx;
  color: #666;
}

.title {
  flex: 1;
  text-align: center;
  font-size: 32rpx;
  font-weight: 800;
  color: #222;
}

.right {
  width: 160rpx;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10rpx;
}

.dot {
  font-size: 28rpx;
  color: #999;
}

.circle {
  font-size: 34rpx;
  color: #999;
}

.segment-row {
  height: 92rpx;
  background: #fff;
  border-bottom: 1rpx solid #eee;
  display: flex;
}

.segment-item {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  position: relative;
  padding-bottom: 18rpx;
}

.segment-text {
  font-size: 26rpx;
  color: #9b9b9b;
}

.segment-underline {
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 64rpx;
  height: 6rpx;
  border-radius: 6rpx;
  background: transparent;
}

.segment-item.active .segment-text {
  color: #333;
  font-weight: 800;
}

.segment-item.active .segment-underline {
  background: #333;
}

.content {
  padding: 40rpx 24rpx;
  box-sizing: border-box;
}

.order-list {
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
}

.order-item {
  padding: 22rpx 22rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1rpx solid #f0f0f0;
}

.order-left {
  display: flex;
  flex-direction: column;
}

.order-title {
  font-size: 30rpx;
  font-weight: 800;
  color: #222;
}

.order-time {
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #888;
}

.order-amount {
  font-size: 28rpx;
  font-weight: 800;
  color: #2a9f70;
}

.empty {
  height: 500rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
}

.empty-illus {
  font-size: 120rpx;
  color: rgba(0, 0, 0, 0.12);
}

.empty-text {
  font-size: 28rpx;
  color: rgba(0, 0, 0, 0.25);
}
</style>

