export type AdminPageResult<T> = {
  list: T[]
  page: number
  pageSize: number
  total: number
  hasMore: boolean
}

export type AdminListQuery = {
  page?: number
  pageSize?: number
  status?: string
  category?: string
}

export function isPageResult<T>(data: unknown): data is AdminPageResult<T> {
  return (
    !!data &&
    typeof data === 'object' &&
    'list' in data &&
    Array.isArray((data as AdminPageResult<T>).list)
  )
}
