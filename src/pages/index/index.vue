<template>
  <TabBar activeTab="home" :showTabbar="true">
    <view class="page">
      <scroll-view scroll-y class="scroll" @scroll="handleHeroScroll">
        <view class="hero" :style="{ backgroundColor: currentHero.themeColor }">
          <swiper
            class="hero-swiper"
            circular
            autoplay
            :interval="4200"
            :duration="700"
            @change="handleHeroChange"
          >
            <swiper-item v-for="item in heroSlides" :key="item.title">
              <image
                class="hero-image"
                :src="item.image"
                mode="aspectFill"
                :style="heroImageStyle"
              />
            </swiper-item>
          </swiper>
          <view class="hero-overlay" />
          <view
            class="hero-feather"
            :style="{ background: `linear-gradient(to bottom, rgba(248, 248, 248, 0) 0%, ${currentHero.themeColor} 72%, ${currentHero.themeColor} 100%)` }"
          />
          <view class="hero-copy">
            <text class="hero-kicker">{{ currentHero.kicker }}</text>
            <text class="hero-title">{{ currentHero.title }}</text>
            <text class="hero-subtitle">{{ currentHero.subtitle }}</text>
          </view>
          <view class="top-bar">
            <view class="location">
              <view class="location-icon">▲</view>
              <view class="location-text">
                <text class="city">数字助手</text>
                <text class="city-sub">站式文旅服务</text>
              </view>
            </view>

            <view class="search">
              <text class="search-icon">🔍</text>
              <text class="search-text">找景区/酒店</text>
            </view>

            <view class="camera">◉</view>
          </view>
        </view>

        <view class="main-card" :style="{ backgroundColor: currentHero.themeColor }">
          <view class="function-box">
            <scroll-view scroll-x class="matrix-scroll" :show-scrollbar="false">
              <view class="matrix-row">
                <view class="matrix-item" v-for="item in matrixItems" :key="item.title">
                  <view class="matrix-icon">{{ item.icon }}</view>
                  <text class="matrix-title">{{ item.title }}</text>
                  <text class="matrix-desc">{{ item.desc }}</text>
                </view>
              </view>
            </scroll-view>

            <view class="action-grid">
              <view class="action-card" v-for="item in actionCards" :key="item.title">
                <view>
                  <text class="action-title">{{ item.title }}</text>
                  <text class="action-desc">{{ item.desc }}</text>
                </view>
                <text class="action-icon">{{ item.icon }}</text>
              </view>
            </view>

            <view class="member-strip">
              <view class="merit-badge">
                <text class="merit-icon">莲</text>
                <text class="merit-level">善缘</text>
              </view>
              <view class="member-copy">
                <text class="member-title">积功德星·换灵山礼</text>
                <text class="member-sub">消费积星称为“积攒功德”</text>
              </view>
              <button class="scan-btn" hover-class="scan-btn-hover">一键扫码</button>
            </view>
          </view>

          <view class="section-title">
            <text class="fire">🔥</text>
            <text>热门景区</text>
          </view>

          <view class="spot-grid">
            <view class="spot-card" v-for="spot in spotList" :key="spot.name">
              <view class="spot-bg" :style="{ background: spot.bg }" />
              <view class="spot-mask" />
              <view class="spot-content">
                <text class="spot-name">{{ spot.name }}</text>
                <text class="spot-desc">{{ spot.desc }}</text>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
  </TabBar>
</template>

<script setup>
import { computed, ref } from 'vue'
import TabBar from '../../components/TabBar.vue'

const activeTab = ref('home')
const activeHeroIndex = ref(0)
const heroBlur = ref(0)

const heroSlides = [
  {
    title: '灵山大佛全景',
    subtitle: '在山湖之间仰望庄严佛光',
    kicker: 'Lingshan Grand Buddha',
    image:
      'https://commons.wikimedia.org/wiki/Special:FilePath/%E7%81%B5%E5%B1%B1%E5%A4%A7%E4%BD%9B_-_panoramio_(1).jpg',
    themeColor: '#f8f1e3',
  },
  {
    title: '灵山梵宫艺术细节',
    subtitle: '金色穹顶、壁画与木雕交织成东方美学',
    kicker: 'Brahma Palace',
    image:
      'https://commons.wikimedia.org/wiki/Special:FilePath/%E6%97%A0%E9%94%A1%E7%81%B5%E5%B1%B1%E5%A4%A7%E4%BD%9B%E6%A2%B5%E5%AE%AB_-_panoramio.jpg',
    themeColor: '#f5ead9',
  },
  {
    title: '拈花湾花海',
    subtitle: '花海铺展，禅意小镇慢慢苏醒',
    kicker: 'Nianhua Bay',
    image:
      'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1200&q=80',
    themeColor: '#f4efe6',
  },
]

