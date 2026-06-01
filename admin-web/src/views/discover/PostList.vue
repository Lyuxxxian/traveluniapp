<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { deleteDiscoverPost, fetchDiscoverPosts, updateDiscoverStatus } from '@/api/admin'

const router = useRouter()
const list = ref<Record<string, unknown>[]>([])
const category = ref('')

async function load() {
  list.value = (await fetchDiscoverPosts({
    category: category.value || undefined,
  })) as Record<string, unknown>[]
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
      <el-select v-model="category" placeholder="分类" clearable style="width: 160px" @change="load">
        <el-option label="全部" value="" />
        <el-option label="活动" value="activity" />
        <el-option label="攻略" value="guide" />
        <el-option label="演出" value="show" />
        <el-option label="美食" value="food" />
        <el-option label="文创" value="creative" />
      </el-select>
      <el-button type="primary" @click="router.push('/content/discover/edit')">新建</el-button>
    </div>
    <el-table :data="list" stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="title" label="标题" min-width="160" />
      <el-table-column prop="category" label="分类" width="100" />
      <el-table-column prop="status" label="状态" width="100" />
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
  </el-card>
</template>

<style scoped>
.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}
</style>
