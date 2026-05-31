<template>
  <TabBar activeTab="map" :showTabbar="true">
  <view class="page">
    <map
      id="tourMap"
      class="map"
      :latitude="mapCenter.latitude"
      :longitude="mapCenter.longitude"
      :scale="16"
      :markers="currentMarkers"
      :show-location="true"
      :enable-3D="false"
      @markertap="onMarkerTap"
    />

    <view v-if="canGoBack" class="map-back" @tap="goBack">‹</view>

    <view class="top-search" :class="{ 'with-back': canGoBack }">
      <text class="search-icon">🔍</text>
      <text class="search-text">点击输入搜索</text>
    </view>

    <view class="left-menu">
      <view
        class="left-item"
        v-for="item in leftMenuActions"
        :key="item.key"
        @tap="handleLeftAction(item.key)"
      >
        <text class="left-icon">{{ item.icon }}</text>
        <text class="left-label">{{ item.label }}</text>
      </view>
    </view>

    <view class="category-bar">
      <view
        class="category-item"
        v-for="item in categories"
        :key="item.key"
        :class="{ active: activeCategory === item.key }"
        @tap="switchCategory(item.key)"
      >
        <view class="category-icon">{{ item.displayIcon }}</view>
        <text class="category-text">{{ item.label }}</text>
      </view>
    </view>

    <view class="detail-card" v-if="displayPoint">
      <view class="detail-header">
        <text class="detail-title">{{ displayPoint.title }}</text>
        <view class="detail-tag">{{ activeCategoryLabel }}</view>
      </view>
      <image
        v-if="displayPoint.images && displayPoint.images[0]"
        class="detail-cover"
        :src="displayPoint.images[0]"
        mode="aspectFill"
      />
      <view class="detail-meta" v-if="showDetailMeta">
        <text v-if="statusLabel" class="meta-chip status">{{ statusLabel }}</text>
        <text v-if="displayPoint.openTime" class="meta-chip">营业时间 {{ displayPoint.openTime }}</text>
        <text v-if="displayPoint.distanceText" class="meta-chip">{{ displayPoint.distanceText }}</text>
        <text v-if="displayPoint.suggestedDuration" class="meta-chip">建议停留 {{ displayPoint.suggestedDuration }}</text>
      </view>
      <view class="detail-tags" v-if="displayTags.length">
        <text v-for="tag in displayTags" :key="tag" class="tag-chip">{{ tag }}</text>
      </view>
      <text class="detail-desc">{{ displayPoint.desc }}</text>
      <text v-if="detailLoading" class="detail-loading">详情加载中...</text>
      <view class="detail-footer">
        <text class="detail-address">{{ displayPoint.address }}</text>
        <view class="nav-btn" @tap="openNavigation(displayPoint)">导航</view>
      </view>
    </view>
  </view>
  </TabBar>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import TabBar from '../../components/TabBar.vue'
import {
  fallbackMapCategories,
  fallbackMapPoints,
  fetchMapCategories,
  fetchMapPointDetail,
  fetchMapPoints,
} from '../../api/map'

const DEFAULT_MAP_CENTER = {
  latitude: 31.421,
  longitude: 120.108,
}

const mapCenter = ref({ ...DEFAULT_MAP_CENTER })

const categoryIconEmoji = {
  spot: '⛩',
  toilet: '🚻',
  entrance: '🚪',
  drinking: '💧',
  service: '🎧',
  nursery: '👶',
  ticket: '🎫',
  facility: '🔌',
  guide: '📻',
  food: '🍜',
  shop: '🛍',
  hotel: '🏨',
  shuttle: '🚌',
  medical: '⛑',
  rest: '🪑',
  smoking: '🚬',
  plant: '🌿',
  parking: '🅿️',
}

const leftMenuActions = [
  { key: 'life', label: '15分钟\n生活圈', icon: '🧺' },
  { key: 'line', label: '线路推荐', icon: '🧭' },
  { key: 'refresh', label: '刷新', icon: '↻' },
  { key: 'locate', label: '定位', icon: '◎' },
]

