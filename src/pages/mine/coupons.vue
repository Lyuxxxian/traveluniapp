<template>
  <view class="page">
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <view class="back-icon" />
      </view>
      <text class="nav-title">我的优惠券</text>
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

    <scroll-view scroll-y class="coupon-list">
      <view v-if="loading" class="loading-state">
        <text class="loading-text">加载中...</text>
      </view>

      <template v-else>
        <view v-if="filteredList.length === 0" class="empty-state">
          <text class="empty-text">暂无优惠券</text>
        </view>

        <view
          class="coupon-card"
          v-for="item in filteredList"
          :key="item.id"
          :class="{ used: item.status !== 'available' }"
        >
          <view class="coupon-left">
            <text class="coupon-amount">
              <text class="coupon-symbol">¥</text>
              <text class="coupon-value">{{ formatPrice(item.discountAmount) }}</text>
            </text>
            <text class="coupon-condition">满{{ formatPrice(item.minAmount) }}可用</text>
          </view>
          <view class="coupon-divider" />
          <view class="coupon-right">
            <text class="coupon-title">{{ item.title }}</text>
            <text class="coupon-scope">{{ item.subtitle }}</text>
            <text class="coupon-date">{{ item.validFrom }} ~ {{ item.validTo }}</text>
          </view>
          <view v-if="item.status === 'used'" class="coupon-stamp">
            <text>已使用</text>
          </view>
          <view v-else-if="item.status === 'expired'" class="coupon-stamp expired">
            <text>已过期</text>
          </view>
        </view>
      </template>
    </scroll-view>
  </view>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { fetchMyCoupons } from '../../api/mine'

const activeTab = ref('available')
const couponList = ref([])
const loading = ref(true)

const tabs = [
  { key: 'available', label: '可使用' },
  { key: 'used', label: '已使用' },
  { key: 'expired', label: '已过期' },
]

const filteredList = computed(() => {
  if (activeTab.value === 'available') return couponList.value.filter((c) => c.status === 'available')
  if (activeTab.value === 'used') return couponList.value.filter((c) => c.status === 'used')
  return couponList.value.filter((c) => c.status === 'expired')
})

function formatPrice(priceInFen) {
  if (priceInFen === 0) return '0'
  const yuan = priceInFen / 100
  if (yuan % 1 === 0) return String(yuan)
  return yuan.toFixed(yuan < 10 ? 1 : 0)
}

function switchTab(key) {
  activeTab.value = key
}

function goBack() {
  uni.navigateBack()
}

onMounted(async () => {
  try {
    couponList.value = await fetchMyCoupons()
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
  padding: 0;
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

.coupon-list {
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

.loading-text,
.empty-text {
  color: #9a8265;
  font-size: 26rpx;
}

.coupon-card {
  margin-bottom: 18rpx;
  padding: 24rpx 20rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.72);
  border-radius: 26rpx;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 16rpx 36rpx rgba(94, 68, 35, 0.08);
  display: flex;
  align-items: center;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}

.coupon-card.used {
  opacity: 0.55;
}

.coupon-left {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-right: 20rpx;
}

.coupon-amount {
  display: flex;
  align-items: baseline;
}

.coupon-symbol {
  color: #a76524;
  font-size: 28rpx;
  font-weight: 800;
}

.coupon-value {
  color: #a76524;
  font-size: 52rpx;
  font-weight: 800;
}

.coupon-condition {
  margin-top: 4rpx;
  color: #9a8265;
  font-size: 22rpx;
}

.coupon-divider {
  width: 2rpx;
  height: 80rpx;
  background: repeating-linear-gradient(
    180deg,
    #dccba4 0,
    #dccba4 6rpx,
    transparent 6rpx,
    transparent 14rpx
  );
  flex-shrink: 0;
}

.coupon-right {
  flex: 1;
  min-width: 0;
  margin-left: 20rpx;
  display: flex;
  flex-direction: column;
}

.coupon-title {
  color: #312416;
  font-size: 28rpx;
  font-weight: 800;
}

.coupon-scope {
  margin-top: 8rpx;
  color: #9a8265;
  font-size: 22rpx;
}

.coupon-date {
  margin-top: 6rpx;
  color: #c4b59a;
  font-size: 20rpx;
}

.coupon-stamp {
  position: absolute;
  right: 16rpx;
  top: 16rpx;
  width: 90rpx;
  height: 90rpx;
  border: 4rpx solid #c4b59a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(15deg);
  opacity: 0.6;
}

.coupon-stamp text {
  color: #c4b59a;
  font-size: 22rpx;
  font-weight: 800;
}

.coupon-stamp.expired {
  border-color: #d4a08a;
}

.coupon-stamp.expired text {
  color: #d4a08a;
}
</style>
