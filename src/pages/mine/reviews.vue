<template>
  <view class="page">
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <view class="back-icon" />
      </view>
      <text class="nav-title">我的点评</text>
      <view class="nav-placeholder" />
    </view>

    <scroll-view scroll-y class="body" @scrolltolower="loadMore">
      <view v-if="loading && !list.length" class="center-state">
        <text>加载中...</text>
      </view>
      <view v-else-if="!list.length" class="center-state">
        <text>暂无点评记录</text>
      </view>
      <view v-else>
        <view v-for="item in list" :key="item.id" class="review-card">
          <view class="review-head">
            <text class="review-title">{{ item.targetTitle }}</text>
            <text class="review-stars">{{ starText(item.rating) }}</text>
          </view>
          <text class="review-content">{{ item.content }}</text>
          <text class="review-meta">{{ item.createdAt }} · {{ statusText(item.status) }}</text>
        </view>
        <view v-if="hasMore" class="load-more">
          <text>{{ loadingMore ? '加载中...' : '上拉加载更多' }}</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { fetchUserReviews } from '../../api/service'
import { isLoggedIn } from '../../utils/auth'

const loading = ref(true)
const loadingMore = ref(false)
const list = ref([])
const page = ref(1)
const hasMore = ref(false)

function starText(rating) {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating)
}

function statusText(status) {
  if (status === 'pending') return '待审核'
  if (status === 'rejected') return '未通过'
  return '已发布'
}

function goBack() {
  uni.navigateBack()
}

async function loadPage(nextPage, append) {
  if (append) loadingMore.value = true
  try {
    const result = await fetchUserReviews({ page: nextPage, pageSize: 10 })
    if (append) {
      list.value = [...list.value, ...result.list]
    } else {
      list.value = result.list
    }
    page.value = result.page
    hasMore.value = result.hasMore
  } catch {
    if (!append) uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

function loadMore() {
  if (!hasMore.value || loadingMore.value) return
  loadPage(page.value + 1, true)
}

onMounted(() => {
  if (!isLoggedIn()) {
    uni.redirectTo({ url: '/pages/login/login' })
    return
  }
  loadPage(1, false)
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
  padding: 20rpx 24rpx;
}

.center-state {
  min-height: 500rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9a8265;
  font-size: 28rpx;
}

.review-card {
  margin-bottom: 20rpx;
  padding: 24rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.92);
}

.review-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.review-title {
  font-size: 30rpx;
  font-weight: 800;
  color: #312416;
}

.review-stars {
  font-size: 24rpx;
  color: #d8ad6b;
}

.review-content {
  display: block;
  margin-top: 12rpx;
  font-size: 28rpx;
  line-height: 1.5;
  color: #5c4a32;
}

.review-meta {
  display: block;
  margin-top: 12rpx;
  font-size: 22rpx;
  color: #9a8265;
}

.load-more {
  text-align: center;
  padding: 24rpx;
  font-size: 24rpx;
  color: #9a8265;
}
</style>
