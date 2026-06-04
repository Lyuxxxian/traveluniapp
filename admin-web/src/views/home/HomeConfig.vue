<script setup lang="ts">
import { computed, onActivated, onMounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchHomeConfig, updateHomeConfig } from '@/api/admin'
import ContentTargetEditor from '@/components/ContentTargetEditor.vue'
import ImageUpload from '@/components/ImageUpload.vue'
import type { ContentTarget } from '@/types/contentTarget'
import {
  emptyHomeConfig,
  newCollectionItem,
  newCollectionSection,
  newFeedItem,
  newHeroSlide,
  newMatrixItem,
  sanitizeHomeConfig,
  type HomeConfig,
  type HomeCollectionSection,
} from '@/types/homeConfig'

const activeTab = ref('hero')
const config = ref<HomeConfig>(emptyHomeConfig())
const jsonText = ref('')
const advancedOpen = ref<string[]>([])
const saving = ref(false)
const loading = ref(false)
const loadError = ref('')

const summaryText = computed(() => {
  const c = config.value
  return `轮播 ${c.heroSlides.length} · 矩阵 ${c.matrixItems.length} · 快捷卡片 ${c.actionCards.length} · 集合栏 ${c.collectionSections.length} · feed ${c.feedItems.length}`
})

function normalizeLoaded(data: HomeConfig | Record<string, unknown> | null | undefined): HomeConfig {
  if (!data || typeof data !== 'object') return emptyHomeConfig()
  const d = data as HomeConfig
  return {
    heroSlides: Array.isArray(d.heroSlides) ? [...d.heroSlides] : [],
    matrixItems: Array.isArray(d.matrixItems) ? [...d.matrixItems] : [],
    actionCards: Array.isArray(d.actionCards) ? [...d.actionCards] : [],
    collectionSections: Array.isArray(d.collectionSections)
      ? d.collectionSections.map((s) => ({
          ...s,
          items: Array.isArray(s.items) ? [...s.items] : [],
        }))
      : [],
    feedItems: Array.isArray(d.feedItems) ? [...d.feedItems] : [],
  }
}

function syncJsonPreview() {
  jsonText.value = JSON.stringify(config.value, null, 2)
}

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    const data = await fetchHomeConfig()
    config.value = normalizeLoaded(data)
    syncJsonPreview()
    if (!config.value.heroSlides.length && !config.value.matrixItems.length) {
      ElMessage.warning('配置为空：若应有数据请确认后端已启动，勿在未加载成功时点击保存')
    }
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : '加载失败'
    ElMessage.error(`首页配置加载失败：${loadError.value}（请确认 server 在 3000 运行且已登录）`)
  } finally {
    loading.value = false
  }
}

async function save() {
  saving.value = true
  try {
    const body = sanitizeHomeConfig(config.value)
    await updateHomeConfig(body as Record<string, unknown>)
    config.value = body
    syncJsonPreview()
    ElMessage.success('首页配置已保存')
  } finally {
    saving.value = false
  }
}

function applyJsonToForm() {
  try {
    const parsed = JSON.parse(jsonText.value) as HomeConfig
    config.value = normalizeLoaded(parsed)
    ElMessage.success('已从 JSON 载入表单')
  } catch {
    ElMessage.error('JSON 格式错误')
  }
}

function saveFromJsonOnly() {
  try {
    const body = JSON.parse(jsonText.value)
    saving.value = true
    updateHomeConfig(body)
      .then(() => {
        ElMessage.success('已从 JSON 保存')
        return load()
      })
      .catch(() => ElMessage.error('保存失败'))
      .finally(() => {
        saving.value = false
      })
  } catch {
    ElMessage.error('JSON 格式错误')
  }
}

watch(config, () => syncJsonPreview(), { deep: true })

onMounted(load)
onActivated(load)

function removeAt<T>(arr: T[], index: number) {
  arr.splice(index, 1)
}

function addSectionItem(section: HomeCollectionSection) {
  section.items.push(newCollectionItem(config.value))
}
</script>

