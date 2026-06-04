<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { createDiscoverPost, fetchDiscoverPosts, updateDiscoverPost } from '@/api/admin'
import ImageUpload from '@/components/ImageUpload.vue'

const route = useRoute()
const router = useRouter()
const jsonText = ref('')
const coverUrl = ref('')
const detailImageUrl = ref('')
const id = route.params.id ? Number(route.params.id) : 0

function syncImagesFromJson() {
  try {
    const body = JSON.parse(jsonText.value || '{}') as Record<string, unknown>
    coverUrl.value = String(body.coverUrl ?? '')
    detailImageUrl.value = String(body.detailImageUrl ?? '')
  } catch {
    coverUrl.value = ''
    detailImageUrl.value = ''
  }
}

function mergeImagesIntoJson() {
  const body = JSON.parse(jsonText.value || '{}') as Record<string, unknown>
  body.coverUrl = coverUrl.value
  body.detailImageUrl = detailImageUrl.value
  jsonText.value = JSON.stringify(body, null, 2)
}

async function load() {
  if (!id) {
    jsonText.value = JSON.stringify(
      {
        status: 'draft',
        category: 'activity',
        title: '',
        subtitle: '',
        priceText: '',
        coverUrl: '',
        tagText: '',
        summary: '',
        location: '',
        publishTime: '刚刚',
        actionText: '查看',
        target: { type: 'discoverPost', id: 0 },
      },
      null,
      2,
    )
    syncImagesFromJson()
    return
  }
  const list = (await fetchDiscoverPosts()) as Record<string, unknown>[]
  const row = list.find((p) => p.id === id)
  if (row) {
    jsonText.value = JSON.stringify(row, null, 2)
    syncImagesFromJson()
  }
}

async function save() {
  mergeImagesIntoJson()
  const body = JSON.parse(jsonText.value)
  if (id) {
    await updateDiscoverPost(id, body)
  } else {
    await createDiscoverPost(body)
  }
  ElMessage.success('已保存')
  router.push('/content/discover')
}

onMounted(load)
</script>

<template>
  <el-card :header="id ? `编辑发现帖 #${id}` : '新建发现帖'">
    <p class="tip">字段对齐 DiscoverPostDetail；target 为 ContentTarget JSON</p>
    <div class="images">
      <ImageUpload v-model="coverUrl" label="封面图 coverUrl" />
      <ImageUpload v-model="detailImageUrl" label="详情图 detailImageUrl" />
    </div>
    <el-input v-model="jsonText" type="textarea" :rows="22" />
    <div style="margin-top: 12px">
      <el-button @click="router.back()">返回</el-button>
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
.images {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 16px;
}
@media (max-width: 900px) {
  .images {
    grid-template-columns: 1fr;
  }
}
</style>
