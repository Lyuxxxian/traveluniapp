<template>
  <view class="page">
    <view class="bg" />

    <view class="card">
      <view class="logo-wrap">
        <image class="logo" src="/static/logo.png" mode="aspectFill" />
      </view>
      <view class="card-title">灵山会员登录</view>
      <view class="card-subtitle">授权后可查看订单、优惠券与个人服务</view>

      <view class="agreement" @tap="agreed = !agreed">
        <view class="check" :class="{ checked: agreed }" />
        <view class="agreement-text">
          <text>我已阅读并同意</text>
          <text class="agreement-link" @tap.stop="showPolicy('privacy')">《隐私政策》</text>
          <text>和</text>
          <text class="agreement-link" @tap.stop="showPolicy('service')">《服务协议》</text>
        </view>
      </view>

      <button v-if="!showLoginMethods" class="btn" hover-class="btn-hover" @tap="showMethods">
        授权登录成为会员
      </button>

      <view v-else class="method-panel">
        <button class="btn wechat-btn" hover-class="btn-hover" :disabled="isSubmitting" @tap="onWechatLogin">
          微信直接授权登录
        </button>
        <button class="phone-switch" hover-class="phone-switch-hover" @tap="showPhoneLogin = !showPhoneLogin">
          手机号登录
        </button>

        <view v-if="showPhoneLogin" class="phone-form">
          <view class="input-wrap">
            <input
              v-model="phone"
              class="input"
              type="number"
              placeholder="请输入手机号"
              placeholder-class="placeholder"
              :maxlength="11"
            />
          </view>
          <button class="btn phone-btn" hover-class="btn-hover" :disabled="isSubmitting" @tap="onPhoneLogin">
            {{ isSubmitting ? '登录中…' : '确认登录' }}
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { loginByPhone, loginByWechat } from '../../api/user'

const agreed = ref(false)
const showLoginMethods = ref(false)
const showPhoneLogin = ref(false)
const phone = ref('')
const isSubmitting = ref(false)

function showPolicy(type) {
  uni.showToast({ title: type === 'privacy' ? '隐私政策待开发' : '服务协议待开发', icon: 'none' })
}

function showMethods() {
  if (!agreed.value) {
    uni.showToast({ title: '请先阅读并同意协议', icon: 'none' })
    return
  }
  showLoginMethods.value = true
}

async function finishLogin(loginTask) {
  if (isSubmitting.value) return
  isSubmitting.value = true
  uni.showLoading({ title: '登录中…', mask: true })

  try {
    await loginTask()
    uni.hideLoading()
    uni.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(() => {
      uni.reLaunch({ url: '/pages/mine/mine' })
    }, 500)
  } catch (error) {
    uni.hideLoading()
    const message = error instanceof Error ? error.message : '登录失败，请稍后再试'
    uni.showToast({ title: message, icon: 'none' })
  } finally {
    isSubmitting.value = false
  }
}

function onWechatLogin() {
  finishLogin(() => loginByWechat())
}

function onPhoneLogin() {
  const normalizedPhone = phone.value.trim()
  if (!/^1\d{10}$/.test(normalizedPhone)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }

  finishLogin(() => loginByPhone(normalizedPhone))
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
  background:
    radial-gradient(circle at 18% 4%, rgba(255, 244, 218, 0.42), rgba(255, 244, 218, 0) 34%),
    linear-gradient(135deg, #f4ead8 0%, #d8c29c 100%);
}

.card {
  position: relative;
  width: 100%;
  max-width: 640rpx;
  padding: 56rpx 42rpx 46rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.68);
  border-radius: 36rpx;
  background: rgba(255, 255, 255, 0.52);
  box-shadow: 0 22rpx 54rpx rgba(92, 64, 31, 0.16);
  -webkit-backdrop-filter: blur(18rpx);
  backdrop-filter: blur(18rpx);
  box-sizing: border-box;
}

.logo-wrap {
  width: 154rpx;
  height: 154rpx;
  margin: 0 auto;
  border-radius: 50%;
  background: #fff8ed;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 14rpx 30rpx rgba(84, 58, 28, 0.16);
}

.logo {
  width: 118rpx;
  height: 118rpx;
  border-radius: 50%;
}

.card-title,
.card-subtitle {
  display: block;
  text-align: center;
}

.card-title {
  margin-top: 30rpx;
  color: #332619;
  font-size: 42rpx;
  font-weight: 800;
}

.card-subtitle {
  margin-top: 12rpx;
  color: #8d775d;
  font-size: 25rpx;
  line-height: 1.45;
}

.agreement {
  margin-top: 44rpx;
  display: flex;
  align-items: flex-start;
}

.check {
  width: 34rpx;
  height: 34rpx;
  margin-top: 3rpx;
  border: 3rpx solid #b08a58;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.7);
  position: relative;
  flex-shrink: 0;
  box-sizing: border-box;
}

.check.checked {
  background: #9b6a32;
  border-color: #9b6a32;
}

.check.checked::after {
  content: '';
  position: absolute;
  left: 8rpx;
  top: 4rpx;
  width: 11rpx;
  height: 18rpx;
  border-right: 4rpx solid #fff;
  border-bottom: 4rpx solid #fff;
  transform: rotate(45deg);
}

.agreement-text {
  flex: 1;
  margin-left: 14rpx;
  color: #7d6a55;
  font-size: 23rpx;
  line-height: 1.5;
}

.agreement-link {
  color: #8b5a24;
  font-weight: 800;
}

.btn {
  height: 88rpx;
  line-height: 88rpx;
  margin: 42rpx 0 0;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #8b6138 0%, #d8ad6b 100%);
  color: #fffaf0;
  font-size: 29rpx;
  font-weight: 800;
  box-shadow: 0 14rpx 28rpx rgba(139, 97, 56, 0.22);
}

.btn::after,
.phone-switch::after {
  border: 0;
}

.btn-hover,
.phone-switch-hover {
  opacity: 0.9;
}

.method-panel {
  margin-top: 36rpx;
}

.wechat-btn {
  margin-top: 0;
  background: linear-gradient(135deg, #4f8f5b 0%, #9fc57b 100%);
}

.phone-switch {
  height: 78rpx;
  line-height: 78rpx;
  margin: 22rpx 0 0;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.72);
  color: #7d5529;
  font-size: 27rpx;
  font-weight: 800;
}

.phone-form {
  margin-top: 22rpx;
}

.input-wrap {
  height: 88rpx;
  padding: 0 24rpx;
  border: 1rpx solid rgba(176, 138, 88, 0.26);
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
  color: #332619;
  font-size: 28rpx;
}

.placeholder {
  color: #b5a188;
  font-size: 28rpx;
}

.phone-btn {
  margin-top: 22rpx;
}
</style>
