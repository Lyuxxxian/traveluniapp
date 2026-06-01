<template>
  <view class="page">
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <view class="back-icon" />
      </view>
      <text class="nav-title">{{ detail?.title || '填写问卷' }}</text>
      <text class="nav-action" @tap="submit">提交</text>
    </view>

    <scroll-view scroll-y class="body">
      <view v-if="loading" class="center-state">
        <text>加载中...</text>
      </view>
      <view v-else-if="!detail" class="center-state">
        <text>问卷不存在</text>
      </view>
      <view v-else>
        <text v-if="detail.desc" class="intro">{{ detail.desc }}</text>

        <view v-for="q in detail.questions" :key="q.id" class="q-card">
          <text class="q-title">
            {{ q.title }}
            <text v-if="q.required !== false" class="required">*</text>
          </text>

          <view v-if="q.type === 'score'" class="star-row">
            <text
              v-for="n in 5"
              :key="n"
              class="star"
              :class="{ on: getScore(q.id) >= n }"
              @tap="setScore(q.id, n)"
            >★</text>
          </view>

          <view v-else-if="q.type === 'single'" class="opt-list">
            <view
              v-for="opt in q.options"
              :key="opt.id"
              class="opt-item"
              :class="{ active: getSingle(q.id) === opt.id }"
              @tap="setSingle(q.id, opt.id)"
            >
              {{ opt.label }}
            </view>
          </view>

          <view v-else-if="q.type === 'multi'" class="opt-list">
            <view
              v-for="opt in q.options"
              :key="opt.id"
              class="opt-item"
              :class="{ active: getMulti(q.id).includes(opt.id) }"
              @tap="toggleMulti(q.id, opt.id)"
            >
              {{ opt.label }}
            </view>
          </view>

          <textarea
            v-else-if="q.type === 'text'"
            class="textarea"
            :value="getText(q.id)"
            placeholder="请输入"
            @input="(e) => setText(q.id, e.detail.value)"
          />
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { fetchQuestionnaireDetail, submitQuestionnaire } from '../../api/service'
import { isLoggedIn } from '../../utils/auth'

const questionnaireId = ref(0)
const loading = ref(true)
const detail = ref(null)
const submitting = ref(false)
const answers = ref({})

onLoad((options) => {
  if (!isLoggedIn()) {
    uni.redirectTo({ url: '/pages/login/login' })
    return
  }
  questionnaireId.value = Number(options.id)
  if (!questionnaireId.value) {
    loading.value = false
    return
  }
  loadDetail()
})

function goBack() {
  uni.navigateBack()
}

async function loadDetail() {
  loading.value = true
  try {
    detail.value = await fetchQuestionnaireDetail(questionnaireId.value)
  } catch {
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function getScore(qid) {
  return Number(answers.value[qid]) || 0
}

function setScore(qid, n) {
  answers.value = { ...answers.value, [qid]: n }
}

function getSingle(qid) {
  return answers.value[qid] || ''
}

function setSingle(qid, optId) {
  answers.value = { ...answers.value, [qid]: optId }
}

function getMulti(qid) {
  return Array.isArray(answers.value[qid]) ? answers.value[qid] : []
}

function toggleMulti(qid, optId) {
  const list = [...getMulti(qid)]
  const idx = list.indexOf(optId)
  if (idx >= 0) list.splice(idx, 1)
  else list.push(optId)
  answers.value = { ...answers.value, [qid]: list }
}

function getText(qid) {
  return answers.value[qid] || ''
}

function setText(qid, val) {
  answers.value = { ...answers.value, [qid]: val }
}

function validate() {
  if (!detail.value?.questions) return false
  for (const q of detail.value.questions) {
    if (q.required === false) continue
    const val = answers.value[q.id]
    if (q.type === 'multi') {
      if (!Array.isArray(val) || !val.length) {
        uni.showToast({ title: `请完成：${q.title}`, icon: 'none' })
        return false
      }
    } else if (q.type === 'score') {
      if (!val || val < 1) {
        uni.showToast({ title: `请完成：${q.title}`, icon: 'none' })
        return false
      }
    } else if (!val || (typeof val === 'string' && !val.trim())) {
      uni.showToast({ title: `请完成：${q.title}`, icon: 'none' })
      return false
    }
  }
  return true
}

async function submit() {
  if (submitting.value || !detail.value) return
  if (!validate()) return

  const payload = detail.value.questions.map((q) => ({
    questionId: q.id,
    value: answers.value[q.id],
  }))

  submitting.value = true
  uni.showLoading({ title: '提交中', mask: true })
  try {
    const result = await submitQuestionnaire(questionnaireId.value, payload)
    uni.hideLoading()
    uni.showToast({
      title: result.rewardHint || '提交成功',
      icon: 'none',
      duration: 2500,
    })
    setTimeout(() => uni.navigateBack(), 800)
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
  max-width: 420rpx;
  font-size: 30rpx;
  font-weight: 800;
  color: #312416;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-action {
  font-size: 28rpx;
  font-weight: 700;
  color: #8b6138;
}

.body {
  flex: 1;
  min-height: 0;
  padding: 20rpx 24rpx 40rpx;
}

.center-state {
  min-height: 400rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9a8265;
}

.intro {
  display: block;
  margin-bottom: 20rpx;
  font-size: 26rpx;
  color: #5c4a32;
}

.q-card {
  margin-bottom: 20rpx;
  padding: 24rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.92);
}

.q-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #312416;
}

.required {
  color: #c45c5c;
}

.star-row {
  display: flex;
  gap: 12rpx;
  margin-top: 16rpx;
}

.star {
  font-size: 44rpx;
  color: #ddd;
}

.star.on {
  color: #d8ad6b;
}

.opt-list {
  margin-top: 16rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.opt-item {
  padding: 18rpx 20rpx;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #5c4a32;
  background: rgba(139, 97, 56, 0.08);
}

.opt-item.active {
  background: #8b6138;
  color: #fff;
}

.textarea {
  width: 100%;
  min-height: 160rpx;
  margin-top: 16rpx;
  font-size: 28rpx;
}
</style>
