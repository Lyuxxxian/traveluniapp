<script setup lang="ts">
import { ref } from 'vue'
import ContentTargetEditor from '@/components/ContentTargetEditor.vue'
import type { ContentTarget } from '@/types/contentTarget'
import { validateContentTarget } from '@/types/contentTarget'

const target = ref<ContentTarget | null>({ type: 'map', keyword: '九龙灌浴' })
const parsed = ref('')

function showJson() {
  const err = validateContentTarget(target.value ?? undefined)
  if (err) {
    parsed.value = `校验失败: ${err}`
    return
  }
  parsed.value = JSON.stringify(target.value, null, 2)
}
</script>

<template>
  <el-card header="ContentTarget 组件验收（M15-01）">
    <p class="tip">编辑后点击「输出 JSON」验证 v-model 与 C 端 ContentTarget 一致。</p>
    <ContentTargetEditor v-model="target" />
    <div class="actions">
      <el-button type="primary" @click="showJson">输出 JSON</el-button>
      <el-button @click="target = { type: 'discoverPost', id: 2 }">载入示例 discoverPost</el-button>
    </div>
    <el-input v-if="parsed" v-model="parsed" type="textarea" :rows="8" readonly class="output" />
  </el-card>
</template>

<style scoped>
.tip {
  font-size: 13px;
  color: #666;
  margin-bottom: 16px;
}
.actions {
  margin-top: 16px;
  display: flex;
  gap: 12px;
}
.output {
  margin-top: 12px;
}
</style>
