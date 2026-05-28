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
  </view>
  </TabBar>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import TabBar from '../../components/TabBar.vue'

const mapCenter = {
  latitude: 31.421,
  longitude: 120.108,
}

const categories = [
  { key: 'spot', label: '景点', icon: '⛩', color: '#8b6138' },
  { key: 'food', label: '素斋', icon: '🍜', color: '#c77d45' },
  { key: 'toilet', label: '卫生间', icon: '🚻', color: '#7b9eb3' },
  { key: 'parking', label: '停车场', icon: '🅿️', color: '#8b9a6b' },
  { key: 'service', label: '服务', icon: '🎧', color: '#c4a35a' },
]

const leftMenuActions = [
  { key: 'life', label: '15分钟\n生活圈', icon: '🧺' },
  { key: 'line', label: '线路推荐', icon: '🧭' },
  { key: 'refresh', label: '刷新', icon: '↻' },
  { key: 'locate', label: '定位', icon: '◎' },
]

const markerIcon =
  'https://cdn-icons-png.flaticon.com/512/684/684908.png'

const pointsMap = {
  spot: [
    {
      id: 101,
      title: '灵山大佛',
      latitude: 31.421,
      longitude: 120.108,
      address: '无锡市滨湖区马山灵山路1号',
      desc: '世界露天青铜释迦牟尼立像，高88米，瞻礼灵山大佛感受佛教文化的庄严与宁静。',
    },
    {
      id: 102,
      title: '灵山梵宫',
      latitude: 31.4222,
      longitude: 120.1075,
      address: '灵山大佛景区内东侧',
      desc: '金色穹顶、壁画与木雕交织成东方美学，是佛教文化艺术的神圣殿堂。',
    },
    {
      id: 103,
      title: '祥符禅寺',
      latitude: 31.4205,
      longitude: 120.1072,
      address: '灵山大佛景区入口北侧',
      desc: '千年古刹，灵山胜境发祥地，寺内古树参天殿宇庄严，是祈福朝圣起点。',
    },
    {
      id: 104,
      title: '五印坛城',
      latitude: 31.423,
      longitude: 120.1065,
      address: '灵山梵宫北侧临水',
      desc: '藏式风格佛教建筑，金顶白墙倒映湖中，展示藏传佛教文化艺术精华。',
    },
    {
      id: 105,
      title: '九龙灌浴广场',
      latitude: 31.4225,
      longitude: 120.1082,
      address: '灵山大佛景区中轴线',
      desc: '大型音乐动态群雕表演，以吉祥庄严氛围展现佛祖诞生的故事，每日多场次。',
    },
    {
      id: 106,
      title: '天下第一掌',
      latitude: 31.4208,
      longitude: 120.1078,
      address: '祥符禅寺广场',
      desc: '大佛右手1:1复制铜掌，摸掌祈福文化代表点位，寓意摸掌增福添寿。',
    },
    {
      id: 107,
      title: '拈花湾禅意小镇',
      latitude: 31.401,
      longitude: 120.078,
      address: '无锡市滨湖区环山西路68号',
      desc: '以禅意生活方式为主题的度假小镇，花海铺展夜景迷人，适合慢游打卡。',
    },
  ],
  food: [
    {
      id: 201,
      title: '梵宫素斋自助',
      latitude: 31.422,
      longitude: 120.1078,
      address: '灵山梵宫一层东侧',
      desc: '禅意空间内精致素食自助，品类丰富，是游览中途休憩用餐首选。',
    },
    {
      id: 202,
      title: '灵山精舍素斋',
      latitude: 31.4215,
      longitude: 120.106,
      address: '灵山精舍院内',
      desc: '清雅素斋配以禅意园林景观，适合午间静心用餐，需提前预约。',
    },
    {
      id: 203,
      title: '景区素面馆',
      latitude: 31.4205,
      longitude: 120.109,
      address: '祥符禅寺南侧商街',
      desc: '灵山特色素面一碗，快速补给继续游览，价格实惠出餐快。',
    },
    {
      id: 204,
      title: '五观堂素斋厅',
      latitude: 31.4198,
      longitude: 120.1068,
      address: '景区入口西侧',
      desc: '大型素斋餐厅，适合团队用餐，提供套餐与点单服务。',
    },
  ],
  toilet: [
    {
      id: 301,
      title: '大佛脚下公厕',
      latitude: 31.4215,
      longitude: 120.1085,
      address: '灵山大佛登云道旁',
      desc: '距离主游览区最近，便于登佛前后使用。',
    },
    {
      id: 302,
      title: '梵宫东侧公厕',
      latitude: 31.4225,
      longitude: 120.1068,
      address: '梵宫东门外侧',
      desc: '梵宫参观路线配套公厕，环境整洁设施完善。',
    },
    {
      id: 303,
      title: '九龙灌浴公厕',
      latitude: 31.423,
      longitude: 120.1085,
      address: '九龙灌浴广场北侧',
      desc: '观看演出前后可就近使用，客流高峰时会排队。',
    },
  ],
  parking: [
    {
      id: 401,
      title: 'P1 主停车场',
      latitude: 31.4185,
      longitude: 120.109,
      address: '景区正门入口南侧',
      desc: '距离景区入口最近的大型停车场，含新能源充电桩，节假日建议尽早到达。',
    },
    {
      id: 402,
      title: 'P2 东停车场',
      latitude: 31.418,
      longitude: 120.111,
      address: '景区东侧辅路',
      desc: '备选停车区，适合高峰分流，步行至入口约8分钟。',
    },
    {
      id: 403,
      title: 'P3 大巴停车场',
      latitude: 31.4195,
      longitude: 120.1065,
      address: '景区西侧大巴专用区',
      desc: '团队与旅游大巴专用停车场，配备团队集合区与卫生间。',
    },
  ],
  service: [
    {
      id: 501,
      title: '游客服务中心',
      latitude: 31.4192,
      longitude: 120.108,
      address: '景区主入口右侧',
      desc: '提供导览咨询、行程建议、失物登记与轮椅租借服务。',
    },
    {
      id: 502,
      title: '电子讲解器租赁',
      latitude: 31.4205,
      longitude: 120.1075,
      address: '祥符禅寺广场入口',
      desc: '扫码支付佩戴，支持多语种讲解，覆盖景区主要文化节点。',
    },
    {
      id: 503,
      title: '应急医疗点',
      latitude: 31.422,
      longitude: 120.1085,
      address: '九龙灌浴广场附近',
      desc: '配备基础急救物资与值班医护人员，方便处理轻微突发情况。',
    },
  ],
}

const activeCategory = ref('spot')
const selectedPoint = ref(pointsMap.spot[0])
const canGoBack = ref(false)

onLoad(() => {
  canGoBack.value = getCurrentPages().length > 1
})

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

function goBack() {
  uni.navigateBack({ delta: 1 })
}

function handleLeftAction(action) {
  if (action === 'refresh') {
    uni.showToast({ title: '已刷新附近点位', icon: 'none' })
    return
  }
  if (action === 'locate') {
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
