import type { RequestHandler } from 'express'
import { type ZodType, z } from 'zod'

export function validate(schema: ZodType): RequestHandler {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.body)

    if (!parsed.success) {
      return res.status(422).json(z.flattenError(parsed.error))
    }

    req.body = parsed.data
    next()
  }
}
