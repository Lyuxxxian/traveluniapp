<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { deleteDiscoverPost, fetchDiscoverPosts, updateDiscoverStatus } from '@/api/admin'
import { useAdminListPage } from '@/composables/useAdminListPage'

const router = useRouter()
const category = ref('')
const statusFilter = ref('')
const { list, page, pageSize, total, loading, applyPageResult, buildQuery, resetPage } =
  useAdminListPage(10)

async function load() {
  loading.value = true
  try {
    const data = await fetchDiscoverPosts(
      buildQuery({
        category: category.value || undefined,
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

async function toggleStatus(row: Record<string, unknown>) {
  const next = row.status === 'published' ? 'draft' : 'published'
  await updateDiscoverStatus(row.id as number, next)
  ElMessage.success('状态已更新')
  load()
}

async function remove(row: Record<string, unknown>) {
  await deleteDiscoverPost(row.id as number)
  ElMessage.success('已删除')
  load()
}

onMounted(load)
</script>

<template>
  <el-card header="发现内容">
    <div class="toolbar">
      <el-select
        v-model="category"
        placeholder="分类"
        clearable
        style="width: 140px"
        @change="onFilterChange"
      >
        <el-option label="全部分类" value="" />
        <el-option label="活动" value="activity" />
        <el-option label="攻略" value="guide" />
        <el-option label="演出" value="show" />
        <el-option label="美食" value="food" />
        <el-option label="文创" value="creative" />
      </el-select>
      <el-select
        v-model="statusFilter"
        placeholder="状态"
        clearable
        style="width: 140px"
        @change="onFilterChange"
      >
        <el-option label="全部状态" value="" />
        <el-option label="已发布 published" value="published" />
        <el-option label="草稿 draft" value="draft" />
      </el-select>
      <el-button type="primary" @click="router.push('/content/discover/edit')">新建</el-button>
      <el-button @click="load">刷新</el-button>
    </div>
    <el-table v-loading="loading" :data="list" stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="title" label="标题" min-width="160" />
      <el-table-column prop="category" label="分类" width="100" />
      <el-table-column prop="status" label="状态" width="100" />
      <el-table-column prop="publishTime" label="发布时间" width="120" />
      <el-table-column label="操作" width="260">
        <template #default="{ row }">
          <el-button size="small" @click="router.push(`/content/discover/edit/${row.id}`)">编辑</el-button>
          <el-button size="small" @click="toggleStatus(row)">
            {{ row.status === 'published' ? '下架' : '上架' }}
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
</style>
