<template>
  <view class="page">
    <swiper class="hero-swiper" circular autoplay :interval="3800" :duration="600">
      <swiper-item v-for="(img, idx) in detail?.coverImages || [detail?.coverUrl]" :key="idx">
        <image class="hero-img" :src="img" mode="aspectFill" />
      </swiper-item>
    </swiper>

    <view class="top-actions">
      <view class="back-btn" @tap="goBack">
        <view class="back-icon" />
      </view>
      <view class="share-btn" @tap="onShare">
        <text class="share-icon">⤴</text>
      </view>
    </view>

    <scroll-view scroll-y class="content" v-if="detail">
      <view class="content-card">
        <view class="tags-row">
          <text class="tag" v-for="tag in detail.tags" :key="tag">{{ tag }}</text>
        </view>

        <text class="title">{{ detail.title }}</text>
        <text class="subtitle">{{ detail.subtitle }}</text>

        <view class="price-block">
          <text class="price-symbol">¥</text>
          <text class="price-value">{{ formatPrice(selectedPrice) }}</text>
          <text v-if="detail.originPrice > selectedPrice" class="price-origin">¥{{ formatPrice(detail.originPrice) }}</text>
        </view>

        <view class="specs-section" v-if="detail.specs.length > 1">
          <text class="section-label">选择规格</text>
          <view class="specs-list">
            <view
              class="spec-card"
              v-for="spec in detail.specs"
              :key="spec.id"
              :class="{ active: selectedSpecId === spec.id }"
              @tap="selectSpec(spec)"
            >
              <text class="spec-name">{{ spec.name }}</text>
              <view class="spec-price">
                <text class="spec-symbol">¥</text>
                <text class="spec-value">{{ formatPrice(spec.price) }}</text>
              </view>
              <view v-if="selectedSpecId === spec.id" class="spec-check">✓</view>
            </view>
          </view>
        </view>

        <view class="divider" />

        <view class="desc-section">
          <text class="section-label">商品描述</text>
          <text class="desc-text">{{ detail.description }}</text>
        </view>

        <view class="divider" />

        <view class="notice-section">
          <text class="section-label">购买须知</text>
          <view class="notice-list">
            <view class="notice-item" v-for="(line, idx) in noticeLines" :key="idx">
              <text class="notice-dot">·</text>
              <text class="notice-text">{{ line }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="bottom-bar" v-if="detail">
      <view class="bottom-price">
        <text class="bottom-symbol">¥</text>
        <text class="bottom-value">{{ formatPrice(selectedPrice) }}</text>
      </view>
      <view class="buy-btn" @tap="onBuy">
        <text>立即购买</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { fetchProductDetail } from '../../api/mall'

const detail = ref(null)
const selectedSpecId = ref(0)
const selectedPrice = computed(() => {
  if (!detail.value) return 0
  const spec = detail.value.specs.find((s) => s.id === selectedSpecId.value)
  return spec ? spec.price : detail.value.price
})

const noticeLines = computed(() => {
  if (!detail.value) return []
  return detail.value.notice.split('\n').filter(Boolean)
})

function formatPrice(priceInFen) {
  if (priceInFen === 0) return '0'
  const yuan = priceInFen / 100
  if (yuan % 1 === 0) return String(yuan)
  return yuan.toFixed(yuan < 10 ? 1 : 0)
}

function selectSpec(spec) {
  selectedSpecId.value = spec.id
}

function goBack() {
  uni.navigateBack()
}

function onShare() {
  uni.showToast({ title: '分享功能待开发', icon: 'none' })
}

function onBuy() {
  const spec = detail.value.specs.find((s) => s.id === selectedSpecId.value)
  uni.showToast({ title: `已选 ${spec?.name || detail.value.title}，下单待开发`, icon: 'none' })
}

onLoad(async (options) => {
  const id = Number(options?.id || 0)
  if (!id) {
    uni.showToast({ title: '商品不存在', icon: 'none' })
    return
  }
  try {
    detail.value = await fetchProductDetail(id)
    if (detail.value.specs.length > 0) {
      selectedSpecId.value = detail.value.specs[0].id
    }
  } catch {
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f6efe2;
  position: relative;
}

.hero-swiper {
  width: 100%;
  height: 520rpx;
}

.hero-img {
  width: 100%;
  height: 520rpx;
}

.top-actions {
  position: absolute;
  top: calc(var(--status-bar-height) + 16rpx);
  left: 24rpx;
  right: 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 10;
}

.back-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.28);
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  width: 18rpx;
  height: 18rpx;
  border-left: 4rpx solid #fff;
  border-bottom: 4rpx solid #fff;
  transform: rotate(45deg);
  margin-left: 6rpx;
}

.share-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.28);
  display: flex;
  align-items: center;
  justify-content: center;
}

