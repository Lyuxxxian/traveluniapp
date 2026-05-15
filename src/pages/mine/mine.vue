<template>
  <TabBar activeTab="mine" :showTabbar="true">
    <view class="page">
      <view v-if="!loggedIn" class="login-panel">
        <view class="login-logo-wrap">
          <image class="login-logo" src="/static/logo.png" mode="aspectFill" />
        </view>
        <text class="login-title">您还未登录</text>
        <text class="login-desc">登录后可查看订单、优惠券、购物车与个人资料。</text>
        <button class="login-btn" hover-class="login-btn-hover" @tap="goLogin">点击登录</button>
      </view>

      <template v-else>
      <view class="profile-header">
        <view class="ink ink-left" />
        <view class="ink ink-right" />
        <view class="profile-card">
          <image class="avatar" :src="avatarUrl" mode="aspectFill" @tap="goProfileEdit" />
          <view class="profile-copy">
            <text class="profile-label">{{ profileLoading ? '资料同步中' : '昵称' }}</text>
            <text class="username">{{ displayName }}</text>
          </view>
          <button class="logout-btn" hover-class="logout-btn-hover" @tap="logout">退出登录</button>
        </view>
      </view>

      <view class="section order-section">
        <view class="section-head">
          <text class="section-title">我的订单</text>
          <view class="section-link" @tap="goOrderList('all')">
            <text>查看全部</text>
            <text class="arrow">›</text>
          </view>
        </view>

        <view class="order-row">
          <view class="order-item" v-for="item in orderItems" :key="item.key" @tap="goOrderList(item.key)">
            <view class="order-icon" :class="item.iconClass" />
            <text class="order-label">{{ item.label }}</text>
          </view>
        </view>
      </view>

      <view class="section feature-section">
        <view class="section-head">
          <text class="section-title">常用功能</text>
        </view>

        <view class="feature-list">
          <view class="feature-item" v-for="item in functionItems" :key="item.key" @tap="goFunction(item.key)">
            <view class="feature-icon" :class="item.iconClass" />
            <view class="feature-copy">
              <text class="feature-title">{{ item.label }}</text>
              <text class="feature-desc">{{ item.desc }}</text>
            </view>
            <text class="feature-arrow">›</text>
          </view>
        </view>
      </view>
      </template>
    </view>
  </TabBar>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import TabBar from '../../components/TabBar.vue'
import { fetchUserProfile } from '../../api/user'
import { clearAuth, getDisplayName, getUserProfile, isLoggedIn } from '../../utils/auth'

const loggedIn = ref(false)
const userProfile = ref(null)
const profileLoading = ref(false)
const displayName = computed(() => getDisplayName(userProfile.value))
const avatarUrl = computed(() => userProfile.value?.avatarUrl || '/static/logo.png')

const orderItems = [
  { key: 'all', label: '全部订单', iconClass: 'icon-order-all' },
  { key: 'pendingPay', label: '待付款', iconClass: 'icon-order-pay' },
  { key: 'pendingUse', label: '待使用', iconClass: 'icon-order-use' },
  { key: 'completed', label: '已完成', iconClass: 'icon-order-done' },
]

const functionItems = [
  {
    key: 'commonInfo',
    label: '常用信息',
    desc: '录入游客姓名、身份证号，购买成人票及半价票时快速填充。',
    iconClass: 'icon-feature-info',
  },
  {
    key: 'address',
    label: '收货人管理',
    desc: '管理灵山禅茶、文创实物商品的快递地址。',
    iconClass: 'icon-feature-address',
  },
  {
    key: 'reviews',
    label: '我的点评',
    desc: '查看自己对祥符禅寺、灵山梵宫等景点的评价历史。',
    iconClass: 'icon-feature-review',
  },
  {
    key: 'coupons',
    label: '优惠券',
    desc: '个人账户内已领取的卡券包。',
    iconClass: 'icon-feature-coupon',
  },
  {
    key: 'feedback',
    label: '意见反馈',
    desc: '表单页面，支持上传图片，用于向景区反馈游览问题。',
    iconClass: 'icon-feature-feedback',
  },
  {
    key: 'service',
    label: '联系客服',
    desc: '跳转至智能客服界面。',
    iconClass: 'icon-feature-service',
  },
  {
    key: 'settings',
    label: '设置',
    desc: '修改个人资料、清除缓存、退出登录。',
    iconClass: 'icon-feature-settings',
  },
  {
    key: 'cart',
    label: '购物车',
    desc: '集中存放待购买的灵山文创、茶叶及祈福挂件等。',
    iconClass: 'icon-feature-cart',
  },
  {
    key: 'survey',
    label: '调查问卷',
    desc: '景区满意度调研，完成后可随机赠送积功德星或小额优惠券。',
    iconClass: 'icon-feature-survey',
  },
]

