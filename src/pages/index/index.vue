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

          <view class="collection-stack">
            <view class="collection-section" v-for="section in collectionSections" :key="section.title">
              <view class="collection-head">
                <view>
                  <text class="collection-title">{{ section.title }}</text>
                </view>
                <view class="all-link">
                  <text>全部</text>
                  <text class="all-arrow">›</text>
                </view>
              </view>

              <scroll-view scroll-x class="collection-scroll" :show-scrollbar="false">
                <view class="collection-row">
                  <view class="collection-card" v-for="item in section.items" :key="item.title">
                    <view class="collection-cover" :style="{ background: item.bg }">
                      <text class="collection-tag">{{ item.tag }}</text>
                    </view>
                    <view v-if="item.notice" class="collection-notice">
                      <text>{{ item.notice }}</text>
                    </view>
                    <view class="collection-content">
                      <text class="card-title">{{ item.title }}</text>
                      <text class="card-desc">{{ item.desc }}</text>
                    </view>
                  </view>
                </view>
              </scroll-view>
            </view>
          </view>

          <view class="feed-section">
            <view class="feed-head">
              <view>
                <text class="feed-title">猜你喜欢</text>
                <text class="feed-subtitle">灵山好物 · 攻略推文 · 预约入口</text>
              </view>
              <text class="feed-badge">Feed</text>
            </view>

            <view class="feed-grid">
              <view class="feed-card" v-for="item in feedItems" :key="item.title">
                <view class="feed-cover" :style="{ background: item.bg }">
                  <text class="feed-type">{{ item.type }}</text>
                </view>
                <view class="feed-content">
                  <text class="feed-card-title">{{ item.title }}</text>
                  <text class="feed-card-desc">{{ item.desc }}</text>
                  <view class="feed-footer">
                    <text class="feed-source">{{ item.source }}</text>
                    <text class="feed-action">{{ item.action }}</text>
                  </view>
                </view>
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

