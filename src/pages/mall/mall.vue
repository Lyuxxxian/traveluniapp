<template>
  <TabBar activeTab="mall" :showTabbar="true">
    <view class="page">
      <view class="top-search">
        <view class="search-box" @tap="goSearch">
          <view class="search-icon" />
          <text class="search-placeholder">搜索门票、酒店、文创周边</text>
        </view>
        <view class="service-btn" @tap="goService">
          <view class="service-icon" />
        </view>
      </view>

      <swiper class="promo-swiper" circular autoplay :interval="4200" :duration="700">
        <swiper-item v-for="item in promoItems" :key="item.title">
          <view class="promo-card" :style="{ background: item.bg }">
            <text class="promo-kicker">{{ item.kicker }}</text>
            <text class="promo-title">{{ item.title }}</text>
            <text class="promo-desc">{{ item.desc }}</text>
          </view>
        </swiper-item>
      </swiper>

      <view class="module-card">
        <view class="module-head">
          <text class="module-title">商城服务</text>
          <text class="module-subtitle">门票住宿 · 文创优惠 · 到达服务</text>
        </view>

        <view class="module-grid">
          <view class="module-item" v-for="item in moduleItems" :key="item.key" @tap="goModule(item)">
            <view class="module-icon" :class="item.iconClass" />
            <text class="module-label">{{ item.label }}</text>
            <text class="module-desc">{{ item.desc }}</text>
          </view>
        </view>
      </view>

      <view class="recommend-section">
        <view class="section-head">
          <text class="section-title">近期推荐</text>
          <text class="section-more">更多 ›</text>
        </view>
        <view class="recommend-list">
          <view class="recommend-card" v-for="item in recommendItems" :key="item.title">
            <view class="recommend-cover" :style="{ background: item.bg }">
              <text>{{ item.tag }}</text>
            </view>
            <view class="recommend-copy">
              <text class="recommend-title">{{ item.title }}</text>
              <text class="recommend-desc">{{ item.desc }}</text>
              <view class="recommend-footer">
                <text class="recommend-price">{{ item.price }}</text>
                <text class="recommend-action">查看</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </TabBar>
</template>

<script setup>
import TabBar from '../../components/TabBar.vue'

const promoItems = [
  {
    kicker: '早鸟优惠',
    title: '灵山精舍早鸟预订优惠',
    desc: '禅意园林住宿，提前预订享专属礼遇',
    bg: 'linear-gradient(135deg, #8b6138 0%, #d8ad6b 100%)',
  },
  {
    kicker: '文创新品',
    title: '灵山学子祈福文创上新',
    desc: '祈福挂件、手串与明信片组合上架',
    bg: 'linear-gradient(135deg, #4f7556 0%, #a8c47b 100%)',
  },
  {
    kicker: '限时礼包',
    title: '限时素食券礼包',
    desc: '梵宫素斋与素面套餐券组合领取',
    bg: 'linear-gradient(135deg, #4e6c88 0%, #9cc0d4 100%)',
  },
]

const moduleItems = [
  { key: 'ticket', label: '门票', desc: '当日票预约', iconClass: 'icon-ticket' },
  { key: 'hotel', label: '酒店', desc: '禅意住宿', iconClass: 'icon-hotel' },
  { key: 'annualCard', label: '年卡', desc: '无限次入园', iconClass: 'icon-card' },
  { key: 'coupon', label: '优惠券', desc: '领券中心', iconClass: 'icon-coupon' },
  { key: 'parking', label: '停车服务', desc: '余位与计费', iconClass: 'icon-parking' },
  { key: 'food', label: '在线点餐', desc: '素斋预约', iconClass: 'icon-food' },
]

const recommendItems = [
  {
    tag: '酒店',
    title: '灵山精舍禅意房',
    desc: '含早课体验与素斋早餐',
    price: '￥688起',
    bg: 'linear-gradient(140deg, #7b5c3e 0%, #d6b37f 100%)',
  },
  {
    tag: '优惠',
    title: '50 元素斋自助券',
    desc: '限灵山梵宫素斋使用',
    price: '立即领取',
    bg: 'linear-gradient(140deg, #8c5b3c 0%, #e0a965 100%)',
  },
  {
    tag: '文创',
    title: '灵山禅茶礼盒',
    desc: '伴手礼与祈福心意精选',
    price: '￥128起',
    bg: 'linear-gradient(140deg, #526f52 0%, #b5c987 100%)',
  },
]

