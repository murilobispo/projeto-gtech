import request from 'supertest'
import { describe, expect, it } from 'vitest'
import app from '@/app'

describe('GET /metrics', () => {
  it('expõe as métricas no formato Prometheus', async () => {
    await request(app).get('/health')

    const res = await request(app).get('/metrics')

    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toContain('text/plain')
    expect(res.text).toContain('http_request_duration_seconds_bucket')
    expect(res.text).toContain('nodejs_')
  })

  it('conta as requisições por rota, método e status', async () => {
    await request(app).get('/health')
    const criado = await request(app)
      .post('/links')
      .send({ url: 'https://example.com' })
    await request(app).get(`/l/${criado.body.code}`)
    await request(app).get('/rota-que-nao-existe')

    const res = await request(app).get('/metrics')

    expect(res.text).toContain('route="/health"')
    expect(res.text).toContain('route="/links"')
    expect(res.text).toContain('route="/l/:code"')
    expect(res.text).toContain('code="302"')
    expect(res.text).toContain('route="sem-rota"')
  })
})