const markerIcon =
  'https://cdn-icons-png.flaticon.com/512/684/684908.png'

const categories = ref([])
const currentPoints = ref([])
const activeCategory = ref('spot')
const activeKeyword = ref('')
const selectedPoint = ref(null)
const selectedPointDetail = ref(null)
const detailLoading = ref(false)
const canGoBack = ref(false)
const pointsLoading = ref(false)

let detailRequestSeq = 0

function toDisplayCategories(list) {
  return list.map((item) => ({
    ...item,
    displayIcon: categoryIconEmoji[item.key] || '📍',
  }))
}

function getFallbackPoints(category, keyword = '') {
  let list = fallbackMapPoints.filter((item) => item.category === category)
  const kw = keyword.trim().toLowerCase()
  if (kw) {
    list = list.filter((item) =>
      [item.title, item.desc, item.address, ...(item.tags || [])].some((text) =>
        String(text).toLowerCase().includes(kw),
      ),
    )
  }
  return list
}

function parseOption(value) {
  if (value === undefined || value === null || value === '') return ''
  return decodeURIComponent(String(value))
}

function parsePointId(value) {
  const raw = parseOption(value)
  if (!raw) return undefined
  const id = Number(raw)
  return Number.isFinite(id) ? id : undefined
}

function resolveCategoryKey(categoryKey) {
  if (categoryKey && categories.value.some((item) => item.key === categoryKey)) {
    return categoryKey
  }
  const spot = categories.value.find((item) => item.key === 'spot')
  return spot?.key || categories.value[0]?.key || 'spot'
}

async function loadPointDetail(point) {
  if (!point) return
  const seq = ++detailRequestSeq
  detailLoading.value = true

  try {
    const detail = await fetchMapPointDetail(point.id)
    if (seq !== detailRequestSeq) return
    if (detail && Number(detail.id) === Number(point.id)) {
      selectedPointDetail.value = detail
    }
  } catch {
    if (seq === detailRequestSeq) {
      selectedPointDetail.value = null
    }
  } finally {
    if (seq === detailRequestSeq) {
      detailLoading.value = false
    }
  }
}

function selectPoint(point, options = {}) {
  if (!point) {
    detailRequestSeq += 1
    selectedPoint.value = null
    selectedPointDetail.value = null
    detailLoading.value = false
    return
  }

  mapCenter.value = {
    latitude: point.latitude,
    longitude: point.longitude,
  }
  selectedPoint.value = point

  if (options.loadDetail !== false) {
    loadPointDetail(point)
  }
}

async function findPointById(pointId) {
  try {
    const list = await fetchMapPoints({})
    return list.find((item) => item.id === pointId) || null
  } catch {
    return fallbackMapPoints.find((item) => item.id === pointId) || null
  }
}

async function loadCategories() {
  try {
    const list = await fetchMapCategories()
    categories.value = toDisplayCategories(list.length ? list : fallbackMapCategories)
  } catch {
    categories.value = toDisplayCategories(fallbackMapCategories)
  }
}

function applyPointSelection(list, options = {}) {
  if (options.selectPointId !== undefined) {
    const target = list.find((item) => Number(item.id) === Number(options.selectPointId))
    selectPoint(target || list[0] || null, { loadDetail: true })
    return
  }

  if (options.keepSelection && selectedPoint.value) {
    const matched = list.find((item) => Number(item.id) === Number(selectedPoint.value.id))
    selectPoint(matched || list[0] || null, { loadDetail: true })
    return
  }

  selectPoint(list[0] || null, { loadDetail: options.loadDetail !== false })
}

/** 请求当前分类点位，失败时使用 fallback */
async function loadPoints(category, options = {}) {
  const keyword = options.keyword !== undefined ? options.keyword : activeKeyword.value
  pointsLoading.value = true
  let list = []

  try {
    list = await fetchMapPoints({
      category,
      keyword: keyword ? keyword : undefined,
    })
  } catch {
    list = getFallbackPoints(category, keyword)
  }

  if (!list.length) {
    list = getFallbackPoints(category, keyword)
  }

  currentPoints.value = list
  pointsLoading.value = false
  applyPointSelection(list, options)

  if (!list.length && options.showEmptyToast) {
    uni.showToast({ title: '该分类暂无点位', icon: 'none' })
  }

  return list
}

