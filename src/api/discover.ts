import { API_PATHS } from '../config/api'
import { isRemoteApiEnabled } from '../utils/remoteApi'
import { http } from '../utils/request'
import type { ContentTarget } from './home'

export type DiscoverCategory = 'recommend' | 'activity' | 'guide' | 'show' | 'food' | 'creative'

export type DiscoverCategoryOption = {
  key: DiscoverCategory
  label: string
}

export type DiscoverPost = {
  id: number
  category: DiscoverCategory
  title: string
  subtitle: string
  priceText: string
  coverUrl: string
  tagText: string
  summary: string
  location: string
  publishTime: string
  actionText: string
  target?: ContentTarget
}

export type DiscoverPostDetail = DiscoverPost & {
  place: string
  joinWay: string
  durationText: string
  contentText: string
  meaningText: string
  detailImageUrl: string
  buttonText: string
  relatedTargets: {
    title: string
    desc: string
    target: ContentTarget
  }[]
}

export type DiscoverPostListParams = {
  category?: DiscoverCategory
  page?: number
  pageSize?: number
}

export type DiscoverPostPage = {
  page: number
  pageSize: number
  total: number
  list: DiscoverPost[]
}

export const discoverCategories: DiscoverCategoryOption[] = [
  { key: 'recommend', label: '推荐' },
  { key: 'activity', label: '体验活动' },
  { key: 'guide', label: '攻略' },
  { key: 'show', label: '演出' },
  { key: 'food', label: '美食' },
  { key: 'creative', label: '文创' },
]

const staticPosts: DiscoverPost[] = [
  {
    id: 1,
    category: 'activity',
    title: '梵宫文化体验',
    subtitle: '灵山梵宫',
    priceText: '免费',
    coverUrl:
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80',
    tagText: '体验活动',
    summary: '沉浸式体验佛前供奉香花活动，感受梵宫艺术空间。',
    location: '灵山梵宫廊所庭',
    publishTime: '今日推荐',
    actionText: '预约',
    target: { type: 'discoverPost', id: 1 },
  },
  {
    id: 2,
    category: 'guide',
    title: '灵山集章全攻略',
    subtitle: '从大照壁到天下第一掌',
    priceText: '攻略',
    coverUrl:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
    tagText: '游玩攻略',
    summary: '整理隐藏章点和推荐动线，适合第一次来灵山的游客。',
    location: '全景区',
    publishTime: '2小时前',
    actionText: '阅读',
    target: { type: 'discoverPost', id: 2 },
  },
  {
    id: 3,
    category: 'show',
    title: '九龙灌浴今日场次',
    subtitle: '下一场 11:30',
    priceText: '演出',
    coverUrl:
      'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=800&q=80',
    tagText: '演出提醒',
    summary: '大型音乐动态群雕表演，以吉祥庄严氛围展现佛祖诞生。',
    location: '九龙灌浴广场',
    publishTime: '实时',
    actionText: '导航',
    target: { type: 'map', keyword: '九龙灌浴' },
  },
  {
    id: 4,
    category: 'food',
    title: '梵宫素斋自助预约',
    subtitle: '11:00-14:00',
    priceText: '¥88起',
    coverUrl:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    tagText: '美食',
    summary: '禅意空间里的精致素食自助，适合午间休憩。',
    location: '灵山梵宫一层东侧',
    publishTime: '今日可约',
    actionText: '查看',
    target: { type: 'map', keyword: '梵宫素斋' },
  },
  {
    id: 5,
    category: 'creative',
    title: '灵山禅茶礼盒上新',
    subtitle: '伴手礼与祈福心意',
    priceText: '¥128起',
    coverUrl:
      'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=800&q=80',
    tagText: '文创',
    summary: '精选禅茶与定制包装，适合作为灵山伴手礼。',
    location: '灵山文创店',
    publishTime: '新品',
    actionText: '查看',
    target: { type: 'mall' },
  },
  {
    id: 6,
    category: 'activity',
    title: '藏香制作体验',
    subtitle: '非遗手作',
    priceText: '¥39起',
    coverUrl:
      'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=800&q=80',
    tagText: '体验活动',
    summary: '跟随老师了解香文化，完成一份可带走的藏香作品。',
    location: '灵山文创体验区',
    publishTime: '周末可约',
    actionText: '预约',
    target: { type: 'discoverPost', id: 6 },
  },
]

