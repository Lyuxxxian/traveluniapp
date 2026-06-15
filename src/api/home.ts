import { API_PATHS } from '../config/api'
import { isRemoteApiEnabled } from '../utils/remoteApi'
import { http } from '../utils/request'

export type ContentTarget =
  | { type: 'ticket'; saleMode?: 'daily' | 'presale' }
  | { type: 'hotel' }
  | { type: 'annualCard' }
  | { type: 'mall' }
  | { type: 'discoverPost'; id: number }
  | { type: 'search'; keyword?: string }
  | { type: 'map'; category?: string; pointId?: number; keyword?: string }
  | { type: 'help' }
  | { type: 'toast'; message: string }

export type HomeHeroSlide = {
  id: number
  title: string
  subtitle: string
  kicker: string
  imageUrl: string
  themeColor: string
}

export type HomeMatrixItem = {
  key: string
  title: string
  desc: string
  icon: string
  target?: ContentTarget
}

export type HomeActionCard = HomeMatrixItem

export type HomeCollectionItem = {
  id: number
  title: string
  desc: string
  tag: string
  coverUrl?: string
  background: string
  nextShowText?: string
  target?: ContentTarget
}

export type HomeCollectionSection = {
  key: string
  title: string
  subtitle?: string
  items: HomeCollectionItem[]
}

export type HomeFeedItem = {
  id: number
  type: string
  title: string
  desc: string
  source: string
  actionText: string
  coverUrl?: string
  background: string
  target?: ContentTarget
}

export type HomeConfig = {
  heroSlides: HomeHeroSlide[]
  matrixItems: HomeMatrixItem[]
  actionCards: HomeActionCard[]
  collectionSections: HomeCollectionSection[]
  feedItems: HomeFeedItem[]
}

export type HomeWeather = {
  icon: string
  temperature: string
  airQuality: string
}

export type WeatherNowDetail = {
  icon: string
  text: string
  temp: string
  feelsLike: string
  windDir: string
  windScale: string
  windSpeed: string
  humidity: string
  precip: string
  pressure: string
  vis: string
}

export type WeatherDailyItem = {
  date: string
  fxDate?: string
  icon: string
  textDay: string
  textNight: string
  tempMax: string
  tempMin: string
  precip: string
  humidity: string
  windDir: string
  windScale: string
  sunrise: string
  sunset: string
  uvIndex?: string
}

export type WeatherHourlyItem = {
  time: string
  icon: string
  text: string
  temp: string
  windDir: string
  windScale: string
  humidity: string
  precip: string
  pop?: string
}

export type WeatherDetail = {
  source: string
  placeName: string
  updatedAt: string
  now: WeatherNowDetail
  today: WeatherDailyItem
  airQuality: string
  hourly: WeatherHourlyItem[]
  daily: WeatherDailyItem[]
}

export type ShowItem = {
  id: number
  title: string
  place: string
  date: string
  times: string[]
  nextShowText: string
}

