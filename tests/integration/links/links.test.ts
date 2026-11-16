import request from 'supertest'
import { describe, expect, it } from 'vitest'
import app from '@/app'
import { prisma } from '@/lib/prisma'
import { generateCode } from '@/services/code-generator'

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

describe('GET /l/:code', () => {
  it('redireciona 302 para a url original de link com expiracao futura', async () => {
    const futuro = new Date(Date.now() + 86_400_000).toISOString()
    const criado = await request(app)
      .post('/links')
      .send({ url: 'https://example.com/pagina', expiresAt: futuro })

    const res = await request(app).get(`/l/${criado.body.code}`)

    expect(res.status).toBe(302)
    expect(res.headers.location).toBe('https://example.com/pagina')
  })

  it('conta um clique a cada redirect', async () => {
    const criado = await request(app)
      .post('/links')
      .send({ url: 'https://example.com' })

    await request(app).get(`/l/${criado.body.code}`)
    await request(app).get(`/l/${criado.body.code}`)

    const linha = await prisma.link.findUnique({
      where: { code: criado.body.code },
    })
    expect(linha?.clicks).toBe(2)
  })

  it('responde 404 para code inexistente', async () => {
    const res = await request(app).get('/l/naoexis')

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ message: 'Link não encontrado' })
  })

  it('responde 404 para link expirado (semeado direto no banco)', async () => {
    const code = generateCode()
    await prisma.link.create({
      data: {
        code,
        url: 'https://example.com',
        expiresAt: new Date(Date.now() - 86_400_000),
      },
    })

    const res = await request(app).get(`/l/${code}`)

    expect(res.status).toBe(404)
  })

  it('nao conta clique de link expirado', async () => {
    const code = generateCode()
    await prisma.link.create({
      data: {
        code,
        url: 'https://example.com',
        expiresAt: new Date(Date.now() - 86_400_000),
      },
    })

    await request(app).get(`/l/${code}`)

    const linha = await prisma.link.findUnique({ where: { code } })
    expect(linha?.clicks).toBe(0)
  })
})

describe('GET /links/:code', () => {
  it('devolve os metadados do link com os cliques', async () => {
    const criado = await request(app)
      .post('/links')
      .send({ url: 'https://example.com' })
    await request(app).get(`/l/${criado.body.code}`)

    const res = await request(app).get(`/links/${criado.body.code}`)

    expect(res.status).toBe(200)
    expect(res.body.code).toBe(criado.body.code)
    expect(res.body.url).toBe('https://example.com')
    expect(res.body.shortUrl).toBe(
      `http://localhost:${process.env.PORT}/l/${criado.body.code}`,
    )
    expect(res.body.clicks).toBe(1)
    expect(res.body.expiresAt).toBeNull()
    expect(res.body.createdAt).toBeDefined()
  })

  it('consultar stats nao incrementa cliques', async () => {
    const criado = await request(app)
      .post('/links')
      .send({ url: 'https://example.com' })

    await request(app).get(`/links/${criado.body.code}`)
    await request(app).get(`/links/${criado.body.code}`)

    const linha = await prisma.link.findUnique({
      where: { code: criado.body.code },
    })
    expect(linha?.clicks).toBe(0)
  })

  it('responde 404 para code inexistente', async () => {
    const res = await request(app).get('/links/naoexis')

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ message: 'Link não encontrado' })
  })

  it('responde 404 para link expirado (semeado direto no banco)', async () => {
    const code = generateCode()
    await prisma.link.create({
      data: {
        code,
        url: 'https://example.com',
        expiresAt: new Date(Date.now() - 86_400_000),
      },
    })

    const res = await request(app).get(`/links/${code}`)

    expect(res.status).toBe(404)
  })
})
