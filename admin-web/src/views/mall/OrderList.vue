<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchAdminOrder, fetchAdminOrders, updateAdminOrderStatus } from '@/api/admin'
import { useAdminListPage } from '@/composables/useAdminListPage'
import type { AdminOrderDetail, AdminOrderListItem, OrderStatus } from '@/types/mall'

const statusFilter = ref<OrderStatus | ''>('')
const userIdFilter = ref('')
const keyword = ref('')
const { list, page, pageSize, total, loading, applyPageResult, buildQuery, resetPage } =
  useAdminListPage(20)

const statusDialog = ref(false)
const detailDialog = ref(false)
const current = ref<AdminOrderListItem | null>(null)
const detail = ref<AdminOrderDetail | null>(null)
const nextStatus = ref<OrderStatus>('cancelled')
const saving = ref(false)
const detailLoading = ref(false)

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: 'pendingPay', label: '待付款' },
  { value: 'pendingUse', label: '待使用' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
  { value: 'refunded', label: '已退款' },
]

function formatPrice(fen: number) {
  return `¥${(fen / 100).toFixed(2)}`
}

async function load() {
  loading.value = true
  try {
    const userId = userIdFilter.value.trim() ? Number(userIdFilter.value) : undefined
    const data = await fetchAdminOrders(
      buildQuery({
        status: statusFilter.value || undefined,
        userId: Number.isFinite(userId) ? userId : undefined,
        keyword: keyword.value.trim() || undefined,
      }),
    )
    applyPageResult(data as never)
  } finally {
    loading.value = false
  }
}

function onFilterChange() {
  resetPage()
  load()
}

function openStatus(row: AdminOrderListItem) {
  current.value = row
  nextStatus.value = row.status === 'pendingPay' ? 'cancelled' : row.status
  statusDialog.value = true
}

async function saveStatus() {
  if (!current.value) return
  saving.value = true
  try {
    await updateAdminOrderStatus(current.value.id, nextStatus.value)
    ElMessage.success('订单状态已更新')
    statusDialog.value = false
    load()
  } finally {
    saving.value = false
  }
}

async function openDetail(row: AdminOrderListItem) {
  detailDialog.value = true
  detailLoading.value = true
  detail.value = null
  try {
    detail.value = await fetchAdminOrder(row.id)
  } finally {
    detailLoading.value = false
  }
}

onMounted(load)
</script>

<template>
  <el-card header="订单管理">
    <div class="toolbar">
      <el-select
        v-model="statusFilter"
        placeholder="订单状态"
        clearable
        style="width: 140px"
        @change="onFilterChange"
      >
        <el-option label="全部状态" value="" />
        <el-option
          v-for="item in statusOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-input
        v-model="userIdFilter"
        placeholder="用户 ID"
        clearable
        style="width: 120px"
        @clear="onFilterChange"
        @keyup.enter="onFilterChange"
      />
      <el-input
        v-model="keyword"
        placeholder="订单号/标题"
        clearable
        style="width: 200px"
        @clear="onFilterChange"
        @keyup.enter="onFilterChange"
      />
      <el-button @click="onFilterChange">查询</el-button>
      <el-button @click="load">刷新</el-button>
    </div>
    <el-table v-loading="loading" :data="list" stripe>
      <el-table-column prop="orderNo" label="订单号" width="160" />
      <el-table-column prop="userId" label="用户ID" width="80" />
      <el-table-column label="手机号" width="130">
        <template #default="{ row }">
          {{ row.userPhone || '—' }}
        </template>
      </el-table-column>
      <el-table-column label="用户昵称" width="120" show-overflow-tooltip>
        <template #default="{ row }">
          {{ row.userNickname || '—' }}
        </template>
      </el-table-column>
      <el-table-column prop="title" label="商品" min-width="160" show-overflow-tooltip />
      <el-table-column label="实付" width="100">
        <template #default="{ row }">
          {{ formatPrice(row.payAmount) }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag size="small">{{ row.statusText || row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="下单时间" width="170" />
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="openDetail(row)">详情</el-button>
          <el-button size="small" type="primary" @click="openStatus(row)">改状态</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-model:current-page="page"
      v-model:page-size="pageSize"
      class="pager"
      :total="total"
      :page-sizes="[10, 20, 50]"
      layout="total, sizes, prev, pager, next"
      @size-change="load"
      @current-change="load"
    />

    <el-dialog v-model="statusDialog" title="更新订单状态" width="420px">
      <p v-if="current" class="dialog-meta">
        订单 {{ current.orderNo }} · 当前：{{ current.statusText }}
      </p>
      <el-form label-width="80px">
        <el-form-item label="目标状态">
          <el-select v-model="nextStatus" style="width: 100%">
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="statusDialog = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveStatus">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialog" title="订单详情" width="640px">
      <div v-loading="detailLoading">
        <template v-if="detail">
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="订单号">{{ detail.orderNo }}</el-descriptions-item>
            <el-descriptions-item label="状态">{{ detail.statusText }}</el-descriptions-item>
            <el-descriptions-item label="用户ID">{{ detail.userId }}</el-descriptions-item>
            <el-descriptions-item label="手机号">{{ detail.userPhone || '—' }}</el-descriptions-item>
            <el-descriptions-item label="昵称">{{ detail.userNickname || '—' }}</el-descriptions-item>
            <el-descriptions-item label="实付">{{ formatPrice(detail.payAmount) }}</el-descriptions-item>
            <el-descriptions-item label="下单时间" :span="2">{{ detail.createdAt }}</el-descriptions-item>
            <el-descriptions-item v-if="detail.payAt" label="支付时间" :span="2">
              {{ detail.payAt }}
            </el-descriptions-item>
            <el-descriptions-item v-if="detail.couponTitle" label="优惠券" :span="2">
              {{ detail.couponTitle }}（-{{ formatPrice(detail.couponDiscount || 0) }}）
            </el-descriptions-item>
          </el-descriptions>
          <el-table :data="detail.items" stripe class="detail-table" size="small">
            <el-table-column prop="title" label="商品" min-width="140" />
            <el-table-column prop="skuName" label="规格" width="120" />
            <el-table-column prop="quantity" label="数量" width="70" />
            <el-table-column label="单价" width="100">
              <template #default="{ row }">
                {{ formatPrice(row.price) }}
              </template>
            </el-table-column>
          </el-table>
        </template>
      </div>
    </el-dialog>
  </el-card>
</template>

<style scoped>
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}
.pager {
  margin-top: 16px;
  justify-content: flex-end;
}
.dialog-meta {
  margin: 0 0 12px;
  color: #666;
  font-size: 13px;
}
.detail-table {
  margin-top: 16px;
}
</style>
