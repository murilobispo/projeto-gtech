import { describe, expect, it } from 'vitest'
import { logger } from '@/lib/logger'

describe('logger', () => {
  it('expõe um logger pino com nível info', () => {
    expect(logger.level).toBe('info')
    expect(logger.info).toBeTypeOf('function')
    expect(logger.error).toBeTypeOf('function')
  })
})