export const mockHomeConfig: HomeConfig = {
  heroSlides: [
    {
      id: 1,
      title: '灵山大佛全景',
      subtitle: '在山湖之间仰望庄严佛光',
      kicker: 'Lingshan Grand Buddha',
      imageUrl:
        'https://commons.wikimedia.org/wiki/Special:FilePath/%E7%81%B5%E5%B1%B1%E5%A4%A7%E4%BD%9B_-_panoramio_(1).jpg',
      themeColor: '#f8f1e3',
    },
    {
      id: 2,
      title: '灵山梵宫艺术细节',
      subtitle: '金色穹顶、壁画与木雕交织成东方美学',
      kicker: 'Brahma Palace',
      imageUrl:
        'https://commons.wikimedia.org/wiki/Special:FilePath/%E6%97%A0%E9%94%A1%E7%81%B5%E5%B1%B1%E5%A4%A7%E4%BD%9B%E6%A2%B5%E5%AE%AB_-_panoramio.jpg',
      themeColor: '#f5ead9',
    },
  ],
  matrixItems: [
    { key: 'presaleTicket', title: '预售门票', desc: '票务小程序', icon: 'ticket', target: { type: 'ticket', saleMode: 'presale' } },
    { key: 'dailyTicket', title: '当日门票', desc: '160元起', icon: 'ticketToday', target: { type: 'ticket', saleMode: 'daily' } },
    { key: 'entryAlert', title: '入园提醒', desc: '须知与检票点', icon: 'notice', target: { type: 'toast', message: '入园提醒待开发' } },
    { key: 'openingHours', title: '运营时间', desc: '8:00-17:00', icon: 'time', target: { type: 'toast', message: '运营时间待开发' } },
    { key: 'audioGuide', title: '电子讲解器', desc: '扫码支付佩戴', icon: 'audio', target: { type: 'toast', message: '电子讲解器待开发' } },
    { key: 'service', title: '游客服务', desc: '热评与回复', icon: 'service', target: { type: 'help' } },
  ],
  actionCards: [
    { key: 'buy', title: '立即购买', desc: '门票与套票', icon: 'buy', target: { type: 'ticket' } },
    { key: 'memberClub', title: '会员俱乐部', desc: '功德等级权益', icon: 'member', target: { type: 'toast', message: '会员俱乐部待开发' } },
    { key: 'annualCard', title: '年卡', desc: '全年畅游', icon: 'card', target: { type: 'annualCard' } },
    { key: 'activity', title: '体验活动', desc: '藏香制作等', icon: 'activity', target: { type: 'discoverPost', id: 1 } },
  ],
  collectionSections: [
    {
      key: 'routes',
      title: '路线选择',
      subtitle: '路线特点 · 地图轨迹 · 沿途景点',
      items: [
        {
          id: 101,
          title: '历史文化深度游',
          desc: '串联祥符禅寺、五智门等文化节点',
          tag: 'Routes',
          background: 'linear-gradient(140deg, #a56a3d 0%, #d9b06f 100%)',
          target: { type: 'map', keyword: '历史文化深度游' },
        },
        {
          id: 102,
          title: '亲子家庭轻松游',
          desc: '低强度步行，适合家庭慢游打卡',
          tag: 'Routes',
          background: 'linear-gradient(140deg, #d08b55 0%, #f2c77b 100%)',
          target: { type: 'map', keyword: '亲子家庭轻松游' },
        },
      ],
    },
    {
      key: 'shows',
      title: '演出',
      subtitle: '场次提醒 · 地点导航 · 演出介绍',
      items: [
        {
          id: 201,
          title: '九龙灌浴',
          desc: '大型音乐动态群雕表演',
          tag: 'Shows',
          nextShowText: '11：30下一场',
          background: 'linear-gradient(140deg, #386b8f 0%, #8fbdda 100%)',
          target: { type: 'map', keyword: '九龙灌浴' },
        },
      ],
    },
  ],
  feedItems: [
    {
      id: 1,
      type: '攻略推文',
      title: '灵山集章全攻略',
      desc: '整理隐藏章点和推荐动线，适合首次游玩。',
      source: '游玩攻略',
      actionText: '阅读',
      background: 'linear-gradient(140deg, #526f52 0%, #b5c987 100%)',
      target: { type: 'discoverPost', id: 2 },
    },
    {
      id: 2,
      type: '美食预约',
      title: '梵宫素斋自助',
      desc: '午间用餐高峰建议提前预约。',
      source: '美食',
      actionText: '查看',
      background: 'linear-gradient(140deg, #6f5b3e 0%, #d8aa67 100%)',
      target: { type: 'search', keyword: '梵宫素斋' },
    },
  ],
}

const mockWeather: HomeWeather = {
  icon: '☀',
  temperature: '26°C',
  airQuality: '良',
}

