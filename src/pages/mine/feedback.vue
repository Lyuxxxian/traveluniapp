<template>
  <view class="page">
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <view class="back-icon" />
      </view>
      <text class="nav-title">意见反馈</text>
      <text class="nav-action" @tap="submit">提交</text>
    </view>

    <scroll-view scroll-y class="body">
      <view class="form-card">
        <text class="label">反馈类型</text>
        <view class="chip-row">
          <view
            v-for="item in typeOptions"
            :key="item.key"
            class="chip"
            :class="{ active: feedbackType === item.key }"
            @tap="feedbackType = item.key"
          >
            {{ item.label }}
          </view>
        </view>
      </view>

      <view class="form-card">
        <text class="label">反馈内容</text>
        <textarea
          v-model="content"
          class="textarea"
          maxlength="1000"
          placeholder="请描述您的建议或问题"
        />
      </view>

      <view class="form-card">
        <text class="label">联系方式（选填）</text>
        <input v-model="contact" class="input" type="number" maxlength="11" placeholder="便于景区回访" />
      </view>

      <view class="form-card">
        <text class="label">图片（最多 3 张）</text>
        <view class="image-row">
          <view v-for="(img, idx) in images" :key="img" class="image-item">
            <image :src="img" mode="aspectFill" class="thumb" />
            <text class="image-del" @tap="removeImage(idx)">×</text>
          </view>
          <view v-if="images.length < 3" class="image-add" @tap="addImage">+</view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { submitFeedback } from '../../api/service'
import { getUserProfile, isLoggedIn } from '../../utils/auth'
import { chooseAndUploadImage } from '../../utils/upload'

const typeOptions = [
  { key: 'suggestion', label: '建议' },
  { key: 'complaint', label: '投诉' },
  { key: 'facility', label: '设施' },
  { key: 'other', label: '其他' },
]

const feedbackType = ref('suggestion')
const content = ref('')
const contact = ref('')
const images = ref([])
const relatedPointId = ref(undefined)
const relatedOrderId = ref(undefined)
const submitting = ref(false)

onLoad((options) => {
  if (!isLoggedIn()) {
    uni.redirectTo({ url: '/pages/login/login' })
    return
  }
  const profile = getUserProfile()
  if (profile?.phone) contact.value = profile.phone
  if (options.relatedPointId) relatedPointId.value = Number(options.relatedPointId)
  if (options.relatedOrderId) relatedOrderId.value = Number(options.relatedOrderId)
})

function goBack() {
  uni.navigateBack()
}

function removeImage(index) {
  images.value = images.value.filter((_, i) => i !== index)
}

function addImage() {
  if (images.value.length >= 3) return
  chooseAndUploadImage()
    .then((res) => {
      images.value = [...images.value, res.url]
    })
    .catch((err) => {
      uni.showToast({ title: err?.message || '上传失败', icon: 'none' })
    })
}

async function submit() {
  if (submitting.value) return
  const text = content.value.trim()
  if (!text) {
    uni.showToast({ title: '请填写反馈内容', icon: 'none' })
    return
  }

  submitting.value = true
  uni.showLoading({ title: '提交中', mask: true })
  try {
    await submitFeedback({
      type: feedbackType.value,
      content: text,
      images: images.value,
      contact: contact.value.trim() || undefined,
      relatedPointId: relatedPointId.value,
      relatedOrderId: relatedOrderId.value,
    })
    uni.hideLoading()
    uni.showToast({ title: '感谢您的反馈', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 500)
  } catch (err) {
    uni.hideLoading()
    uni.showToast({ title: err?.message || '提交失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
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

.nav-action {
  font-size: 28rpx;
  font-weight: 700;
  color: #8b6138;
}

.body {
  flex: 1;
  min-height: 0;
  padding: 20rpx 24rpx;
}

.form-card {
  margin-bottom: 20rpx;
  padding: 24rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.9);
}

.label {
  display: block;
  margin-bottom: 16rpx;
  font-size: 28rpx;
  font-weight: 700;
  color: #6f451d;
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.chip {
  padding: 12rpx 20rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  color: #6f451d;
  background: rgba(139, 97, 56, 0.1);
}

.chip.active {
  background: #8b6138;
  color: #fff;
}

.textarea {
  width: 100%;
  min-height: 200rpx;
  font-size: 28rpx;
}

.input {
  width: 100%;
  font-size: 28rpx;
}

.image-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.image-item {
  position: relative;
  width: 160rpx;
  height: 160rpx;
}

.thumb {
  width: 100%;
  height: 100%;
  border-radius: 12rpx;
}

.image-del {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  width: 36rpx;
  height: 36rpx;
  line-height: 36rpx;
  text-align: center;
  border-radius: 50%;
  background: #c45c5c;
  color: #fff;
}

.image-add {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  border: 2rpx dashed #c4a35a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  color: #9a8265;
}
</style>
