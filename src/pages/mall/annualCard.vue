<template>
  <TabBar activeTab="mall" :showTabbar="true">
    <view class="page">
      <view class="nav-bar">
        <view class="nav-back" @tap="goBack">
          <view class="back-icon" />
        </view>
        <text class="nav-title">年卡</text>
        <view class="nav-placeholder" />
      </view>

      <view class="search-row">
        <view class="search-box">
          <view class="search-icon" />
          <input
            class="search-input"
            v-model="keyword"
            placeholder="搜索年卡"
            placeholder-style="color: #9a8265"
            confirm-type="search"
            @confirm="onSearch"
          />
        </view>
      </view>

      <view class="sort-row">
        <view
          class="sort-item"
          :class="{ active: sortType === 'default' }"
          @tap="changeSort('default')"
        >
          <text>综合</text>
        </view>
        <view
          class="sort-item"
          :class="{ active: sortType === 'price' }"
          @tap="changeSort('price')"
        >
          <text>价格</text>
          <view class="sort-arrows">
            <text class="arrow up" :class="{ on: sortType === 'price' && !sortDesc }">▲</text>
            <text class="arrow down" :class="{ on: sortType === 'price' && sortDesc }">▼</text>
          </view>
        </view>
      </view>

      <scroll-view
        class="product-list"
        scroll-y
        @scrolltolower="loadMore"
      >
        <view v-if="loading" class="loading-state">
          <text class="loading-text">加载中...</text>
        </view>

        <template v-else>
          <view v-if="productList.length === 0" class="empty-state">
            <text class="empty-text">暂未上架年卡</text>
          </view>

          <view
            class="product-card"
            v-for="item in productList"
            :key="item.id"
            @tap="goDetail(item.id)"
          >
            <image class="product-cover" :src="item.coverUrl" mode="aspectFill" />
            <view class="product-info">
              <view class="product-tags">
                <text class="tag" v-for="tag in item.tags" :key="tag">{{ tag }}</text>
              </view>
              <text class="product-title">{{ item.title }}</text>
              <text class="product-subtitle">{{ item.subtitle }}</text>
              <view class="product-footer">
                <view class="price-block">
                  <text class="price-symbol">¥</text>
                  <text class="price-value">{{ formatPrice(item.price) }}</text>
                  <text v-if="item.originPrice > item.price" class="price-origin">¥{{ formatPrice(item.originPrice) }}</text>
                </view>
                <view class="buy-btn">
                  <text>办理</text>
                </view>
              </view>
            </view>
          </view>

          <view v-if="hasMore && productList.length > 0" class="load-more">
            <text class="load-more-text">{{ loadingMore ? '加载中...' : '上拉加载更多' }}</text>
          </view>
          <view v-else-if="!hasMore && productList.length > 0" class="load-end">
            <text class="load-end-text">— 已显示全部 —</text>
          </view>
        </template>
      </scroll-view>
    </view>
  </TabBar>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { fetchProducts } from '../../api/mall'
import TabBar from '../../components/TabBar.vue'

const keyword = ref('')
const sortType = ref('default')
const sortDesc = ref(false)
const page = ref(1)
const pageSize = 20
const total = ref(0)
const productList = ref([])
const loading = ref(true)
const loadingMore = ref(false)

const hasMore = computed(() => productList.value.length < total.value)

function formatPrice(priceInFen) {
  if (priceInFen === 0) return '0'
  const yuan = priceInFen / 100
  if (yuan % 1 === 0) return String(yuan)
  return yuan.toFixed(yuan < 10 ? 1 : 0)
}

function changeSort(type) {
  if (sortType.value === type) {
    if (type === 'price') {
      sortDesc.value = !sortDesc.value
    }
  } else {
    sortType.value = type
    sortDesc.value = false
  }
  page.value = 1
  productList.value = []
  loadData()
}

function onSearch() {
  page.value = 1
  productList.value = []
  loadData()
}

