import { Router } from 'express'
import { validate } from '@/middlewares/validate'
import { createLinkSchema } from '@/models/link'
import { createLink, getLinkStats, resolveLink } from '@/services/link.service'
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

linksRouter.get('/links/:code', async (req, res) => {
  const stats = await getLinkStats(req.params.code)

  if (!stats) {
    throw new AppError('Link não encontrado', 404)
  }

  res.status(200).json(stats)
})
