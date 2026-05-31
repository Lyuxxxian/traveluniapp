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

    <view class="detail-card" v-if="selectedPoint">
      <view class="detail-header">
        <text class="detail-title">{{ selectedPoint.title }}</text>
        <view class="detail-tag">{{ activeCategoryLabel }}</view>
      </view>
      <text class="detail-desc">{{ selectedPoint.desc }}</text>
      <view class="detail-footer">
        <text class="detail-address">{{ selectedPoint.address }}</text>
        <view class="nav-btn" @tap="openNavigation(selectedPoint)">导航</view>
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
const selectedPoint = ref(null)
const canGoBack = ref(false)

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

function focusMapOnPoint(point) {
  if (!point) return
  mapCenter.value = {
    latitude: point.latitude,
    longitude: point.longitude,
  }
  selectedPoint.value = point
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

async function loadPoints(category, options = {}) {
  const keyword = options.keyword || ''
  let list = []
  try {
    list = await fetchMapPoints({ category, keyword: keyword || undefined })
  } catch {
    list = getFallbackPoints(category, keyword)
  }
  if (!list.length) {
    list = getFallbackPoints(category, keyword)
  }
  currentPoints.value = list

  if (options.selectPointId) {
    const target = list.find((item) => item.id === options.selectPointId)
    selectedPoint.value = target || list[0] || null
    if (selectedPoint.value) {
      mapCenter.value = {
        latitude: selectedPoint.value.latitude,
        longitude: selectedPoint.value.longitude,
      }
    }
    return
  }

  if (options.keepSelection && selectedPoint.value) {
    const matched = list.find((item) => item.id === selectedPoint.value?.id)
    selectedPoint.value = matched || list[0] || null
    return
  }

  selectedPoint.value = list[0] || null
  if (options.focusFirst !== false && selectedPoint.value) {
    mapCenter.value = {
      latitude: selectedPoint.value.latitude,
      longitude: selectedPoint.value.longitude,
    }
  }
}

async function applyEntryParams(options = {}) {
  const categoryParam = parseOption(options.category)
  const keyword = parseOption(options.keyword)
  const pointId = parsePointId(options.pointId)

  await loadCategories()

  if (pointId !== undefined) {
    const point = await findPointById(pointId)
    if (point) {
      activeCategory.value = point.category
      await loadPoints(point.category, { selectPointId: pointId })
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
      const preferId = pointId !== undefined ? pointId : matchedList.find((p) => p.category === targetCategory)?.id
      await loadPoints(targetCategory, {
        keyword,
        selectPointId: preferId,
      })
      return
    }

    if (categoryParam) {
      activeCategory.value = resolveCategoryKey(categoryParam)
      await loadPoints(activeCategory.value, { keyword })
      return
    }
  }

  if (categoryParam) {
    activeCategory.value = resolveCategoryKey(categoryParam)
    await loadPoints(activeCategory.value)
    return
  }

  activeCategory.value = resolveCategoryKey('spot')
  await loadPoints(activeCategory.value)
}

onLoad(async (options) => {
  canGoBack.value = getCurrentPages().length > 1
  await applyEntryParams(options || {})
})

const activeCategoryLabel = computed(() => {
  const target = categories.value.find((item) => item.key === activeCategory.value)
  return target ? target.label : ''
})

const currentMarkers = computed(() => {
  const category = categories.value.find((item) => item.key === activeCategory.value)
  return currentPoints.value.map((point) => ({
    id: point.id,
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
  await loadPoints(key, { focusFirst: true })
}

function onMarkerTap(event) {
  const markerId = event?.detail?.markerId
  const target = currentPoints.value.find((item) => item.id === markerId)
  if (target) {
    focusMapOnPoint(target)
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
    await loadPoints(activeCategory.value, { keepSelection: true })
    uni.showToast({ title: '已刷新附近点位', icon: 'none' })
    return
  }
  if (action === 'locate') {
    const defaultSpot = currentPoints.value.find((item) => item.id === 101)
      || fallbackMapPoints.find((item) => item.id === 101)
    if (defaultSpot) {
      activeCategory.value = defaultSpot.category
      await loadPoints(defaultSpot.category, { selectPointId: 101 })
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

.detail-desc {
  margin-top: 16rpx;
  display: block;
  color: #5c4530;
  font-size: 26rpx;
  line-height: 1.6;
  max-height: 170rpx;
  overflow: auto;
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