/** 切换分类或刷新时重新拉取点位 */
async function reloadCurrentCategoryPoints(options = {}) {
  const category = activeCategory.value

  if (options.clearKeyword) {
    activeKeyword.value = ''
  } else if (options.keyword !== undefined) {
    activeKeyword.value = options.keyword
  }

  const showLoading = options.showLoading !== false
  if (showLoading) {
    uni.showLoading({ title: '加载中', mask: true })
  }

  try {
    await loadPoints(category, {
      keyword: activeKeyword.value,
      keepSelection: options.keepSelection,
      selectPointId: options.selectPointId,
      focusFirst: options.focusFirst,
      showEmptyToast: options.showEmptyToast,
    })
  } finally {
    if (showLoading) {
      uni.hideLoading()
    }
  }
}

async function applyEntryParams(options = {}) {
  const categoryParam = parseOption(options.category)
  const keyword = parseOption(options.keyword)
  const pointId = parsePointId(options.pointId)

  activeKeyword.value = keyword
  uni.showLoading({ title: '加载中', mask: true })

  try {
    await loadCategories()

    if (pointId !== undefined) {
      const point = await findPointById(pointId)
      if (point) {
        activeCategory.value = point.category
        activeKeyword.value = keyword
        await loadPoints(point.category, { keyword, selectPointId: pointId, showLoading: false })
        return
      }
    }

    if (keyword) {
      let matchedList = []
      try {
        matchedList = await fetchMapPoints({ keyword })
      } catch {
        matchedList = fallbackMapPoints.filter((item) =>
          [item.title, item.desc, item.address, ...(item.tags || [])].some((text) =>
            String(text).toLowerCase().includes(keyword.toLowerCase()),
          ),
        )
      }

      if (matchedList.length) {
        const targetCategory = categoryParam
          ? resolveCategoryKey(categoryParam)
          : matchedList[0].category
        activeCategory.value = targetCategory
        activeKeyword.value = keyword
        const preferId = matchedList.find((p) => p.category === targetCategory)?.id
        await loadPoints(targetCategory, {
          keyword,
          selectPointId: preferId,
          showLoading: false,
        })
        return
      }

      if (categoryParam) {
        activeCategory.value = resolveCategoryKey(categoryParam)
        await loadPoints(activeCategory.value, { keyword, showLoading: false })
        return
      }
    }

    if (categoryParam) {
      activeCategory.value = resolveCategoryKey(categoryParam)
      activeKeyword.value = ''
      await loadPoints(activeCategory.value, { showLoading: false })
      return
    }

    activeCategory.value = resolveCategoryKey('spot')
    activeKeyword.value = ''
    await loadPoints(activeCategory.value, { showLoading: false })
  } finally {
    uni.hideLoading()
  }
}

onLoad(async (options) => {
  canGoBack.value = getCurrentPages().length > 1
  await applyEntryParams(options || {})
})

const activeCategoryLabel = computed(() => {
  const target = categories.value.find((item) => item.key === activeCategory.value)
  return target ? target.label : ''
})

const displayPoint = computed(() => {
  const base = selectedPoint.value
  if (!base) return null
  const detail = selectedPointDetail.value
  if (detail && Number(detail.id) === Number(base.id)) {
    return { ...base, ...detail }
  }
  return base
})

const statusLabel = computed(() => {
  const status = displayPoint.value?.status
  if (status === 'open') return '开放'
  if (status === 'closed') return '关闭'
  if (status === 'busy') return '繁忙'
  return ''
})

const displayTags = computed(() => {
  const point = displayPoint.value
  if (!point) return []
  const merged = [...(point.tags || []), ...(point.serviceTags || [])]
  return [...new Set(merged)]
})

