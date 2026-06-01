<template>
  <view class="page">
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <view class="back-icon" />
      </view>
      <text class="nav-title">帮助中心</text>
      <view class="nav-placeholder" />
    </view>

    <scroll-view scroll-y class="body">
      <view v-if="loading" class="center-state">
        <text>加载中...</text>
      </view>

      <template v-else>
        <view class="phone-card">
          <text class="phone-label">景区客服</text>
          <text class="phone-hours">{{ config.serviceHours }}</text>
          <view class="phone-row">
            <text class="phone-number">{{ config.servicePhone }}</text>
            <view class="phone-btn" @tap="callService">拨打</view>
          </view>
          <text v-if="config.servicePhoneRemark" class="phone-remark">{{ config.servicePhoneRemark }}</text>
        </view>

        <view class="action-row">
          <view class="action-chip" @tap="goTicketCreate">提交工单</view>
          <view class="action-chip outline" @tap="goTicketList">我的工单</view>
        </view>

        <text class="section-title">常见问题</text>
        <view v-if="!faqs.length" class="center-state small">
          <text>暂无 FAQ</text>
        </view>

        <view
          v-for="item in faqs"
          :key="item.id"
          class="faq-card"
          @tap="onFaqTap(item)"
        >
          <view class="faq-head">
            <text class="faq-q">{{ item.question }}</text>
            <text class="faq-arrow">{{ expandedId === item.id ? '▾' : '›' }}</text>
          </view>
          <text v-if="item.type === 'human'" class="faq-human-hint">点击提交工单，由人工客服跟进</text>
          <text
            v-else-if="expandedId === item.id && item.answer"
            class="faq-a"
          >{{ item.answer }}</text>
        </view>
      </template>
    </scroll-view>
  </view>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { fetchFaqs, fetchServiceConfig } from '../../api/service'
import { isLoggedIn } from '../../utils/auth'

const loading = ref(true)
const faqs = ref([])
const expandedId = ref(null)
const config = ref({
  servicePhone: '0510-85933333',
  serviceHours: '每日 08:30–17:00',
  servicePhoneRemark: '',
})

function goBack() {
  uni.navigateBack()
}

function callService() {
  const phone = config.value.servicePhone
  if (!phone) {
    uni.showToast({ title: '暂无客服电话', icon: 'none' })
    return
  }
  uni.makePhoneCall({ phoneNumber: phone.replace(/[^\d-]/g, '') })
}

function goTicketCreate() {
  if (!isLoggedIn()) {
    uni.navigateTo({ url: '/pages/login/login' })
    return
  }
  uni.navigateTo({ url: '/pages/service/ticketCreate' })
}

function goTicketList() {
  if (!isLoggedIn()) {
    uni.navigateTo({ url: '/pages/login/login' })
    return
  }
  uni.navigateTo({ url: '/pages/service/ticketList' })
}

function onFaqTap(item) {
  if (item.type === 'human') {
    goTicketCreate()
    return
  }
  expandedId.value = expandedId.value === item.id ? null : item.id
}

onMounted(async () => {
  try {
    const [faqList, cfg] = await Promise.all([fetchFaqs(), fetchServiceConfig()])
    faqs.value = faqList
    if (cfg) config.value = cfg
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
  padding: 20rpx 24rpx 40rpx;
  box-sizing: border-box;
}

.center-state {
  min-height: 400rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9a8265;
  font-size: 28rpx;
}

.center-state.small {
  min-height: 120rpx;
}

.phone-card {
  padding: 28rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 12rpx 32rpx rgba(94, 68, 35, 0.08);
}

.phone-label {
  font-size: 30rpx;
  font-weight: 800;
  color: #312416;
}

.phone-hours {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #9a8265;
}

.phone-row {
  margin-top: 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.phone-number {
  font-size: 36rpx;
  font-weight: 800;
  color: #6f451d;
}

.phone-btn {
  padding: 14rpx 32rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #8b6138, #d8ad6b);
  color: #fff;
  font-size: 26rpx;
  font-weight: 700;
}

.phone-remark {
  display: block;
  margin-top: 12rpx;
  font-size: 22rpx;
  color: #9a8265;
}

.action-row {
  display: flex;
  gap: 16rpx;
  margin: 24rpx 0;
}

.action-chip {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  border-radius: 16rpx;
  background: #8b6138;
  color: #fff;
  font-size: 26rpx;
  font-weight: 700;
}

.action-chip.outline {
  background: rgba(255, 255, 255, 0.88);
  color: #6f451d;
  border: 1rpx solid rgba(139, 97, 56, 0.35);
}

.section-title {
  display: block;
  margin-bottom: 16rpx;
  font-size: 28rpx;
  font-weight: 800;
  color: #6f451d;
}

.faq-card {
  margin-bottom: 16rpx;
  padding: 24rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.9);
}

.faq-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.faq-q {
  flex: 1;
  font-size: 28rpx;
  font-weight: 700;
  color: #312416;
}

.faq-arrow {
  color: #9a8265;
  font-size: 28rpx;
}

.faq-a {
  display: block;
  margin-top: 16rpx;
  font-size: 26rpx;
  line-height: 1.6;
  color: #5c4a32;
}

.faq-human-hint {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #8b6138;
}
</style>
