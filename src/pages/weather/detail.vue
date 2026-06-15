<template>
  <view class="page">
    <view class="nav">
      <view class="back" @tap="goBack">‹</view>
      <view>
        <text class="nav-title">天气详情</text>
        <text class="nav-sub">{{ weather.placeName }}</text>
      </view>
    </view>

    <scroll-view scroll-y class="scroll">
      <view class="hero-card">
        <view class="hero-main">
          <text class="weather-icon">{{ weather.now.icon }}</text>
          <view class="hero-copy">
            <text class="place">{{ weather.placeName }}</text>
            <text class="temp">{{ weather.now.temp }}°</text>
            <text class="condition">{{ weather.now.text }} · 体感 {{ weather.now.feelsLike }}°C</text>
          </view>
        </view>
        <view class="today-row">
          <text>今日 {{ weather.today.tempMin }}°C / {{ weather.today.tempMax }}°C</text>
          <text>{{ weather.today.textDay }}转{{ weather.today.textNight }}</text>
        </view>
        <view class="updated">更新时间：{{ updateText }}</view>
      </view>

      <view class="section">
        <view class="section-head">
          <text class="section-title">逐小时天气</text>
          <text class="section-sub">未来 24 小时</text>
        </view>
        <scroll-view scroll-x class="hourly-scroll" :show-scrollbar="false">
          <view class="hourly-row">
            <view class="hour-card" v-for="item in weather.hourly" :key="item.time">
              <text class="hour-time">{{ item.time }}</text>
              <text class="hour-icon">{{ item.icon }}</text>
              <text class="hour-temp">{{ item.temp }}°</text>
              <text class="hour-text">{{ item.text }}</text>
              <text class="hour-rain">降水 {{ item.precip }}mm</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <view class="section">
        <view class="section-head">
          <text class="section-title">未来七天</text>
          <text class="section-sub">温度与天气趋势</text>
        </view>
        <view class="daily-list">
          <view class="day-card" v-for="item in weather.daily" :key="item.fxDate || item.date">
            <view class="day-left">
              <text class="day-date">{{ item.date }}</text>
              <text class="day-desc">{{ item.textDay }} / {{ item.textNight }}</text>
            </view>
            <text class="day-icon">{{ item.icon }}</text>
            <view class="day-right">
              <text class="day-temp">{{ item.tempMin }}° / {{ item.tempMax }}°</text>
              <text class="day-meta">湿度{{ item.humidity }}% · {{ item.windDir }}{{ item.windScale }}级</text>
            </view>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-head">
          <text class="section-title">今日概况</text>
          <text class="section-sub">灵山胜境</text>
        </view>
        <view class="metric-grid">
          <view class="metric-card" v-for="item in todayMetrics" :key="item.label">
            <text class="metric-label">{{ item.label }}</text>
            <text class="metric-value">{{ item.value }}</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { fetchWeatherDetail, type WeatherDetail } from '../../api/home'

const fallbackWeather: WeatherDetail = {
  source: 'mock',
  placeName: '灵山胜境',
  updatedAt: '刚刚',
  now: {
    icon: '☀',
    text: '晴',
    temp: '26',
    feelsLike: '28',
    windDir: '东南风',
    windScale: '3',
    windSpeed: '14',
    humidity: '62',
    precip: '0.0',
    pressure: '1012',
    vis: '16',
  },
  today: {
    date: '今天',
    icon: '☀',
    textDay: '晴',
    textNight: '多云',
    tempMax: '29',
    tempMin: '21',
    precip: '0.0',
    humidity: '62',
    windDir: '东南风',
    windScale: '3',
    sunrise: '04:56',
    sunset: '19:06',
    uvIndex: '中等',
  },
  airQuality: '良',
  hourly: [],
  daily: [],
}

const weather = ref<WeatherDetail>(fallbackWeather)

const updateText = computed(() => {
  const raw = weather.value.updatedAt
  if (!raw || raw === '刚刚') return raw || '刚刚'
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return raw
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
})

const todayMetrics = computed(() => [
  { label: '空气质量', value: weather.value.airQuality || '暂无' },
  { label: '体感温度', value: `${weather.value.now.feelsLike || '--'}°C` },
  { label: '紫外线', value: weather.value.today.uvIndex || '暂无' },
  { label: '风况', value: `${weather.value.now.windDir || '--'} ${weather.value.now.windScale || '--'}级` },
  { label: '风速', value: `${weather.value.now.windSpeed || '--'} km/h` },
  { label: '日出', value: weather.value.today.sunrise || '--:--' },
  { label: '日落', value: weather.value.today.sunset || '--:--' },
  { label: '降水量', value: `${weather.value.today.precip || weather.value.now.precip || '0.0'} mm` },
  { label: '湿度', value: `${weather.value.now.humidity || weather.value.today.humidity || '--'}%` },
  { label: '气压', value: `${weather.value.now.pressure || '--'} hPa` },
  { label: '能见度', value: `${weather.value.now.vis || '--'} km` },
])

