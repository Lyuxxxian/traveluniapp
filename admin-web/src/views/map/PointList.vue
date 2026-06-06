<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  deleteMapPoint,
  fetchMapCategories,
  fetchMapPoints,
  updateMapPointStatus,
} from '@/api/admin'
import { useAdminListPage } from '@/composables/useAdminListPage'
import type { MapCategory, MapPointDetail, MapPointStatus } from '@/types/map'

const router = useRouter()
const categories = ref<MapCategory[]>([])
const category = ref('')
const keyword = ref('')
const statusFilter = ref<MapPointStatus | ''>('')
const { list, page, pageSize, total, loading, applyPageResult, buildQuery, resetPage } =
  useAdminListPage(20)

const categoryLabelMap = computed(() =>
  Object.fromEntries(categories.value.map((item) => [item.key, item.label])),
)

async function loadCategories() {
  categories.value = await fetchMapCategories()
}

async function load() {
  loading.value = true
  try {
    const data = await fetchMapPoints(
      buildQuery({
        category: category.value || undefined,
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

function categoryLabel(key: string) {
  return categoryLabelMap.value[key] || key
}

async function toggleStatus(row: MapPointDetail) {
  const next: MapPointStatus = row.status === 'open' ? 'closed' : 'open'
  await updateMapPointStatus(row.id, next)
  ElMessage.success(`状态已设为 ${next}`)
  load()
}

async function remove(row: MapPointDetail) {
  await ElMessageBox.confirm(`确定删除点位「${row.title}」？`, '删除确认', { type: 'warning' })
  await deleteMapPoint(row.id)
  ElMessage.success('已删除')
  load()
}

onMounted(async () => {
  await loadCategories()
  await load()
})
</script>

<template>
  <el-card header="地图点位">
    <p class="tip">
      修改保存后，C 端设置 <code>VITE_MAP_USE_REMOTE_API=true</code> 并刷新地图页即可看到更新（失败时仍 fallback 本地数据）。
    </p>
    <div class="toolbar">
      <el-select
        v-model="category"
        placeholder="分类"
        clearable
        filterable
        style="width: 160px"
        @change="onFilterChange"
      >
        <el-option label="全部分类" value="" />
        <el-option
          v-for="item in categories"
          :key="item.key"
          :label="`${item.label} (${item.key})`"
          :value="item.key"
        />
      </el-select>
      <el-input
        v-model="keyword"
        placeholder="搜索标题/地址"
        clearable
        style="width: 200px"
        @clear="onFilterChange"
        @keyup.enter="onFilterChange"
      />
      <el-select
        v-model="statusFilter"
        placeholder="状态"
        clearable
        style="width: 140px"
        @change="onFilterChange"
      >
        <el-option label="全部状态" value="" />
        <el-option label="开放 open" value="open" />
        <el-option label="关闭 closed" value="closed" />
        <el-option label="繁忙 busy" value="busy" />
      </el-select>
      <el-button type="primary" @click="router.push('/map/points/edit')">新建点位</el-button>
      <el-button @click="load">刷新</el-button>
    </div>
    <el-table v-loading="loading" :data="list" stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="title" label="标题" min-width="160" />
      <el-table-column label="分类" width="120">
        <template #default="{ row }">
          {{ categoryLabel(row.category) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="90" />
      <el-table-column label="坐标" width="200">
        <template #default="{ row }">
          {{ row.latitude }}, {{ row.longitude }}
        </template>
      </el-table-column>
      <el-table-column prop="address" label="地址" min-width="180" show-overflow-tooltip />
      <el-table-column label="操作" width="240" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="router.push(`/map/points/edit/${row.id}`)">编辑</el-button>
          <el-button size="small" @click="toggleStatus(row)">
            {{ row.status === 'open' ? '关闭' : '开放' }}
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
code {
  font-size: 12px;
  background: #f0f2f5;
  padding: 2px 6px;
  border-radius: 4px;
}
</style>
