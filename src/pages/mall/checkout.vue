<template>
  <view class="page">
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack"><view class="back-icon" /></view>
      <text class="nav-title">订单结算</text>
      <view class="nav-placeholder" />
    </view>

    <scroll-view scroll-y class="content" v-if="detail">
      <view class="section product-section">
        <text class="section-title">订单信息</text>
        <view class="product-card">
          <image class="product-cover" :src="detail.coverUrl" mode="aspectFill" />
          <view class="product-info">
            <text class="product-title">{{ detail.title }}</text>
            <text class="product-sub">{{ selectedSpec?.name || '默认规格' }}</text>
            <text class="product-mode">{{ saleMode === 'presale' ? '预售门票' : '当日门票' }}</text>
          </view>
          <view class="product-price">
            <text>¥{{ formatPrice(selectedPrice) }}</text>
            <text class="qty">×1</text>
          </view>
        </view>
      </view>

      <view class="section" v-if="saleMode === 'presale'">
        <view class="section-head">
          <text class="section-title">选择游玩日期</text>
          <text class="section-sub">最晚可预购至 {{ yearEndDate }}</text>
        </view>
        <view class="date-grid">
          <view
            class="date-card"
            v-for="item in visibleDateOptions"
            :key="item.key"
            :class="{ active: visitDate === item.date }"
            @tap="selectDate(item.date)"
          >
            <text class="date-label">{{ item.label }}</text>
            <text class="date-day">{{ item.day }}</text>
            <text class="date-price">¥{{ formatPrice(item.price) }}</text>
          </view>
          <view
            class="date-card more"
            :class="{ active: isMoreDateSelected || showCalendar }"
            @tap.stop="toggleCalendar"
          >
            <text class="date-label">更多日期</text>
            <text class="date-day">至年底</text>
            <text class="date-price">{{ moreDateLabel }}</text>
          </view>
        </view>

        <view v-show="showCalendar" class="calendar-panel">
          <view class="calendar-head">
            <view class="month-btn" :class="{ disabled: !canPrevMonth }" @tap.stop="prevMonth">
              <text>&lt;</text>
            </view>
            <text class="month-title">{{ calendarMonthAnchor.year }}年{{ calendarMonthAnchor.month }}月</text>
            <view class="month-btn" :class="{ disabled: !canNextMonth }" @tap.stop="nextMonth">
              <text>&gt;</text>
            </view>
          </view>

          <view class="week-row">
            <text v-for="weekday in weekDays" :key="weekday" class="week-cell">{{ weekday }}</text>
          </view>

          <view class="calendar-grid">
            <view
              v-for="(cell, index) in calendarCells"
              :key="cell.key || index"
              :class="calendarCellClass(cell)"
              @tap.stop="selectCalendarDate(cell)"
            >
              <view v-if="!cell.empty" class="cell-inner">
                <text class="cell-day">{{ cell.day }}</text>
                <text v-if="cell.selectable" class="cell-price">¥{{ formatPrice(cell.price) }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="section" v-else>
        <view class="section-head">
          <text class="section-title">使用日期</text>
          <text class="section-sub">当日票仅限今日使用</text>
        </view>
        <view class="today-date">
          <text>{{ visitDate }}</text>
          <text>¥{{ formatPrice(selectedPrice) }}</text>
        </view>
      </view>

      <view class="section">
        <view class="section-head">
          <text class="section-title">订购人信息</text>
          <text class="section-action" @tap="showAddVisitor = true">新增订购人</text>
        </view>

        <view v-if="visitors.length === 0" class="empty-visitor">
          <text>暂无常用订购人，请先新增</text>
        </view>

        <view
          class="visitor-card"
          v-for="item in visitors"
          :key="item.id"
          :class="{ active: selectedVisitorId === item.id }"
          @tap="selectVisitor(item)"
        >
          <view>
            <text class="visitor-name">{{ item.name }}</text>
            <text class="visitor-meta">{{ item.phone }} · {{ maskIdCard(item.idCard) }}</text>
          </view>
          <text class="visitor-check">{{ selectedVisitorId === item.id ? '✓' : '' }}</text>
        </view>
      </view>

      <view class="section amount-section">
        <view class="amount-row">
          <text>商品金额</text>
          <text>¥{{ formatPrice(selectedPrice) }}</text>
        </view>
        <view class="amount-row total">
          <text>应付金额</text>
          <text>¥{{ formatPrice(selectedPrice) }}</text>
        </view>
      </view>

      <view class="bottom-spacer" />
    </scroll-view>

    <view class="bottom-bar" v-if="detail">
      <view>
        <text class="bottom-label">合计</text>
        <text class="bottom-price">¥{{ formatPrice(selectedPrice) }}</text>
      </view>
      <view class="submit-btn" @tap="submitOrder"><text>提交订单</text></view>
    </view>

    <view v-if="showAddVisitor" class="mask" @tap="showAddVisitor = false">
      <view class="dialog" @tap.stop>
        <text class="dialog-title">新增订购人</text>
        <view class="form-row">
          <text class="form-label">姓名</text>
          <input class="form-input" v-model="visitorForm.name" placeholder="请输入姓名" />
        </view>
        <view class="form-row">
          <text class="form-label">手机号</text>
          <input class="form-input" v-model="visitorForm.phone" type="number" maxlength="11" placeholder="请输入手机号" />
        </view>
        <view class="form-row">
          <text class="form-label">身份证号</text>
          <input class="form-input" v-model="visitorForm.idCard" maxlength="20" placeholder="请输入身份证号" />
        </view>
        <view class="dialog-actions">
          <view class="dialog-btn cancel" @tap="showAddVisitor = false"><text>取消</text></view>
          <view class="dialog-btn confirm" @tap="addVisitor"><text>保存并选择</text></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { fetchProductDetail } from '../../api/mall'
import { createOrder } from '../../api/mine'
import { createVisitor, fetchVisitors } from '../../api/user'

const detail = ref(null)
const specId = ref(0)
const saleMode = ref('daily')
const visitDate = ref('')
const visitors = ref([])
const selectedVisitorId = ref(0)
const selectedVisitor = ref(null)
const showAddVisitor = ref(false)
const showCalendar = ref(false)
const calendarMonthAnchor = ref({ year: new Date().getFullYear(), month: new Date().getMonth() + 1 })
const visitorForm = reactive({ name: '', phone: '', idCard: '' })
const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const selectedSpec = computed(() => detail.value?.specs?.find((item) => Number(item.id) === Number(specId.value)))
const selectedPrice = computed(() => selectedSpec.value?.price ?? detail.value?.price ?? 0)
const todayDate = computed(() => formatDate(new Date()))
const tomorrowDate = computed(() => {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return formatDate(date)
})
const yearEndDate = computed(() => `${new Date().getFullYear()}-12-31`)

const visibleDateOptions = computed(() => {
  const list = []
  for (let i = 1; i <= 7; i += 1) {
    const date = new Date()
    date.setDate(date.getDate() + i)
    const dateText = formatDate(date)
    list.push({
      key: dateText,
      date: dateText,
      label: i === 1 ? '明天' : weekLabel(date),
      day: `${date.getMonth() + 1}/${date.getDate()}`,
      price: selectedPrice.value,
    })
  }
  return list
})

const quickDateSet = computed(() => new Set(visibleDateOptions.value.map((item) => item.date)))

const isMoreDateSelected = computed(() => {
  if (!visitDate.value) return false
  return !quickDateSet.value.has(visitDate.value)
})

const moreDateLabel = computed(() => {
  if (isMoreDateSelected.value && visitDate.value) {
    return visitDate.value.slice(5)
  }
  return '展开'
})

const calendarCells = computed(() => {
  const { year, month } = calendarMonthAnchor.value
  const firstDay = new Date(year, month - 1, 1)
  const startWeekday = firstDay.getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const cells = []

  for (let i = 0; i < startWeekday; i += 1) {
    cells.push({ key: `empty-${i}`, empty: true })
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateText = formatDate(new Date(year, month - 1, day))
    const selectable = dateText >= tomorrowDate.value && dateText <= yearEndDate.value
    cells.push({
      key: dateText,
      empty: false,
      day,
      date: dateText,
      selectable,
      selected: visitDate.value === dateText,
      price: selectedPrice.value,
    })
  }

  return cells
})

const canPrevMonth = computed(() => {
  const tomorrow = parseDateString(tomorrowDate.value)
  const current = new Date(calendarMonthAnchor.value.year, calendarMonthAnchor.value.month - 1, 1)
  const minMonth = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), 1)
  return current > minMonth
})