function goBack() {
  uni.navigateBack({
    fail: () => uni.switchTab({ url: '/pages/index/index' }),
  })
}

onMounted(async () => {
  weather.value = await fetchWeatherDetail()
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #eef4ed;
  color: #243326;
}

.nav {
  padding: calc(var(--status-bar-height) + 18rpx) 32rpx 20rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.back {
  width: 64rpx;
  height: 64rpx;
  border-radius: 32rpx;
  background: rgba(255, 255, 255, 0.86);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  color: #47664b;
}

.nav-title,
.nav-sub,
.place,
.temp,
.condition,
.updated,
.section-title,
.section-sub,
.metric-label,
.metric-value,
.hour-time,
.hour-icon,
.hour-temp,
.hour-text,
.hour-rain,
.day-date,
.day-desc,
.day-icon,
.day-temp,
.day-meta {
  display: block;
}

.nav-title {
  font-size: 36rpx;
  font-weight: 800;
}

.nav-sub {
  margin-top: 4rpx;
  font-size: 22rpx;
  color: #6d806f;
}

.scroll {
  height: calc(100vh - 132rpx);
  padding: 0 28rpx 48rpx;
  box-sizing: border-box;
}

.hero-card,
.section {
  border-radius: 32rpx;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 18rpx 42rpx rgba(58, 91, 62, 0.12);
}

.hero-card {
  padding: 36rpx;
  background: linear-gradient(135deg, #7eb982 0%, #dfeec6 100%);
  color: #17331b;
}

.hero-main {
  display: flex;
  align-items: center;
  gap: 28rpx;
}

.weather-icon {
  font-size: 96rpx;
}

.temp {
  margin-top: 4rpx;
  font-size: 86rpx;
  line-height: 1;
  font-weight: 900;
}

.place {
  font-size: 28rpx;
  font-weight: 700;
}

.condition {
  margin-top: 12rpx;
  font-size: 26rpx;
}

.today-row {
  margin-top: 28rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid rgba(255, 255, 255, 0.54);
  display: flex;
  justify-content: space-between;
  font-size: 26rpx;
  font-weight: 700;
}

.updated {
  margin-top: 14rpx;
  color: rgba(23, 51, 27, 0.68);
  font-size: 22rpx;
}

.section {
  margin-top: 24rpx;
  padding: 28rpx;
}

.section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 22rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 800;
}

.section-sub {
  font-size: 22rpx;
  color: #7d8d7d;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
}

.metric-card {
  padding: 20rpx;
  border-radius: 22rpx;
  background: #f5f8f1;
}

.metric-label {
  font-size: 22rpx;
  color: #7b8c7a;
}

.metric-value {
  margin-top: 8rpx;
  font-size: 28rpx;
  font-weight: 800;
}

.hourly-scroll {
  width: 100%;
}

.hourly-row {
  display: flex;
  gap: 16rpx;
  padding-bottom: 4rpx;
}

.hour-card {
  min-width: 148rpx;
  padding: 22rpx 14rpx;
  border-radius: 24rpx;
  background: #f5f8f1;
  text-align: center;
}

.hour-time,
.hour-text,
.hour-rain {
  font-size: 22rpx;
  color: #778875;
}

.hour-icon {
  margin-top: 14rpx;
  font-size: 42rpx;
}

.hour-temp {
  margin-top: 10rpx;
  font-size: 32rpx;
  font-weight: 900;
}

.hour-rain {
  margin-top: 8rpx;
}

.daily-list {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.day-card {
  display: grid;
  grid-template-columns: 150rpx 64rpx 1fr;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx;
  border-radius: 24rpx;
  background: #f5f8f1;
}

.day-date {
  font-size: 26rpx;
  font-weight: 800;
}

.day-desc,
.day-meta {
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #778875;
}

.day-icon {
  font-size: 42rpx;
  text-align: center;
}

.day-temp {
  font-size: 28rpx;
  font-weight: 900;
  text-align: right;
}

.day-meta {
  text-align: right;
}
</style>
