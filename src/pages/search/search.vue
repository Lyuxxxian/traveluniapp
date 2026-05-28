<template>
  <view class="page">
    <view class="nav-bar">
      <view class="back-btn" @tap="goBack">‹</view>
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input
          class="search-input"
          v-model="keyword"
          placeholder="搜索景点、演出、餐厅"
          placeholder-style="color: #9a8265"
          confirm-type="search"
          focus
          @confirm="submitSearch"
        />
      </view>
      <view class="search-btn" @tap="submitSearch">搜索</view>
    </view>

    <scroll-view scroll-y class="content">
      <view v-if="!searched" class="panel">
        <view class="section-head">
          <text class="section-title">热门搜索</text>
        </view>
        <view class="keyword-row">
          <text class="keyword-chip" v-for="item in hotKeywords" :key="item" @tap="quickSearch(item)">
            {{ item }}
          </text>
        </view>

        <view class="section-head history-head">
          <text class="section-title">搜索历史</text>
          <text class="clear-history" @tap="clearHistory">清空</text>
        </view>
        <view v-if="historyKeywords.length" class="keyword-row">
          <text class="keyword-chip history" v-for="item in historyKeywords" :key="item" @tap="quickSearch(item)">
            {{ item }}
          </text>
        </view>
        <view v-else class="empty-history">暂无搜索历史</view>
      </view>

      <view v-else class="result-wrap">
        <scroll-view scroll-x class="type-scroll" :show-scrollbar="false">
          <view class="type-row">
            <view
              class="type-chip"
              v-for="item in searchTypeOptions"
              :key="item.key"
              :class="{ active: activeType === item.key }"
              @tap="switchType(item.key)"
            >
              <text>{{ item.label }}</text>
            </view>
          </view>
        </scroll-view>

        <view v-if="loading" class="state-box">搜索中...</view>
        <view v-else-if="results.length === 0" class="state-box">没有找到相关内容</view>
        <view v-else class="result-list">
          <view class="result-card" v-for="item in results" :key="`${item.type}-${item.id}`" @tap="openResult(item)">
            <image class="result-cover" :src="item.coverUrl" mode="aspectFill" />
            <view class="result-info">
              <text class="result-tag">{{ item.tagText }}</text>
              <text class="result-title">{{ item.title }}</text>
              <text class="result-subtitle">{{ item.subtitle }}</text>
            </view>
            <text class="result-arrow">›</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { fetchHotKeywords, searchContent, searchTypeOptions } from '../../api/search'
import { goContentTarget } from '../../utils/navigation'

const HISTORY_KEY = 'traveluniapp_search_history'

const keyword = ref('')
const hotKeywords = ref([])
const historyKeywords = ref([])
const activeType = ref('all')
const results = ref([])
const searched = ref(false)
const loading = ref(false)

onLoad((options) => {
  if (options?.keyword) {
    keyword.value = decodeURIComponent(options.keyword)
    submitSearch()
  }
})

onMounted(async () => {
  historyKeywords.value = uni.getStorageSync(HISTORY_KEY) || []
  hotKeywords.value = await fetchHotKeywords()
})

function goBack() {
  uni.navigateBack()
}

function quickSearch(text) {
  keyword.value = text
  submitSearch()
}

function saveHistory(text) {
  const next = [text, ...historyKeywords.value.filter((item) => item !== text)].slice(0, 8)
  historyKeywords.value = next
  uni.setStorageSync(HISTORY_KEY, next)
}

function clearHistory() {
  historyKeywords.value = []
  uni.removeStorageSync(HISTORY_KEY)
}

async function submitSearch() {
  const text = keyword.value.trim()
  if (!text) {
    uni.showToast({ title: '请输入搜索关键词', icon: 'none' })
    return
  }

  searched.value = true
  loading.value = true
  saveHistory(text)

  try {
    const result = await searchContent({
      keyword: text,
      type: activeType.value,
    })
    results.value = result.list
  } catch {
    uni.showToast({ title: '搜索失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function switchType(type) {
  if (activeType.value === type) return
  activeType.value = type
  if (searched.value) submitSearch()
}

function openResult(item) {
  goContentTarget(item.target)
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: calc(var(--status-bar-height) + 18rpx) 24rpx 0;
  box-sizing: border-box;
  background:
    radial-gradient(circle at 12% 0%, rgba(225, 197, 145, 0.34), rgba(225, 197, 145, 0) 34%),
    linear-gradient(180deg, #f6efe2 0%, #f4f5ef 45%, #f7f1e7 100%);
}

.nav-bar {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.back-btn {
  width: 62rpx;
  height: 62rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.78);
  color: #6f451d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 52rpx;
  line-height: 1;
}

.search-box {
  flex: 1;
  height: 70rpx;
  padding: 0 20rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.86);
  display: flex;
  align-items: center;
  box-sizing: border-box;
}

.search-icon {
  margin-right: 10rpx;
  font-size: 24rpx;
}

.search-input {
  flex: 1;
  color: #312416;
  font-size: 26rpx;
}

.search-btn {
  height: 62rpx;
  padding: 0 20rpx;
  border-radius: 999rpx;
  background: #8b6138;
  color: #fffaf0;
  display: flex;
  align-items: center;
  font-size: 24rpx;
  font-weight: 800;
}

.content {
  height: calc(100vh - var(--status-bar-height) - 110rpx);
  margin-top: 24rpx;
}

.panel,
.result-wrap {
  padding-bottom: 40rpx;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.history-head {
  margin-top: 42rpx;
}

.section-title {
  color: #312416;
  font-size: 34rpx;
  font-weight: 800;
}

.clear-history {
  color: #9a8265;
  font-size: 24rpx;
}

.keyword-row {
  margin-top: 20rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.keyword-chip {
  padding: 14rpx 22rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.84);
  color: #7b5529;
  font-size: 25rpx;
  font-weight: 700;
}

.keyword-chip.history {
  background: #fff7ec;
}

.empty-history,
.state-box {
  min-height: 240rpx;
  color: #9a8265;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
}

.type-scroll {
  width: 100%;
  white-space: nowrap;
}

.type-row {
  display: inline-flex;
  gap: 14rpx;
  padding-right: 8rpx;
}

.type-chip {
  height: 58rpx;
  padding: 0 22rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.78);
  color: #9a8265;
  display: inline-flex;
  align-items: center;
  font-size: 24rpx;
  font-weight: 700;
}

.type-chip.active {
  color: #fffaf0;
  background: #8b6138;
}

.result-list {
  margin-top: 22rpx;
}

.result-card {
  min-height: 150rpx;
  margin-bottom: 18rpx;
  padding: 14rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.84);
  display: flex;
  align-items: center;
  box-sizing: border-box;
  box-shadow: 0 14rpx 34rpx rgba(94, 68, 35, 0.1);
}

.result-cover {
  width: 124rpx;
  height: 124rpx;
  border-radius: 20rpx;
  background: #eee;
  flex-shrink: 0;
}

.result-info {
  min-width: 0;
  flex: 1;
  margin-left: 18rpx;
  display: flex;
  flex-direction: column;
}

.result-tag {
  width: fit-content;
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
  background: #f1dfc1;
  color: #7b5529;
  font-size: 20rpx;
  font-weight: 700;
}

.result-title {
  margin-top: 10rpx;
  color: #332619;
  font-size: 28rpx;
  font-weight: 800;
}

.result-subtitle {
  margin-top: 6rpx;
  color: #89745f;
  font-size: 22rpx;
}

.result-arrow {
  color: #b09a7d;
  font-size: 42rpx;
}
</style>
