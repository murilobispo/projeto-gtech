import { Router } from 'express'
import { validate } from '@/middlewares/validate'
import { createLinkSchema } from '@/models/link'
import { createLink, resolveLink } from '@/services/link.service'
import { AppError } from '@/utils/AppError'

export const linksRouter = Router()

linksRouter.post('/links', validate(createLinkSchema), async (req, res) => {
  const novoLink = await createLink(req.body)
  res.status(201).json(novoLink)
})

linksRouter.get('/l/:code', async (req, res) => {
  const link = await resolveLink(req.params.code)

  if (!link) {
    throw new AppError('Link não encontrado', 404)
  }

  res.redirect(302, link.url)
})