.share-icon {
  font-size: 36rpx;
  color: #fff;
}

.content {
  flex: 1;
  min-height: calc(100vh - 520rpx);
  margin-top: -48rpx;
  position: relative;
  z-index: 5;
}

.content-card {
  background: #ffffff;
  border-radius: 40rpx 40rpx 0 0;
  padding: 28rpx 28rpx 200rpx;
  box-sizing: border-box;
  min-height: calc(100vh - 520rpx + 48rpx);
}

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.tag {
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
  background: #f1dfc1;
  color: #7b5529;
  font-size: 22rpx;
  font-weight: 700;
}

.title {
  display: block;
  margin-top: 18rpx;
  color: #222;
  font-size: 40rpx;
  font-weight: 800;
  line-height: 1.25;
}

.subtitle {
  display: block;
  margin-top: 10rpx;
  color: #9a8265;
  font-size: 26rpx;
}

.price-block {
  margin-top: 20rpx;
  display: flex;
  align-items: baseline;
}

.price-symbol {
  color: #a76524;
  font-size: 26rpx;
  font-weight: 800;
}

.price-value {
  color: #a76524;
  font-size: 48rpx;
  font-weight: 800;
}

.price-origin {
  margin-left: 12rpx;
  color: #c4b59a;
  font-size: 26rpx;
  text-decoration: line-through;
}

.specs-section {
  margin-top: 28rpx;
}

.section-label {
  display: block;
  color: #312416;
  font-size: 28rpx;
  font-weight: 800;
}

.specs-list {
  margin-top: 16rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
}

.spec-card {
  min-width: 180rpx;
  padding: 16rpx 20rpx;
  border: 2rpx solid #e8ddd0;
  border-radius: 16rpx;
  background: #fffaf4;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  position: relative;
  box-sizing: border-box;
}

.spec-card.active {
  border-color: #8b6138;
  background: #fff7ec;
}

.spec-name {
  font-size: 26rpx;
  color: #312416;
  font-weight: 700;
}

.spec-price {
  display: flex;
  align-items: baseline;
}

.spec-symbol {
  color: #a76524;
  font-size: 20rpx;
  font-weight: 800;
}

.spec-value {
  color: #a76524;
  font-size: 28rpx;
  font-weight: 800;
}

.spec-check {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 36rpx;
  height: 36rpx;
  border-radius: 16rpx 0 16rpx 0;
  background: #8b6138;
  color: #fff;
  font-size: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.divider {
  margin: 30rpx 0;
  height: 1rpx;
  background: #f0e6da;
}

.desc-text {
  display: block;
  margin-top: 14rpx;
  color: #5c4530;
  font-size: 26rpx;
  line-height: 1.8;
}

.notice-list {
  margin-top: 14rpx;
}

.notice-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12rpx;
}

.notice-dot {
  color: #a76524;
  font-size: 28rpx;
  font-weight: 700;
  flex-shrink: 0;
  width: 28rpx;
}

.notice-text {
  color: #5c4530;
  font-size: 26rpx;
  line-height: 1.6;
  flex: 1;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 116rpx;
  padding: 0 28rpx;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 238, 217, 0.98) 100%);
  border-top: 1rpx solid rgba(182, 138, 75, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  z-index: 20;
  box-shadow: 0 -10rpx 30rpx rgba(72, 50, 24, 0.08);
}

.bottom-price {
  display: flex;
  align-items: baseline;
}

.bottom-symbol {
  color: #a76524;
  font-size: 24rpx;
  font-weight: 800;
}

.bottom-value {
  color: #a76524;
  font-size: 40rpx;
  font-weight: 800;
}

.buy-btn {
  padding: 16rpx 52rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #8b6138 0%, #d8ad6b 100%);
  box-shadow: 0 10rpx 24rpx rgba(139, 97, 56, 0.22);
}

.buy-btn text {
  color: #fffaf0;
  font-size: 28rpx;
  font-weight: 800;
}
</style>
