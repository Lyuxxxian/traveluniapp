import { API_PATHS } from '../config/api'

/** 冻结分类 key，与地图页、接口文档一致 */
export type MapCategoryKey = 'spot' | 'food' | 'toilet' | 'parking' | 'service'

export type MapPointStatus = 'open' | 'closed' | 'busy'

export type MapRouteScene = 'culture' | 'family' | 'relax' | 'food'

export type MapCategory = {
  key: MapCategoryKey
  label: string
  icon: string
  color: string
  sort: number
}

export type MapPoint = {
  id: number
  category: MapCategoryKey
  title: string
  latitude: number
  longitude: number
  address: string
  desc: string
  openTime?: string
  status?: MapPointStatus
  tags?: string[]
  iconKey?: string
  distanceText?: string
}

export type MapPointDetail = MapPoint & {
  images?: string[]
  suggestedDuration?: string
  serviceTags?: string[]
  relatedShowIds?: number[]
  relatedProductIds?: number[]
}

export type MapRoute = {
  id: number
  title: string
  scene: MapRouteScene
  durationText: string
  pointIds: number[]
  desc: string
}

export type MapPointQuery = {
  category?: MapCategoryKey | string
  keyword?: string
  latitude?: number
  longitude?: number
  includeClosed?: boolean
}

export type MapRouteQuery = {
  scene?: MapRouteScene | string
  duration?: number
}

type MapPointSeed = Omit<MapPoint, 'category' | 'iconKey' | 'status'> & {
  category?: MapCategoryKey
  iconKey?: string
  status?: MapPointStatus
  openTime?: string
  tags?: string[]
  distanceText?: string
}

function seedToPoint(category: MapCategoryKey, seed: MapPointSeed): MapPoint {
  return {
    category,
    status: 'open',
    iconKey: category,
    ...seed,
    category: seed.category ?? category,
    iconKey: seed.iconKey ?? category,
    status: seed.status ?? 'open',
  }
}

export const fallbackMapCategories: MapCategory[] = [
  { key: 'spot', label: '景点', icon: 'spot', color: '#8b6138', sort: 1 },
  { key: 'food', label: '素斋', icon: 'food', color: '#c77d45', sort: 2 },
  { key: 'toilet', label: '卫生间', icon: 'toilet', color: '#7b9eb3', sort: 3 },
  { key: 'parking', label: '停车场', icon: 'parking', color: '#8b9a6b', sort: 4 },
  { key: 'service', label: '服务', icon: 'service', color: '#c4a35a', sort: 5 },
]

