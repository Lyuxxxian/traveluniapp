import { Router } from 'express'
import { loadStore } from '../lib/store.js'
import { fetchHomeWeatherFromQWeather } from '../lib/qweather.js'
import { ok } from '../lib/response.js'

const router = Router()

router.get('/config', (_req, res) => {
  const store = loadStore()
  return ok(res, store.homeConfig || {})
})

router.get('/weather', async (_req, res) => {
  const data = await fetchHomeWeatherFromQWeather()
  const { icon, temperature, airQuality } = data
  return ok(res, { icon, temperature, airQuality })
})

export default router
