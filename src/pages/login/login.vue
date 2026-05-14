<template>
  <view class="page">
    <view class="bg" />

    <view class="card">
      <view class="card-title">欢迎回来</view>
      <view class="card-subtitle">请登录您的账号</view>

      <view class="field">
        <view class="label">用户名</view>
        <view class="input-wrap">
          <input
            v-model="form.username"
            class="input"
            type="text"
            placeholder="请输入用户名"
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

      <view class="row">
        <label class="remember" @tap="form.remember = !form.remember">
          <checkbox class="checkbox" :checked="form.remember" />
          <text class="remember-text">记住我</text>
        </label>

        <text class="link" @tap="onForgotPassword">忘记密码？</text>
      </view>

      <button class="btn" type="default" hover-class="btn-hover" :disabled="isSubmitting" @tap="onSubmit">
        {{ isSubmitting ? '登录中…' : '登 录' }}
      </button>

      <view class="bottom">
        <text class="bottom-text">还没有账号？</text>
        <text class="bottom-link" @tap="onRegister">立即注册</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { login } from '../../api/user'

const form = reactive({
  username: '',
  password: '',
  remember: true,
})

const showPassword = ref(false)
const isSubmitting = ref(false)

function togglePassword() {
  showPassword.value = !showPassword.value
}

function onForgotPassword() {
  uni.showToast({ title: '暂未实现', icon: 'none' })
}

function onRegister() {
  uni.navigateTo({ url: '/pages/register/register' })
}

async function onSubmit() {
  if (isSubmitting.value) return

  if (!form.username.trim()) {
    uni.showToast({ title: '请输入用户名', icon: 'none' })
    return
  }
  if (!form.password) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }

  isSubmitting.value = true
  uni.showLoading({ title: '登录中…', mask: true })

  try {
    await login({
      username: form.username.trim(),
      password: form.password,
    })

    uni.hideLoading()
    uni.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(() => {
      uni.reLaunch({ url: '/pages/index/index' })
    }, 500)
  } catch (error) {
    uni.hideLoading()
    const message = error instanceof Error ? error.message : '登录失败，请稍后再试'
    uni.showToast({ title: message, icon: 'none' })
  } finally {
    isSubmitting.value = false
  }
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

.row {
  margin-top: 22rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.remember {
  display: flex;
  align-items: center;
}

.checkbox {
  transform: scale(0.85);
}

.remember-text {
  margin-left: 10rpx;
  font-size: 24rpx;
  color: rgba(34, 34, 34, 0.75);
}

.link {
  font-size: 24rpx;
  color: rgba(34, 34, 34, 0.7);
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