const mockPointsByCategory: Record<MapCategoryKey, MapPointSeed[]> = {
  spot: [
    {
      id: 101,
      title: '灵山大佛',
      latitude: 31.421,
      longitude: 120.108,
      address: '无锡市滨湖区马山灵山路1号',
      desc: '世界露天青铜释迦牟尼立像，高88米，瞻礼灵山大佛感受佛教文化的庄严与宁静。',
      openTime: '08:00-17:00',
      tags: ['地标', '祈福', '拍照'],
      distanceText: '距入口约1.2公里',
    },
    {
      id: 102,
      title: '灵山梵宫',
      latitude: 31.4222,
      longitude: 120.1075,
      address: '灵山大佛景区内东侧',
      desc: '金色穹顶、壁画与木雕交织成东方美学，是佛教文化艺术的神圣殿堂。',
      openTime: '09:00-17:00',
      tags: ['文化', '参观'],
    },
    {
      id: 103,
      title: '祥符禅寺',
      latitude: 31.4205,
      longitude: 120.1072,
      address: '灵山大佛景区入口北侧',
      desc: '千年古刹，灵山胜境发祥地，寺内古树参天殿宇庄严，是祈福朝圣起点。',
      tags: ['古刹', '祈福'],
    },
    {
      id: 104,
      title: '五印坛城',
      latitude: 31.423,
      longitude: 120.1065,
      address: '灵山梵宫北侧临水',
      desc: '藏式风格佛教建筑，金顶白墙倒映湖中，展示藏传佛教文化艺术精华。',
      tags: ['藏式', '拍照'],
    },
    {
      id: 105,
      title: '九龙灌浴广场',
      latitude: 31.4225,
      longitude: 120.1082,
      address: '灵山大佛景区中轴线',
      desc: '大型音乐动态群雕表演，以吉祥庄严氛围展现佛祖诞生的故事，每日多场次。',
      openTime: '10:00-16:30',
      tags: ['演出', '广场'],
    },
    {
      id: 106,
      title: '天下第一掌',
      latitude: 31.4208,
      longitude: 120.1078,
      address: '祥符禅寺广场',
      desc: '大佛右手1:1复制铜掌，摸掌祈福文化代表点位，寓意摸掌增福添寿。',
      tags: ['祈福', '打卡'],
    },
    {
      id: 107,
      title: '拈花湾禅意小镇',
      latitude: 31.401,
      longitude: 120.078,
      address: '无锡市滨湖区环山西路68号',
      desc: '以禅意生活方式为主题的度假小镇，花海铺展夜景迷人，适合慢游打卡。',
      openTime: '09:00-20:30',
      tags: ['小镇', '夜景'],
    },
  ],
  food: [
    {
      id: 201,
      title: '梵宫素斋自助',
      latitude: 31.422,
      longitude: 120.1078,
      address: '灵山梵宫一层东侧',
      desc: '禅意空间内精致素食自助，品类丰富，是游览中途休憩用餐首选。',
      openTime: '11:00-14:00',
      tags: ['自助', '素斋'],
    },
    {
      id: 202,
      title: '灵山精舍素斋',
      latitude: 31.4215,
      longitude: 120.106,
      address: '灵山精舍院内',
      desc: '清雅素斋配以禅意园林景观，适合午间静心用餐，需提前预约。',
      openTime: '11:30-13:30',
      tags: ['预约', '素斋'],
    },
    {
      id: 203,
      title: '景区素面馆',
      latitude: 31.4205,
      longitude: 120.109,
      address: '祥符禅寺南侧商街',
      desc: '灵山特色素面一碗，快速补给继续游览，价格实惠出餐快。',
      openTime: '10:00-16:00',
      tags: ['快餐', '素面'],
    },
    {
      id: 204,
      title: '五观堂素斋厅',
      latitude: 31.4198,
      longitude: 120.1068,
      address: '景区入口西侧',
      desc: '大型素斋餐厅，适合团队用餐，提供套餐与点单服务。',
      openTime: '11:00-14:30',
      tags: ['团队', '素斋'],
    },
  ],
  toilet: [
    {
      id: 301,
      title: '大佛脚下公厕',
      latitude: 31.4215,
      longitude: 120.1085,
      address: '灵山大佛登云道旁',
      desc: '距离主游览区最近，便于登佛前后使用。',
      tags: ['公厕'],
    },
    {
      id: 302,
      title: '梵宫东侧公厕',
      latitude: 31.4225,
      longitude: 120.1068,
      address: '梵宫东门外侧',
      desc: '梵宫参观路线配套公厕，环境整洁设施完善。',
      tags: ['公厕'],
    },
    {
      id: 303,
      title: '九龙灌浴公厕',
      latitude: 31.423,
      longitude: 120.1085,
      address: '九龙灌浴广场北侧',
      desc: '观看演出前后可就近使用，客流高峰时会排队。',
      tags: ['公厕'],
    },
  ],
  parking: [
    {
      id: 401,
      title: 'P1 主停车场',
      latitude: 31.4185,
      longitude: 120.109,
      address: '景区正门入口南侧',
      desc: '距离景区入口最近的大型停车场，含新能源充电桩，节假日建议尽早到达。',
      openTime: '全天',
      tags: ['充电桩', '主入口'],
    },
    {
      id: 402,
      title: 'P2 东停车场',
      latitude: 31.418,
      longitude: 120.111,
      address: '景区东侧辅路',
      desc: '备选停车区，适合高峰分流，步行至入口约8分钟。',
      openTime: '全天',
      tags: ['备选'],
      distanceText: '步行至入口约8分钟',
    },
    {
      id: 403,
      title: 'P3 大巴停车场',
      latitude: 31.4195,
      longitude: 120.1065,
      address: '景区西侧大巴专用区',
      desc: '团队与旅游大巴专用停车场，配备团队集合区与卫生间。',
      openTime: '全天',
      tags: ['大巴', '团队'],
    },
  ],
  service: [
    {
      id: 501,
      title: '游客服务中心',
      latitude: 31.4192,
      longitude: 120.108,
      address: '景区主入口右侧',
      desc: '提供导览咨询、行程建议、失物登记与轮椅租借服务。',
      openTime: '08:00-17:00',
      tags: ['咨询', '轮椅'],
    },
    {
      id: 502,
      title: '电子讲解器租赁',
      latitude: 31.4205,
      longitude: 120.1075,
      address: '祥符禅寺广场入口',
      desc: '扫码支付佩戴，支持多语种讲解，覆盖景区主要文化节点。',
      openTime: '08:30-16:30',
      tags: ['讲解器'],
    },
    {
      id: 503,
      title: '应急医疗点',
      latitude: 31.422,
      longitude: 120.1085,
      address: '九龙灌浴广场附近',
      desc: '配备基础急救物资与值班医护人员，方便处理轻微突发情况。',
      openTime: '09:00-17:00',
      tags: ['医疗', '应急'],
    },
  ],
}

export const fallbackMapPoints: MapPoint[] = (Object.entries(mockPointsByCategory) as [MapCategoryKey, MapPointSeed[]][]).flatMap(
  ([category, seeds]) => seeds.map((seed) => seedToPoint(category, seed)),
)

