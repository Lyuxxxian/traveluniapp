<template>
  <view class="page">
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <view class="back-icon" />
      </view>
      <text class="nav-title">写点评</text>
      <text class="nav-action" @tap="submit">发布</text>
    </view>

    <scroll-view scroll-y class="body">
      <view class="target-card">
        <text class="target-label">评价对象</text>
        <text class="target-title">{{ displayTitle }}</text>
      </view>

      <view class="form-card">
        <text class="label">评分</text>
        <view class="star-row">
          <text
            v-for="n in 5"
            :key="n"
            class="star"
            :class="{ on: n <= rating }"
            @tap="rating = n"
          >★</text>
        </view>
      </view>

      <view class="form-card">
        <text class="label">评价内容</text>
        <textarea
          v-model="content"
          class="textarea"
          maxlength="500"
          placeholder="分享您的游览体验"
        />
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
import { submitReview } from '../../api/service'
import { isLoggedIn } from '../../utils/auth'
import { chooseAndUploadImage } from '../../utils/upload'

const targetType = ref('spot')
const targetId = ref(0)
const displayTitle = ref('景点')
const orderId = ref(undefined)
const rating = ref(5)
const content = ref('')
const images = ref([])
const submitting = ref(false)

onLoad((options) => {
  if (!isLoggedIn()) {
    uni.redirectTo({ url: '/pages/login/login' })
    return
  }
  if (options.targetType) targetType.value = decodeURIComponent(String(options.targetType))
  if (options.targetId) targetId.value = Number(options.targetId)
  if (options.title) displayTitle.value = decodeURIComponent(String(options.title))
  if (options.orderId) orderId.value = Number(options.orderId)
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
    uni.showToast({ title: '请填写评价内容', icon: 'none' })
    return
  }
  if (!targetId.value) {
    uni.showToast({ title: '缺少评价对象', icon: 'none' })
    return
  }

  submitting.value = true
  uni.showLoading({ title: '提交中', mask: true })
  try {
    await submitReview({
      targetType: targetType.value,
      targetId: targetId.value,
      rating: rating.value,
      content: text,
      images: images.value,
      orderId: orderId.value,
    })
    uni.hideLoading()
    uni.showToast({ title: '发布成功', icon: 'success' })
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

.target-card,
.form-card {
  margin-bottom: 20rpx;
  padding: 24rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.9);
}

.target-label {
  font-size: 24rpx;
  color: #9a8265;
}

.target-title {
  display: block;
  margin-top: 8rpx;
  font-size: 32rpx;
  font-weight: 800;
  color: #312416;
}

.label {
  display: block;
  margin-bottom: 16rpx;
  font-size: 28rpx;
  font-weight: 700;
  color: #6f451d;
}

.star-row {
  display: flex;
  gap: 12rpx;
}

.star {
  font-size: 48rpx;
  color: #ddd;
}

.star.on {
  color: #d8ad6b;
}

.textarea {
  width: 100%;
  min-height: 200rpx;
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
