/**
 * 和风天气：首页实时天气 + 空气质量 + 天气详情（Key 仅放 server/.env，勿提交 Git）
 * 文档：https://dev.qweather.com/docs/api/weather/weather-now/
 */

const DEFAULT_HOST = 'devapi.qweather.com'
const CACHE_TTL_MS = 10 * 60 * 1000

let cache = { at: 0, data: null }
let detailCache = { at: 0, data: null }

const MOCK_HOME_WEATHER = {
  icon: '☀',
  temperature: '26°C',
  airQuality: '良',
  source: 'mock',
}

const MOCK_WEATHER_DETAIL = {
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
    fxDate: '',
    textDay: '晴',
    textNight: '多云',
    icon: '☀',
    tempMax: '29',
    tempMin: '21',
    sunrise: '04:56',
    sunset: '19:06',
    precip: '0.0',
    humidity: '62',
    windDir: '东南风',
    windScale: '3',
    uvIndex: '中等',
  },
  airQuality: '良',
  hourly: [
    { time: '08:00', icon: '☀', text: '晴', temp: '23', windDir: '东南风', windScale: '2', humidity: '68', precip: '0.0' },
    { time: '10:00', icon: '☀', text: '晴', temp: '26', windDir: '东南风', windScale: '3', humidity: '62', precip: '0.0' },
    { time: '12:00', icon: '🌤', text: '多云', temp: '28', windDir: '东南风', windScale: '3', humidity: '58', precip: '0.0' },
    { time: '14:00', icon: '🌤', text: '多云', temp: '29', windDir: '东南风', windScale: '3', humidity: '57', precip: '0.0' },
    { time: '16:00', icon: '⛅', text: '阴', temp: '27', windDir: '东南风', windScale: '2', humidity: '63', precip: '0.0' },
    { time: '18:00', icon: '⛅', text: '多云', temp: '25', windDir: '东南风', windScale: '2', humidity: '70', precip: '0.0' },
  ],
  daily: [
    { date: '今天', icon: '☀', textDay: '晴', textNight: '多云', tempMax: '29', tempMin: '21', precip: '0.0', humidity: '62', windDir: '东南风', windScale: '3', sunrise: '04:56', sunset: '19:06', uvIndex: '中等' },
    { date: '明天', icon: '⛅', textDay: '多云', textNight: '多云', tempMax: '28', tempMin: '22', precip: '0.0', humidity: '66', windDir: '东风', windScale: '3', sunrise: '04:56', sunset: '19:06', uvIndex: '中等' },
    { date: '周三', icon: '🌧', textDay: '小雨', textNight: '阴', tempMax: '25', tempMin: '20', precip: '3.2', humidity: '82', windDir: '东风', windScale: '3', sunrise: '04:57', sunset: '19:07', uvIndex: '弱' },
  ],
}

function roundCoord(n) {
  return Number(Number(n).toFixed(2))
}

export function getQWeatherLocation() {
  const fromEnv = process.env.QWEATHER_LOCATION
  if (fromEnv) return fromEnv.trim()
  const lng = roundCoord(process.env.QWEATHER_LNG ?? 120.1)
  const lat = roundCoord(process.env.QWEATHER_LAT ?? 31.43)
  return `${lng},${lat}`
}

function getLatLng() {
  const loc = getQWeatherLocation()
  const [lng, lat] = loc.split(',').map((s) => Number(s.trim()))
  return { lat: roundCoord(lat), lng: roundCoord(lng) }
}

function getPlaceName() {
  return (process.env.QWEATHER_PLACE_NAME || '灵山胜境').trim()
}

function getApiHost() {
  return (process.env.QWEATHER_API_HOST || DEFAULT_HOST)
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '')
}

function getApiKey() {
  return (process.env.QWEATHER_API_KEY || '').trim()
}

async function qweatherGet(path, query = {}) {
  const key = getApiKey()
  if (!key) return null

  const url = new URL(`https://${getApiHost()}${path}`)
  for (const [name, value] of Object.entries(query)) {
    if (value != null && value !== '') url.searchParams.set(name, String(value))
  }

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'Accept-Encoding': 'gzip',
      'X-QW-Api-Key': key,
    },
    signal: AbortSignal.timeout(12000),
  })

  if (!response.ok) {
    throw new Error(`和风 HTTP ${response.status}`)
  }

  return response.json()
}