const detailMap: Record<number, Omit<DiscoverPostDetail, keyof DiscoverPost>> = {
  1: {
    place: '灵山梵宫廊所庭',
    joinWay: '点击“立即预约”即可参与',
    durationText: '约15分钟',
    contentText: '伴随佛通宝塔升起，游客朋友们可以沉浸式体验佛前供奉香花活动。',
    meaningText: '带您走进佛教文化艺术的神圣殿堂，通过禅圣庄严的供花仪式，让您感受一次洗涤心灵的文化之旅。',
    detailImageUrl:
      'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80',
    buttonText: '立即预约',
    relatedTargets: [
      { title: '查看梵宫位置', desc: '在地图中查看活动地点', target: { type: 'map', keyword: '灵山梵宫' } },
    ],
  },
  2: {
    place: '全景区',
    joinWay: '按攻略路线自行打卡',
    durationText: '约2-3小时',
    contentText: '建议从入口大照壁出发，依次完成祥符禅寺、天下第一掌、九龙灌浴和梵宫章点。',
    meaningText: '用集章任务串联主要文化节点，让亲子与年轻游客更轻松理解景区故事。',
    detailImageUrl:
      'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80',
    buttonText: '收藏攻略',
    relatedTargets: [
      { title: '打开地图路线', desc: '从地图继续查看相关点位', target: { type: 'map', keyword: '集章' } },
    ],
  },
  3: {
    place: '九龙灌浴广场',
    joinWay: '按当日演出场次提前到达广场观看',
    durationText: '约20分钟',
    contentText: '九龙灌浴以音乐、喷泉、动态群雕共同呈现佛祖诞生故事，是灵山景区标志性演出。',
    meaningText: '通过演出把文化故事转化为易理解的现场体验，适合亲子与首次到访游客。',
    detailImageUrl:
      'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1200&q=80',
    buttonText: '去地图查看',
    relatedTargets: [
      { title: '导航到九龙灌浴', desc: '在现有地图页中查看位置', target: { type: 'map', keyword: '九龙灌浴' } },
    ],
  },
  4: {
    place: '灵山梵宫一层东侧',
    joinWay: '建议午餐高峰前预约或错峰前往',
    durationText: '约45-60分钟',
    contentText: '梵宫素斋自助提供多种素食、热菜与茶点，适合游览中途补给休憩。',
    meaningText: '把饮食服务与禅意空间结合，让游客在用餐中延续灵山文化体验。',
    detailImageUrl:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80',
    buttonText: '查看位置',
    relatedTargets: [
      { title: '去地图查看餐厅', desc: '在现有地图页中查看梵宫素斋', target: { type: 'map', keyword: '梵宫素斋' } },
    ],
  },
  6: {
    place: '灵山文创体验区',
    joinWay: '到店咨询或通过后续预约入口参与',
    durationText: '约30分钟',
    contentText: '体验区提供香料识别、配方讲解和手作环节，游客可完成一份藏香作品。',
    meaningText: '用轻量手作承接文化内容，适合亲子家庭和年轻游客参与。',
    detailImageUrl:
      'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80',
    buttonText: '立即预约',
    relatedTargets: [
      { title: '搜索文创体验', desc: '后续可接入搜索页或预约页', target: { type: 'search', keyword: '藏香制作' } },
    ],
  },
}

const USE_REMOTE_DISCOVER_API = isRemoteApiEnabled(import.meta.env.VITE_DISCOVER_USE_REMOTE_API)
const DISCOVER_READ_OPTS = { auth: false, showErrorToast: false } as const

export async function fetchDiscoverPosts(params: DiscoverPostListParams = {}): Promise<DiscoverPost[] | DiscoverPostPage> {
  if (USE_REMOTE_DISCOVER_API) {
    try {
      const data = await http.get<DiscoverPost[] | DiscoverPostPage>(
        API_PATHS.discover.posts,
        params,
        DISCOVER_READ_OPTS,
      )
      if (Array.isArray(data) && data.length) return data
      if (data && typeof data === 'object' && 'list' in data && (data as DiscoverPostPage).list?.length) {
        return data as DiscoverPostPage
      }
    } catch {
      /* fallback mock */
    }
  }
  const page = params.page || 1
  const pageSize = params.pageSize || 20
  const filtered = params.category && params.category !== 'recommend'
    ? staticPosts.filter((post) => post.category === params.category)
    : staticPosts

  if (!params.page && !params.pageSize && !params.category) {
    return Promise.resolve(filtered)
  }

  const start = (page - 1) * pageSize
  return Promise.resolve({
    page,
    pageSize,
    total: filtered.length,
    list: filtered.slice(start, start + pageSize),
  })
}

export async function fetchDiscoverPostDetail(id: number): Promise<DiscoverPostDetail> {
  if (USE_REMOTE_DISCOVER_API) {
    try {
      const data = await http.get<DiscoverPostDetail>(
        `${API_PATHS.discover.detail}/${id}`,
        undefined,
        DISCOVER_READ_OPTS,
      )
      if (data?.id) return data
    } catch {
      /* fallback mock */
    }
  }
  const post = staticPosts.find((item) => item.id === id) || staticPosts[0]
  const detail = detailMap[post.id] || {
    place: post.location,
    joinWay: '点击下方按钮继续操作',
    durationText: '约30分钟',
    contentText: post.summary,
    meaningText: '为游客提供更完整的游玩信息与下一步入口。',
    detailImageUrl: post.coverUrl,
    buttonText: post.actionText,
    relatedTargets: post.target ? [{ title: post.actionText, desc: post.summary, target: post.target }] : [],
  }
  return Promise.resolve({ ...post, ...detail })
}

void API_PATHS

