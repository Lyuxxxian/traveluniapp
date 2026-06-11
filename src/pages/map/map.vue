<template>
  <TabBar activeTab="map" :showTabbar="true">
  <view class="page">
    <!-- #ifdef H5 -->
    <div id="amap-h5-container" class="map h5-map-host"></div>
    <!-- #endif -->
    <!-- #ifndef H5 -->
    <map
      id="tourMap"
      class="map"
      :latitude="mapCenter.latitude"
      :longitude="mapCenter.longitude"
      :scale="mapScale"
      :markers="currentMarkers"
      :show-location="true"
      :enable-3D="false"
      @markertap="onMarkerTap"
      @regionchange="onMapRegionChange"
    />
    <!-- #endif -->

    <view v-if="canGoBack" class="map-back" @tap="goBack">‹</view>

    <view class="top-search" :class="{ 'with-back': canGoBack, 'with-filter': activeKeyword }">
      <text class="search-icon">🔍</text>
      <input
        class="search-input"
        v-model="mapSearchKeyword"
        placeholder="搜索地图点位"
        placeholder-style="color: #9a8265"
        confirm-type="search"
        @confirm="submitMapSearch"
      />
      <view class="search-global-btn" @tap.stop="goGlobalSearch">全站</view>
    </view>
    <view v-if="activeKeyword" class="keyword-filter-bar" :class="{ 'with-back': canGoBack }" @tap="clearMapSearch">
      <text class="keyword-filter-text">筛选：{{ activeKeyword }}</text>
      <text class="keyword-filter-clear">清除</text>
    </view>

    <view class="left-menu" :class="{ 'has-filter': activeKeyword }">
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

    <view v-if="showMapLoading" class="map-loading-mask">
      <text>地图加载中...</text>
    </view>

    <scroll-view
      v-show="pageReady && categories.length"
      class="category-scroll"
      :class="{ 'has-filter': activeKeyword }"
      scroll-x
      scroll-with-animation
      :show-scrollbar="false"
      :scroll-into-view="categoryScrollIntoView"
    >
      <view class="category-bar-inner">
        <view
          class="category-item"
          v-for="item in categories"
          :key="item.key"
          :id="'cat-' + item.key"
          :class="{ active: activeCategory === item.key }"
          @tap="switchCategory(item.key)"
        >
          <view class="category-icon">{{ item.displayIcon }}</view>
          <text class="category-text">{{ item.label }}</text>
        </view>
      </view>
    </scroll-view>
    <view v-if="activeRoute" class="route-banner">
      <view class="route-banner-head">
        <text class="route-banner-title">{{ activeRoute.title }}</text>
        <text class="route-banner-exit" @tap="exitSpecialMapMode">退出</text>
      </view>
      <text class="route-banner-desc">{{ activeRoute.desc }} · {{ activeRoute.durationText }}</text>
      <view class="route-banner-actions">
        <text class="route-action-btn" @tap="showPrevRoutePoint">上一站</text>
        <text class="route-action-btn primary" @tap="showNextRoutePoint">下一站</text>
      </view>
    </view>

    <view v-else-if="mapMode === 'lifeCircle'" class="route-banner life">
      <view class="route-banner-head">
        <text class="route-banner-title">15分钟生活圈</text>
        <text class="route-banner-exit" @tap="exitSpecialMapMode">退出</text>
      </view>
      <text class="route-banner-desc">卫生间 · 停车场 · 游客服务 · 饮用水 · 母婴室 · 医务</text>
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
        <view class="detail-actions">
          <view class="action-btn outline" @tap="goWriteReview">写点评</view>
          <view class="nav-btn" @tap="openNavigation(displayPoint)">导航</view>
        </view>
      </view>
    </view>
  </view>
  </TabBar>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch, nextTick } from 'vue'
import { onLoad, onReady } from '@dcloudio/uni-app'
// #ifdef H5
import {
  buildH5Markers,
  createH5Map,
  H5_MAP_CONTAINER_ID,
  loadAmapH5,
  toLngLat,
  waitForH5MapContainer,
} from '../../utils/amapH5'
// #endif
import TabBar from '../../components/TabBar.vue'
import { goReviewEdit } from '../../utils/navigation'
import {
  fallbackMapCategories,
  fallbackMapPoints,
  fetchMapCategories,
  fetchMapPointDetail,
  fetchMapPoints,
  fetchMapRoutes,
} from '../../api/map'