const collectionSections = [
  {
    title: '路线选择',
    subtitle: '路线特点 · 地图轨迹 · 沿途景点',
    items: [
      {
        title: '历史文化深度游',
        desc: '串联祥符禅寺、五智门等文化节点',
        tag: 'Routes',
        meta: ['解说', '导航', '分享'],
        bg: 'linear-gradient(140deg, #a56a3d 0%, #d9b06f 100%)',
      },
      {
        title: '自然风光全景游',
        desc: '湖山佛光与园林景观一线看完',
        tag: 'Routes',
        meta: ['语音', '点评', '轨迹'],
        bg: 'linear-gradient(140deg, #4e8b65 0%, #a5c77c 100%)',
      },
      {
        title: '亲子家庭轻松游',
        desc: '低强度步行，适合家庭慢游打卡',
        tag: 'Routes',
        meta: ['亲子', '导航', '点评'],
        bg: 'linear-gradient(140deg, #d08b55 0%, #f2c77b 100%)',
      },
    ],
  },
  {
    title: '演出',
    subtitle: '场次提醒 · 地点导航 · 演出介绍',
    items: [
      {
        title: '九龙灌浴',
        desc: '大型音乐动态群雕表演',
        tag: 'Shows',
        notice: '11：30下一场',
        meta: ['开放时间', '场次表', '导航'],
        bg: 'linear-gradient(140deg, #386b8f 0%, #8fbdda 100%)',
      },
      {
        title: '灵山吉祥颂',
        desc: '以梵宫空间呈现祥瑞礼赞',
        tag: 'Shows',
        notice: '14：00下一场',
        meta: ['轮播图', '介绍', '导航'],
        bg: 'linear-gradient(140deg, #7d5535 0%, #d4a15d 100%)',
      },
    ],
  },
  {
    title: '美食',
    subtitle: '素斋自助 · 素面馆 · 点单小程序',
    items: [
      {
        title: '梵宫素斋自助',
        desc: '禅意空间里的精致素食自助',
        tag: 'Food',
        meta: ['点单', '素斋', '推荐'],
        bg: 'linear-gradient(140deg, #71513a 0%, #c6945c 100%)',
      },
      {
        title: '灵山精舍素斋',
        desc: '清雅素斋，适合午间休憩',
        tag: 'Food',
        meta: ['点单', '雅座', '导航'],
        bg: 'linear-gradient(140deg, #697642 0%, #c2bd70 100%)',
      },
      {
        title: '景区素面馆',
        desc: '快速补给，一碗热面继续游览',
        tag: 'Food',
        meta: ['点单', '快捷', '热食'],
        bg: 'linear-gradient(140deg, #b06a35 0%, #e7b46d 100%)',
      },
    ],
  },
  {
    title: '打卡',
    subtitle: '历史简介 · 游客合影 · 实时导航',
    items: [
      {
        title: '灵山大照壁',
        desc: '入园标志景观，适合第一站合影',
        tag: 'Landmarks',
        meta: ['导航', '合影', '点评'],
        bg: 'linear-gradient(140deg, #84694f 0%, #d5b48c 100%)',
      },
      {
        title: '五明桥',
        desc: '连接禅意动线的经典步行景点',
        tag: 'Landmarks',
        meta: ['简介', '导航', '分享'],
        bg: 'linear-gradient(140deg, #536f82 0%, #a9c4d0 100%)',
      },
      {
        title: '天下第一掌',
        desc: '摸掌祈福文化代表点位',
        tag: 'Landmarks',
        meta: ['祈福', '点评', '合影'],
        bg: 'linear-gradient(140deg, #8f6a30 0%, #e0b75d 100%)',
      },
      {
        title: '转经筒',
        desc: '体验转经祈愿的互动打卡点',
        tag: 'Landmarks',
        meta: ['互动', '导航', '分享'],
        bg: 'linear-gradient(140deg, #684233 0%, #b9895f 100%)',
      },
    ],
  },
  {
    title: '菩提世界',
    subtitle: '植物百科 · 禅意景观 · 自然和谐',
    items: [
      {
        title: '印度正宗菩提树',
        desc: '感受佛教文化中的觉悟意象',
        tag: 'Bodhi World',
        meta: ['百科', '禅意', '植物'],
        bg: 'linear-gradient(140deg, #446e46 0%, #9fc57b 100%)',
      },
      {
        title: '千年银杏',
        desc: '四季皆有看点的古树景观',
        tag: 'Bodhi World',
        meta: ['百科', '古树', '自然'],
        bg: 'linear-gradient(140deg, #8c7a24 0%, #e1c95d 100%)',
      },
    ],
  },
]

const feedItems = [
  {
    type: '文创广告',
    title: '灵山学子祈福包',
    desc: '祈福牌、手串与定制明信片组合，送给正在备考的你。',
    source: '灵山文创',
    action: '查看',
    bg: 'linear-gradient(140deg, #8b5230 0%, #e1b56d 100%)',
  },
  {
    type: '攻略推文',
    title: '灵山集章全攻略',
    desc: '从大照壁到天下第一掌，整理隐藏章点和推荐动线。',
    source: '游玩攻略',
    action: '阅读',
    bg: 'linear-gradient(140deg, #526f52 0%, #b5c987 100%)',
  },
  {
    type: '外部链接',
    title: '美食预约小程序',
    desc: '梵宫素斋、精舍素斋和素面馆预约入口统一收纳。',
    source: '美食预约',
    action: '预约',
    bg: 'linear-gradient(140deg, #6f5b3e 0%, #d8aa67 100%)',
  },
  {
    type: '攻略推文',
    title: '祈福打卡路线推荐',
    desc: '把摸掌祈福、转经筒和菩提树串成一条轻松路线。',
    source: '精选路线',
    action: '收藏',
    bg: 'linear-gradient(140deg, #4e637a 0%, #a7bfd4 100%)',
  },
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

.collection-stack {
  margin-top: 30rpx;
}

.collection-section {
  margin-top: 28rpx;
}

.collection-section:first-child {
  margin-top: 0;
}

.collection-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 0 2rpx;
}

.collection-title {
  display: block;
  color: #2f2418;
  font-size: 38rpx;
  line-height: 1;
  font-family: STKaiti, KaiTi, serif;
  font-weight: 700;
}

.all-link {
  height: 42rpx;
  padding: 0 16rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.52);
  color: #7b5529;
  display: flex;
  align-items: center;
  font-size: 22rpx;
  font-weight: 700;
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.72);
}