const canNextMonth = computed(() => {
  const end = parseDateString(yearEndDate.value)
  const current = new Date(calendarMonthAnchor.value.year, calendarMonthAnchor.value.month - 1, 1)
  const maxMonth = new Date(end.getFullYear(), end.getMonth(), 1)
  return current < maxMonth
})

function formatDate(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function weekLabel(date) {
  return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()]
}

function parseDateString(value) {
  const [year, month, day] = String(value).split('-').map(Number)
  return new Date(year, month - 1, day)
}

function syncCalendarMonth(dateText) {
  const date = parseDateString(dateText)
  calendarMonthAnchor.value = {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
  }
}

function formatPrice(priceInFen) {
  const yuan = Number(priceInFen || 0) / 100
  if (yuan % 1 === 0) return String(yuan)
  return yuan.toFixed(yuan < 10 ? 1 : 0)
}

function maskIdCard(value) {
  const text = String(value || '')
  if (text.length <= 8) return text
  return `${text.slice(0, 4)}********${text.slice(-4)}`
}

function goBack() {
  uni.navigateBack()
}

function selectDate(date) {
  visitDate.value = date
  showCalendar.value = false
}

function toggleCalendar() {
  showCalendar.value = !showCalendar.value
  if (!showCalendar.value) return

  if (visitDate.value && isMoreDateSelected.value) {
    syncCalendarMonth(visitDate.value)
    return
  }
  syncCalendarMonth(tomorrowDate.value)
}

