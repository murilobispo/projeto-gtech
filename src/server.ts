import app from '@/app'
import { requiredEnv } from '@/config/env'
import { logger } from '@/lib/logger'

const port = Number(requiredEnv('PORT'))

app.listen(port, () => {
  logger.info({ port }, 'api no ar — teste: curl /health')
})
