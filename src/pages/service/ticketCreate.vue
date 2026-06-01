<template>
  <view class="page">
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <view class="back-icon" />
      </view>
      <text class="nav-title">提交工单</text>
      <text class="nav-action" @tap="submit">提交</text>
    </view>

    <scroll-view scroll-y class="body">
      <view class="form-card">
        <text class="label">问题分类</text>
        <view class="chip-row">
          <view
            v-for="item in categoryOptions"
            :key="item.key"
            class="chip"
            :class="{ active: category === item.key }"
            @tap="category = item.key"
          >
            {{ item.label }}
          </view>
        </view>
      </view>

      <view class="form-card">
        <text class="label">问题描述</text>
        <textarea
          v-model="content"
          class="textarea"
          maxlength="1000"
          placeholder="请描述您的问题，便于客服跟进"
        />
      </view>

      <view class="form-card">
        <text class="label">联系电话</text>
        <input v-model="contact" class="input" type="number" maxlength="11" placeholder="请输入手机号" />
      </view>

      <view class="form-card">
        <text class="label">图片（最多 6 张）</text>
        <view class="image-row">
          <view v-for="(img, idx) in images" :key="img" class="image-item">
            <image :src="img" mode="aspectFill" class="thumb" />
            <text class="image-del" @tap="removeImage(idx)">×</text>
          </view>
          <view v-if="images.length < 6" class="image-add" @tap="addImage">+</view>
        </view>
      </view>

      <view v-if="relatedOrderId || relatedPointId" class="hint-card">
        <text v-if="relatedOrderId">关联订单：{{ relatedOrderId }}</text>
        <text v-if="relatedPointId">关联点位：{{ relatedPointId }}</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { submitSupportTicket } from '../../api/service'
import { getUserProfile, isLoggedIn } from '../../utils/auth'
import { chooseAndUploadImage } from '../../utils/upload'

const categoryOptions = [
  { key: 'ticket_refund', label: '门票退款' },
  { key: 'order_issue', label: '订单问题' },
  { key: 'facility', label: '景区设施' },
  { key: 'route_guide', label: '游览咨询' },
  { key: 'other', label: '其他' },
]

const category = ref('other')
const content = ref('')
const contact = ref('')
const images = ref([])
const relatedOrderId = ref(undefined)
const relatedPointId = ref(undefined)
const submitting = ref(false)

onLoad((options) => {
  if (!isLoggedIn()) {
    uni.redirectTo({ url: '/pages/login/login' })
    return
  }
  const profile = getUserProfile()
  if (profile?.phone) contact.value = profile.phone

  if (options.category) category.value = decodeURIComponent(String(options.category))
  if (options.relatedOrderId) relatedOrderId.value = Number(options.relatedOrderId)
  if (options.relatedPointId) relatedPointId.value = Number(options.relatedPointId)
})

function goBack() {
  uni.navigateBack()
}

function removeImage(index) {
  images.value = images.value.filter((_, i) => i !== index)
}

function addImage() {
  if (images.value.length >= 6) return
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
  const phone = contact.value.trim()
  if (!text) {
    uni.showToast({ title: '请填写问题描述', icon: 'none' })
    return
  }
  if (!/^1\d{10}$/.test(phone)) {
    uni.showToast({ title: '请输入正确手机号', icon: 'none' })
    return
  }

  submitting.value = true
  uni.showLoading({ title: '提交中', mask: true })
  try {
    await submitSupportTicket({
      category: category.value,
      content: text,
      contact: phone,
      images: images.value,
      relatedOrderId: relatedOrderId.value,
      relatedPointId: relatedPointId.value,
    })
    uni.hideLoading()
    uni.showToast({ title: '提交成功', icon: 'success' })
    setTimeout(() => {
      uni.redirectTo({ url: '/pages/service/ticketList' })
    }, 500)
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
  color: #312416;
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
  font-size: 24rpx;
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

.hint-card {
  padding: 20rpx;
  font-size: 24rpx;
  color: #9a8265;
}
</style>
