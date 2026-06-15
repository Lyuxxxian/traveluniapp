<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  createMapPoint,
  fetchMapCategories,
  fetchMapPoint,
  updateMapPoint,
} from '@/api/admin'
import ImageUpload from '@/components/ImageUpload.vue'
import type { MapCategory, MapPointInput, MapPointStatus } from '@/types/map'

const route = useRoute()
const router = useRouter()
const id = route.params.id ? Number(route.params.id) : 0
const saving = ref(false)
const categories = ref<MapCategory[]>([])

const form = reactive<MapPointInput>({
  category: 'spot',
  title: '',
  latitude: 31.421,
  longitude: 120.108,
  address: '',
  desc: '',
  openTime: '',
  status: 'open',
  tags: [],
  iconKey: '',
  images: [],
  suggestedDuration: '',
  serviceTags: [],
  relatedShowIds: [],
  relatedProductIds: [],
})

const coverImage = ref('')
const relatedShowText = ref('')
const relatedProductText = ref('')

function parseIdList(text: string) {
  return text
    .split(/[,，\s]+/)
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0)
}

function syncCoverFromForm() {
  coverImage.value = form.images?.[0] || ''
}

function syncCoverToForm() {
  const rest = (form.images || []).slice(1)
  form.images = coverImage.value ? [coverImage.value, ...rest] : rest
}

async function loadCategories() {
  categories.value = await fetchMapCategories()
}

async function load() {
  await loadCategories()
  if (!id) {
    form.category = categories.value[0]?.key || 'spot'
    form.iconKey = form.category
    return
  }
  const row = await fetchMapPoint(id)
  Object.assign(form, {
    category: row.category,
    title: row.title,
    latitude: row.latitude,
    longitude: row.longitude,
    address: row.address,
    desc: row.desc,
    openTime: row.openTime || '',
    status: row.status || 'open',
    tags: row.tags || [],
    iconKey: row.iconKey || row.category,
    images: row.images || [],
    suggestedDuration: row.suggestedDuration || '',
    serviceTags: row.serviceTags || [],
    relatedShowIds: row.relatedShowIds || [],
    relatedProductIds: row.relatedProductIds || [],
  })
  relatedShowText.value = (form.relatedShowIds || []).join(', ')
  relatedProductText.value = (form.relatedProductIds || []).join(', ')
  syncCoverFromForm()
}

async function save() {
  if (!form.title.trim()) {
    ElMessage.warning('请填写标题')
    return
  }
  if (!form.address.trim() || !form.desc.trim()) {
    ElMessage.warning('请填写地址与简介')
    return
  }

  saving.value = true
  try {
    syncCoverToForm()
    const body: MapPointInput = {
      ...form,
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      iconKey: form.category,
      relatedShowIds: parseIdList(relatedShowText.value),
      relatedProductIds: parseIdList(relatedProductText.value),
    }
    if (id) {
      await updateMapPoint(id, body)
    } else {
      await createMapPoint(body)
    }
    ElMessage.success('已保存；C 端远程地图将读取最新 title')
    router.push({ path: '/map/points', query: { category: form.category } })
  } finally {
    saving.value = false
  }
}

function onCategoryChange(key: string) {
  form.iconKey = key
}

onMounted(load)
</script>

<template>
  <el-card :header="id ? `编辑点位 #${id}` : '新建点位'">
    <el-form label-width="120px" class="form">
      <el-form-item label="分类" required>
        <el-select v-model="form.category" filterable style="width: 240px" @change="onCategoryChange">
          <el-option
            v-for="item in categories"
            :key="item.key"
            :label="`${item.label} (${item.key})`"
            :value="item.key"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="标题" required>
        <el-input v-model="form.title" placeholder="地图 marker 展示名称" maxlength="80" show-word-limit />
      </el-form-item>
      <el-form-item label="纬度 / 经度" required>
        <div class="coord">
          <el-input-number v-model="form.latitude" :step="0.0001" :precision="6" />
          <el-input-number v-model="form.longitude" :step="0.0001" :precision="6" />
        </div>
      </el-form-item>
      <el-form-item label="地址" required>
        <el-input v-model="form.address" />
      </el-form-item>
      <el-form-item label="简介" required>
        <el-input v-model="form.desc" type="textarea" :rows="3" />
      </el-form-item>
      <el-form-item label="开放时间">
        <el-input v-model="form.openTime" placeholder="如 08:00-17:00" />
      </el-form-item>
      <el-form-item label="状态">
        <el-radio-group v-model="form.status">
          <el-radio value="open">开放</el-radio>
          <el-radio value="closed">关闭</el-radio>
          <el-radio value="busy">繁忙</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="标签 tags">
        <el-select v-model="form.tags" multiple filterable allow-create default-first-option style="width: 100%">
          <el-option v-for="tag in form.tags" :key="tag" :label="tag" :value="tag" />
        </el-select>
      </el-form-item>
      <el-form-item label="图标 iconKey">
        <el-input v-model="form.iconKey" disabled placeholder="自动与分类一致" />
      </el-form-item>
      <el-form-item label="封面图">
        <ImageUpload v-model="coverImage" label="images[0]" />
      </el-form-item>
      <el-form-item label="推荐时长">
        <el-input v-model="form.suggestedDuration" placeholder="如 45分钟" />
      </el-form-item>
      <el-form-item label="服务标签">
        <el-select
          v-model="form.serviceTags"
          multiple
          filterable
          allow-create
          default-first-option
          style="width: 100%"
        >
          <el-option v-for="tag in form.serviceTags" :key="tag" :label="tag" :value="tag" />
        </el-select>
      </el-form-item>
      <el-form-item label="关联演出 ID">
        <el-input v-model="relatedShowText" placeholder="逗号分隔，如 1, 2" />
      </el-form-item>
      <el-form-item label="关联商品 ID">
        <el-input v-model="relatedProductText" placeholder="逗号分隔，如 1001, 1002" />
      </el-form-item>
    </el-form>
    <div class="actions">
      <el-button @click="router.back()">返回</el-button>
      <el-button type="primary" :loading="saving" @click="save">保存</el-button>
    </div>
  </el-card>
</template>

<style scoped>
.form {
  max-width: 720px;
}
.coord {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.actions {
  margin-top: 16px;
  padding-left: 120px;
}
</style>
