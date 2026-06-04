<template>
  <view class="page">
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <view class="back-icon" />
      </view>
      <text class="nav-title">调查问卷</text>
      <view class="nav-placeholder" />
    </view>

    <scroll-view scroll-y class="body">
      <view v-if="loading" class="center-state">
        <text>加载中...</text>
      </view>
      <view v-else-if="!list.length" class="center-state">
        <text>暂无进行中的问卷</text>
      </view>
      <view v-else>
        <view
          v-for="item in list"
          :key="item.id"
          class="survey-card"
          :class="{ done: item.submitted }"
          @tap="openSurvey(item)"
        >
          <text class="survey-title">{{ item.title }}</text>
          <text v-if="item.desc" class="survey-desc">{{ item.desc }}</text>
          <text v-if="item.rewardHint" class="survey-reward">{{ item.rewardHint }}</text>
          <text v-if="item.deadline" class="survey-deadline">截止：{{ item.deadline }}</text>
          <text class="survey-action">{{ item.submitted ? '已填写' : '去填写 ›' }}</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { fetchQuestionnaires } from '../../api/service'
import { isLoggedIn } from '../../utils/auth'

const loading = ref(true)
const list = ref([])

function goBack() {
  uni.navigateBack()
}

function openSurvey(item) {
  if (item.submitted) {
    uni.showToast({ title: '您已填写过该问卷', icon: 'none' })
    return
  }
  if (!isLoggedIn()) {
    uni.navigateTo({ url: '/pages/login/login' })
    return
  }
  uni.navigateTo({ url: `/pages/mine/surveyFill?id=${item.id}` })
}

async function loadList() {
  loading.value = true
  try {
    list.value = await fetchQuestionnaires()
  } catch {
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

onShow(() => {
  loadList()
})
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(180deg, #f6efe2 0%, #f7f1e7 100%);
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 24rpx;
  padding-top: var(--status-bar-height);
}

.nav-back {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.78);
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  width: 18rpx;
  height: 18rpx;
  border-left: 4rpx solid #6f451d;
  border-bottom: 4rpx solid #6f451d;
  transform: rotate(45deg);
  margin-left: 6rpx;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 800;
  color: #312416;
}

.nav-placeholder {
  width: 64rpx;
}

.body {
  flex: 1;
  min-height: 0;
  padding: 20rpx 24rpx;
}

.center-state {
  min-height: 500rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9a8265;
  font-size: 28rpx;
}

.survey-card {
  margin-bottom: 20rpx;
  padding: 28rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.92);
}

.survey-card.done {
  opacity: 0.65;
}

.survey-title {
  font-size: 32rpx;
  font-weight: 800;
  color: #312416;
}

.survey-desc {
  display: block;
  margin-top: 8rpx;
  font-size: 26rpx;
  color: #5c4a32;
}

.survey-reward {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #8b6138;
}

.survey-deadline {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #9a8265;
}

.survey-action {
  display: block;
  margin-top: 16rpx;
  font-size: 26rpx;
  font-weight: 700;
  color: #6f451d;
}
</style>
