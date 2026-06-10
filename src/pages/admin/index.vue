<template>
  <view class="admin-page">
    <view class="top-bar">
      <view class="back" @tap="goBack">‹</view>
      <view>
        <view class="title">灵山数字导游管理后台</view>
        <view class="subtitle">游客行为分析 · 热门问答 · 服务质量监测</view>
      </view>
    </view>

    <view class="kpi-grid">
      <view class="kpi-card">
        <view class="kpi-value">1286</view>
        <view class="kpi-label">今日服务人次</view>
      </view>
      <view class="kpi-card">
        <view class="kpi-value">93.6%</view>
        <view class="kpi-label">问答命中率</view>
      </view>
      <view class="kpi-card">
        <view class="kpi-value">2.1s</view>
        <view class="kpi-label">平均响应时长</view>
      </view>
      <view class="kpi-card">
        <view class="kpi-value">4.8</view>
        <view class="kpi-label">游客满意度</view>
      </view>
    </view>

    <view class="section">
      <view class="section-title">热门咨询 TOP5</view>
      <view class="rank-item" v-for="(item, index) in hotQuestions" :key="item.name">
        <view class="rank-num">{{ index + 1 }}</view>
        <view class="rank-name">{{ item.name }}</view>
        <view class="rank-bar">
          <view class="rank-fill" :style="{ width: item.percent + '%' }"></view>
        </view>
        <view class="rank-value">{{ item.count }}</view>
      </view>
    </view>

    <view class="section">
      <view class="section-title">游客关注点分析</view>
      <view class="tag-list">
        <view class="tag" v-for="tag in focusTags" :key="tag">{{ tag }}</view>
      </view>
    </view>

    <view class="section">
      <view class="section-title">游客情感趋势</view>
      <view class="trend-box">
        <view class="trend-item">
          <view class="trend-label">积极</view>
          <view class="trend-line positive"></view>
          <view class="trend-value">76%</view>
        </view>
        <view class="trend-item">
          <view class="trend-label">中性</view>
          <view class="trend-line neutral"></view>
          <view class="trend-value">18%</view>
        </view>
        <view class="trend-item">
          <view class="trend-label">消极</view>
          <view class="trend-line negative"></view>
          <view class="trend-value">6%</view>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-title">运营建议</view>
      <view class="suggestion">
        当前游客最关注“演出时间、路线推荐、门票价格、亲子游”等问题，建议在首页增加演出提醒入口，并在高峰时段主动推送“九龙灌浴”和“吉祥颂”演出安排。
      </view>
    </view>
  </view>
</template>

<script setup>
const hotQuestions = [
  { name: '九龙灌浴几点演出', count: 326, percent: 96 },
  { name: '灵山梵宫有什么特色', count: 286, percent: 84 },
  { name: '推荐亲子游路线', count: 241, percent: 72 },
  { name: '门票多少钱', count: 198, percent: 58 },
  { name: '灵山大佛多高', count: 165, percent: 48 }
]

const focusTags = [
  '演出时间',
  '门票价格',
  '亲子游',
  '历史文化',
  '自然风光',
  '路线推荐',
  '祈福体验',
  '停车交通'
]

function goBack() {
  uni.navigateBack()
}
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  background: #f7f1e7;
  padding-bottom: 40rpx;
}

.top-bar {
  height: 140rpx;
  padding: 28rpx 32rpx;
  background: linear-gradient(90deg, #8b572a, #c89b55);
  color: #fff;
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.back {
  width: 54rpx;
  height: 54rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  text-align: center;
  line-height: 48rpx;
  font-size: 48rpx;
}

.title {
  font-size: 34rpx;
  font-weight: 700;
}

.subtitle {
  margin-top: 8rpx;
  font-size: 22rpx;
  opacity: 0.9;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 22rpx;
  padding: 28rpx;
}

.kpi-card {
  background: #fff;
  border-radius: 22rpx;
  padding: 30rpx 20rpx;
  box-shadow: 0 10rpx 28rpx rgba(120, 80, 30, 0.1);
}

.kpi-value {
  font-size: 42rpx;
  font-weight: 700;
  color: #9a642f;
}

.kpi-label {
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #7a6652;
}

.section {
  margin: 0 28rpx 26rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx;
  box-shadow: 0 10rpx 28rpx rgba(120, 80, 30, 0.08);
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #5c3a1e;
  margin-bottom: 24rpx;
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 18rpx;
  margin-bottom: 20rpx;
}

.rank-num {
  width: 42rpx;
  height: 42rpx;
  border-radius: 50%;
  background: #f2d7a3;
  color: #7a4c21;
  text-align: center;
  line-height: 42rpx;
  font-weight: 700;
}

.rank-name {
  width: 280rpx;
  font-size: 24rpx;
  color: #5c4a3a;
}

.rank-bar {
  flex: 1;
  height: 18rpx;
  border-radius: 999rpx;
  background: #f2eadf;
  overflow: hidden;
}

.rank-fill {
  height: 100%;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #b8833d, #e7bf73);
}

.rank-value {
  width: 70rpx;
  text-align: right;
  color: #8b572a;
  font-weight: 700;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 18rpx;
}

.tag {
  padding: 14rpx 24rpx;
  background: #fff7e8;
  color: #8b572a;
  border-radius: 999rpx;
  font-size: 24rpx;
}

.trend-box {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.trend-item {
  display: flex;
  align-items: center;
  gap: 18rpx;
}

.trend-label {
  width: 80rpx;
  color: #5c4a3a;
}

.trend-line {
  height: 22rpx;
  border-radius: 999rpx;
}

.positive {
  width: 76%;
  background: #83b66b;
}

.neutral {
  width: 18%;
  background: #d8b56d;
}

.negative {
  width: 6%;
  background: #c96f5f;
}

.trend-value {
  width: 70rpx;
  color: #8b572a;
  font-weight: 700;
}

.suggestion {
  font-size: 26rpx;
  line-height: 1.8;
  color: #5c4a3a;
  background: #fff8ec;
  border-radius: 18rpx;
  padding: 22rpx;
}
</style>