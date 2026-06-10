<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { deleteMallProduct, fetchMallProducts, updateMallProductStatus } from '@/api/admin'
import { useAdminListPage } from '@/composables/useAdminListPage'
import type { ProductStatus, ProductType, StoreProduct } from '@/types/mall'

const typeFilter = ref<ProductType | ''>('')
const keyword = ref('')
const statusFilter = ref<ProductStatus | ''>('')
const { list, page, pageSize, total, loading, applyPageResult, buildQuery, resetPage } =
  useAdminListPage(20)

const typeLabels: Record<ProductType, string> = {
  ticket: '门票',
  hotel: '酒店',
  annualCard: '年卡',
  couponPackage: '券包',
  food: '餐饮',
  creative: '文创',
}

function formatPrice(fen: number) {
  return `¥${(fen / 100).toFixed(2)}`
}

function typeLabel(type: string) {
  return typeLabels[type as ProductType] || type
}

function statusLabel(status: string) {
  return status === 'on_sale' ? '上架' : status === 'off_sale' ? '下架' : status
}

async function load() {
  loading.value = true
  try {
    const data = await fetchMallProducts(
      buildQuery({
        type: typeFilter.value || undefined,
        keyword: keyword.value.trim() || undefined,
        status: statusFilter.value || undefined,
      }),
    )
    applyPageResult(data as never)
  } finally {
    loading.value = false
  }
}

function onFilterChange() {
  resetPage()
  load()
}

async function toggleStatus(row: StoreProduct) {
  const next: ProductStatus = row.status === 'on_sale' ? 'off_sale' : 'on_sale'
  await updateMallProductStatus(row.id, next)
  ElMessage.success(`已设为${statusLabel(next)}`)
  load()
}

async function remove(row: StoreProduct) {
  await ElMessageBox.confirm(`确定删除商品「${row.title}」？`, '删除确认', { type: 'warning' })
  await deleteMallProduct(row.id)
  ElMessage.success('已删除')
  load()
}

onMounted(load)
</script>

<template>
  <el-card header="商品管理">
    <p class="tip">
      下架商品不会在 C 端公开商城列表展示。联调 C 端请设置 <code>VITE_MALL_USE_REMOTE_API=true</code>（M2-MALL-05）。
    </p>
    <div class="toolbar">
      <el-select
        v-model="typeFilter"
        placeholder="商品类型"
        clearable
        style="width: 140px"
        @change="onFilterChange"
      >
        <el-option label="全部类型" value="" />
        <el-option v-for="(label, key) in typeLabels" :key="key" :label="label" :value="key" />
      </el-select>
      <el-input
        v-model="keyword"
        placeholder="搜索标题/副标题"
        clearable
        style="width: 200px"
        @clear="onFilterChange"
        @keyup.enter="onFilterChange"
      />
      <el-select
        v-model="statusFilter"
        placeholder="上架状态"
        clearable
        style="width: 140px"
        @change="onFilterChange"
      >
        <el-option label="全部状态" value="" />
        <el-option label="上架" value="on_sale" />
        <el-option label="下架" value="off_sale" />
      </el-select>
      <el-button @click="load">刷新</el-button>
    </div>
    <el-table v-loading="loading" :data="list" stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column label="封面" width="72">
        <template #default="{ row }">
          <el-image
            v-if="row.coverUrl"
            :src="row.coverUrl"
            fit="cover"
            class="cover"
            :preview-src-list="[row.coverUrl]"
          />
        </template>
      </el-table-column>
      <el-table-column prop="title" label="标题" min-width="160" show-overflow-tooltip />
      <el-table-column label="类型" width="90">
        <template #default="{ row }">
          {{ typeLabel(row.type) }}
        </template>
      </el-table-column>
      <el-table-column label="售价" width="100">
        <template #default="{ row }">
          {{ formatPrice(row.price) }}
        </template>
      </el-table-column>
      <el-table-column prop="stock" label="库存" width="80" />
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === 'on_sale' ? 'success' : 'info'" size="small">
            {{ statusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="toggleStatus(row)">
            {{ row.status === 'on_sale' ? '下架' : '上架' }}
          </el-button>
          <el-button size="small" type="danger" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-model:current-page="page"
      v-model:page-size="pageSize"
      class="pager"
      :total="total"
      :page-sizes="[10, 20, 50]"
      layout="total, sizes, prev, pager, next"
      @size-change="load"
      @current-change="load"
    />
  </el-card>
</template>

<style scoped>
.tip {
  font-size: 13px;
  color: #666;
  margin: 0 0 12px;
}
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}
.pager {
  margin-top: 16px;
  justify-content: flex-end;
}
.cover {
  width: 48px;
  height: 48px;
  border-radius: 4px;
}
code {
  font-size: 12px;
  background: #f0f2f5;
  padding: 2px 6px;
  border-radius: 4px;
}
</style>