function goSearch() {
  uni.showToast({ title: '搜索专题页待开发', icon: 'none' })
}

function goService() {
  uni.showToast({ title: '智能客服对话待开发', icon: 'none' })
}

function goModule(item) {
  if (item.key === 'ticket') {
    uni.navigateTo({ url: '/pages/mall/ticket' })
    return
  }
  if (item.key === 'hotel') {
    uni.navigateTo({ url: '/pages/mall/hotel' })
    return
  }
  if (item.key === 'annualCard') {
    uni.navigateTo({ url: '/pages/mall/annualCard' })
    return
  }
  if (item.key === 'coupon') {
    uni.navigateTo({ url: '/pages/mall/coupon' })
    return
  }
  uni.showToast({ title: `${item.label}页面待开发`, icon: 'none' })
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 28rpx 24rpx 160rpx;
  box-sizing: border-box;
  background:
    radial-gradient(circle at 12% 0%, rgba(225, 197, 145, 0.34), rgba(225, 197, 145, 0) 34%),
    linear-gradient(180deg, #f6efe2 0%, #f4f5ef 45%, #f7f1e7 100%);
}

.top-search {
  display: flex;
  align-items: center;
  gap: 18rpx;
}

.search-box {
  height: 76rpx;
  min-width: 0;
  flex: 1;
  padding: 0 24rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.82);
  display: flex;
  align-items: center;
  box-shadow: 0 14rpx 34rpx rgba(94, 68, 35, 0.1);
}

.search-icon {
  width: 28rpx;
  height: 28rpx;
  border: 4rpx solid #9b7b52;
  border-radius: 50%;
  position: relative;
  flex-shrink: 0;
}

.search-icon::after {
  content: '';
  position: absolute;
  right: -10rpx;
  bottom: -8rpx;
  width: 16rpx;
  height: 4rpx;
  border-radius: 999rpx;
  background: #9b7b52;
  transform: rotate(45deg);
}

.search-placeholder {
  margin-left: 20rpx;
  color: #9a8265;
  font-size: 26rpx;
}

.service-btn {
  width: 76rpx;
  height: 76rpx;
  border-radius: 50%;
  background: linear-gradient(160deg, #fff4d9 0%, #dca85d 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 14rpx 30rpx rgba(161, 107, 42, 0.18);
}

.service-icon {
  width: 38rpx;
  height: 30rpx;
  border: 4rpx solid #6f451d;
  border-radius: 18rpx 18rpx 10rpx 10rpx;
  position: relative;
}

.service-icon::before,
.service-icon::after {
  content: '';
  position: absolute;
  box-sizing: border-box;
}

.service-icon::before {
  left: -10rpx;
  top: 10rpx;
  width: 58rpx;
  height: 14rpx;
  border-left: 4rpx solid #6f451d;
  border-right: 4rpx solid #6f451d;
}

.service-icon::after {
  right: 2rpx;
  bottom: -9rpx;
  width: 14rpx;
  height: 8rpx;
  border-right: 4rpx solid #6f451d;
  border-bottom: 4rpx solid #6f451d;
  border-radius: 0 0 8rpx 0;
}

.promo-swiper {
  height: 270rpx;
  margin-top: 26rpx;
  border-radius: 32rpx;
  overflow: hidden;
}

.promo-card {
  height: 270rpx;
  padding: 34rpx;
  box-sizing: border-box;
  color: #fffaf0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.promo-card::after {
  content: '';
  position: absolute;
  right: -50rpx;
  top: -70rpx;
  width: 260rpx;
  height: 260rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
}

.promo-kicker,
.promo-title,
.promo-desc {
  position: relative;
  z-index: 1;
  display: block;
}

.promo-kicker {
  width: fit-content;
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.22);
  font-size: 22rpx;
  font-weight: 700;
}

.promo-title {
  margin-top: 22rpx;
  font-size: 40rpx;
  font-weight: 800;
  line-height: 1.18;
}

.promo-desc {
  margin-top: 12rpx;
  font-size: 24rpx;
  opacity: 0.86;
}

.module-card,
.recommend-section {
  margin-top: 26rpx;
  padding: 30rpx 26rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.72);
  border-radius: 30rpx;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 18rpx 42rpx rgba(94, 68, 35, 0.1);
}

.module-head,
.section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.module-title,
.section-title {
  color: #312416;
  font-size: 34rpx;
  font-weight: 800;
}

.module-subtitle,
.section-more {
  color: #9a8265;
  font-size: 22rpx;
}

