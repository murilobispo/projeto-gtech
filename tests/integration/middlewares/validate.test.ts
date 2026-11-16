import express from 'express'
import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { validate } from '@/middlewares/validate'

const schema = z
  .object({
    name: z.string().min(1),
  })
  .strict()

const app = express()

app.use(express.json())
app.post('/eco', validate(schema), (req, res) => {
  res.status(200).json(req.body)
})

describe('validate', () => {
  it('deixa passar corpo valido e repassa o dado parseado', async () => {
    const res = await request(app).post('/eco').send({ name: 'gtech' })

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ name: 'gtech' })
  })

  it('responde 422 com fieldErrors quando o corpo e invalido', async () => {
    const res = await request(app).post('/eco').send({ name: '' })

    expect(res.status).toBe(422)
    expect(res.body.fieldErrors).toHaveProperty('name')
  })

  it('responde 422 para corpo vazio', async () => {
    const res = await request(app).post('/eco').send({})

    expect(res.status).toBe(422)
  })

  it('rejeita campo desconhecido com 422', async () => {
    const res = await request(app)
      .post('/eco')
      .send({ name: 'gtech', extra: 'x' })

    expect(res.status).toBe(422)
    expect(res.body.fieldErrors).toBeDefined()
  })
})
