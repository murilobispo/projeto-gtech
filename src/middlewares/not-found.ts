import type { RequestHandler } from 'express'

export const notFoundMiddleware: RequestHandler = (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.originalUrl,
    method: req.method,
  })
}
