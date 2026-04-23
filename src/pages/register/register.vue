<template>
  <view class="page">
    <view class="bg" />

    <view class="card">
      <view class="card-title">创建账号</view>
      <view class="card-subtitle">使用账号密码完成注册</view>

      <view class="field">
        <view class="label">账号</view>
        <view class="input-wrap">
          <input
            v-model="form.username"
            class="input"
            type="text"
            placeholder="请输入账号"
            placeholder-class="placeholder"
            :maxlength="50"
          />
          <text class="suffix-icon" aria-hidden="true">👤</text>
        </view>
      </view>

      <view class="field">
        <view class="label">密码</view>
        <view class="input-wrap">
          <input
            v-model="form.password"
            class="input"
            :password="!showPassword"
            placeholder="请输入密码"
            placeholder-class="placeholder"
            :maxlength="50"
          />
          <view class="suffix-actions">
            <text class="suffix-icon" aria-hidden="true" @tap="togglePassword">
              {{ showPassword ? '🙈' : '🔒' }}
            </text>
          </view>
        </view>
      </view>

      <button class="btn" type="default" hover-class="btn-hover" @tap="onSubmit">注 册</button>

      <view class="bottom">
        <text class="bottom-text">已有账号？</text>
        <text class="bottom-link" @tap="goLogin">去登录</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { reactive, ref } from 'vue'

const form = reactive({
  username: '',
  password: '',
})

const showPassword = ref(false)

function togglePassword() {
  showPassword.value = !showPassword.value
}

function goLogin() {
  uni.navigateBack({ delta: 1 })
}

function onSubmit() {
  if (!form.username.trim()) {
    uni.showToast({ title: '请输入账号', icon: 'none' })
    return
  }
  if (!form.password) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }

  uni.showToast({ title: '注册中…', icon: 'loading', duration: 800 })
  setTimeout(() => {
    uni.showToast({ title: '注册成功', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack({ delta: 1 })
    }, 600)
  }, 800)
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48rpx 36rpx;
  box-sizing: border-box;
}

.bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #a6c0fe 0%, #c2a8fd 100%);
}

.card {
  position: relative;
  width: 100%;
  max-width: 620rpx;
  padding: 48rpx 40rpx 44rpx;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.35);
  border: 1rpx solid rgba(255, 255, 255, 0.55);
  box-shadow: 0 18rpx 50rpx rgba(20, 20, 40, 0.18);
  -webkit-backdrop-filter: blur(16rpx);
  backdrop-filter: blur(16rpx);
}

.card-title {
  font-size: 44rpx;
  font-weight: 700;
  color: #222;
  text-align: center;
  letter-spacing: 2rpx;
}

.card-subtitle {
  margin-top: 10rpx;
  font-size: 26rpx;
  color: rgba(34, 34, 34, 0.7);
  text-align: center;
}

.field {
  margin-top: 30rpx;
}

.label {
  font-size: 24rpx;
  color: rgba(34, 34, 34, 0.78);
  margin-bottom: 14rpx;
}

.input-wrap {
  height: 90rpx;
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.62);
  border: 1rpx solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 12rpx 24rpx rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  padding: 0 18rpx 0 22rpx;
  box-sizing: border-box;
}

.input {
  flex: 1;
  height: 90rpx;
  line-height: 90rpx;
  font-size: 28rpx;
  color: #222;
}

.placeholder {
  color: rgba(34, 34, 34, 0.35);
  font-size: 28rpx;
}

.suffix-actions {
  display: flex;
  align-items: center;
}

.suffix-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 16rpx;
  background: rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  color: rgba(0, 0, 0, 0.6);
}

.btn {
  margin-top: 34rpx;
  height: 92rpx;
  line-height: 92rpx;
  border-radius: 22rpx;
  background: linear-gradient(135deg, rgba(166, 192, 254, 0.9) 0%, rgba(194, 168, 253, 0.9) 100%);
  color: #fff;
  font-size: 30rpx;
  font-weight: 700;
  border: none;
}

.btn-hover {
  opacity: 0.92;
}

.bottom {
  margin-top: 26rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
}

.bottom-text {
  font-size: 24rpx;
  color: rgba(34, 34, 34, 0.65);
}

.bottom-link {
  font-size: 24rpx;
  color: rgba(34, 34, 34, 0.85);
  font-weight: 700;
}
</style>
