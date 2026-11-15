import { afterEach, describe, expect, it } from 'vitest'
import { requiredEnv } from './env'

const envName = 'TEST_PORT'
const originalValue = process.env[envName]

afterEach(() => {
  if (originalValue === undefined) {
    delete process.env[envName]
  } else {
    process.env[envName] = originalValue
  }
})

describe('requiredEnv', () => {
  it('deve retornar o valor quando a variável existir', () => {
    process.env[envName] = '3000'

    expect(requiredEnv(envName)).toBe('3000')
  })

  it('deve lançar erro quando a variável não estiver definida', () => {
    delete process.env[envName]

    expect(() => requiredEnv(envName)).toThrow()
  })

  it('deve lançar erro quando a variável estiver vazia', () => {
    process.env[envName] = ''

    expect(() => requiredEnv(envName)).toThrow()
  })
})
