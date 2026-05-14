<template>
  <TabBar activeTab="mine" :showTabbar="true">
    <view class="page">
      <view class="profile-header">
        <view class="ink ink-left" />
        <view class="ink ink-right" />
        <view class="profile-card">
          <image class="avatar" src="/static/logo.png" mode="aspectFill" />
          <view class="profile-copy">
            <text class="profile-label">游客 ID</text>
            <text class="username">{{ userName }}</text>
          </view>
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
            <view class="order-icon">{{ item.icon }}</view>
            <text class="order-label">{{ item.label }}</text>
            <text class="order-desc">{{ item.desc }}</text>
          </view>
        </view>
      </view>

      <view class="section feature-section">
        <view class="section-head">
          <text class="section-title">常用功能</text>
        </view>

        <view class="feature-list">
          <view class="feature-item" v-for="item in functionItems" :key="item.key" @tap="goFunction(item.key)">
            <view class="feature-icon">{{ item.icon }}</view>
            <view class="feature-copy">
              <text class="feature-title">{{ item.label }}</text>
              <text class="feature-desc">{{ item.desc }}</text>
            </view>
            <text class="feature-arrow">›</text>
          </view>
        </view>
      </view>
    </view>
  </TabBar>
</template>

<script setup>
import { ref } from 'vue'
import TabBar from '../../components/TabBar.vue'

const userName = ref('灵山居士_12345')

const orderItems = [
  { key: 'all', label: '全部订单', desc: '历史记录', icon: '全' },
  { key: 'pendingPay', label: '待付款', desc: '暂存订单', icon: '付' },
  { key: 'pendingUse', label: '待使用', desc: '券码核销', icon: '用' },
  { key: 'completed', label: '已完成', desc: '行程结束', icon: '完' },
]

const functionItems = [
  {
    key: 'commonInfo',
    label: '常用信息',
    desc: '录入游客姓名、身份证号，购买成人票及半价票时快速填充。',
    icon: '信',
  },
  {
    key: 'address',
    label: '收货人管理',
    desc: '管理灵山禅茶、文创实物商品的快递地址。',
    icon: '收',
  },
  {
    key: 'reviews',
    label: '我的点评',
    desc: '查看自己对祥符禅寺、灵山梵宫等景点的评价历史。',
    icon: '评',
  },
  {
    key: 'coupons',
    label: '优惠券',
    desc: '个人账户内已领取的卡券包。',
    icon: '券',
  },
  {
    key: 'feedback',
    label: '意见反馈',
    desc: '表单页面，支持上传图片，用于向景区反馈游览问题。',
    icon: '意',
  },
  {
    key: 'service',
    label: '联系客服',
    desc: '跳转至智能客服界面。',
    icon: '客',
  },
  {
    key: 'settings',
    label: '设置',
    desc: '修改个人资料、清除缓存、退出登录。',
    icon: '设',
  },
  {
    key: 'cart',
    label: '购物车',
    desc: '集中存放待购买的灵山文创、茶叶及祈福挂件等。',
    icon: '购',
  },
  {
    key: 'survey',
    label: '调查问卷',
    desc: '景区满意度调研，完成后可随机赠送积功德星或小额优惠券。',
    icon: '问',
  },
]

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
  font-size: 30rpx;
  font-weight: 800;
  box-shadow: 0 10rpx 22rpx rgba(161, 107, 42, 0.18);
}

.order-label,
.order-desc {
  display: block;
}

.order-label {
  margin-top: 14rpx;
  color: #3d3021;
  font-size: 25rpx;
  font-weight: 700;
}

.order-desc {
  margin-top: 6rpx;
  color: #9a8265;
  font-size: 20rpx;
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
  font-size: 28rpx;
  font-weight: 800;
  flex-shrink: 0;
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
