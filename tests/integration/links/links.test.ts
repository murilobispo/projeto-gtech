import request from 'supertest'
import { describe, expect, it } from 'vitest'
import app from '@/app'

describe('POST /links', () => {
  it('cria um link de verdade com code, shortUrl e url', async () => {
    const res = await request(app)
      .post('/links')
      .send({ url: 'https://example.com' })

    expect(res.status).toBe(201)
    expect(res.body.code).toMatch(/^[A-Za-z0-9]{7}$/)
    expect(res.body.shortUrl).toBe(
      `http://localhost:${process.env.PORT}/l/${res.body.code}`,
    )
    expect(res.body.url).toBe('https://example.com')
    expect(res.body.expiresAt).toBeNull()
  })

  it('cria link com expiresAt e devolve a data persistida', async () => {
    const futuro = new Date(Date.now() + 86_400_000)
    const res = await request(app)
      .post('/links')
      .send({ url: 'https://example.com', expiresAt: futuro.toISOString() })

    expect(res.status).toBe(201)
    expect(res.body.expiresAt).toBe(futuro.toISOString())
  })

  it('responde 422 com fieldErrors para url invalida', async () => {
    const res = await request(app).post('/links').send({ url: 'nao-e-url' })

    expect(res.status).toBe(422)
    expect(res.body.fieldErrors).toHaveProperty('url')
  })

  it('responde 422 para expiresAt no passado', async () => {
    const passado = new Date(Date.now() - 86_400_000).toISOString()
    const res = await request(app)
      .post('/links')
      .send({ url: 'https://example.com', expiresAt: passado })

    expect(res.status).toBe(422)
    expect(res.body.fieldErrors).toHaveProperty('expiresAt')
  })

  it('responde 422 para corpo vazio', async () => {
    const res = await request(app).post('/links').send({})

    expect(res.status).toBe(422)
  })

  it('responde 400 para JSON malformado', async () => {
    const res = await request(app)
      .post('/links')
      .set('Content-Type', 'application/json')
      .send('{invalido')

    expect(res.status).toBe(400)
  })
})
