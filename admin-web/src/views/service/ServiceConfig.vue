<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchServiceConfig, updateServiceConfig } from '@/api/admin'

const form = ref({
  servicePhone: '',
  serviceHours: '',
  servicePhoneRemark: '',
})

async function load() {
  form.value = (await fetchServiceConfig()) as typeof form.value
}

async function save() {
  await updateServiceConfig(form.value)
  ElMessage.success('已保存')
}

onMounted(load)
</script>

<template>
  <el-card header="客服配置">
    <el-form label-width="120px" style="max-width: 520px">
      <el-form-item label="客服电话">
        <el-input v-model="form.servicePhone" />
      </el-form-item>
      <el-form-item label="服务时间">
        <el-input v-model="form.serviceHours" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.servicePhoneRemark" type="textarea" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="save">保存</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>
