<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { fetchOverview } from '@/api/admin'
import { askAI } from '@/api/ai'
import Live2DViewer from '@/components/Live2DViewer.vue'

const stats = ref<Record<string, number>>({})
const inputText = ref('')
const isAnalyzing = ref(false)
const chatBox = ref<HTMLDivElement | null>(null)

interface Message {
  role: 'user' | 'ai'
  content: string
}

const messages = ref<Message[]>([
  {
    role: 'ai',
    content: '你好，我是运营数据分析助手。你可以直接提问，或点击「数据洞察」让我自动分析当前运营数据。',
  },
])

const live2dStatus = computed(() => {
  if (isAnalyzing.value) return 'speaking'
  return 'idle'
})

onMounted(async () => {
  stats.value = (await fetchOverview()) as Record<string, number>
})

function scrollToBottom() {
  nextTick(() => {
    if (chatBox.value) {
      chatBox.value.scrollTop = chatBox.value.scrollHeight
    }
  })
}

async function sendMessage() {
  const question = inputText.value.trim()
  if (!question) return

  messages.value.push({ role: 'user', content: question })
  inputText.value = ''
  scrollToBottom()

  isAnalyzing.value = true
  scrollToBottom()
  const answer = await askAI(question)
  messages.value.push({ role: 'ai', content: answer })
  isAnalyzing.value = false
  scrollToBottom()
}

async function analyzeStats() {
  if (Object.keys(stats.value).length === 0) return

  isAnalyzing.value = true

  const statsText = [
    `反馈总数：${stats.value.feedbackTotal ?? 0}，待处理：${stats.value.feedbackOpen ?? 0}`,
    `工单总数：${stats.value.ticketsTotal ?? 0}，进行中：${stats.value.ticketsOpen ?? 0}`,
    `点评总数：${stats.value.reviewsTotal ?? 0}，待审核：${stats.value.reviewsPending ?? 0}`,
    `FAQ 数量：${stats.value.faqsTotal ?? 0}`,
    `问卷数量：${stats.value.questionnairesTotal ?? 0}`,
    `发现帖总数：${stats.value.discoverPostsTotal ?? 0}，草稿/下架：${stats.value.discoverDraft ?? 0}`,
  ].join('；')

  const prompt = `以下是灵山胜境景区的当前运营数据：\n${statsText}\n\n请简要分析这些数据，指出需要关注的问题，并给出 2-3 条运营建议。`

  messages.value.push({ role: 'user', content: '请分析当前运营数据' })
  scrollToBottom()

  const answer = await askAI(prompt)
  messages.value.push({ role: 'ai', content: answer })
  isAnalyzing.value = false
  scrollToBottom()
}
</script>

<template>
  <div class="overview-page">
    <el-card header="运营概览">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="反馈总数">{{ stats.feedbackTotal ?? 0 }}</el-descriptions-item>
        <el-descriptions-item label="待处理反馈">{{ stats.feedbackOpen ?? 0 }}</el-descriptions-item>
        <el-descriptions-item label="工单总数">{{ stats.ticketsTotal ?? 0 }}</el-descriptions-item>
        <el-descriptions-item label="进行中工单">{{ stats.ticketsOpen ?? 0 }}</el-descriptions-item>
        <el-descriptions-item label="点评总数">{{ stats.reviewsTotal ?? 0 }}</el-descriptions-item>
        <el-descriptions-item label="待审核点评">{{ stats.reviewsPending ?? 0 }}</el-descriptions-item>
        <el-descriptions-item label="FAQ">{{ stats.faqsTotal ?? 0 }}</el-descriptions-item>
        <el-descriptions-item label="问卷">{{ stats.questionnairesTotal ?? 0 }}</el-descriptions-item>
        <el-descriptions-item label="发现帖">{{ stats.discoverPostsTotal ?? 0 }}</el-descriptions-item>
        <el-descriptions-item label="草稿/下架">{{ stats.discoverDraft ?? 0 }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card header="AI 运营助手" class="ai-card">
      <div class="ai-layout">
        <div class="ai-live2d">
          <Live2DViewer
            :width="280"
            :height="380"
            :status="live2dStatus"
          />
        </div>

        <div class="ai-chat-area">
          <div ref="chatBox" class="chat-box">
            <div
              v-for="(msg, index) in messages"
              :key="index"
              class="message-row"
              :class="msg.role === 'user' ? 'message-user' : 'message-ai'"
            >
              <div class="message-bubble">
                <div v-if="msg.role === 'ai'" class="message-label">AI 助手</div>
                <div class="message-text" style="white-space: pre-wrap;">{{ msg.content }}</div>
              </div>
            </div>
            <div v-if="isAnalyzing" class="message-row message-ai">
              <div class="message-bubble">
                <div class="message-label">AI 助手</div>
                <div class="message-text typing">正在分析中...</div>
              </div>
            </div>
          </div>

          <div class="input-bar">
            <el-input
              v-model="inputText"
              placeholder="输入问题..."
              :disabled="isAnalyzing"
              @keyup.enter="sendMessage"
            />
            <el-button type="primary" :disabled="isAnalyzing" @click="sendMessage">
              发送
            </el-button>
            <el-button type="success" :disabled="isAnalyzing" @click="analyzeStats">
              数据洞察
            </el-button>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.overview-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.ai-card {
  margin-top: 4px;
}

.ai-layout {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.ai-live2d {
  flex-shrink: 0;
}

.ai-chat-area {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.chat-box {
  height: 280px;
  overflow-y: auto;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-row {
  display: flex;
}

.message-user {
  justify-content: flex-end;
}

.message-ai {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 10px;
  line-height: 1.6;
  font-size: 14px;
}

.message-user .message-bubble {
  background: #409eff;
  color: #fff;
  border-bottom-right-radius: 2px;
}

.message-ai .message-bubble {
  background: #fff;
  color: #333;
  border: 1px solid #e4e7ed;
  border-bottom-left-radius: 2px;
}

.message-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.message-user .message-label {
  color: rgba(255, 255, 255, 0.7);
}

.typing {
  color: #909399;
}

.input-bar {
  display: flex;
  gap: 8px;
  align-items: center;
}

.input-bar .el-input {
  flex: 1;
}
</style>
