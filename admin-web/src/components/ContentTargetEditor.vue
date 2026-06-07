<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  CONTENT_TARGET_OPTIONS,
  createDefaultTarget,
  normalizeContentTarget,
  validateContentTarget,
  type ContentTarget,
  type ContentTargetType,
} from '@/types/contentTarget'

const model = defineModel<ContentTarget | null>({ default: null })

const props = withDefaults(
  defineProps<{
    label?: string
    showPreview?: boolean
  }>(),
  {
    label: '跳转目标 ContentTarget',
    showPreview: true,
  },
)

const selectedType = ref<ContentTargetType>('ticket')
const fields = ref({
  id: 1,
  keyword: '',
  category: '',
  pointId: undefined as number | undefined,
  message: '',
})

const validationError = computed(() => validateContentTarget(buildRaw()))

const jsonPreview = computed(() => {
  const err = validationError.value
  if (err) return `// ${err}`
  try {
    return JSON.stringify(normalizeContentTarget(buildRaw()), null, 2)
  } catch {
    return '{}'
  }
})

function buildRaw(): ContentTarget {
  const type = selectedType.value
  switch (type) {
    case 'discoverPost':
      return { type, id: fields.value.id }
    case 'search':
      return { type, keyword: fields.value.keyword }
    case 'map':
      return {
        type,
        category: fields.value.category || undefined,
        pointId: fields.value.pointId,
        keyword: fields.value.keyword || undefined,
      }
    case 'toast':
      return { type, message: fields.value.message }
    default:
      return { type } as ContentTarget
  }
}

let syncingFromModel = false

function syncFieldsFromModel(value: ContentTarget | null) {
  syncingFromModel = true
  if (!value?.type) {
    selectedType.value = 'ticket'
    fields.value = { id: 1, keyword: '', category: '', pointId: undefined, message: '' }
    syncingFromModel = false
    return
  }
  selectedType.value = value.type
  fields.value.id = value.type === 'discoverPost' ? value.id : 1
  fields.value.keyword =
    value.type === 'search' || value.type === 'map' ? String(value.keyword ?? '') : ''
  fields.value.category = value.type === 'map' ? String(value.category ?? '') : ''
  fields.value.pointId = value.type === 'map' && value.pointId ? value.pointId : undefined
  fields.value.message = value.type === 'toast' ? String(value.message ?? '') : ''
  syncingFromModel = false
}

function emitModel() {
  if (syncingFromModel) return
  const err = validationError.value
  if (err) {
    model.value = null
    return
  }
  const next = normalizeContentTarget(buildRaw())
  const prev = model.value ? JSON.stringify(model.value) : ''
  const nextStr = JSON.stringify(next)
  if (prev !== nextStr) model.value = next
}

watch(
  () => model.value,
  (v) => syncFieldsFromModel(v ?? null),
  { immediate: true, deep: true },
)

watch(selectedType, (type, prev) => {
  if (type === prev) return
  const next = createDefaultTarget(type)
  syncFieldsFromModel(next)
  emitModel()
})

watch(fields, () => emitModel(), { deep: true })

const needsId = computed(() => selectedType.value === 'discoverPost')
const needsKeyword = computed(() => selectedType.value === 'search')
const needsMap = computed(() => selectedType.value === 'map')
const needsMessage = computed(() => selectedType.value === 'toast')
const needsNoExtra = computed(
  () =>
    !needsId.value && !needsKeyword.value && !needsMap.value && !needsMessage.value,
)
</script>

<template>
  <div class="content-target-editor">
    <el-form label-width="120px" @submit.prevent>
      <el-form-item :label="label">
        <el-select v-model="selectedType" style="width: 100%">
          <el-option
            v-for="opt in CONTENT_TARGET_OPTIONS"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item v-if="needsNoExtra" label="说明">
        <span class="hint">类型 {{ selectedType }} 无需额外字段</span>
      </el-form-item>

      <el-form-item v-if="needsId" label="发现帖 ID" required>
        <el-input-number v-model="fields.id" :min="1" :step="1" controls-position="right" />
      </el-form-item>

      <el-form-item v-if="needsKeyword" label="搜索关键词">
        <el-input v-model="fields.keyword" placeholder="可选，如：梵宫素斋" clearable />
      </el-form-item>

      <template v-if="needsMap">
        <el-form-item label="地图关键词">
          <el-input v-model="fields.keyword" placeholder="可选，如：九龙灌浴" clearable />
        </el-form-item>
        <el-form-item label="分类 category">
          <el-input v-model="fields.category" placeholder="可选，如：spot" clearable />
        </el-form-item>
        <el-form-item label="点位 pointId">
          <el-input-number
            v-model="fields.pointId"
            :min="1"
            :step="1"
            controls-position="right"
            placeholder="可选"
          />
        </el-form-item>
      </template>

      <el-form-item v-if="needsMessage" label="提示文案" required>
        <el-input
          v-model="fields.message"
          type="textarea"
          :rows="2"
          placeholder="toast.message"
        />
      </el-form-item>

      <el-alert
        v-if="validationError"
        :title="validationError"
        type="warning"
        show-icon
        :closable="false"
        class="alert"
      />

      <el-form-item v-if="showPreview" label="JSON 预览">
        <el-input :model-value="jsonPreview" type="textarea" :rows="6" readonly />
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped>
.content-target-editor {
  max-width: 560px;
}
.hint {
  font-size: 13px;
  color: #909399;
}
.alert {
  margin-bottom: 12px;
}
</style>