onShow(() => {
  refreshLoginState()
})

function goLogin() {
  uni.navigateTo({ url: '/pages/login/login' })
}

function goProfileEdit() {
  uni.navigateTo({ url: '/pages/mine/profileEdit' })
}

function refreshLoginState() {
  loggedIn.value = isLoggedIn()
  userProfile.value = getUserProfile()

  if (loggedIn.value) {
    loadLatestUserProfile()
  }
}

async function loadLatestUserProfile() {
  if (profileLoading.value) return

  profileLoading.value = true
  try {
    userProfile.value = await fetchUserProfile({ silent: true })
  } catch (error) {
    // 资料接口不可用时保留本地缓存，避免“我的”页空白。
    userProfile.value = getUserProfile()
  } finally {
    profileLoading.value = false
  }
}

function logout() {
  clearAuth()
  refreshLoginState()
  uni.showToast({ title: '已退出登录', icon: 'none' })
}

function goOrderList(status) {
  uni.showToast({ title: `${status}订单页面待开发`, icon: 'none' })
}

function goFunction(key) {
  uni.showToast({ title: `${key}页面待开发`, icon: 'none' })
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 28rpx 24rpx 160rpx;
  box-sizing: border-box;
  background:
    radial-gradient(circle at 14% 0%, rgba(225, 197, 145, 0.34), rgba(225, 197, 145, 0) 34%),
    linear-gradient(180deg, #f6efe2 0%, #f4f5ef 44%, #f7f1e7 100%);
}

.login-panel {
  min-height: 560rpx;
  padding: 72rpx 42rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.72);
  border-radius: 36rpx;
  background:
    radial-gradient(circle at 82% 22%, rgba(255, 255, 255, 0.78), rgba(255, 255, 255, 0) 34%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.86) 0%, rgba(244, 229, 201, 0.8) 100%);
  box-shadow: 0 22rpx 48rpx rgba(92, 64, 31, 0.13);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.login-logo-wrap {
  width: 150rpx;
  height: 150rpx;
  border-radius: 50%;
  background: #fff8ed;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 14rpx 30rpx rgba(84, 58, 28, 0.16);
}

.login-logo {
  width: 116rpx;
  height: 116rpx;
  border-radius: 50%;
}

.login-title,
.login-desc {
  display: block;
  text-align: center;
}

.login-title {
  margin-top: 32rpx;
  color: #332619;
  font-size: 38rpx;
  font-weight: 800;
}

.login-desc {
  max-width: 520rpx;
  margin-top: 16rpx;
  color: #8d775d;
  font-size: 25rpx;
  line-height: 1.5;
}

.login-btn {
  width: 360rpx;
  height: 82rpx;
  line-height: 82rpx;
  margin-top: 44rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #8b6138 0%, #d8ad6b 100%);
  color: #fffaf0;
  font-size: 28rpx;
  font-weight: 800;
  box-shadow: 0 14rpx 28rpx rgba(139, 97, 56, 0.22);
}

.login-btn::after {
  border: 0;
}

.login-btn-hover {
  opacity: 0.9;
}

.profile-header {
  position: relative;
  min-height: 270rpx;
  border-radius: 36rpx;
  overflow: hidden;
  background:
    radial-gradient(circle at 82% 28%, rgba(255, 255, 255, 0.68), rgba(255, 255, 255, 0) 30%),
    linear-gradient(135deg, #efe4ce 0%, #d8c29c 100%);
  box-shadow: 0 22rpx 48rpx rgba(92, 64, 31, 0.13);
}

.profile-header::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(120deg, rgba(255, 255, 255, 0.42), rgba(255, 255, 255, 0)),
    radial-gradient(circle at 36% 100%, rgba(122, 91, 52, 0.12), rgba(122, 91, 52, 0) 28%);
}

.ink {
  position: absolute;
  border-radius: 50%;
  filter: blur(2rpx);
  opacity: 0.26;
}

.ink-left {
  left: -70rpx;
  bottom: -92rpx;
  width: 240rpx;
  height: 190rpx;
  background: #8f7a56;
}

