import type { NextFunction, Request, Response } from 'express'
import { httpRequestDuration } from '@/lib/metrics'

export function metricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const fimDoTimer = httpRequestDuration.startTimer()

  res.on('finish', () => {
    // guarda o PADRAO da rota (/l/:code), nunca a url crua — evita explosao de labels
    const rota = (req.route?.path as string) ?? 'sem-rota'

    fimDoTimer({
      route: rota,
      method: req.method,
      code: String(res.statusCode),
    })
  })

  next()
}
