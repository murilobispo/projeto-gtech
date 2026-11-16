import { requiredEnv } from '@/config/env'
import { prisma } from '@/lib/prisma'
import type { CreateLinkInput } from '@/models/link'
import { generateCode } from '@/services/code-generator'

const MAX_TENTATIVAS = 3

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

      const baseUrl = `http://localhost:${requiredEnv('PORT')}`

      return {
        code: link.code,
        shortUrl: `${baseUrl}/l/${link.code}`,
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
  const link = await prisma.link.findUnique({
    where: { code },
  })

  if (!link) {
    return null
  }

  const expirado = link.expiresAt && link.expiresAt.getTime() < Date.now()

  if (expirado) {
    return null
  }

  await prisma.link.update({
    where: { code },
    data: { clicks: { increment: 1 } },
  })

  return { url: link.url }
}
