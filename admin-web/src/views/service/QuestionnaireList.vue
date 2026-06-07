<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  createQuestionnaire,
  fetchQuestionnaireSubmissions,
  fetchQuestionnaires,
  updateQuestionnaire,
} from '@/api/admin'
import {
  cloneQuestionnaire,
  emptyQuestionnaire,
  newOptionId,
  newQuestion,
  sanitizeQuestionnaire,
  type Questionnaire,
  type QuestionnaireQuestion,
  type QuestionType,
} from '@/types/questionnaire'

const list = ref<Record<string, unknown>[]>([])
const dialog = ref(false)
const editingId = ref(0)
const form = ref<Questionnaire>(emptyQuestionnaire())
const saving = ref(false)
const advancedOpen = ref<string[]>([])
const jsonText = ref('')
const submissionsDialog = ref(false)
const submissionsLoading = ref(false)
const submissionsTitle = ref('')
const submissions = ref<Record<string, unknown>[]>([])

const questionTypes: { value: QuestionType; label: string }[] = [
  { value: 'score', label: '评分 score' },
  { value: 'single', label: '单选 single' },
  { value: 'multi', label: '多选 multi' },
  { value: 'text', label: '文本 text' },
]

async function load() {
  list.value = (await fetchQuestionnaires()) as Record<string, unknown>[]
}

function openCreate() {
  editingId.value = 0
  form.value = emptyQuestionnaire()
  jsonText.value = JSON.stringify(form.value, null, 2)
  dialog.value = true
}

function openEdit(row: Record<string, unknown>) {
  editingId.value = row.id as number
  form.value = cloneQuestionnaire(row)
  jsonText.value = JSON.stringify(form.value, null, 2)
  dialog.value = true
}

function addQuestion(type: QuestionType = 'score') {
  form.value.questions.push(newQuestion(form.value.questions, type))
}

function removeQuestion(index: number) {
  form.value.questions.splice(index, 1)
}

function onQuestionTypeChange(row: QuestionnaireQuestion) {
  if (row.type === 'single' || row.type === 'multi') {
    if (!row.options?.length) {
      row.options = [
        { id: 'a', label: '选项 A' },
        { id: 'b', label: '选项 B' },
      ]
    }
  } else {
    delete row.options
  }
}

function addOption(row: QuestionnaireQuestion) {
  if (!row.options) row.options = []
  row.options.push({ id: newOptionId(row.options), label: '' })
}

function removeOption(row: QuestionnaireQuestion, index: number) {
  row.options?.splice(index, 1)
}

function applyJsonToForm() {
  try {
    form.value = cloneQuestionnaire(JSON.parse(jsonText.value))
    ElMessage.success('已从 JSON 载入')
  } catch {
    ElMessage.error('JSON 格式错误')
  }
}

function syncJsonFromForm() {
  jsonText.value = JSON.stringify(sanitizeQuestionnaire(form.value), null, 2)
}

async function save() {
  const body = sanitizeQuestionnaire(form.value)
  if (!body.questions.length) {
    ElMessage.warning('请至少添加一道题目')
    return
  }
  saving.value = true
  try {
    if (editingId.value) {
      await updateQuestionnaire(editingId.value, body as Record<string, unknown>)
    } else {
      await createQuestionnaire(body as Record<string, unknown>)
    }
    ElMessage.success('已保存')
    dialog.value = false
    load()
  } finally {
    saving.value = false
  }
}

async function toggleActive(row: Record<string, unknown>, active: boolean) {
  await updateQuestionnaire(row.id as number, { active })
  row.active = active
  ElMessage.success('上下线状态已更新')
}

async function openSubmissions(row: Record<string, unknown>) {
  submissionsDialog.value = true
  submissionsLoading.value = true
  submissions.value = []
  submissionsTitle.value = String(row.title || '')
  try {
    const data = await fetchQuestionnaireSubmissions(row.id as number)
    submissionsTitle.value = data.title || submissionsTitle.value
    submissions.value = data.list as Record<string, unknown>[]
  } catch {
    ElMessage.error('加载答卷失败')
  } finally {
    submissionsLoading.value = false
  }
}

function userLabel(row: Record<string, unknown>) {
  const nick = row.nickname as string | undefined
  const user = row.username as string | undefined
  if (nick && user) return `${nick}（${user}）`
  return nick || user || `用户#${row.userId}`
}

onMounted(load)
</script>

