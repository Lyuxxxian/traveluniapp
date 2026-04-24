<template>
  <view class="page">
    <map
      id="tourMap"
      class="map"
      :latitude="mapCenter.latitude"
      :longitude="mapCenter.longitude"
      :scale="14"
      :markers="currentMarkers"
      :show-location="true"
      :enable-3D="false"
      @markertap="onMarkerTap"
    />

    <view class="top-search">
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
        <view class="category-icon">{{ item.icon }}</view>
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
import { computed, ref } from 'vue'

const mapCenter = {
  latitude: 30.547456,
  longitude: 114.312147,
}

const categories = [
  { key: 'spot', label: '景区', icon: '🏞️', color: '#42c79c' },
  { key: 'food', label: '餐厅', icon: '🍜', color: '#ff7f7f' },
  { key: 'toilet', label: '卫生间', icon: '🚻', color: '#66b6ff' },
  { key: 'parking', label: '停车场', icon: '🅿️', color: '#6fd4b9' },
  { key: 'service', label: '服务中心', icon: '🎧', color: '#f7bf51' },
]

const leftMenuActions = [
  { key: 'life', label: '15分钟\n生活圈', icon: '🧺' },
  { key: 'line', label: '线路推荐', icon: '🧭' },
  { key: 'refresh', label: '刷新', icon: '↻' },
  { key: 'locate', label: '定位', icon: '◎' },
]

const markerIcon =
  'https://cdn-icons-png.flaticon.com/512/684/684908.png'

const activeTab = ref('map')
const tabs = [
  { key: 'home', label: '首页', icon: '⌂' },
  { key: 'map', label: '地图', icon: '⌖' },
  { key: 'ai', label: 'AI', icon: '●', isAi: true },
  { key: 'discover', label: '发现', icon: '◈' },
  { key: 'mine', label: '我的', icon: '◉' },
]

const pointsMap = {
  spot: [
    {
      id: 101,
      title: '武汉长江大桥桥头堡',
      latitude: 30.54798,
      longitude: 114.30865,
      address: '武昌区临江大道附近',
      desc: '武汉地标之一，登桥可远眺两江交汇景观，适合城市风光打卡。',
    },
    {
      id: 102,
      title: '黄鹤楼公园',
      latitude: 30.54457,
      longitude: 114.30673,
      address: '武昌区蛇山西山坡特1号',
      desc: '江南三大名楼之一，历史文化底蕴深厚，夜景视角也很出片。',
    },
    {
      id: 103,
      title: '户部巷',
      latitude: 30.54994,
      longitude: 114.30407,
      address: '武昌区自由路',
      desc: '武汉经典小吃街，热干面、豆皮等地方美食集中，步行可达。',
    },
    {
      id: 104,
      title: '晴川阁',
      latitude: 30.54937,
      longitude: 114.29878,
      address: '汉阳区洗马长街86号',
      desc: '隔江与黄鹤楼相望，古建筑群与江景结合，适合休闲拍照。',
    },
  ],
  food: [
    {
      id: 201,
      title: '老通城豆皮',
      latitude: 30.5511,
      longitude: 114.3044,
      address: '武昌区司门口商圈',
      desc: '本地老字号，招牌三鲜豆皮外酥里糯，口味偏传统。',
    },
    {
      id: 202,
      title: '蔡林记',
      latitude: 30.5488,
      longitude: 114.3032,
      address: '武昌区解放路',
      desc: '热干面经典品牌，出餐快，适合游客快速体验武汉早餐文化。',
    },
    {
      id: 203,
      title: '四季美汤包',
      latitude: 30.5522,
      longitude: 114.3008,
      address: '汉阳门附近',
      desc: '老武汉人常去的汤包店，汤汁饱满，搭配蛋酒更地道。',
    },
    {
      id: 204,
      title: '江滩码头餐吧',
      latitude: 30.5465,
      longitude: 114.315,
      address: '临江大道沿线',
      desc: '江景餐厅，晚间氛围好，适合聚餐和夜游前后停留。',
    },
  ],
  toilet: [
    {
      id: 301,
      title: '长江大桥游客公厕',
      latitude: 30.5483,
      longitude: 114.3106,
      address: '桥头游客集散点',
      desc: '距离主游览区较近，便于中途补给与休整。',
    },
    {
      id: 302,
      title: '黄鹤楼东门公厕',
      latitude: 30.544,
      longitude: 114.3074,
      address: '黄鹤楼东门内侧',
      desc: '景区内配套公厕，环境整洁，客流高峰时会排队。',
    },
    {
      id: 303,
      title: '司门口便民公厕',
      latitude: 30.5515,
      longitude: 114.3052,
      address: '司门口步行街口',
      desc: '商圈公共设施，适合逛街路线中途使用。',
    },
  ],
  parking: [
    {
      id: 401,
      title: '黄鹤楼停车场',
      latitude: 30.5432,
      longitude: 114.3079,
      address: '黄鹤楼景区南门',
      desc: '距离黄鹤楼近，节假日建议尽早到达。',
    },
    {
      id: 402,
      title: '司门口地下停车场',
      latitude: 30.5509,
      longitude: 114.3049,
      address: '司门口核心商圈',
      desc: '商业综合体配套车位，适合购物与用餐换乘。',
    },
    {
      id: 403,
      title: '临江大道公共停车点',
      latitude: 30.5474,
      longitude: 114.3138,
      address: '临江大道辅路',
      desc: '靠近江边步道，适合步行观光与拍照打卡。',
    },
  ],
  service: [
    {
      id: 501,
      title: '游客服务中心（桥头）',
      latitude: 30.5472,
      longitude: 114.3097,
      address: '长江大桥武昌桥头',
      desc: '提供导览咨询、行程建议和失物登记。',
    },
    {
      id: 502,
      title: '文旅咨询点（司门口）',
      latitude: 30.5517,
      longitude: 114.3038,
      address: '司门口人流集散区',
      desc: '提供周边景点推荐与公共交通指引。',
    },
    {
      id: 503,
      title: '应急医疗服务点',
      latitude: 30.5459,
      longitude: 114.3111,
      address: '大桥步行观景带',
      desc: '配备基础急救物资，方便处理轻微突发情况。',
    },
  ],
}