function prevMonth() {
  if (!canPrevMonth.value) return
  const next = new Date(calendarMonthAnchor.value.year, calendarMonthAnchor.value.month - 2, 1)
  calendarMonthAnchor.value = {
    year: next.getFullYear(),
    month: next.getMonth() + 1,
  }
}

function nextMonth() {
  if (!canNextMonth.value) return
  const next = new Date(calendarMonthAnchor.value.year, calendarMonthAnchor.value.month, 1)
  calendarMonthAnchor.value = {
    year: next.getFullYear(),
    month: next.getMonth() + 1,
  }
}

function selectCalendarDate(cell) {
  if (cell.empty || !cell.selectable) return
  visitDate.value = cell.date
}

function calendarCellClass(cell) {
  const classes = ['calendar-cell']
  if (cell.empty) classes.push('empty')
  if (!cell.empty && !cell.selectable) classes.push('disabled')
  if (!cell.empty && cell.selected) classes.push('active')
  return classes.join(' ')
}

function selectVisitor(item) {
  selectedVisitorId.value = item.id
  selectedVisitor.value = item
}

function validateVisitorForm(form) {
  if (!form.name.trim()) return '请填写姓名'
  if (!/^1\d{10}$/.test(form.phone.trim())) return '请填写正确手机号'
  if (!/^[0-9A-Za-z]{6,20}$/.test(form.idCard.trim())) return '请填写正确身份证号'
  return ''
}

function resetVisitorForm() {
  visitorForm.name = ''
  visitorForm.phone = ''
  visitorForm.idCard = ''
}

async function loadVisitors() {
  visitors.value = await fetchVisitors()
  const preferred = visitors.value.find((item) => item.isDefault) || visitors.value[0]
  if (preferred) selectVisitor(preferred)
}

async function addVisitor() {
  const error = validateVisitorForm(visitorForm)
  if (error) {
    uni.showToast({ title: error, icon: 'none' })
    return
  }

  uni.showLoading({ title: '保存中...' })
  try {
    const row = await createVisitor({
      name: visitorForm.name.trim(),
      phone: visitorForm.phone.trim(),
      idCard: visitorForm.idCard.trim(),
      isDefault: visitors.value.length === 0,
    })
    await loadVisitors()
    selectVisitor(row)
    showAddVisitor.value = false
    resetVisitorForm()
    uni.hideLoading()
  } catch {
    uni.hideLoading()
    uni.showToast({ title: '保存失败', icon: 'none' })
  }
}

