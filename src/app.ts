import express from 'express'
import { healthRouter } from '@/controllers/health.controller'

const app = express()

app.disable('x-powered-by')
app.use(express.json())
app.use(healthRouter)

export default app