const activeCategory = ref('spot')
const selectedPoint = ref(pointsMap.spot[0])

const activeCategoryLabel = computed(() => {
  const target = categories.find((item) => item.key === activeCategory.value)
  return target ? target.label : ''
})

const currentMarkers = computed(() => {
  const category = categories.find((item) => item.key === activeCategory.value)
  const points = pointsMap[activeCategory.value] || []
  return points.map((point) => ({
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

function switchCategory(key) {
  if (activeCategory.value === key) return
  activeCategory.value = key
  const list = pointsMap[key] || []
  selectedPoint.value = list[0] || null
}

function onMarkerTap(event) {
  const markerId = event?.detail?.markerId
  const list = pointsMap[activeCategory.value] || []
  const target = list.find((item) => item.id === markerId)
  if (target) {
    selectedPoint.value = target
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

function handleLeftAction(action) {
  if (action === 'refresh') {
    uni.showToast({ title: '已刷新附近点位', icon: 'none' })
    return
  }
  if (action === 'locate') {
    uni.showToast({ title: '已定位到武汉长江大桥', icon: 'none' })
    return
  }
  uni.showToast({ title: '功能开发中', icon: 'none' })
}

function onTabTap(item) {
  if (item.isAi) return
  activeTab.value = item.key
  if (item.key === 'home') {
    uni.reLaunch({ url: '/pages/index/index' })
    return
  }
  if (item.key === 'map') return
  uni.showToast({ title: `${item.label}页面待开发`, icon: 'none' })
}

function onAiTap() {
  uni.showToast({ title: 'AI助手页面待开发', icon: 'none' })
}
</script>

<style scoped>
.page {
  height: 100vh;
  position: relative;
  background: #f3f6f9;
}

.map {
  width: 100%;
  height: 100%;
}

.top-search {
  position: absolute;
  left: 24rpx;
  right: 24rpx;
  top: 30rpx;
  height: 72rpx;
  border-radius: 38rpx;
  background: rgba(255, 255, 255, 0.96);
  display: flex;
  align-items: center;
  padding: 0 20rpx;
  box-sizing: border-box;
  box-shadow: 0 6rpx 14rpx rgba(0, 0, 0, 0.1);
}

.search-icon {
  margin-right: 10rpx;
  font-size: 28rpx;
}

.search-text {
  color: #878787;
  font-size: 26rpx;
}

.left-menu {
  position: absolute;
  left: 16rpx;
  top: 140rpx;
  width: 104rpx;
  background: rgba(222, 241, 232, 0.96);
  border-radius: 24rpx;
  overflow: hidden;
}

.left-item {
  min-height: 102rpx;
  border-bottom: 1rpx solid rgba(61, 151, 98, 0.15);
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
  color: #2f3c35;
  font-size: 21rpx;
  text-align: center;
}

.category-bar {
  position: absolute;
  left: 16rpx;
  right: 16rpx;
  bottom: 350rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 0 4rpx;
  overflow-x: auto;
}

.category-item {
  flex: 0 0 auto;
  min-width: 106rpx;
  height: 106rpx;
  border-radius: 53rpx;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2rpx solid transparent;
  box-sizing: border-box;
}

.category-item.active {
  border-color: #28bf7d;
  background: #e8fff4;
}

.category-icon {
  font-size: 34rpx;
  line-height: 1;
}

.category-text {
  margin-top: 6rpx;
  font-size: 21rpx;
  color: #3a3a3a;
}

.detail-card {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 120rpx;
  min-height: 220rpx;
  max-height: 44vh;
  background: #fff;
  border-radius: 28rpx 28rpx 0 0;
  padding: 24rpx 24rpx 28rpx;
  box-sizing: border-box;
  box-shadow: 0 -6rpx 18rpx rgba(0, 0, 0, 0.08);
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10rpx;
}

.detail-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #212121;
}

.detail-tag {
  flex: 0 0 auto;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  color: #2a9f70;
  background: #eafaf2;
}

.detail-desc {
  margin-top: 16rpx;
  display: block;
  color: #4e4e4e;
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
  color: #666;
  font-size: 24rpx;
}

.nav-btn {
  flex: 0 0 auto;
  min-width: 132rpx;
  height: 64rpx;
  border-radius: 32rpx;
  color: #fff;
  background: linear-gradient(135deg, #35d087 0%, #24b774 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 600;
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