const currentHero = computed(() => heroSlides[activeHeroIndex.value] || heroSlides[0])
const heroImageStyle = computed(() => {
  const blur = heroBlur.value

  return {
    filter: `blur(${blur}px)`,
    transform: `scale(${1 + blur * 0.012})`,
  }
})

function handleHeroChange(event) {
  activeHeroIndex.value = event.detail.current
}

function handleHeroScroll(event) {
  const scrollTop = event.detail.scrollTop || 0
  heroBlur.value = Math.min(24, Math.round((scrollTop / 220) * 24))
}

const matrixItems = [
  { icon: '🎟️', title: '预售门票', desc: '票务小程序' },
  { icon: '🎫', title: '当日门票', desc: '160元起' },
  { icon: '🔔', title: '入园提醒', desc: '须知与检票点' },
  { icon: '🕘', title: '运营时间', desc: '8:00-17:00' },
  { icon: '🎧', title: '电子讲解器', desc: '扫码支付佩戴' },
  { icon: '🙏', title: '考试祈福', desc: '摸掌祈福' },
  { icon: '🛍️', title: '会员商品', desc: '文创与禅茶' },
  { icon: '💬', title: '游客服务', desc: '热评与回复' },
  { icon: '🗺️', title: '我的行程', desc: 'DIY优化路线' },
]

const actionCards = [
  { icon: '购', title: '立即购买', desc: '门票与套票' },
  { icon: '会', title: '会员俱乐部', desc: '功德等级权益' },
  { icon: '年', title: '年卡', desc: '全年畅游' },
  { icon: '香', title: '体验活动', desc: '藏香制作等' },
]

const spotList = [
  { name: '九寨沟', desc: '"童话世界"、"人间仙境"', bg: 'linear-gradient(140deg, #84d5ff 0%, #2f78d2 100%)' },
  { name: '黄龙', desc: '"世界奇观"、"人间瑶池"', bg: 'linear-gradient(140deg, #89f0d0 0%, #2c8f5d 100%)' },
  { name: '四姑娘山', desc: '"蜀山皇后"、"东方圣山"', bg: 'linear-gradient(140deg, #8bc5ff 0%, #4d65d1 100%)' },
  { name: '达古冰川', desc: '"冰川奇观"、"最近的遥远"', bg: 'linear-gradient(140deg, #76b3ff 0%, #2145a6 100%)' },
]
</script>

<style scoped>
.page {
  height: 100vh;
  background: #f2f4f7;
}

.scroll {
  height: calc(100vh - 120rpx);
}

.hero {
  height: 52vh;
  min-height: 520rpx;
  padding: 26rpx 24rpx 0;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  transition: background-color 0.5s ease;
}

.hero-swiper {
  position: absolute;
  inset: 0;
  height: 100%;
}

.hero-image {
  width: 100%;
  height: 100%;
  will-change: filter, transform;
  transition: filter 0.12s linear, transform 0.12s linear;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to bottom, rgba(0, 0, 0, 0.26) 0%, rgba(0, 0, 0, 0.12) 46%, rgba(0, 0, 0, 0.38) 100%),
    radial-gradient(circle at 72% 24%, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0) 36%);
}

.hero-feather {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -2rpx;
  height: 190rpx;
  transition: background 0.5s ease;
}

.hero-copy {
  position: absolute;
  left: 32rpx;
  right: 32rpx;
  bottom: 116rpx;
  z-index: 2;
  color: #fff;
  display: flex;
  flex-direction: column;
  text-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.32);
}

.hero-kicker {
  font-size: 22rpx;
  letter-spacing: 4rpx;
  text-transform: uppercase;
  opacity: 0.82;
}

.hero-title {
  margin-top: 12rpx;
  font-size: 58rpx;
  line-height: 1.05;
  font-family: STKaiti, KaiTi, serif;
  font-weight: 700;
}

.hero-subtitle {
  margin-top: 14rpx;
  width: 82%;
  font-size: 26rpx;
  line-height: 1.45;
  opacity: 0.95;
}

.top-bar {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.location {
  min-width: 166rpx;
  display: flex;
  align-items: center;
}

.location-icon {
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  background: #2ea8ff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  margin-right: 10rpx;
}

.location-text {
  display: flex;
  flex-direction: column;
}

.city {
  color: #fff;
  font-weight: 700;
  font-size: 30rpx;
}

.city-sub {
  color: rgba(255, 255, 255, 0.85);
  font-size: 20rpx;
}

.search {
  flex: 1;
  height: 64rpx;
  border-radius: 40rpx;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  padding: 0 20rpx;
  box-sizing: border-box;
}

.search-icon {
  margin-right: 10rpx;
  font-size: 24rpx;
}

.search-text {
  color: #777;
  font-size: 26rpx;
}

.camera {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
}

.main-card {
  margin-top: -74rpx;
  border-radius: 28rpx 28rpx 0 0;
  padding: 30rpx 24rpx 38rpx;
  min-height: 950rpx;
  box-sizing: border-box;
  position: relative;
  z-index: 2;
  transition: background-color 0.5s ease;
}

.function-box {
  padding: 22rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.62);
  border-radius: 32rpx;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.78), rgba(255, 248, 235, 0.5)),
    radial-gradient(circle at 12% 0%, rgba(255, 214, 142, 0.45), rgba(255, 255, 255, 0) 34%);
  box-shadow: 0 20rpx 48rpx rgba(99, 72, 34, 0.14);
  -webkit-backdrop-filter: blur(22rpx);
  backdrop-filter: blur(22rpx);
}

