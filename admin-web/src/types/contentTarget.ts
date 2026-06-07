/** 与 C 端 src/api/home.ts ContentTarget 对齐 */
export type ContentTarget =
  | { type: 'ticket' }
  | { type: 'hotel' }
  | { type: 'annualCard' }
  | { type: 'mall' }
  | { type: 'discoverPost'; id: number }
  | { type: 'search'; keyword?: string }
  | { type: 'map'; category?: string; pointId?: number; keyword?: string }
  | { type: 'help' }
  | { type: 'toast'; message: string }

export type ContentTargetType = ContentTarget['type']

export const CONTENT_TARGET_OPTIONS: { value: ContentTargetType; label: string }[] = [
  { value: 'ticket', label: '门票 ticket' },
  { value: 'hotel', label: '酒店 hotel' },
  { value: 'annualCard', label: '年卡 annualCard' },
  { value: 'mall', label: '商城 mall' },
  { value: 'discoverPost', label: '发现帖 discoverPost' },
  { value: 'search', label: '搜索 search' },
  { value: 'map', label: '地图 map' },
  { value: 'help', label: '帮助中心 help' },
  { value: 'toast', label: '提示 toast' },
]

export function createDefaultTarget(type: ContentTargetType): ContentTarget {
  switch (type) {
    case 'discoverPost':
      return { type, id: 1 }
    case 'search':
      return { type, keyword: '' }
    case 'map':
      return { type, keyword: '' }
    case 'toast':
      return { type, message: '' }
    default:
      return { type } as ContentTarget
  }
}

/** 构建可写入 JSON 的 target（去掉空字符串与无效数字） */
export function normalizeContentTarget(raw: ContentTarget): ContentTarget {
  switch (raw.type) {
    case 'discoverPost':
      return { type: 'discoverPost', id: Number(raw.id) || 0 }
    case 'search': {
      const t: { type: 'search'; keyword?: string } = { type: 'search' }
      const kw = String(raw.keyword ?? '').trim()
      if (kw) t.keyword = kw
      return t
    }
    case 'map': {
      const t: { type: 'map'; category?: string; pointId?: number; keyword?: string } = { type: 'map' }
      const category = String(raw.category ?? '').trim()
      const keyword = String(raw.keyword ?? '').trim()
      const pointId = Number(raw.pointId)
      if (category) t.category = category
      if (keyword) t.keyword = keyword
      if (Number.isFinite(pointId) && pointId > 0) t.pointId = pointId
      return t
    }
    case 'toast':
      return { type: 'toast', message: String(raw.message ?? '').trim() }
    default:
      return { type: raw.type }
  }
}

export function validateContentTarget(raw: ContentTarget | null | undefined): string | null {
  if (!raw?.type) return '请选择跳转类型'
  switch (raw.type) {
    case 'discoverPost':
      if (!Number(raw.id) || raw.id < 1) return '发现帖 ID 须为正整数'
      break
    case 'toast':
      if (!String(raw.message ?? '').trim()) return 'toast 须填写提示文案 message'
      break
    default:
      break
  }
  return null
}