export function weatherIconEmoji(iconCode, text = '') {
  const code = String(iconCode || '')
  const iconMap = {
    100: '☀',
    150: '☀',
    101: '⛅',
    151: '⛅',
    102: '🌤',
    152: '🌤',
    103: '⛅',
    153: '⛅',
    104: '☁',
    154: '☁',
    300: '🌦',
    301: '🌧',
    302: '⛈',
    303: '⛈',
    304: '⛈',
    305: '🌧',
    306: '🌧',
    307: '🌧',
    308: '🌧',
    309: '🌧',
    310: '🌧',
    311: '🌧',
    312: '🌧',
    313: '🌧',
    314: '🌧',
    315: '🌧',
    316: '🌧',
    317: '🌧',
    318: '🌧',
    399: '🌧',
    400: '❄',
    401: '❄',
    402: '❄',
    403: '❄',
    404: '❄',
    405: '❄',
    406: '❄',
    407: '❄',
    408: '❄',
    409: '❄',
    410: '❄',
    456: '❄',
    457: '❄',
    499: '❄',
    500: '🌫',
    501: '🌫',
    502: '🌫',
    503: '🌫',
    504: '🌫',
    507: '🌪',
    508: '🌪',
    509: '🌫',
    510: '🌫',
    511: '🌫',
    512: '🌫',
    513: '🌫',
    514: '🌫',
    515: '🌫',
  }

  if (iconMap[code]) return iconMap[code]
  if (/晴/.test(text)) return '☀'
  if (/云/.test(text)) return '⛅'
  if (/雨|雷/.test(text)) return '🌧'
  if (/雪/.test(text)) return '❄'
  if (/雾|霾/.test(text)) return '🌫'
  return '☀'
}

function pickAirQualityLabel(airPayload) {
  if (!airPayload) return MOCK_HOME_WEATHER.airQuality

  if (airPayload.code === '200' && airPayload.now?.category) {
    return airPayload.now.category
  }

  const indexes = airPayload.indexes
  if (Array.isArray(indexes)) {
    const cn =
      indexes.find((item) => item.code === 'cn-mee') ||
      indexes.find((item) => item.code === 'cn-ha') ||
      indexes.find((item) => /AQI|空气质量/i.test(item.name || ''))
    if (cn?.category) return cn.category
  }

  return MOCK_HOME_WEATHER.airQuality
}

async function fetchAirQualityLabel() {
  const location = getQWeatherLocation()
  const { lat, lng } = getLatLng()

  try {
    const v7 = await qweatherGet('/v7/air/now', { location, lang: 'zh' })
    if (v7?.code === '200') return pickAirQualityLabel(v7)
  } catch {
    // 部分账号已停用 v7 空气质量，尝试 v1
  }

  try {
    const v1 = await qweatherGet(`/airquality/v1/current/${lat}/${lng}`, { lang: 'zh' })
    return pickAirQualityLabel(v1)
  } catch {
    return MOCK_HOME_WEATHER.airQuality
  }
}

async function fetchNowWeather() {
  const location = getQWeatherLocation()
  const payload = await qweatherGet('/v7/weather/now', { location, lang: 'zh' })
  if (payload?.code !== '200' || !payload.now) {
    throw new Error(`和风天气 now 失败: ${payload?.code || 'unknown'}`)
  }
  return payload.now
}

async function fetchDailyWeather() {
  const location = getQWeatherLocation()
  const payload = await qweatherGet('/v7/weather/7d', { location, lang: 'zh' })
  if (payload?.code !== '200' || !Array.isArray(payload.daily)) {
    throw new Error(`和风天气 7d 失败: ${payload?.code || 'unknown'}`)
  }
  return payload.daily
}

async function fetchHourlyWeather() {
  const location = getQWeatherLocation()
  const payload = await qweatherGet('/v7/weather/24h', { location, lang: 'zh' })
  if (payload?.code !== '200' || !Array.isArray(payload.hourly)) {
    throw new Error(`和风天气 24h 失败: ${payload?.code || 'unknown'}`)
  }
  return payload.hourly
}

async function fetchUvIndex() {
  const location = getQWeatherLocation()
  const payload = await qweatherGet('/v7/indices/1d', { location, type: 5, lang: 'zh' })
  if (payload?.code !== '200' || !Array.isArray(payload.daily)) return ''
  return payload.daily[0]?.category || payload.daily[0]?.level || ''
}

function formatHour(fxTime) {
  if (!fxTime) return ''
  const date = new Date(fxTime)
  if (!Number.isNaN(date.getTime())) {
    return `${String(date.getHours()).padStart(2, '0')}:00`
  }
  return String(fxTime).slice(11, 16)
}

