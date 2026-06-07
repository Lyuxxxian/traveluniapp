<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchFeedback, updateFeedbackStatus } from '@/api/admin'
import { useAdminListPage } from '@/composables/useAdminListPage'

const statusFilter = ref('')
const { list, page, pageSize, total, loading, applyPageResult, buildQuery, resetPage } =
  useAdminListPage(10)

async function load() {
  loading.value = true
  try {
    const data = await fetchFeedback(
      buildQuery({ status: statusFilter.value || undefined }),
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

async function setStatus(row: Record<string, unknown>, status: string) {
  await updateFeedbackStatus(row.id as number, status)
  ElMessage.success('已更新')
  load()
}

onMounted(load)
</script>

<template>
  <el-card header="意见反馈">
    <div class="toolbar">
      <el-select
        v-model="statusFilter"
        placeholder="状态筛选"
        clearable
        style="width: 140px"
        @change="onFilterChange"
      >
        <el-option label="全部" value="" />
        <el-option label="open" value="open" />
        <el-option label="processing" value="processing" />
        <el-option label="closed" value="closed" />
      </el-select>
      <el-button @click="load">刷新</el-button>
    </div>
    <el-table v-loading="loading" :data="list" stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="type" label="类型" width="100" />
      <el-table-column prop="content" label="内容" min-width="200" show-overflow-tooltip />
      <el-table-column prop="status" label="状态" width="100" />
      <el-table-column prop="createdAt" label="时间" width="160" />
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button size="small" @click="setStatus(row, 'processing')">处理中</el-button>
          <el-button size="small" type="success" @click="setStatus(row, 'closed')">关闭</el-button>
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
  gap: 12px;
  margin-bottom: 12px;
}
.pager {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>
