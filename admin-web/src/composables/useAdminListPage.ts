import { ref } from 'vue'
import type { AdminListQuery, AdminPageResult } from '@/types/adminList'
import { isPageResult } from '@/types/adminList'

export function useAdminListPage(defaultPageSize = 10) {
  const list = ref<Record<string, unknown>[]>([])
  const page = ref(1)
  const pageSize = ref(defaultPageSize)
  const total = ref(0)
  const loading = ref(false)

  function applyPageResult(data: AdminPageResult<Record<string, unknown>> | Record<string, unknown>[]) {
    if (isPageResult<Record<string, unknown>>(data)) {
      list.value = data.list
      page.value = data.page
      pageSize.value = data.pageSize
      total.value = data.total
      return
    }
    list.value = data as Record<string, unknown>[]
    total.value = list.value.length
  }

  function buildQuery(extra: AdminListQuery = {}): AdminListQuery {
    return {
      page: page.value,
      pageSize: pageSize.value,
      ...extra,
    }
  }

  function resetPage() {
    page.value = 1
  }

  return {
    list,
    page,
    pageSize,
    total,
    loading,
    applyPageResult,
    buildQuery,
    resetPage,
  }
}