async function submitOrder() {
  if (!selectedVisitor.value) {
    uni.showToast({ title: '请选择订购人', icon: 'none' })
    return
  }
  if (saleMode.value === 'presale' && !visitDate.value) {
    uni.showToast({ title: '请选择游玩日期', icon: 'none' })
    return
  }
  if (!selectedSpec.value) {
    uni.showToast({ title: '请选择规格', icon: 'none' })
    return
  }

  uni.showLoading({ title: '提交中...' })
  try {
    const result = await createOrder({
      title: detail.value.title,
      coverUrl: detail.value.coverUrl,
      productType: detail.value.type,
      buyerName: selectedVisitor.value.name,
      buyerPhone: selectedVisitor.value.phone,
      buyerIdCard: selectedVisitor.value.idCard,
      visitDate: visitDate.value,
      ticketSaleMode: saleMode.value,
      items: [
        {
          productId: detail.value.id,
          skuName: selectedSpec.value.name,
          skuPrice: selectedPrice.value,
          quantity: 1,
        },
      ],
    })
    uni.hideLoading()
    uni.navigateTo({ url: `/pages/mine/orderInfo?id=${result.id}` })
  } catch {
    uni.hideLoading()
    uni.showToast({ title: '提交失败', icon: 'none' })
  }
}

onLoad(async (options) => {
  const id = Number(options?.id || 0)
  specId.value = Number(options?.specId || 0)
  saleMode.value = options?.mode === 'presale' ? 'presale' : 'daily'
  visitDate.value = saleMode.value === 'presale' ? tomorrowDate.value : todayDate.value

  if (!id) {
    uni.showToast({ title: '商品不存在', icon: 'none' })
    return
  }

  try {
    detail.value = await fetchProductDetail(id)
    if (!specId.value && detail.value.specs?.[0]) specId.value = detail.value.specs[0].id
    await loadVisitors()
  } catch {
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
})
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background:
    radial-gradient(circle at 12% 0%, rgba(225, 197, 145, 0.34), rgba(225, 197, 145, 0) 34%),
    linear-gradient(180deg, #f6efe2 0%, #f4f5ef 45%, #f7f1e7 100%);
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 24rpx;
  padding-top: var(--status-bar-height);
  flex-shrink: 0;
}

.nav-back {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.78);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 22rpx rgba(94, 68, 35, 0.1);
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

.nav-placeholder {
  width: 64rpx;
}

.content {
  flex: 1;
  min-height: 0;
  padding: 20rpx 24rpx;
  box-sizing: border-box;
}

.section {
  margin-bottom: 22rpx;
  padding: 24rpx;
  border-radius: 26rpx;
  background: rgba(255, 255, 255, 0.84);
  box-shadow: 0 16rpx 36rpx rgba(94, 68, 35, 0.08);
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18rpx;
}

.section-title,
.product-title,
.product-sub,
.product-mode,
.product-price text,
.section-sub,
.section-action,
.date-label,
.date-day,
.date-price,
.month-title,
.week-cell,
.cell-day,
.cell-price,
.visitor-name,
.visitor-meta,
.bottom-label,
.bottom-price,
.dialog-title,
.form-label {
  display: block;
}

.section-title {
  color: #312416;
  font-size: 28rpx;
  font-weight: 800;
}

.section-sub,
.section-action {
  color: #9a8265;
  font-size: 22rpx;
}

.section-action {
  color: #a76524;
  font-weight: 800;
}

.product-card {
  display: flex;
  align-items: center;
}

.product-cover {
  width: 120rpx;
  height: 120rpx;
  border-radius: 18rpx;
  background: #eee;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
  min-width: 0;
  margin-left: 18rpx;
}

.product-title {
  color: #312416;
  font-size: 28rpx;
  font-weight: 800;
}

.product-sub,
.product-mode {
  margin-top: 6rpx;
  color: #9a8265;
  font-size: 22rpx;
}

.product-price {
  margin-left: 16rpx;
  text-align: right;
}

.product-price text:first-child {
  color: #a76524;
  font-size: 30rpx;
  font-weight: 900;
}

.qty {
  margin-top: 6rpx;
  color: #9a8265;
  font-size: 22rpx;
}

.date-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14rpx;
}

.date-card {
  padding: 16rpx 8rpx;
  border: 2rpx solid #eadcc9;
  border-radius: 18rpx;
  background: #fffaf4;
  text-align: center;
}

