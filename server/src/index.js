import cors from 'cors'
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import authRouter from './routes/auth.js'
import userRouter from './routes/user.js'
import uploadRouter from './routes/upload.js'
import serviceRouter from './routes/service.js'
import aiServiceRouter from './routes/aiService.js'
import adminRouter from './routes/admin.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.PORT) || 3000

const app = express()

app.use(cors())
app.use(express.json({ limit: '2mb' }))
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'traveluniapp-server' })
})

app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.use('/api/upload', uploadRouter)
app.use('/api', serviceRouter)
app.use('/api/ai-service', aiServiceRouter)
app.use('/api/admin', adminRouter)

app.use((_req, res) => {
  res.status(404).json({ code: 404, message: '接口不存在', data: null })
})

app.listen(PORT, () => {
  console.log(`[traveluniapp-server] http://localhost:${PORT}`)
  console.log('  服务层: reviews, feedback, questionnaires, support/tickets, faqs, service/config')
  console.log('  上传: POST /api/upload/image')
  console.log('  管理端: GET/PUT /api/admin/feedback, /api/admin/support/tickets')
})