.module-grid {
  margin-top: 26rpx;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18rpx;
}

.module-item {
  min-height: 172rpx;
  padding: 22rpx 10rpx 18rpx;
  border-radius: 24rpx;
  background: #fff8ed;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
}

.module-icon {
  width: 62rpx;
  height: 62rpx;
  border-radius: 22rpx;
  background: linear-gradient(160deg, #fff4d9 0%, #dca85d 100%);
  position: relative;
  box-shadow: 0 10rpx 22rpx rgba(161, 107, 42, 0.16);
}

.module-icon::before,
.module-icon::after {
  content: '';
  position: absolute;
  box-sizing: border-box;
}

.module-label,
.module-desc {
  display: block;
}

.module-label {
  margin-top: 14rpx;
  color: #3d3021;
  font-size: 26rpx;
  font-weight: 800;
}

.module-desc {
  margin-top: 6rpx;
  color: #9a8265;
  font-size: 20rpx;
}

.icon-ticket::before {
  left: 13rpx;
  top: 17rpx;
  width: 36rpx;
  height: 28rpx;
  border: 4rpx solid #754a1f;
  border-radius: 8rpx;
}

.icon-ticket::after {
  left: 29rpx;
  top: 18rpx;
  width: 4rpx;
  height: 26rpx;
  background: #754a1f;
}

.icon-hotel::before {
  left: 12rpx;
  top: 18rpx;
  width: 38rpx;
  height: 28rpx;
  border: 4rpx solid #754a1f;
  border-radius: 5rpx;
}

.icon-hotel::after {
  left: 18rpx;
  top: 29rpx;
  width: 26rpx;
  height: 5rpx;
  background: #754a1f;
  box-shadow: 0 9rpx 0 #754a1f;
}

.icon-card::before {
  left: 13rpx;
  top: 16rpx;
  width: 36rpx;
  height: 30rpx;
  border: 4rpx solid #754a1f;
  border-radius: 8rpx;
}

.icon-card::after {
  left: 19rpx;
  top: 25rpx;
  width: 24rpx;
  height: 5rpx;
  border-radius: 999rpx;
  background: #754a1f;
}

.icon-coupon::before {
  left: 10rpx;
  top: 18rpx;
  width: 42rpx;
  height: 28rpx;
  border: 4rpx solid #754a1f;
  border-radius: 8rpx;
}

.icon-coupon::after {
  left: 29rpx;
  top: 18rpx;
  width: 4rpx;
  height: 28rpx;
  background: #754a1f;
}

.icon-parking::before {
  left: 17rpx;
  top: 12rpx;
  width: 28rpx;
  height: 38rpx;
  border: 4rpx solid #754a1f;
  border-radius: 7rpx;
}

.icon-parking::after {
  left: 26rpx;
  top: 19rpx;
  width: 10rpx;
  height: 18rpx;
  border: 4rpx solid #754a1f;
  border-left: 0;
}

.icon-food::before {
  left: 16rpx;
  top: 16rpx;
  width: 30rpx;
  height: 30rpx;
  border: 4rpx solid #754a1f;
  border-radius: 50%;
}

.icon-food::after {
  right: 14rpx;
  top: 14rpx;
  width: 5rpx;
  height: 36rpx;
  border-radius: 999rpx;
  background: #754a1f;
}

.recommend-list {
  margin-top: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.recommend-card {
  min-height: 164rpx;
  padding: 14rpx;
  border-radius: 24rpx;
  background: #fff8ed;
  display: flex;
  box-sizing: border-box;
}

.recommend-cover {
  width: 150rpx;
  border-radius: 20rpx;
  color: #fff;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 14rpx;
  box-sizing: border-box;
  font-size: 22rpx;
  font-weight: 800;
  flex-shrink: 0;
}

.recommend-copy {
  min-width: 0;
  flex: 1;
  margin-left: 18rpx;
}

.recommend-title,
.recommend-desc {
  display: block;
}

.recommend-title {
  color: #332619;
  font-size: 28rpx;
  font-weight: 800;
}

.recommend-desc {
  margin-top: 10rpx;
  color: #89745f;
  font-size: 22rpx;
}

.recommend-footer {
  margin-top: 18rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.recommend-price {
  color: #a76524;
  font-size: 26rpx;
  font-weight: 800;
}

.recommend-action {
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  background: #f1dfc1;
  color: #7b5529;
  font-size: 22rpx;
  font-weight: 800;
}
</style>