<template>
  <el-card v-loading="loading" header="首页配置">
    <div class="toolbar">
      <el-button @click="load">重新加载</el-button>
      <el-button type="primary" :loading="saving" :disabled="!!loadError" @click="save">
        保存到服务器
      </el-button>
      <span class="summary">{{ summaryText }}</span>
    </div>
    <el-alert
      v-if="loadError"
      type="error"
      :title="loadError"
      description="后端地址默认 http://localhost:3000 。请先 cd server; npm run dev，并重新登录管理端。"
      show-icon
      :closable="false"
      class="alert-top"
    />

    <el-tabs v-model="activeTab" class="tabs">
      <el-tab-pane label="轮播 heroSlides" name="hero">
        <el-button type="primary" link @click="config.heroSlides.push(newHeroSlide(config))">
          + 添加轮播
        </el-button>
        <el-empty
          v-if="!loading && !config.heroSlides.length"
          description="暂无轮播数据。请点击「重新加载」；若仍为空，可能曾保存过空配置，可在下方「高级 JSON」查看或粘贴恢复。"
        />
        <el-card
          v-for="(slide, idx) in config.heroSlides"
          :key="`hero-${slide.id}-${idx}`"
          class="item-card"
          shadow="never"
        >
          <template #header>
            <span>轮播 #{{ slide.id }}</span>
            <el-button type="danger" link @click="removeAt(config.heroSlides, idx)">删除</el-button>
          </template>
          <el-form label-width="100px">
            <el-form-item label="ID">
              <el-input-number v-model="slide.id" :min="1" />
            </el-form-item>
            <el-form-item label="标题">
              <el-input v-model="slide.title" />
            </el-form-item>
            <el-form-item label="副标题">
              <el-input v-model="slide.subtitle" />
            </el-form-item>
            <el-form-item label="Kicker">
              <el-input v-model="slide.kicker" />
            </el-form-item>
            <el-form-item label="轮播图">
              <ImageUpload v-model="slide.imageUrl" label="上传轮播图" />
            </el-form-item>
            <el-form-item label="主题色">
              <el-input v-model="slide.themeColor" placeholder="#f8f1e3" />
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="功能矩阵 matrixItems" name="matrix">
        <el-button type="primary" link @click="config.matrixItems.push(newMatrixItem('matrix'))">
          + 添加矩阵项
        </el-button>
        <el-card
          v-for="(item, idx) in config.matrixItems"
          :key="item.key + idx"
          class="item-card"
          shadow="never"
        >
          <template #header>
            <span>{{ item.title || item.key }}</span>
            <el-button type="danger" link @click="removeAt(config.matrixItems, idx)">删除</el-button>
          </template>
          <el-form label-width="100px">
            <el-form-item label="key">
              <el-input v-model="item.key" />
            </el-form-item>
            <el-form-item label="标题">
              <el-input v-model="item.title" />
            </el-form-item>
            <el-form-item label="描述">
              <el-input v-model="item.desc" />
            </el-form-item>
            <el-form-item label="icon">
              <el-input v-model="item.icon" placeholder="ticket / service" />
            </el-form-item>
          </el-form>
          <ContentTargetEditor v-model="item.target as ContentTarget | null" :show-preview="false" />
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="快捷卡片 actionCards" name="action">
        <el-button type="primary" link @click="config.actionCards.push(newMatrixItem('action'))">
          + 添加快捷卡片
        </el-button>
        <el-card
          v-for="(item, idx) in config.actionCards"
          :key="item.key + idx"
          class="item-card"
          shadow="never"
        >
          <template #header>
            <span>{{ item.title || item.key }}</span>
            <el-button type="danger" link @click="removeAt(config.actionCards, idx)">删除</el-button>
          </template>
          <el-form label-width="100px">
            <el-form-item label="key">
              <el-input v-model="item.key" />
            </el-form-item>
            <el-form-item label="标题">
              <el-input v-model="item.title" />
            </el-form-item>
            <el-form-item label="描述">
              <el-input v-model="item.desc" />
            </el-form-item>
            <el-form-item label="icon">
              <el-input v-model="item.icon" />
            </el-form-item>
          </el-form>
          <ContentTargetEditor v-model="item.target as ContentTarget | null" :show-preview="false" />
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="集合栏 collectionSections" name="collection">
        <el-button type="primary" link @click="config.collectionSections.push(newCollectionSection())">
          + 添加集合栏
        </el-button>
        <el-card
          v-for="(section, sIdx) in config.collectionSections"
          :key="section.key"
          class="item-card section-card"
          shadow="never"
        >
          <template #header>
            <span>{{ section.title }}（{{ section.key }}）</span>
            <el-button type="danger" link @click="removeAt(config.collectionSections, sIdx)">
              删除栏
            </el-button>
          </template>
          <el-form label-width="100px" inline>
            <el-form-item label="key">
              <el-input v-model="section.key" style="width: 160px" />
            </el-form-item>
            <el-form-item label="标题">
              <el-input v-model="section.title" style="width: 200px" />
            </el-form-item>
            <el-form-item label="副标题">
              <el-input v-model="section.subtitle" style="width: 240px" />
            </el-form-item>
          </el-form>
          <el-button type="primary" link @click="addSectionItem(section)">+ 添加子项</el-button>
          <el-card
            v-for="(item, iIdx) in section.items"
            :key="item.id"
            class="nested-card"
            shadow="never"
          >
            <template #header>
              <span>子项 #{{ item.id }}</span>
              <el-button type="danger" link @click="removeAt(section.items, iIdx)">删除</el-button>
            </template>
            <el-form label-width="110px">
              <el-form-item label="ID">
                <el-input-number v-model="item.id" :min="1" />
              </el-form-item>
              <el-form-item label="标题">
                <el-input v-model="item.title" />
              </el-form-item>
              <el-form-item label="描述">
                <el-input v-model="item.desc" />
              </el-form-item>
              <el-form-item label="标签 tag">
                <el-input v-model="item.tag" />
              </el-form-item>
              <el-form-item label="背景 background">
                <el-input v-model="item.background" />
              </el-form-item>
              <el-form-item label="下一场文案">
                <el-input v-model="item.nextShowText" placeholder="可选" />
              </el-form-item>
              <el-form-item label="封面">
                <ImageUpload
                  :model-value="item.coverUrl || ''"
                  label="上传封面（可选）"
                  @update:model-value="item.coverUrl = $event || undefined"
                />
              </el-form-item>
            </el-form>
            <ContentTargetEditor v-model="item.target as ContentTarget | null" :show-preview="false" />
          </el-card>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="猜你喜欢 feedItems" name="feed">
        <el-button type="primary" link @click="config.feedItems.push(newFeedItem(config))">
          + 添加 feed
        </el-button>
        <el-card
          v-for="(item, idx) in config.feedItems"
          :key="item.id"
          class="item-card"
          shadow="never"
        >
          <template #header>
            <span>{{ item.title || `feed #${item.id}` }}</span>
            <el-button type="danger" link @click="removeAt(config.feedItems, idx)">删除</el-button>
          </template>
          <el-form label-width="100px">
            <el-form-item label="ID">
              <el-input-number v-model="item.id" :min="1" />
            </el-form-item>
            <el-form-item label="类型 type">
              <el-input v-model="item.type" />
            </el-form-item>
            <el-form-item label="标题">
              <el-input v-model="item.title" />
            </el-form-item>
            <el-form-item label="描述">
              <el-input v-model="item.desc" />
            </el-form-item>
            <el-form-item label="来源 source">
              <el-input v-model="item.source" />
            </el-form-item>
            <el-form-item label="按钮文案">
              <el-input v-model="item.actionText" />
            </el-form-item>
            <el-form-item label="背景">
              <el-input v-model="item.background" />
            </el-form-item>
            <el-form-item label="封面">
              <ImageUpload
                :model-value="item.coverUrl || ''"
                label="上传封面（可选）"
                @update:model-value="item.coverUrl = $event || undefined"
              />
            </el-form-item>
          </el-form>
          <ContentTargetEditor v-model="item.target as ContentTarget | null" :show-preview="false" />
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <el-collapse v-model="advancedOpen" class="advanced">
      <el-collapse-item title="高级：JSON 编辑（可选）" name="json">
        <p class="tip">表单保存为主；此处可批量粘贴或微调后「载入表单」或「仅 JSON 保存」。</p>
        <el-input v-model="jsonText" type="textarea" :rows="16" />
        <div class="toolbar inner">
          <el-button @click="syncJsonPreview">用当前表单刷新 JSON</el-button>
          <el-button @click="applyJsonToForm">从 JSON 载入表单</el-button>
          <el-button type="warning" :loading="saving" @click="saveFromJsonOnly">仅 JSON 保存</el-button>
        </div>
      </el-collapse-item>
    </el-collapse>
  </el-card>
</template>

<style scoped>
.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.summary {
  font-size: 13px;
  color: #606266;
}
.alert-top {
  margin-bottom: 16px;
}
.toolbar.inner {
  margin-top: 12px;
}
.tabs {
  margin-top: 8px;
}
.item-card {
  margin-top: 12px;
}
.item-card :deep(.el-card__header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.section-card {
  border: 1px solid #e4e7ed;
}
.nested-card {
  margin-top: 12px;
  background: #fafafa;
}
.advanced {
  margin-top: 24px;
}
.tip {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}
</style>