const DEFAULT_MAP_CENTER = {
  latitude: 31.424845,
  longitude: 120.100125,
}

const mapCenter = ref({ ...DEFAULT_MAP_CENTER })
const mapScale = ref(16)

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

const LIFE_CIRCLE_CATEGORIES = ['service', 'toilet', 'parking', 'drinking', 'nursery', 'medical']

const leftMenuActions = [
  { key: 'life', label: '15分钟\n生活圈', icon: '🧺' },
  { key: 'line', label: '线路推荐', icon: '🧭' },
  { key: 'refresh', label: '刷新', icon: '↻' },
  { key: 'locate', label: '定位', icon: '◎' },
]

const categories = ref([])
const currentPoints = ref([])
const activeCategory = ref('spot')
const activeKeyword = ref('')
const mapSearchKeyword = ref('')
const selectedPoint = ref(null)
const selectedPointDetail = ref(null)
const detailLoading = ref(false)
const canGoBack = ref(false)
const pointsLoading = ref(false)
const mapMode = ref('category')
const activeRoute = ref(null)
const routePointIndex = ref(0)
const userLocation = ref(null)
const pageReady = ref(false)
const categoryScrollIntoView = ref('')
const h5MapReady = ref(true)

// #ifdef H5
h5MapReady.value = false
// #endif

const showMapLoading = computed(() => !pageReady.value || !h5MapReady.value)

/** 8b：限制同屏 marker 数量，避免上百点位卡顿 */
const MAX_MAP_MARKERS = 80
const CATEGORY_SMALL_POINT_COUNT = 12
const CATEGORY_OVERVIEW_MARKERS = 8
const CATEGORY_MID_ZOOM_MARKERS = 18

let detailRequestSeq = 0

function toDisplayCategories(list) {
  return list.map((item) => ({
    ...item,
    displayIcon: categoryIconEmoji[item.key] || '📍',
  }))
}

function getCategoryMeta(categoryKey) {
  const category = categories.value.find((item) => item.key === categoryKey)
  return {
    color: category?.color || '#42c79c',
    icon: category?.displayIcon || categoryIconEmoji[categoryKey] || '📍',
  }
}

