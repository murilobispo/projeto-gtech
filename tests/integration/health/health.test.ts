import request from 'supertest'
import { describe, expect, it } from 'vitest'
import app from '@/app'

describe('GET /health', () => {
  it('responde 200 com status ok', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
  })

  it('retorna Content-Type application/json', async () => {
    const res = await request(app).get('/health')
    expect(res.headers['content-type']).toContain('application/json')
  })

  it('nao expoe o header X-Powered-By', async () => {
    const res = await request(app).get('/health')
    expect(res.headers).not.toHaveProperty('x-powered-by')
  })
})
