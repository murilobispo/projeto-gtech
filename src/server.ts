import app from '@/app'
import { requiredEnv } from '@/config/env'

const port = Number(requiredEnv('PORT'))

app.listen(port, () => {
  console.log(`[gtech] API no ar — teste: curl http://localhost:${port}/health`)
})