.ink-right {
  right: -80rpx;
  top: -70rpx;
  width: 270rpx;
  height: 220rpx;
  background: #c8a869;
}

.profile-card {
  position: relative;
  z-index: 1;
  min-height: 270rpx;
  padding: 46rpx 42rpx;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}

.avatar {
  width: 132rpx;
  height: 132rpx;
  border: 8rpx solid rgba(255, 255, 255, 0.86);
  border-radius: 50%;
  background: #fff8ed;
  box-shadow: 0 14rpx 30rpx rgba(84, 58, 28, 0.18);
  flex-shrink: 0;
}

.profile-copy {
  margin-left: 28rpx;
  min-width: 0;
  flex: 1;
}

.profile-label,
.username {
  display: block;
}

.profile-label {
  color: #8c6c43;
  font-size: 24rpx;
  font-weight: 700;
}

.username {
  margin-top: 12rpx;
  color: #3d2d1b;
  font-size: 38rpx;
  font-weight: 800;
  line-height: 1.2;
}

.logout-btn {
  flex-shrink: 0;
  height: 58rpx;
  line-height: 58rpx;
  margin: 0;
  padding: 0 20rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.7);
  color: #8b5a24;
  font-size: 22rpx;
  font-weight: 800;
}

.logout-btn::after {
  border: 0;
}

.logout-btn-hover {
  opacity: 0.86;
}

.section {
  margin-top: 24rpx;
  padding: 30rpx 26rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.72);
  border-radius: 30rpx;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 18rpx 42rpx rgba(94, 68, 35, 0.1);
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  color: #312416;
  font-size: 34rpx;
  font-weight: 800;
}

.section-link {
  display: flex;
  align-items: center;
  color: #8b6a3f;
  font-size: 24rpx;
  font-weight: 700;
}

.arrow,
.feature-arrow {
  margin-left: 6rpx;
  font-size: 34rpx;
  line-height: 1;
}

.order-row {
  margin-top: 28rpx;
  display: flex;
  justify-content: space-between;
}

