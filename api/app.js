import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { tourRouter } from './tour/index.js'
import { agentRouter } from './agent/index.js'

const app = express()

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  }),
)
app.use(express.json())

app.use('/api/tour', tourRouter)
app.use('/api/agent', agentRouter)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

export default app
