<template>
  <TabBar activeTab="mall" :showTabbar="true">
    <view class="page">
      <view class="nav-bar">
        <view class="nav-back" @tap="goBack">
          <view class="back-icon" />
        </view>
        <text class="nav-title">领券中心</text>
        <view class="nav-placeholder" />
      </view>

      <view class="search-row">
        <view class="search-box">
          <view class="search-icon" />
          <input
            class="search-input"
            v-model="keyword"
            placeholder="搜索优惠券"
            placeholder-style="color: #9a8265"
            confirm-type="search"
            @confirm="onSearch"
          />
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
            <text class="empty-text">暂无可领优惠券</text>
          </view>

          <view
            class="product-card"
            v-for="item in productList"
            :key="item.id"
          >
            <image class="product-cover" :src="item.coverUrl" mode="aspectFill" />
            <view class="product-info">
              <view class="product-tags">
                <text class="tag" v-for="tag in item.tags" :key="tag">{{ tag }}</text>
              </view>
              <text class="product-title">{{ item.title }}</text>
              <text class="product-subtitle">{{ item.subtitle }}</text>
              <view class="product-footer">
                <text class="stock-text">剩余 {{ item.stock }} 张</text>
                <view class="collect-btn" :class="{ disabled: collectedIds.has(item.id) }" @tap="onCollect(item)">
                  <text>{{ collectedIds.has(item.id) ? '已领取' : '立即领取' }}</text>
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
import { fetchProducts, collectCoupon } from '../../api/mall'
import { addUserCoupon } from '../../api/mine'
import TabBar from '../../components/TabBar.vue'

const keyword = ref('')
const page = ref(1)
const pageSize = 20
const total = ref(0)
const productList = ref([])
const loading = ref(true)
const loadingMore = ref(false)
const collectedIds = ref(new Set())

const hasMore = computed(() => productList.value.length < total.value)

function changeSort() {}

function onSearch() {
  page.value = 1
  productList.value = []
  loadData()
}

async function loadData() {
  loading.value = true
  try {
    const result = await fetchProducts({
      type: 'couponPackage',
      keyword: keyword.value || undefined,
      page: page.value,
      pageSize,
    })
    total.value = result.total
    productList.value = result.list
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
      type: 'couponPackage',
      keyword: keyword.value || undefined,
      page: nextPage,
      pageSize,
    })
    total.value = result.total
    page.value = nextPage
    productList.value = [...productList.value, ...result.list]
  } catch {
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loadingMore.value = false
  }
}

function goBack() {
  uni.navigateBack()
}

async function onCollect(item) {
  if (collectedIds.value.has(item.id)) {
    uni.showToast({ title: '已领取过该券', icon: 'none' })
    return
  }
  if (item.stock <= 0) {
    uni.showToast({ title: '已领完', icon: 'none' })
    return
  }

  uni.showLoading({ title: '领取中...' })
  try {
    await collectCoupon(item.id)
    await addUserCoupon(item.id)
    collectedIds.value.add(item.id)
    item.stock--
    uni.hideLoading()
    uni.showToast({ title: '领取成功', icon: 'success' })
  } catch (e) {
    uni.hideLoading()
    uni.showToast({ title: e?.message || '领取失败', icon: 'none' })
  }
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

.stock-text {
  color: #b4a38a;
  font-size: 22rpx;
}

.collect-btn {
  padding: 10rpx 24rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #8b6138 0%, #d8ad6b 100%);
  box-shadow: 0 8rpx 20rpx rgba(139, 97, 56, 0.18);
}

.collect-btn.disabled {
  background: #e0d6c4;
  box-shadow: none;
}

.collect-btn text {
  color: #fffaf0;
  font-size: 24rpx;
  font-weight: 800;
}

.collect-btn.disabled text {
  color: #b4a38a;
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
