import { describe, expect, it } from 'vitest'
import { generateCode } from '@/services/code-generator'

describe('generateCode', () => {
  it('gera code com 7 caracteres', () => {
    expect(generateCode()).toHaveLength(7)
  })

  it('usa apenas letras e numeros (base62)', () => {
    expect(generateCode()).toMatch(/^[A-Za-z0-9]{7}$/)
  })

  it('gera codes diferentes em chamadas seguidas', () => {
    const codes = new Set(Array.from({ length: 100 }, () => generateCode()))

    expect(codes.size).toBe(100)
  })
})
