import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { tourRouter } from './api/tour/index.js'
import { directionsRouter } from './api/directions/index.js'
import { agentRouter } from './api/agent/index.js'

const app = express()
const PORT = process.env.API_PORT || 3001

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }))
app.use(express.json())

app.use('/api/tour', tourRouter)
app.use('/api/directions', directionsRouter)
app.use('/api/agent', agentRouter)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`API 서버 실행 중: http://localhost:${PORT}`)
})
