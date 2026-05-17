<template>
  <view class="page">
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <view class="back-icon" />
      </view>
      <text class="nav-title">订单详情</text>
      <view class="nav-placeholder" />
    </view>

    <scroll-view scroll-y class="content" v-if="detail">
      <view class="status-card" :class="statusClass(detail.status)">
        <text class="status-icon">{{ statusIcon(detail.status) }}</text>
        <text class="status-title">{{ detail.statusText }}</text>
        <text v-if="detail.status === 'pendingPay'" class="status-hint">请在30分钟内完成支付</text>
        <text v-else-if="detail.status === 'pendingUse'" class="status-hint">出示二维码扫码入园</text>
        <text v-else class="status-hint">感谢您的游览</text>
      </view>

      <view class="qr-block" v-if="detail.status === 'pendingUse' && detail.qrCodeUrl">
        <image class="qr-image" :src="detail.qrCodeUrl" mode="aspectFill" />
        <text class="qr-hint">入园时请出示此二维码</text>
      </view>

      <view class="info-section">
        <text class="section-title">订单信息</text>
        <view class="info-row">
          <text class="info-label">订单编号</text>
          <text class="info-value">{{ detail.orderNo }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">创建时间</text>
          <text class="info-value">{{ detail.createdAt }}</text>
        </view>
        <view v-if="detail.payAt" class="info-row">
          <text class="info-label">支付时间</text>
          <text class="info-value">{{ detail.payAt }}</text>
        </view>
        <view v-if="detail.remark" class="info-row">
          <text class="info-label">备注</text>
          <text class="info-value">{{ detail.remark }}</text>
        </view>
      </view>

      <view class="info-section">
        <text class="section-title">商品明细</text>
        <view class="item-card" v-for="(item, idx) in detail.items" :key="idx">
          <image class="item-cover" :src="detail.coverUrl" mode="aspectFill" />
          <view class="item-info">
            <text class="item-title">{{ item.title }}</text>
            <text class="item-sku">{{ item.skuName }}</text>
          </view>
          <view class="item-right">
            <text class="item-price">¥{{ formatPrice(item.price) }}</text>
            <text class="item-qty">×{{ item.quantity }}</text>
          </view>
        </view>
      </view>

      <view class="amount-section">
        <view class="amount-row">
          <text class="amount-label">商品总额</text>
          <text class="amount-value">¥{{ formatPrice(totalAmount) }}</text>
        </view>
        <view class="amount-row">
          <text class="amount-label">优惠减免</text>
          <text class="amount-value discount" :class="{ 'no-coupon': !appliedCoupon }">
            {{ appliedCoupon ? `-¥${formatPrice(appliedCoupon.discountAmount)}` : '-¥0' }}
          </text>
        </view>
        <view v-if="appliedCoupon" class="amount-row coupon-detail">
          <text class="amount-label">{{ appliedCoupon.title }}</text>
          <text class="amount-value discount small">{{ appliedCoupon.subtitle }}</text>
        </view>
        <view
          v-if="detail.status === 'pendingPay' && !appliedCoupon && availableCoupons.length > 0"
          class="coupon-pick-row"
          @tap="couponPickerVisible = true"
        >
          <text class="coupon-pick-label">选择优惠券</text>
          <view class="coupon-pick-right">
            <text class="coupon-pick-hint">{{ availableCoupons.length }}张可用</text>
            <text class="coupon-pick-arrow">›</text>
          </view>
        </view>
        <view class="amount-row total">
          <text class="amount-label">实付金额</text>
          <text class="amount-value final">¥{{ formatPrice(finalPayAmount) }}</text>
        </view>
      </view>

      <view class="bottom-spacer" />
    </scroll-view>

    <view class="bottom-bar" v-if="detail">
      <template v-if="detail.status === 'pendingPay'">
        <view class="bottom-btn cancel" @tap="onCancel">
          <text>取消订单</text>
        </view>
        <view class="bottom-btn pay" @tap="onPay">
          <text>去支付</text>
        </view>
      </template>
      <template v-else-if="detail.status === 'pendingUse'">
        <view class="bottom-btn secondary full" @tap="onViewQr">
          <text>查看入园凭证</text>
        </view>
      </template>
    </view>

    <view class="pay-mask" v-if="payVisible" @tap="onPayCancel">
      <view class="pay-dialog" @tap.stop>
        <text class="pay-dialog-title">确认支付</text>
        <view class="pay-info">
          <text class="pay-label">支付金额</text>
          <view class="pay-amount-row">
            <text class="pay-symbol">¥</text>
            <text class="pay-value">{{ formatPrice(finalPayAmount) }}</text>
          </view>
        </view>
        <view class="pay-method">
          <text class="pay-method-label">支付方式</text>
          <view class="pay-method-item selected">
            <text>模拟支付</text>
            <text class="pay-check">✓</text>
          </view>
        </view>
        <view class="pay-dialog-actions">
          <view class="pay-dialog-btn cancel" @tap="onPayCancel">
            <text>取消</text>
          </view>
          <view class="pay-dialog-btn confirm" @tap="onPayConfirm">
            <text>确认支付 ¥{{ formatPrice(finalPayAmount) }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="pay-mask" v-if="couponPickerVisible" @tap="closeCouponPicker">
      <view class="pay-dialog" @tap.stop>
        <text class="pay-dialog-title">选择优惠券</text>
        <scroll-view scroll-y class="coupon-picker-list">
          <view v-if="availableCoupons.length === 0" class="coupon-empty">
            <text>暂无可使用优惠券</text>
          </view>
          <view
            v-for="c in availableCoupons"
            :key="c.id"
            class="coupon-option"
            :class="{ selected: selectedCouponId === c.id }"
            @tap="selectCoupon(c)"
          >
            <view class="coupon-option-left">
              <text class="coupon-option-title">{{ c.title }}</text>
              <text class="coupon-option-scope">{{ c.subtitle }}</text>
              <text class="coupon-option-date">有效期至 {{ c.validTo }}</text>
            </view>
            <view v-if="selectedCouponId === c.id" class="coupon-option-check">✓</view>
          </view>
        </scroll-view>
        <view class="pay-dialog-actions">
          <view class="pay-dialog-btn cancel" @tap="closeCouponPicker">
            <text>不使用优惠券</text>
          </view>
          <view class="pay-dialog-btn confirm" @tap="confirmCoupon">
            <text>确定</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { fetchOrderDetail, cancelOrder, mockPayOrder, getAvailableCouponsForOrder } from '../../api/mine'

const detail = ref(null)
const payVisible = ref(false)
const loading = ref(true)

const availableCoupons = ref([])
const couponPickerVisible = ref(false)
const selectedCouponId = ref(0)
const appliedCoupon = ref(null)

const totalAmount = computed(() => {
  if (!detail.value) return 0
  return detail.value.items.reduce((sum, it) => sum + it.price * it.quantity, 0)
})

const finalPayAmount = computed(() => {
  if (!detail.value) return 0
  return detail.value.payAmount - (appliedCoupon.value?.discountAmount || 0)
})

function formatPrice(priceInFen) {
  if (priceInFen === 0) return '0'
  const yuan = priceInFen / 100
  if (yuan % 1 === 0) return String(yuan)
  return yuan.toFixed(yuan < 10 ? 1 : 0)
}

function statusClass(status) {
  return `status-${status}`
}

function statusIcon(status) {
  if (status === 'pendingPay') return '⏳'
  if (status === 'pendingUse') return '✅'
  if (status === 'completed') return '🎉'
  if (status === 'cancelled') return '❌'
  return '📦'
}

function goBack() {
  uni.navigateBack()
}

function onPay() {
  payVisible.value = true
}

function onPayCancel() {
  payVisible.value = false
}

async function onPayConfirm() {
  payVisible.value = false
  uni.showLoading({ title: '支付中...' })
  try {
    await mockPayOrder(detail.value.id)
    detail.value = await fetchOrderDetail(detail.value.id)
    uni.hideLoading()
    uni.showToast({ title: '支付成功', icon: 'success' })
  } catch {
    uni.hideLoading()
    uni.showToast({ title: '支付失败', icon: 'none' })
  }
}

async function onCancel() {
  uni.showModal({
    title: '取消订单',
    content: '确定要取消该订单吗？',
    success: async (res) => {
      if (!res.confirm) return
      uni.showLoading({ title: '取消中...' })
      try {
        await cancelOrder(detail.value.id)
        detail.value = await fetchOrderDetail(detail.value.id)
        uni.hideLoading()
        uni.showToast({ title: '订单已取消', icon: 'none' })
      } catch {
        uni.hideLoading()
        uni.showToast({ title: '取消失败', icon: 'none' })
      }
    },
  })
}

function onViewQr() {
  uni.showToast({ title: '入园凭证展示中', icon: 'none' })
}

function selectCoupon(coupon) {
  selectedCouponId.value = coupon.id
}

function closeCouponPicker() {
  couponPickerVisible.value = false
  selectedCouponId.value = 0
}

function confirmCoupon() {
  if (selectedCouponId.value) {
    const coupon = availableCoupons.value.find((c) => c.id === selectedCouponId.value)
    if (coupon) {
      appliedCoupon.value = coupon
    }
  }
  couponPickerVisible.value = false
  selectedCouponId.value = 0
}

async function loadAvailableCoupons() {
  if (!detail.value || detail.value.status !== 'pendingPay') return
  const orderAmount = totalAmount.value + detail.value.couponDiscount
  const productType = 'ticket'
  try {
    availableCoupons.value = await getAvailableCouponsForOrder(orderAmount, productType)
  } catch {
    availableCoupons.value = []
  }
}

onLoad(async (options) => {
  const id = Number(options?.id || 0)
  if (!id) {
    uni.showToast({ title: '订单不存在', icon: 'none' })
    loading.value = false
    return
  }
  try {
    detail.value = await fetchOrderDetail(id)
    if (detail.value.couponDiscount > 0) {
      appliedCoupon.value = {
        title: detail.value.couponTitle,
        subtitle: '已使用',
        discountAmount: detail.value.couponDiscount,
      }
    }
    await loadAvailableCoupons()
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

.content {
  flex: 1;
  min-height: 0;
  padding: 20rpx 24rpx;
}

.status-card {
  padding: 32rpx;
  border-radius: 26rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.status-pendingPay {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
}

.status-pendingUse {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
}

.status-completed {
  background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
}

.status-cancelled {
  background: linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%);
}

.status-icon {
  font-size: 52rpx;
}

.status-title {
  margin-top: 10rpx;
  font-size: 34rpx;
  font-weight: 800;
  color: #312416;
}

.status-hint {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #9a8265;
}

.qr-block {
  margin-top: 22rpx;
  padding: 28rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.72);
  border-radius: 26rpx;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 16rpx 36rpx rgba(94, 68, 35, 0.08);
}

.qr-image {
  width: 280rpx;
  height: 280rpx;
  border-radius: 16rpx;
  background: #eee;
}

.qr-hint {
  margin-top: 16rpx;
  color: #9a8265;
  font-size: 24rpx;
}

.info-section {
  margin-top: 22rpx;
  padding: 24rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.72);
  border-radius: 26rpx;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 16rpx 36rpx rgba(94, 68, 35, 0.08);
}

.section-title {
  display: block;
  color: #312416;
  font-size: 28rpx;
  font-weight: 800;
  margin-bottom: 18rpx;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12rpx 0;
  border-bottom: 1rpx solid #f5efe4;
}

.info-row:last-child {
  border-bottom: 0;
}

.info-label {
  color: #9a8265;
  font-size: 26rpx;
}

.info-value {
  color: #312416;
  font-size: 26rpx;
  font-weight: 600;
  text-align: right;
  max-width: 360rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-card {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f5efe4;
}

.item-card:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.item-cover {
  width: 100rpx;
  height: 100rpx;
  border-radius: 14rpx;
  background: #eee;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  min-width: 0;
  margin-left: 18rpx;
}

.item-title {
  display: block;
  color: #312416;
  font-size: 26rpx;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-sku {
  display: block;
  margin-top: 4rpx;
  color: #9a8265;
  font-size: 22rpx;
}

.item-right {
  flex-shrink: 0;
  margin-left: 14rpx;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.item-price {
  color: #a76524;
  font-size: 26rpx;
  font-weight: 800;
}

.item-qty {
  margin-top: 4rpx;
  color: #9a8265;
  font-size: 22rpx;
}

.amount-section {
  margin-top: 22rpx;
  padding: 24rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.72);
  border-radius: 26rpx;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 16rpx 36rpx rgba(94, 68, 35, 0.08);
}

.amount-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10rpx 0;
}

.amount-row.total {
  margin-top: 10rpx;
  padding-top: 18rpx;
  border-top: 1rpx solid #f0e6da;
}

.amount-label {
  color: #9a8265;
  font-size: 26rpx;
}

.amount-value {
  color: #312416;
  font-size: 26rpx;
  font-weight: 600;
}

.amount-value.discount {
  color: #2e7d32;
}

.amount-value.discount.no-coupon {
  color: #c4b59a;
}

.amount-value.discount.small {
  font-size: 22rpx;
  font-weight: 400;
}

.amount-row.coupon-detail {
  padding: 4rpx 0 10rpx;
}

.coupon-pick-row {
  padding: 14rpx 0 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.coupon-pick-label {
  color: #6f451d;
  font-size: 26rpx;
  font-weight: 700;
}

.coupon-pick-right {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.coupon-pick-hint {
  color: #a76524;
  font-size: 24rpx;
  font-weight: 700;
}

.coupon-pick-arrow {
  color: #a76524;
  font-size: 32rpx;
  line-height: 1;
}

.coupon-picker-list {
  max-height: 540rpx;
  min-height: 100rpx;
}

.coupon-empty {
  height: 160rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #b4a38a;
  font-size: 26rpx;
}

.coupon-option {
  padding: 22rpx 20rpx;
  margin-bottom: 14rpx;
  border: 2rpx solid #e8ddd0;
  border-radius: 16rpx;
  background: #fffaf4;
  display: flex;
  align-items: center;
  position: relative;
}

.coupon-option.selected {
  border-color: #8b6138;
  background: #fff7ec;
}

.coupon-option-left {
  flex: 1;
  min-width: 0;
}

.coupon-option-title {
  display: block;
  color: #312416;
  font-size: 28rpx;
  font-weight: 800;
}

.coupon-option-scope {
  display: block;
  margin-top: 6rpx;
  color: #9a8265;
  font-size: 22rpx;
}

.coupon-option-date {
  display: block;
  margin-top: 4rpx;
  color: #c4b59a;
  font-size: 20rpx;
}

.coupon-option-check {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: #8b6138;
  color: #fff;
  font-size: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.amount-value.final {
  color: #a76524;
  font-size: 32rpx;
  font-weight: 800;
}

.bottom-spacer {
  height: 140rpx;
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
  justify-content: flex-end;
  gap: 18rpx;
  box-sizing: border-box;
  z-index: 20;
  box-shadow: 0 -10rpx 30rpx rgba(72, 50, 24, 0.08);
}

.bottom-btn {
  padding: 16rpx 40rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bottom-btn text {
  font-size: 28rpx;
  font-weight: 800;
}

.bottom-btn.cancel {
  background: #f5efe4;
}

.bottom-btn.cancel text {
  color: #7b5529;
}

.bottom-btn.pay {
  background: linear-gradient(135deg, #8b6138 0%, #d8ad6b 100%);
  box-shadow: 0 10rpx 24rpx rgba(139, 97, 56, 0.22);
}

.bottom-btn.pay text {
  color: #fffaf0;
}

.bottom-btn.secondary {
  background: linear-gradient(135deg, #8b6138 0%, #d8ad6b 100%);
  box-shadow: 0 10rpx 24rpx rgba(139, 97, 56, 0.22);
}

.bottom-btn.secondary text {
  color: #fffaf0;
}

.bottom-btn.full {
  flex: 1;
}

.pay-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 100;
}

.pay-dialog {
  width: 100%;
  padding: 36rpx 28rpx 56rpx;
  background: #fff;
  border-radius: 36rpx 36rpx 0 0;
  box-sizing: border-box;
}

.pay-dialog-title {
  display: block;
  text-align: center;
  font-size: 32rpx;
  font-weight: 800;
  color: #312416;
  margin-bottom: 28rpx;
}

.pay-info {
  padding: 24rpx;
  background: #fff8ed;
  border-radius: 18rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pay-label {
  font-size: 24rpx;
  color: #9a8265;
}

.pay-amount-row {
  margin-top: 8rpx;
  display: flex;
  align-items: baseline;
}

.pay-symbol {
  color: #a76524;
  font-size: 28rpx;
  font-weight: 800;
}

.pay-value {
  color: #a76524;
  font-size: 52rpx;
  font-weight: 800;
}

.pay-method {
  margin-top: 28rpx;
}

.pay-method-label {
  font-size: 26rpx;
  color: #9a8265;
  display: block;
  margin-bottom: 14rpx;
}

.pay-method-item {
  padding: 20rpx 24rpx;
  border: 2rpx solid #8b6138;
  border-radius: 16rpx;
  background: #fff7ec;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 26rpx;
  font-weight: 700;
  color: #6f451d;
}

.pay-check {
  color: #8b6138;
  font-size: 28rpx;
}

.pay-dialog-actions {
  margin-top: 32rpx;
  display: flex;
  gap: 18rpx;
}

.pay-dialog-btn {
  flex: 1;
  padding: 22rpx 0;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pay-dialog-btn text {
  font-size: 28rpx;
  font-weight: 800;
}

.pay-dialog-btn.cancel {
  background: #f5efe4;
}

.pay-dialog-btn.cancel text {
  color: #7b5529;
}

.pay-dialog-btn.confirm {
  background: linear-gradient(135deg, #8b6138 0%, #d8ad6b 100%);
  box-shadow: 0 10rpx 24rpx rgba(139, 97, 56, 0.22);
}

.pay-dialog-btn.confirm text {
  color: #fffaf0;
}
</style>