function buildMarkerIconDataUrl(iconText, color) {
  const safeIcon = String(iconText || '📍')
  const safeColor = String(color || '#42c79c')
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
      <path d="M32 4c-12.7 0-23 10.3-23 23 0 17.2 23 33 23 33s23-15.8 23-33C55 14.3 44.7 4 32 4z" fill="${safeColor}" stroke="#ffffff" stroke-width="4"/>
      <circle cx="32" cy="27" r="14" fill="rgba(255,255,255,.92)"/>
      <text x="32" y="33" font-size="22" text-anchor="middle" dominant-baseline="middle">${safeIcon}</text>
    </svg>
  `
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
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

function resetMapCenterToDefault() {
  mapCenter.value = { ...DEFAULT_MAP_CENTER }
  mapScale.value = 16
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
  if (!categories.value.length) {
    categories.value = toDisplayCategories(fallbackMapCategories)
  }
}

async function ensureMapFallbackState() {
  if (!categories.value.length) {
    categories.value = toDisplayCategories(fallbackMapCategories)
  }
  if (!activeCategory.value || !categories.value.some((item) => item.key === activeCategory.value)) {
    activeCategory.value = categories.value[0]?.key || 'spot'
  }
  if (!currentPoints.value.length) {
    await loadPoints(activeCategory.value, { showLoading: false, loadDetail: true })
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

  if (options.focusFirst) {
    selectPoint(list[0] || null, { loadDetail: options.loadDetail !== false })
    return
  }

  selectPoint(null)
  if (options.resetCenter !== false) {
    resetMapCenterToDefault()
  }
}

/** 请求当前分类点位，失败时使用 fallback */
function sortPointsByLocation(list, latitude, longitude) {
  if (latitude === undefined || longitude === undefined) return list
  const toRad = (deg) => (deg * Math.PI) / 180
  const earthRadiusKm = 6371
  const distanceKm = (lat1, lng1, lat2, lng2) => {
    const dLat = toRad(lat2 - lat1)
    const dLng = toRad(lng2 - lng1)
    const a =
      Math.sin(dLat / 2) ** 2
      + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
    return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }
  const formatDistance = (km) => (km < 1 ? `距您约${Math.round(km * 1000)}米` : `距您约${km.toFixed(1)}公里`)

  return [...list]
    .map((item) => {
      const km = distanceKm(latitude, longitude, item.latitude, item.longitude)
      return { item, km }
    })
    .sort((a, b) => a.km - b.km)
    .map(({ item, km }) => ({ ...item, distanceText: formatDistance(km) }))
}

async function loadPoints(category, options = {}) {
  const keyword = options.keyword !== undefined ? options.keyword : activeKeyword.value
  const latitude = options.latitude ?? userLocation.value?.latitude
  const longitude = options.longitude ?? userLocation.value?.longitude
  pointsLoading.value = true
  let list = []

  try {
    list = await fetchMapPoints({
      category,
      keyword: keyword ? keyword : undefined,
      latitude,
      longitude,
    })
  } catch {
    list = getFallbackPoints(category, keyword)
    list = sortPointsByLocation(list, latitude, longitude)
  }

  if (!list.length) {
    list = sortPointsByLocation(getFallbackPoints(category, keyword), latitude, longitude)
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
      resetCenter: options.resetCenter,
      showEmptyToast: options.showEmptyToast,
    })
  } finally {
    if (showLoading) {
      uni.hideLoading()
    }
  }
}

function matchPointsByKeyword(keyword) {
  const kw = keyword.trim().toLowerCase()
  if (!kw) return []
  return fallbackMapPoints.filter((item) =>
    [item.title, item.desc, item.address, ...(item.tags || [])].some((text) =>
      String(text).toLowerCase().includes(kw),
    ),
  )
}

async function applyMapKeywordSearch(keyword) {
  const kw = keyword.trim()
  exitSpecialMapMode()
  activeKeyword.value = kw
  mapSearchKeyword.value = kw

  if (!kw) {
    await clearMapSearch()
    return
  }

  uni.showLoading({ title: '搜索中', mask: true })
  try {
    let matchedList = []
    try {
      matchedList = await fetchMapPoints({ keyword: kw })
    } catch {
      matchedList = matchPointsByKeyword(kw)
    }

    if (!matchedList.length) {
      currentPoints.value = []
      selectPoint(null)
      uni.showToast({ title: '未找到相关点位', icon: 'none' })
      return
    }

    const keepCurrentCategory = matchedList.some((item) => item.category === activeCategory.value)
    const targetCategory = keepCurrentCategory ? activeCategory.value : matchedList[0].category
    const preferId = matchedList.find((item) => item.category === targetCategory)?.id

    activeCategory.value = targetCategory
    await reloadCurrentCategoryPoints({
      keyword: kw,
      selectPointId: preferId,
      showLoading: false,
      showEmptyToast: true,
    })
  } finally {
    uni.hideLoading()
  }
}

async function submitMapSearch() {
  await applyMapKeywordSearch(mapSearchKeyword.value)
}

async function clearMapSearch() {
  mapSearchKeyword.value = ''
  activeKeyword.value = ''
  await reloadCurrentCategoryPoints({
    clearKeyword: true,
    focusFirst: true,
    showEmptyToast: false,
  })
}

function goGlobalSearch() {
  const kw = mapSearchKeyword.value.trim()
  const query = kw ? `?keyword=${encodeURIComponent(kw)}` : ''
  uni.navigateTo({ url: `/pages/search/search${query}` })
}

async function applyEntryParams(options = {}) {
  exitSpecialMapMode()
  const categoryParam = parseOption(options.category)
  const keyword = parseOption(options.keyword)
  const pointId = parsePointId(options.pointId)

  activeKeyword.value = keyword
  mapSearchKeyword.value = keyword
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
        matchedList = matchPointsByKeyword(keyword)
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
  } catch {
    categories.value = toDisplayCategories(fallbackMapCategories)
    activeCategory.value = 'spot'
    activeKeyword.value = ''
    mapSearchKeyword.value = ''
    await loadPoints('spot', { showLoading: false })
  } finally {
    await ensureMapFallbackState()
    uni.hideLoading()
    pageReady.value = true
  }
}

async function bootstrapMapPage(options = {}) {
  pageReady.value = false
  canGoBack.value = getCurrentPages().length > 1
  try {
    await applyEntryParams(options)
  } catch {
    categories.value = toDisplayCategories(fallbackMapCategories)
    activeCategory.value = 'spot'
    activeKeyword.value = ''
    mapSearchKeyword.value = ''
    await loadPoints('spot', { showLoading: false })
    await ensureMapFallbackState()
    pageReady.value = true
    uni.hideLoading()
    uni.showToast({ title: '已使用本地地图数据', icon: 'none' })
  }
}

onLoad((options) => {
  bootstrapMapPage(options || {})
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

const markerDisplayPoints = computed(() => {
  const points = currentPoints.value
  if (points.length <= CATEGORY_SMALL_POINT_COUNT) return points

  if (mapMode.value !== 'category' || activeKeyword.value) {
    if (points.length <= MAX_MAP_MARKERS) return points
  }

  const selectedId = selectedPoint.value?.id
  const zoom = Number(mapScale.value) || 16
  const limit = mapMode.value === 'category' && !activeKeyword.value
    ? zoom >= 18
      ? MAX_MAP_MARKERS
      : zoom >= 17
        ? CATEGORY_MID_ZOOM_MARKERS
        : CATEGORY_OVERVIEW_MARKERS
    : MAX_MAP_MARKERS

  let list = points.slice(0, limit)
  if (selectedId !== undefined && !list.some((item) => Number(item.id) === Number(selectedId))) {
    const selected = points.find((item) => Number(item.id) === Number(selectedId))
    if (selected) {
      list = [selected, ...list.slice(0, limit - 1)]
    }
  }
  return list
})

const markersTruncated = computed(
  () => currentPoints.value.length > markerDisplayPoints.value.length,
)

watch(activeCategory, async (key) => {
  if (!key) return
  categoryScrollIntoView.value = ''
  await nextTick()
  categoryScrollIntoView.value = `cat-${key}`
})

// #ifdef H5
let amapInstance = null
let amapNamespace = null
let h5MapInitStarted = false
const amapMarkerLayers = []

function resolveH5MarkerColor() {
  const category = categories.value.find((item) => item.key === activeCategory.value)
  if (mapMode.value === 'route') return '#5c7a9e'
  if (mapMode.value === 'lifeCircle') return '#7b9eb3'
  return category?.color || '#42c79c'
}

function syncH5MapCenter() {
  if (!amapInstance) return
  amapInstance.setCenter(toLngLat(mapCenter.value))
  if (typeof amapInstance.setZoom === 'function') {
    amapInstance.setZoom(mapScale.value)
  }
}

function syncH5MapMarkers() {
  if (!amapInstance || !amapNamespace) return

  if (amapMarkerLayers.length) {
    amapInstance.remove(amapMarkerLayers)
    amapMarkerLayers.length = 0
  }

  const markers = buildH5Markers(amapNamespace, {
    points: markerDisplayPoints.value.map((point) => ({
      id: Number(point.id),
      latitude: point.latitude,
      longitude: point.longitude,
      title: point.title,
      iconText: getCategoryMeta(point.iconKey || point.category).icon,
      iconColor: getCategoryMeta(point.iconKey || point.category).color,
    })),
    markerColor: resolveH5MarkerColor(),
    routeMode: mapMode.value === 'route',
    onMarkerClick: (pointId) => {
      const target = currentPoints.value.find((item) => Number(item.id) === pointId)
      if (target) selectPoint(target)
    },
  })

  amapMarkerLayers.push(...markers)
  amapInstance.add(markers)
}

async function initH5AmapMap() {
  if (amapInstance || h5MapInitStarted) return
  h5MapInitStarted = true

  try {
    await waitForH5MapContainer(H5_MAP_CONTAINER_ID)
    amapNamespace = await loadAmapH5()
    amapInstance = createH5Map(amapNamespace, H5_MAP_CONTAINER_ID, mapCenter.value)
    amapInstance.on('zoomend', () => {
      const zoom = typeof amapInstance?.getZoom === 'function' ? Number(amapInstance.getZoom()) : mapScale.value
      if (Number.isFinite(zoom)) {
        mapScale.value = zoom
      }
    })
    syncH5MapMarkers()
    if (typeof amapInstance.resize === 'function') {
      amapInstance.resize()
    }
    h5MapReady.value = true
  } catch (error) {
    h5MapInitStarted = false
    console.error('[map][h5]', error)
    h5MapReady.value = true
    uni.showToast({
      title: '高德地图加载失败，请检查 Key 配置',
      icon: 'none',
      duration: 3000,
    })
  }
}

function scheduleH5AmapInit() {
  void nextTick(() => initH5AmapMap())
}

onMounted(scheduleH5AmapInit)
onReady(scheduleH5AmapInit)

onUnmounted(() => {
  if (amapInstance) {
    amapInstance.destroy()
    amapInstance = null
  }
  amapMarkerLayers.length = 0
  amapNamespace = null
})

watch(
  () => [
    mapCenter.value.latitude,
    mapCenter.value.longitude,
  ],
  () => {
    if (!amapInstance) return
    syncH5MapCenter()
  },
)

watch(
  () => [
    markerDisplayPoints.value.map((item) => item.id).join(','),
    mapMode.value,
    activeCategory.value,
    mapScale.value,
  ],
  () => {
    if (!amapInstance) return
    syncH5MapMarkers()
  },
)

watch(pageReady, (ready) => {
  if (!ready || !amapInstance) return
  syncH5MapCenter()
  syncH5MapMarkers()
  if (typeof amapInstance.resize === 'function') {
    amapInstance.resize()
  }
})
// #endif

const currentMarkers = computed(() => {
  const category = categories.value.find((item) => item.key === activeCategory.value)
  const routeColor = '#5c7a9e'
  const lifeColor = '#7b9eb3'
  const markerColor = mapMode.value === 'route'
    ? routeColor
    : mapMode.value === 'lifeCircle'
      ? lifeColor
      : (category ? category.color : '#42c79c')

  return markerDisplayPoints.value.map((point, index) => ({
    ...(() => {
      const meta = getCategoryMeta(point.iconKey || point.category)
      return {
        iconPath: buildMarkerIconDataUrl(meta.icon, meta.color),
      }
    })(),
    id: Number(point.id),
    latitude: point.latitude,
    longitude: point.longitude,
    width: 32,
    height: 32,
    callout: {
      content: mapMode.value === 'route' ? `${index + 1}. ${point.title}` : point.title,
      color: '#ffffff',
      fontSize: 12,
      borderRadius: 12,
      borderColor: markerColor,
      borderWidth: 1,
      bgColor: markerColor,
      padding: 8,
      display: 'BYCLICK',
    },
  }))
})

function exitSpecialMapMode() {
  mapMode.value = 'category'
  activeRoute.value = null
  routePointIndex.value = 0
}

function getRoutePoints(route) {
  return route.pointIds
    .map((id) => fallbackMapPoints.find((item) => Number(item.id) === Number(id)))
    .filter(Boolean)
}

function applyRoute(route) {
  mapMode.value = 'route'
  activeRoute.value = route
  activeKeyword.value = ''
  mapSearchKeyword.value = ''

  const points = getRoutePoints(route)
  currentPoints.value = points
  routePointIndex.value = 0
  if (points.length) {
    selectPoint(points[0])
  } else {
    selectPoint(null)
    uni.showToast({ title: '线路点位暂无数据', icon: 'none' })
  }
}

async function openRoutePicker() {
  try {
    const routes = await fetchMapRoutes()
    if (!routes.length) {
      uni.showToast({ title: '暂无推荐线路', icon: 'none' })
      return
    }
    uni.showActionSheet({
      itemList: routes.map((item) => `${item.title}（${item.durationText}）`),
      success: (res) => {
        const route = routes[res.tapIndex]
        if (route) applyRoute(route)
      },
    })
  } catch {
    uni.showToast({ title: '线路加载失败', icon: 'none' })
  }
}

function showRoutePointByIndex(index) {
  const points = currentPoints.value
  if (!points.length) return
  const nextIndex = (index + points.length) % points.length
  routePointIndex.value = nextIndex
  selectPoint(points[nextIndex])
}

function showNextRoutePoint() {
  showRoutePointByIndex(routePointIndex.value + 1)
}

function showPrevRoutePoint() {
  showRoutePointByIndex(routePointIndex.value - 1)
}

async function openLifeCircle() {
  exitSpecialMapMode()
  mapMode.value = 'lifeCircle'
  activeRoute.value = null
  activeKeyword.value = ''
  mapSearchKeyword.value = ''

  uni.showLoading({ title: '加载中', mask: true })
  try {
    let points = []
    try {
      const batches = await Promise.all(
        LIFE_CIRCLE_CATEGORIES.map((key) => fetchMapPoints({
          category: key,
          latitude: userLocation.value?.latitude,
          longitude: userLocation.value?.longitude,
        })),
      )
      points = batches.flat()
    } catch {
      points = fallbackMapPoints.filter((item) => LIFE_CIRCLE_CATEGORIES.includes(item.category))
      points = sortPointsByLocation(points, userLocation.value?.latitude, userLocation.value?.longitude)
    }

    currentPoints.value = points
    if (points.length) {
      selectPoint(points[0])
      uni.showToast({ title: `已显示${points.length}个生活设施`, icon: 'none' })
    } else {
      selectPoint(null)
      uni.showToast({ title: '暂无生活圈设施', icon: 'none' })
    }
  } finally {
    uni.hideLoading()
  }
}

async function locateUser() {
  uni.showLoading({ title: '定位中', mask: true })
  try {
    const location = await new Promise((resolve, reject) => {
      uni.getLocation({
        type: 'gcj02',
        success: resolve,
        fail: reject,
      })
    })

    userLocation.value = {
      latitude: location.latitude,
      longitude: location.longitude,
    }
    mapCenter.value = {
      latitude: location.latitude,
      longitude: location.longitude,
    }

    exitSpecialMapMode()
    mapSearchKeyword.value = ''
    activeKeyword.value = ''

    let list = []
    try {
      list = await fetchMapPoints({
        category: activeCategory.value,
        latitude: location.latitude,
        longitude: location.longitude,
      })
    } catch {
      list = sortPointsByLocation(
        getFallbackPoints(activeCategory.value),
        location.latitude,
        location.longitude,
      )
    }

    if (!list.length) {
      list = sortPointsByLocation(fallbackMapPoints, location.latitude, location.longitude).slice(0, 30)
    }

    currentPoints.value = list
    if (list.length) {
      selectPoint(list[0])
      uni.showToast({ title: '已定位到附近点位', icon: 'none' })
    } else {
      selectPoint(null)
      uni.showToast({ title: '附近暂无点位', icon: 'none' })
    }
  } catch {
    const defaultSpot = fallbackMapPoints.find((item) => item.id === 101)
    if (defaultSpot) {
      activeCategory.value = defaultSpot.category
      await reloadCurrentCategoryPoints({
        selectPointId: 101,
        clearKeyword: true,
        showLoading: false,
      })
    }
    uni.showToast({ title: '定位失败，已显示默认位置', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

async function switchCategory(key) {
  if (activeCategory.value === key && mapMode.value === 'category') return
  exitSpecialMapMode()
  activeCategory.value = key
  mapSearchKeyword.value = ''
  await reloadCurrentCategoryPoints({
    clearKeyword: true,
    resetCenter: true,
    showEmptyToast: true,
  })
}

function onMapRegionChange(event) {
  const scale = Number(event?.detail?.scale)
  if (Number.isFinite(scale)) {
    mapScale.value = scale
  }
}

function onMarkerTap(event) {
  const markerId = Number(event?.detail?.markerId)
  const target = currentPoints.value.find((item) => Number(item.id) === markerId)
  if (target) {
    selectPoint(target)
  }
}

function openNavigation(point) {
  if (!point || !Number.isFinite(point.latitude) || !Number.isFinite(point.longitude)) {
    uni.showToast({ title: '暂无法导航', icon: 'none' })
    return
  }
  // #ifdef H5
  const name = encodeURIComponent(point.title || '目的地')
  const address = encodeURIComponent(point.address || point.title || '目的地')
  window.open(
    `https://uri.amap.com/marker?position=${point.longitude},${point.latitude}&name=${name}&content=${address}&coordinate=gaode&callnative=0`,
    '_blank',
  )
  return
  // #endif
  uni.openLocation({
    latitude: point.latitude,
    longitude: point.longitude,
    name: point.title,
    address: point.address || point.title,
  })
}

