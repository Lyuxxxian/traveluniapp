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

        <view class="info">
          <view class="info-row">
            <text class="info-label">活动地点：</text>
            <text class="info-value">{{ post?.place }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">参与方式：</text>
            <text class="info-value">{{ post?.joinWay }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">活动时长：</text>
            <text class="info-value">{{ post?.durationText }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">活动内容：</text>
            <text class="info-value">{{ post?.contentText }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">活动意义：</text>
            <text class="info-value">{{ post?.meaningText }}</text>
          </view>
        </view>

        <image v-if="post?.detailImageUrl" class="bottom-img" :src="post.detailImageUrl" mode="aspectFill" />
      </view>
    </scroll-view>

    <view class="reserve-btn" @tap="onReserve">立即预约</view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { fetchDiscoverPostDetail } from '../../api/discover'

const post = ref(null)
const activeSegment = ref('detail')

function goBack() {
  uni.navigateBack({ delta: 1 })
}

function onShare() {
  uni.showToast({ title: '分享功能待开发', icon: 'none' })
}

function onNavigate() {
  uni.showToast({ title: '导航功能待开发', icon: 'none' })
}

function onReserve() {
  uni.showToast({ title: '预约成功', icon: 'success' })
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
  top: 44rpx;
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