const mockWeatherDetail: WeatherDetail = {
  source: 'mock',
  placeName: '灵山胜境',
  updatedAt: '刚刚',
  now: {
    icon: '☀',
    text: '晴',
    temp: '26',
    feelsLike: '28',
    windDir: '东南风',
    windScale: '3',
    windSpeed: '14',
    humidity: '62',
    precip: '0.0',
    pressure: '1012',
    vis: '16',
  },
  today: {
    date: '今天',
    icon: '☀',
    textDay: '晴',
    textNight: '多云',
    tempMax: '29',
    tempMin: '21',
    precip: '0.0',
    humidity: '62',
    windDir: '东南风',
    windScale: '3',
    sunrise: '04:56',
    sunset: '19:06',
    uvIndex: '中等',
  },
  airQuality: '良',
  hourly: [
    { time: '08:00', icon: '☀', text: '晴', temp: '23', windDir: '东南风', windScale: '2', humidity: '68', precip: '0.0' },
    { time: '10:00', icon: '☀', text: '晴', temp: '26', windDir: '东南风', windScale: '3', humidity: '62', precip: '0.0' },
    { time: '12:00', icon: '🌤', text: '多云', temp: '28', windDir: '东南风', windScale: '3', humidity: '58', precip: '0.0' },
    { time: '14:00', icon: '🌤', text: '多云', temp: '29', windDir: '东南风', windScale: '3', humidity: '57', precip: '0.0' },
    { time: '16:00', icon: '⛅', text: '阴', temp: '27', windDir: '东南风', windScale: '2', humidity: '63', precip: '0.0' },
  ],
  daily: [
    { date: '今天', icon: '☀', textDay: '晴', textNight: '多云', tempMax: '29', tempMin: '21', precip: '0.0', humidity: '62', windDir: '东南风', windScale: '3', sunrise: '04:56', sunset: '19:06', uvIndex: '中等' },
    { date: '明天', icon: '⛅', textDay: '多云', textNight: '多云', tempMax: '28', tempMin: '22', precip: '0.0', humidity: '66', windDir: '东风', windScale: '3', sunrise: '04:56', sunset: '19:06' },
    { date: '周三', icon: '🌧', textDay: '小雨', textNight: '阴', tempMax: '25', tempMin: '20', precip: '3.2', humidity: '82', windDir: '东风', windScale: '3', sunrise: '04:57', sunset: '19:07' },
  ],
}

const mockShows: ShowItem[] = [
  {
    id: 201,
    title: '九龙灌浴',
    place: '九龙灌浴广场',
    date: '2026-05-28',
    times: ['10:00', '11:30', '13:30', '15:00'],
    nextShowText: '11：30下一场',
  },
]

const USE_REMOTE_HOME_API = isRemoteApiEnabled(import.meta.env.VITE_HOME_USE_REMOTE_API)
const HOME_READ_OPTS = { auth: false, showErrorToast: false } as const

export async function fetchHomeConfig(): Promise<HomeConfig> {
  if (!USE_REMOTE_HOME_API) return Promise.resolve(mockHomeConfig)
  try {
    const data = await http.get<HomeConfig>(API_PATHS.home.config, undefined, HOME_READ_OPTS)
    if (data && Array.isArray(data.heroSlides)) return data
  } catch {
    if (import.meta.env.DEV) {
      uni.showToast({
        title: '首页配置接口失败，已用本地 mock',
        icon: 'none',
        duration: 3000,
      })
    }
  }
  return Promise.resolve(mockHomeConfig)
}

export async function fetchHomeWeather(): Promise<HomeWeather> {
  try {
    const data = await http.get<HomeWeather>(API_PATHS.home.weather, undefined, HOME_READ_OPTS)
    if (data && data.temperature) return data
  } catch {
    if (import.meta.env.DEV) {
      uni.showToast({
        title: '天气接口失败，已用本地 mock',
        icon: 'none',
        duration: 2500,
      })
    }
  }
  return Promise.resolve(mockWeather)
}

export async function fetchWeatherDetail(): Promise<WeatherDetail> {
  try {
    const data = await http.get<WeatherDetail>(API_PATHS.home.weatherDetail, undefined, HOME_READ_OPTS)
    if (data && data.now && Array.isArray(data.hourly)) return data
  } catch {
    if (import.meta.env.DEV) {
      uni.showToast({
        title: '天气详情接口失败，已用本地 mock',
        icon: 'none',
        duration: 2500,
      })
    }
  }
  return Promise.resolve(mockWeatherDetail)
}

export async function fetchShows(date?: string): Promise<ShowItem[]> {
  // TODO: 对接后端 GET ${API_PATHS.home.shows}
  // return http.get<ShowItem[]>(API_PATHS.home.shows, { date }, { auth: false })
  if (!date) return Promise.resolve(mockShows)
  return Promise.resolve(mockShows.filter((item) => item.date === date))
}

void API_PATHS