function goWriteReview() {
  const point = displayPoint.value
  if (!point?.id) return
  goReviewEdit({
    targetType: 'spot',
    targetId: Number(point.id),
    title: point.title,
  })
}

function goBack() {
  uni.navigateBack({ delta: 1 })
}

async function handleLeftAction(action) {
  if (action === 'line') {
    await openRoutePicker()
    return
  }
  if (action === 'life') {
    await openLifeCircle()
    return
  }
  if (action === 'refresh') {
    if (mapMode.value === 'route' && activeRoute.value) {
      applyRoute(activeRoute.value)
      uni.showToast({ title: '已刷新线路点位', icon: 'none' })
      return
    }
    if (mapMode.value === 'lifeCircle') {
      await openLifeCircle()
      return
    }
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
    await locateUser()
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

/* #ifdef H5 */
.h5-map-host,
#amap-h5-container {
  width: 100%;
  height: 100%;
  min-height: 100vh;
  position: relative;
}
/* #endif */

.map-loading-mask {
  position: absolute;
  left: 50%;
  top: 45%;
  z-index: 20;
  transform: translate(-50%, -50%);
  padding: 20rpx 32rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.92);
  color: #7b5529;
  font-size: 26rpx;
  box-shadow: 0 10rpx 28rpx rgba(94, 68, 35, 0.12);
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

.top-search.with-filter {
  top: calc(var(--status-bar-height) + 20rpx);
}

.search-icon {
  flex: 0 0 auto;
  margin-right: 10rpx;
  font-size: 28rpx;
}

.search-input {
  flex: 1;
  min-width: 0;
  height: 72rpx;
  font-size: 26rpx;
  color: #5c4530;
}

.search-global-btn {
  flex: 0 0 auto;
  margin-left: 10rpx;
  padding: 0 16rpx;
  height: 48rpx;
  line-height: 48rpx;
  border-radius: 24rpx;
  font-size: 22rpx;
  color: #7b5529;
  background: #f1dfc1;
  font-weight: 700;
}

.keyword-filter-bar {
  position: absolute;
  left: 24rpx;
  right: 24rpx;
  top: calc(var(--status-bar-height) + 100rpx);
  z-index: 11;
  height: 52rpx;
  padding: 0 20rpx;
  border-radius: 26rpx;
  background: rgba(255, 247, 236, 0.94);
  border: 1rpx solid rgba(139, 97, 56, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  box-shadow: 0 8rpx 20rpx rgba(94, 68, 35, 0.08);
}

.keyword-filter-bar.with-back {
  left: 112rpx;
}

.keyword-filter-text {
  font-size: 22rpx;
  color: #7b5529;
}

.keyword-filter-clear {
  font-size: 22rpx;
  color: #8b6138;
  font-weight: 700;
}

.left-menu {
  position: absolute;
  left: 16rpx;
  top: calc(var(--status-bar-height) + 250rpx);
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

.left-menu.has-filter {
  top: calc(var(--status-bar-height) + 300rpx);
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

.category-scroll {
  position: absolute;
  left: 16rpx;
  right: 16rpx;
  top: calc(var(--status-bar-height) + 106rpx);
  z-index: 12;
  white-space: nowrap;
}

.category-scroll.has-filter {
  top: calc(var(--status-bar-height) + 160rpx);
}

.category-bar-inner {
  display: inline-flex;
  align-items: center;
  gap: 12rpx;
  padding: 0 4rpx 8rpx;
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

.route-banner {
  position: absolute;
  left: 16rpx;
  right: 16rpx;
  bottom: 430rpx;
  z-index: 10;
  padding: 18rpx 20rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.94);
  border: 1rpx solid rgba(92, 122, 158, 0.25);
  box-shadow: 0 10rpx 28rpx rgba(72, 50, 24, 0.1);
  box-sizing: border-box;
}

.route-banner.life {
  border-color: rgba(123, 158, 179, 0.35);
}

.route-banner-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.route-banner-title {
  font-size: 28rpx;
  font-weight: 800;
  color: #312416;
}

.route-banner-exit {
  font-size: 22rpx;
  color: #8b6138;
  font-weight: 700;
}

.route-banner-desc {
  margin-top: 8rpx;
  display: block;
  font-size: 22rpx;
  color: #7b5529;
  line-height: 1.5;
}

.route-banner-actions {
  margin-top: 12rpx;
  display: flex;
  gap: 12rpx;
}

.route-action-btn {
  flex: 1;
  height: 56rpx;
  border-radius: 28rpx;
  background: #f1dfc1;
  color: #7b5529;
  font-size: 24rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.route-action-btn.primary {
  color: #fffaf0;
  background: linear-gradient(135deg, #5c7a9e 0%, #8fbdda 100%);
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
}

.detail-address {
  display: block;
  color: #9a8265;
  font-size: 24rpx;
}

.detail-actions {
  margin-top: 14rpx;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12rpx;
}

.action-btn {
  flex: 0 0 auto;
  min-width: 120rpx;
  height: 64rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  font-weight: 700;
}

.action-btn.outline {
  color: #6f451d;
  background: rgba(255, 255, 255, 0.92);
  border: 1rpx solid rgba(139, 97, 56, 0.35);
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