async function loadData() {
  loading.value = true
  try {
    const result = await fetchProducts({
      type: 'annualCard',
      keyword: keyword.value || undefined,
      page: page.value,
      pageSize,
    })
    total.value = result.total
    productList.value = result.list

    if (sortType.value === 'price') {
      productList.value.sort((a, b) =>
        sortDesc.value ? b.price - a.price : a.price - b.price,
      )
    }
  } catch {
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  if (!hasMore.value || loadingMore.value) return

  loadingMore.value = true
  try {
    const nextPage = page.value + 1
    const result = await fetchProducts({
      type: 'annualCard',
      keyword: keyword.value || undefined,
      page: nextPage,
      pageSize,
    })
    total.value = result.total
    page.value = nextPage

    let newList = result.list
    if (sortType.value === 'price') {
      productList.value = [...productList.value, ...newList].sort((a, b) =>
        sortDesc.value ? b.price - a.price : a.price - b.price,
      )
    } else {
      productList.value = [...productList.value, ...newList]
    }
  } catch {
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loadingMore.value = false
  }
}

function goBack() {
  uni.navigateBack()
}

function goDetail(id) {
  uni.navigateTo({ url: `/pages/mall/productDetail?id=${id}` })
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 0 24rpx 126rpx;
  box-sizing: border-box;
  background:
    radial-gradient(circle at 12% 0%, rgba(225, 197, 145, 0.34), rgba(225, 197, 145, 0) 34%),
    linear-gradient(180deg, #f6efe2 0%, #f4f5ef 45%, #f7f1e7 100%);
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
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

.search-row {
  margin-top: 20rpx;
}

.search-box {
  height: 76rpx;
  padding: 0 24rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.82);
  display: flex;
  align-items: center;
  box-shadow: 0 14rpx 34rpx rgba(94, 68, 35, 0.1);
}

.search-icon {
  width: 28rpx;
  height: 28rpx;
  border: 4rpx solid #9b7b52;
  border-radius: 50%;
  position: relative;
  flex-shrink: 0;
}

.search-icon::after {
  content: '';
  position: absolute;
  right: -10rpx;
  bottom: -8rpx;
  width: 16rpx;
  height: 4rpx;
  border-radius: 999rpx;
  background: #9b7b52;
  transform: rotate(45deg);
}

.search-input {
  flex: 1;
  margin-left: 16rpx;
  font-size: 26rpx;
  color: #312416;
}

.sort-row {
  margin-top: 18rpx;
  display: flex;
  align-items: center;
  gap: 36rpx;
}

.sort-item {
  display: flex;
  align-items: center;
  gap: 4rpx;
  font-size: 26rpx;
  color: #9a8265;
  padding: 6rpx 0;
}

.sort-item.active {
  color: #6f451d;
  font-weight: 700;
}

.sort-arrows {
  display: flex;
  flex-direction: column;
  line-height: 1;
  gap: -4rpx;
}

.sort-arrows .arrow {
  font-size: 16rpx;
  color: #c4b59a;
  line-height: 1;
}

.sort-arrows .arrow.on {
  color: #6f451d;
}

.product-list {
  flex: 1;
  min-height: 0;
  margin-top: 22rpx;
}

.loading-state {
  min-height: 400rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-text {
  color: #9a8265;
  font-size: 26rpx;
}

.empty-state {
  min-height: 400rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-text {
  color: #9a8265;
  font-size: 26rpx;
}

.product-card {
  margin-bottom: 18rpx;
  padding: 18rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.72);
  border-radius: 26rpx;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 16rpx 36rpx rgba(94, 68, 35, 0.08);
  display: flex;
  box-sizing: border-box;
}

.product-cover {
  width: 200rpx;
  height: 200rpx;
  border-radius: 20rpx;
  background: #eee;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
  min-width: 0;
  margin-left: 18rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.product-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.tag {
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
  background: #f1dfc1;
  color: #7b5529;
  font-size: 20rpx;
  font-weight: 700;
}

.product-title {
  margin-top: 8rpx;
  color: #312416;
  font-size: 30rpx;
  font-weight: 800;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-subtitle {
  margin-top: 6rpx;
  color: #9a8265;
  font-size: 22rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.price-block {
  display: flex;
  align-items: baseline;
}

.price-symbol {
  color: #a76524;
  font-size: 22rpx;
  font-weight: 800;
}

.price-value {
  color: #a76524;
  font-size: 36rpx;
  font-weight: 800;
}

.price-origin {
  margin-left: 10rpx;
  color: #c4b59a;
  font-size: 22rpx;
  text-decoration: line-through;
}

.buy-btn {
  padding: 10rpx 24rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #8b6138 0%, #d8ad6b 100%);
  box-shadow: 0 8rpx 20rpx rgba(139, 97, 56, 0.18);
}

.buy-btn text {
  color: #fffaf0;
  font-size: 24rpx;
  font-weight: 800;
}

.load-more,
.load-end {
  padding: 28rpx 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.load-more-text {
  color: #9a8265;
  font-size: 24rpx;
}

.load-end-text {
  color: #c4b59a;
  font-size: 22rpx;
}
</style>
