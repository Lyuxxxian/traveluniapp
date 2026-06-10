import cors from 'cors'
import express from 'express'
import { loadEnvFile } from './lib/loadEnv.js'

loadEnvFile()
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import authRouter from './routes/auth.js'
import userRouter from './routes/user.js'
import ordersRouter from './routes/orders.js'
import uploadRouter from './routes/upload.js'
import serviceRouter from './routes/service.js'
import aiServiceRouter from './routes/aiService.js'
import adminAuthRouter from './routes/adminAuth.js'
import adminMainRouter from './routes/adminMain.js'
import homeRouter from './routes/home.js'
import discoverRouter from './routes/discover.js'
import mapRouter from './routes/map.js'
import mallRouter from './routes/mall.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.PORT) || 3000
const IS_PRODUCTION = process.env.NODE_ENV === 'production'

if (IS_PRODUCTION && process.env.ADMIN_AUTH_DISABLED === 'true') {
  console.error('[traveluniapp-server] 生产环境禁止 ADMIN_AUTH_DISABLED=true')
  process.exit(1)
}

if (IS_PRODUCTION && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'traveluniapp-dev-secret')) {
  console.warn('[traveluniapp-server] 警告：生产环境请设置强随机 JWT_SECRET')
}

const app = express()

app.use(cors())
app.use(express.json({ limit: '2mb' }))
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'traveluniapp-server' })
})

app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.use('/api', ordersRouter)
app.use('/api/upload', uploadRouter)
app.use('/api', serviceRouter)
app.use('/api/ai-service', aiServiceRouter)
app.use('/api/home', homeRouter)
app.use('/api/discover', discoverRouter)
app.use('/api/map', mapRouter)
app.use('/api/mall', mallRouter)
app.use('/api/admin/auth', adminAuthRouter)
app.use('/api/admin', adminMainRouter)

app.use((_req, res) => {
  res.status(404).json({ code: 404, message: '接口不存在', data: null })
})

app.listen(PORT, () => {
  console.log(`[traveluniapp-server] http://localhost:${PORT}`)
  console.log('  服务层: reviews, feedback, questionnaires, support/tickets, faqs, service/config')
  console.log('  上传: POST /api/upload/image')
  console.log('  公开: GET /api/home/config, GET /api/home/weather, GET /api/discover/posts, GET /api/map/*, GET /api/mall/products')
  console.log('  管理端: POST /api/admin/auth/login + /api/admin/*（需 Bearer admin token）')
})
