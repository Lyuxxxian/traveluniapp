/**
 * 和风天气：首页实时天气 + 空气质量（Key 仅放 server/.env，勿提交 Git）
 * 文档：https://dev.qweather.com/docs/api/weather/weather-now/
 */

const DEFAULT_HOST = 'devapi.qweather.com'
const CACHE_TTL_MS = 10 * 60 * 1000

let cache = { at: 0, data: null }

const MOCK_HOME_WEATHER = {
  icon: '☀',
  temperature: '26°C',
  airQuality: '良',
  source: 'mock',
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
