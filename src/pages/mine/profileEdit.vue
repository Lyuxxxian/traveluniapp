<template>
  <view class="page">
    <view class="nav">
      <text class="back" @tap="goBack">‹</text>
      <text class="nav-title">个人信息</text>
      <text class="save" @tap="saveProfile">保存</text>
    </view>

    <view class="profile-card">
      <view class="avatar-wrap" @tap="chooseAvatar">
        <image class="avatar" :src="avatarUrl" mode="aspectFill" />
        <view class="camera-icon" />
      </view>
      <text class="hint">{{ uploading ? '头像上传中…' : '点击头像可更换' }}</text>
    </view>

    <view class="form-card">
      <view class="form-row">
        <text class="form-label">昵称</text>
        <input class="form-input" v-model="nickname" placeholder="未填写时默认显示游客 ID" />
      </view>
      <view class="form-row">
        <text class="form-label">游客 ID</text>
        <text class="form-value">{{ visitorId }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { API_BASE_URL, API_PATHS } from '../../config/api'
import { updateUserProfile } from '../../api/user'
import { getToken, getUserProfile } from '../../utils/auth'

const visitorId = ref('灵山居士_12345')
const nickname = ref('')
const avatarUrl = ref('/static/logo.png')
const uploading = ref(false)
const saving = ref(false)

onShow(() => {
  loadProfile()
})

function loadProfile() {
  const profile = getUserProfile()
  if (!profile) return

  visitorId.value = profile.visitorId || visitorId.value
  nickname.value = profile.nickname || ''
  avatarUrl.value = profile.avatarUrl || avatarUrl.value
}

function goBack() {
  uni.navigateBack()
}

function chooseAvatar() {
  if (uploading.value) return

  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (result) => {
      const filePath = result.tempFilePaths[0]
      if (!filePath) return

      avatarUrl.value = filePath
      await uploadAvatar(filePath)
    },
  })
}

function uploadAvatar(filePath) {
  uploading.value = true

  return new Promise((resolve) => {
    uni.uploadFile({
      url: `${API_BASE_URL}${API_PATHS.upload.image}`,
      filePath,
      name: 'file',
      header: {
        Authorization: `Bearer ${getToken()}`,
      },
      success: (response) => {
        try {
          const parsed = JSON.parse(response.data)
          avatarUrl.value = parsed?.data?.url || filePath
        } catch (error) {
          avatarUrl.value = filePath
        }
      },
      fail: () => {
        // 开发期后端上传接口未接入时，保留本地临时头像用于预览和模拟保存。
        avatarUrl.value = filePath
      },
      complete: () => {
        uploading.value = false
        resolve()
      },
    })
  })
}

async function saveProfile() {
  if (saving.value || uploading.value) return

  saving.value = true
  uni.showLoading({ title: '保存中…', mask: true })

  try {
    await updateUserProfile({
      nickname: nickname.value.trim(),
      avatarUrl: avatarUrl.value,
    })
    uni.hideLoading()
    uni.showToast({ title: '保存成功', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 500)
  } catch (error) {
    uni.hideLoading()
    const message = error instanceof Error ? error.message : '保存失败，请稍后再试'
    uni.showToast({ title: message, icon: 'none' })
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 28rpx 24rpx;
  box-sizing: border-box;
  background:
    radial-gradient(circle at 12% 0%, rgba(225, 197, 145, 0.32), rgba(225, 197, 145, 0) 34%),
    linear-gradient(180deg, #f6efe2 0%, #f7f1e7 100%);
}

.nav {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back,
.save {
  width: 96rpx;
  color: #7d5a2f;
  font-weight: 800;
}

.back {
  font-size: 58rpx;
  line-height: 1;
}

.save {
  font-size: 28rpx;
  text-align: right;
}

.nav-title {
  color: #302416;
  font-size: 34rpx;
  font-weight: 800;
}

.profile-card,
.form-card {
  margin-top: 26rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.72);
  border-radius: 32rpx;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 18rpx 42rpx rgba(94, 68, 35, 0.1);
}

.profile-card {
  padding: 42rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-wrap {
  position: relative;
}

.avatar {
  width: 148rpx;
  height: 148rpx;
  border: 8rpx solid rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  background: #fff8ed;
  box-shadow: 0 14rpx 30rpx rgba(84, 58, 28, 0.18);
}

.camera-icon {
  position: absolute;
  right: 2rpx;
  bottom: 6rpx;
  width: 42rpx;
  height: 42rpx;
  border: 4rpx solid #fff;
  border-radius: 50%;
  background: #dca85d;
  box-shadow: 0 8rpx 18rpx rgba(104, 64, 24, 0.2);
}

.camera-icon::before,
.camera-icon::after {
  content: '';
  position: absolute;
  box-sizing: border-box;
}

.camera-icon::before {
  left: 9rpx;
  top: 12rpx;
  width: 22rpx;
  height: 15rpx;
  border: 3rpx solid #6a421d;
  border-radius: 4rpx;
}

.camera-icon::after {
  left: 17rpx;
  top: 17rpx;
  width: 6rpx;
  height: 6rpx;
  border-radius: 50%;
  background: #6a421d;
}

.hint {
  margin-top: 18rpx;
  color: #8d775d;
  font-size: 24rpx;
}

.form-card {
  padding: 0 28rpx;
}

.form-row {
  min-height: 112rpx;
  border-top: 1rpx solid rgba(132, 105, 69, 0.12);
  display: flex;
  align-items: center;
}

.form-row:first-child {
  border-top: 0;
}

.form-label {
  width: 150rpx;
  color: #332619;
  font-size: 28rpx;
  font-weight: 800;
}

.form-input,
.form-value {
  min-width: 0;
  flex: 1;
  color: #5d4b39;
  font-size: 28rpx;
}
</style>
