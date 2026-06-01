<template>
  <view class="page">
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <view class="back-icon" />
      </view>
      <text class="nav-title">我的工单</text>
      <view class="nav-placeholder" />
    </view>

    <scroll-view scroll-y class="body">
      <view v-if="loading" class="center-state">
        <text>加载中...</text>
      </view>
      <view v-else-if="!list.length" class="center-state">
        <text>暂无工单</text>
        <view class="empty-btn" @tap="goCreate">提交工单</view>
      </view>
      <view v-else>
        <view v-for="item in list" :key="item.id" class="ticket-card">
          <view class="ticket-head">
            <text class="ticket-no">{{ item.ticketNo }}</text>
            <text class="ticket-status" :class="item.status">{{ statusText(item.status) }}</text>
          </view>
          <text class="ticket-content">{{ item.content }}</text>
          <text v-if="item.adminReply" class="ticket-reply">客服回复：{{ item.adminReply }}</text>
          <text class="ticket-time">{{ item.createdAt }}</text>
        </view>
      </view>
    </scroll-view>

    <view class="fab" @tap="goCreate">+ 新工单</view>
  </view>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { fetchUserSupportTickets } from '../../api/service'
import { isLoggedIn } from '../../utils/auth'

const loading = ref(true)
const list = ref([])

const statusMap = {
  open: '待处理',
  processing: '处理中',
  closed: '已关闭',
}

function statusText(status) {
  return statusMap[status] || status
}

function goBack() {
  uni.navigateBack()
}

function goCreate() {
  uni.navigateTo({ url: '/pages/service/ticketCreate' })
}

onMounted(async () => {
  if (!isLoggedIn()) {
    uni.redirectTo({ url: '/pages/login/login' })
    return
  }
  try {
    const result = await fetchUserSupportTickets({ page: 1, pageSize: 50 })
    list.value = result.list || []
  } catch {
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(180deg, #f6efe2 0%, #f7f1e7 100%);
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 24rpx;
  padding-top: var(--status-bar-height);
}

.nav-back {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.78);
  display: flex;
  align-items: center;
  justify-content: center;
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

.body {
  flex: 1;
  min-height: 0;
  padding: 20rpx 24rpx 120rpx;
}

.center-state {
  min-height: 500rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
  color: #9a8265;
  font-size: 28rpx;
}

.empty-btn {
  padding: 16rpx 40rpx;
  border-radius: 999rpx;
  background: #8b6138;
  color: #fff;
  font-size: 26rpx;
}

.ticket-card {
  margin-bottom: 20rpx;
  padding: 24rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.92);
}

.ticket-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ticket-no {
  font-size: 26rpx;
  font-weight: 700;
  color: #312416;
}

.ticket-status {
  font-size: 24rpx;
  color: #8b6138;
}

.ticket-status.closed {
  color: #9a8265;
}

.ticket-content {
  display: block;
  margin-top: 12rpx;
  font-size: 28rpx;
  color: #5c4a32;
}

.ticket-reply {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #6f451d;
  background: rgba(139, 97, 56, 0.08);
  padding: 12rpx;
  border-radius: 12rpx;
}

.ticket-time {
  display: block;
  margin-top: 12rpx;
  font-size: 22rpx;
  color: #9a8265;
}

.fab {
  position: fixed;
  right: 32rpx;
  bottom: 48rpx;
  padding: 20rpx 32rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #8b6138, #d8ad6b);
  color: #fff;
  font-size: 28rpx;
  font-weight: 700;
  box-shadow: 0 12rpx 28rpx rgba(94, 68, 35, 0.2);
}
</style>
