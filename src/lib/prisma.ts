import { PrismaPg } from '@prisma/adapter-pg'
import { requiredEnv } from '@/config/env'
import { PrismaClient } from '../../generated/prisma/client'

/* v8 ignore start: boot infra — uma instancia por processo (padrao do docs do prisma),
   cache no globalThis para sobreviver ao reload do tsx watch; validada pelos testes de integracao */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: requiredEnv('DATABASE_URL') }),
  })

globalForPrisma.prisma = prisma
/* v8 ignore end */
