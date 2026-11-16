import express from 'express'
import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { notFoundMiddleware } from '@/middlewares/not-found'

describe('notFoundMiddleware', () => {
  const app = express()

  app.use(notFoundMiddleware)

  it('retorna 404 quando a rota nao existe', async () => {
    const response = await request(app).get('/invalid-route')

    expect(response.status).toBe(404)
    expect(response.body).toEqual({
      error: 'Rota não encontrada',
      path: '/invalid-route',
      method: 'GET',
    })
  })
})