.order-item {
  width: 25%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.order-icon {
  width: 76rpx;
  height: 76rpx;
  border-radius: 50%;
  background: linear-gradient(160deg, #fff4d9 0%, #dca85d 100%);
  color: #684018;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 10rpx 22rpx rgba(161, 107, 42, 0.18);
}

.order-icon::before,
.order-icon::after,
.feature-icon::before,
.feature-icon::after {
  content: '';
  position: absolute;
  box-sizing: border-box;
}

.icon-order-all::before {
  width: 34rpx;
  height: 42rpx;
  border: 4rpx solid #754a1f;
  border-radius: 8rpx;
  background: rgba(255, 255, 255, 0.22);
}

.icon-order-all::after {
  width: 20rpx;
  height: 4rpx;
  border-radius: 999rpx;
  background: #754a1f;
  box-shadow: 0 12rpx 0 #754a1f;
}

.icon-order-pay::before {
  width: 40rpx;
  height: 30rpx;
  border: 4rpx solid #754a1f;
  border-radius: 8rpx;
}

.icon-order-pay::after {
  right: 18rpx;
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #754a1f;
}

.icon-order-use::before {
  width: 42rpx;
  height: 30rpx;
  border: 4rpx solid #754a1f;
  border-radius: 8rpx;
}

.icon-order-use::after {
  width: 6rpx;
  height: 38rpx;
  border-radius: 999rpx;
  background: #754a1f;
  transform: rotate(90deg);
  box-shadow: 0 0 0 8rpx rgba(117, 74, 31, 0.12);
}

.icon-order-done::before {
  width: 40rpx;
  height: 40rpx;
  border: 4rpx solid #754a1f;
  border-radius: 50%;
}

.icon-order-done::after {
  width: 24rpx;
  height: 14rpx;
  border-left: 5rpx solid #754a1f;
  border-bottom: 5rpx solid #754a1f;
  transform: rotate(-45deg) translate(1rpx, -2rpx);
}

.order-label {
  display: block;
}

.order-label {
  margin-top: 14rpx;
  color: #3d3021;
  font-size: 25rpx;
  font-weight: 700;
}

.feature-section {
  padding-bottom: 12rpx;
}

.feature-list {
  margin-top: 18rpx;
}

.feature-item {
  min-height: 112rpx;
  padding: 20rpx 0;
  border-top: 1rpx solid rgba(132, 105, 69, 0.12);
  display: flex;
  align-items: center;
}

.feature-item:first-child {
  border-top: 0;
}

.feature-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 20rpx;
  background: #f5ead6;
  color: #8a5b25;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
}

.icon-feature-info::before {
  width: 30rpx;
  height: 38rpx;
  border: 4rpx solid #8a5b25;
  border-radius: 8rpx;
}

.icon-feature-info::after {
  top: 20rpx;
  width: 16rpx;
  height: 4rpx;
  border-radius: 999rpx;
  background: #8a5b25;
  box-shadow: 0 10rpx 0 #8a5b25;
}

.icon-feature-address::before {
  width: 34rpx;
  height: 28rpx;
  border: 4rpx solid #8a5b25;
  border-radius: 6rpx;
  transform: translateY(6rpx);
}

.icon-feature-address::after {
  top: 14rpx;
  width: 22rpx;
  height: 22rpx;
  border-left: 4rpx solid #8a5b25;
  border-top: 4rpx solid #8a5b25;
  transform: rotate(45deg);
}

.icon-feature-review::before {
  width: 38rpx;
  height: 30rpx;
  border: 4rpx solid #8a5b25;
  border-radius: 10rpx;
}

.icon-feature-review::after {
  left: 18rpx;
  bottom: 14rpx;
  width: 14rpx;
  height: 14rpx;
  border-left: 4rpx solid #8a5b25;
  border-bottom: 4rpx solid #8a5b25;
  transform: rotate(-18deg);
}

.icon-feature-coupon::before {
  width: 42rpx;
  height: 28rpx;
  border: 4rpx solid #8a5b25;
  border-radius: 8rpx;
}

.icon-feature-coupon::after {
  width: 4rpx;
  height: 28rpx;
  border-radius: 999rpx;
  background: #8a5b25;
  opacity: 0.8;
}

.icon-feature-feedback::before {
  width: 36rpx;
  height: 28rpx;
  border: 4rpx solid #8a5b25;
  border-radius: 8rpx;
}

.icon-feature-feedback::after {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: #8a5b25;
  box-shadow: -12rpx 0 0 #8a5b25, 12rpx 0 0 #8a5b25;
}

.icon-feature-service::before {
  width: 38rpx;
  height: 30rpx;
  border: 4rpx solid #8a5b25;
  border-radius: 18rpx 18rpx 10rpx 10rpx;
}

.icon-feature-service::after {
  bottom: 17rpx;
  width: 50rpx;
  height: 16rpx;
  border-left: 4rpx solid #8a5b25;
  border-right: 4rpx solid #8a5b25;
}

.icon-feature-settings::before {
  width: 36rpx;
  height: 36rpx;
  border: 6rpx solid #8a5b25;
  border-radius: 50%;
  box-shadow: 0 -15rpx 0 -10rpx #8a5b25, 0 15rpx 0 -10rpx #8a5b25, 15rpx 0 0 -10rpx #8a5b25,
    -15rpx 0 0 -10rpx #8a5b25;
}

.icon-feature-cart::before {
  width: 38rpx;
  height: 26rpx;
  border: 4rpx solid #8a5b25;
  border-top: 0;
  border-radius: 0 0 8rpx 8rpx;
  transform: translateY(-2rpx);
}

.icon-feature-cart::after {
  bottom: 14rpx;
  width: 7rpx;
  height: 7rpx;
  border-radius: 50%;
  background: #8a5b25;
  box-shadow: 22rpx 0 0 #8a5b25;
}

.icon-feature-survey::before {
  width: 34rpx;
  height: 42rpx;
  border: 4rpx solid #8a5b25;
  border-radius: 8rpx;
}

.icon-feature-survey::after {
  top: 20rpx;
  width: 18rpx;
  height: 4rpx;
  border-radius: 999rpx;
  background: #8a5b25;
  box-shadow: 0 11rpx 0 #8a5b25, 0 22rpx 0 #8a5b25;
}

.feature-copy {
  min-width: 0;
  flex: 1;
  margin-left: 18rpx;
}

.feature-title,
.feature-desc {
  display: block;
}

.feature-title {
  color: #332619;
  font-size: 28rpx;
  font-weight: 800;
}

.feature-desc {
  margin-top: 8rpx;
  color: #89745f;
  font-size: 22rpx;
  line-height: 1.42;
}

.feature-arrow {
  color: #b09a7d;
  flex-shrink: 0;
}
</style>
