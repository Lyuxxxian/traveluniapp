<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchTickets, updateTicket } from '@/api/admin'

const list = ref<Record<string, unknown>[]>([])
const dialog = ref(false)
const current = ref<Record<string, unknown>>({})
const reply = ref('')
const status = ref('processing')

async function load() {
  list.value = (await fetchTickets()) as Record<string, unknown>[]
}

function openEdit(row: Record<string, unknown>) {
  current.value = row
  reply.value = String(row.adminReply || '')
  status.value = String(row.status || 'open')
  dialog.value = true
}

async function save() {
  await updateTicket(current.value.id as number, {
    status: status.value,
    adminReply: reply.value,
  })
  ElMessage.success('已保存')
  dialog.value = false
  load()
}

onMounted(load)
</script>

<template>
  <el-card header="客服工单">
    <el-table :data="list" stripe>
      <el-table-column prop="ticketNo" label="单号" width="160" />
      <el-table-column prop="category" label="分类" width="120" />
      <el-table-column prop="content" label="内容" min-width="180" show-overflow-tooltip />
      <el-table-column prop="status" label="状态" width="100" />
      <el-table-column prop="createdAt" label="创建" width="160" />
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="openEdit(row)">处理</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="dialog" title="工单处理" width="520px">
      <el-form label-width="80px">
        <el-form-item label="状态">
          <el-select v-model="status">
            <el-option label="待处理" value="open" />
            <el-option label="处理中" value="processing" />
            <el-option label="已关闭" value="closed" />
          </el-select>
        </el-form-item>
        <el-form-item label="回复">
          <el-input v-model="reply" type="textarea" :rows="4" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>