<template>
  <el-card header="问卷管理">
    <el-button type="primary" style="margin-bottom: 12px" @click="openCreate">新增问卷</el-button>
    <el-table :data="list" stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="title" label="标题" min-width="200" />
      <el-table-column label="题目数" width="80">
        <template #default="{ row }">
          {{ Array.isArray(row.questions) ? row.questions.length : 0 }}
        </template>
      </el-table-column>
      <el-table-column label="答卷数" width="80">
        <template #default="{ row }">
          {{ row.submissionCount ?? 0 }}
        </template>
      </el-table-column>
      <el-table-column label="上线" width="100">
        <template #default="{ row }">
          <el-switch :model-value="!!row.active" @change="(v: boolean) => toggleActive(row, v)" />
        </template>
      </el-table-column>
      <el-table-column prop="deadline" label="截止" width="180" />
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button size="small" @click="openSubmissions(row)">答卷</el-button>
          <el-button size="small" type="primary" @click="openEdit(row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="submissionsDialog"
      :title="`答卷列表 · ${submissionsTitle}`"
      width="880px"
      destroy-on-close
    >
      <el-table v-loading="submissionsLoading" :data="submissions" stripe max-height="480">
        <el-table-column prop="submissionId" label="提交ID" width="90" />
        <el-table-column label="用户" min-width="140">
          <template #default="{ row }">
            {{ userLabel(row) }}
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机" width="120" />
        <el-table-column prop="createdAt" label="提交时间" width="170" />
        <el-table-column label="答案" min-width="320">
          <template #default="{ row }">
            <div v-if="Array.isArray(row.answers) && row.answers.length" class="answer-list">
              <div v-for="(a, i) in row.answers" :key="i" class="answer-line">
                <span class="answer-q">{{ a.questionTitle }}：</span>
                <span>{{ a.displayValue }}</span>
              </div>
            </div>
            <span v-else class="muted">无答案</span>
          </template>
        </el-table-column>
      </el-table>
      <template v-if="!submissionsLoading && !submissions.length" #footer>
        <span class="muted">暂无用户提交</span>
      </template>
    </el-dialog>

    <el-dialog
      v-model="dialog"
      :title="editingId ? `编辑问卷 #${editingId}` : '新建问卷'"
      width="920px"
      destroy-on-close
    >
      <el-form label-width="100px">
        <el-form-item label="标题" required>
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="说明 desc">
          <el-input v-model="form.desc" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="奖励提示">
          <el-input v-model="form.rewardHint" />
        </el-form-item>
        <el-form-item label="截止时间">
          <el-input v-model="form.deadline" placeholder="2026-12-31 23:59:59" />
        </el-form-item>
        <el-form-item label="上线 active">
          <el-switch v-model="form.active" />
        </el-form-item>
      </el-form>

      <div class="q-toolbar">
        <span class="q-title">题目列表（{{ form.questions.length }}）</span>
        <el-dropdown @command="(t: QuestionType) => addQuestion(t)">
          <el-button type="primary" link>+ 添加题目</el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="t in questionTypes" :key="t.value" :command="t.value">
                {{ t.label }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <el-table :data="form.questions" border size="small" class="q-table">
        <el-table-column prop="id" label="ID" width="70">
          <template #default="{ row }">
            <el-input-number v-model="row.id" :min="1" size="small" controls-position="right" />
          </template>
        </el-table-column>
        <el-table-column label="类型" width="130">
          <template #default="{ row }">
            <el-select v-model="row.type" size="small" @change="onQuestionTypeChange(row)">
              <el-option v-for="t in questionTypes" :key="t.value" :label="t.label" :value="t.value" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="题干" min-width="200">
          <template #default="{ row }">
            <el-input v-model="row.title" size="small" placeholder="题目文案" />
          </template>
        </el-table-column>
        <el-table-column label="必填" width="70">
          <template #default="{ row }">
            <el-switch v-model="row.required" size="small" />
          </template>
        </el-table-column>
        <el-table-column label="选项（单选/多选）" min-width="280">
          <template #default="{ row }">
            <template v-if="row.type === 'single' || row.type === 'multi'">
              <div v-for="(opt, oi) in row.options" :key="opt.id" class="opt-row">
                <el-input v-model="opt.id" size="small" style="width: 56px" placeholder="id" />
                <el-input v-model="opt.label" size="small" placeholder="选项文案" />
                <el-button link type="danger" size="small" @click="removeOption(row, oi)">删</el-button>
              </div>
              <el-button link type="primary" size="small" @click="addOption(row)">+ 选项</el-button>
            </template>
            <span v-else class="muted">—</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="70" fixed="right">
          <template #default="{ $index }">
            <el-button link type="danger" size="small" @click="removeQuestion($index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-collapse v-model="advancedOpen" class="advanced">
        <el-collapse-item title="高级：JSON（可选）" name="json">
          <el-button link type="primary" @click="syncJsonFromForm">用表单刷新 JSON</el-button>
          <el-button link type="primary" @click="applyJsonToForm">从 JSON 载入表单</el-button>
          <el-input v-model="jsonText" type="textarea" :rows="10" class="json-area" />
        </el-collapse-item>
      </el-collapse>

      <template #footer>
        <el-button @click="dialog = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<style scoped>
.q-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 16px 0 8px;
}
.q-title {
  font-weight: 600;
  font-size: 14px;
}
.q-table {
  width: 100%;
}
.opt-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 6px;
}
.muted {
  color: #909399;
  font-size: 12px;
}
.advanced {
  margin-top: 16px;
}
.json-area {
  margin-top: 8px;
}
.answer-list {
  font-size: 13px;
  line-height: 1.5;
}
.answer-line {
  margin-bottom: 4px;
}
.answer-q {
  color: #606266;
}
</style>
