<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchFeedback, updateFeedbackStatus } from '@/api/admin'

const list = ref<Record<string, unknown>[]>([])

async function load() {
  list.value = (await fetchFeedback()) as Record<string, unknown>[]
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
    <el-table :data="list" stripe>
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
  </el-card>
</template>