.matrix-scroll {
  width: 100%;
  white-space: nowrap;
}

.matrix-row {
  display: inline-flex;
  gap: 16rpx;
  padding-bottom: 4rpx;
}

.matrix-item {
  width: 150rpx;
  min-height: 176rpx;
  padding: 18rpx 12rpx 14rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.68);
  box-sizing: border-box;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.82);
}

.matrix-icon {
  width: 70rpx;
  height: 70rpx;
  border-radius: 50%;
  background: linear-gradient(160deg, #fff3cf 0%, #e8b66b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34rpx;
  box-shadow: 0 8rpx 20rpx rgba(175, 121, 47, 0.2);
}

.matrix-title {
  margin-top: 14rpx;
  color: #3e2b1a;
  font-size: 26rpx;
  font-weight: 700;
  line-height: 1;
}

.matrix-desc {
  margin-top: 10rpx;
  color: #8a7154;
  font-size: 20rpx;
  line-height: 1.25;
  text-align: center;
  white-space: normal;
}

.action-grid {
  margin-top: 22rpx;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14rpx;
}

.action-card {
  min-height: 104rpx;
  padding: 18rpx 18rpx 16rpx;
  border-radius: 22rpx;
  background: linear-gradient(135deg, rgba(110, 72, 33, 0.9) 0%, rgba(205, 154, 82, 0.86) 100%);
  color: #fff8ea;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
}

.action-card::after {
  content: '';
  position: absolute;
  top: -42rpx;
  right: -28rpx;
  width: 110rpx;
  height: 110rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.13);
}

.action-title,
.action-desc {
  display: block;
  position: relative;
  z-index: 1;
}

.action-title {
  font-size: 28rpx;
  font-weight: 700;
}

.action-desc {
  margin-top: 8rpx;
  font-size: 20rpx;
  opacity: 0.84;
}

.action-icon {
  position: relative;
  z-index: 1;
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 700;
}

.member-strip {
  margin-top: 18rpx;
  padding: 16rpx;
  border-radius: 26rpx;
  background: linear-gradient(135deg, rgba(62, 43, 26, 0.92) 0%, rgba(120, 79, 35, 0.9) 100%);
  color: #fff4d6;
  display: flex;
  align-items: center;
  box-shadow: 0 14rpx 30rpx rgba(70, 45, 18, 0.18);
}

.merit-badge {
  width: 86rpx;
  height: 86rpx;
  border-radius: 24rpx;
  background: linear-gradient(160deg, #fff2bd 0%, #d99c45 100%);
  color: #5d3512;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.merit-icon {
  font-size: 30rpx;
  line-height: 1;
  font-family: STKaiti, KaiTi, serif;
}

.merit-level {
  margin-top: 6rpx;
  font-size: 20rpx;
  font-weight: 700;
}

.member-copy {
  min-width: 0;
  flex: 1;
  margin-left: 16rpx;
}

.member-title,
.member-sub {
  display: block;
}

.member-title {
  font-size: 28rpx;
  font-weight: 700;
}

.member-sub {
  margin-top: 8rpx;
  font-size: 20rpx;
  color: rgba(255, 244, 214, 0.76);
}

.scan-btn {
  flex-shrink: 0;
  height: 58rpx;
  line-height: 58rpx;
  margin: 0;
  padding: 0 20rpx;
  border-radius: 999rpx;
  background: #fff0bf;
  color: #6e4214;
  font-size: 22rpx;
  font-weight: 700;
}

.scan-btn::after {
  border: 0;
}

.scan-btn-hover {
  opacity: 0.84;
}

.section-title {
  margin-top: 34rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 56rpx;
  line-height: 1;
  color: #111;
  font-family: STKaiti, KaiTi, serif;
}

.fire {
  font-size: 38rpx;
}

.spot-grid {
  margin-top: 22rpx;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.spot-card {
  height: 248rpx;
  border-radius: 18rpx;
  overflow: hidden;
  position: relative;
}

.spot-bg,
.spot-mask {
  position: absolute;
  inset: 0;
}

.spot-mask {
  background: linear-gradient(to top, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.1));
}

.spot-content {
  position: absolute;
  left: 16rpx;
  right: 16rpx;
  bottom: 16rpx;
  color: #fff;
}

.spot-name {
  font-size: 46rpx;
  line-height: 1;
  font-family: STKaiti, KaiTi, serif;
}

.spot-desc {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  opacity: 0.95;
}
</style>
