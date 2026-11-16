import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { Router } from 'express'
import swaggerUi from 'swagger-ui-express'
import { parse } from 'yaml'

const caminhoSpec = fileURLToPath(
  new URL('../../docs/openapi.yaml', import.meta.url),
)
const spec = parse(readFileSync(caminhoSpec, 'utf-8'))

export const docsRouter = Router()

docsRouter.use('/docs', swaggerUi.serve, swaggerUi.setup(spec))
