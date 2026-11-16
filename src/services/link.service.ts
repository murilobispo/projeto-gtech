import { requiredEnv } from '@/config/env'
import { prisma } from '@/lib/prisma'
import type { CreateLinkInput } from '@/models/link'
import { generateCode } from '@/services/code-generator'

const MAX_TENTATIVAS = 3
const BASE_URL = `http://localhost:${requiredEnv('PORT')}`

async function buscarLinkValido(code: string) {
  const link = await prisma.link.findUnique({ where: { code } })

  if (!link) {
    return null
  }

  const expirado = link.expiresAt && link.expiresAt.getTime() < Date.now()

  return expirado ? null : link
}

export async function createLink(input: CreateLinkInput) {
  for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
    const code = generateCode()

    try {
      const link = await prisma.link.create({
        data: {
          code,
          url: input.url,
          expiresAt: input.expiresAt,
        },
      })

      return {
        code: link.code,
        shortUrl: `${BASE_URL}/l/${link.code}`,
        url: link.url,
        expiresAt: link.expiresAt,
      }
    } catch (erro) {
      /* v8 ignore start: colisao de code e evento loterico (62^7); retry deliberadamente fora da cobertura */
      const ehColisao = (erro as { code?: string }).code === 'P2002'

      if (!ehColisao || tentativa === MAX_TENTATIVAS) {
        throw erro
      }
      /* v8 ignore end */
    }
  }
}

export async function resolveLink(code: string) {
  const link = await buscarLinkValido(code)

  if (!link) {
    return null
  }

  await prisma.link.update({
    where: { code },
    data: { clicks: { increment: 1 } },
  })

  return { url: link.url }
}

export async function getLinkStats(code: string) {
  const link = await buscarLinkValido(code)

  if (!link) {
    return null
  }

  return {
    code: link.code,
    shortUrl: `${BASE_URL}/l/${link.code}`,
    url: link.url,
    clicks: link.clicks,
    createdAt: link.createdAt,
    expiresAt: link.expiresAt,
  }
}
