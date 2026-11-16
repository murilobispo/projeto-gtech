import express from 'express'
import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { errorHandler } from '@/middlewares/errorHandler'
import { AppError } from '@/utils/AppError'

const app = express()

app.get('/boom', () => {
  throw new AppError('URL inválida', 422)
})
app.get('/crash', () => {
  throw new Error('segredo interno')
})
app.use(errorHandler)

describe('errorHandler', () => {
  it('AppError responde com o statusCode e a mensagem dele', async () => {
    const res = await request(app).get('/boom')

    expect(res.status).toBe(422)
    expect(res.body).toEqual({ message: 'URL inválida' })
  })

  it('erro desconhecido vira 500 generico sem vazar detalhe', async () => {
    const res = await request(app).get('/crash')

    expect(res.status).toBe(500)
    expect(res.body).toEqual({ message: 'Internal server error' })
  })
})
