import { describe, expect, it } from 'vitest'
import { createLinkSchema } from '@/models/link'

describe('createLinkSchema', () => {
  it('aceita url https valida sem expiresAt', () => {
    const parsed = createLinkSchema.safeParse({ url: 'https://example.com' })

    expect(parsed.success).toBe(true)
  })

  it('rejeita url sem protocolo', () => {
    const parsed = createLinkSchema.safeParse({ url: 'example.com' })

    expect(parsed.success).toBe(false)
  })

  it('rejeita protocolo que nao seja http/https', () => {
    const parsed = createLinkSchema.safeParse({ url: 'ftp://example.com' })

    expect(parsed.success).toBe(false)
  })

  it('rejeita campo desconhecido', () => {
    const parsed = createLinkSchema.safeParse({
      url: 'https://example.com',
      surpresa: 'x',
    })

    expect(parsed.success).toBe(false)
  })

  it('aceita expiresAt no futuro e entrega Date pronto', () => {
    const futuro = new Date(Date.now() + 86_400_000).toISOString()
    const parsed = createLinkSchema.safeParse({
      url: 'https://example.com',
      expiresAt: futuro,
    })

    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.expiresAt).toBeInstanceOf(Date)
    }
  })

  it('rejeita expiresAt no passado', () => {
    const passado = new Date(Date.now() - 86_400_000).toISOString()
    const parsed = createLinkSchema.safeParse({
      url: 'https://example.com',
      expiresAt: passado,
    })

    expect(parsed.success).toBe(false)
  })

  it('rejeita corpo vazio', () => {
    const parsed = createLinkSchema.safeParse({})

    expect(parsed.success).toBe(false)
  })
})