.date-card.active {
  border-color: #8b6138;
  background: #fff1dc;
}

.date-card.more {
  border-style: dashed;
}

.date-label {
  color: #6f451d;
  font-size: 22rpx;
  font-weight: 800;
}

.date-day {
  margin-top: 6rpx;
  color: #312416;
  font-size: 24rpx;
}

.date-price {
  margin-top: 6rpx;
  color: #a76524;
  font-size: 22rpx;
  font-weight: 800;
}

.calendar-panel {
  margin-top: 18rpx;
  padding: 20rpx;
  border-radius: 22rpx;
  background: #fffaf4;
  border: 2rpx solid #eadcc9;
}

.calendar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.month-btn {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: #f1dfc1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.month-btn text {
  color: #6f451d;
  font-size: 34rpx;
  line-height: 1;
}

.month-btn.disabled {
  opacity: 0.35;
}

.month-title {
  color: #312416;
  font-size: 28rpx;
  font-weight: 800;
}

.week-row,
.calendar-grid {
  display: flex;
  flex-wrap: wrap;
}

.week-row {
  margin-top: 18rpx;
}

.week-cell {
  width: 14.285%;
  text-align: center;
  color: #9a8265;
  font-size: 22rpx;
  font-weight: 700;
}

.calendar-grid {
  margin-top: 12rpx;
}

.calendar-cell {
  width: 14.285%;
  min-height: 88rpx;
  padding: 5rpx;
  box-sizing: border-box;
}

.cell-inner {
  height: 78rpx;
  border-radius: 14rpx;
  border-radius: 14rpx;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2rpx solid transparent;
  box-sizing: border-box;
}

.calendar-cell.empty {
  background: transparent;
}

.calendar-cell.disabled {
  opacity: 0.28;
}

.calendar-cell.active .cell-inner {
  border-color: #8b6138;
  background: #fff1dc;
}

.cell-day {
  color: #312416;
  font-size: 26rpx;
  font-weight: 800;
}

.cell-price {
  margin-top: 4rpx;
  color: #a76524;
  font-size: 18rpx;
  font-weight: 700;
}

.today-date,
.amount-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #312416;
  font-size: 28rpx;
  font-weight: 800;
}

.visitor-card {
  margin-top: 14rpx;
  padding: 20rpx;
  border: 2rpx solid #eadcc9;
  border-radius: 18rpx;
  background: #fffaf4;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.visitor-card.active {
  border-color: #8b6138;
  background: #fff1dc;
}

.visitor-name {
  color: #312416;
  font-size: 28rpx;
  font-weight: 800;
}

.visitor-meta {
  margin-top: 8rpx;
  color: #8d775d;
  font-size: 22rpx;
}

.visitor-check {
  width: 42rpx;
  height: 42rpx;
  border-radius: 50%;
  background: #8b6138;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
}

.empty-visitor {
  padding: 26rpx;
  border-radius: 18rpx;
  background: #fffaf4;
  color: #9a8265;
  font-size: 24rpx;
  text-align: center;
}

.amount-section {
  margin-bottom: 0;
}

.amount-row {
  padding: 8rpx 0;
  color: #9a8265;
  font-size: 26rpx;
  font-weight: 600;
}

.amount-row.total {
  margin-top: 10rpx;
  padding-top: 18rpx;
  border-top: 1rpx solid #f0e6da;
  color: #a76524;
  font-size: 32rpx;
  font-weight: 900;
}

.bottom-spacer {
  height: 140rpx;
}

.bottom-bar {
  height: 116rpx;
  padding: 0 28rpx;
  background: rgba(255, 255, 255, 0.96);
  border-top: 1rpx solid rgba(182, 138, 75, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 -10rpx 30rpx rgba(72, 50, 24, 0.08);
}

.bottom-label {
  color: #9a8265;
  font-size: 22rpx;
}

.bottom-price {
  color: #a76524;
  font-size: 42rpx;
  font-weight: 900;
}

.submit-btn {
  padding: 18rpx 56rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #8b6138 0%, #d8ad6b 100%);
  box-shadow: 0 10rpx 24rpx rgba(139, 97, 56, 0.22);
}

.submit-btn text {
  color: #fffaf0;
  font-size: 28rpx;
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
