<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { fetchOverview } from '@/api/admin'

const stats = ref<Record<string, number>>({})

onMounted(async () => {
  stats.value = (await fetchOverview()) as Record<string, number>
})
</script>

<template>
  <el-card header="运营概览">
    <el-descriptions :column="2" border>
      <el-descriptions-item label="反馈总数">{{ stats.feedbackTotal ?? 0 }}</el-descriptions-item>
      <el-descriptions-item label="待处理反馈">{{ stats.feedbackOpen ?? 0 }}</el-descriptions-item>
      <el-descriptions-item label="工单总数">{{ stats.ticketsTotal ?? 0 }}</el-descriptions-item>
      <el-descriptions-item label="进行中工单">{{ stats.ticketsOpen ?? 0 }}</el-descriptions-item>
      <el-descriptions-item label="点评总数">{{ stats.reviewsTotal ?? 0 }}</el-descriptions-item>
      <el-descriptions-item label="待审核点评">{{ stats.reviewsPending ?? 0 }}</el-descriptions-item>
      <el-descriptions-item label="FAQ">{{ stats.faqsTotal ?? 0 }}</el-descriptions-item>
      <el-descriptions-item label="问卷">{{ stats.questionnairesTotal ?? 0 }}</el-descriptions-item>
      <el-descriptions-item label="发现帖">{{ stats.discoverPostsTotal ?? 0 }}</el-descriptions-item>
      <el-descriptions-item label="草稿/下架">{{ stats.discoverDraft ?? 0 }}</el-descriptions-item>
    </el-descriptions>
  </el-card>
</template>