const showDetailMeta = computed(() => {
  const point = displayPoint.value
  if (!point) return false
  return Boolean(
    statusLabel.value
      || point.openTime
      || point.distanceText
      || point.suggestedDuration,
  )
})

const currentMarkers = computed(() => {
  const category = categories.value.find((item) => item.key === activeCategory.value)
  return currentPoints.value.map((point) => ({
    id: Number(point.id),
    latitude: point.latitude,
    longitude: point.longitude,
    iconPath: markerIcon,
    width: 28,
    height: 28,
    callout: {
      content: point.title,
      color: '#ffffff',
      fontSize: 12,
      borderRadius: 12,
      borderColor: category ? category.color : '#42c79c',
      borderWidth: 1,
      bgColor: category ? category.color : '#42c79c',
      padding: 8,
      display: 'BYCLICK',
    },
  }))
})

async function switchCategory(key) {
  if (activeCategory.value === key) return
  activeCategory.value = key
  await reloadCurrentCategoryPoints({
    clearKeyword: true,
    focusFirst: true,
    showEmptyToast: true,
  })
}

function onMarkerTap(event) {
  const markerId = Number(event?.detail?.markerId)
  const target = currentPoints.value.find((item) => Number(item.id) === markerId)
  if (target) {
    selectPoint(target)
  }
}

function openNavigation(point) {
  uni.openLocation({
    latitude: point.latitude,
    longitude: point.longitude,
    name: point.title,
    address: point.address,
  })
}

function goBack() {
  uni.navigateBack({ delta: 1 })
}

async function handleLeftAction(action) {
  if (action === 'refresh') {
    try {
      await loadCategories()
      await reloadCurrentCategoryPoints({
        keepSelection: true,
        showLoading: false,
        showEmptyToast: true,
      })
      uni.showToast({ title: '已刷新附近点位', icon: 'none' })
    } catch {
      await reloadCurrentCategoryPoints({ keepSelection: true, showLoading: false })
      uni.showToast({ title: '已使用本地数据', icon: 'none' })
    }
    return
  }
  if (action === 'locate') {
    const defaultSpot = fallbackMapPoints.find((item) => item.id === 101)
    if (defaultSpot) {
      activeCategory.value = defaultSpot.category
      activeKeyword.value = ''
      await reloadCurrentCategoryPoints({
        selectPointId: 101,
        clearKeyword: true,
        showLoading: true,
      })
    }
    uni.showToast({ title: '已定位到灵山大佛', icon: 'none' })
    return
  }
  uni.showToast({ title: '功能开发中', icon: 'none' })
}
</script>

