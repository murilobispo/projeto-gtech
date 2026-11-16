import { Router } from 'express'
import { validate } from '@/middlewares/validate'
import { createLinkSchema } from '@/models/link'
import { createLink } from '@/services/link.service'

export const linksRouter = Router()

linksRouter.post('/links', validate(createLinkSchema), async (req, res) => {
  const novoLink = await createLink(req.body)
  res.status(201).json(novoLink)
})
