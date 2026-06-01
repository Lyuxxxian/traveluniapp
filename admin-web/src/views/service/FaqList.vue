<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { createFaq, deleteFaq, fetchFaqs, updateFaq } from '@/api/admin'

const list = ref<Record<string, unknown>[]>([])
const dialog = ref(false)
const form = ref({ id: 0, question: '', answer: '', category: 'other', type: 'normal', sort: 1 })

async function load() {
  list.value = (await fetchFaqs()) as Record<string, unknown>[]
}

function openCreate() {
  form.value = { id: 0, question: '', answer: '', category: 'other', type: 'normal', sort: 99 }
  dialog.value = true
}

function openEdit(row: Record<string, unknown>) {
  form.value = { ...(row as typeof form.value) }
  dialog.value = true
}

async function save() {
  if (form.value.id) {
    await updateFaq(form.value.id, form.value)
  } else {
    await createFaq(form.value)
  }
  ElMessage.success('已保存')
  dialog.value = false
  load()
}

async function remove(row: Record<string, unknown>) {
  await deleteFaq(row.id as number)
  ElMessage.success('已删除')
  load()
}

onMounted(load)
</script>

<template>
  <el-card header="FAQ 管理">
    <el-button type="primary" style="margin-bottom: 12px" @click="openCreate">新增</el-button>
    <el-table :data="list" stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="question" label="问题" min-width="200" />
      <el-table-column prop="category" label="分类" width="100" />
      <el-table-column prop="type" label="类型" width="90" />
      <el-table-column prop="sort" label="排序" width="70" />
      <el-table-column label="操作" width="160">
        <template #default="{ row }">
          <el-button size="small" @click="openEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="dialog" title="FAQ" width="560px">
      <el-form label-width="80px">
        <el-form-item label="问题"><el-input v-model="form.question" /></el-form-item>
        <el-form-item label="答案"><el-input v-model="form.answer" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="分类"><el-input v-model="form.category" /></el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.type">
            <el-option label="普通" value="normal" />
            <el-option label="人工" value="human" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.sort" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>
