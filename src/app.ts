import express from 'express'
import { healthRouter } from '@/controllers/health.controller'
import { errorHandler } from '@/middlewares/errorHandler'
import { notFoundMiddleware } from '@/middlewares/not-found'

const app = express()

app.disable('x-powered-by')
app.use(express.json())
app.use(healthRouter)
app.use(notFoundMiddleware)

app.use(errorHandler)

export default app
