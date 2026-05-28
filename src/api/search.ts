import { API_PATHS } from '../config/api'
import type { ContentTarget } from './home'

export type SearchType = 'all' | 'ticket' | 'hotel' | 'product' | 'spot' | 'show' | 'food' | 'article'

export type SearchTypeOption = {
  key: SearchType
  label: string
}

export type SearchResult = {
  id: number
  type: SearchType
  title: string
  subtitle: string
  coverUrl: string
  tagText: string
  target: ContentTarget
}

export type SearchParams = {
  keyword: string
  type?: SearchType
  page?: number
  pageSize?: number
}

export type SearchResultPage = {
  page: number
  pageSize: number
  total: number
  list: SearchResult[]
}

export const searchTypeOptions: SearchTypeOption[] = [
  { key: 'all', label: '全部' },
  { key: 'ticket', label: '门票' },
  { key: 'hotel', label: '酒店' },
  { key: 'product', label: '商品' },
  { key: 'spot', label: '景点' },
  { key: 'show', label: '演出' },
  { key: 'food', label: '餐厅' },
  { key: 'article', label: '攻略' },
]

const mockHotKeywords = ['灵山大佛门票', '九龙灌浴圣水瓶', '灵山禅茶', '素面', '梵宫素斋', '集章攻略']

const mockSearchResults: SearchResult[] = [
  {
    id: 1001,
    type: 'ticket',
    title: '灵山大佛成人票',
    subtitle: '当日可订，扫码入园',
    coverUrl: 'https://images.unsplash.com/photo-1600262300671-295cb21f6d06?auto=format&fit=crop&w=400&q=80',
    tagText: '门票',
    target: { type: 'ticket' },
  },
  {
    id: 2001,
    type: 'hotel',
    title: '灵山精舍禅意房',
    subtitle: '含早课体验与素斋早餐',
    coverUrl: 'https://images.unsplash.com/photo-1549638441-b787d2e11f14?auto=format&fit=crop&w=400&q=80',
    tagText: '酒店',
    target: { type: 'hotel' },
  },
  {
    id: 4001,
    type: 'product',
    title: '灵山禅茶礼盒',
    subtitle: '伴手礼与祈福心意精选',
    coverUrl: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=400&q=80',
    tagText: '文创',
    target: { type: 'mall' },
  },
  {
    id: 101,
    type: 'spot',
    title: '灵山大佛',
    subtitle: '世界露天青铜释迦牟尼立像',
    coverUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=80',
    tagText: '景点',
    target: { type: 'map', keyword: '灵山大佛' },
  },
  {
    id: 301,
    type: 'show',
    title: '九龙灌浴',
    subtitle: '今日 11:30 下一场',
    coverUrl: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=400&q=80',
    tagText: '演出',
    target: { type: 'map', keyword: '九龙灌浴' },
  },
  {
    id: 201,
    type: 'food',
    title: '梵宫素斋自助',
    subtitle: '灵山梵宫一层东侧',
    coverUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
    tagText: '美食',
    target: { type: 'map', keyword: '梵宫素斋' },
  },
  {
    id: 2,
    type: 'article',
    title: '灵山集章全攻略',
    subtitle: '整理隐藏章点和推荐动线',
    coverUrl: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=400&q=80',
    tagText: '攻略',
    target: { type: 'discoverPost', id: 2 },
  },
]

export async function fetchHotKeywords(): Promise<string[]> {
  // TODO: 对接后端 GET ${API_PATHS.search.hotKeywords}
  // return http.get<string[]>(API_PATHS.search.hotKeywords, undefined, { auth: false })
  return Promise.resolve(mockHotKeywords)
}

export async function searchContent(params: SearchParams): Promise<SearchResultPage> {
  // TODO: 对接后端 GET ${API_PATHS.search.global}
  // return http.get<SearchResultPage>(API_PATHS.search.global, params, { auth: false })
  const page = params.page || 1
  const pageSize = params.pageSize || 20
  const type = params.type || 'all'
  const keyword = params.keyword.trim().toLowerCase()

  let list = mockSearchResults
  if (type !== 'all') {
    list = list.filter((item) => item.type === type)
  }
  if (keyword) {
    list = list.filter((item) =>
      [item.title, item.subtitle, item.tagText].some((text) => text.toLowerCase().includes(keyword)),
    )
  }

  const start = (page - 1) * pageSize
  return Promise.resolve({
    page,
    pageSize,
    total: list.length,
    list: list.slice(start, start + pageSize),
  })
}

void API_PATHS
