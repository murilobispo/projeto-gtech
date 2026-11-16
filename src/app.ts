import express from 'express'
import helmet from 'helmet'
import { docsRouter } from '@/controllers/docs.controller'
import { healthRouter } from '@/controllers/health.controller'
import { linksRouter } from '@/controllers/links.controller'
import { errorHandler } from '@/middlewares/errorHandler'
import { notFoundMiddleware } from '@/middlewares/not-found'

const app = express()

app.disable('x-powered-by')
// CSP desligada: o Swagger UI (/docs) usa scripts inline; a API nao serve HTML proprio
app.use(helmet({ contentSecurityPolicy: false }))
app.use(express.json())
app.use(healthRouter)
app.use(linksRouter)
app.use(docsRouter)
app.use(notFoundMiddleware)

app.use(errorHandler)

export default app