const mockRoutes: MapRoute[] = [
  {
    id: 1,
    title: '历史文化深度游',
    scene: 'culture',
    durationText: '约3小时',
    pointIds: [103, 106, 101, 102],
    desc: '串联祥符禅寺、天下第一掌、灵山大佛、梵宫等文化节点。',
  },
  {
    id: 2,
    title: '亲子家庭轻松游',
    scene: 'family',
    durationText: '约2.5小时',
    pointIds: [105, 101, 201, 501],
    desc: '低强度步行，适合家庭慢游打卡，含演出广场与素斋补给。',
  },
  {
    id: 3,
    title: '休闲漫步线',
    scene: 'relax',
    durationText: '约2小时',
    pointIds: [104, 102, 107],
    desc: '五印坛城、梵宫与拈花湾，适合拍照与慢游。',
  },
  {
    id: 4,
    title: '素斋美食线',
    scene: 'food',
    durationText: '约1.5小时',
    pointIds: [201, 203, 204],
    desc: '梵宫素斋、素面馆与五观堂，适合午间用餐规划。',
  },
]

const detailExtras: Record<number, Omit<MapPointDetail, keyof MapPoint>> = {
  101: {
    images: ['https://cdn.example.com/map/101.jpg'],
    suggestedDuration: '45分钟',
    serviceTags: ['讲解', '拍照', '无障碍'],
    relatedShowIds: [],
    relatedProductIds: [],
  },
  105: {
    images: ['https://cdn.example.com/map/105.jpg'],
    suggestedDuration: '20分钟',
    serviceTags: ['演出', '讲解'],
    relatedShowIds: [201],
    relatedProductIds: [],
  },
  201: {
    images: ['https://cdn.example.com/map/201.jpg'],
    suggestedDuration: '45-60分钟',
    serviceTags: ['预约', '自助'],
    relatedShowIds: [],
    relatedProductIds: [],
  },
  501: {
    suggestedDuration: '按需',
    serviceTags: ['咨询', '失物', '轮椅租借'],
    relatedShowIds: [],
    relatedProductIds: [],
  },
}

function isMapCategoryKey(value: string): value is MapCategoryKey {
  return ['spot', 'food', 'toilet', 'parking', 'service'].includes(value)
}

function filterPoints(list: MapPoint[], params: MapPointQuery = {}): MapPoint[] {
  let result = [...list]

  if (params.category && isMapCategoryKey(params.category)) {
    result = result.filter((item) => item.category === params.category)
  }

  const keyword = params.keyword?.trim().toLowerCase()
  if (keyword) {
    result = result.filter((item) =>
      [item.title, item.desc, item.address, ...(item.tags || [])].some((text) =>
        text.toLowerCase().includes(keyword),
      ),
    )
  }

  if (params.includeClosed === false) {
    result = result.filter((item) => item.status !== 'closed')
  }

  return result
}

export async function fetchMapCategories(): Promise<MapCategory[]> {
  // TODO: 对接后端 GET ${API_PATHS.map.categories}
  // return http.get<MapCategory[]>(API_PATHS.map.categories, undefined, { auth: false })
  return Promise.resolve([...fallbackMapCategories])
}

export async function fetchMapPoints(params: MapPointQuery = {}): Promise<MapPoint[]> {
  // TODO: 对接后端 GET ${API_PATHS.map.points}
  // return http.get<MapPoint[]>(API_PATHS.map.points, params, { auth: false })
  return Promise.resolve(filterPoints(fallbackMapPoints, params))
}

export async function fetchMapPointDetail(id: number): Promise<MapPointDetail | null> {
  // TODO: 对接后端 GET ${API_PATHS.map.pointDetail}/:id
  // return http.get<MapPointDetail>(`${API_PATHS.map.pointDetail}/${id}`, undefined, { auth: false })
  const point = fallbackMapPoints.find((item) => item.id === id)
  if (!point) return Promise.resolve(null)
  const extras = detailExtras[id] || {}
  return Promise.resolve({ ...point, ...extras })
}

export async function fetchMapRoutes(params: MapRouteQuery = {}): Promise<MapRoute[]> {
  // TODO: 对接后端 GET ${API_PATHS.map.routes}
  // return http.get<MapRoute[]>(API_PATHS.map.routes, params, { auth: false })
  let list = [...mockRoutes]
  if (params.scene) {
    list = list.filter((item) => item.scene === params.scene)
  }
  if (params.duration) {
    list = list.filter((item) => {
      const minutes = Number.parseInt(item.durationText.replace(/[^\d]/g, ''), 10)
      return !Number.isNaN(minutes) && minutes <= params.duration!
    })
  }
  return Promise.resolve(list)
}

void API_PATHS