function formatDay(fxDate, index) {
  if (index === 0) return '今天'
  if (index === 1) return '明天'
  const date = new Date(`${fxDate}T00:00:00`)
  if (Number.isNaN(date.getTime())) return fxDate || ''
  return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()]
}

function normalizeNow(now) {
  return {
    icon: weatherIconEmoji(now.icon, now.text),
    text: now.text || '',
    temp: now.temp || '',
    feelsLike: now.feelsLike || '',
    windDir: now.windDir || '',
    windScale: now.windScale || '',
    windSpeed: now.windSpeed || '',
    humidity: now.humidity || '',
    precip: now.precip || '0.0',
    pressure: now.pressure || '',
    vis: now.vis || '',
  }
}

function normalizeDailyItem(item, index, uvIndex = '') {
  return {
    date: formatDay(item.fxDate, index),
    fxDate: item.fxDate || '',
    icon: weatherIconEmoji(item.iconDay, item.textDay),
    textDay: item.textDay || '',
    textNight: item.textNight || '',
    tempMax: item.tempMax || '',
    tempMin: item.tempMin || '',
    precip: item.precip || '0.0',
    humidity: item.humidity || '',
    windDir: item.windDirDay || item.windDirNight || '',
    windScale: item.windScaleDay || item.windScaleNight || '',
    sunrise: item.sunrise || '',
    sunset: item.sunset || '',
    uvIndex: index === 0 ? uvIndex : '',
  }
}

function normalizeHourlyItem(item) {
  return {
    time: formatHour(item.fxTime),
    icon: weatherIconEmoji(item.icon, item.text),
    text: item.text || '',
    temp: item.temp || '',
    windDir: item.windDir || '',
    windScale: item.windScale || '',
    humidity: item.humidity || '',
    precip: item.precip || '0.0',
    pop: item.pop || '',
  }
}

export async function fetchHomeWeatherFromQWeather() {
  if (Date.now() - cache.at < CACHE_TTL_MS && cache.data) {
    return cache.data
  }

  if (!getApiKey()) {
    return { ...MOCK_HOME_WEATHER }
  }

  try {
    const [now, airQuality] = await Promise.all([fetchNowWeather(), fetchAirQualityLabel()])
    const data = {
      icon: weatherIconEmoji(now.icon, now.text),
      temperature: `${now.temp}°C`,
      airQuality,
      source: 'qweather',
      condition: now.text,
      obsTime: now.obsTime,
    }
    cache = { at: Date.now(), data }
    return data
  } catch (error) {
    console.warn('[qweather] 首页天气拉取失败，使用 mock:', error?.message || error)
    return { ...MOCK_HOME_WEATHER }
  }
}

export async function fetchWeatherDetailFromQWeather() {
  if (Date.now() - detailCache.at < CACHE_TTL_MS && detailCache.data) {
    return detailCache.data
  }

  if (!getApiKey()) {
    return { ...MOCK_WEATHER_DETAIL, placeName: getPlaceName() }
  }

  try {
    const [nowResult, dailyResult, hourlyResult, airResult, uvResult] = await Promise.allSettled([
      fetchNowWeather(),
      fetchDailyWeather(),
      fetchHourlyWeather(),
      fetchAirQualityLabel(),
      fetchUvIndex(),
    ])

    const now = nowResult.status === 'fulfilled' ? nowResult.value : null
    const daily = dailyResult.status === 'fulfilled' ? dailyResult.value : []
    const hourly = hourlyResult.status === 'fulfilled' ? hourlyResult.value : []
    const airQuality = airResult.status === 'fulfilled' ? airResult.value : MOCK_HOME_WEATHER.airQuality
    const uvIndex = uvResult.status === 'fulfilled' ? uvResult.value : ''

    if (!now && daily.length === 0 && hourly.length === 0) {
      throw new Error('和风天气详情为空')
    }

    const normalizedDaily = daily.map((item, index) => normalizeDailyItem(item, index, uvIndex))
    const data = {
      source: 'qweather',
      placeName: getPlaceName(),
      updatedAt: now?.obsTime || new Date().toISOString(),
      now: now ? normalizeNow(now) : MOCK_WEATHER_DETAIL.now,
      today: normalizedDaily[0] || MOCK_WEATHER_DETAIL.today,
      airQuality,
      hourly: hourly.slice(0, 24).map(normalizeHourlyItem),
      daily: normalizedDaily.slice(0, 7),
    }

    detailCache = { at: Date.now(), data }
    return data
  } catch (error) {
    console.warn('[qweather] 天气详情拉取失败，使用 mock:', error?.message || error)
    return { ...MOCK_WEATHER_DETAIL, placeName: getPlaceName() }
  }
}
