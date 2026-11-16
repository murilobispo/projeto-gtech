import type { NextFunction, Request, Response } from 'express'
import { AppError } from '@/utils/AppError'

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message })
  }

  console.error(err)

  const status = (err as { status?: number }).status ?? 500
  const message = status >= 500 ? 'Internal server error' : err.message

  return res.status(status).json({ message })
}
