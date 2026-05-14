<template>
  <view class="app-layout">
    <!-- 页面内容区域 -->
    <view class="page-content">
      <slot></slot>
    </view>

    <view class="tabbar" v-if="showTabbar">
      <view
        class="tab-item"
        v-for="item in tabs"
        :key="item.key"
        :class="{ active: item.key === activeTab && !item.isAi, 'center-space': item.isAi }"
        @tap="onTabTap(item)"
      >
        <template v-if="!item.isAi">
          <view class="tab-icon" :class="`icon-${item.key}`">
            <view class="icon-mark" />
          </view>
          <text class="tab-text">{{ item.label }}</text>
        </template>
      </view>

      <view class="ai-button" @tap="onAiTap">
        <view class="ai-orbit">
          <view class="ai-halo" />
          <view class="ai-avatar">
            <view class="ai-head">
              <view class="ai-eye left" />
              <view class="ai-eye right" />
              <view class="ai-cheek left" />
              <view class="ai-cheek right" />
              <view class="ai-mouth" />
            </view>
            <view class="ai-body">
              <view class="ai-sash" />
            </view>
          </view>
        </view>
        <text class="ai-label">{{ centerAgent.label }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
defineProps({
  activeTab: {
    type: String,
    default: 'home'
  },
  showTabbar: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['tab-change'])

const tabs = [
  { key: 'home', label: '首页' },
  { key: 'map', label: '地图' },
  { key: 'ai', label: '数字人AI', isAi: true },
  { key: 'mall', label: '商城' },
  { key: 'mine', label: '我的' },
]

const centerAgent = {
  label: '数字人AI',
  avatarKey: 'default-zen-guide',
}

function onAiTap() {
  uni.showToast({ title: '数字人AI全屏对话待开发', icon: 'none' })
}

function onTabTap(item) {
  if (item.isAi) return
  
  emit('tab-change', item.key)

  if (item.key === 'home') {
    uni.reLaunch({ url: '/pages/index/index' })
    return
  }

  if (item.key === 'map') {
    uni.navigateTo({ url: '/pages/map/map' })
    return
  }

  if (item.key === 'mall') {
    uni.reLaunch({ url: '/pages/mall/mall' })
    return
  }

  if (item.key === 'mine') {
    uni.reLaunch({ url: '/pages/mine/mine' })
    return
  }

  uni.showToast({ title: `${item.label}页面待开发`, icon: 'none' })
}
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  position: relative;
}

.page-content {
  min-height: 100vh;
}

.tabbar {
  height: 126rpx;
  padding: 0 10rpx;
  background:
    linear-gradient(180deg, rgba(255, 252, 244, 0.96) 0%, rgba(248, 238, 217, 0.98) 100%),
    radial-gradient(circle at 50% 0%, rgba(218, 169, 90, 0.18), rgba(255, 255, 255, 0) 42%);
  border-top: 1rpx solid rgba(182, 138, 75, 0.24);
  display: flex;
  align-items: center;
  justify-content: space-around;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  box-sizing: border-box;
  box-shadow: 0 -12rpx 36rpx rgba(72, 50, 24, 0.12);
}

.tab-item {
  width: 20%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #907b61;
}

.tab-item.center-space {
  pointer-events: none;
}

.tab-icon {
  width: 48rpx;
  height: 48rpx;
  border-radius: 16rpx;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
}

.tab-icon::before,
.tab-icon::after,
.icon-mark,
.icon-mark::before,
.icon-mark::after {
  content: '';
  position: absolute;
  box-sizing: border-box;
}

.icon-home::before {
  top: 9rpx;
  left: 12rpx;
  width: 24rpx;
  height: 24rpx;
  border-left: 5rpx solid currentColor;
  border-top: 5rpx solid currentColor;
  border-radius: 4rpx;
  transform: rotate(45deg);
}

.icon-home::after {
  left: 13rpx;
  bottom: 8rpx;
  width: 22rpx;
  height: 22rpx;
  border: 5rpx solid currentColor;
  border-top: 0;
  border-radius: 0 0 9rpx 9rpx;
}

.icon-home .icon-mark {
  left: 21rpx;
  bottom: 8rpx;
  width: 7rpx;
  height: 13rpx;
  border-radius: 6rpx 6rpx 0 0;
  background: currentColor;
}

.icon-map::before {
  top: 6rpx;
  left: 13rpx;
  width: 22rpx;
  height: 30rpx;
  border: 5rpx solid currentColor;
  border-radius: 18rpx 18rpx 18rpx 4rpx;
  transform: rotate(-45deg);
}

.icon-map::after {
  top: 16rpx;
  left: 22rpx;
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: currentColor;
}

.icon-map .icon-mark {
  left: 10rpx;
  bottom: 5rpx;
  width: 28rpx;
  height: 8rpx;
  border: 4rpx solid currentColor;
  border-top: 0;
  border-radius: 0 0 50% 50%;
  opacity: 0.72;
}

.icon-mall::before {
  left: 10rpx;
  top: 16rpx;
  width: 28rpx;
  height: 22rpx;
  border: 5rpx solid currentColor;
  border-radius: 7rpx;
}

.icon-mall::after {
  left: 16rpx;
  top: 8rpx;
  width: 16rpx;
  height: 16rpx;
  border: 4rpx solid currentColor;
  border-bottom: 0;
  border-radius: 14rpx 14rpx 0 0;
}

.icon-mall .icon-mark {
  left: 8rpx;
  top: 16rpx;
  width: 32rpx;
  height: 8rpx;
  border-radius: 8rpx 8rpx 4rpx 4rpx;
  background: currentColor;
}

.icon-mine::before {
  left: 16rpx;
  top: 8rpx;
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  border: 5rpx solid currentColor;
}

.icon-mine::after {
  left: 10rpx;
  bottom: 7rpx;
  width: 28rpx;
  height: 20rpx;
  border: 5rpx solid currentColor;
  border-radius: 18rpx 18rpx 10rpx 10rpx;
}

.icon-mine .icon-mark {
  left: 17rpx;
  bottom: 10rpx;
  width: 14rpx;
  height: 5rpx;
  border-radius: 999rpx;
  background: currentColor;
}

.tab-text {
  margin-top: 8rpx;
  font-size: 22rpx;
  line-height: 1;
}

.tab-item.active {
  color: #7a471b;
}

.tab-item.active .tab-icon {
  background: rgba(139, 86, 31, 0.1);
  box-shadow: 0 8rpx 18rpx rgba(142, 88, 33, 0.15);
}

.ai-button {
  position: absolute;
  left: 50%;
  top: -46rpx;
  transform: translateX(-50%);
  width: 142rpx;
  height: 150rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.ai-orbit {
  width: 116rpx;
  height: 116rpx;
  border-radius: 38rpx;
  border: 8rpx solid rgba(255, 249, 236, 0.98);
  background:
    radial-gradient(circle at 50% 18%, rgba(255, 247, 219, 0.95), rgba(227, 176, 91, 0.32) 46%, rgba(91, 58, 25, 0.94) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow:
    0 18rpx 30rpx rgba(88, 54, 21, 0.26),
    inset 0 2rpx 0 rgba(255, 255, 255, 0.72);
}

.ai-halo {
  position: absolute;
  top: 10rpx;
  width: 58rpx;
  height: 14rpx;
  border: 4rpx solid rgba(255, 235, 166, 0.92);
  border-radius: 50%;
  box-shadow: 0 0 14rpx rgba(255, 223, 139, 0.42);
}

.ai-avatar {
  width: 74rpx;
  height: 82rpx;
  position: relative;
  filter: drop-shadow(0 8rpx 10rpx rgba(61, 38, 18, 0.2));
}

.ai-head {
  width: 62rpx;
  height: 54rpx;
  margin: 10rpx auto 0;
  border-radius: 28rpx 28rpx 20rpx 20rpx;
  background: linear-gradient(145deg, #fff7de 0%, #e7c078 100%);
  position: relative;
  box-shadow: inset 0 3rpx 0 rgba(255, 255, 255, 0.65);
}

.ai-eye {
  position: absolute;
  top: 22rpx;
  width: 7rpx;
  height: 9rpx;
  border-radius: 50%;
  background: #5f3512;
}

.ai-eye.left {
  left: 18rpx;
}

.ai-eye.right {
  right: 18rpx;
}

.ai-cheek {
  position: absolute;
  top: 32rpx;
  width: 9rpx;
  height: 5rpx;
  border-radius: 50%;
  background: rgba(206, 109, 74, 0.36);
}

.ai-cheek.left {
  left: 12rpx;
}

.ai-cheek.right {
  right: 12rpx;
}

.ai-mouth {
  position: absolute;
  left: 27rpx;
  top: 33rpx;
  width: 9rpx;
  height: 5rpx;
  border-bottom: 3rpx solid #6b3b16;
  border-radius: 0 0 999rpx 999rpx;
}

.ai-body {
  width: 74rpx;
  height: 34rpx;
  margin-top: -4rpx;
  border-radius: 22rpx 22rpx 18rpx 18rpx;
  background: linear-gradient(145deg, #8a5325 0%, #c99650 100%);
  position: relative;
  overflow: hidden;
}

.ai-sash {
  position: absolute;
  left: 12rpx;
  top: -4rpx;
  width: 12rpx;
  height: 48rpx;
  border-radius: 999rpx;
  background: rgba(255, 231, 159, 0.9);
  transform: rotate(24deg);
}

.ai-label {
  margin-top: 6rpx;
  color: #6f4218;
  font-size: 20rpx;
  line-height: 1;
  font-weight: 700;
}
</style>