<style scoped>
.page {
  height: 100vh;
  position: relative;
  background:
    radial-gradient(circle at 14% 0%, rgba(225, 197, 145, 0.34), rgba(225, 197, 145, 0) 34%),
    linear-gradient(180deg, #f6efe2 0%, #f4f5ef 45%, #f7f1e7 100%);
}

.map {
  width: 100%;
  height: 100%;
}

.map-back {
  position: absolute;
  left: 24rpx;
  top: calc(var(--status-bar-height) + 20rpx);
  z-index: 12;
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: #6f451d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 58rpx;
  line-height: 1;
  box-shadow: 0 14rpx 34rpx rgba(94, 68, 35, 0.1);
}

.top-search {
  position: absolute;
  left: 24rpx;
  right: 24rpx;
  top: calc(var(--status-bar-height) + 20rpx);
  height: 72rpx;
  border-radius: 38rpx;
  background: rgba(255, 255, 255, 0.86);
  border: 1rpx solid rgba(255, 255, 255, 0.72);
  display: flex;
  align-items: center;
  padding: 0 20rpx;
  box-sizing: border-box;
  box-shadow: 0 14rpx 34rpx rgba(94, 68, 35, 0.1);
}

.top-search.with-back {
  left: 112rpx;
}

.search-icon {
  margin-right: 10rpx;
  font-size: 28rpx;
}

.search-text {
  color: #9a8265;
  font-size: 26rpx;
}

.left-menu {
  position: absolute;
  left: 16rpx;
  top: calc(var(--status-bar-height) + 130rpx);
  width: 104rpx;
  background: rgba(255, 255, 255, 0.82);
  border: 1rpx solid rgba(255, 255, 255, 0.72);
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 16rpx 36rpx rgba(94, 68, 35, 0.08);
}

.left-item {
  min-height: 102rpx;
  border-bottom: 1rpx solid rgba(180, 150, 120, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8rpx 6rpx;
  box-sizing: border-box;
}

.left-item:last-child {
  border-bottom: none;
}

.left-icon {
  font-size: 30rpx;
}

.left-label {
  white-space: pre-line;
  margin-top: 4rpx;
  color: #7b5529;
  font-size: 21rpx;
  text-align: center;
}

.category-bar {
  position: absolute;
  left: 16rpx;
  right: 16rpx;
  bottom: 350rpx;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 12rpx;
  padding: 0 4rpx 8rpx;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.category-bar::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

.category-item {
  flex: 0 0 auto;
  min-width: 106rpx;
  height: 106rpx;
  border-radius: 53rpx;
  background: rgba(255, 255, 255, 0.86);
  border: 2rpx solid rgba(255, 255, 255, 0.72);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  box-shadow: 0 10rpx 24rpx rgba(94, 68, 35, 0.08);
}

.category-item.active {
  border-color: #8b6138;
  background: #fff7ec;
  box-shadow: 0 10rpx 24rpx rgba(139, 97, 56, 0.18);
}

.category-icon {
  font-size: 34rpx;
  line-height: 1;
}

.category-text {
  margin-top: 6rpx;
  font-size: 21rpx;
  color: #6f451d;
  font-weight: 700;
}

.detail-card {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 120rpx;
  min-height: 220rpx;
  max-height: 44vh;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 238, 217, 0.98) 100%);
  border-radius: 28rpx 28rpx 0 0;
  border-top: 1rpx solid rgba(182, 138, 75, 0.2);
  padding: 24rpx 24rpx 28rpx;
  box-sizing: border-box;
  box-shadow: 0 -10rpx 30rpx rgba(72, 50, 24, 0.08);
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10rpx;
}

.detail-title {
  font-size: 36rpx;
  font-weight: 800;
  color: #312416;
}

.detail-tag {
  flex: 0 0 auto;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  color: #7b5529;
  background: #f1dfc1;
  font-weight: 700;
}

.detail-cover {
  width: 100%;
  height: 200rpx;
  margin-top: 16rpx;
  border-radius: 16rpx;
  background: #f1dfc1;
}

.detail-meta {
  margin-top: 14rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.meta-chip {
  padding: 6rpx 14rpx;
  border-radius: 16rpx;
  font-size: 22rpx;
  color: #7b5529;
  background: #f7f0e3;
}

.meta-chip.status {
  color: #fffaf0;
  background: #8b6138;
}

.detail-tags {
  margin-top: 12rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.tag-chip {
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  font-size: 20rpx;
  color: #6f5b3e;
  background: rgba(241, 223, 193, 0.85);
}

.detail-desc {
  margin-top: 16rpx;
  display: block;
  color: #5c4530;
  font-size: 26rpx;
  line-height: 1.6;
  max-height: 170rpx;
  overflow: auto;
}

.detail-loading {
  margin-top: 10rpx;
  display: block;
  font-size: 22rpx;
  color: #9a8265;
}

.detail-footer {
  margin-top: 18rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.detail-address {
  flex: 1;
  color: #9a8265;
  font-size: 24rpx;
}

.nav-btn {
  flex: 0 0 auto;
  min-width: 132rpx;
  height: 64rpx;
  border-radius: 999rpx;
  color: #fffaf0;
  background: linear-gradient(135deg, #8b6138 0%, #d8ad6b 100%);
  box-shadow: 0 10rpx 24rpx rgba(139, 97, 56, 0.22);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 800;
}
</style>
