<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { UploadRequestOptions } from 'element-plus'
import { uploadImage } from '@/api/upload'

const model = defineModel<string>({ default: '' })

const props = withDefaults(
  defineProps<{
    label?: string
    hint?: string
    maxSizeMb?: number
  }>(),
  {
    label: '图片',
    hint: '支持 jpg/png/webp，最大 5MB',
    maxSizeMb: 5,
  },
)

const uploading = ref(false)

const previewUrl = computed(() => model.value?.trim() || '')

function beforeUpload(file: File) {
  const isImage = /^image\//.test(file.type)
  if (!isImage) {
    ElMessage.warning('请上传图片文件')
    return false
  }
  const maxBytes = props.maxSizeMb * 1024 * 1024
  if (file.size > maxBytes) {
    ElMessage.warning(`图片不能超过 ${props.maxSizeMb}MB`)
    return false
  }
  return true
}

async function handleUpload(options: UploadRequestOptions) {
  const file = options.file as File
  if (!beforeUpload(file)) {
    options.onError?.(new Error('文件校验失败') as never)
    return
  }
  uploading.value = true
  try {
    const url = await uploadImage(file)
    model.value = url
    options.onSuccess?.(url as never)
    ElMessage.success('上传成功')
  } catch (e) {
    const msg = e instanceof Error ? e.message : '上传失败'
    ElMessage.error(msg)
    options.onError?.(new Error(msg) as never)
  } finally {
    uploading.value = false
  }
}

function clearUrl() {
  model.value = ''
}
</script>

<template>
  <div class="image-upload">
    <div v-if="label" class="label">{{ label }}</div>
    <div class="row">
      <el-upload
        :show-file-list="false"
        accept="image/*"
        :http-request="handleUpload"
        :disabled="uploading"
      >
        <el-button type="primary" :loading="uploading">{{ uploading ? '上传中' : '选择并上传' }}</el-button>
      </el-upload>
      <el-button v-if="previewUrl" link type="danger" @click="clearUrl">清除</el-button>
    </div>
    <p v-if="hint" class="hint">{{ hint }}</p>
    <el-image
      v-if="previewUrl"
      :src="previewUrl"
      fit="cover"
      class="preview"
      :preview-src-list="[previewUrl]"
    />
    <el-input v-model="model" placeholder="上传后自动填入 URL，也可手动粘贴" clearable class="url-input" />
  </div>
</template>

<style scoped>
.image-upload {
  width: 100%;
  max-width: 480px;
}
.label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}
.row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}
.hint {
  font-size: 12px;
  color: #909399;
  margin: 0 0 8px;
}
.preview {
  width: 160px;
  height: 100px;
  border-radius: 6px;
  margin-bottom: 8px;
  border: 1px solid #ebeef5;
}
.url-input {
  width: 100%;
}
</style>
