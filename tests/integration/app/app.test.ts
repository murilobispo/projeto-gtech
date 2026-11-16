import request from 'supertest'
import { describe, expect, it } from 'vitest'
import app from '@/app'

describe('app', () => {
  it('responde 404 JSON para rota inexistente', async () => {
    const res = await request(app).get('/rota-que-nao-existe')

    expect(res.status).toBe(404)
    expect(res.body).toEqual({
      error: 'Rota não encontrada',
      path: '/rota-que-nao-existe',
      method: 'GET',
    })
  })

  it('responde com headers de seguranca do helmet', async () => {
    const res = await request(app).get('/health')

    expect(res.headers['x-content-type-options']).toBe('nosniff')
  })

  it('serve o swagger ui em /docs', async () => {
    const res = await request(app).get('/docs/')

    expect(res.status).toBe(200)
    expect(res.text).toContain('Swagger UI')
  })
})
