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
          <view class="feature-grid">
            <view class="feature-item" v-for="item in featureList" :key="item.title">
              <view class="feature-icon">{{ item.icon }}</view>
              <text class="feature-title">{{ item.title }}</text>
              <text class="feature-sub">{{ item.sub }}</text>
            </view>
          </view>

          <view class="quick-row">
            <view class="quick-tag" v-for="item in quickTags" :key="item">
              <text>{{ item }}</text>
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

const featureList = [
  { icon: '🏨', title: '酒店民宿', sub: '品质住宿' },
  { icon: '🎫', title: '景区门票', sub: '节日福利' },
  { icon: '', title: '交通出行', sub: '品质出行' },
]

const quickTags = ['精品路线', '精选美食', '阿坝优选']

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

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx 12rpx;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.feature-icon {
  width: 108rpx;
  height: 108rpx;
  border-radius: 50%;
  background: linear-gradient(160deg, #ffecc2 0%, #ffd48a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 52rpx;
}

.feature-title {
  margin-top: 12rpx;
  font-size: 40rpx;
  line-height: 1;
  font-family: STKaiti, KaiTi, serif;
  color: #3c2b21;
}

.feature-sub {
  margin-top: 10rpx;
  color: #888;
  font-size: 24rpx;
}

.quick-row {
  margin-top: 22rpx;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
}

.quick-tag {
  height: 56rpx;
  border-radius: 12rpx;
  background: linear-gradient(135deg, #ffe8bf 0%, #f5d19a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5f3f1e;
  font-size: 26rpx;
  font-weight: 600;
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
