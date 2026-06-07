<template>
  <view class="page">
    <view class="bg" />

    <view class="card">
      <view class="card-title">创建账号</view>
      <view class="card-subtitle">注册后订单、问卷、优惠券将只属于本账号</view>

      <view class="field">
        <view class="label">账号</view>
        <view class="input-wrap">
          <input
            v-model="form.username"
            class="input"
            type="text"
            placeholder="2–20 位字母/数字"
            placeholder-class="placeholder"
            :maxlength="20"
          />
        </view>
      </view>

      <view class="field">
        <view class="label">密码</view>
        <view class="input-wrap">
          <input
            v-model="form.password"
            class="input"
            :password="!showPassword"
            placeholder="至少 6 位"
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

      <button
        class="btn"
        type="default"
        hover-class="btn-hover"
        :disabled="isSubmitting"
        @tap="onSubmit"
      >
        {{ isSubmitting ? '注册中…' : '注 册' }}
      </button>

      <view class="bottom">
        <text class="bottom-text">已有账号？</text>
        <text class="bottom-link" @tap="goLogin">去登录</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { register } from '../../api/user'

const form = reactive({
  username: '',
  password: '',
})

const showPassword = ref(false)
const isSubmitting = ref(false)

function togglePassword() {
  showPassword.value = !showPassword.value
}

function goLogin() {
  uni.navigateBack({ delta: 1 })
}

async function onSubmit() {
  const username = form.username.trim()
  if (username.length < 2) {
    uni.showToast({ title: '账号至少 2 个字符', icon: 'none' })
    return
  }
  if (form.password.length < 6) {
    uni.showToast({ title: '密码至少 6 位', icon: 'none' })
    return
  }
  if (isSubmitting.value) return

  isSubmitting.value = true
  uni.showLoading({ title: '注册中…', mask: true })
  try {
    await register(username, form.password)
    uni.hideLoading()
    uni.showToast({ title: '注册成功', icon: 'success' })
    setTimeout(() => {
      uni.reLaunch({ url: '/pages/mine/mine' })
    }, 500)
  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: error instanceof Error ? error.message : '注册失败',
      icon: 'none',
    })
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
  font-size: 40rpx;
  font-weight: 800;
  color: #2f2a4a;
  text-align: center;
}

.card-subtitle {
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #5c5678;
  text-align: center;
  line-height: 1.45;
}

.field {
  margin-top: 28rpx;
}

.label {
  margin-bottom: 10rpx;
  font-size: 26rpx;
  color: #4a4568;
}

.input-wrap {
  height: 88rpx;
  padding: 0 24rpx;
  border-radius: 22rpx;
  background: rgba(255, 255, 255, 0.72);
  display: flex;
  align-items: center;
  box-sizing: border-box;
}

.input {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  font-size: 28rpx;
  color: #2f2a4a;
}

.placeholder {
  color: #9a94b8;
}

.suffix-actions {
  margin-left: 12rpx;
}

.suffix-icon {
  font-size: 32rpx;
}

.btn {
  height: 88rpx;
  line-height: 88rpx;
  margin-top: 36rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #6b7fd7 0%, #9b8ce8 100%);
  color: #fff;
  font-size: 30rpx;
  font-weight: 800;
}

.btn::after {
  border: 0;
}

.btn-hover {
  opacity: 0.9;
}

.bottom {
  margin-top: 28rpx;
  text-align: center;
}

.bottom-text {
  font-size: 26rpx;
  color: #5c5678;
}

.bottom-link {
  margin-left: 8rpx;
  font-size: 26rpx;
  color: #4f63c9;
  font-weight: 700;
}
</style>
