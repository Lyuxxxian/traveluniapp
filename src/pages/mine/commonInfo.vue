<template>
  <view class="page">
    <view class="nav">
      <text class="back" @tap="goBack">‹</text>
      <text class="nav-title">常用信息</text>
      <text class="save" @tap="showAdd = true">新增</text>
    </view>

    <scroll-view scroll-y class="content">
      <view v-if="visitors.length === 0" class="empty">
        <text class="empty-title">暂无常用订购人</text>
        <text class="empty-desc">新增后，购买门票时可快速选择。</text>
      </view>

      <view class="visitor-card" v-for="item in visitors" :key="item.id">
        <view>
          <text class="visitor-name">{{ item.name }}</text>
          <text class="visitor-meta">{{ item.phone }}</text>
          <text class="visitor-meta">{{ maskIdCard(item.idCard) }}</text>
        </view>
        <text v-if="item.isDefault" class="default-tag">默认</text>
      </view>
    </scroll-view>

    <view class="bottom-btn" @tap="showAdd = true">
      <text>新增订购人</text>
    </view>

    <view v-if="showAdd" class="mask" @tap="showAdd = false">
      <view class="dialog" @tap.stop>
        <text class="dialog-title">新增订购人</text>
        <view class="form-row">
          <text class="form-label">姓名</text>
          <input class="form-input" v-model="form.name" placeholder="请输入姓名" />
        </view>
        <view class="form-row">
          <text class="form-label">手机号</text>
          <input class="form-input" v-model="form.phone" type="number" maxlength="11" placeholder="请输入手机号" />
        </view>
        <view class="form-row">
          <text class="form-label">身份证号</text>
          <input class="form-input" v-model="form.idCard" maxlength="20" placeholder="请输入身份证号" />
        </view>
        <view class="dialog-actions">
          <view class="dialog-btn cancel" @tap="showAdd = false"><text>取消</text></view>
          <view class="dialog-btn confirm" @tap="submit"><text>保存</text></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app'
import { reactive, ref } from 'vue'
import { createVisitor, fetchVisitors } from '../../api/user'

const visitors = ref([])
const showAdd = ref(false)
const form = reactive({
  name: '',
  phone: '',
  idCard: '',
})

function goBack() {
  uni.navigateBack()
}

function maskIdCard(value) {
  const text = String(value || '')
  if (text.length <= 8) return text
  return `${text.slice(0, 4)}********${text.slice(-4)}`
}

function resetForm() {
  form.name = ''
  form.phone = ''
  form.idCard = ''
}

async function load() {
  try {
    visitors.value = await fetchVisitors()
  } catch {
    visitors.value = []
  }
}

async function submit() {
  if (!form.name.trim()) {
    uni.showToast({ title: '请填写姓名', icon: 'none' })
    return
  }
  if (!/^1\d{10}$/.test(form.phone.trim())) {
    uni.showToast({ title: '请填写正确手机号', icon: 'none' })
    return
  }
  if (!/^[0-9A-Za-z]{6,20}$/.test(form.idCard.trim())) {
    uni.showToast({ title: '请填写正确身份证号', icon: 'none' })
    return
  }

  uni.showLoading({ title: '保存中...' })
  try {
    await createVisitor({
      name: form.name.trim(),
      phone: form.phone.trim(),
      idCard: form.idCard.trim(),
      isDefault: visitors.value.length === 0,
    })
    uni.hideLoading()
    uni.showToast({ title: '已保存', icon: 'success' })
    showAdd.value = false
    resetForm()
    await load()
  } catch {
    uni.hideLoading()
    uni.showToast({ title: '保存失败', icon: 'none' })
  }
}

onShow(load)
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 28rpx 24rpx 150rpx;
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

.content {
  height: calc(100vh - 220rpx);
}

.empty {
  margin-top: 80rpx;
  padding: 60rpx 30rpx;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.78);
  text-align: center;
}

.empty-title,
.empty-desc,
.visitor-name,
.visitor-meta,
.default-tag,
.dialog-title,
.form-label {
  display: block;
}

.empty-title {
  color: #312416;
  font-size: 30rpx;
  font-weight: 800;
}

.empty-desc {
  margin-top: 12rpx;
  color: #9a8265;
  font-size: 24rpx;
}

.visitor-card {
  margin-top: 18rpx;
  padding: 26rpx;
  border-radius: 26rpx;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 14rpx 32rpx rgba(94, 68, 35, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.visitor-name {
  color: #312416;
  font-size: 30rpx;
  font-weight: 800;
}

.visitor-meta {
  margin-top: 8rpx;
  color: #8d775d;
  font-size: 24rpx;
}

.default-tag {
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
  background: #f1dfc1;
  color: #7b5529;
  font-size: 22rpx;
  font-weight: 700;
}

.bottom-btn {
  position: fixed;
  left: 28rpx;
  right: 28rpx;
  bottom: 34rpx;
  height: 88rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #8b6138 0%, #d8ad6b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 24rpx rgba(139, 97, 56, 0.22);
}

.bottom-btn text {
  color: #fffaf0;
  font-size: 30rpx;
  font-weight: 800;
}

.mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: flex-end;
  z-index: 50;
}

.dialog {
  width: 100%;
  padding: 34rpx 28rpx 56rpx;
  border-radius: 34rpx 34rpx 0 0;
  background: #fff;
  box-sizing: border-box;
}

.dialog-title {
  text-align: center;
  color: #312416;
  font-size: 32rpx;
  font-weight: 800;
  margin-bottom: 24rpx;
}

.form-row {
  margin-top: 16rpx;
  padding: 18rpx 20rpx;
  border: 2rpx solid #efe3d4;
  border-radius: 18rpx;
  background: #fffaf4;
  display: flex;
  align-items: center;
}

.form-label {
  width: 150rpx;
  color: #6f451d;
  font-size: 26rpx;
  font-weight: 700;
}

.form-input {
  flex: 1;
  color: #312416;
  font-size: 26rpx;
}

.dialog-actions {
  margin-top: 30rpx;
  display: flex;
  gap: 18rpx;
}

.dialog-btn {
  flex: 1;
  height: 78rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-btn text {
  font-size: 28rpx;
  font-weight: 800;
}

.dialog-btn.cancel {
  background: #f5efe4;
}

.dialog-btn.cancel text {
  color: #7b5529;
}

.dialog-btn.confirm {
  background: linear-gradient(135deg, #8b6138 0%, #d8ad6b 100%);
}

.dialog-btn.confirm text {
  color: #fffaf0;
}
</style>