.all-arrow {
  margin-left: 4rpx;
  font-size: 28rpx;
  line-height: 1;
}

.collection-scroll {
  width: 100%;
  margin-top: 16rpx;
  white-space: nowrap;
}

.collection-row {
  display: inline-flex;
  gap: 18rpx;
  padding-right: 8rpx;
}

.collection-card {
  width: 520rpx;
  border-radius: 24rpx;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.72);
  display: inline-flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0 14rpx 34rpx rgba(95, 68, 35, 0.12);
}

.collection-cover {
  height: 250rpx;
  padding: 16rpx;
  box-sizing: border-box;
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.collection-cover::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 82% 18%, rgba(255, 255, 255, 0.38), rgba(255, 255, 255, 0) 32%),
    linear-gradient(to top, rgba(0, 0, 0, 0.18), rgba(0, 0, 0, 0));
}

.collection-tag {
  position: relative;
  z-index: 1;
  border-radius: 999rpx;
  color: #fff;
  font-weight: 700;
  padding: 6rpx 14rpx;
  background: rgba(0, 0, 0, 0.2);
  font-size: 20rpx;
}

.collection-notice {
  position: absolute;
  z-index: 2;
  right: 34rpx;
  top: 194rpx;
  width: 118rpx;
  height: 118rpx;
  background: rgba(255, 236, 180, 0.94);
  color: #6a3f13;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 26rpx rgba(95, 62, 22, 0.18);
  font-size: 22rpx;
  font-weight: 700;
  line-height: 1.15;
  text-align: center;
  white-space: normal;
}

.collection-notice text {
  width: 86rpx;
  white-space: normal;
}

.collection-content {
  padding: 24rpx 22rpx 22rpx;
}

.card-title,
.card-desc {
  display: block;
}

.card-title {
  color: #322416;
  font-size: 28rpx;
  font-weight: 700;
  line-height: 1.2;
}

.card-desc {
  min-height: 64rpx;
  margin-top: 10rpx;
  color: #7f6c58;
  font-size: 22rpx;
  line-height: 1.45;
  white-space: normal;
}

.feed-section {
  margin-top: 34rpx;
}

.feed-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 0 2rpx;
}

.feed-title,
.feed-subtitle {
  display: block;
}

.feed-title {
  color: #2f2418;
  font-size: 40rpx;
  line-height: 1;
  font-family: STKaiti, KaiTi, serif;
  font-weight: 700;
}

.feed-subtitle {
  margin-top: 10rpx;
  color: #8a7154;
  font-size: 22rpx;
}

.feed-badge {
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(62, 43, 26, 0.9);
  color: #fff2c8;
  font-size: 20rpx;
  font-weight: 700;
}

.feed-grid {
  margin-top: 18rpx;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18rpx;
}

.feed-card {
  border-radius: 24rpx;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.76);
  box-shadow: 0 14rpx 34rpx rgba(95, 68, 35, 0.12);
}

.feed-cover {
  height: 168rpx;
  padding: 16rpx;
  box-sizing: border-box;
  position: relative;
}

.feed-cover::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 76% 16%, rgba(255, 255, 255, 0.34), rgba(255, 255, 255, 0) 34%),
    linear-gradient(to top, rgba(0, 0, 0, 0.16), rgba(0, 0, 0, 0));
}

.feed-type {
  position: relative;
  z-index: 1;
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.82);
  color: #704718;
  font-size: 20rpx;
  font-weight: 700;
}

.feed-content {
  padding: 18rpx 18rpx 16rpx;
}

.feed-card-title,
.feed-card-desc {
  display: block;
}

.feed-card-title {
  color: #322416;
  font-size: 28rpx;
  font-weight: 700;
  line-height: 1.28;
}

.feed-card-desc {
  min-height: 92rpx;
  margin-top: 10rpx;
  color: #7f6c58;
  font-size: 22rpx;
  line-height: 1.42;
}

.feed-footer {
  margin-top: 16rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.feed-source {
  color: #a2835f;
  font-size: 20rpx;
}

.feed-action {
  padding: 6rpx 14rpx;
  border-radius: 999rpx;
  background: #f8ead0;
  color: #8a5b25;
  font-size: 20rpx;
  font-weight: 700;
}
</style>
