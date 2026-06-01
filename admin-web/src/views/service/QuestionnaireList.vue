<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { createQuestionnaire, fetchQuestionnaires, updateQuestionnaire } from '@/api/admin'

const list = ref<Record<string, unknown>[]>([])
const dialog = ref(false)
const jsonText = ref('')
const editingId = ref(0)

async function load() {
  list.value = (await fetchQuestionnaires()) as Record<string, unknown>[]
}

function openCreate() {
  editingId.value = 0
  jsonText.value = JSON.stringify(
    {
      title: '新问卷',
      desc: '',
      rewardHint: '',
      deadline: '2026-12-31 23:59:59',
      active: true,
      questions: [],
    },
    null,
    2,
  )
  dialog.value = true
}

function openEdit(row: Record<string, unknown>) {
  editingId.value = row.id as number
  jsonText.value = JSON.stringify(row, null, 2)
  dialog.value = true
}

async function save() {
  const body = JSON.parse(jsonText.value)
  if (editingId.value) {
    await updateQuestionnaire(editingId.value, body)
  } else {
    await createQuestionnaire(body)
  }
  ElMessage.success('已保存')
  dialog.value = false
  load()
}

onMounted(load)
</script>

<template>
  <el-card header="问卷管理">
    <el-button type="primary" style="margin-bottom: 12px" @click="openCreate">新增</el-button>
    <el-table :data="list" stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="title" label="标题" min-width="200" />
      <el-table-column prop="active" label="上线" width="80">
        <template #default="{ row }">{{ row.active ? '是' : '否' }}</template>
      </el-table-column>
      <el-table-column prop="deadline" label="截止" width="180" />
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button size="small" @click="openEdit(row)">编辑 JSON</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="dialog" title="问卷 JSON" width="720px">
      <el-input v-model="jsonText" type="textarea" :rows="18" />
      <template #footer>
        <el-button @click="dialog = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>
