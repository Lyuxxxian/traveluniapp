<template>
  <TabBar activeTab="discover" :showTabbar="true">
    <view class="page">
      <image class="hero-img" :src="topCoverUrl" mode="aspectFill" />

      <view class="sheet">
        <view class="page-head">
          <view class="section-label">
            <text>{{ activeCategoryLabel }}</text>
          </view>
          <view class="page-copy">
            <text class="page-title">发现灵山</text>
            <text class="page-subtitle">活动 · 攻略 · 演出 · 美食</text>
          </view>
        </view>

        <scroll-view scroll-x class="category-scroll" :show-scrollbar="false">
          <view class="category-row">
            <view
              class="category-item"
              v-for="item in discoverCategories"
              :key="item.key"
              :class="{ active: activeCategory === item.key }"
              @tap="switchCategory(item.key)"
            >
              <text>{{ item.label }}</text>
            </view>
          </view>
        </scroll-view>

        <scroll-view scroll-y class="content-list" @scrolltolower="loadMore">
          <view v-if="loading" class="state-box">
            <text>加载中...</text>
          </view>

          <view v-else-if="posts.length === 0" class="state-box">
            <text>暂无内容</text>
          </view>

          <template v-else>
            <view class="activity-card" v-for="post in posts" :key="post.id" @tap="goDetail(post.id)">
              <image class="activity-cover" :src="post.coverUrl" mode="aspectFill" />

              <view class="activity-info">
                <view class="tag-row">
                  <text class="tag">{{ post.tagText }}</text>
                  <text class="publish-time">{{ post.publishTime }}</text>
                </view>
                <text class="activity-title">{{ post.title }}</text>
                <text class="activity-sub">{{ post.summary || post.subtitle }}</text>
                <text class="activity-place">{{ post.location }}</text>
              </view>

              <view class="activity-right">
                <text class="activity-price">{{ post.priceText }}</text>
                <text class="activity-reserve">{{ post.actionText }}</text>
              </view>
            </view>

            <view class="load-more">
              <text v-if="loadingMore">加载中...</text>
              <text v-else-if="hasMore">上拉加载更多</text>
              <text v-else>— 已显示全部 —</text>
            </view>
          </template>
        </scroll-view>
      </view>
    </view>
  </TabBar>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { discoverCategories, fetchDiscoverPosts } from '../../api/discover'
import TabBar from '../../components/TabBar.vue'

const activeCategory = ref('recommend')
const posts = ref([])
const page = ref(1)
const pageSize = 4
const total = ref(0)
const loading = ref(true)
const loadingMore = ref(false)

const topCoverUrl = computed(() => {
  return posts.value[0]?.coverUrl || 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80'
})
const hasMore = computed(() => posts.value.length < total.value)
const activeCategoryLabel = computed(() => {
  const target = discoverCategories.find((item) => item.key === activeCategory.value)
  return target ? target.label : '推荐'
})

onMounted(() => {
  loadPosts(true)
})

async function loadPosts(reset = false) {
  if (reset) {
    page.value = 1
    posts.value = []
    loading.value = true
  } else if (loadingMore.value || !hasMore.value) {
    return
  } else {
    loadingMore.value = true
  }

  try {
    const result = await fetchDiscoverPosts({
      category: activeCategory.value,
      page: page.value,
      pageSize,
    })
    const list = Array.isArray(result) ? result : result.list
    total.value = Array.isArray(result) ? result.length : result.total
    posts.value = reset ? list : [...posts.value, ...list]
  } catch {
    uni.showToast({ title: '发现内容加载失败', icon: 'none' })
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

function switchCategory(key) {
  if (activeCategory.value === key) return
  activeCategory.value = key
  loadPosts(true)
}

function loadMore() {
  if (!hasMore.value) return
  page.value += 1
  loadPosts(false)
}

function goDetail(id) {
  uni.navigateTo({ url: `/pages/discover/discoverDetail?id=${id}` })
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  position: relative;
  padding-top: var(--status-bar-height);
  box-sizing: border-box;
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

.page-head {
  display: flex;
  align-items: flex-start;
  gap: 18rpx;
}

.page-copy {
  flex: 1;
  min-width: 0;
  padding-top: 4rpx;
}

.page-title,
.page-subtitle {
  display: block;
}

.page-title {
  color: #222;
  font-size: 38rpx;
  font-weight: 800;
}

.page-subtitle {
  margin-top: 8rpx;
  color: #9a9a9a;
  font-size: 24rpx;
}

.category-scroll {
  width: 100%;
  margin-top: 24rpx;
  white-space: nowrap;
}

.category-row {
  display: inline-flex;
  gap: 14rpx;
  padding-right: 8rpx;
}

.category-item {
  height: 58rpx;
  padding: 0 22rpx;
  border-radius: 999rpx;
  background: #f4f4f4;
  color: #8d8d8d;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 700;
}

.category-item.active {
  color: #fff;
  background: #2a9f70;
}

.content-list {
  height: calc(100vh - var(--status-bar-height) - 480rpx);
  margin-top: 24rpx;
}

.state-box {
  min-height: 360rpx;
  color: #9a9a9a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
}

.activity-card {
  min-height: 172rpx;
  margin-bottom: 20rpx;
  border-radius: 26rpx;
  background: #ffffff;
  display: flex;
  align-items: stretch;
  padding: 18rpx;
  box-sizing: border-box;
  box-shadow: 0 12rpx 30rpx rgba(20, 20, 20, 0.06);
}

.activity-cover {
  width: 142rpx;
  min-height: 136rpx;
  border-radius: 20rpx;
  overflow: hidden;
  background: #eee;
  flex-shrink: 0;
}

.activity-info {
  flex: 1;
  min-width: 0;
  padding-left: 18rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.tag-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.tag {
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
  background: #fff1e6;
  color: #8a5a2f;
  font-size: 20rpx;
  font-weight: 700;
}

.publish-time {
  color: #b2b2b2;
  font-size: 20rpx;
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
  flex-shrink: 0;
}

.section-label text {
  font-size: 32rpx;
  font-weight: 700;
  color: #262626;
}

.activity-title {
  margin-top: 8rpx;
  font-size: 30rpx;
  color: #222;
  font-weight: 800;
  line-height: 1.2;
}

.activity-sub {
  margin-top: 6rpx;
  font-size: 24rpx;
  color: #9a9a9a;
  line-height: 1.35;
}

.activity-place {
  margin-top: 8rpx;
  color: #b08255;
  font-size: 22rpx;
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

.load-more {
  padding: 20rpx 0;
  text-align: center;
  color: #b2b2b2;
  font-size: 22rpx;
}
</style>
