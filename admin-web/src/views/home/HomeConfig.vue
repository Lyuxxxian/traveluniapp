<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchHomeConfig, updateHomeConfig } from '@/api/admin'

const jsonText = ref('')

async function load() {
  const data = await fetchHomeConfig()
  jsonText.value = JSON.stringify(data, null, 2)
}

async function save() {
  const body = JSON.parse(jsonText.value)
  await updateHomeConfig(body)
  ElMessage.success('首页配置已保存')
}

onMounted(load)
</script>

<template>
  <el-card header="首页配置（JSON，对齐 HomeConfig）">
    <p class="tip">包含 heroSlides、matrixItems、actionCards、collectionSections、feedItems</p>
    <el-input v-model="jsonText" type="textarea" :rows="24" />
    <div style="margin-top: 12px">
      <el-button @click="load">重新加载</el-button>
      <el-button type="primary" @click="save">保存</el-button>
    </div>
  </el-card>
</template>

<style scoped>
.tip {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}
</style>
