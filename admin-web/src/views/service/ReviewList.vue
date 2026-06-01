<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchReviews, updateReviewStatus } from '@/api/admin'

const list = ref<Record<string, unknown>[]>([])

async function load() {
  list.value = (await fetchReviews()) as Record<string, unknown>[]
}

async function setStatus(row: Record<string, unknown>, status: string) {
  await updateReviewStatus(row.id as number, status)
  ElMessage.success('已更新')
  load()
}

onMounted(load)
</script>

<template>
  <el-card header="点评审核">
    <el-table :data="list" stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="targetTitle" label="对象" min-width="120" />
      <el-table-column prop="rating" label="评分" width="70" />
      <el-table-column prop="content" label="内容" min-width="200" show-overflow-tooltip />
      <el-table-column prop="status" label="状态" width="100" />
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button size="small" type="success" @click="setStatus(row, 'published')">通过</el-button>
          <el-button size="small" type="danger" @click="setStatus(row, 'rejected')">驳回</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>
