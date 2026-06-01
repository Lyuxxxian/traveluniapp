<template>
  <view class="page">
    <image class="hero-img" :src="post?.detailImageUrl || post?.coverUrl" mode="aspectFill" />

    <view class="top-actions">
      <text class="top-icon" @tap="goBack">‹</text>
      <text class="top-icon" @tap="onShare">🔗</text>
    </view>

    <scroll-view scroll-y class="content">
      <view class="content-card">
        <view class="title-row">
          <text class="title">{{ post?.title }}</text>
          <text class="share-icon" @tap="onShare">⤴</text>
        </view>

        <view class="place-card">
          <view class="place-left">
            <text class="place-title">{{ post?.subtitle }}</text>
            <text class="place-sub">{{ post?.place }}</text>
          </view>

          <view class="nav-btn" @tap="onNavigate">
            <text class="nav-icon">↗</text>
            <text class="nav-text">导航</text>
          </view>
        </view>

        <view class="segment">
          <view class="segment-item" :class="{ active: activeSegment === 'detail' }" @tap="activeSegment = 'detail'">
            详情
            <view class="segment-underline" />
          </view>
          <view class="segment-item" :class="{ active: activeSegment === 'review' }" @tap="activeSegment = 'review'">
            点评
            <view class="segment-underline" />
          </view>
        </view>

        <view v-if="activeSegment === 'detail'" class="info">
          <view class="info-row">
            <text class="info-label">{{ infoLabels.place }}：</text>
            <text class="info-value">{{ post?.place }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">{{ infoLabels.joinWay }}：</text>
            <text class="info-value">{{ post?.joinWay }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">{{ infoLabels.duration }}：</text>
            <text class="info-value">{{ post?.durationText }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">{{ infoLabels.content }}：</text>
            <text class="info-value">{{ post?.contentText }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">{{ infoLabels.meaning }}：</text>
            <text class="info-value">{{ post?.meaningText }}</text>
          </view>
        </view>

        <view v-else class="review-panel">
          <view class="review-toolbar">
            <text class="review-count">共 {{ reviewTotal }} 条点评</text>
            <view class="review-write-btn" @tap="goWriteReview">写点评</view>
          </view>
          <view v-if="reviewsLoading" class="review-state">
            <text>加载中...</text>
          </view>
          <view v-else-if="!reviewList.length" class="review-state">
            <text>暂无点评，来写第一条吧</text>
          </view>
          <view v-else>
            <view v-for="item in reviewList" :key="item.id" class="review-card">
              <view class="review-card-head">
                <text class="review-stars">{{ starText(item.rating) }}</text>
                <text class="review-date">{{ item.createdAt }}</text>
              </view>
              <text class="review-content">{{ item.content }}</text>
            </view>
          </view>
        </view>

        <view v-if="activeSegment === 'detail' && post?.relatedTargets?.length" class="related-section">
          <text class="related-title">相关入口</text>
          <view
            class="related-card"
            v-for="item in post.relatedTargets"
            :key="item.title"
            @tap="goContentTarget(item.target)"
          >
            <view class="related-copy">
              <text class="related-card-title">{{ item.title }}</text>
              <text class="related-card-desc">{{ item.desc }}</text>
            </view>
            <text class="related-arrow">›</text>
          </view>
        </view>

        <image
          v-if="activeSegment === 'detail' && post?.detailImageUrl"
          class="bottom-img"
          :src="post.detailImageUrl"
          mode="aspectFill"
        />
      </view>
    </scroll-view>

    <view class="reserve-btn" @tap="onReserve">{{ post?.buttonText || actionText }}</view>
  </view>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { fetchDiscoverPostDetail } from '../../api/discover'
import { fetchReviewsByTarget } from '../../api/service'
import { goContentTarget, goReviewEdit } from '../../utils/navigation'

const post = ref(null)
const activeSegment = ref('detail')
const reviewList = ref([])
const reviewTotal = ref(0)
const reviewsLoading = ref(false)

const actionText = computed(() => {
  if (!post.value) return '立即预约'
  if (post.value.category === 'guide') return '收藏攻略'
  if (post.value.category === 'show') return '查看演出位置'
  if (post.value.category === 'food') return '查看餐厅位置'
  return post.value.buttonText || post.value.actionText || '立即预约'
})

const infoLabels = computed(() => {
  if (post.value?.category === 'guide') {
    return {
      place: '适用范围',
      joinWay: '游玩方式',
      duration: '推荐时长',
      content: '攻略内容',
      meaning: '推荐理由',
    }
  }

  if (post.value?.category === 'show') {
    return {
      place: '演出地点',
      joinWay: '观看方式',
      duration: '演出时长',
      content: '演出内容',
      meaning: '看点说明',
    }
  }

  if (post.value?.category === 'food') {
    return {
      place: '餐厅位置',
      joinWay: '预约方式',
      duration: '用餐建议',
      content: '餐厅介绍',
      meaning: '推荐理由',
    }
  }

  return {
    place: '活动地点',
    joinWay: '参与方式',
    duration: '活动时长',
    content: '活动内容',
    meaning: '活动意义',
  }
})

function goBack() {
  uni.navigateBack({ delta: 1 })
}

function onShare() {
  uni.showToast({ title: '分享功能待开发', icon: 'none' })
}

function onNavigate() {
  const target = post.value?.relatedTargets?.[0]?.target || post.value?.target
  goContentTarget(target)
}

function starText(rating) {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating)
}

async function loadReviews() {
  if (!post.value?.id) return
  reviewsLoading.value = true
  try {
    const result = await fetchReviewsByTarget({
      targetType: 'discoverPost',
      targetId: post.value.id,
      page: 1,
      pageSize: 20,
    })
    reviewList.value = result.list
    reviewTotal.value = result.total
  } catch {
    reviewList.value = []
    reviewTotal.value = 0
  } finally {
    reviewsLoading.value = false
  }
}

function goWriteReview() {
  if (!post.value?.id) return
  goReviewEdit({
    targetType: 'discoverPost',
    targetId: post.value.id,
    title: post.value.title,
  })
}

watch(activeSegment, (segment) => {
  if (segment === 'review') {
    loadReviews()
  }
})

function onReserve() {
  const target = post.value?.target || post.value?.relatedTargets?.[0]?.target
  if (target) {
    if (target.type === 'discoverPost' && post.value?.id === target.id) {
      uni.showToast({ title: '预约成功', icon: 'success' })
      return
    }
    goContentTarget(target)
    return
  }
  uni.showToast({ title: '操作成功', icon: 'success' })
}

onLoad(async (options) => {
  const id = Number(options?.id || 1)
  post.value = await fetchDiscoverPostDetail(id)
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f3f6f9;
  position: relative;
}

.hero-img {
  width: 100%;
  height: 320rpx;
}

.top-actions {
  position: absolute;
  top: calc(var(--status-bar-height) + 20rpx);
  left: 24rpx;
  right: 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 10;
}

.top-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 44rpx;
  background: rgba(0, 0, 0, 0.25);
}

.content {
  height: calc(100vh - 320rpx);
}

.content-card {
  margin-top: -76rpx;
  background: #fff;
  border-radius: 40rpx 40rpx 0 0;
  padding: 28rpx 24rpx 240rpx;
  box-sizing: border-box;
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title {
  font-size: 36rpx;
  font-weight: 800;
  color: #222;
}

.share-icon {
  font-size: 32rpx;
  color: #a0a0a0;
}

.place-card {
  margin-top: 22rpx;
  background: #fff1e6;
  border-radius: 18rpx;
  padding: 20rpx 22rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
}

.place-left {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.place-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #8a5a2f;
}

.place-sub {
  margin-top: 6rpx;
  font-size: 24rpx;
  color: #a15f30;
  opacity: 0.9;
}

.nav-btn {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 92rpx;
  height: 92rpx;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 8rpx 18rpx rgba(0, 0, 0, 0.06);
}

.nav-icon {
  font-size: 34rpx;
  color: #7a7a7a;
}

.nav-text {
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #7a7a7a;
}

.segment {
  margin-top: 28rpx;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  border-bottom: 1rpx solid #eee;
}

.segment-item {
  flex: 1;
  text-align: center;
  padding-bottom: 16rpx;
  color: #9b9b9b;
  font-size: 28rpx;
  position: relative;
}

.segment-item.active {
  color: #333;
  font-weight: 800;
}

.segment-underline {
  position: absolute;
  left: 50%;
  bottom: -1rpx;
  transform: translateX(-50%);
  width: 56rpx;
  height: 6rpx;
  background: #2a2a2a;
  border-radius: 6rpx;
  display: none;
}

.segment-item.active .segment-underline {
  display: block;
}

.info {
  margin-top: 26rpx;
}

.review-panel {
  margin-top: 26rpx;
}

.review-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.review-count {
  font-size: 26rpx;
  color: #6f5b3e;
}

.review-write-btn {
  padding: 12rpx 28rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #8b6138, #d8ad6b);
  color: #fff;
  font-size: 24rpx;
  font-weight: 700;
}

.review-state {
  min-height: 200rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9a8265;
  font-size: 26rpx;
}

.review-card {
  margin-bottom: 20rpx;
  padding: 20rpx;
  border-radius: 16rpx;
  background: #f7f3eb;
}

.review-card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.review-stars {
  font-size: 24rpx;
  color: #d8ad6b;
}

.review-date {
  font-size: 22rpx;
  color: #9a8265;
}

.review-content {
  display: block;
  margin-top: 10rpx;
  font-size: 26rpx;
  line-height: 1.5;
  color: #4e637a;
}

.info-row {
  margin-bottom: 18rpx;
}

.info-label {
  font-size: 26rpx;
  font-weight: 700;
  color: #222;
}

.info-value {
  display: inline;
  font-size: 26rpx;
  color: #4e4e4e;
  margin-left: 12rpx;
  line-height: 1.6;
}

.bottom-img {
  margin-top: 22rpx;
  width: 100%;
  height: 260rpx;
  border-radius: 18rpx;
  overflow: hidden;
}

.related-section {
  margin-top: 28rpx;
}

.related-title {
  display: block;
  color: #222;
  font-size: 30rpx;
  font-weight: 800;
}

.related-card {
  margin-top: 16rpx;
  padding: 20rpx 22rpx;
  border-radius: 18rpx;
  background: #fff1e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
}

.related-copy {
  flex: 1;
  min-width: 0;
}

.related-card-title,
.related-card-desc {
  display: block;
}

.related-card-title {
  color: #8a5a2f;
  font-size: 28rpx;
  font-weight: 800;
}

.related-card-desc {
  margin-top: 6rpx;
  color: #a15f30;
  font-size: 23rpx;
  line-height: 1.4;
}

.related-arrow {
  color: #c58b55;
  font-size: 42rpx;
  margin-left: 16rpx;
}

.reserve-btn {
  position: fixed;
  left: 24rpx;
  right: 24rpx;
  bottom: calc(24rpx + env(safe-area-inset-bottom));
  height: 94rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #f7b500 0%, #f29c00 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34rpx;
  font-weight: 800;
  z-index: 20;
  box-shadow: 0 18rpx 40rpx rgba(242, 156, 0, 0.25);
}
</style>

