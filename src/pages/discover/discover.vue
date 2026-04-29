<template>
  <view class="page">
    <image class="hero-img" :src="topCoverUrl" mode="aspectFill" />

    <view class="sheet">
      <view class="activity-row">
        <view class="section-label">
          <text>体验活动</text>
        </view>

        <view class="cards-col">
          <view class="activity-card" v-for="post in posts" :key="post.id" @tap="goDetail(post.id)">
            <image class="activity-cover" :src="post.coverUrl" mode="aspectFill" />

            <view class="activity-info">
              <text class="activity-title">{{ post.title }}</text>
              <text class="activity-sub">{{ post.subtitle }}</text>
            </view>

            <view class="activity-right">
              <text class="activity-price">{{ post.priceText }}</text>
              <text class="activity-reserve">预约</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="tabbar">
      <view
        class="tab-item"
        v-for="item in tabs"
        :key="item.key"
        :class="{ active: item.key === activeTab && !item.isAi }"
        @tap="onTabTap(item)"
      >
        <template v-if="!item.isAi">
          <text class="tab-icon">{{ item.icon }}</text>
          <text class="tab-text">{{ item.label }}</text>
        </template>
      </view>

      <view class="ai-button" @tap="onAiTap">
        <text class="ai-icon">🐼</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { fetchDiscoverPosts } from '../../api/discover'

const activeTab = ref('discover')
const posts = ref([])

const topCoverUrl = computed(() => {
  return posts.value[0]?.coverUrl || 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80'
})

const tabs = [
  { key: 'home', label: '首页', icon: '⌂' },
  { key: 'map', label: '地图', icon: '⌖' },
  { key: 'ai', label: 'AI', icon: '●', isAi: true },
  { key: 'discover', label: '发现', icon: '◈' },
  { key: 'mine', label: '我的', icon: '◉' },
]

onMounted(async () => {
  posts.value = await fetchDiscoverPosts()
})

function goDetail(id) {
  uni.navigateTo({ url: `/pages/discover/discoverDetail?id=${id}` })
}

function onAiTap() {
  uni.showToast({ title: 'AI助手页面待开发', icon: 'none' })
}

function onTabTap(item) {
  if (item.isAi) return
  activeTab.value = item.key

  if (item.key === 'home') {
    uni.reLaunch({ url: '/pages/index/index' })
    return
  }

  if (item.key === 'map') {
    uni.navigateTo({ url: '/pages/map/map' })
    return
  }

  if (item.key === 'discover') return

  if (item.key === 'mine') {
    uni.reLaunch({ url: '/pages/mine/mine' })
    return
  }

  uni.showToast({ title: `${item.label}页面待开发`, icon: 'none' })
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  position: relative;
  background: #f3f6f9;
}

.hero-img {
  width: 100%;
  height: 320rpx;
}

.sheet {
  margin-top: -76rpx;
  background: #fff;
  border-radius: 40rpx 40rpx 0 0;
  padding: 28rpx 22rpx 160rpx;
  box-sizing: border-box;
}

.activity-row {
  display: flex;
  align-items: flex-start;
  gap: 18rpx;
}

.cards-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.section-label {
  width: 168rpx;
  height: 132rpx;
  border-radius: 26rpx;
  background: #f2f2f2;
  display: flex;
  align-items: center;
  padding-left: 22rpx;
  box-sizing: border-box;
}

.section-label text {
  font-size: 32rpx;
  font-weight: 700;
  color: #262626;
}

.activity-card {
  flex: 1;
  height: 132rpx;
  border-radius: 26rpx;
  background: #ffffff;
  display: flex;
  align-items: center;
  padding: 18rpx 18rpx;
  box-sizing: border-box;
}

.activity-cover {
  width: 108rpx;
  height: 108rpx;
  border-radius: 20rpx;
  overflow: hidden;
  background: #eee;
}

.activity-info {
  flex: 1;
  padding-left: 18rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.activity-title {
  font-size: 30rpx;
  color: #222;
  font-weight: 800;
  line-height: 1.2;
}

.activity-sub {
  margin-top: 6rpx;
  font-size: 24rpx;
  color: #9a9a9a;
}

.activity-right {
  width: 120rpx;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  padding-right: 4rpx;
}

.activity-price {
  font-size: 26rpx;
  color: #2c2c2c;
  font-weight: 700;
}

.activity-reserve {
  margin-top: 12rpx;
  font-size: 26rpx;
  color: #2a9f70;
  font-weight: 700;
}

.tabbar {
  height: 120rpx;
  background: #fff;
  border-top: 1rpx solid #ebedf0;
  display: flex;
  align-items: center;
  justify-content: space-around;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
}

.tab-item {
  width: 20%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9b9b9b;
}

.tab-icon {
  font-size: 34rpx;
  line-height: 1;
}

.tab-text {
  margin-top: 6rpx;
  font-size: 22rpx;
}

.tab-item.active {
  color: #3ca764;
}

.ai-button {
  position: absolute;
  left: 50%;
  top: -28rpx;
  transform: translateX(-50%);
  width: 108rpx;
  height: 108rpx;
  border-radius: 50%;
  border: 8rpx solid #fff;
  background: linear-gradient(145deg, #72d67f 0%, #48b258 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 18rpx rgba(31, 136, 56, 0.3);
}

.ai-icon {
  font-size: 54rpx;
}
</style>

